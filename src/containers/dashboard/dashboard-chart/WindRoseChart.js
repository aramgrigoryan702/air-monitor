import React, {useEffect, useLayoutEffect, useReducer} from 'react';
import './_d3chartNew.scss';
import './_windorseChart.scss';
import * as d3 from 'd3';
import windrose from 'windrose';
import {debounce, clone} from 'lodash';
import {of} from "rxjs";
import {debounceTime} from "rxjs/operators";
import moment from 'moment';
import { Tooltip } from '@vx/tooltip';

const columns = [
    '0-1', '1-2', '2-3', '3-4', '4-5', '5-6', '6+',
];
const angles = [
    'N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE',
    'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW',
];

const defaultState = {dimensions: undefined,
    data: undefined,
    angleScale: undefined,
    radiusScale: undefined,
    xScale: undefined,
    yScale: undefined,
    zScale: undefined,
    zHScale: undefined,
    angleOffset: undefined,
    metrics: undefined,
    chartReadyData: undefined,
    dataStackValues: undefined,
    labels: undefined,
    speedWisePercentValues: undefined
};


function reducer(currentState, newState) {
    return {...currentState, ...newState};
}

function useWindroseChart({windSpeedData, width, height, selectedDateRange, chartRef}) {

    const [{dimensions, data, angleScale, radiusScale, xScale, yScale, zScale, zHScale, angleOffset, metrics, chartReadyData, dataStackValues, labels, speedWisePercentValues}, setState] = useReducer(reducer, {
        ...defaultState
    });

    const subscriptionRef = React.useRef();

    useEffect(() => {
        subscriptionRef.current = [];
        return () => {
            if (subscriptionRef && subscriptionRef.current) {
                subscriptionRef.current.map(item => item && item.unsubscribe());
                subscriptionRef.current = [];
            }
        }
    }, []);

    useEffect(() => {

        return ()=>{
            setState({
                ...defaultState
            });
        }

    }, []);

    useLayoutEffect(() => {
        if (height && width) {
            const minSize = (width < height ? width : height);
            let _dimensions = {
                width: minSize,
                height: minSize,
                marginLeft: 2,
                marginTop: 2,
                radius: minSize / 2,
                innerRadius: 10,
                outerRadius: ((minSize) / 2) - 10,
                margin: {
                    top: 10,
                    right: 80,
                    bottom: 0,
                    left: 0,
                },
            };
            _dimensions.boundedWidth = _dimensions.width - _dimensions.margin.left - _dimensions.margin.right;
            _dimensions.boundedHeight = _dimensions.height - _dimensions.margin.top - _dimensions.margin.bottom;
            _dimensions.boundedRadius = _dimensions.radius - ((_dimensions.margin.left + _dimensions.margin.right) / 2);
            setState({
                dimensions: _dimensions,
            });
        }
    }, [width, height]);

    useLayoutEffect(() => {
        if (windSpeedData && dimensions) {
            if (subscriptionRef && subscriptionRef.current) {
                subscriptionRef.current.map(item => item && item.unsubscribe());
                subscriptionRef.current = [];
                subscriptionRef.current.push(of(true).pipe(debounceTime(500)).subscribe(() => {
                    makeChart();
                }));
            }
        }
    }, [windSpeedData, dimensions]);

    function makeChart() {
        let totalFrequency = 0;
        let totalWindDirValue = 0;
        let totalWindSpeed = 0;
        let maxWindSpeed = 0;
        totalFrequency = 0;
        totalWindDirValue = 0;
        totalWindSpeed = 0;
        maxWindSpeed = 0;
        let _data = angles.map(angle => {
            return {
                angle: angle,
                '0-1': 0,
                '1-2': 0,
                '2-3': 0,
                '3-4': 0,
                '4-5': 0,
                '5-6': 0,
                '6+': 0,
                angleFrequency: 0,
            };
        });
        _data.columns = ['angle', ...columns];
        let _windSpeedData = [...windSpeedData];
        _windSpeedData.forEach(d => {
            const direction = d.WindDirection;
            const windSpeed = d.value;
            totalWindDirValue += direction;
            totalWindSpeed += windSpeed;
            if (windSpeed > maxWindSpeed) {
                maxWindSpeed = windSpeed;
            }
            if (direction && direction >= 0 && direction <= 360) {
                ++totalFrequency;
                const directionName = windrose.getPoint(direction, {depth: 2});
                if (!directionName) {
                    return;
                }
                const item = _data.find(d => d.angle === directionName.symbol);
                if (item) {
                    switch (true) {
                        case (windSpeed <= 1):
                            item['0-1'] = ++item['0-1'];
                            break;
                        case (windSpeed <= 2):
                            item['1-2'] = ++item['1-2'];
                            break;
                        case (windSpeed <= 3):
                            item['2-3'] = ++item['2-3'];
                            break;
                        case (windSpeed <= 4):
                            item['3-4'] = ++item['3-4'];
                            break;
                        case (windSpeed <= 5):
                            item['4-5'] = ++item['4-5'];
                            break;
                        case (windSpeed <= 6):
                            item['5-6'] = ++item['5-6'];
                            break;
                        case (windSpeed > 6):
                            item['6+'] = ++item['6+'];
                            break;
                    }
                    item.angleFrequency = ++item.angleFrequency;
                    return {...item};
                }
            }
        });


        function getSum(total, num) {
            if (typeof (num) === 'number') {
                return total + num;
            }
            return total;
        }

        function getPercent(total) {
            if (total === 0 || totalFrequency === 0) {
                return 0;
            }
            return ((100 / totalFrequency) * total);
        }

        _data.forEach(d => {
            Object.keys(d).forEach(key => {
                if (key !== 'angle') {
                    d[key] = getPercent(d[key]);
                }
            });
            d.angleFrequency = 0;
            d.angleFrequency = Object.values(d).reduce(getSum, 0)
        });

        const speeWisePercentValues = {};
        columns.forEach(column => {
            speeWisePercentValues[column] = _data.reduce((a, b) => {
                return (typeof a === 'number' ? (a + b[column]) : (a[column] + b[column]));
            }, 0).toFixed(2);
        });

        // console.log('speeWisePercentValues', speeWisePercentValues);
        let _angleScale = d3.scaleLinear()
          .range([0, 2 * Math.PI]);
        let _radiusScale = d3.scaleLinear()
          .range([dimensions.innerRadius, dimensions.outerRadius]);
        let _xScale = d3.scaleBand()
          .range([0, 2 * Math.PI])
          .align(0);
        let _yScale = d3.scaleLinear() //you can try scaleRadial but it scales differently
          .range([dimensions.innerRadius, dimensions.boundedRadius]);
        let _zScale = d3.scaleOrdinal()
          .range([
              '#4242f4',
              '#42c5f4',
              '#42f4ce',
              '#42f456',
              '#f4e242',
              '#f4a142',
              '#f44242'
          ]);
        let _zHScale = d3.scaleOrdinal()
          .range([
              '#1f00f4',
              '#0599f4',
              '#a7f4d6',
              '#31a340',
              '#f4c900',
              '#f47312',
              '#f41919'
          ]);

        _xScale.domain(_data.map(function (d) {
            return d.angle;
        }));
        _yScale.domain([0, d3.max(_data, function (d) {
            return d.angleFrequency;
        })]);

        _zScale.domain(_data.columns.slice(1));
        _zHScale.domain(_data.columns.slice(1));
        // Extend the domain slightly to match the range of [0, 2π].
        _angleScale.domain([0, d3.max(_data, function (d, i) {
            return i + 1;
        })]);
        _radiusScale.domain([0, d3.max(_data, function (d) {
            return d.y0 + d.y;
        })]);
        let angleOffset = -360.0 / _data.length / 2.0;
        let _chartReadyData = _data.map(function (d) {
            return {
                angle: d.angle,
                angleFrequency: d.angleFrequency,
            };
        });
        let _metrics = angles.map((metric, i) => {
            const angle = i * ((Math.PI * 2) / angles.length) - Math.PI * 0.5;
            const x1 = Math.cos(angle) * (dimensions.innerRadius) + dimensions.width / 2;
            const x2 = Math.cos(angle) * dimensions.boundedRadius + dimensions.width / 2;
            const y1 = Math.sin(angle) * (dimensions.innerRadius) + dimensions.width / 2;
            const y2 = Math.sin(angle) * dimensions.boundedRadius + dimensions.width / 2;
            return {
                x1,
                x2,
                y1,
                y2,
            }
        });
        let _dataStackValues = d3.stack().keys(_data.columns.slice(1))(_data);

        const labels = [{
            text: 'From',
            value: moment(selectedDateRange.start).format('MMMM Do YYYY, h:mm a')
        }, {
            text: 'To',
            value: moment(selectedDateRange.end).format('MMMM Do YYYY, h:mm a')
        }, {
            text: 'Number of observations',
            value: totalFrequency
        }, {
            text: 'Average wind direction',
            value: Math.round(totalWindDirValue/totalFrequency) || 0
        }, {
            text: 'Average wind speed',
            value: Math.round(totalWindSpeed/totalFrequency) || 0
        }, {
            text: 'Peak gust',
            value: maxWindSpeed
        }];

        setState({
            angleScale: _angleScale,
            radiusScale: _radiusScale,
            xScale: _xScale,
            yScale: _yScale,
            zScale: _zScale,
            zHScale: _zHScale,
            angleOffset: angleOffset,
            metrics: _metrics,
            chartReadyData: _chartReadyData,
            dataStackValues: _dataStackValues,
            columns,
            labels
        });
    }

    function getWindpath(data) {
        let pathStr = d3.arc()
          .innerRadius(function (d) {
              return yScale(d[0]);
          })
          .outerRadius(function (d) {
              return yScale(d[1]);
          })
          .startAngle(function (d) {
              return xScale(d.data.angle);
          })
          .endAngle(function (d) {
              return xScale(d.data.angle) + xScale.bandwidth();
          })
          .padAngle(0.01)
          .padRadius(dimensions.innerRadius)(data);

        // console.log('pathStr', pathStr);
        return pathStr;
    }


    return {
        dimensions,
        data,
        angleScale,
        radiusScale,
        xScale,
        yScale,
        zScale,
        zHScale,
        angleOffset,
        metrics,
        chartReadyData,
        dataStackValues,
        getWindpath,
        setState,
        columns,
        labels,
        speedWisePercentValues
    };
}

