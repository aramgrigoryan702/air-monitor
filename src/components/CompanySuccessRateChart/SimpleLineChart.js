import React, {useEffect, useLayoutEffect, useReducer, useRef} from 'react';
import '../../containers/dashboard/dashboard-chart/_d3chartNew.scss';
import {groupBy, meanBy, cloneDeep, pick, sortBy, keyBy, debounce, isNil} from "lodash";
import * as d3 from "d3";
import * as classnames from "classnames";
import {format, subDays, isWithinInterval, addHours, addMinutes} from "date-fns";
import {FormLabel, Grid, Input, Paper, Switch} from "@material-ui/core";
import withStyles from "@material-ui/core/styles/withStyles";
import DateFnsUtils from "@date-io/date-fns";
import {roundNumber} from "../../helpers/CommonHelper";
import {BehaviorSubject, fromEvent} from 'rxjs';
import {useChartDimensions, useFakeSvgDrag, useUniqueId} from "../../components/Charts/MyChart/utils";
import Chart from "../../components/Charts/MyChart/Chart";
import LineSeries from '../../components/Charts/MyChart/LineSeries';
import Axis from "../../components/Charts/MyChart/Axis";
import Legend from "../../components/Charts/MyChart/Legend";
import Gradient from "../../components/Charts/MyChart/Gradient";
import RangeSlider from "../../components/Charts/MyChart/RangeSlider";
import MouseTracker from "../../components/Charts/MyChart/MouseTracker";
import {Observable, from, queueScheduler, of} from 'rxjs';
import {map, switchMap, concatMap, mergeMap, concatAll, delay, debounceTime} from 'rxjs/operators';
import ReactDOM from 'react-dom';
import {Tooltip} from "@vx/tooltip";
import {green} from "@material-ui/core/colors";
import {WindroseColorScale} from "../../components/Charts/MyChart/WindroseScale";
import {CompanySuccessRateChartContext} from "./CompanySuccessRateChart";
import SimpleLineSeries from "../Charts/MyChart/SimpleLineSeries";
import Circles from "../Charts/MyChart/Circles";

const dateFns = new DateFnsUtils();

