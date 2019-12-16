import React, { useContext} from 'react';
import {Grid, Paper} from '@material-ui/core';
import {withRouter} from 'react-router';
import CanaryLineChart from './CanaryLineChart';
import TVocChart from './TVocChart';
import Toolbar from '@material-ui/core/Toolbar';
import Typography from '@material-ui/core/Typography';
import classnames from 'classnames';
import {Button, IconButton} from '@material-ui/core';
import TinySpinner from '../../../components/TinySpinner';
import ExportIcon from '../../../components/icons/ExportIcon';
import {ParentSize} from '@vx/responsive';
import DateFnsUtils from '@date-io/date-fns';
import DateRangeIcon from '@material-ui/icons/DateRange';
import SkipNextIcon from '@material-ui/icons/SkipNext';
import SkipPreviousIcon from '@material-ui/icons/SkipPrevious';
import ArrowRightIcon from '@material-ui/icons/ArrowRight';
import ArrowLeftIcon from '@material-ui/icons/ArrowLeft';
import NativeSelect from '@material-ui/core/NativeSelect';
import {KeyboardDateTimePicker, MuiPickersUtilsProvider} from '@material-ui/pickers';
import InputAdornment from '@material-ui/core/InputAdornment';
import Checkbox from '@material-ui/core/Checkbox';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import {UserDetailsContext} from '../../auth/AuthProvider';
import GoogleMapChartComponent from '../../../components/googlemaps/GoogleMapChartComponent';
import {sensorNames, sensorOptions} from './ChartHeaders';
import makeStyles from "@material-ui/core/styles/makeStyles";
import { toUpper, upperCase} from "lodash/string";
import WindRoseChart from "./WindRoseChart";
import NotFound_404 from "../../../components/notfound/NotFound_404";
import {DateRanges, useDashBoardChartController} from "./useDashBoardChartController";

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
    noOverflowContainer: {
        overflow: 'hidden',
        flexDirection: 'row',
        margin: '0px'
    },
    overflowContainer: {
        overflow: 'auto',
        flexDirection: 'row',
        margin: '0px',
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
    parantSize: {
        marginTop: '5px',
        width: '100%',
        height: '100%',
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
        width: 'calc(100%)',
    },
    toolbarAddButton: {
        padding: 0,
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
        backgroundColor: theme.palette.primary.main,
    },
    smallButton: {
        minWidth: '30px',
        padding: 0,
    },
    datePickerDialogue: {
        color: 'inherit',
        '& .MuiDialogActions-root': {
            '& button': {
                color: 'inherit',
            },
        },
    },
}));


export const ChartControllerContext = React.createContext({
    sensorNames: [],
    selectedDateRange: undefined,
    hoveredValueDetails: {},
    axisMode: 'static',
    daysMode: undefined,
    DateRanges: [],
    primarySensor: undefined,
    setDateSelection: () => {
    },
    toggleAxisMode: () => {
    },
    selectedCurve: 'curveMonotoneX',
});



