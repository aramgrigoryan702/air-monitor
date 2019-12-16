import React from "react"
import PropTypes from "prop-types"
import * as d3 from 'd3'
import { dimensionsPropsType } from "./utils";
import { useChartDimensions } from "./Chart";


const Axis = React.memo((props) => {
  const axisComponentsByDimension = {
    x: AxisHorizontal,
    y: AxisVertical,
    yRight: AxisVerticalRight,
    yLeftLabel: AxisVerticalLabel,
  };
  const { dimension, dimensions, unitName }  = props;
  const Component = axisComponentsByDimension[dimension];
  if (!Component) return null

  return (
    <Component
      dimensions={props.dimensions}
      {...props}
    />
  )
});

Axis.propTypes = {
  dimension: PropTypes.oneOf(["x", "y","yRight","yLeftLabel"]),
  scale: PropTypes.func,
  label: PropTypes.string,
  formatTick: PropTypes.func,
}

Axis.defaultProps = {
  dimension: "x",
  scale: null,
  formatTick: d3.format(","),
}

export default Axis


const AxisHorizontal = React.memo(function AxisHorizontal (props) {
  const {dimensions, label, formatTick, scale,  numberOfTicks} = props;

  const ticks = scale.ticks ?  scale.ticks(numberOfTicks || 12) : scale.domain();
 // console.log('ticks', scale.tickValues());
  const tickFormat = scale.tickFormat ? scale.tickFormat(numberOfTicks || 12): (d)=> d.toString();

  return (
    <g className="Axis AxisHorizontal" transform={`translate(0, ${dimensions.boundedHeight})`}>
      <line
        className="Axis__line"
        x2={dimensions.boundedWidth}
      />

      {ticks.map((tick, i) => (
        <text
          key={tick+i}
          className="Axis__tick"
          transform={`translate(${scale(tick)}, 25)`}
        >
          { tickFormat(tick, i) }
        </text>
      ))}

      {label && (
        <text
          className="Axis__label"
          transform={`translate(${dimensions.boundedWidth / 2}, 60)`}
        >
          { label }
        </text>
      )}
    </g>
  )
});

const AxisVerticalLabel  =  React.memo(function AxisVerticalLabel (props) {
    const  {  dimensions, label,  formatTick, scale, unitName, yAccessor, history  }  =  props;
    //console.log('ticks', scale.tickValues());
    const numberOfTicks = dimensions.boundedHeight / 70;
    const ticks =  scale.domain();
    let expectedHeight = dimensions.boundedHeight / ticks.length;
    expectedHeight = Math.min(expectedHeight, 30);
    function navigateToSiteChart(id) {
       if(id) {
           history.push('/dashboard/sites/' + id + '/analyze');
       }
    }

    return (
        <g className="Axis AxisVertical">
            <text
                key={'unit-name'}
                className="Axis__tick"
                transform={`translate(-16, -12)`}
            >
                { unitName }
            </text>
            <line
                className="Axis__line"
                y2={dimensions.boundedHeight}
            />
            {ticks.map((tick, i) => (
                <text
                    key={tick+'_'+i}
                    className="Axis__tick"
                    transform={`translate(-16, ${i* expectedHeight + 10})`}
                >
                    <a style={{cursor: 'pointer'}} onClick={e=> navigateToSiteChart(tick)}>{ yAccessor(tick) }</a>
                </text>
            ))}

            {label && (
                <text
                    className="Axis__label"
                    style={{
                        transform: `translate(-70px, ${dimensions.boundedHeight / 2}px) rotate(-90deg)`
                    }}
                >
                    { label }
                </text>
            )}
        </g>
    )
});

const AxisVertical  =  React.memo(function AxisVertical (props) {
  const  {  dimensions, label,  formatTick, scale, unitName  }  =  props;


  //console.log('ticks', scale.tickValues());
  const numberOfTicks = dimensions.boundedHeight / 70;
  const ticks =  scale.ticks(numberOfTicks);

  return (
    <g className="Axis AxisVertical">
      <text
          key={'unit-name'}
          className="Axis__tick"
          transform={`translate(-16, -12)`}
      >
        { unitName }
      </text>
      <line
        className="Axis__line"
        y2={dimensions.boundedHeight}
      />

      {ticks.map((tick, i) => (
        <text
          key={tick+i}
          className="Axis__tick"
          transform={`translate(-16, ${scale(tick)})`}
        >
          { formatTick(tick) }
        </text>
      ))}

      {label && (
        <text
          className="Axis__label"
          style={{
            transform: `translate(-70px, ${dimensions.boundedHeight / 2}px) rotate(-90deg)`
          }}
        >
          { label }
        </text>
      )}
    </g>
  )
});

const AxisVerticalRight = React.memo(function AxisVerticalRight (props) {
  const {  dimensions, formatTick, scale, unitName  }  =  props;
  const numberOfTicks = dimensions.boundedHeight / 70
  const ticks = scale.ticks(numberOfTicks);

  return (
    <g className="Axis AxisVertical">
      <text
          key={'unit-name'}
          className="Axis__tick"
          transform={`translate(${dimensions.boundedWidth+ 30}, -12)`}
      >
        { unitName }
      </text>
      <line
        className="Axis__line"
        x1={dimensions.boundedWidth}
        x2={dimensions.boundedWidth}
        y2={dimensions.boundedHeight}
      />
      {ticks.map((tick, i) => (
        <text
          key={tick+i}
          className="Axis__tick_Right"
          transform={`translate(${dimensions.boundedWidth+  30}, ${scale(tick)})`}
        >
          { formatTick(tick) }
        </text>
      ))}
    </g>
  )
});
