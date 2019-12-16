import React from "react";
import * as d3 from "d3";
import DateFnsUtils from "@date-io/date-fns";
import {format, isEqual} from "date-fns";
import {fromEvent} from "rxjs";
import {debounceTime, throttleTime} from "rxjs/operators";
import {numberFormat} from "underscore.string";
import {isDate, isNil} from "lodash";

const dateFns = new DateFnsUtils();

function reducer(draft, newState) {
    return {...draft, ...newState};
}

const xAccessorFn = d => d.date;

function useGroupedMouseTracker({dimensions, xScale, data, suffix, yAccessor, xAccessor, setState, additionalData, allDateValues, containerType}) {

    const mouseTrackerRef = React.useRef();
    const subscriptionRef = React.useRef();

    const [{hoverOpacity, x1, tooltipTop, tooltipLeft, tooltipOpen}, setReducerState]  =  React.useReducer(reducer,{
        hoverOpacity:0,
        x1:0,
    });
    const partitionWidth = React.useMemo(()=> dimensions.boundedWidth /2, [dimensions]);
    React.useEffect(()=>{
        subscriptionRef.current = [];
    }, []);

    const onMousemove = React.useCallback(function onMousemove(event) {
        const svg = d3.select(mouseTrackerRef.current);
        if(svg) {
            try {
                const mousePosition = d3.clientPoint(svg.node(), event);
                if (mousePosition && mousePosition.length > 0) {
                    let mouse_x = mousePosition[0];
                    const _hoveredDate = xScale.invert(mousePosition[0]);
                    const _getDistanceFromHoveredDate = d => Math.abs(new Date(d) - _hoveredDate);
                    const _closestIndex = d3.scan(allDateValues, (a, b) => (
                        _getDistanceFromHoveredDate(a) - _getDistanceFromHoveredDate(b)
                    ));
                    if (_closestIndex === -1) {
                        return true;
                    }
                    if (allDateValues[_closestIndex]) {
                        let selectedDate = new Date(allDateValues[_closestIndex]);
                       // console.log('selectedDate', selectedDate);
                        if (isDate(selectedDate)) {
                            mouse_x = xScale(selectedDate);
                            let dateSelected = format(selectedDate, 'M/d - p', {});
                            let _hoveredValueState = {};
                            let _hoveredValueDetails = {};
                            data && data.forEach((dataItem, i) => {
                                if (dataItem && dataItem.chartData && dataItem.chartData.valueMap) {
                                    let foundItem = dataItem.chartData.valueMap[selectedDate];
                                    if (foundItem && foundItem.exceedQuantity){
                                        _hoveredValueState[dataItem.name] = {
                                            label: [dataItem.name].join(' '),
                                            val: foundItem.exceedQuantity,
                                            avgTvoc: foundItem.avgTvoc,
                                            colorCode: dataItem.chartData.colorScale(foundItem.exceedQuantity)
                                        };
                                    }
                                }
                            });
                            setReducerState({
                                hoverOpacity: 1,
                                x1: mouse_x,
                            });
                            setState({
                                hoveredDate: dateSelected,
                                hoveredDateString: selectedDate.toISOString(),
                                hoveredValueState: _hoveredValueState,
                                hoveredValueDetails: _hoveredValueDetails,
                                showTooltip: true,
                                tooltipLeft: mouse_x > partitionWidth ? mouse_x - 80 : mouse_x + 80,
                                tooltipTop: 10
                            });
                        }
                    }
                }
            }catch(ex){
                console.log(ex);
            }
        }
    },[dimensions, xScale,data, suffix,  yAccessor, xAccessor, setState, additionalData, setReducerState, mouseTrackerRef.current]);

    const  onMouseOut =  React.useCallback(function onMouseOut(event){
        setReducerState({
            hoverOpacity:  '1e-06',
        });
        setState({
            showTooltip: false,
            showTooltipCircle: false,
        })
    },[setReducerState, setState]);

    const  onMouseOver =  React.useCallback(function onMouseOver(event){
        setState({
            showTooltipCircle: true,
        })
    },[setReducerState, setState]);

    return {hoverOpacity, x1, tooltipTop, tooltipLeft, tooltipOpen, setReducerState, mouseTrackerRef, onMousemove, onMouseOut, onMouseOver};
}

const GroupedMouseTracker =  React.memo(function GroupedMouseTracker({dimensions, xScale,data, suffix,  yAccessor, xAccessor, setState, additionalData,isTvocChart, allDateValues, containerType }){

    const {hoverOpacity, x1, mouseTrackerRef, onMousemove, onMouseOut, onMouseOver} = useGroupedMouseTracker({dimensions, xScale,data, suffix,  yAccessor, xAccessor, setState, additionalData , isTvocChart, allDateValues, containerType});

    return (
      <React.Fragment>
        <rect ref={mouseTrackerRef} onMouseOver={onMouseOver} onMouseOut={onMouseOut}
          onMouseMove={onMousemove} width={dimensions.boundedWidth} height={dimensions.boundedHeight}
          style={{'fill': 'transparent'}}/>
        <line  stroke="white"  opacity={hoverOpacity} strokeWidth="1px" x1={x1} x2={x1} y1="0" y2={dimensions.boundedHeight} style={{"pointerEvents": "none"}}>
        </line>

     {/*     <circle cx={'100'} cy={'100'} style={{'opacity': '1'}} r='4'strokeWidth='2' stroke={"#af9358"} fill={'white'} className={'tooltip-circle'}></circle>
     */} </React.Fragment>
    )
});

export default GroupedMouseTracker;