const LatestChart = React.memo(function LatestChart({match, history}) {

    const classes = useStyles();
    const {
        value, weekRanges, setState, setStartDate, setEndDate,
        isCsvImporting, decreaseSelectedDateRange,
        decreaseSelectedStart, inscreaseSelectedEnd, increaseSelectedDateRange,
        minAllowedStartDate, onTimeframeSelect, daysMode, idParam, exportToCsv,
        containerType, setDateSelection, toggleAxisMode, title, siteData, data,
        showScaleButton, combinedAvgData, isLoading, windSpeedData, selectedDateRange,
        axisMode, selectedCurve, deviceDataStore,
        globalHoveredValueDetails, allDateValues,
        onPrimarySensorSelect,
        primarySensor,
        primarySensorName,
        fieldNames,
        resourceNotFound,
    } = useDashBoardChartController({
        match,
        history,
    });
    const {user_data} = useContext(UserDetailsContext);

    if (!idParam || !containerType) {
        return null;
    }

    if(resourceNotFound === true){
        return  (<NotFound_404/>)
    }
    return (<Paper className={classes.paper}>
        <ChartControllerContext.Provider value={{
            sensorNames: sensorNames,
            axisMode: axisMode,
            DateRanges: DateRanges,
            selectedDateRange,
            primarySensor: primarySensor,
            setDateSelection: setDateSelection,
            toggleAxisMode: toggleAxisMode,
            daysMode,
            selectedCurve: selectedCurve,
        }}>
            <Grid container className={classes.Container + ' ' + classes.noOverflowContainer + ' MuiPaper-root'}>
                <Grid item xs={12} className={classes.toolbar}>
                    <Toolbar
                        className={classnames(classes.root)}>
                        <React.Fragment>
                            <Typography className={classnames(classes.title, classes.heading)}>
                                {title} &nbsp;
                            </Typography>

                            <Button type='button' title='Set start/end date backward' className={classes.smallButton}
                                    size={'small'}
                                    onClick={decreaseSelectedDateRange}>
                                <SkipPreviousIcon/>
                            </Button>
                            <Button type='button' title='Set start date backward' className={classes.smallButton}
                                    size={'small'}
                                    onClick={decreaseSelectedStart}>
                                <ArrowLeftIcon/>
                            </Button>
                            <Button type='button' title='Set end date forward' className={classes.smallButton}
                                    size={'small'}
                                    onClick={inscreaseSelectedEnd}>
                                <ArrowRightIcon/>
                            </Button>
                            <Button type='button' title='Set start/end date forward' className={classes.smallButton}
                                    size={'small'}
                                    onClick={increaseSelectedDateRange}>
                                <SkipNextIcon/>
                            </Button>

                            <MuiPickersUtilsProvider utils={DateFnsUtils}>
                                <KeyboardDateTimePicker
                                    variant="outline"
                                    ampm={true}
                                    style={{'marginLeft': '5px', width: '230px'}}
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
                                                        height: '.9rem',
                                                    }}/>
                                                </IconButton>
                                            </InputAdornment>
                                        ),
                                    }}
                                />
                                <KeyboardDateTimePicker
                                    style={{'marginLeft': '5px', width: '230px'}}
                                    variant="outline"
                                    ampm={true}
                                    DialogProps={{className: classes.datePickerDialogue}}
                                    className={classes.datePicker}
                                    autoOk={true}
                                    minDate={selectedDateRange.start}
                                    maxDate={new Date()}
                                    // label="Date from"
                                    InputProps={{
                                        inputlabelprops: {
                                            labelPlacement: 'start',
                                        },
                                    }}
                                    value={selectedDateRange.end}
                                    onChange={setEndDate}
                                    onError={console.log}
                                    format={dateFns.dateTime12hFormat}
                                    showTodayButton
                                />

                            </MuiPickersUtilsProvider>

                            <NativeSelect style={{marginLeft: '5px'}} onChange={onPrimarySensorSelect}
                                          value={primarySensor}>
                                <option value=''>Sensor</option>
                                {sensorOptions && sensorOptions.map((item, i) => (
                                    <option key={'option-' + i} value={item.name}>{item.label}</option>
                                ))}
                            </NativeSelect>
                            <NativeSelect style={{marginLeft: '5px'}} onChange={onTimeframeSelect}
                                          value={daysMode}>
                                <option value='all'>Minute</option>
                                <option value='hourly'>Hourly</option>
                                <option value='daily'>Daily</option>
                            </NativeSelect>
                            <FormControlLabel
                                control={<Checkbox checked={axisMode === 'dynamic'}
                                                   onChange={toggleAxisMode}/>}
                                label="^^Auto Scale"
                                labelPlacement="start"
                            />
                            <Button size="small" className={classes.exportButton} aria-label={'Export data'}
                                    align={'right'}
                                    onClick={exportToCsv}>
                                {isCsvImporting === true ? (
                                    <TinySpinner>...</TinySpinner>
                                ) : (<ExportIcon fontSize="small"/>)}
                            </Button>
                            {isLoading && (
                                   <TinySpinner/>
                            )}
                        </React.Fragment>
                    </Toolbar>
                </Grid>
                <Grid container spacing={1}
                      className={classes.Container + ' ' + classes.overflowContainer + ' MuiPaper-root'}>
                    <div style={{height: 'calc(100%)', width: '100%'}}>
                        <Grid item xs={12} className={classes.chartContainer} style={{height: '50%'}}>
                            {(
                                <ParentSize className={classes.parantSize}>
                                    {parent => (
                                        <TVocChart
                                            width={parent.width}
                                            height={parent.height}
                                            parentTop={parent.top}
                                            parentLeft={parent.left}
                                            parentRef={parent.ref}
                                            resizeParent={parent.resize}
                                            setParentState={setState}
                                            allDateValues={allDateValues}
                                            containerType={containerType}
                                            sensorName={primarySensor}
                                            title={`${upperCase(toUpper(primarySensor))} and Wind Speed`}
                                            data={data}
                                            windSpeedData={windSpeedData}/>
                                    )}
                                </ParentSize>
                            )}
                        </Grid>
                        {user_data && user_data.groupName === 'ADMIN' && (
                            <Grid container className={classes.chartContainerBottom}
                                  style={{height: '40%', marginTop: '10px'}}>
                                <Grid item xs={6}>
                                    {combinedAvgData && (
                                        <ParentSize>
                                            {parent => (
                                                <CanaryLineChart width={parent.width}
                                                                 height={parent.height}
                                                                 title="Temperature and Humidity"
                                                                 orient={'top'}
                                                                 isHumidityChart="true"
                                                                 allDateValues={allDateValues}
                                                                 parentTop={parent.top}
                                                                 parentLeft={parent.left}
                                                                 parentRef={parent.ref}
                                                                 resizeParent={parent.resize} hideSlider={true}
                                                                 data={combinedAvgData}/>
                                            )}
                                        </ParentSize>
                                    )}
                                </Grid>
                                <Grid item xs={6}>
                                    {data && (
                                        <ParentSize>
                                            {parent => (
                                                <CanaryLineChart
                                                    width={parent.width}
                                                    height={parent.height}
                                                    title="Battery"
                                                    orient={'top'}
                                                    parentTop={parent.top}
                                                    parentLeft={parent.left}
                                                    parentRef={parent.ref}
                                                    allDateValues={allDateValues}
                                                    resizeParent={parent.resize}
                                                    hideSlider={true} sensorName={'Battery'} data={data}/>
                                            )}
                                        </ParentSize>
                                    )}
                                </Grid>
                            </Grid>
                        )}

                        {user_data && user_data.groupName !== 'ADMIN' && deviceDataStore && siteData && (
                            <Grid container spacing={1} className={classes.chartContainerBottom}
                                  style={{height: '40%', marginTop: '10px'}}>
                                <Grid item xs={12}>
                                    <GoogleMapChartComponent
                                        fieldNames={fieldNames}
                                        initialMapMode={'auto'} deviceData={deviceDataStore}
                                        primarySensorName={primarySensorName}
                                        hoveredValueDetails={globalHoveredValueDetails}
                                        defaultPosition={{...siteData.site_map}}
                                    ></GoogleMapChartComponent>
                                </Grid>
                            </Grid>
                        )}
                    </div>
                    {windSpeedData && (
                        <div style={{height: 'calc(100%)', width: '100%'}}>
                            <Grid container className={classes.chartContainerBottom} style={{height: '100%'}}>
                                <Grid item xs={6}>
                                    {data && (
                                        <ParentSize>
                                            {parent => (
                                                <WindRoseChart
                                                    width={parent.width}
                                                    height={parent.height}
                                                    title="Wind Rose"
                                                    orient={'top'}
                                                    parentTop={parent.top}
                                                    parentLeft={parent.left}
                                                    parentRef={parent.ref}
                                                    allDateValues={allDateValues}
                                                    selectedDateRange={selectedDateRange}
                                                    resizeParent={parent.resize}
                                                    windSpeedData={windSpeedData}
                                                />
                                            )}
                                        </ParentSize>
                                    )}
                                </Grid>
                            </Grid>
                        </div>
                    )}
                </Grid>
            </Grid>
        </ChartControllerContext.Provider>
    </Paper>);

});

export default withRouter(LatestChart);
