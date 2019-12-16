import React, {useContext, useEffect, useLayoutEffect, useReducer} from 'react';
import ReactDOM from 'react-dom';
import {makeStyles, Paper} from "@material-ui/core";
import {ChartControllerContext} from "../../containers/dashboard/dashboard-chart/LatestChart";
import {fromEvent, of} from "rxjs";
import {debounceTime} from "rxjs/operators";
import * as d3 from "d3";
import {GroupChartControllerContext} from "../../containers/dashboard/dashboard-chart/GroupedSiteChartContainer";
import * as classnames from "classnames";
import Chart from "../Charts/MyChart/Chart";
import Axis from "../Charts/MyChart/Axis";
import Bars from "../Charts/MyChart/Bars";
import VarianceBars from "./VarianceBars";
import debounce from 'lodash.debounce';
import {withRouter} from "react-router";
import {cubehelix} from "d3-color";
import {interpolateCubehelixLong} from "d3-interpolate";
import {useWhyDidYouUpdate} from "../../hooks/common";
import GroupSiteChartAxis from "./GroupSiteChartAxis";
// eslint-disable-next-line import/no-webpack-loader-syntax
import WebWorker from "../../WorkerSetup";
// eslint-disable-next-line import/no-webpack-loader-syntax
import chartWorker from '../../workers/grouped.site.chart.worker.js';


export var cool = interpolateCubehelixLong(cubehelix(260, 0.75, 0.35), cubehelix(80, 1.50, 0.8));

