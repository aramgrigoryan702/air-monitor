import React from "react"
import PropTypes from "prop-types"
import * as d3 from 'd3';

const  expectedHeight = 30;

const GroupSiteChartAxis = React.memo((props) => {
  const axisComponentsByDimension = {
    x: GroupSiteChartAxisHorizontal,
    xTop: GroupSiteChartAxisHorizontalTop,
    y: GroupSiteChartAxisVertical,
    yRight: GroupSiteChartAxisVerticalRight,
    yRightLabel: GroupSiteChartAxisVerticalLabelRight,
    yLeftLabel: GroupSiteChartAxisVerticalLabel,
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

function navigateToSiteChart(id, history) {
    if(id) {
        history.push('/dashboard/sites/' + id + '/analyze');
    }
}

GroupSiteChartAxis.propTypes = {
  dimension: PropTypes.oneOf(["x","xTop", "y", "yRightLabel", "yRight","yLeftLabel"]),
  scale: PropTypes.func,
  label: PropTypes.string,
  formatTick: PropTypes.func,
};

GroupSiteChartAxis.defaultProps = {
  dimension: "x",
  scale: null,
  formatTick: d3.format(","),
};

export default GroupSiteChartAxis


const GroupSiteChartAxisHorizontal = React.memo(function GroupSiteChartAxisHorizontal (props) {
  const {dimensions, label, formatTick, scale,  numberOfTicks} = props;

    const ticks = scale.ticks(d3.timeHour.every(4));
 // console.log('ticks', scale.tickValues());
  const tickFormat = scale.tickFormat();

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

const GroupSiteChartAxisHorizontalTop = React.memo(function GroupSiteChartAxisHorizontalTop (props) {
    const {dimensions, label, scale} = props;
    const ticks = scale.ticks(d3.timeHour.every(4));
    const tickFormat = scale.tickFormat();

    return (
        <g className="Axis AxisHorizontal" transform={`translate(0, -30)`}>
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
            <line
                className="Axis__line"
                transform={`translate(0, ${dimensions.boundedWidth})`}
                x2={dimensions.boundedWidth}
            />
        </g>
    )
});

const GroupSiteChartAxisVerticalLabel  =  React.memo(function GroupSiteChartAxisVerticalLabel (props) {
    const  {  dimensions, label,  formatTick, scale, unitName, yAccessor, history  }  =  props;
    //console.log('ticks', scale.tickValues());
   // const numberOfTicks = dimensions.boundedHeight / 70;
    const ticks =  scale.domain();
    let expectedHeight = 30;
    //expectedHeight = Math.min(expectedHeight, 30);
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
                    transform={`translate(-16, ${i* expectedHeight + 15})`}
                >
                    <a style={{cursor: 'pointer'}} onClick={e=> navigateToSiteChart(tick, history)}>{ yAccessor(tick) }</a>
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

const GroupSiteChartAxisVerticalLabelRight  =  React.memo(function GroupSiteChartAxisVerticalLabelRight ({  dimensions, label,  formatTick, scale, unitName, yAccessor, history  }) {
    //console.log('ticks', scale.tickValues());
    // const numberOfTicks = dimensions.boundedHeight / 70;
    const ticks =  scale.domain();

    //expectedHeight = Math.min(expectedHeight, 30);
    return (
        <g className="Axis AxisVertical">
            <text
                key={'unit-name'}
                className="Axis__tick"
                transform={`translate(${dimensions.boundedWidth+ 15}, -12)`}
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
                    key={tick+'_'+i}
                    className="Axis__tick_Right_label"
                    transform={`translate(${dimensions.boundedWidth + 15}, ${i* expectedHeight + 15})`}
                >
                    <a style={{cursor: 'pointer'}} onClick={e=> navigateToSiteChart(tick, history)}>{ yAccessor(tick) }</a>
                </text>
            ))}
        </g>
    )
});

const GroupSiteChartAxisVertical  =  React.memo(function GroupSiteChartAxisVertical (props) {
  const  {  dimensions, label,  formatTick, scale, unitName  }  =  props;
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

const GroupSiteChartAxisVerticalRight = React.memo(function GroupSiteChartAxisVerticalRight (props) {
  const {  dimensions, formatTick, scale, unitName  }  =  props;
  const numberOfTicks = dimensions.boundedHeight / 70;
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
