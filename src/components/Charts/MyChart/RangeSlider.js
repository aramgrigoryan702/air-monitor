import React, {useLayoutEffect, useReducer, useRef, useEffect, useMemo, useCallback} from "react";
import { subDays, isAfter, isBefore} from "date-fns";
import * as d3 from "d3";
import {Observable, from, queueScheduler, of} from 'rxjs';
import {debounceTime} from 'rxjs/operators';
import withStyles from "@material-ui/core/styles/withStyles";
import CheckBoxIcon from "@material-ui/icons/CheckBox";
import DateFnsUtils from "@date-io/date-fns";
import {format} from "date-fns";

const dateFns = new DateFnsUtils();

const styles = (theme) => ({
    buttonOn: {
        fill: theme.palette.secondary.main
    },

});


var formatMillisecond = d3.timeFormat(".%L"),
    formatSecond = d3.timeFormat(":%S"),
    formatMinute = d3.timeFormat("%I:%M"),
    formatHour = d3.timeFormat("%I %p"),
    formatDay = d3.timeFormat("%a %d"),
    formatWeek = d3.timeFormat("%b %d"),
    formatMonth = d3.timeFormat("%B"),
    formatYear = d3.timeFormat("%Y");

function multiFormat(date) {
    return (d3.timeSecond(date) < date ? formatMillisecond
        : d3.timeMinute(date) < date ? formatSecond
            : d3.timeHour(date) < date ? formatMinute
                : d3.timeDay(date) < date ? formatHour
                    : d3.timeMonth(date) < date ? (d3.timeWeek(date) < date ? formatDay : formatWeek)
                        : d3.timeYear(date) < date ? formatMonth
                            : formatYear)(date);
}

function reducer(draft, newState) {
    return {...draft, ...newState};
}

const formatDate = function (date) {
    if(date) {
        return format(date, dateFns.dateTime12hFormat);
    }
    return date;
};


function useRangeSlider({dimensions, scale, daysMode, setDateSelection, selectedDateRange, classes, axisMode, toggleAxisMode}) {

    const leftSlider = useRef();
    const rightSlider = useRef();
    const subscriptionRef = useRef();

    const [{x1, x2, startLabel, endLabel, startDate, endDate}, setState] = useReducer(reducer, {
        x1: 0,
        x2: 100,
        lineWidth: 0,
        startLabel: '',
        endLabel: '',
        startDate: undefined,
        endDate: undefined
    });


    useEffect(() => {
        subscriptionRef.current = [];
        return () => {
            if (subscriptionRef && subscriptionRef.current) {
                subscriptionRef.current.map(item => item && item.unsubscribe());
                subscriptionRef.current = undefined;
            }
        }
    }, []);


    useLayoutEffect(()=> {
        if (leftSlider.current && scale) {
            const _x1 = 0;
            const _x2 = dimensions.boundedWidth - 100;
            setState({
                x1: _x1,
                x2: _x2,
                startDate: scale.invert(_x1),
                endDate: scale.invert(_x2),
            });
        }
    },[]);

    useLayoutEffect(() => {
        /*if (leftSlider.current) {
            mountListeners();
            return () => clearMountListeners();
        }
*/
    }, [scale, leftSlider, dimensions.boundedWidth]);


    React.useLayoutEffect(() => {
        if (selectedDateRange && dimensions && dimensions.boundedWidth > 0) {
            if (subscriptionRef && subscriptionRef.current) {
                subscriptionRef.current.push(of(500).pipe(debounceTime(300)).subscribe(() => {
                    const {start, end} = selectedDateRange;
                    // console.log('start, end', start, end);
                    if (start && end && scale) {
                        let _x1 = scale(start);
                        if(_x1 < 0){
                            _x1 = 0;
                        }
                        let _x2 = scale(end);
                        if (_x2 > (dimensions.boundedWidth - 100)) {
                            _x2 = dimensions.boundedWidth - 100;
                        }
                        const _endDate = scale.invert(_x2);
                        if (x1 !== _x1 || x2 !== _x2) {
                            setState({
                                x1: _x1,
                                x2: _x2,
                                startDate: start,
                                endDate: _endDate
                            });
                        }
                        // console.log('start, end', start, end, _x1,  _x2);
                    }
                }));
            }
        }
    }, [selectedDateRange, dimensions.boundedWidth, scale]);

    const leftSliderListener = useCallback(function leftSliderListener() {
        if (rightSlider.current) {
            if (d3.event.x > 0 && d3.event.x < (rightSlider.current.getAttribute('cx') + 10)) {
                let _startDate = scale.invert(d3.event.x);
                const closestVal = _startDate ? formatDate(_startDate) : '';
                setState({
                    x1: d3.event.x,
                    startLabel: closestVal.toString(),
                    startDate: _startDate
                });
            }
        }
    }, [rightSlider.current, scale, dimensions.boundedWidth]);


    const rightSliderListener = useCallback(function rightSliderListener() {
        if (leftSlider.current) {
            if (d3.event.x > (leftSlider.current.getAttribute('cx')) && d3.event.x <= (dimensions.boundedWidth - 100)) {
                let _x2 = d3.event.x;
                if (_x2 > (dimensions.boundedWidth - 100)) {
                    _x2 = dimensions.boundedWidth - 100;
                }
                const _endDate = scale.invert(_x2);
                const closestVal = _endDate ? formatDate(_endDate) : '';
                setState({
                    x2: _x2,
                    endLabel: closestVal.toString(),
                    endDate: _endDate
                });
            }
        }
    }, [leftSlider.current,  scale, dimensions.boundedWidth]);

   const onDragEnd = React.useCallback(function onDragEnd() {
        if (leftSlider.current && rightSlider.current) {
            let _startDate = scale.invert(leftSlider.current.getAttribute('cx'));
            let _endDate = scale.invert(rightSlider.current.getAttribute('cx'));
            let _daysMode = daysMode ? daysMode : 1;
            let _endDateLimit = new Date();
            let _startDateLimit  = subDays(_endDateLimit, _daysMode);
            if (isAfter(_startDate, _endDate)) {
                _endDate = scale.invert(leftSlider.current.getAttribute('cx'));
                _startDate = scale.invert(rightSlider.current.getAttribute('cx'));
            }
            if(isBefore(_startDate, _startDateLimit)){
                _startDate = _startDateLimit;
            }

            if(isAfter(_endDate, _endDateLimit)){
                _endDate = _endDateLimit;
            }
            setDateSelection({start: _startDate, end: _endDate});
        }
    }, [setDateSelection, leftSlider.current, scale, daysMode, rightSlider.current]);

   const mountListeners = React.useCallback(function mountListeners() {
        d3.select(leftSlider.current).call(d3.drag().on('drag', leftSliderListener).on('end', onDragEnd));
        d3.select(rightSlider.current).call(d3.drag().on('drag', rightSliderListener).on('end', onDragEnd));
    },[leftSlider.current, rightSlider.current, leftSliderListener, rightSliderListener]);

   const clearMountListeners= React.useCallback(function clearMountListeners() {
        if (leftSlider.current) {
            d3.select(leftSlider.current).call(d3.drag().on('drag', null).on('end', null));
        }
        if (rightSlider.current) {
            d3.select(rightSlider.current).call(d3.drag().on('drag', null).on('end', null));
        }
    },[leftSlider.current, rightSlider.current, leftSliderListener]);

    return {x1, x2, startLabel, endLabel, startDate, endDate, setState, leftSlider, rightSlider};
}