const styles = theme => ({
    paper: {
        //  width: '80%',
        //  height: '80%',
        width: '100%',
        height: '100%',
        display: 'flex',
        padding: '10px',
        paddingLeft: 0,
        position: 'relative',
        flexDirection: 'column',
        color: theme.palette.text.secondary,
        backgroundColor: theme.palette.background.paper,
        boxShadow: 'none',
    },
    toggleContainer: {
        margin: theme.spacing(1),
    },
    chart: {
        height: '100%',
        width: '100%'
    },
    Timeline: {
        display: 'block',
        position: 'relative',
        height: '100%',
        width: '100%',
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
    tooltip: {
        fontSize: "12px",
        backgroundColor: theme.palette.secondary.main,
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
    }
});


function chartReducer(currentState, newState) {
    return {...currentState, ...newState};

}

const formatDate = d3.timeFormat("%-b %-d");


function SimpleLineChart({data, classes,isHumidityChart, width, height, sensorName, title, hideSlider, hideLegend, allDateValues}) {

    const yAccessor = d => +d.value;
    const xAccessor = d => d.date;
    const ref = React.useRef();
    const subscriptionRef = React.useRef();

    const {selectedDateRange, setDateSelection, daysMode, sensorNames, axisMode} = React.useContext(CompanySuccessRateChartContext);


    const  colorScale= d3.scaleOrdinal(d3.schemeCategory10);

    //  const [dimensions, setDimensions]=  React.useState(undefined);
    let margin = {top: 10, right: hideLegend ? 20 : 100, bottom: 20, left: 50},
        margin2 = {top: 430, right: hideLegend ? 20 : 100, bottom: 10, left: 50};
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

    const [{selectedSensor, showTooltip, tooltipLeft, tooltipTop, suffix, dimensions, xScale, showTooltipCircle, hoveredDateString, xScale2, yScale, chartData, originalData, hoveredDate, hoveredValueState}, setState] = useReducer(chartReducer, {
        selectedSensor: 'tVOC',
        suffix: undefined,
        xScale: undefined,
        xScale2: undefined,
        yScale: undefined,
        chartData: undefined,
        originalData: undefined,
        hoveredDate: undefined,
        showTooltip: false,
        showTooltipCircle: false,
        tooltipTop: 0,
        tooltipLeft: 0,
        hoveredValueState: {},
        hoveredDateString: undefined,
        dimensions: passedSettings,
    });

    useLayoutEffect(() => {
        if (ref.current) {
            if(subscriptionRef && subscriptionRef.current) {
                 subscriptionRef.current.push(of(500).pipe(debounceTime(500)).subscribe(() => {
                    calculateDimensions();
                }));
            }
        }
    }, [width, height]);


    useEffect(()=>{
        subscriptionRef.current = [];
        return ()=>{
            if(subscriptionRef && subscriptionRef.current){
                subscriptionRef.current.map(item=> item && item.unsubscribe());
                subscriptionRef.current = undefined;
            }

        }
    }, []);

    useLayoutEffect(() => {
        renderChart();
    }, [data, selectedSensor, daysMode, axisMode, dimensions]);


    function calculateDimensions() {
        let margin = {top: 15, right: hideLegend ? 30 : 30, bottom: 20, left: 70},
            margin2 = {top: 430, right: hideLegend ? 30 : 30, bottom: 30, left: 50};

        let passedSettings = {
            marginTop: margin.top,
            marginBottom: margin.bottom,
            marginLeft: margin.left,
            marginRight: margin.right,
        };
        passedSettings.width = width - margin.left - margin.right;
        passedSettings.boundedWidth = width - margin.left - margin.right;
        passedSettings.height = height - margin.top - margin.bottom;
        passedSettings.boundedHeight = passedSettings.height - margin.top - margin.bottom;
        setState({dimensions: passedSettings});
        //renderChart();
    }

    function renderChart() {
        if (selectedDateRange && data && dimensions) {
            let dimensionsNew = dimensions;
            if (data && data.length > 0) {
               let timeRange = [selectedDateRange.start, selectedDateRange.end];
                let  _xScale = d3.scaleTime().domain([
                    ...timeRange
                ]).rangeRound([0, dimensionsNew.boundedWidth]).nice();

                let maxVal =  d3.max(data, co => d3.max(co.values, yAccessor));
                let _yScale;
                _yScale = d3.scaleLinear()
                    .domain([
                        d3.min(data, co => d3.min(co.values, yAccessor)),
                        maxVal+ 10
                    ])
                    .rangeRound([dimensionsNew.boundedHeight, 0]).nice();

                setState({
                    xScale: _xScale,
                    yScale: _yScale,
                    chartData: [...data],
                    originalData: data,
                    legendData: data.map(item => {
                        return {name: item.name}
                    })
                });
            }
        }
    }


    useLayoutEffect(() => {
        if (selectedDateRange) {
            handleSelectedDateRange();
        }
    }, [selectedDateRange]);


    function handleSelectedDateRange() {
        const {start, end} = selectedDateRange;
        if (start && end && xScale) {
            const _scale = xScale.copy();
            _scale.domain([start, end]);
            setState({
                xScale: _scale
            });
        }
    }

    return (<Paper className={classnames(classes.paper, 'chart-container')} ref={ref}>
            {dimensions && dimensions.width && xScale && yScale && (
                <Chart dimensions={dimensions}>
                    <defs>
                        <clipPath id="clip">
                            <rect width={dimensions.boundedWidth} height={dimensions.boundedHeight}>
                            </rect>
                        </clipPath>

                    </defs>
                    <Axis dimension="x"
                          scale={xScale}
                          numberOfTicks={6}
                          formatTick={formatDate}
                          dimensions={dimensions}
                    />
                    <Axis
                        unitName={'count / %'}
                        dimension="y"
                        scale={yScale}
                        dimensions={dimensions}
                    />
                    {title && (
                      <g x="0" y="0" transform={`translate(10, -7)`}>
                          <text fontSize="14px"> {title} </text>
                      </g>
                    )}
                    <SimpleLineSeries
                        colorScale={colorScale}
                        data={chartData}
                        dimensions={dimensions}
                        xScale={xScale}
                        yScale={yScale}
                        xAccessor={xAccessor}
                        yAccessor={yAccessor}
                    />
                   {/* {!hideLegend && (
                        <Legend colorScale={colorScale}
                                orient={"bottom"}
                                alignTo={'xAxis'}
                                dimensions={dimensions}
                                data={chartData} hoveredDate={hoveredDate}
                                hoveredValueState={hoveredValueState}></Legend>
                    )}*/}
                    {showTooltipCircle  && (
                        <Circles  data={chartData}
                                  selectedDate={hoveredDateString}
                                  xScale={xScale}
                                  colorScale={colorScale}
                                  yScale={yScale} xAccessor={xAccessor}
                                  yAccessor={yAccessor} />
                    )}

                    <MouseTracker setState={setState}
                                  data={chartData}
                                  xScale={xScale}
                                  yScale={yScale}
                                  allDateValues={allDateValues}
                                  dimensions={dimensions}
                                  chartRef={ref}
                                  suffix={suffix}
                                  xAccessor={xAccessor}
                                  yAccessor={yAccessor}/>
                </Chart>
            )}
            {showTooltip && hoveredValueState && (
                <Tooltip key={Math.random()} style={{backgroundColor: '#3a464f', color: 'white', fontSize: ".7rem"}}
                         left={tooltipLeft + 'px'} top={tooltipTop + 'px'}>
                    {hoveredValueState && (
                        <React.Fragment>
                            <div style={{fontSize: ".6rem"}}>{hoveredDate} </div>
                            {Object.keys(hoveredValueState).map((itemKey, index) => (
                                <React.Fragment>
                                {hoveredValueState && hoveredValueState[itemKey] && !isNil(hoveredValueState[itemKey].val) && (
                                    <React.Fragment>
                                        <div key={index} className={classes.tooltipItem}>
                                    <div className={classes.legendBox}
                                         style={{backgroundColor: colorScale(  index)}}></div>
                                    <div style={{ width: '140px' }} className={classes.tooltipInnerItem}>{itemKey}:</div>
                                    <div className={classes.tooltipInnerItem}><strong>{ hoveredValueState[itemKey].val } {itemKey === 'Success Rate' && '%' }</strong></div>
                                </div>
                                </React.Fragment>
                                )}
                                </React.Fragment>
                            ))}
                        </React.Fragment>
                    )}
                </Tooltip>
            )}
        </Paper>
    )
}

export default withStyles(styles)(SimpleLineChart);
