import React, {useCallback, useContext, useReducer} from 'react';
import {Grid, InputLabel, makeStyles, Paper, withStyles} from "@material-ui/core";
import {withRouter} from "react-router";
import {siteService} from "../../../services/siteService";
import {roundNumber} from "../../../helpers/CommonHelper";
import { uniqBy, ceil, cloneDeep, isNil} from "lodash";
import * as d3 from "d3";
import {
    eachDayOfInterval,
    isValid,
    subDays,
    subHours,
    subSeconds,
    differenceInSeconds,
    differenceInCalendarDays,
    differenceInHours,
    format,
    isBefore,
    addDays,
    addHours,
    addSeconds,
    isAfter,
    isDate,
    subMonths,
    subMinutes,
    addMinutes,
} from 'date-fns';
import Toolbar from "@material-ui/core/Toolbar";
import Typography from "@material-ui/core/Typography";
import {from, of, forkJoin, fromEvent, Observable } from 'rxjs';
import {map, switchMap, catchError, debounceTime} from 'rxjs/operators';
import debounce from 'lodash.debounce';
import classnames from 'classnames';
import {Button, IconButton} from "@material-ui/core";
import TinySpinner from "../../../components/TinySpinner";
import ExportIcon from "../../../components/icons/ExportIcon";
import {ParentSize} from '@vx/responsive';
import CsvDownLoader from "../../../components/DataView/CsvDownLoader";
import DateFnsUtils from "@date-io/date-fns";
import {CollectionDataContext} from "../../../components/collection/CollectionDataProvider";
import {useSnackbar} from "notistack";
import {chartEventService} from "../../../services/chartEventService";
import DateRangeIcon from "@material-ui/icons/DateRange";
import SkipNextIcon from "@material-ui/icons/SkipNext";
import SkipPreviousIcon from "@material-ui/icons/SkipPrevious";
import ArrowRightIcon from "@material-ui/icons/ArrowRight";
import ArrowLeftIcon from "@material-ui/icons/ArrowLeft";
import {authService} from "../../../services/authService";
import {KeyboardDateTimePicker, MuiPickersUtilsProvider} from "@material-ui/pickers";
import InputAdornment from "@material-ui/core/InputAdornment";
import {sensorNames, sensorNamesByName, sensorNameKeys} from "./ChartHeaders";
import {AxiosSubscriber} from "../../../services/axiosInstance/AxiosSubscriber";
import GroupedSiteChart from "../../../components/groupedSiteChart/GroupedSiteChart";
import TextField from "@material-ui/core/TextField";
import {collectionService} from "../../../services/collectionService";

// eslint-disable-next-line import/no-webpack-loader-syntax
import WebWorker from "../../../WorkerSetup";
// eslint-disable-next-line import/no-webpack-loader-syntax
import chartWorker from '../../../workers/grouped.chart.worker.js';


const dateFns = new DateFnsUtils();

const useStyles = makeStyles(theme => ({
    paper: {
        padding: 0,
        textAlign: 'center',
        color: theme.palette.text.secondary,
        //  height: '100%',
        animation: 'animate-base-container 850ms forwards',
        display: 'flex',
        //  flexWrap: 'wrap',
        //  flexGrow:1,
        //  flexDirection:  'row',
        height: 'calc(100%)',
        minHeight: 'calc(100%)',
        maxHeight: 'calc(100%)',
        alignItems: 'stretch',
        justifyContent: 'stretch',
    },
    Container: {
        flexGrow: 1,
        display: 'flex',
        flexDirection: 'column',
        padding: 0,
        flexWrap: 'wrap',
        height: 'calc(100%)',
        width: 'calc(100%)',
        alignItems: 'stretch',
        justifyContent: 'stretch',
    },
    chartContainer: {
        //  height: '54%',
        flex: '50%',
        padding: 0,
        overflow: 'hidden',
        width: '100%',
        minWidth: '100%',
        border: 'none',
        flexWrap: 'wrap',
        alignItems: 'stretch',
        position: 'relative',
    },
    chartContainerBottom: {
        //  height: '29%',
        flex: '40%',
        padding: 0,
        overflow: 'hidden',
        flexWrap: 'wrap',
        alignItems: 'stretch',
        position: 'relative',
    },
    root: {
        backgroundColor: theme.palette.background.default,
        display: 'flex',
        flexWrap: 'wrap',
        paddingLeft: '10px',
        minHeight: '5px',
    },
    toolbar: {
        height: 'auto',
        flex: 'none',
        width: 'calc(100%)'
    },
    toolbarAddButton: {
        padding: 0
    },
    exportButton: {
        padding: 0,
    },
    title: {
        textAlign: 'left',
        flexGrow: 1,
        paddingTop: '5px',
    },
    heading: {
        fontSize: '.9rem',
        textTransform: 'uppercase',
        fontWeight: '700',
    },
    selectedButton: {
        color: theme.palette.text.primary,
        backgroundColor: theme.palette.primary.main
    },
    smallButton:{
      minWidth: '30px',
      padding: 0,
    },
    datePickerDialogue: {
        color: 'inherit',
        '& .MuiDialogActions-root': {
            '& button': {
                color: 'inherit'
            }
        }
    },
}));


