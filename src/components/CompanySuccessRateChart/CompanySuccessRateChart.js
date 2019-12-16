import React, {useContext, useEffect, useReducer} from 'react';
import {Button, Grid, IconButton, makeStyles, Paper} from "@material-ui/core";
import {withRouter} from "react-router";
import {ceil, cloneDeep, keyBy, round, sortBy, uniqBy} from "lodash";
import * as d3 from "d3";
import {
    addMinutes, addSeconds,
    differenceInCalendarDays,
    differenceInSeconds, eachDayOfInterval,
    isAfter,
    isBefore,
    format,
    isDate,
    subDays,
    subHours, subMinutes,
    subMonths,
    subSeconds
} from "date-fns";
import {groupBy} from 'lodash';
import Gauge from 'react-svg-gauge';
import {CollectionDataContext} from "../../components/collection/CollectionDataProvider";
import {useSnackbar} from "notistack";
// eslint-disable-next-line import/no-webpack-loader-syntax
import WebWorker from "../../WorkerSetup";
// eslint-disable-next-line import/no-webpack-loader-syntax
import globalChartWorker from '../../workers/global_success_rate.chart.worker.js';
import chartWorker from "../../workers/grouped.chart.worker";
import {authService} from "../../services/authService";
import {catchError, map, switchMap} from "rxjs/operators";
import {forkJoin, fromEvent, Observable, of} from "rxjs";
import {AxiosSubscriber} from "../../services/axiosInstance/AxiosSubscriber";
import Toolbar from "@material-ui/core/Toolbar";
import classnames from "classnames";
import Typography from "@material-ui/core/Typography";
import TinySpinner from "../../components/TinySpinner";
import {KeyboardDateTimePicker, MuiPickersUtilsProvider} from "@material-ui/pickers";
import DateFnsUtils from "@date-io/date-fns";
import InputAdornment from "@material-ui/core/InputAdornment";
import DateRangeIcon from "@material-ui/icons/DateRange";
import SkipNextIcon from "@material-ui/icons/SkipNext";
import SkipPreviousIcon from "@material-ui/icons/SkipPrevious";
import ArrowRightIcon from "@material-ui/icons/ArrowRight";
import ArrowLeftIcon from "@material-ui/icons/ArrowLeft";
import {roundNumber} from "../../helpers/CommonHelper";
import Card from "@material-ui/core/Card";
import CardHeader from "@material-ui/core/CardHeader";
import CardContent from "@material-ui/core/CardContent";
import '../../styles/_animate_base_container.scss';
import CardActions from "@material-ui/core/CardActions";
import FormControlLabel from "@material-ui/core/FormControlLabel";
import Checkbox from "@material-ui/core/Checkbox";
import ExportIcon from "../icons/ExportIcon";
import {ParentSize} from "@vx/responsive";
import SimpleLineChart from "./SimpleLineChart";

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
        background: 'transparent',
        height: 'calc(100%)',
        minHeight: 'calc(100%)',
        maxHeight: 'calc(100%)',
        alignItems: 'stretch',
        justifyContent: 'stretch',
    },
    Container: {
        //flexGrow: 1,
        display: 'flex',
        //flexDirection: 'column',
        padding: 0,
        flexWrap: 'wrap',
        height: 'calc(100%)',
        width: 'calc(100%)',
        alignItems: 'stretch',
        justifyContent: 'stretch',
        backgroundColor: 'none'
    },
    chartContainer: {
        //  height: '54%',
        flex: '100%',
        padding: 0,
        overflow: 'hidden',
        width: '100%',
        minWidth: '100%',
        border: 'border',
        flexWrap: 'wrap',
        alignItems: 'stretch',
        position: 'relative',
        height: 'calc(100% - 60px)',
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
        paddingTop: '3px',
        minHeight: '5px',
        height: '15px',
    },
    toolbar: {
        //height: 'auto',
        flex: 'none',
        width: 'calc(100%)',
        height: '20px',

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
    card: {
        maxWidth: 345,
        animation: 'animate-base-container 850ms forwards'
    },
    topCard:{
        animation: 'animate-base-container 850ms forwards'
    }
}));

