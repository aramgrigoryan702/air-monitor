import React from "react"
import PropTypes from "prop-types"
import * as d3 from 'd3'
import {accessorPropsType} from "./utils";

const StackedBars = React.memo(({data, dimensions, xScale, yScale, fillColor, name,  x0_scaleBand, x1_scaleBand, dataIndex}) => {

    return (<g clipPath={"url(#clip)"}>
            {data && data.map((d, i) => (
                <React.Fragment key={'bar-frag-' + i}>
                    {d && d[0] && d[0].value && (
                        <rect className="Bars__rect"
                            key={'bar-rect-' + i}
                            x='0'
                            y='0'
                            style={{ fill: fillColor? fillColor: undefined  }}
                            fillOpacity=".7"
                            transform={`translate(${xScale(d.x0) + (((xScale(d.x1) - xScale(d.x0)) / 4) * dataIndex)},${yScale(d[0].value)})`}
                            width={(xScale(d.x1) - xScale(d.x0)) / 4}
                            height={Math.abs(dimensions.boundedHeight - yScale(d[0].value))}
                        />
                    )}
                </React.Fragment>
            ))}
        </g>
    )
});

StackedBars.propTypes = {
    data: PropTypes.array,
    keyAccessor: accessorPropsType,
    xAccessor: accessorPropsType,
    yAccessor: accessorPropsType,
}

StackedBars.defaultProps = {}

export default StackedBars
