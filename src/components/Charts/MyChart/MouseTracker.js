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

function useMouseTracker({dimensions, xScale, data, suffix, yAccessor, xAccessor, setState, additionalData, isTvocChart, allDateValues, containerType}) {

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
                    //  const mouse_y = mousePosition[1];

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
                        if (isDate(selectedDate)) {
                            mouse_x = xScale(selectedDate);
                            let dateSelected = format(selectedDate, 'M/d - p', {});
                            const getDistanceFromHoveredDate = d => Math.abs(xAccessor(d) - selectedDate);
                            let _hoveredValueState = {};
                            let _hoveredValueDetails = {};
                            data && data.forEach((dataItem, i) => {
                                if (dataItem && dataItem.values) {
                                    _hoveredValueState[dataItem.name] = 'NA';
                                    //_hoveredValueDetails[dataItem.CoreId] = {};
                                    const closestIndex = d3.scan(dataItem.values, (a, b) => (
                                        getDistanceFromHoveredDate(a) - getDistanceFromHoveredDate(b)
                                    ));
                                    if (closestIndex) {
                                        const closestDataPoint = dataItem.values[closestIndex];
                                        if (closestDataPoint && closestDataPoint.date && isEqual(selectedDate, closestDataPoint.date)) {
                                            // console.log('closestDataPoint', closestDataPoint);
                                            // const closestXValue = xAccessor(closestDataPoint);
                                            const closestYValue = yAccessor(closestDataPoint);
                                            if (typeof closestYValue !== 'undefined') {
                                                let coreIdStr = '';
                                                if(closestDataPoint.valueMap && Array.isArray(closestDataPoint.valueMap) && closestDataPoint.valueMap.length > 0){
                                                   if(containerType && containerType === 'sites') {
                                                       let cId = closestDataPoint.valueMap[closestDataPoint.valueMap.length - 1];
                                                       if (cId.CoreId) {
                                                           let str = cId.CoreId.toString().substring(0, 8);
                                                           if (str) {
                                                               coreIdStr = `(${str})`;
                                                           }
                                                       }
                                                   }
                                                    closestDataPoint.valueMap.map(_valItem => {
                                                        if (_valItem && _valItem.CoreId) {
                                                            _hoveredValueDetails[_valItem.CoreId] = {..._valItem};
                                                        }
                                                    });
                                                }
                                                _hoveredValueState[dataItem.name] = {
                                                    label: [dataItem.name, coreIdStr].join(' '),
                                                    val: isTvocChart ? [numberFormat(closestYValue, 3), (suffix || '')].join('') : [closestYValue, (suffix || '')].join(''),
                                                    valueMap: closestDataPoint.valueMap
                                                };

                                            }
                                        }
                                    }
                                }
                            });
                            // console.log('additionalData', additionalData);
                            if (additionalData && additionalData.scale && additionalData.values) {
                                const axx = (item) => item.x0;
                                //console.log('additionalData', additionalData);
                                const getDistanceFromHoveredDateInner = d => Math.abs(axx(d) - selectedDate);
                                const closestIndex = d3.scan(additionalData.values, (a, b) => (
                                    getDistanceFromHoveredDateInner(a) - getDistanceFromHoveredDateInner(b)
                                ));
                                if (closestIndex) {
                                    //  console.log('closestIndex', closestIndex);
                                    const closestDataPoint = additionalData.values[closestIndex];
                                    // const closestXValue = xAccessor(closestDataPoint);
                                    if (closestDataPoint && closestDataPoint.length > 0) {
                                        //  console.log('closestDataPoint', closestDataPoint);
                                        const {WindDirection, value} = closestDataPoint[0];
                                        if (!isNil(value)) {
                                            _hoveredValueState['Speed'] = {val: value};
                                        }
                                        if (!isNil(WindDirection)) {
                                            _hoveredValueState['Direction'] = {val: typeof WindDirection !== 'undefined' && WindDirection !== null ? WindDirection : 'NA'};
                                        }
                                    }
                                }
                            }
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
        });
    },[setReducerState, setState]);

    const  onMouseOver =  React.useCallback(function onMouseOver(event){
        setState({
            showTooltipCircle: true,
        })
    },[setReducerState, setState]);

    return {hoverOpacity, x1, tooltipTop, tooltipLeft, tooltipOpen, setReducerState, mouseTrackerRef, onMousemove, onMouseOut, onMouseOver};
}

const MouseTracker =  React.memo(function MouseTracker({dimensions, xScale,data, suffix,  yAccessor, xAccessor, setState, additionalData,isTvocChart, allDateValues, containerType }){

    const {hoverOpacity, x1, mouseTrackerRef, onMousemove, onMouseOut, onMouseOver} = useMouseTracker({dimensions, xScale,data, suffix,  yAccessor, xAccessor, setState, additionalData , isTvocChart, allDateValues, containerType});

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

export default MouseTracker;