function reducer(currentState, newState) {
    return {...currentState, ...newState};
}


export const CompanySuccessRateChartContext = React.createContext({
    selectedDateRange: undefined,
    hoveredValueDetails: {},
    setDateSelection: () => {
    },
});



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



function useCompanySuccessRate({match, history}) {

    const [{value, idParam, isCsvImporting, daysMode, allResult, containerType, allDateValues, weekRanges, title, siteData, data, showScaleButton,
        combinedAvgData, isLoading, windSpeedData, minAllowedStartDate, selectedDateRange, axisMode, selectedCurve, deviceDataStore, globalHoveredValueDetails, allSites, chartData, activeCompanies, successRateData, aggregatedData,
        totalDeviceCount,
        totalActiveDeviceCount,
        totalDeviceSuccessRate, currentTimeStamp, companyId, companyData}, setState] = useReducer(reducer, {
        value: 0,
        data: [],
        title: '',
        siteData: undefined,
        combinedAvgData: [],
        windSpeedData: [],
        minAllowedStartDate: new Date('2019-10-15 20:00:00+00'),
        selectedDateRange: {start: d3.timeMinute.floor(subDays(new Date(), 1)), end: d3.timeMinute.floor(new Date())},
        axisMode: 'static',
        showScaleButton: false,
        weekRanges: [],
        isLoading: false,
        idParam: undefined,
        containerType: undefined,
        daysMode: undefined,
        allResult: [],
        isCsvImporting: false,
        selectedCurve: 'curveMonotoneX',
        deviceDataStore,
        allDateValues: [],
        allSites:[],
        globalHoveredValueDetails: {},
        chartData:{},
        activeCompanies: [],
        successRateData: undefined,
        aggregatedData: [],
        totalDeviceCount: 0,
        totalActiveDeviceCount: 0,
        totalDeviceSuccessRate: 0,
        currentTimeStamp: undefined,
        companyId: undefined,
        companyData: undefined,
    });

    const {collections, refresh, signalRefresh} = useContext(CollectionDataContext);

    const [{originalData}, dispatch] = useReducer(dataReducer, {originalData: []});
    const subscriptionRef = React.useRef();
    const subscriptionExtraRef = React.useRef();
    const chartWorkerRef =  React.useRef();
    const {enqueueSnackbar} = useSnackbar();

    useEffect(()=>{
        subscriptionRef.current = [];
        subscriptionExtraRef.current = [];
        chartWorkerRef.current = new globalChartWorker();
    }, []);

    useEffect(()=>{
        if(match && match.params && match.params.companyId)
        {
            setState({
                companyId: parseInt(match.params.companyId.toString())
            })
        } else {
            setState({
                companyId: undefined
            });
        }
    }, [match.params]);

    useEffect(()=>{
        if(collections && companyId){
            if(collections[companyId]){
                setState({
                    companyData: {...collections[companyId]}
                });
            } else {
                setState({
                    companyData:undefined
                });
            }
        }
    }, [collections, companyId]);





    React.useLayoutEffect(() => {
        try {
            let _selectedDateRange;
            let dateControlPressed = undefined;
            let selectedDateRangeStr = window.localStorage.getItem('selectedDateRange');
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
            setState({ selectedDateRange: _selectedDateRange});
        } catch (err) {
            console.log(err);
        }
    }, []);

    useEffect(()=>{
        if(activeCompanies && activeCompanies.length > 0 && successRateData){
            const {current_data, last_day_data} = successRateData;
            let totalDeviceCount = 0;
            let totalActiveDeviceCount = 0;
            let totalDeviceSuccessRate = 0;
            let currentTimeStamp;
            let aggregatedData = activeCompanies.map(function (item) {
                let __item = {...item};
                if(current_data && current_data[__item.id]){
                    __item.current_data = {...current_data[__item.id]};
                    if(__item.current_data.active_device_count){
                        totalActiveDeviceCount += __item.current_data.active_device_count;
                    }
                    if(__item.current_data.total_device_count){
                        totalDeviceCount += __item.current_data.total_device_count;
                    }
                    if(!currentTimeStamp){
                        currentTimeStamp = __item.current_data.TimeStamp;
                    }
                }
                if(last_day_data && last_day_data[__item.id]){
                    __item.last_day_data = {...last_day_data[__item.id]};
                }
                return __item;
            });
            totalDeviceSuccessRate = round(((totalActiveDeviceCount / totalDeviceCount) * 100), 0);
            setState({
                aggregatedData: aggregatedData,
                totalDeviceCount: totalDeviceCount,
                totalActiveDeviceCount: totalActiveDeviceCount,
                totalDeviceSuccessRate: totalDeviceSuccessRate,
                currentTimeStamp: currentTimeStamp,
            });
        }
    }, [activeCompanies, successRateData]);


    React.useEffect(()=>{
        if(data && data.length > 0){
            let _chartData = {
                TotalDeviceCount : {
                    values: []
                },
                TotalActiveCount : {
                    values: []
                },
                SuccessRateCount : {
                    values: []
                },
            };

            let newData = [];
            let _allDateValues = [];
            let dateByGroupTimestamp = groupBy(data, 'TimeStamp');
            let _keys = Object.keys(dateByGroupTimestamp);
            _keys = sortBy(_keys, item => new Date(item));
            // active_device_count
            // total_device_count
            _keys.forEach((keyName)=>{
                _allDateValues.push(new Date(keyName));
                let result =   dateByGroupTimestamp[keyName].reduce((obj, __item) => {
                    obj.active_device_count += __item.active_device_count;
                    obj.total_device_count  += __item.total_device_count;
                    return obj;
                }, {
                    active_device_count: 0,
                    total_device_count: 0,
                    TimeStamp: new Date(keyName),
                });
                result.success_rate = round((result.active_device_count / result.total_device_count) * 100, 0);
                newData.push(result);
            });

            newData.map((dataItem) => {
                _chartData.TotalDeviceCount.values.push({
                    date : dataItem.TimeStamp,
                    value       : dataItem.total_device_count,
                });
                _chartData.TotalActiveCount.values.push({
                    date :  dataItem.TimeStamp,
                    value       :  dataItem.active_device_count,
                });

                _chartData.SuccessRateCount.values.push({
                    date :  dataItem.TimeStamp,
                    value:  dataItem.success_rate,
                });
            });
            setState({
                chartData:  [{ name: 'Deployed', values: _chartData.TotalDeviceCount.values, visible: true}, { name: 'Active', values: _chartData.TotalActiveCount.values, visible: true}, { name: 'Success Rate', values: _chartData.SuccessRateCount.values}],
                allDateValues: _allDateValues,
            });
        }
    }, [data]);


    React.useEffect(() => {
        try {
            if(selectedDateRange && selectedDateRange.start && selectedDateRange.end && companyId){
                handleDataUpdate();
                let params = {...selectedDateRange};
                window.localStorage.setItem('selectedDateRange', JSON.stringify(params));
            }
        } catch (err) {
            console.log(err);
        }
    }, [companyId, selectedDateRange]);



    function handleDataUpdate() {
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

            let sub = fetchLatestData({
                startTime : selectedDateRange.start,
                endTime   : selectedDateRange.end,
                companyId : companyId,
            }).subscribe((data = []) => {
                setState( {
                        data: sortBy(data, 'TimeStamp'),
                });
            });
            subscriptionRef.current.push(sub);
        });
        subscriptionRef.current.push(newSub);
    }


    const setDateSelection = React.useCallback(function setDateSelection({start, end}) {
        setState({
            selectedDateRange: {start, end}
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
                });
            } else {
                enqueueSnackbar('Invalid date selection', {variant: 'error'})
            }
        }
    }

    const refreshLatestData = React.useCallback(function refreshData(queryName, params) {
        let observable$ = new Observable( ( observer ) => {
            return new AxiosSubscriber( observer, '/device_success_rate/', params);
        });

        return observable$.pipe(map(result => {
            if (result && Array.isArray(result.data)) {
                let allData = result.data.map(item => {
                    item.TimeStamp = new Date(item.TimeStamp);
                    if(item.active_device_count){
                        item.active_device_count =  parseInt(item.active_device_count.toString());
                    }
                    if(item.total_device_count){
                        item.total_device_count =  parseInt(item.total_device_count.toString());
                    }
                    item.device_success_rate =  roundNumber((item.active_device_count / item.total_device_count) * 100, 0);
                    return item;
                });
               // let dataByGroup = keyBy(allData, 'company_id');
                //console.log('allData', allData);
                return allData;
            } else {
                return [];
            }
        }));
    }, []);


    const fetchLatestData = React.useCallback(function fetchEventData({ startTime,
                                                                       endTime,
                                                                       companyId}) {
         console.log('startTime, endTime',   startTime, endTime, companyId);
        let queryName = 'find';
        return refreshLatestData(queryName, {
            startTime,
            endTime,
            company_id: companyId,
        });
    }, [refreshLatestData]);


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
                        }
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
                        }
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
                        }
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
                        }
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
        containerType,
        idParam,
        setDateSelection,
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
        allSites,
        chartData,
        activeCompanies,
        aggregatedData,
        totalDeviceCount,
        totalActiveDeviceCount,
        totalDeviceSuccessRate,
        currentTimeStamp,
        companyId, companyData
    };
}


