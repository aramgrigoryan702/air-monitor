import React from "react"
import PropTypes from "prop-types"
import * as d3 from 'd3'
import { accessorPropsType } from "./utils";


const WindBar = React.memo((props) => {
  const  { data, dimensions, xScale } = props;
return  (<g>
    {data && data.map((d, i) => (
      <React.Fragment   key={'WindBar-frag-'+i}>
      {d  && d[0]&& d[0].value && (
        <React.Fragment>
        <path
          className="WindBar__rect"
          key={'WindBar-rect-'+i}
          d="M12 2L4.5 20.29l.71.71L12 18l6.79 3 .71-.71z"
          x='0'
          refX="5"
          refY="5"
          markerWidth="13"
          markerHeight="13"
          orient="auto"
          fill="currentColor"
          fillOpacity=".8"
          clipPath={"url(#clip)"}
          y={0}
          transform={`translate(${xScale(d.x0)},${dimensions.boundedHeight + 28})  rotate(${d[0].WindDirection} 10 10)`}
          height={'30'}
          width={d3.max([(xScale(d.x1) - xScale(d.x0)), 1])}
        />
        </React.Fragment>
      )}
    </React.Fragment>
    ))}
  </g>
)
});

WindBar.propTypes = {
  data: PropTypes.array,
  keyAccessor: accessorPropsType,
  xAccessor: accessorPropsType,
  yAccessor: accessorPropsType,
}

WindBar.defaultProps = {
}

export default WindBar;
