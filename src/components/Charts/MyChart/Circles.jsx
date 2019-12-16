import React, {useContext} from "react"
import PropTypes from "prop-types"
import {accessorPropsType} from "./utils";

const Circles = React.memo(({data, keyAccessor, xScale, yScale, radius, selectedDate, colorScale}) => {
    return (

        <React.Fragment>
            {data && xScale && yScale && data.map((d, i) => (
                <React.Fragment key={'circle-' + i}>
                    { d && d.values && d.values.map((item, index) => (
                        <React.Fragment key={'circle-inner-' + i+ '-'+ index}>
                            {item && item.value && yScale(item.value) > 10 && (
                                <circle
                                    className="Circles__circle"
                                    clipPath={"url(#clip)"}
                                    key={'circle-'+i+'-'+index}
                                    strokeWidth={'1px'}
                                    strokeOpacity={selectedDate && item.date && item.date.toISOString() === selectedDate ? 1 : .2}
                                    stroke={'whitesmoke'}
                                    fill='transparent'
                                    cx={xScale(item.date)}
                                    cy={yScale(item.value)}
                                    r={typeof radius == "function" ? radius(d) : radius}
                                />
                            )}
                        </React.Fragment>
                    ))}
                </React.Fragment>
            ))}
        </React.Fragment>
    )
});

Circles.propTypes = {
    data: PropTypes.array,
    keyAccessor: accessorPropsType,
    radius: accessorPropsType,
}

Circles.defaultProps = {
    radius: 5,
}

export default Circles