const CompanySuccessRateChart = React.memo(function CompanySuccessRateChart({match, history}) {

    const classes = useStyles();
    const {
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
        containerType,
        idParam,
        setDateSelection,
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
        allSites,
        chartData,
        activeCompanies,
        aggregatedData,
        totalDeviceCount,
        totalActiveDeviceCount,
        totalDeviceSuccessRate,
        currentTimeStamp,
        companyId, companyData
    } = useCompanySuccessRate({match, history});

    return (<Paper className={classes.paper}>
            <CompanySuccessRateChartContext.Provider value={{
                selectedDateRange: {...selectedDateRange},
                setDateSelection: setDateSelection,
            }}>
                <Grid container spacing={1} className={classes.Container}>
                    <Grid item xs={12} className={classes.toolbar}>
                        <Toolbar
                            className={classnames(classes.root)}>
                            {isLoading && (
                                <Typography className={classes.title}>
                                    <span>Loading data <TinySpinner/></span>
                                </Typography>
                            )}
                            <React.Fragment>
                                <Typography className={classnames(classes.title, classes.heading)}>
                                    {companyData && companyData.name } &nbsp;
                                </Typography>

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
                                        inputProps={{
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
                            </React.Fragment>
                        </Toolbar>
                    </Grid>
                    <Grid item xs={12} className={classes.chartContainer}>
                    {chartData  && (
                            <ParentSize>
                                {parent => (
                                    <SimpleLineChart width={parent.width}
                                                     height={parent.height}
                                                     title="Success Rate"
                                                     orient={"top"}
                                                     allDateValues={allDateValues}
                                                     parentTop={parent.top}
                                                     parentLeft={parent.left}
                                                     parentRef={parent.ref}
                                                     resizeParent={parent.resize} hideSlider={true}
                                                     data={chartData}/>
                                    )}
                            </ParentSize>
                    )}
                    </Grid>
                </Grid>
            </CompanySuccessRateChartContext.Provider>
        </Paper>
    )
});


export default withRouter(CompanySuccessRateChart);