// eslint-disable-next-line no-restricted-globals
//const ctx = global.self;
import {WindDirectionsWeight} from "../components/Charts/MyChart/WindroseScale";
import {roundNumber} from "../helpers/CommonHelper";
import * as d3 from "d3";
import {groupBy, keyBy, sortBy} from "lodash/collection";
import {isNil, meanBy, round, sumBy, uniq} from "lodash";
import {isWithinInterval} from 'date-fns';

function prepareChartReadyData(params) {

    let {data, daysMode,  selectedDateRange, exceedBaseLine} = params;
    let dateRanges = [];
    if(selectedDateRange){
        let {start, end} = selectedDateRange;
        data = data.filter(item=> item.TimeStamp && isWithinInterval(new Date(item.TimeStamp), {start: selectedDateRange.start, end: selectedDateRange.end}) )
        switch (daysMode) {
            case 'all' :
                dateRanges = d3.timeMinute.every(1).range( d3.timeMinute.round(start),  d3.timeMinute.ceil(end));
                break;
            case 'hourly' :
                dateRanges = d3.timeHour.every(1).range( d3.timeHour.round(start),  d3.timeHour.ceil(end));
                break;
            case 'daily' :
                dateRanges = d3.timeDay.every(1).range( d3.timeDay.round(start),  d3.timeDay.ceil(end));
                break;
        }
    }
    //console.log(dateRanges);
    let _allDateValues = [];
    let _allDateValuesMap = {};
    const newNewData = groupBy(data, 'siteID');
    let maxAvgTvoc = 0;
    let newChartData = {};
    let chartData = {};
    let minQty = 0;
    let maxQty = 0;
    Object.keys(newNewData).forEach(function(newKeyName){
        newChartData[newKeyName] = [];
        chartData[newKeyName]= {
            values: []
        };
        let coreVals = groupBy(newNewData[newKeyName], 'CoreId');
        Object.keys(coreVals).forEach(function (keyName) {
            let values = coreVals[keyName];
            let newValues = [];
            if(Array.isArray(values) && values.length>0){
                let _values = sortBy(values, 'TimeStamp');
                let len = _values.length;
                for (let i=0; i< len; i++){
                    let prevTvoc1 = _values[i-1] ? _values[i-1].tVOC1: undefined;
                    let prevPrevTvoc1 = _values[i-2] ?  _values[i-2].tVOC1 : undefined;
                    if(prevTvoc1 && prevPrevTvoc1 && _values[i].tVOC1){
                        _values[i].tVOC1 =  roundNumber((_values[i].tVOC1 *.50)+ (prevTvoc1 * .30) + (prevPrevTvoc1 *.2), 3);
                    }
                    let prevTvoc2 = _values[i-1] ? _values[i-1].tVOC2: undefined;
                    let prevPrevTvoc2 = _values[i-2] ?  _values[i-2].tVOC2 : undefined;
                    if(prevTvoc1 && prevPrevTvoc1 && _values[i].tVOC2){
                        _values[i].tVOC2 =  roundNumber((_values[i].tVOC2 *.50)+ (prevTvoc2 * .30) + (prevPrevTvoc2 *.2), 3);
                    }
                    _values[i].avgTvoc = d3.mean([_values[i].tVOC1, _values[i].tVOC2]);
                }
                let groupedByTimeSTAMP = groupBy(_values, 'TimeStamp');
                let keys= Object.keys(groupedByTimeSTAMP);
                keys = sortBy(keys, item=> new Date(item));
                // console.log(keys);
                keys.forEach(function (itemKey) {
                    _allDateValuesMap[itemKey] = itemKey;
                   // _allDateValues.push(new Date(itemKey));
                    let _dVals = groupedByTimeSTAMP[itemKey];
                    let avgTvoc = 0;
                    let avgExceedQuantity = 0;
                    if(Array.isArray(_dVals)){
                        avgTvoc = d3.mean(_dVals.map(item=> item.avgTvoc));
                    }
                    if(avgTvoc > maxAvgTvoc){
                        maxAvgTvoc = avgTvoc;
                    }
                    newChartData[newKeyName].push({
                        date: new Date(itemKey),
                        avgTvoc: roundNumber(avgTvoc, 3),
                        exceedQuantity: roundNumber(Math.max(0, avgTvoc - exceedBaseLine), 3),
                    });
                });
                //let variance = d3.variance(_values.map(item=> item && item.avgTvoc));
                //variance = round(variance, 3);
              //  newData[keyName] = { values: newValues, valueMap: keyBy(newValues, 'date'), maxAvgTvoc: roundNumber(maxAvgTvoc, 3), tVocVariance: roundNumber(variance, 3)};
            }
        });
        let groupedByTime = groupBy(newChartData[newKeyName], 'date');
        if(Object.keys(groupedByTime).length > 0){
            Object.keys(groupedByTime).forEach(function (timeName) {
                let totalExceedQuantity = roundNumber(sumBy(groupedByTime[timeName], 'exceedQuantity'), 2);
                let avgTvoc = roundNumber(meanBy(groupedByTime[timeName], 'avgTvoc'), 3);
                if(totalExceedQuantity < minQty){
                    minQty = totalExceedQuantity;
                }
                if(totalExceedQuantity > minQty){
                    minQty = totalExceedQuantity;
                }
                chartData[newKeyName].values.push({
                    date: new Date(timeName),
                    exceedQuantity: totalExceedQuantity,
                    avgTvoc: avgTvoc,
                });
                chartData[newKeyName].valueMap = keyBy(chartData[newKeyName].values, 'date');
                chartData[newKeyName].exceedBaseLine = exceedBaseLine;
            });
        }

    });


   // console.log('_allDateValues.lengh', Object.keys(_allDateValuesMap).length);
    _allDateValues = Object.keys(_allDateValuesMap).map(item=> new Date(item));
    //dateRanges;
    _allDateValues = sortBy(_allDateValues, item=> new Date(item.date));

    Object.keys(chartData).forEach((keyName)=>{
        let obj = chartData[keyName];
        if(obj && obj.values && obj.valueMap &&  Array.isArray(obj.values) && obj.values.length>0){
            let lastTvoc;
            let lastExceedQuantity;
            _allDateValues.forEach(function (dateItem){
                let foundValItem =  obj.valueMap[dateItem];
                if(foundValItem && !isNil(foundValItem.exceedQuantity)){
                    lastTvoc = foundValItem.avgTvoc;
                    lastExceedQuantity = foundValItem.exceedQuantity;
                } else if(!isNil(lastExceedQuantity)) {
                    chartData[keyName].valueMap[dateItem] = {
                        avgTvoc: lastTvoc,
                        exceedQuantity: lastExceedQuantity,
                        date: new Date(dateItem)
                    }
                }
            });
            chartData[keyName].values = sortBy(Object.values(obj.valueMap), 'date');
            chartData[keyName].minQty = minQty;
            chartData[keyName].maxQty = maxQty;
            //let colorScale = d3.scaleLinear().domain([newData[keyName].tVocVariance, newData[keyName].maxAvgTvoc]).range(['#1a9850', '#FFD632']).interpolate(d3.interpolateHcl);
            //let colorScale =  d3.scaleLinear().domain([tVocVariance, maxAvgTvoc]).range(['#1a9850', '#FFD632']).interpolate(d3.interpolateHcl);
            // newData[keyName].colorScale = colorScale;
        }
    });

    return {
        _maxQty: maxQty,
        _minQty: minQty,
        _chartData: chartData,
        _allDateValues: _allDateValues,
    };
}


// eslint-disable-next-line no-restricted-globals
self.addEventListener("message", function (e) {
    if(e.data && e.data.data && Array.isArray(e.data.data)){
        let data = e.data.data;
        let exceedBaseLine = e.data.exceedBaseLine;
        let result = [];
        data.map((item => {
            result = [...result, ...item];
        }));
        let _allResult = [...result];
       let output =  prepareChartReadyData({data:_allResult, daysMode: e.data.daysMode, exceedBaseLine: exceedBaseLine, selectedDateRange: e.data.selectedDateRange });
      // output._allResult = _allResult;
       // console.log('output', output);
        // eslint-disable-next-line no-restricted-globals
        self.postMessage(output);
    }
}, false);
