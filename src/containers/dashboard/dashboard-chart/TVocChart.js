import React, {useEffect, useLayoutEffect, useReducer, useRef} from 'react';
import './_d3chartNew.scss';
import * as d3 from "d3";
import * as classnames from "classnames";
import {
    format,
    subDays,
    isWithinInterval,
    addMinutes,
    addHours,
    differenceInHours,
    differenceInCalendarDays, differenceInCalendarMonths
} from "date-fns";
import {FormLabel, Grid, Input, Paper, Switch} from "@material-ui/core";
import withStyles from "@material-ui/core/styles/withStyles";
import DateFnsUtils from "@date-io/date-fns";
import {roundNumber} from "../../../helpers/CommonHelper";
import Chart from "../../../components/Charts/MyChart/Chart";
import LineSeries from '../../../components/Charts/MyChart/LineSeries';
import Axis from "../../../components/Charts/MyChart/Axis";
import RangeSlider from "../../../components/Charts/MyChart/RangeSlider";
import MouseTracker from "../../../components/Charts/MyChart/MouseTracker";
import Bars from "../../../components/Charts/MyChart/Bars";
import WindBar from '../../../components/Charts/MyChart/WindBar';
import {Tooltip, TooltipWithBounds} from "@vx/tooltip";
import {WindroseColorScale, WindDirectionsWeight} from "../../../components/Charts/MyChart/WindroseScale";
import {Observable, from, queueScheduler, of} from 'rxjs';
import {debounceTime} from 'rxjs/operators';
import Divider from "@material-ui/core/Divider";
import NavigationIcon from '@material-ui/icons/Navigation';
import Circles from "../../../components/Charts/MyChart/Circles";
import {isNil} from "lodash";
import {ChartControllerContext} from "./LatestChart";

const dateFns = new DateFnsUtils();

const colorScale = WindroseColorScale;
//d3.scaleOrdinal(d3.schemeCategory10);


const styles = theme => ({
    paper: {
        width: 'calc(100%)',
        height: 'calc(100%)',
        display: 'flex',
        padding: '10px',
        flexDirection: 'column',
        //  margin: theme.spacing.unit * 1,
        position: 'relative',
        //  border:  '1px solid  red',
        color: theme.palette.text.secondary,
        backgroundColor: theme.palette.background.paper,
        boxShadow: 'none',
    },
    chart: {
        height: 'calc(100%)',
        width:  'calc(100%)'

    },
    Timeline: {
        display: 'block',
        position: 'relative',
        height: 'calc(100%)',
        width: 'calc(100%)',
    },
    batteryGraphContainer: {
        // height: '400px'
    },
    slider: {
        position: 'relative',
        width: '100%',
    },
    chartBox: {
        fillColor: theme.palette.canaryBlack.dark,
    },
    axisText: {
        fontSize: '16px',
    },
    mouseTracker: {
        backgroundColor: 'none',
    },
    brushArea: {
        fillColor: theme.palette.canaryBlack.light
    },
    tooltipItem: {
        display: 'flex',
        padding: '2px',
        flexGrow: 1,
        flexWrap: 'wrap',
        justifyContent: 'space-around'
    },
    tooltipInnerItem:{
        flex:  1,
        textAlign:'left',
        marginLeft:'3px'
    },
    legendBox: {
        height: '10px',
        width: '10px',
        display: 'inline-block',
        content: ' ',
        alignSelf: 'left',
        justifySelf: 'left'
    },
    windBarTooltips: {
        fill: '#305780',
    }
});


function chartReducer(currentState, newState) {
    return {...currentState, ...newState};

}

