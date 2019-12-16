import React, {useMemo} from "react"
import PropTypes from "prop-types"
import * as d3 from 'd3'
import {accessorPropsType} from "../Charts/MyChart/utils";
import {compact} from "lodash";
import {makeStyles} from "@material-ui/core";
import moment from 'moment';

function getColorForTvocVariance(tVocVariance, avgTvoc, maxAvgTvoc) {
   // console.log('tVocVariance,maxAvgTvoc, avgTvoc ', tVocVariance,maxAvgTvoc, avgTvoc );
    //let colorScale =  d3.scaleSequential(d3.interpolateYlGn).domain([tVocVariance, maxAvgTvoc]);
    let colorScale =  d3.scaleLinear().domain([tVocVariance, maxAvgTvoc]).range(['#1a9850', '#FFD632']).interpolate(d3.interpolateHcl);
    return colorScale(avgTvoc);
    let colorName = "#009662";
    if(avgTvoc >= tVocVariance){
        colorName = '#FFD632';
    }
    return colorName;
}


const useStyles = makeStyles(theme => ({
    text: {
        fill: 'whitesmoke !important',
        fontSize: '.7em',
    },
}));


function navigateToSiteChart({id, history, startTime, endTime}) {
    if(id) {
        let _startTime, _endTime;
        if(startTime){
            _startTime = new Date(startTime).toISOString();
        }
        if(endTime){
            _endTime = new Date(endTime).toISOString();
        }
        history.push(`/dashboard/sites/${id}/analyze?startTime=${_startTime}&&endTime=${_endTime}`);
    }
}

const VarianceBars = React.memo(({data, dimensions, xScale, yScale, history}) => {
    const classes = useStyles();
    if (!yScale || !xScale) {
        return null;
    }
    const ticks = yScale.domain();
    let expectedHeight = 30;


    //let chartData = data.map(item => item && item.chartData) ;
   // console.log('chartData', chartData);
    return (<g clipPath={"url(#clip)"}>
            {data && data.map((d, i) => (
                <React.Fragment key={'bar-frag-' + i}>
                    {d && d.chartData &&  d.chartData.binData && d.chartData.binData.map((item, dIndex) => (
                        <React.Fragment key={'bar-rect-inner-' + i + "_" + dIndex}>
                            {item && item[0] && (
                                <g clipPath={"url(#clip)"} key={'legend-key-' + i + "_" + dIndex}  x='0'
                                   y='0' transform={`translate(${xScale(item.x0)},${i* expectedHeight + 0})`}>
                                <rect  onClick={e=> navigateToSiteChart({id: d.id,startTime: item.x0, endTime: item.x1, history})} className="Bars__"
                                    key={'bar-rect_' + i + "_" + dIndex}
                                    x='0'
                                    y='0'
                                    strokeWidth="1px"
                                    strokeOpacity='.3'
                                    stroke="whitesmoke"
                                    fillOpacity=".7"
                                    height={expectedHeight}
                                    style={{cursor: 'pointer'}}
                                    fill={d.chartData.colorScale(item[0].exceedQuantity)}
                                    width={(xScale(item.x1) -  xScale(item.x0))}
                                >
                                </rect>
                                <text onClick={e=> navigateToSiteChart({id: d.id,startTime: item.x0, endTime: item.x1, history})} x={(xScale(item.x1) -  xScale(item.x0)) / 2} y={expectedHeight/2} dominantBaseline="middle" textAnchor="middle"
                                      key={'rect-text_' + i + "_" + dIndex}
                                      height={expectedHeight}
                                      className={classes.text}
                                      fontSize={'.6em'}
                                      style={{mixBlendMode : 'color-dodge', cursor: 'pointer'}}
                                      fillOpacity="1">{item[0].exceedQuantity}</text>
                                </g>
                            )}
                        </React.Fragment>
                    ))}
                </React.Fragment>
            ))}
        </g>
        //getColorForTvocVariance(d.tVocVariance, item.avgTvoc, d.maxAvgTvoc)
    )
});


/*
{item && item.avgTvoc && (
            <rect
                className="Bars__rect"
                key={'bar-rect-' + i+"_"+dIndex}
                x='0'
                y='0'
                fillOpacity=".7"
                transform={`translate(${xScale(d)},${yScale(d[0].value)})`}
                height={dimensions.boundedHeight - yScale(d[0].value)}
                width={d3.max([(xScale(d.x1) - xScale(d.x0)) - .1, 1])}
            />
        )}
 */
VarianceBars.propTypes = {
    data: PropTypes.array,
    keyAccessor: accessorPropsType,
    xAccessor: accessorPropsType,
    yAccessor: accessorPropsType,
};

VarianceBars.defaultProps = {};

export default VarianceBars;
