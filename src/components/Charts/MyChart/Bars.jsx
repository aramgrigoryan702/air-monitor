import React from "react"
import PropTypes from "prop-types"
import * as d3 from 'd3'
import {accessorPropsType} from "./utils";

const Bars = React.memo(({data, dimensions, xScale, yScale, fillColor}) => {
    return (<g clipPath={"url(#clip)"}>
            {data && data.map((d, i) => (
                <React.Fragment key={'bar-frag-' + i}>
                    {d && d[0] && d[0].value && (
                        <rect
                            className="Bars__rect"
                            key={'bar-rect-' + i}
                            x='0'
                            y='0'
                            style={{ fill: fillColor? fillColor: undefined  }}
                            fillOpacity=".7"
                            transform={`translate(${xScale(d.x0)},${yScale(d[0].value)})`}
                            height={dimensions.boundedHeight - yScale(d[0].value)}
                            width={d3.max([(xScale(d.x1) - xScale(d.x0)) - .1, 1])}
                        />
                    )}
                </React.Fragment>
            ))}
        </g>
    )
});

Bars.propTypes = {
    data: PropTypes.array,
    keyAccessor: accessorPropsType,
    xAccessor: accessorPropsType,
    yAccessor: accessorPropsType,
}

Bars.defaultProps = {}

export default Bars