const TVocChart = React.memo(function TVocChart({data, classes, width, height, sensorName, title, windSpeedData, setParentState, allDateValues, containerType}) {

    const ref = React.useRef();
    const subscriptionRef = React.useRef();
    var margin = {top: 5, right: 20, bottom: 80, left: 70},
        margin2 = {top: 430, right: 10, bottom: 10, left: 10};
    let passedSettings = {
        marginTop: margin.top,
        marginBottom: margin.bottom,
        marginLeft: margin.left,
        marginRight: margin.right,
    };
    passedSettings.width = width - margin.left - margin.right;
    passedSettings.boundedWidth = passedSettings.width - margin.left - margin.right;
    passedSettings.height = height - margin.top - margin.bottom;
    passedSettings.boundedHeight = passedSettings.height - margin.top - margin.bottom;

    const yAccessor = d => +d.value;
    const yAccessor2 = d => +d.value;
    const xAccessor = d => d.date;
    const widthAccessor = d => 10;

    const today = new Date();
    const fourDaysAgo = subDays(today, 4);
    const oneWeekAgo = subDays(today, 7);

    const {selectedDateRange,  DateRanges, setDateSelection, daysMode, sensorNames, axisMode, toggleAxisMode, primarySensor} = React.useContext(ChartControllerContext);

    const [{
        showTooltip, tooltipKeys, tooltipLeft, tooltipTop, dimensions, originalWindBins, min, max, selected, updated, xScale, xScale2,
        yScale, chartData, originalData, hoveredDate, hoveredValueState, yScale2, windData, windBins, hoveredDateString, legendData, showTooltipCircle, hoveredValueDetails
    }, setState] = useReducer(chartReducer, {
        xScale: undefined,
        xScale2: undefined,
        yScale: undefined,
        yScale2: undefined,
        chartData: undefined,
        originalData: undefined,
        windData: undefined,
        windBins: undefined,
        hoveredDate: undefined,
        showTooltip: false,
        showTooltipCircle: false,
        tooltipTop: 0,
        tooltipLeft: 0,
        originalWindBins: {},
        hoveredValueState: {},
        hoveredDateString: undefined,
        hoveredValueDetails: {},
        legendData: [],
        tooltipKeys: [],
        dimensions: passedSettings,
        min: oneWeekAgo, max: today,
        selected: [fourDaysAgo, today],
        updated: fourDaysAgo,
    });



    function calculateDimensions() {

        let margin = {top: 10, right: 5, bottom: 35, left: 70},
            margin2 = {top: 430, right: 10, bottom: 10, left: 10};

        const passedSettings = {
            marginTop: margin.top,
            marginBottom: margin.bottom,
            marginLeft: margin.left,
            marginRight: margin.right,
        };
        passedSettings.width = width - margin.left - margin.right;
        passedSettings.boundedWidth = passedSettings.width - margin.left;
        passedSettings.height = height - margin.top - margin.bottom;
        passedSettings.boundedHeight = passedSettings.height - margin.top - margin.bottom;
        setState({dimensions: passedSettings});
    }




    useEffect(() => {
        subscriptionRef.current = [];
        return () => {
            if (subscriptionRef && subscriptionRef.current) {
                subscriptionRef.current.map(item => item && item.unsubscribe());
                subscriptionRef.current = [];
            }
        }
    }, []);

    useLayoutEffect(() => {
        if (ref.current) {
            if (subscriptionRef && subscriptionRef.current) {
                subscriptionRef.current.push(of(true).pipe(debounceTime(20)).subscribe(() => {
                    calculateDimensions();
                }));
            }
        }
    }, [width, height]);

    useEffect(() => {
        if (subscriptionRef && subscriptionRef.current) {
            subscriptionRef.current.map(item => item && item.unsubscribe());
            subscriptionRef.current = [];
            subscriptionRef.current.push(of(true).pipe(debounceTime(200)).subscribe(() => {
                renderChart();
            }));
        }
    }, [data, axisMode,  daysMode, dimensions, primarySensor]);

    useEffect(() => {
        if(data){
           setState({
               tooltipKeys: data.map(item=> item.name)
           });
        }
    }, [data]);

    useEffect(() => {
        if (selectedDateRange) {
            handleSelectedDateRange();
        }
    }, [selectedDateRange]);


    useEffect(()=>{
        if(hoveredValueDetails){
            setParentState({
                globalHoveredValueDetails: hoveredValueDetails
            });
           // console.log('hoveredValueDetails', hoveredValueDetails);
            return ()=>  setParentState({
                globalHoveredValueDetails: {}
            });
        } else {
            setParentState({
                globalHoveredValueDetails: {}
            });
        }

    },[hoveredValueDetails]);

    function renderChart() {

        if (selectedDateRange && sensorName && data) {
            if(dimensions && dimensions.boundedWidth > 0) {
                let dimensionsNew = dimensions;
                let sensorInstance = sensorNames.find(item => item.name === sensorName);
                let timeRange = [selectedDateRange.start, selectedDateRange.end];
                let x2timeRange = [d3.timeMinute.floor(selectedDateRange.start), d3.timeMinute.ceil(addHours(new Date(selectedDateRange.end), 1))];
                let _xScale, _xScale2, _yScale, _yScale2;

                _xScale = d3.scaleTime().domain([
                    ...timeRange
                ]).rangeRound([0, dimensionsNew.boundedWidth]).nice();

                _xScale2 = d3.scaleTime().domain([
                    ...x2timeRange
                ]).range([0, dimensionsNew.boundedWidth - 100]).nice();

                _yScale = d3.scaleLinear().rangeRound([dimensionsNew.boundedHeight, 0]).nice();
                _yScale2 = d3.scaleLinear().rangeRound([dimensionsNew.boundedHeight, 0]).nice();

                let newData = data.map((item) => {
                    let newItem = {name: item.name, keyName: item.keyName, CoreId: item.CoreId};
                    newItem.values = item.values.map((__item) => {
                        return {
                            ...__item,
                            value: sensorName ? roundNumber(__item.meta[sensorName], 4) : __item.value,
                            WindDirection: roundNumber(__item.meta.WindDirection, 2),
                            valueMap: __item.date && item.valueMap[new Date(__item.date).toISOString()],
                        }
                    });
                    newItem.visible = true;
                    return newItem;
                });

                if (newData.length > 0) {
                    if (selectedDateRange) {
                        const {start, end} = selectedDateRange;
                        timeRange = [start, end];
                    }
                    _xScale.domain([
                        ...timeRange
                    ]);

                    if (dimensionsNew.boundedWidth > 0) {
                        _xScale2.domain([
                            ...x2timeRange
                        ]);
                    }

                    if (sensorInstance && axisMode === 'static' && sensorInstance.yRange && Array.isArray(sensorInstance.yRange)
                        && sensorInstance.yRange.length > 0) {
                        _yScale.domain([
                            ...sensorInstance.yRange
                        ]);
                    } else {
                        _yScale.domain([
                            d3.min(newData, co => d3.min(co.values, yAccessor)),
                            d3.max(newData, co => d3.max(co.values, yAccessor))
                        ]);
                    }

                    if (axisMode === 'static') {
                        _yScale2.domain([0, 20]);
                    } else {
                        _yScale2.domain([
                            d3.min(windSpeedData, yAccessor2),
                            d3.max(windSpeedData, yAccessor2)
                        ]);
                    }

                    let binsGenerator;
                    const {start, end} = selectedDateRange;
                    let diffInHour = differenceInHours(end, start);
                    let diffInDay = differenceInCalendarDays(end, start);
                    if (diffInHour <= 1) {
                        binsGenerator = d3.histogram()
                            .domain(_xScale.domain())
                            .value(function (d) {
                                return d.date;
                            })
                            .thresholds(_xScale.ticks(d3.timeMinute.every(15)));
                    } else if (diffInHour <= 4) {
                        binsGenerator = d3.histogram()
                            .domain(_xScale.domain())
                            .value(function (d) {
                                return d.date;
                            })
                            .thresholds(_xScale.ticks(d3.timeMinute.every(30)));
                    } else if (diffInDay <= 1) {
                        binsGenerator = d3.histogram()
                            .domain(_xScale.domain())
                            .value(function (d) {
                                return d.date;
                            })
                            .thresholds(_xScale.ticks(d3.timeHour.every(2)));
                    } else if (diffInDay <= 4) {
                        binsGenerator = d3.histogram()
                            .domain(_xScale.domain())
                            .value(function (d) {
                                return d.date;
                            }).thresholds(_xScale.ticks(d3.timeHour.every(6)));
                    } else if (diffInDay <= 7) {
                        binsGenerator = d3.histogram()
                            .domain(_xScale.domain())
                            .value(function (d) {
                                return d.date;
                            })
                            .thresholds(_xScale.ticks(d3.timeHour.every(12)));

                    } else if (diffInDay <= 30) {
                        binsGenerator = d3.histogram()
                            .domain(_xScale.domain())
                            .value(function (d) {
                                return d.date;
                            })
                            .thresholds(_xScale.ticks(d3.timeDay.every(1)));
                    } else if (diffInDay <= 60) {
                        binsGenerator = d3.histogram()
                            .domain(_xScale.domain())
                            .value(function (d) {
                                return d.date;
                            })
                            .thresholds(_xScale.ticks(d3.timeDay.every(2)));
                    } else {
                        binsGenerator = d3.histogram()
                            .domain(_xScale.domain())
                            .value(function (d) {
                                return d.date;
                            })
                            .thresholds(_xScale.ticks(d3.timeDay.every(7)));
                    }

                    const bins = binsGenerator(windSpeedData);
                    setState({
                        xScale: _xScale,
                        xScale2: _xScale2,
                        yScale: _yScale,
                        selectedSensor: sensorName,
                        yScale2: _yScale2,
                        //  windData:windSpeedData,
                        windBins: bins,
                        chartData: newData,
                        //  originalData: newData,
                        legendData: newData.map(item => {
                            return {name: item && item.name}
                        })
                    });
                } else {

                    setState({
                        xScale: _xScale,
                        xScale2: _xScale2,
                        yScale: _yScale,
                        //selectedSensor: sensorName,
                        yScale2: _yScale2,
                        //  windData:windSpeedData,
                        windBins: [],
                        chartData: newData,
                        //  originalData: newData,
                        legendData: newData.map(item => {
                            return {name: item.name}
                        })
                    });
                }
            }
        } else {
            setState({
                //  windData:windSpeedData,
                chartData: [],
                windBins: [],
                //  originalData: newData,
                legendData: []
            });
        }
    }

    function handleSelectedDateRange() {
        const {start, end} = selectedDateRange;
        if (start && end && xScale && data) {
            const _scale = xScale.copy();
            _scale.domain([start, end]);
            setState({
                //  chartData: newChartData,
                xScale: _scale,
                //  windBins: [...bins],
            });
        }
    }


    const formatDate = d3.timeFormat("%-b %-d")

    return (
        <Paper className={classnames(classes.paper, 'chart-container')} ref={ref}>
            {xScale && dimensions && (
                <Chart dimensions={dimensions} style={{'border': '1px solid  green'}}>
                    <defs>
                        <clipPath id="clip">
                            <rect width={dimensions.boundedWidth} height={dimensions.boundedHeight}>
                            </rect>
                        </clipPath>

                    </defs>
                    <Axis dimension="x"
                          dimensions={dimensions}
                          scale={xScale}
                          formatTick={formatDate}
                    />
                    <Axis
                        unitName={'ppm'}
                        dimension="y"
                        dimensions={dimensions}
                        scale={yScale}
                    />
                    {yScale2 && (
                        <React.Fragment>
                            <Axis unitName={'mph'} dimension='yRight' dimensions={dimensions} scale={yScale2}></Axis>
                            {title && (
                                <g x="0" y="0" transform={`translate(10, -7)`}>
                                    <text fontSize="14px"> {title} </text>
                                </g>
                            )}
                            <Bars dimensions={dimensions} data={windBins} xScale={xScale}
                                  yScale={yScale2} widthAccessor={widthAccessor} xAccessor={xAccessor}
                                  yAccessor={yAccessor2}>
                            </Bars>
                            <WindBar dimensions={dimensions} colorScale={colorScale} data={windBins} xScale={xScale}
                                     yScale={yScale2} widthAccessor={widthAccessor} xAccessor={xAccessor}
                                     yAccessor={yAccessor2}>
                            </WindBar>
                        </React.Fragment>
                    )}
                    <LineSeries
                        colorScale={colorScale}
                        data={chartData}
                        xScale={xScale}
                        yScale={yScale}
                        xAccessor={xAccessor}
                        yAccessor={yAccessor}
                    />
                    {showTooltipCircle  && daysMode !== 'all' && (
                        <Circles  data={chartData}
                                  selectedDate={hoveredDateString}
                                  xScale={xScale}
                                  colorScale={colorScale}
                                  yScale={yScale} xAccessor={xAccessor}
                                  yAccessor={yAccessor} />
                    )}
                    <MouseTracker setState={setState}
                                         data={chartData}
                                         additionalData={{name: 'WindSpeed', values: windBins, scale: yScale2}}
                                         xScale={xScale}
                                         yScale={yScale}
                                         dimensions={dimensions}
                                         allDateValues={allDateValues}
                                         containerType={containerType}
                                         chartRef={ref}
                                         isTvocChart={true}
                                         xAccessor={xAccessor}
                                         yAccessor={yAccessor}/>
                    {/*{xScale2 && (
                        <RangeSlider setDateSelection={setDateSelection}
                                     toggleAxisMode={toggleAxisMode}
                                     axisMode={axisMode}
                                     daysMode={daysMode}
                                     selectedDateRange={selectedDateRange} dimensions={dimensions} scale={xScale2}/>
                    )}*/}
                </Chart>
            )}
            {showTooltip && (
                <Tooltip key={Math.random()} style={{backgroundColor: '#3a464f', color: 'white', fontSize: ".7rem"}}
                         left={tooltipLeft + 'px'} top={tooltipTop + 'px'}>
                    {hoveredValueState && (
                        <React.Fragment>
                            <div style={{fontSize: ".6rem", textAlign: 'left', marginLeft: '30px'}}>{hoveredDate} </div>
                            {tooltipKeys.map((itemKey, index) => (
                                <React.Fragment key={'frag_'+ index}>
                                {hoveredValueState[itemKey] && hoveredValueState[itemKey].val && (
                                    <div key={index} className={classes.tooltipItem}>
                                        <div className={classes.legendBox}
                                             style={{backgroundColor: colorScale(itemKey)}}></div>
                                        <div style={{ width: containerType && containerType === 'sites' && '180px' }} className={classes.tooltipInnerItem}>{ hoveredValueState[itemKey].label}:</div>
                                        <div  className={classes.tooltipInnerItem}><strong>{hoveredValueState[itemKey].val}</strong></div>
                                    </div>
                                    )}
                                </React.Fragment>
                            ))}
                            <Divider/>
                            {hoveredValueState && hoveredValueState['Speed'] && !isNil(hoveredValueState['Speed'].val)
                          &&  ( <React.Fragment>
                            <div key="Speed" className={classes.tooltipItem}>
                                <div className={classes.legendBox}
                                     style={{backgroundColor: '#305780'}}></div>
                                <div className={classes.tooltipInnerItem}>Speed:</div>
                                <div   className={classes.tooltipInnerItem}><strong>{ hoveredValueState['Speed'].val}</strong></div>
                            </div>
                            </React.Fragment>
                            )}
                            {hoveredValueState && hoveredValueState['Direction'] && !isNil(hoveredValueState['Direction'].val) && (
                            <React.Fragment>
                            <div key="Direction" className={classes.tooltipItem}>
                                <div className={classes.legendBox}
                                     style={{backgroundColor: 'white'}}></div>
                                <div style={{paddingLeft: '3px'}} className={classes.tooltipInnerItem}>Direction:</div>
                                <div  className={classes.tooltipInnerItem}>
                                       <NavigationIcon fontSize='small' size='small'
                                        style={{'transform': `rotate(${hoveredValueState['Direction'].val}deg)`}}/>
                                </div>
                            </div>
                            </React.Fragment>
                            )}
                        </React.Fragment>
                    )}
                </Tooltip>
            )}
        </Paper>
    )

});

export default withStyles(styles)(TVocChart);
