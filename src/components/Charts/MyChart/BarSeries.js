import React from 'react';
import Bars from "./Bars";
import StackedBars from "./StackedBars";


const BarSeries = React.memo(function BarSeries({data, dimensions, xScale, yScale, yScale2, colorScale, x0_scaleBand, x1_scaleBand}) {
    if(!data){
        return null;
    }
    return (
        <>
        {data && data.map((dataItem, index)=>(
            <React.Fragment key={'bar-series-frag-' + index}>
                <StackedBars  x0_scaleBand={x0_scaleBand}
                              x1_scaleBand={x1_scaleBand} key={'stack-bar-parent-'+ index} dimensions={dimensions} name={dataItem.name} dataIndex={index} data={dataItem.values} colorScale={colorScale} xScale={xScale}
                             yScale={yScale} fillColor={colorScale(dataItem.name)}>
                </StackedBars>
                </React.Fragment>
            ))}
        </>
    )
});

export default BarSeries;
