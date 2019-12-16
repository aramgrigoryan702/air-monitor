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
import {CollectionDataContext} from "../../../components/collection/CollectionDataProvider";
import {useSnackbar} from "notistack";
// eslint-disable-next-line import/no-webpack-loader-syntax
import WebWorker from "../../../WorkerSetup";
// eslint-disable-next-line import/no-webpack-loader-syntax
import globalChartWorker from '../../../workers/global_success_rate.chart.worker.js';
import {authService} from "../../../services/authService";
import {catchError, map, switchMap} from "rxjs/operators";
import {forkJoin, fromEvent, Observable, of, timer} from "rxjs";
import {AxiosSubscriber} from "../../../services/axiosInstance/AxiosSubscriber";
import Toolbar from "@material-ui/core/Toolbar";
import classnames from "classnames";
import Typography from "@material-ui/core/Typography";
import TinySpinner from "../../../components/TinySpinner";
import DateFnsUtils from "@date-io/date-fns";
import {roundNumber} from "../../../helpers/CommonHelper";
import Card from "@material-ui/core/Card";
import CardHeader from "@material-ui/core/CardHeader";
import CardContent from "@material-ui/core/CardContent";
import '../../../styles/_animate_base_container.scss';
import CardActions from "@material-ui/core/CardActions";
import {Link, NavLink} from "react-router-dom";
import GaugeChart from "../../../components/GaugeChart/GaugeChart";

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
        flexGrow: 1,
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
        height: '25px',
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
        paddingTop: '9px',
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