const WindRoseChart = React.memo(function WinRoseChartNew({windSpeedData, width, height, title, selectedDateRange}) {
    const chartRef = React.useRef();
    const {dimensions, data, angleScale, radiusScale, xScale, yScale, zScale, zHScale, angleOffset, metrics, chartReadyData, dataStackValues, getWindpath, setState, columns, labels, speedWisePercentValues} = useWindroseChart({
        windSpeedData,
        selectedDateRange,
        width,
        height,
        title,
        chartRef
    });

    function getTooltipEl() {
        return chartRef.current.nextSibling;
    }

    function showTooltip(show = true) {
        getTooltipEl().style.display = show ? 'block' : 'none';
    }
    function setTooltipPosition (e, stack, windData) {
        const tooltipEl = getTooltipEl();
        const mainNode = document.querySelector('main');
        let xPadding = 0;
        mainNode.classList.forEach(className => {
            if(className.indexOf('contentShift')!== -1) {
                xPadding = 225;
            }
        });
        const yPadding = document.querySelector('.MuiGrid-container').firstChild.offsetHeight + document.querySelector('header').offsetHeight;
        const el = chartRef.current.closest('.MuiPaper-root');
        el.scrollTo({
            top: chartRef.current.scrollHeight,
            left: 0,
            behavior: 'smooth'
        });

        tooltipEl.innerHTML = windData.data[stack.key].toFixed(2) + '%';
        tooltipEl.style.left = (e.clientX - xPadding) + 'px';
        tooltipEl.style.top = (e.clientY - yPadding - 35) + 'px';
    }
    function onMouseOver(e, stack, windData) {
        showTooltip();
        setTooltipPosition(e, stack, windData);
        e.target.setAttribute('fill', zHScale(stack.key));
    }
    function onMouseOut(e, stack) {
        showTooltip(false);
        e.target.removeAttribute('fill');
    }
    function onLegendMouseOver(key) {
        chartRef.current
          .querySelector(`g[fill="${zScale(key)}"]`)
          .setAttribute('fill', `${zHScale(key)}`);
    }
    function onLegendMouseOut(key) {
        chartRef.current
          .querySelector(`g[fill="${zHScale(key)}"]`)
          .setAttribute('fill', `${zScale(key)}`);
    }

    return (
      <div className='windrose-chart' style={{position: 'relative'}}>
          {dimensions && dimensions.boundedWidth && dimensions.boundedHeight && (
            <svg width={width} height={height} ref={chartRef}  className='Chart'>
                <defs>
                    <clipPath id="windrose--chart-clip">
                        <rect width={width} height={height}>
                        </rect>
                    </clipPath>
                </defs>
                <g transform={`translate(10, 10)`}>
                    <React.Fragment>
                        {metrics && metrics.map((metric, metricIndex) => (
                          <line  className='Line'  key={'windrose-line-' + metricIndex} x1={metric.x1} x2={metric.x2} y1={metric.y1}
                                 y2={metric.y2}></line>
                        ))}
                        <circle  clipPath={"url(#windrose--chart-clip)"} cx={dimensions.width / 2} cy={dimensions.width / 2} r={dimensions.innerRadius}
                                 stroke='gray' strokeDasharray='0' fill='none'></circle>
                        <g transform={`translate(${(dimensions.width / 2)}, ${dimensions.height / 2})`}>
                            {chartReadyData && chartReadyData.map((d, dataIndex) => (
                              <g key={'label-g-' + dataIndex}
                                 textAnchor='middle'
                                 transform={`rotate(${(xScale(d.angle) + xScale.bandwidth() / 2) * 180 / Math.PI - (90 - angleOffset)}) translate(${dimensions.outerRadius + 50}, 0)`}>
                                  <text  style={{fontSize: '14px'}}
                                         transform={`${(xScale(d.angle) + xScale.bandwidth() / 2 + Math.PI / 2) % (2 * Math.PI) < Math.PI ? 'rotate(90) translate(0,70)' : 'rotate(-90) translate(0,-60)'}`}> {d.angle} </text>
                              </g>
                            ))}
                        </g>
                        <g transform={`translate(${(dimensions.width / 2)}, ${dimensions.height / 2})`}>
                            {dataStackValues && dataStackValues.map((stack, stackIndex) => (
                              <g  key={'stack-' + stackIndex} fill={zScale(stack.key)}
                              >
                                  {stack && stack.map((stackItem, stackInnerIndex) => (
                                    <path key={'inner-stack-' + stackIndex + '-' + stackInnerIndex}
                                          className='Path'
                                          d={getWindpath(stackItem, yScale, xScale, dimensions)}
                                          transform={`rotate(${angleOffset})`}
                                          onMouseMove={(e => onMouseOver(e, stack, stackItem))}
                                          onMouseOut={(e => onMouseOut(e, stack))}
                                    ></path>
                                  ))}

                              </g>
                            ))}
                        </g>
                        <g transform={`translate(${(dimensions.width / 2)}, ${dimensions.height / 2})`}>
                            {yScale && yScale.ticks(5).slice(1).map((yTick, index) => (
                              <g key={'percent-circle-' + index}>
                                  <g>
                                      <circle fill='none' stroke='gray' strokeDasharray='4,4' r={yScale(yTick)}></circle>
                                  </g>
                                  <g>
                                      <text style={{fontSize: '14px', fontWeight: 'lighter'}} stroke={'#efefef'} y={-yScale(yTick) + 17} dy='-0.35em' x='-13'>{parseInt(yTick)}%</text>
                                  </g>
                              </g>
                            ))}
                        </g>
                        <g transform={`translate(${(dimensions.width / 2)}, ${dimensions.height / 2})`}>
                            {chartReadyData && clone(columns).reverse().map((d, dataIndex) => (
                              <g key={'legend-g-' + dataIndex}  transform={`translate(${dimensions.outerRadius + 60}, ${(-dimensions.outerRadius + 120 + (dataIndex - (columns.length - 1) / 2) * 20)})`}>
                                  <rect width="18" height="18" fill={zScale(d)}
                                        onMouseOver={(e => onLegendMouseOver(d))}
                                        onMouseOut={(e => onLegendMouseOut(d))}
                                  ></rect>
                                  <text x="24" y="9" dy="0.35">{d}</text>
                              </g>
                            ))}
                        </g>
                        <g transform={`translate(${(dimensions.width / 2)}, ${dimensions.height / 2})`}>
                            <text x={dimensions.outerRadius + 25} y={(-dimensions.outerRadius + 100 + ( - (columns.length-1) / 2) * 20)}>Wind speed (mph)</text>
                            <rect x={dimensions.outerRadius + 130} y={(110-dimensions.outerRadius + ( - (columns.length-1) / 2) * 20)} width='300' height='150' strokeWidth='1' stroke='grey' fill='none'></rect>
                        </g>
                        <g transform={`translate(${(dimensions.width / 2)}, ${dimensions.height / 2})`}>
                            {chartReadyData && labels.map((label, index) => (
                              <g key={'legend-lebels-'+index} transform={'translate(' + (dimensions.outerRadius + 105) + ',' + (190-dimensions.outerRadius + (index - (columns.length-1) / 2) * 22) + ')'}>
                                  <text x='40' y='-50'>{label.text + ': ' + label.value}</text>
                              </g>
                            ))}
                        </g>
                    </React.Fragment>
                </g>
            </svg>
          )}
          {true && (
            <Tooltip id='tip-windrose' key={Math.random()} style={{backgroundColor: '#3a464f', color: 'white', fontSize: ".7rem", display: 'none'}}
                     left={100 + 'px'} top={100 + 'px'}>
            </Tooltip>
          )}
      </div>
    );
});

export default WindRoseChart;
