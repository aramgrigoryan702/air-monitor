import React, {useContext} from "react"
import PropTypes from "prop-types"
import * as d3 from "d3"
import { accessorPropsType } from "./utils";
import {ChartControllerContext} from "../../../containers/dashboard/dashboard-chart/LatestChart";

const SimpleLineSeries = React.memo(function (props) {
  const { type, data,  xScale, yScale, xAccessor, yAccessor, isHumidityChart, y0Accessor,colorScale, interpolation } = props;
  const { selectedCurve } = useContext(ChartControllerContext);

  if(!data){
    return null;
  }

  const lineGenerator = d3.line()
      .x(d => {
        return  d  &&  xScale(d.date);
      })
      .y(d =>{
        return d && yScale(d.value);
      })
      .defined(function (d) {
        return d && d.date && d.value;
      })
      .curve(d3.curveMonotoneX);

  if (type === "area") {
    lineGenerator
      .y0(y0Accessor)
      .y1(yAccessor)
  }

  return (

      <React.Fragment>
        {data && data.map((dataItem,  i)=>(
            <g  className={'issue'}  key={'svg-g-'+i}>
            <path
                  className={`line Line Line--type-series-`+i}
                  style={{'stroke':  colorScale(i)}}
                  clipPath={"url(#clip)"}
                  d={lineGenerator(dataItem.values)}
            />
            </g>
        ))}
      </React.Fragment>
  )
});

SimpleLineSeries.propTypes = {
  type: PropTypes.oneOf(["line", "area"]),
  data: PropTypes.array,
  xAccessor: accessorPropsType,
  yAccessor: accessorPropsType,
  y0Accessor: accessorPropsType,
  interpolation: PropTypes.func,
};

SimpleLineSeries.defaultProps = {
  type: "line",
  y0Accessor: 0,
  interpolation: d3.curveMonotoneX,
};

export default SimpleLineSeries