export const GroupChartControllerContext = React.createContext({
    sensorNames: [],
    selectedDateRange: undefined,
    hoveredValueDetails: {},
    axisMode: 'static',
    daysMode: undefined,
    DateRanges: [],
    setDateSelection: () => {
    },
    toggleAxisMode: () => {
    },
    selectedCurve: 'curveMonotoneX'
});


function reducer(currentState, newState) {
    return {...currentState, ...newState};

}

function dataReducer(currentState, action = {}) {
    switch (action.type) {
        case 'CLEAR':
            return {...currentState, originalData: []};
            break;
        case 'ADD':
            if (action.payload && Array.isArray(action.payload)) {
                let newOriginalData = [...currentState.originalData, ...action.payload];
                newOriginalData = uniqBy(newOriginalData, 'id');
                return {
                    ...currentState,
                    originalData: newOriginalData
                }
            }
            break;
    }
    return currentState;

}


const DateRanges = [
    {
        key: 'all',
        label: 'All',
        getDateRanges: function () {
            return {start: d3.timeMinute.floor(subHours(new Date(), 1)), end: d3.timeMinute.floor(new Date())}
        }
    },
    {
        key: 'hourly',
        label: 'Hourly',
        getDateRanges: function () {
            return {start: d3.timeMinute.floor(subHours(new Date(), 1)), end: d3.timeMinute.floor(new Date())}
        }
    }, /*{
        key: 'four_hour',
        label: 'Four Hour',
        getDateRanges: function () {
            return {start: d3.timeMinute.floor(subHours(new Date(), 4)), end: d3.timeMinute.floor(new Date())}
        }
    },*/ {
        key: 'daily',
        label: 'Daily',
        getDateRanges: function () {
            return {start: d3.timeMinute.floor(subDays(new Date(), 1)), end: d3.timeMinute.ceil(new Date())}
        }
    }, /*{
        key: 'four_day',
        label: 'Four Days',
        getDateRanges: function () {
            return {start: d3.timeMinute.floor(subDays(new Date(), 4)), end: d3.timeMinute.ceil(new Date())}
        }
    },*/
    /*{
        key: 'weekly',
        label: 'Weekly',
        getDateRanges: function () {
            return {start: d3.timeMinute.floor(subDays(new Date(), 7)), end: d3.timeMinute.ceil(new Date())}
        }
    },
    {
        key: 'monthly',
        label: 'Monthly',
        getDateRanges: function () {
            return {start: d3.timeMinute.floor(subMonths(new Date(), 1)), end: d3.timeMinute.ceil(new Date())}
        }
    },
    {
        key: 'quarterly',
        label: 'Quarterly',
        getDateRanges: function () {
            return {start: d3.timeMinute.floor(subMonths(new Date(), 4)), end: d3.timeMinute.ceil(new Date())}
        }
    }*/
];

