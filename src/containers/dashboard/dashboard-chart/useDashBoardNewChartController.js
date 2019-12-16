import React, {useCallback, useContext, useReducer} from 'react';
import * as d3 from "d3";
import {
    addMinutes,
    addSeconds,
    differenceInSeconds, eachDayOfInterval, format,
    isAfter,
    isBefore,
    isDate,
    subDays,
    subHours, subMinutes,
    subMonths,
    subSeconds
} from "date-fns";
import {CollectionDataContext} from "../../../components/collection/CollectionDataProvider";
import {useSnackbar} from "notistack";
import {useOverview} from "../Overview";
import chartWorker from "../../../workers/chart.worker";
import {catchError, map, mergeAll, mergeMap, mergeScan, switchMap, concatAll, debounceTime} from "rxjs/operators";
import {authService} from "../../../services/authService";
import {BehaviorSubject, forkJoin, from, fromEvent, Observable, of } from "rxjs";
import {AxiosSubscriber} from "../../../services/axiosInstance/AxiosSubscriber";
import {roundNumber} from "../../../helpers/CommonHelper";
import {siteService} from "../../../services/siteService";
import {chartEventService} from "../../../services/chartEventService";
import {sensorNames, sensorNamesByName} from "./ChartHeaders";
import CsvDownLoader from "../../../components/DataView/CsvDownLoader";
import {ceil, cloneDeep, debounce} from "lodash";
import queryString from 'query-string';

function reducer(currentState, newState) {
    return {...currentState, ...newState};
}

export const DateRanges = [
    {
        key: 'all',
        label: 'All',
        getDateRanges: function () {
            return {start: d3.timeMinute.floor(subHours(new Date(), 1)), end: d3.timeMinute.floor(new Date())};
        },
    },
    {
        key: 'hourly',
        label: 'Hourly',
        getDateRanges: function () {
            return {start: d3.timeMinute.floor(subHours(new Date(), 1)), end: d3.timeMinute.floor(new Date())};
        },
    },  {
        key: 'daily',
        label: 'Daily',
        getDateRanges: function () {
            return {start: d3.timeMinute.floor(subDays(new Date(), 1)), end: d3.timeMinute.ceil(new Date())};
        },
    },
];