const useStyles = makeStyles(theme => ({
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
        overflow : 'auto',
    },
    chart: {
        height: 'calc(100%)',
        width: 'calc(100%)'

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
    tooltipInnerItem: {
        flex: 1,
        textAlign: 'left',
        marginLeft: '3px'
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
}));

function reducer(currentState, newState) {
    return {...currentState, ...newState};
}

function getColorForTvocVariance(tVocVariance, avgTvoc) {
    let colorName = "#009662";
    if (avgTvoc >= tVocVariance) {
        colorName = '#FFD632';
    }
    return colorName;
}


const Counter = React.memo(props => {
    useWhyDidYouUpdate('Update Status', props);
    return <div style={props.style}></div>;
});

function findSiteNodes(sites, container, callback) {
    let cmp;
  ReactDOM.render(<svg ref={c => cmp = c} className='Chart'><g className="Axis AxisVertical">
     {sites.map((item, i)=>(
         <text
             key={i}
             className="Axis__tick"
         > <a style={{cursor: 'pointer'}}> {item.name} </a></text>
     ))}</g></svg>,document.getElementById('dummyChartContainer'), ()=>{
         callback(cmp)
  });
}

function useGroupedChart({data, sites, height, width, selectedDateRange, allDateValues, maxQty, minQty}) {

    const subscriptionRef = React.useRef();
    const ref = React.useRef();
    const chartWorkerRef =  React.useRef();
    var margin = {top: 5, right: 10, bottom: 80, left: 70},
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
    //const yAccessor = d => +d.avgTvoc;
    //const yAccessor2 = d => +d.avgTvoc;

    const xAccessor = d => d.date;


    const [{
        chartData, chartBinData, dimensions, xScale, yScale, hoveredValueState, hoveredDate, hoveredDateString, hoveredValueDetails, legendData, tooltipKeys, showTooltip,
        tooltipTop, tooltipLeft, siteMap, colorScale,
    }, setState] = useReducer(reducer, {
        chartData: [],
        siteMap: {},
        chartBinData: undefined,
        dimensions: passedSettings,
        xScale: undefined,
        yScale: undefined,
        hoveredValueState: {},
        hoveredDateString: undefined,
        hoveredValueDetails: {},
        legendData: [],
        tooltipKeys: [],
        showTooltip: false,
        tooltipTop: 0,
        tooltipLeft: 0,
        hoveredDate: undefined,
        colorScale: d3.scaleOrdinal(d3.schemeCategory10),
    });



    useEffect(() => {
        subscriptionRef.current = [];
        chartWorkerRef.current = new chartWorker();
        return () => {
            if (subscriptionRef && subscriptionRef.current) {
                subscriptionRef.current.map(item => item && item.unsubscribe());
                subscriptionRef.current = [];
            }
        }
    }, []);


    useLayoutEffect(() => {
        if (data && sites && Array.isArray(sites)) {
            let newChartData = sites.map(item => {
                let newItem = {...item};
                newItem.chartData = {};
                if (data && data[newItem.id.toString()]) {
                    newItem.chartData = data[newItem.id.toString()];
                }
                return newItem;
            });
            setState({
                chartData: newChartData
            });
        } else {
            setState({
                chartData: undefined,
            });
        }
    }, [data, sites]);


    useLayoutEffect(() => {
        if (ref.current) {
            if (subscriptionRef && subscriptionRef.current) {
                subscriptionRef.current.push(of(500).pipe(debounceTime(500)).subscribe(() => {
                    calculateDimensions();
                }));
            }
        }
    }, [allDateValues, width, sites]);


    useLayoutEffect(() => {
        if (chartData && allDateValues && allDateValues.length > 0 && selectedDateRange && selectedDateRange.start && selectedDateRange.end && chartData.length > 0 && dimensions.boundedWidth > 0) {
            renderChart();
        } else {
            setState({
                chartBinData: undefined
            });
        }
    }, [dimensions, chartData, selectedDateRange]);

    function calculateDimensions() {

        if(allDateValues) {
            let maxTextLength = 100;
           findSiteNodes(sites, ref.current, function (nodes) {
               if(nodes){
                   let textNodes = nodes.getElementsByTagName('text');
                   if(textNodes){
                       for (let i=0; i< textNodes.length; i++){
                           let item = textNodes.item(i);
                           let tLen = item.getComputedTextLength();
                           if(tLen > maxTextLength){
                               maxTextLength = tLen + 20;
                           }
                       }
                       // console.log(textNodes)
                   }
               }

               let margin = {top: 25, right: maxTextLength, bottom: 35, left: maxTextLength};

               const passedSettings = {
                   marginTop: margin.top,
                   marginBottom: margin.bottom,
                   marginLeft: margin.left,
                   marginRight: margin.right,
               };
               let _height = (sites.length * 30);
               let _width = (allDateValues.length * 80) + margin.right + margin.left;
               if(_width < width){
                   _width = width;
               }
               passedSettings.width = _width + margin.left + margin.right + 30;
               passedSettings.boundedWidth = passedSettings.width -   margin.left  - margin.right;
               passedSettings.height = _height + margin.top + margin.bottom;
               passedSettings.boundedHeight = passedSettings.height - margin.top - margin.bottom;
               setState({dimensions: passedSettings});
               ReactDOM.unmountComponentAtNode(ReactDOM.findDOMNode(nodes).parentNode)
            });

        }
    }

    function yAccessor(d) {
        return siteMap[d].name;
    }

    function renderChart() {
        if (dimensions && dimensions.boundedWidth > 0 && allDateValues && chartData) {
            let timeRange = allDateValues && allDateValues.length > 2 ? [d3.min(allDateValues), d3.max(allDateValues)] : [selectedDateRange.start, selectedDateRange.end];
            let dimensionsNew = dimensions;
            let _xScale = d3.scaleTime().domain([
                ...timeRange
            ]).rangeRound([0, dimensionsNew.boundedWidth]);
            let _siteMap = {};
            let siteNames = chartData.map(item => {
                if (item && item.id) {
                    _siteMap[item.id] = item;
                    return item.id;
                }
                return undefined;
            });
            let _yScale = d3.scaleOrdinal().domain(siteNames).range([dimensionsNew.boundedHeight, 0]);
            // let _colorScale = colorScale.copy();
            let binsGenerator;
            const {start, end} = selectedDateRange;
              /*let diffInHour = differenceInHours(end, start);
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
                      .thresholds(_xScale.ticks(d3.timeHour.every(1)));
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
              }*/

            binsGenerator = d3.histogram()
                .domain(_xScale.domain())
                .value(function (d) {
                    return d.date;
                })
                .thresholds(allDateValues);

            let chartBinData = chartData.map((item) => {
                let newItem = {...item};
                if (newItem && newItem.chartData && newItem.chartData.values) {
                    let bins = binsGenerator(newItem.chartData.values);
                    newItem.chartData.binData = bins;
                   // console.log('bins', bins);
                }
                return newItem;
            });

            //const bins = binsGenerator();
            setState({
                xScale: _xScale,
                yScale: _yScale,
                siteMap: _siteMap,
                chartBinData: chartBinData
            })
            // _yScale.domain();

        }
    }

    return {
        chartData,
        chartBinData,
        dimensions,
        ref,
        xScale, yScale,
        setState,
        hoveredValueState,
        hoveredDateString,
        hoveredValueDetails,
        legendData,
        tooltipKeys,
        showTooltip,
        tooltipTop, tooltipLeft,
        hoveredDate,
        siteMap,
        yAccessor,
        colorScale,
    }
}
const formatDate = d3.timeFormat("%-b %-d")

const GroupedSiteChart = React.memo(function GroupedSiteChart({data, sites, width, height, allDateValues, history, maxQty, minQty}) {

    const classes = useStyles();
    const {selectedDateRange} = React.useContext(GroupChartControllerContext);
    const {dimensions, ref, xScale, yScale, chartBinData, setState,
        yAccessor, colorScale,
    } = useGroupedChart({data, sites, width, height, selectedDateRange, allDateValues, maxQty, minQty});


    return (
        <Paper id="groupChart" className={classnames(classes.paper, 'chart-container')} ref={ref}>
            {xScale && yScale && dimensions && chartBinData && (
                <Chart dimensions={dimensions}>
                    <defs>
                        <clipPath id="clip">
                            <rect width={dimensions.boundedWidth} height={dimensions.boundedHeight}>
                            </rect>
                        </clipPath>
                    </defs>
                    {chartBinData && (
                        <React.Fragment>
                    <GroupSiteChartAxis dimension="x"
                          dimensions={dimensions}
                          scale={xScale}
                          formatTick={formatDate}
                    />
                    <GroupSiteChartAxis dimension="xTop"
                                        dimensions={dimensions}
                                        scale={xScale}
                                        formatTick={formatDate}
                    />
                    <GroupSiteChartAxis
                        dimension="yLeftLabel"
                        history={history}
                        dimensions={dimensions}
                        yAccessor={yAccessor}
                        scale={yScale}
                    />
                    <GroupSiteChartAxis
                        dimension="yRightLabel"
                        history={history}
                        dimensions={dimensions}
                        yAccessor={yAccessor}
                        scale={yScale}
                    />

                        <VarianceBars history={history} dimensions={dimensions} data={chartBinData} xScale={xScale} yScale={yScale}>
                        </VarianceBars>
                        </React.Fragment>
                    )}
                </Chart>
            )}
            <div id='dummyChartContainer'> </div>
        </Paper>

    )

});

export default withRouter(GroupedSiteChart);
