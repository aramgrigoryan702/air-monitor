import React, {useContext} from "react"
import PropTypes from "prop-types"
import * as d3 from "d3"
import { accessorPropsType } from "./utils";
import {ChartControllerContext} from "../../../containers/dashboard/dashboard-chart/LatestChart";

const LineSeries = React.memo(function (props) {
  const { type, data,  xScale, yScale, xAccessor, yAccessor, isHumidityChart, y0Accessor,colorScale, interpolation } = props;
  const { selectedCurve } = useContext(ChartControllerContext);

  if(!data){
    return null;
  }

  let lineGenerator;

  if (type === "area") {
    lineGenerator = d3.area()
        .x(d => {
          return  d  &&  xScale(d.date);
        })
        .y0(d=> {
         return yScale(0)
        })
        .y1(d =>{
          return d && yScale(d.value);
        })
        .defined(function (d) {
          if(d && (!d.value)){
            d.value = .00001;
          }
          return d && d.date && d.value;
        })
        .curve(d3.curveMonotoneX);

  } else {
    lineGenerator = d3.line()
        .x(d => {
          return  d  &&  xScale(d.date);
        })
        .y(d =>{
          return d && yScale(d.value);
        })
        .defined(function (d) {
          if(d && (!d.value)){
            d.value = .00001;
          }
          return d && d.date && d.value;
        })
        .curve(d3.curveMonotoneX);
  }

  return (

      <React.Fragment>
        {data && data.map((dataItem,  i)=>(
            <g  className={'issue'}  key={'svg-g-'+i}>
            <path key={'path-'+i}
                  className={`line Line Line--type-series-`+i}
                  style={{'stroke':  isHumidityChart ? colorScale(i):  colorScale(dataItem.keyName), 'fill': type === 'area' ? colorScale(dataItem.keyName) : 'none', 'fillOpacity': .2 }}
                  clipPath={"url(#clip)"}
                  d={lineGenerator(dataItem.values)}
            />
            </g>
        ))}
      </React.Fragment>
  )
});

LineSeries.propTypes = {
  type: PropTypes.oneOf(["line", "area"]),
  data: PropTypes.array,
  xAccessor: accessorPropsType,
  yAccessor: accessorPropsType,
  y0Accessor: accessorPropsType,
  interpolation: PropTypes.func,
}

LineSeries.defaultProps = {
  type: "line",
  y0Accessor: 0,
  interpolation: d3.curveMonotoneX,
}

export default LineSeries