export const GlobalChartControllerContext = React.createContext({
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



function useGlobalSuccessRate({match, history}) {
    const [{value, idParam, isCsvImporting, daysMode, allResult, containerType, allDateValues, weekRanges, title, siteData, data, showScaleButton,
        combinedAvgData, isLoading, windSpeedData, minAllowedStartDate, selectedDateRange, axisMode, selectedCurve, deviceDataStore, globalHoveredValueDetails, allSites, chartData, activeCompanies, successRateData, aggregatedData,
        totalDeviceCount,
        totalActiveDeviceCount,
        totalDeviceSuccessRate, currentTimeStamp}, setState] = useReducer(reducer, {
        value: 0,
        data: [],
        title: '',
        siteData: undefined,
        combinedAvgData: [],
        windSpeedData: [],
        minAllowedStartDate: d3.timeMinute.floor(subMonths(new Date(), 4)),
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
        currentTimeStamp: undefined
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
       if(collections){
           let activeCollections = sortBy(Object.values(collections).filter(item => item && !item.parentID && item.isActive), 'name');
           let _companies = activeCollections.map(item=>{
               return {id: item.id, name: item.name}
           });
           setState({
               activeCompanies: _companies
           });
       }
    }, [collections]);


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



    React.useEffect(() => {
          try {

              handleDataUpdate();
              let newSub= timer((1000 * 120), (1000 * 60)).subscribe(()=>{
                  handleDataUpdate();
              });
              subscriptionRef.current.push(newSub);
                let params = {...selectedDateRange};
                window.localStorage.setItem('selectedDateRange', JSON.stringify(params));
            } catch (err) {
                console.log(err);
            }
    }, []);



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
            let sub = forkJoin(fetchLatestData({}), fetchLast24HrData()).subscribe((data = []) => {
                let [current_hr_data, last_day_data] = data;
                setState({
                    successRateData : {
                        current_data: current_hr_data,
                        last_day_data: last_day_data,
                    },
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
            return new AxiosSubscriber( observer, '/device_success_rate/latest', params);
        });

        return observable$.pipe(map(result => {
            if (result && Array.isArray(result)) {
                let allData = result.map(item => {
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
                let dataByGroup = keyBy(allData, 'company_id');
                //console.log('allData', allData);
                return dataByGroup;
            } else {
                return [];
            }
        }));
    }, []);

    const refreshLast24HrData = React.useCallback(function refreshLast24HrData(queryName, params) {
        let observable$ = new Observable( ( observer ) => {
            return new AxiosSubscriber( observer, '/device_success_rate/24hour_ago', params);
        });

        return observable$.pipe(map(result => {
            if (result && Array.isArray(result)) {
                let allData = result.map(item => {
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
                let dataByGroup = keyBy(allData, 'company_id');
                //console.log('allData', allData);
                return dataByGroup;
            } else {
                return [];
            }
        }));
    }, []);

    const fetchLatestData = React.useCallback(function fetchEventData() {
        // console.log('startTime, endTime',   startTime, endTime);
        let queryName = 'find';
        return refreshLatestData(queryName, {
        });
    }, [refreshLatestData]);

    const fetchLast24HrData = React.useCallback(function fetchEventData() {
        // console.log('startTime, endTime',   startTime, endTime);
        let queryName = 'find';
        return refreshLast24HrData(queryName, {
        });
    }, [refreshLast24HrData]);


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
        currentTimeStamp
    };
}


const GlobalSuccessRateContainer = React.memo(function GlobalSuccessRateContainer({match, history}) {

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
    } = useGlobalSuccessRate({match, history});

    return (<Paper className={classes.paper}>
            <GlobalChartControllerContext.Provider value={{
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
                            <Typography className={classnames(classes.title, classes.heading)}>
                                Device Success Rate &nbsp;
                            </Typography>
                        </Toolbar>
                    </Grid>
                    {aggregatedData && aggregatedData.length > 0 && (
                        <Grid item  xs={12} key='top-card'>
                            <Card className={classes.topCard}>
                                <CardHeader title="Total Number of Devices"
                                            subheader={currentTimeStamp && format(currentTimeStamp, 'M/d - p', {})}
                                />
                                {totalDeviceCount &&  (
                                    <CardContent>
                                        <div>
                                            <GaugeChart color={'#305780'} valueFormatter={(val)=> `${val}%`} minMaxLabelStyle={{display: 'none'}} valueLabelStyle={{fill: 'white', fontSize: '15px'}} topLabelStyle={{ lineHeight: '0px'}}  value={totalDeviceSuccessRate} width={150} height={75} label={''} />
                                        </div>
                                        <Typography>
                                            Total Active Device: {totalActiveDeviceCount}
                                        </Typography>
                                        <Typography>
                                            Total Deployed Device: {totalDeviceCount}
                                        </Typography>
                                        <Typography>
                                            Total Device Success Rate: {totalDeviceSuccessRate}%
                                        </Typography>
                                    </CardContent>
                                )}
                            </Card>
                        </Grid>
                    )}
                        {aggregatedData && aggregatedData.map((dataItem, i) => (
                            <Grid item  xs={3} key={dataItem.id}>
                            <Card className={classes.card}>
                                <CardHeader title={dataItem.name}
                                    subheader={dataItem.current_data && dataItem.current_data.TimeStamp && format(dataItem.current_data.TimeStamp, 'M/d - p', {})}
                                />
                                {dataItem &&  dataItem.current_data && (
                                    <CardContent>
                                        <div>
                                            <GaugeChart color={'#305780'} valueFormatter={(val)=> `${val}%`} minMaxLabelStyle={{display: 'none'}} valueLabelStyle={{fill: 'white', fontSize: '15px'}} topLabelStyle={{ lineHeight: '0px'}}  value={dataItem.current_data.device_success_rate} width={150} height={75} label={''} />
                                        </div>
                                        <Typography>
                                            Active Device: {dataItem.current_data && dataItem.current_data.active_device_count}
                                        </Typography>
                                        <Typography>
                                            Total Device: {dataItem.current_data && dataItem.current_data.total_device_count}
                                        </Typography>
                                        <Typography>
                                            Device Success Rate: {dataItem.current_data && dataItem.current_data.device_success_rate}%
                                        </Typography>
                                        {dataItem.last_day_data && dataItem.last_day_data.device_success_rate  && dataItem.last_day_data.device_success_rate > 0 && (
                                            <Typography>
                                                Success Rate Change: {dataItem.current_data && dataItem.current_data.device_success_rate && (dataItem.current_data.device_success_rate - dataItem.last_day_data.device_success_rate)}%
                                            </Typography>
                                        )}
                                        <CardActions>
                                            <Button component={Link} to={`/dashboard/global/devices/analyze/${dataItem.id}`} size="small">
                                                Detail
                                            </Button>
                                        </CardActions>
                                    </CardContent>
                                )}
                            </Card>
                            </Grid>
                            ))}
                </Grid>
            </GlobalChartControllerContext.Provider>
        </Paper>
    )
});


export default withRouter(GlobalSuccessRateContainer);