function useGroupedChartController({match, history}) {

    const [{value, idParam, isCsvImporting, daysMode, allData, containerType, allDateValues, weekRanges, title, siteData, data, showScaleButton, isLoading, windSpeedData, minAllowedStartDate, selectedDateRange, axisMode, selectedCurve, allSites, chartData, companyData, exceedBaseLine, maxQty, minQty}, setState] = useReducer(reducer, {
        value: 0,
        data: [],
        title: '',
        siteData: undefined,
        minAllowedStartDate: d3.timeMinute.floor(subMonths(new Date(), 4)),
        selectedDateRange: {start: d3.timeMinute.floor(subDays(new Date(), 1)), end: d3.timeMinute.floor(new Date())},
        axisMode: 'static',
        weekRanges: [],
        isLoading: false,
        idParam: undefined,
        containerType: undefined,
        daysMode: undefined,
        allResult: [],
        isCsvImporting: false,
        selectedCurve: 'curveMonotoneX',
        allDateValues: [],
        allSites:[],
        globalHoveredValueDetails: {},
        chartData: undefined,
        companyData: undefined,
        exceedBaseLine: undefined,
        allData: undefined,
        maxQty: undefined,
        minQty: undefined
    });

    const {collections, refresh, signalRefresh} = useContext(CollectionDataContext);
    const [{originalData}, dispatch] = useReducer(dataReducer, {originalData: []});
    const subscriptionRef = React.useRef();
    const subscriptionExtraRef = React.useRef();
    const chartWorkerRef =  React.useRef();
    const baselineRef =  React.useRef();
    const {enqueueSnackbar} = useSnackbar();
    //const { deviceData } = useOverview({match, containerType, history});

    React.useEffect(() => {
        subscriptionRef.current = [];
        subscriptionExtraRef.current = [];
        chartWorkerRef.current = new chartWorker();
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

    React.useLayoutEffect(()=>{
        if(baselineRef.current){
            let inputElem = baselineRef.current;
            if(inputElem) {
                let _subscription = fromEvent(inputElem, 'keyup').pipe(map(x => x.currentTarget.value), debounceTime(700)).subscribe((value) => {
                    if (!isNil(value)) {
                        let newVal =  parseFloat(value.toString().toLowerCase().trim());
                        setState({
                            exceedBaseLine: newVal,
                        });
                        collectionService.updateExceedBaseLine(companyData.id, { exceedBaseLine: newVal }).then(()=>{
                            refresh();
                        }).catch((err)=>{
                            enqueueSnackbar(err.message, {variants: 'error'})
                        });
                    }
                });
                return () => {
                    if (_subscription) {
                        _subscription.unsubscribe();
                    }
                }
            }
        }
    },[baselineRef.current]);


    React.useLayoutEffect(() => {
        try {
            let _selectedDateRange;
            let dateControlPressed = undefined;
            let daysModeStr = window.localStorage.getItem('daysMode');
            let selectedDateRangeStr = window.localStorage.getItem('selectedGroupSiteDateRange');
            if (selectedDateRangeStr) {
                _selectedDateRange = JSON.parse(selectedDateRangeStr);
                if (_selectedDateRange.start) {
                    _selectedDateRange.start = new Date(_selectedDateRange.start);
                }
                if (_selectedDateRange.end) {
                    _selectedDateRange.end = new Date(_selectedDateRange.end);
                }
                if(_selectedDateRange.dateControlPressed && _selectedDateRange.dateControlPressed  === 'fast_forward_forward'){
                    let diffInSeconds = Math.abs(differenceInSeconds(_selectedDateRange.end, _selectedDateRange.start));
                    if(diffInSeconds > 0){
                        let newEndDate = new Date();
                        let newStartDate = subSeconds(newEndDate, diffInSeconds);
                        if(isBefore(newStartDate, minAllowedStartDate)){
                            newStartDate = cloneDeep(minAllowedStartDate);
                        }
                        if(isAfter(newEndDate, newStartDate)){
                            _selectedDateRange.start = newStartDate;
                            _selectedDateRange.end = newEndDate;
                        }
                    }
                }
                if (isAfter(_selectedDateRange.start, _selectedDateRange.end)) {
                    _selectedDateRange = {
                        start: d3.timeMinute.floor(subHours(new Date(), 1)),
                        end: d3.timeMinute.ceil(new Date()),
                        dateControlPressed: dateControlPressed
                    };
                }

                if (!_selectedDateRange.start || !_selectedDateRange.end) {
                    _selectedDateRange = {
                        start: d3.timeMinute.floor(subHours(new Date(), 1)),
                        end: d3.timeMinute.ceil(new Date()),
                        dateControlPressed: dateControlPressed
                    };
                }
            } else {
                _selectedDateRange = {
                    start: d3.timeMinute.floor(subHours(new Date(), 1)),
                    end: d3.timeMinute.ceil(new Date()),
                    dateControlPressed: dateControlPressed
                };
            }
            if(_selectedDateRange){
                if(_selectedDateRange.start){
                    if(isDate(_selectedDateRange.start)){
                        _selectedDateRange.start.setMilliseconds(0);
                        _selectedDateRange.start.setSeconds(0);
                    }
                }
                if(_selectedDateRange.end){
                    if(isDate(_selectedDateRange.end)){
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
                    setState({daysMode: 'hourly', selectedDateRange: _selectedDateRange});
                }
            } else {
                setState({daysMode: 'hourly',  selectedDateRange: _selectedDateRange});
            }
        } catch (err) {
            console.log(err);
        }
    }, []);


    React.useEffect(() => {
        if (match.params) {
            if (match.params.id && match.params.topic) {
                setState({
                    idParam: match.params.id ? parseInt(match.params.id) : null,
                    containerType: match.params.topic,
                    isLoading: false,
                });
                return () => {
                    setState({
                        idParam: undefined,
                        containerType: undefined,
                        isLoading: false,
                    });
                    //dispatch({type: 'CLEAR'});
                }
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
            }).pipe(catchError(err=>{
                return [];
            })).subscribe((result)=>{
                let TimeStamp = d3.timeMinute.floor(subMonths(new Date(), 4));
                if(result && result.data && result.data.TimeStamp){
                    TimeStamp = new Date(result.data.TimeStamp);
                }
                let updateObj = {
                    minAllowedStartDate: TimeStamp
                };
                if(selectedDateRange && selectedDateRange.start){
                    if(isAfter(TimeStamp, selectedDateRange.start)){
                        let diffInSeconds = Math.abs(differenceInSeconds(selectedDateRange.end, selectedDateRange.start));
                        updateObj.selectedDateRange = cloneDeep(selectedDateRange);
                        updateObj.selectedDateRange.start = cloneDeep(TimeStamp);
                        if(diffInSeconds > 0){
                            updateObj.selectedDateRange.end  = addSeconds(updateObj.selectedDateRange.start , diffInSeconds);
                            if(isAfter(updateObj.selectedDateRange.end, new Date())){
                                updateObj.selectedDateRange.end = new Date();
                            }
                        }
                    }
                }
                setState(updateObj);
            });
            subscriptionExtraRef.current.push(subs);
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
                showScaleButton: true,
                chartData: undefined,
                allDateValues: undefined,
                allData: undefined,
                maxQty: undefined,
                minQty: undefined,
                isLoading: true,
            });
            handleDataUpdate();
            //debounce(handleDataUpdate, 10)();
            return () => {
                setState({
                    showScaleButton: false,
                    data: undefined,
                    isLoading: false,
                    chartData: undefined,
                    allDateValues: undefined,
                    allData: undefined,
                });
                // dispatch({type: 'CLEAR'});
                if (subscriptionRef && subscriptionRef.current) {
                    subscriptionRef.current.forEach((subscription) => {
                        if (subscription) {
                            subscription.unsubscribe();
                        }
                    });
                    subscriptionRef.current = [];
                }
            }
        }

    }, [idParam, containerType, daysMode, selectedDateRange]);

    React.useEffect(()=>{
        if(allData) {
            
            const chartReadySubs = fromEvent(chartWorkerRef.current, 'message').subscribe((event) => {
                // console.log(event.data);
                if (event.data) {
                    const allData = event.data;
                    const {_chartReadyData, _allDateValues, _chartData, _maxQty, _minQty} = allData;
                    if (_chartData) {
                        Object.keys(_chartData).forEach(function (keyName) {
                            if (keyName && _chartData[keyName]) {
                                _chartData[keyName].colorScale = d3.scaleLinear().domain([ _minQty, 0, 10,_maxQty, 50]).range(['lightgreen', 'darkgreen', 'yellowgreen', 'yellow', 'yelloworange', 'red']).interpolate(d3.interpolateHcl);
                            }
                        });
                    }
                    setState({
                        data: _chartReadyData,
                        showScaleButton: true,
                        isLoading: false,
                        chartData: _chartData,
                        allDateValues: _allDateValues,
                        maxQty: _maxQty,
                        minQty: _minQty
                    });
                    chartReadySubs.unsubscribe();
                }
            });
            chartWorkerRef.current.postMessage({
                data: allData,
                daysMode: daysMode,
                selectedDateRange: {...selectedDateRange},
                exceedBaseLine: exceedBaseLine,
            });
            subscriptionRef.current.push(chartReadySubs);
        }
    },[allData, exceedBaseLine, daysMode, selectedDateRange]);

    React.useEffect(() => {
        if (selectedDateRange && selectedDateRange.start && selectedDateRange.end) {
            try {
                let params = {...selectedDateRange};
                window.localStorage.setItem('selectedGroupSiteDateRange', JSON.stringify(params));
            } catch (err) {
                console.log(err);
            }
        }
    }, [selectedDateRange]);

    function handleDataUpdate() {
        setContainerDetailHeader();
        let dayRanges = [];
        let daysBetween;
        let _daysMode = "hourly";
        let diffInDays = Math.abs(differenceInCalendarDays(selectedDateRange.end, selectedDateRange.start));
        if(diffInDays < 1){
            _daysMode = "all"
        } else if(diffInDays < 8){
            _daysMode = "hourly";
        } else {
            _daysMode = "daily";
        }
        //dayRanges.push({...selectedDateRange});
        try {
            daysBetween = eachDayOfInterval({
                end: selectedDateRange.end,
                start: selectedDateRange.start
            });
        } catch (ex) {
            daysBetween = [];
        }
        //console.log('daysBetween', daysBetween);
        if (daysBetween.length <= 2) {
            dayRanges.push({...selectedDateRange});
        }  else {
            let lastEndDate;
            for(let i=1; i< daysBetween.length; i++){
                if(!lastEndDate){
                    lastEndDate = subMinutes(selectedDateRange.start, 1);
                } else{
                    let start = addMinutes(lastEndDate, 1);
                    let end = daysBetween[i];
                    if(daysBetween.length -1 === i){
                        end  = selectedDateRange.end;
                    }
                    dayRanges.push({start, end});
                    lastEndDate = end;
                }
            }
        }

        let newSub = authService.ping().pipe(map(item => item), catchError((err) => {
            if (err && err.message && (err.message === 'access_token_expired' || err.message === 'Unathorized')) {
                if (history.location.pathname.startsWith('/dashboard')) {
                    history.push('/login');
                }
                enqueueSnackbar("Your session  has been expired. Please try login", {variant: 'error'});
            } else if (err) {
                enqueueSnackbar(err ? err.message : 'Failed request', {variant: 'error'});
            }
            return [];
        })).subscribe(() => {
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
            })).subscribe((data = []) => {
                setState({allData: data, daysMode: _daysMode});
            });
            subscriptionRef.current.push(sub);
            setState({isLoading: true});
        });
        subscriptionRef.current.push(newSub);
    }

    const getFirstEventDate = React.useCallback(function refreshData(params) {
        let observable$ = new Observable( ( observer ) => {
            return new AxiosSubscriber( observer, '/chart_events/getFirstEventDate', params);
        });
        return observable$;
    }, []);

    const refreshData = React.useCallback(function refreshData(queryName, params) {

        let url =  '/chart_events/group_chart_data';
        if(params && params.chartMode === 'daily'){
           // url = '/chart_events';
        }
        //url = '/chart_events';
        let observable$ = new Observable( ( observer ) => {
            return new AxiosSubscriber( observer, url, params);
        });

        return observable$.pipe(map(result => {
            if (result && Array.isArray(result.data)) {
                let allData = result.data.map(item => {
                    item.TimeStamp = new Date(item.TimeStamp);
                    if (item.WindSpeed) {
                        // item.WindSpeed = undefined;
                        // item.Direction = undefined;
                        item.WindSpeed = roundNumber(item.WindSpeed, 1);

                      /*  if (item.WindSpeed > 5) {
                            item.WindSpeed = roundNumber(item.WindSpeed, 0);
                        } else {
                            item.WindSpeed = roundNumber(item.WindSpeed, 1);
                        }*/
                    }
                    item.distance = ceil(item.distance, -1);
                    item.keyName = item.positionLookupName;
                    item.CoreId = item.CoreId;
                   // if(item.distance){
                    item.positionName =  item.positionLookupName;
                    item.positionLookupName = item.distance ? [item.positionLookupName, ' (' + (item.distance || '') +  '\')'].join(''): item.positionLookupName;

                   // }
                    // console.log('item', item);
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
       // console.log('startTime, endTime',   startTime, endTime);
        let queryName = 'find';
        return refreshData(queryName, {
            id: idParam,
            startTime: startTime,
            endTime: endTime,
            containerType: containerType,
            chartMode: _daysMode,
        });
    }, [refreshData, match.params, idParam]);

    const setContainerDetailHeader = useCallback(function setContainerDetailHeader() {
       /* setState({
            loading: true
        });*/
        switch (containerType) {
            case 'companies':
                fetchCompanyData();
                fetchSiteData();
                break;
            case 'divisions':
                fetchDivisionData();
                fetchSiteData();
                break;
            default:
                //fetchSiteData();
                break;

        }
    }, [containerType, idParam,match.params]);


    const fetchCompanyData = useCallback(function fetchCompanyData() {
        if (collections[idParam]) {
            let resultData = {...collections[idParam]};
            setState({
                reference_id: resultData.id,
                reference_type: resultData.lookup_ID,
                title: `${resultData.name} Locations`,
                companyData: resultData,
                exceedBaseLine: parseFloat(resultData.exceedBaseLine),
                loading: false
            })
            //fetchActivities(resultData.id, resultData.lookup_ID);
        } else {
            refresh().then((data) => {
                if (data && data[idParam]) {
                    let resultData = {...data[idParam]};
                    setState({
                        title: `${resultData.name} Locations`,
                        loading: false,
                        companyData: resultData,
                        exceedBaseLine: parseFloat(resultData.exceedBaseLine),
                    });
                }
            }).catch(err => {
                console.log(err);
                if (err && err.message && (err.message === 'access_token_expired' || err.message === 'Unathorized')) {
                    if (history.location.pathname.startsWith('/dashboard')) {
                        history.push('/login');
                    }
                    enqueueSnackbar("Your session  has been expired. Please try login", {variant: 'error'});
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
                title: `${resultData.name} Locations`,
                loading: false,
                companyData: resultData,
                exceedBaseLine: parseFloat(resultData.exceedBaseLine),
            })
        } else {
            refresh().then((data) => {
                if (data && data[idParam]) {
                    let resultData = {...data[idParam]};
                    setState({
                        title: `${resultData.name} Locations`,
                        companyData: resultData,
                        exceedBaseLine: parseFloat(resultData.exceedBaseLine),
                        loading: false
                    })
                }
            }).catch(err => {
                console.log(err);
                if (err && err.message && (err.message === 'access_token_expired' || err.message === 'Unathorized')) {
                    if (history.location.pathname.startsWith('/dashboard')) {
                        history.push('/login');
                    }
                    enqueueSnackbar("Your session  has been expired. Please try login", {variant: 'error'});
                } else {
                    enqueueSnackbar(err ? err.message : 'Failed request', {variant: 'error'});
                }
            });
        }
    }, [collections, idParam, refresh, history, enqueueSnackbar]);

    const fetchSiteData = useCallback(function fetchSiteData() {
        let endpoint='';
        let params ={};
        if(containerType === 'divisions' && idParam){
            endpoint = siteService.getEndPoint()+ '/list/byOperationalUnit';
            params.collection_ID = idParam;
        } else  if(containerType === 'companies' && idParam){
            endpoint = siteService.getEndPoint()+ '/list/byCompany';
            params.companyId = idParam;
        } else {
            return;
        }
        let observable$ = new Observable( ( observer ) => {
            return new AxiosSubscriber( observer, endpoint, params);
        });

       let newSub = observable$.pipe(catchError(err=>{
           setState({
               loading: false
           });
           if (err && err.message && (err.message === 'access_token_expired' || err.message === 'Unathorized')) {
               if (history.location.pathname.startsWith('/dashboard')) {
                   history.push('/login');
               }
               enqueueSnackbar("Your session  has been expired. Please try login", {variant: 'error'});
           } else {
               enqueueSnackbar(err ? err.message : 'Failed request', {variant: 'error'});
           }
           return [];
       })).subscribe((result)=>{
           if (result && result.data) {
               setState({
                   allSites: result.data,
                   loading: false
               });
           } else {
               setState({
                   allSites: [],
                   loading: false
               });
           }
       });
       subscriptionRef.current.push(newSub);
    }, [containerType, siteData, idParam, match.params, enqueueSnackbar]);


    const setDateSelection = React.useCallback(function setDateSelection({start, end}) {
        setState({
            selectedDateRange: {start, end},
            chartData: undefined,
            allData: undefined,
        });
    }, [setState]);

    function setStartDate(newDate) {
        let endDate = selectedDateRange.end;
        let startDate = newDate;
        startDate.setMilliseconds(0);
        startDate.setSeconds(0);
        handleDateSelection(startDate, endDate);
    }

    function setEndDate(newDate) {
        let endDate = newDate;
        let startDate = selectedDateRange.start;
        startDate.setMilliseconds(0);
        startDate.setSeconds(0);
        endDate.setMilliseconds(0);
        endDate.setSeconds(0);
        handleDateSelection(startDate, endDate);
    }

    function handleDateSelection(startDate, endDate) {
        if (startDate && endDate) {
            if (isBefore(startDate, endDate)) {
                setState({
                    selectedDateRange: {start: startDate, end: endDate},
                    chartData: undefined,
                    allData: undefined,
                });
            } else {
                enqueueSnackbar('Invalid date selection', {variant: 'error'})
            }
        }
    }

    const toggleAxisMode = React.useCallback(function toggleAxisMode() {
        let axisModeNew = axisMode === 'dynamic' ? 'static' : 'dynamic';
        setState({axisMode: axisModeNew});
        window.localStorage.setItem('axisMode', JSON.stringify(axisModeNew));
    }, [axisMode]);

    const exportToCsv = React.useCallback(function exportToCsv() {
        if (!chartData || !title) {
            return true;
        }
        let downloadOptions = {
            filename: `${title}_${new Date().toJSON()}.csv`,
            separator: ','
        };

        setState({
            isCsvImporting: true
        });
        let fieldNames;
        let newSub = from(chartEventService.getStream({
            id: idParam,
            containerType: containerType,
            startTime: selectedDateRange.start,
            endTime: selectedDateRange.end
        })).pipe(catchError((err) => {
            setState({
                isCsvImporting: false
            });
            if (err && err.message && (err.message === 'access_token_expired' || err.message === 'Unathorized')) {
                if (history.location.pathname.startsWith('/dashboard')) {
                    history.push('/login');
                }
                enqueueSnackbar("Your session  has been expired. Please try login", {variant: 'error'});
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
                        dataItem.WindSpeed = roundNumber(dataItem.WindSpeed, 0);
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
                        download: (item === 'device' || item === 'positionLookupId' || item === 'siteID' || item === 'tVOC2' || item === 'SiteName' || item === 'ChargeDifferential' || item === 'distance' || item === 'positionLookupName' || item === 'CH4' || item === "eCO2" || item === 'id') ? false : true
                    };
                }), data.map(item => {
                    return {
                        data: {
                            ...item,
                            TimeStamp: format(new Date(item.TimeStamp), 'MM/dd/yyyy HH:mm:ss', {awareOfUnicodeTokens: true})
                        }
                    }
                }), {downloadOptions});
            }
            setState({
                isCsvImporting: false
            });
        });

        subscriptionRef.current.push(newSub);

    }, [chartData, title, idParam, containerType, selectedDateRange.start, selectedDateRange.end, history, enqueueSnackbar]);


    const onTimeframeSelect = React.useCallback((event) => {
        event.stopPropagation();
        let _daysMode = event.target.value;
        setState({
            daysMode: _daysMode,
        });
    }, [setState]);


    const decreaseSelectedDateRange = React.useCallback((event) => {
        event.stopPropagation();
        if (selectedDateRange &&  selectedDateRange.end && selectedDateRange.start) {
            let diffInSeconds = Math.abs(differenceInSeconds(selectedDateRange.end, selectedDateRange.start));
            if(diffInSeconds > 0) {
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
                            dateControlPressed: 'prev_forward_forward'
                        },
                        allDateValues: undefined,
                        allData: undefined,
                    });
                }
            }
        }

    }, [setState, selectedDateRange, minAllowedStartDate]);


    const decreaseSelectedStart = React.useCallback((event) => {
        event.stopPropagation();
        if (selectedDateRange &&  selectedDateRange.start && selectedDateRange.end) {
            let diffInSeconds = Math.abs(differenceInSeconds(selectedDateRange.end, selectedDateRange.start));
            if(diffInSeconds > 0) {
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
                            dateControlPressed: 'prev_forward'
                        },
                        allDateValues: undefined,
                        allData: undefined,
                    });
                }
            }
        }
    }, [setState, selectedDateRange, minAllowedStartDate]);


    const inscreaseSelectedEnd = React.useCallback((event) => {
        event.stopPropagation();
            if (selectedDateRange && selectedDateRange.start && selectedDateRange.end) {
                let diffInSeconds = Math.abs(differenceInSeconds(selectedDateRange.end, selectedDateRange.start));
                if(diffInSeconds > 0){
                    let newStartDate = selectedDateRange.end;
                    let newEndDate = addSeconds(newStartDate, diffInSeconds);
                    newStartDate.setMilliseconds(0);
                    newStartDate.setSeconds(0);
                    newEndDate.setMilliseconds(0);
                    newEndDate.setSeconds(0);
                    if(isAfter(newEndDate, new Date())){
                        newEndDate = new Date();
                        newEndDate.setMilliseconds(0);
                        newEndDate.setSeconds(0);
                        newStartDate = subSeconds(newEndDate, diffInSeconds);
                        newStartDate.setMilliseconds(0);
                        newStartDate.setSeconds(0);
                    }
                    if(isBefore(newStartDate, minAllowedStartDate)){
                        newStartDate = cloneDeep(minAllowedStartDate);
                    }
                    if(isAfter(newEndDate, newStartDate)){
                        setState({
                            selectedDateRange: {
                                start: newStartDate,
                                end: newEndDate,
                                dateControlPressed: 'fast_forward'
                            },
                            allDateValues: undefined,
                            allData: undefined,
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
            if(diffInSeconds > 0){
                let newEndDate = new Date();
                let newStartDate = subSeconds(newEndDate, diffInSeconds);
                if(isBefore(newStartDate, minAllowedStartDate)){
                    newStartDate = cloneDeep(minAllowedStartDate);
                }
                newStartDate.setMilliseconds(0);
                newStartDate.setSeconds(0);
                newEndDate.setMilliseconds(0);
                newEndDate.setSeconds(0);
                if(isAfter(newEndDate, newStartDate)){
                    setState({
                        selectedDateRange: {
                            start: newStartDate,
                            end: newEndDate,
                            dateControlPressed: 'fast_forward_forward'
                        },
                        allDateValues: undefined,
                        allData: undefined,
                    });
                }
            }

        }
    }, [setState, selectedDateRange, minAllowedStartDate]);


    function handleExceedBaseLineChange(e) {
        let val = e.target.value;
        if(!isNil(val)){
            setState({
                exceedBaseLine: parseFloat(val)
            })
        }

    }

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
        isLoading,
        windSpeedData,
        selectedDateRange,
        axisMode,
        selectedCurve,
        allDateValues,
        allSites,
        chartData,
        companyData,
        exceedBaseLine,
        handleExceedBaseLineChange,
        baselineRef,
        maxQty, minQty,
    }
}

const GroupedSiteChartContainer = React.memo(function GroupedSiteChartContainer({match, history}) {

    const classes = useStyles();
    const {value, weekRanges, setState, setStartDate, setEndDate, isCsvImporting, decreaseSelectedDateRange, decreaseSelectedStart, inscreaseSelectedEnd,
        increaseSelectedDateRange, minAllowedStartDate,  daysMode, idParam, exportToCsv, containerType, setDateSelection, toggleAxisMode, title, isLoading , selectedDateRange, axisMode, selectedCurve,
       allDateValues, allSites, chartData, companyData, exceedBaseLine, baselineRef, maxQty, minQty} = useGroupedChartController({
        match,
        history
    });

    if (!idParam || !containerType) {
        return null;
    }


    return (<Paper className={classes.paper}>
        <GroupChartControllerContext.Provider value={{
            sensorNames: sensorNames,
            axisMode: axisMode,
            DateRanges: DateRanges,
            selectedDateRange: {...selectedDateRange},
            setDateSelection: setDateSelection,
            toggleAxisMode: toggleAxisMode,
            daysMode,
            selectedCurve: selectedCurve
        }}>
            <Grid container spacing={1} className={classes.Container}>
                <Grid item xs={12} className={classes.toolbar}>
                    <Toolbar
                        className={classnames(classes.root)}>
                        <React.Fragment>
                                <Typography className={classnames(classes.title, classes.heading)}>
                                    {title} &nbsp;
                                </Typography>
                            <InputLabel style={{ marginRight: '3px'}}>
                                Exceed VOC Baseline
                            </InputLabel>
                            {companyData && (
                                <TextField
                                    inputRef={baselineRef}
                                    style={{ width: '70px', marginRight: '20px', textAlign: 'center'}}
                                    className={classes.textField}
                                    defaultValue={exceedBaseLine || ''}
                                   // value={exceedBaseLine}
                                    InputLabelProps={{
                                        shrink: true,
                                    }}
                                    InputProps={{
                                        step: "0.1",
                                        endAdornment: (
                                            <InputAdornment position="end">
                                                <Typography style={{paddingBottom: '7px'}}>
                                                    ppm
                                                </Typography>
                                            </InputAdornment>
                                        ),
                                    }}
                                    type='number'
                                    margin="dense"
                                />
                            )}
                                <Button type='button' title='Set start/end date backward' className={classes.smallButton} size={'small'} onClick={decreaseSelectedDateRange}>
                                    <SkipPreviousIcon/>
                                </Button>
                                <Button type='button' title='Set start date backward'  className={classes.smallButton} size={'small'} onClick={decreaseSelectedStart}>
                                    <ArrowLeftIcon/>
                                </Button>
                                <Button type='button' title='Set end date forward'  className={classes.smallButton} size={'small'} onClick={inscreaseSelectedEnd}>
                                    <ArrowRightIcon/>
                                </Button>
                                <Button type='button'  title='Set start/end date forward'  className={classes.smallButton} size={'small'} onClick={increaseSelectedDateRange}>
                                    <SkipNextIcon/>
                                </Button>

                                <MuiPickersUtilsProvider utils={DateFnsUtils}>
                                    <KeyboardDateTimePicker
                                        variant="outline"
                                        ampm={true}
                                        style={{ 'marginLeft': '5px', width: '230px'}}
                                        className={classes.datePicker}
                                        DialogProps={{className: classes.datePickerDialogue}}
                                        autoOk={true}
                                        value={selectedDateRange.start}
                                        maxDate={selectedDateRange.end}
                                        minDate={minAllowedStartDate}
                                        onChange={setStartDate}
                                        onError={console.log}
                                        format={dateFns.dateTime12hFormat}
                                        InputProps={{
                                            endAdornment: (
                                                <InputAdornment position="end">
                                                    <IconButton style={{padding: '0px'}}>
                                                        <DateRangeIcon size="small" style={{
                                                            fontSize: 'small',
                                                            padding: '0px',
                                                            width: '.9rem',
                                                            height: '.9rem'
                                                        }}/>
                                                    </IconButton>
                                                </InputAdornment>
                                            ),
                                        }}
                                    />

                                    <KeyboardDateTimePicker
                                        style={{ 'marginLeft': '5px', width: '230px'}}
                                        variant="outline"
                                        ampm={true}
                                        DialogProps={{className: classes.datePickerDialogue}}
                                        className={classes.datePicker}
                                        autoOk={true}
                                        minDate={selectedDateRange.start}
                                        maxDate={new Date()}
                                        // label="Date from"
                                        InputProps={{
                                            InputLabelProps: {
                                                labelPlacement: 'start'
                                            }
                                        }}
                                        value={selectedDateRange.end}
                                        onChange={setEndDate}
                                        onError={console.log}
                                        format={dateFns.dateTime12hFormat}
                                        showTodayButton
                                    />

                                </MuiPickersUtilsProvider>

                               {/* <NativeSelect  onChange={onTimeframeSelect} value={daysMode}>
                                    <option value={null}>Resolution</option>
                                    {DateRanges.map((dateItem => (
                                        <option key={dateItem.key} value={dateItem.key}>{dateItem.label}</option>
                                    )))}
                                </NativeSelect>*/}
                                <Button size="small" className={classes.exportButton} aria-label={'Export data'} align={'right'}
                                        onClick={exportToCsv}>
                                    {isCsvImporting === true ? (
                                        <TinySpinner>...</TinySpinner>
                                    ) : (<ExportIcon fontSize="small"/>)}
                                </Button>
                            </React.Fragment>
                    </Toolbar>
                </Grid>
                <Grid item xs={12} className={classes.chartContainer}>
                    {isLoading && (
                        <TinySpinner><Typography> &nbsp; </Typography></TinySpinner>
                    )}
                    {!isLoading && allDateValues && allDateValues.length > 0 && chartData && (
                        <ParentSize className={classes.parantSize}>
                            {parent => (
                                <GroupedSiteChart
                                    width={parent.width}
                                    height={parent.height}
                                    parentTop={parent.top}
                                    parentLeft={parent.left}
                                    parentRef={parent.ref}
                                    resizeParent={parent.resize}
                                    maxQty={maxQty} minQty={minQty}
                                    setParentState={setState}
                                    allDateValues={allDateValues}
                                    title="Grouped chart" sensorName={'tVOC1'} sites={allSites} data={chartData}/>
                            )}
                        </ParentSize>
                    )}
                </Grid>
            </Grid>
        </GroupChartControllerContext.Provider>
    </Paper>)

});

export default withRouter(GroupedSiteChartContainer);