const RangeSlider = React.memo(function RangeSlider({dimensions, scale, daysMode, setDateSelection, selectedDateRange, classes, axisMode, toggleAxisMode}) {

    const {x1, x2, startLabel, endLabel, startDate, endDate, setState, leftSlider, rightSlider} = useRangeSlider({dimensions, scale, daysMode, setDateSelection, selectedDateRange, classes, axisMode, toggleAxisMode});

    if (x1 < 0 || x2 < 0) {
        console.log('x1 < 0 || x2 < 0', x1 , x2)
        return null;
    }

    // console.log('at  the slider', x1, x2);
    return (
        <React.Fragment>
            {/*<g className="slider" transform={`translate(0,${dimensions.boundedHeight + 70})`}>
                <line x1="0" y1="8" x2={dimensions.boundedWidth - 100} y2="8" stroke="#ccc" strokeWidth="1"></line>
                <rect x={x1} width={x2 - x1} y="4" height="8" fill="red" fontSize='12px' fillOpacity="0.5"></rect>
                <ellipse ref={leftSlider}
                         cx={x1} cy="8" rx="8" ry="8" fill="red" fillOpacity="0.8"
                         style={{cursor: "pointer"}}></ellipse>
                <text id={'leftText'} x={(x2 - x1) < 200 ? (x1 - 50) : (x1 + 50)} y="28" fontSize="12px"
                      textAnchor="middle">{startDate ? formatDate(startDate) : ''}</text>
                <ellipse ref={rightSlider} cx={x2} cy="8" rx="8" ry="8" fill="red" fillOpacity="0.8"
                         style={{cursor: "pointer"}}></ellipse>
                <text id={'rightText'} x={(x2 - x1) < 200 ? (x2 + 50) : (x2 - 50)} y="28" fontSize="12px"
                      textAnchor="middle">{endDate ? formatDate(endDate) : ''}</text>

            </g>*/}
            <g x='0' y='0' style={{'cursor': 'pointer'}} onClick={toggleAxisMode}
               transform={`translate(${dimensions.boundedWidth - 50},${dimensions.boundedHeight + 65})`}>
                <text x="0" y="15" fontSize="12px" style={{'cursor': 'pointer'}} textAnchor="start">Auto Scale</text>
                {axisMode === 'dynamic' ? (
                    <CheckBoxIcon x='60' y='0' style={{'cursor': 'pointer'}} height={'24px'} width={'24px'}
                                  color={"secondary"} fontSize={'small'} size={'small'} onClick={toggleAxisMode}/>

                ) : (
                    <rect x='65' y='5' stroke="#95a5a6" strokeWidth="2" fillOpacity="1" fill="#3a464f" style={{'cursor': 'pointer'}} onClick={toggleAxisMode} height='15'
                          width='15' fontSize='small' size='small'/>
                )}
            </g>
        </React.Fragment>
    )
});

export default withStyles(styles)(RangeSlider);