export  function useDashBoardNewChartController({match, history}) {

    const [{value, idParam, isCsvImporting, daysMode, primarySensor, allResult, containerType, allDateValues, weekRanges, title, siteData, data, showScaleButton, combinedAvgData, isLoading, windSpeedData, minAllowedStartDate, selectedDateRange, axisMode, selectedCurve, deviceDataStore, globalHoveredValueDetails, resourceNotFound}, setState] = useReducer(reducer, {
        value: 0,
        data: [],
        title: '',
        siteData: undefined,
        combinedAvgData: [],
        windSpeedData: [],
        minAllowedStartDate: d3.timeMinute.floor(subMonths(new Date(), 4)),
        selectedDateRange: {start: d3.timeMinute.floor(subHours(new Date(), 12)), end: d3.timeMinute.floor(new Date())},
        axisMode: 'static',
        showScaleButton: false,
        weekRanges: [],
        isLoading: false,
        idParam: undefined,
        containerType: undefined,
        daysMode: 'all',
        allResult: [],
        isCsvImporting: false,
        selectedCurve: 'curveMonotoneX',
        primarySensor: 'tVOC1',
        deviceDataStore,
        allDateValues: [],
        globalHoveredValueDetails: {},
        resourceNotFound: false,
    });

    const {collections, refresh, signalRefresh} = useContext(CollectionDataContext);
    const subscriptionRef = React.useRef();
    const subscriptionExtraRef = React.useRef();
    const chartWorkerRef = React.useRef();
    const {enqueueSnackbar} = useSnackbar();
    const {deviceData, primarySensorName, fieldNames} = useOverview({match, containerType, history});

    React.useEffect(() => {
        subscriptionRef.current = [];
        subscriptionExtraRef.current = [];
        chartWorkerRef.current = new chartWorker();
        return () => {
            if (subscriptionExtraRef && subscriptionExtraRef.current) {
                subscriptionExtraRef.current.forEach((subscription) => {
                    if (subscription) {
                        subscription.unsubscribe();
                    }
                });
                subscriptionExtraRef.current = [];
            }

            if (subscriptionRef && subscriptionRef.current) {
                subscriptionRef.current.forEach((subscription) => {
                    if (subscription) {
                        subscription.unsubscribe();
                    }
                });
                subscriptionRef.current = [];
            }
            if(chartWorkerRef && chartWorkerRef.current){
                chartWorkerRef.current.terminate();
                chartWorkerRef.current = undefined;
            }
        }
    }, []);

    React.useEffect(() => {
        try {
            let axisModeDataStr = window.localStorage.getItem('axisMode');
            if (axisModeDataStr) {
                let val = JSON.parse(axisModeDataStr);
                if (val) {
                    setState({axisMode: val});
                }
            }
        } catch (err) {
            console.log(err);
        }
    }, []);


    React.useLayoutEffect(() => {
        try {
            let _selectedDateRange;
            let dateControlPressed = undefined;
            let daysModeStr = window.localStorage.getItem('daysMode');
            let selectedDateRangeStr = window.localStorage.getItem('selectedDateRange');
            if (selectedDateRangeStr) {
                _selectedDateRange = JSON.parse(selectedDateRangeStr);
                if (_selectedDateRange.start) {
                    _selectedDateRange.start = new Date(_selectedDateRange.start);
                }
                if (_selectedDateRange.end) {
                    _selectedDateRange.end = new Date(_selectedDateRange.end);
                }
                if (_selectedDateRange.dateControlPressed && _selectedDateRange.dateControlPressed === 'fast_forward_forward') {
                    let diffInSeconds = Math.abs(differenceInSeconds(_selectedDateRange.end, _selectedDateRange.start));
                    if (diffInSeconds > 0) {
                        let newEndDate = new Date();
                        let newStartDate = subSeconds(newEndDate, diffInSeconds);
                        if (isBefore(newStartDate, minAllowedStartDate)) {
                            newStartDate = cloneDeep(minAllowedStartDate);
                        }
                        if (isAfter(newEndDate, newStartDate)) {
                            _selectedDateRange.start = newStartDate;
                            _selectedDateRange.end = newEndDate;
                        }
                    }
                }

                if (isAfter(_selectedDateRange.start, _selectedDateRange.end)) {
                    _selectedDateRange = {
                        start: d3.timeMinute.floor(subHours(new Date(), 1)),
                        end: d3.timeMinute.ceil(new Date()),
                        dateControlPressed: dateControlPressed,
                    };
                }

                if (!_selectedDateRange.start || !_selectedDateRange.end) {
                    _selectedDateRange = {
                        start: d3.timeMinute.floor(subHours(new Date(), 1)),
                        end: d3.timeMinute.ceil(new Date()),
                        dateControlPressed: dateControlPressed,
                    };
                }
            } else {
                _selectedDateRange = {
                    start: d3.timeMinute.floor(subHours(new Date(), 12)),
                    end: d3.timeMinute.ceil(new Date()),
                    dateControlPressed: dateControlPressed,
                };
            }
            if (_selectedDateRange) {
                if (_selectedDateRange.start) {
                    if (isDate(_selectedDateRange.start)) {
                        _selectedDateRange.start.setMilliseconds(0);
                        _selectedDateRange.start.setSeconds(0);
                    }
                }
                if (_selectedDateRange.end) {
                    if (isDate(_selectedDateRange.end)) {
                        _selectedDateRange.end.setMilliseconds(0);
                        _selectedDateRange.end.setSeconds(0);
                    }
                }
            }
            if (daysModeStr) {
                let val = JSON.parse(daysModeStr);
                let isValidItem = DateRanges.find(item => item.key === val);
                if (isValidItem && val) {
                    setState({daysMode: val, selectedDateRange: _selectedDateRange});
                } else {
                    setState({daysMode: 'all', selectedDateRange: _selectedDateRange});
                }
            } else {
                setState({daysMode: 'all', selectedDateRange: _selectedDateRange});
            }
        } catch (err) {
            console.log(err);
        }
    }, []);


    React.useEffect(() => {
        if (match.params) {
            let _startTime, _endTime;
            let _selectedDateRange = {};
            if (match.params.id && match.params.topic) {
                if (history && history.location && history.location.search) {
                    try {
                        let queryParam = queryString.parse(history.location.search);
                        if (queryParam) {
                            if (queryParam.startTime) {
                                _startTime = new Date(queryParam.startTime);
                            }
                            if (queryParam.startTime) {
                                _endTime = new Date(queryParam.endTime);
                            }
                        }

                    } catch (err) {
                        console.log(err);
                    }
                }

                let _param = {
                    idParam: match.params.id ? parseInt(match.params.id) : null,
                    containerType: match.params.topic,
                    isLoading: false,
                };

                if (isDate(_startTime)) {
                    _selectedDateRange.start = _startTime;
                }
                if (isDate(_endTime)) {
                    _selectedDateRange.end = _endTime;
                }
                if (_selectedDateRange.start && !_selectedDateRange.end) {
                    _selectedDateRange.end = new Date();
                }

                if (_selectedDateRange && _selectedDateRange.start && _selectedDateRange.end) {
                    if (isBefore(_selectedDateRange.start, _selectedDateRange.end)) {
                        _param.selectedDateRange = _selectedDateRange;
                    } else {
                        enqueueSnackbar('Invalid date range', {variant: 'error'});
                    }
                }
                setState(_param);
                return () => {
                    setState({
                        idParam: undefined,
                        containerType: undefined,
                        isLoading: false,
                    });
                    //dispatch({type: 'CLEAR'});
                };
            }
        }
    }, [match.params]);

    React.useLayoutEffect(() => {
        if (idParam && containerType) {
            if (subscriptionExtraRef && subscriptionExtraRef.current) {
                subscriptionExtraRef.current.forEach((subscription) => {
                    if (subscription) {
                        subscription.unsubscribe();
                    }
                });
                subscriptionExtraRef.current = [];
            }
            let subs = getFirstEventDate({
                id: idParam,
                containerType: containerType,
            }).pipe(catchError(err => {
                return [];
            })).subscribe((result) => {
                let TimeStamp = d3.timeMinute.floor(subMonths(new Date(), 4));
                if (result && result.data && result.data.TimeStamp) {
                    TimeStamp = new Date(result.data.TimeStamp);
                }
                let updateObj = {
                    minAllowedStartDate: TimeStamp,
                };
                if (selectedDateRange && selectedDateRange.start) {
                    if (isAfter(TimeStamp, selectedDateRange.start)) {
                        let diffInSeconds = Math.abs(differenceInSeconds(selectedDateRange.end, selectedDateRange.start));
                        updateObj.selectedDateRange = cloneDeep(selectedDateRange);
                        updateObj.selectedDateRange.start = cloneDeep(TimeStamp);
                        if (diffInSeconds > 0) {
                            updateObj.selectedDateRange.end = addSeconds(updateObj.selectedDateRange.start, diffInSeconds);
                            if (isAfter(updateObj.selectedDateRange.end, new Date())) {
                                updateObj.selectedDateRange.end = new Date();
                            }
                        }
                    }
                }
                setState(updateObj);
            });


            let deviceTypeListSub = fetchAvailableDeviceTypes().pipe(catchError(err => {
                return {};
            })).subscribe((result) => {
                if (result && result.data) {
                    let _deviceTypeMap = {};
                    result.data.map((item) => {
                        if (item && item.type) {
                            _deviceTypeMap[item.type] = true;
                        }
                    });
                    if (_deviceTypeMap['Canary-S'] === true) {
                        setState({
                            primarySensor: 'TVOC_PID'
                        });
                    } else {
                        setState({
                            primarySensor: 'tVOC1'
                        });
                    }
                } else {
                    setState({
                        primarySensor: 'tVOC1'
                    });
                }
            });
            subscriptionExtraRef.current.push(subs);
            subscriptionExtraRef.current.push(deviceTypeListSub);
            //subscriptionRef.current.push(subs);
        } else {
            if (subscriptionExtraRef && subscriptionExtraRef.current) {
                subscriptionExtraRef.current.forEach((subscription) => {
                    if (subscription) {
                        subscription.unsubscribe();
                    }
                });
                subscriptionExtraRef.current = [];
            }
        }
    }, [idParam, containerType]);


    React.useLayoutEffect(() => {
        if (daysMode) {
            try {
                window.localStorage.setItem('daysMode', JSON.stringify(daysMode));
            } catch (err) {
                console.log(err);
            }
        }
    }, [daysMode]);

    React.useEffect(() => {
        if (selectedDateRange && selectedDateRange.start && selectedDateRange.end) {
            try {
                let params = {...selectedDateRange};
                window.localStorage.setItem('selectedDateRange', JSON.stringify(params));
            } catch (err) {
                console.log(err);
            }
        }
    }, [selectedDateRange]);


    React.useEffect(() => {
        setState({
            deviceDataStore: deviceData,
        });
    }, [deviceData]);


    React.useLayoutEffect(() => {
        if (idParam && selectedDateRange && selectedDateRange.start && selectedDateRange.end) {
            if (subscriptionRef && subscriptionRef.current) {
                subscriptionRef.current.forEach((subscription) => {
                    if (subscription) {
                        subscription.unsubscribe();
                    }
                });
                subscriptionRef.current = [];
            }
            setState({
                data: undefined,
                combinedAvgData: undefined,
                windSpeedData: undefined,
                showScaleButton: false,
                isLoading: true,
            });
            let _sub = of(true).pipe(debounceTime(100)).subscribe(()=>{
                handleDataUpdate();
            });
            subscriptionRef.current.push(_sub);
           // debounce(handleDataUpdate, 50)();
        }

    }, [idParam, containerType, daysMode, selectedDateRange]);


    function handleDataUpdate() {
        setContainerDetailHeader();
        let dayRanges = [];
        let daysBetween;
        let _daysMode = cloneDeep(daysMode);
        // let diffInDays = Math.abs(differenceInCalendarDays(selectedDateRange.end, selectedDateRange.start));
        if (['all', 'hourly', 'daily'].includes(_daysMode) === false) {
            _daysMode = 'all';
        }
        /* if (diffInDays < 1) {
             _daysMode = 'all';
         } else if (diffInDays < 8) {
             _daysMode = 'hourly';
         } else {
             _daysMode = 'daily';
         }*/
        //dayRanges.push({...selectedDateRange});
        let combinedResults = [];
        try {
            // daysBetween = d3.timeHours(selectedDateRange.start, selectedDateRange.end);
            daysBetween = eachDayOfInterval({
                end: selectedDateRange.end,
                start: selectedDateRange.start,
            });
        } catch (ex) {
            daysBetween = [];
        }
        if (daysBetween.length <= 2) {
            dayRanges.push({...selectedDateRange});
        } else {
            let lastEndDate;
            for (let i = 1; i < daysBetween.length; i++) {
                if (!lastEndDate) {
                    lastEndDate = subMinutes(selectedDateRange.start, 1);
                } else {
                    let start = addMinutes(lastEndDate, 1);
                    let end = daysBetween[i];
                    if (daysBetween.length - 1 === i) {
                        end = selectedDateRange.end;
                    }
                    dayRanges.push({start, end});
                    lastEndDate = end;
                }
            }
        }
        let chartReadySubs;
        let newSub = authService.ping().pipe(map(item => item), catchError((err) => {
            if (err && err.message && (err.message === 'access_access_token_expired' || err.message === 'Unathorized')) {
                if (history.location.pathname.startsWith('/dashboard')) {
                    history.push('/login');
                }
                enqueueSnackbar('Your session  has been expired. Please try login', {variant: 'error'});
            } else if (err) {
                enqueueSnackbar(err ? err.message : 'Failed request', {variant: 'error'});
            }
            return [];
        })).subscribe(() => {
            if(_daysMode !== 'all'){
                let sub = of(dayRanges).pipe(map(data => data), switchMap(data => {
                    return forkJoin(data.map(item => {
                        return  fetchEventData({
                            id: idParam,
                            containerType: containerType,
                            startTime: item.start,
                            endTime: item.end,
                            _daysMode
                        });
                    }));
                })).subscribe((results = []) => {
                    let _allResults = results.flat(1);
                    chartReadySubs = fromEvent(chartWorkerRef.current, 'message').subscribe((event) => {
                        if (event && event.data) {
                            const allData = event.data;
                            const {_chartReadyData, _windSpeedData, _combinedAvgData, _allResult, _allDateValues} = allData;
                            setState({
                                data: _chartReadyData,
                                combinedAvgData: _combinedAvgData,
                                windSpeedData: _windSpeedData,
                                showScaleButton: true,
                                isLoading: false,
                                allResult: _allResult,
                                allDateValues: _allDateValues,
                            });
                            chartReadySubs.unsubscribe();
                        }
                    });
                    subscriptionRef.current.push(chartReadySubs);
                    chartWorkerRef.current.postMessage({
                        data: _allResults,
                        primarySensor,
                    });
                });
                subscriptionRef.current.push(sub);
            } else {
                let dateRangeObserver = new BehaviorSubject(dayRanges.splice(0, 5));
                let new_subscription = dateRangeObserver.pipe(map(data => data), switchMap(data => {
                    return forkJoin(data.map(item => {
                        //console.log('requesting', new Date().toLocaleTimeString());
                        return  fetchEventData({
                            id: idParam,
                            containerType: containerType,
                            startTime: item.start,
                            endTime: item.end,
                            _daysMode
                        });
                    }));
                })).subscribe((results) => {
                    if(dayRanges.length > 0){
                        dateRangeObserver.next(dayRanges.splice(0, 5));
                    } else {
                        dateRangeObserver.complete();
                        setState({
                            isLoading: false,
                        });
                    }
                    if(results && Array.isArray(results)) {
                        combinedResults = combinedResults.concat(results.flat( 1));
                        chartReadySubs = fromEvent(chartWorkerRef.current, 'message').subscribe((event) => {
                            if (event && event.data) {
                                const allData = event.data;
                                const {_chartReadyData, _windSpeedData, _combinedAvgData, _allResult, _allDateValues} = allData;
                                setState({
                                    data: _chartReadyData,
                                    combinedAvgData: _combinedAvgData,
                                    windSpeedData: _windSpeedData,
                                    showScaleButton: true,
                                    allResult: _allResult,
                                    allDateValues: _allDateValues,
                                });
                                chartReadySubs.unsubscribe();
                            }
                        });
                        subscriptionRef.current.push(chartReadySubs);
                        chartWorkerRef.current.postMessage({
                            data: combinedResults,
                            primarySensor,
                        });
                    }
                });
                subscriptionRef.current.push(dateRangeObserver);
                subscriptionRef.current.push(new_subscription);
            }
        });
        subscriptionRef.current.push(newSub);
    }


    const fetchAvailableDeviceTypes = useCallback(function fetchAvailableDeviceTypes() {
        if (idParam && containerType) {
            let observable$ = new Observable((observer) => {
                return new AxiosSubscriber(observer, '/devices/availableTypes/lists', {
                    id: idParam,
                    containerType: containerType
                });
            });
            return observable$;
        }
    }, [idParam, containerType]);

    const getFirstEventDate = React.useCallback(function getFirstEventDate(params) {
        let observable$ = new Observable((observer) => {
            return new AxiosSubscriber(observer, '/chart_events/getFirstEventDate', params);
        });
        return observable$;
    }, []);

    const refreshData = React.useCallback(function refreshData(queryName, params) {
        let observable$ = new Observable((observer) => {
            return new AxiosSubscriber(observer, '/chart_events', params);
        });

        return observable$.pipe(map(result => {
            if (result) {
                let _data = [];
                if(result.data && Array.isArray(result.data)){
                    _data = result.data;
                } else if (Array.isArray(result)) {
                    _data = result;
                }
                let allData = _data.map(item => {
                    item.TimeStamp = new Date(item.TimeStamp);
                    if (item.WindSpeed) {
                        // item.WindSpeed = undefined;
                        // item.Direction = undefined;
                        item.WindSpeed = roundNumber(item.WindSpeed, 1);
                        /*if (item.WindSpeed > 5) {
                            item.WindSpeed = roundNumber(item.WindSpeed, 0);
                        } else {
                            item.WindSpeed = roundNumber(item.WindSpeed, 1);
                        }*/
                    }
                    item.distance = ceil(item.distance, -1);
                    item.keyName = item.positionLookupName;
                    item.CoreId = item.CoreId;
                    item.positionName = item.positionLookupName;
                    item.positionLookupName = item.distance ? [item.positionLookupName, ' (' + (item.distance || '') + '\')'].join('') : item.positionLookupName;
                    return item;
                });
                //console.log('allData', allData);
                return allData;
            } else {
                return [];
            }
        }));
    }, []);

    const fetchEventData = React.useCallback(function fetchEventData({id, containerType, startTime, endTime, _daysMode}) {
        let queryName = 'find';
        return refreshData(queryName, {
            id: idParam,
            startTime: startTime,
            endTime: endTime,
            containerType: containerType,
            chartMode: _daysMode,
        });
    }, [refreshData, match.params, idParam, daysMode]);

    const setContainerDetailHeader = useCallback(function setContainerDetailHeader() {
        /* setState({
             loading: true
         });*/
        switch (containerType) {
            case 'companies':
                fetchCompanyData();
                break;
            case 'divisions':
                fetchDivisionData();
                break;
            case 'site':
                fetchSiteData();
                break;
            default:
                fetchSiteData();
                break;

        }
    }, [containerType, idParam, match.params]);


    const fetchCompanyData = useCallback(function fetchCompanyData() {
        if (collections[idParam]) {
            let resultData = {...collections[idParam]};
            setState({
                reference_id: resultData.id,
                reference_type: resultData.lookup_ID,
                title: `${resultData.name}`,
                resourceNotFound: true
            });
            //fetchActivities(resultData.id, resultData.lookup_ID);
        } else {
            refresh().then((data) => {
                if (data && data[idParam]) {
                    let resultData = {...data[idParam]};
                    setState({
                        title: `${resultData.name}`,
                        resourceNotFound: false,
                    });
                } else {
                    setState({
                        resourceNotFound: true,
                    });
                }
            }).catch(err => {
                console.log(err);
                if (err && err.message && (err.message === 'access_token_expired' || err.message === 'Unathorized')) {
                    if (history.location.pathname.startsWith('/dashboard')) {
                        history.push('/login');
                    }
                    enqueueSnackbar('Your session  has been expired. Please try login', {variant: 'error'});
                } else {
                    enqueueSnackbar(err ? err.message : 'Failed request', {variant: 'error'});
                }
            });
        }
    }, [collections, idParam, refresh, history, enqueueSnackbar]);

    const fetchDivisionData = useCallback(function fetchDivisionData() {
        if (collections[idParam]) {
            let resultData = {...collections[idParam]};
            setState({
                title: `${resultData.name}`,
                resourceNotFound: false,
            });
        } else {
            refresh().then((data) => {
                if (data && data[idParam]) {
                    let resultData = {...data[idParam]};
                    setState({
                        title: `${resultData.name}`,
                        resourceNotFound: false,
                    });
                } else {
                    setState({
                        resourceNotFound: true,
                    });

                }
            }).catch(err => {
                console.log(err);
                if (err && err.message && (err.message === 'access_token_expired' || err.message === 'Unathorized')) {
                    if (history.location.pathname.startsWith('/dashboard')) {
                        history.push('/login');
                    }
                    enqueueSnackbar('Your session  has been expired. Please try login', {variant: 'error'});
                } else {
                    enqueueSnackbar(err ? err.message : 'Failed request', {variant: 'error'});
                }
            });
        }
    }, [collections, idParam, refresh, history, enqueueSnackbar]);

    const fetchSiteData = useCallback(function fetchSiteData() {

        if (containerType === 'sites' && siteData && siteData.id === idParam) {
            return;
        }
        let observable$ = new Observable((observer) => {
            return new AxiosSubscriber(observer, siteService.getEndPoint() + '/' + idParam, {});
        });

        let newSub = observable$.pipe(catchError(err => {
            if (err && err.message && (err.message === 'access_access_token_expired' || err.message === 'Unathorized')) {
                if (history.location.pathname.startsWith('/dashboard')) {
                    history.push('/login');
                }
                enqueueSnackbar("Your session  has been expired. Please try login", {variant: 'error'});
            } else if(err && err.message === 'SITE_NOT_FOUND'){
                setState({
                    resourceNotFound: true,
                });
            }  else {
                enqueueSnackbar(err ? err.message : 'Failed request', {variant: 'error'});
            }
            return [];
        })).subscribe((result) => {
            if (result && result.data) {
                setState({
                    reference_id: result.data.id,
                    reference_type: result.data.lookup_ID,
                    title: result.data.name ? `${result.data.name}` : '',
                    siteData: result.data,
                    resourceNotFound: false,
                });
            } else {
                setState({
                    resourceNotFound: true,
                });
            }
        });
        subscriptionRef.current.push(newSub);
    }, [containerType, siteData, idParam, match.params, enqueueSnackbar]);


    const setDateSelection = React.useCallback(function setDateSelection({start, end}) {
        setState({
            selectedDateRange: {start, end},
        });
    }, [setState]);

    function setStartDate(newDate) {
        let endDate = selectedDateRange.end;
        let startDate = newDate;
        handleDateSelection(startDate, endDate);
    }

    function setEndDate(newDate) {
        let endDate = newDate;
        let startDate = selectedDateRange.start;
        handleDateSelection(startDate, endDate);
    }

    function handleDateSelection(startDate, endDate) {
        if (startDate && endDate) {
            if (isBefore(startDate, endDate)) {
                setState({
                    selectedDateRange: {start: startDate, end: endDate},
                });
            } else {
                enqueueSnackbar('Invalid date selection', {variant: 'error'});
            }
        }

    }

    const toggleAxisMode = React.useCallback(function toggleAxisMode() {
        let axisModeNew = axisMode === 'dynamic' ? 'static' : 'dynamic';
        setState({axisMode: axisModeNew});
        window.localStorage.setItem('axisMode', JSON.stringify(axisModeNew));
    }, [axisMode]);

    const exportToCsv = React.useCallback(function exportToCsv() {
        if (!siteData) {
            return true;
        }
        if (!allResult || !allResult.length) {
            return true;
        }
        let downloadOptions = {
            filename: `${siteData.name.toLowerCase()}_${new Date().toJSON()}.csv`,
            separator: ',',
        };

        setState({
            isCsvImporting: true,
        });
        let fieldNames;
        let newSub = from(chartEventService.getStream({
            id: idParam,
            containerType: containerType,
            startTime: selectedDateRange.start,
            endTime: selectedDateRange.end,
        })).pipe(catchError((err) => {
            setState({
                isCsvImporting: false,
            });
            if (err && err.message && (err.message === 'access_access_token_expired' || err.message === 'Unathorized')) {
                if (history.location.pathname.startsWith('/dashboard')) {
                    history.push('/login');
                }
                enqueueSnackbar('Your session  has been expired. Please try login', {variant: 'error'});
            } else if (err) {
                enqueueSnackbar(err ? err.message : 'Failed request', {variant: 'error'});
            }
        })).subscribe(results => {

            let data;
            data = [...results];
            data = data.map(dataItem => {
                sensorNames.forEach((sItem) => {
                    if (sItem && sItem.name && dataItem[sItem.name]) {
                        if (!isNaN(dataItem[sItem.name])) {
                            dataItem[sItem.name] = roundNumber(dataItem[sItem.name], 4);
                        }
                    }
                });
                if (dataItem.WindSpeed) {
                    //item.WindSpeed = undefined;
                    // item.Direction = undefined;
                    dataItem.WindSpeed = roundNumber(dataItem.WindSpeed, 1);
                    /* if (dataItem.WindSpeed > 5) {
                         dataItem.WindSpeed = roundNumber(dataItem.WindSpeed, 1);
                     } else {
                         dataItem.WindSpeed = roundNumber(dataItem.WindSpeed, 1);
                     }*/
                }
                if (dataItem['positionLookupName']) {
                    dataItem['position'] = dataItem['positionLookupName'];
                }
                return dataItem;
            });

            if (data && data.length > 0) {
                fieldNames = Object.keys(data[0]);
                // fieldNames.push('position');
                CsvDownLoader(fieldNames.map(item => {
                    return {
                        name: item,
                        label: `${item}   ${sensorNamesByName[item] && sensorNamesByName[item].unitName ? ` (${sensorNamesByName[item].unitName}) ` : ''}`,
                        download: (item === 'device' || item === 'positionLookupId' || item === 'siteID' || item === 'tVOC2' || item === 'SiteName' || item === 'ChargeDifferential' || item === 'distance' || item === 'positionLookupName' || item === 'CH4' || item === 'eCO2' || item === 'id') ? false : true,
                    };
                }), data.map(item => {
                    return {
                        data: {
                            ...item,
                            TimeStamp: format(new Date(item.TimeStamp), 'MM/dd/yyyy HH:mm:ss', {awareOfUnicodeTokens: true}),
                        },
                    };
                }), {downloadOptions});
            }
            setState({
                isCsvImporting: false,
            });
        });

        subscriptionRef.current.push(newSub);

    }, [siteData, allResult, idParam, containerType, selectedDateRange.start, selectedDateRange.end, history, enqueueSnackbar]);


    const onTimeframeSelect = React.useCallback((event) => {
        event.stopPropagation();
        let _daysMode = event.target.value;
        setState({
            daysMode: _daysMode,
        });
    }, [setState]);

    const onPrimarySensorSelect = React.useCallback((event) => {
        event.stopPropagation();
        let _primarySensor = event.target.value;
        if (!_primarySensor) {
            _primarySensor = 'tVOC1';
        }
        setState({
            primarySensor: _primarySensor,
        });
    }, [setState]);

    const decreaseSelectedDateRange = React.useCallback((event) => {
        event.stopPropagation();
        if (selectedDateRange && selectedDateRange.end && selectedDateRange.start) {
            let diffInSeconds = Math.abs(differenceInSeconds(selectedDateRange.end, selectedDateRange.start));
            if (diffInSeconds > 0) {
                let newStartDate = cloneDeep(minAllowedStartDate);
                let newEndDate = addSeconds(newStartDate, diffInSeconds);
                if (isAfter(newEndDate, new Date())) {
                    newEndDate = new Date();
                }
                newStartDate.setMilliseconds(0);
                newStartDate.setSeconds(0);
                newEndDate.setMilliseconds(0);
                newEndDate.setSeconds(0);
                if (isAfter(newEndDate, newStartDate)) {
                    setState({
                        selectedDateRange: {
                            start: newStartDate,
                            end: newEndDate,
                            dateControlPressed: 'prev_forward_forward',
                        },
                    });
                }
            }
        }

    }, [setState, selectedDateRange, minAllowedStartDate]);


    const decreaseSelectedStart = React.useCallback((event) => {
        event.stopPropagation();
        if (selectedDateRange && selectedDateRange.start && selectedDateRange.end) {
            let diffInSeconds = Math.abs(differenceInSeconds(selectedDateRange.end, selectedDateRange.start));
            if (diffInSeconds > 0) {
                let newStartDate = subSeconds(selectedDateRange.start, diffInSeconds);
                let newEndDate = addSeconds(newStartDate, diffInSeconds);
                if (isAfter(newEndDate, new Date())) {
                    newEndDate = new Date();
                }
                if (isBefore(newStartDate, minAllowedStartDate)) {
                    newStartDate = cloneDeep(minAllowedStartDate);
                    newEndDate = addSeconds(newStartDate, diffInSeconds);
                    if (isAfter(newEndDate, new Date()) && isBefore(newStartDate, new Date())) {
                        newEndDate = new Date();
                    }
                }
                newStartDate.setMilliseconds(0);
                newStartDate.setSeconds(0);
                newEndDate.setMilliseconds(0);
                newEndDate.setSeconds(0);
                if (isAfter(newEndDate, newStartDate)) {
                    setState({
                        selectedDateRange: {
                            start: newStartDate,
                            end: newEndDate,
                            dateControlPressed: 'prev_forward',
                        },
                    });
                }
            }
        }
    }, [setState, selectedDateRange, minAllowedStartDate]);


    const inscreaseSelectedEnd = React.useCallback((event) => {
        event.stopPropagation();
        if (selectedDateRange && selectedDateRange.start && selectedDateRange.end) {
            let diffInSeconds = Math.abs(differenceInSeconds(selectedDateRange.end, selectedDateRange.start));
            if (diffInSeconds > 0) {
                let newStartDate = selectedDateRange.end;
                let newEndDate = addSeconds(newStartDate, diffInSeconds);
                if (isAfter(newEndDate, new Date())) {
                    newEndDate = new Date();
                    newStartDate = subSeconds(newEndDate, diffInSeconds);
                }
                if (isBefore(newStartDate, minAllowedStartDate)) {
                    newStartDate = cloneDeep(minAllowedStartDate);
                }
                newStartDate.setMilliseconds(0);
                newStartDate.setSeconds(0);
                newEndDate.setMilliseconds(0);
                newEndDate.setSeconds(0);
                if (isAfter(newEndDate, newStartDate)) {
                    setState({
                        selectedDateRange: {
                            start: newStartDate,
                            end: newEndDate,
                            dateControlPressed: 'fast_forward',
                        },
                    });
                }
            }


        }
    }, [setState, selectedDateRange, minAllowedStartDate]);


    const increaseSelectedDateRange = React.useCallback((event) => {
        event.stopPropagation();
        if (selectedDateRange && selectedDateRange.start && selectedDateRange.end) {
            //let diffInDays = Math.abs(differenceInCalendarDays(selectedDateRange.end, selectedDateRange.start));
            let diffInSeconds = Math.abs(differenceInSeconds(selectedDateRange.end, selectedDateRange.start));
            if (diffInSeconds > 0) {
                let newEndDate = new Date();
                let newStartDate = subSeconds(newEndDate, diffInSeconds);
                if (isBefore(newStartDate, minAllowedStartDate)) {
                    newStartDate = cloneDeep(minAllowedStartDate);
                }
                newStartDate.setMilliseconds(0);
                newStartDate.setSeconds(0);
                newEndDate.setMilliseconds(0);
                newEndDate.setSeconds(0);
                if (isAfter(newEndDate, newStartDate)) {
                    setState({
                        selectedDateRange: {
                            start: newStartDate,
                            end: newEndDate,
                            dateControlPressed: 'fast_forward_forward',
                        },
                    });
                }
            }

        }
    }, [setState, selectedDateRange, minAllowedStartDate]);

    return {
        value,
        weekRanges,
        setState,
        setStartDate,
        setEndDate,
        isCsvImporting,
        decreaseSelectedDateRange,
        decreaseSelectedStart,
        inscreaseSelectedEnd,
        increaseSelectedDateRange,
        minAllowedStartDate,
        daysMode,
        onTimeframeSelect,
        containerType,
        idParam,
        exportToCsv,
        setDateSelection,
        toggleAxisMode,
        title,
        siteData,
        data,
        showScaleButton,
        combinedAvgData,
        isLoading,
        windSpeedData,
        selectedDateRange,
        axisMode,
        selectedCurve,
        deviceDataStore,
        globalHoveredValueDetails,
        allDateValues,
        onPrimarySensorSelect,
        primarySensor,
        primarySensorName,
        fieldNames,
        resourceNotFound,
    };
}
