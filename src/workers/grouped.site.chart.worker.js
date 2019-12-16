// eslint-disable-next-line no-restricted-globals
//const ctx = global.self;
import {WindDirectionsWeight} from "../components/Charts/MyChart/WindroseScale";
import {roundNumber} from "../helpers/CommonHelper";
import * as d3 from "d3";
import {groupBy, keyBy, sortBy} from "lodash/collection";
import {uniq} from "lodash";
import {isWithinInterval} from 'date-fns';

function prepareHistogram(params) {

    let {data, daysMode,  selectedDateRange} = params;
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
    //
    let _allDateValues = [];
    const newData = groupBy(data, 'siteID');
    let maxAvgTvoc = 0;
    Object.keys(newData).forEach((keyName)=>{
        let values = newData[keyName];
        if(Array.isArray(values) && values.length>0){
            let _values = sortBy(newData[keyName], 'TimeStamp');
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

            let newValues = [];
            let groupedByTimeSTAMP = groupBy(_values, 'TimeStamp');
            let keys= Object.keys(groupedByTimeSTAMP);
            keys = sortBy(keys, item=> new Date(item));
           // console.log(keys);
            keys.forEach(function (itemKey) {
                _allDateValues.push(new Date(itemKey));
                let _dVals = groupedByTimeSTAMP[itemKey];
                let avgTvoc = 0;
                if(Array.isArray(_dVals)){
                    avgTvoc = d3.mean(_dVals.map(item=> item.avgTvoc));
                }
                if(avgTvoc > maxAvgTvoc){
                    maxAvgTvoc = avgTvoc;
                }
                newValues.push({
                    date: new Date(itemKey),
                    avgTvoc: roundNumber(avgTvoc, 3),
                });
            });
            newData[keyName] = { values: newValues, valueMap: keyBy(newValues, 'date'), maxAvgTvoc: roundNumber(maxAvgTvoc, 3), tVocVariance: roundNumber(d3.variance(_values.map(item=> item && item.avgTvoc)), 3)};
        } else {
            newData[keyName] = { values: [], valueMap: {}, tVocVariance: undefined, maxAvgTvoc: undefined};
        }
    });
    //console.log('_allDateValues', _allDateValues);
    _allDateValues = uniq(_allDateValues);
    //dateRanges;
    _allDateValues = sortBy(_allDateValues, item=> new Date(item.date));
    Object.keys(newData).forEach((keyName)=>{
        let obj = newData[keyName];
        if(obj && obj.values && obj.valueMap &&  Array.isArray(obj.values) && obj.values.length>0){
            let lastTvoc;
            _allDateValues.forEach(function (dateItem){
               let foundValItem =  obj.valueMap[dateItem];
               if(foundValItem && foundValItem.avgTvoc > 0){
                   lastTvoc = foundValItem.avgTvoc;
               } else if(lastTvoc && lastTvoc > 0) {
                  newData[keyName].valueMap[dateItem] = {
                       avgTvoc: lastTvoc,
                       date: new Date(dateItem)
                  }
               }
            });
            newData[keyName].values = sortBy(Object.values(obj.valueMap), 'date');

            //let colorScale = d3.scaleLinear().domain([newData[keyName].tVocVariance, newData[keyName].maxAvgTvoc]).range(['#1a9850', '#FFD632']).interpolate(d3.interpolateHcl);
            //let colorScale =  d3.scaleLinear().domain([tVocVariance, maxAvgTvoc]).range(['#1a9850', '#FFD632']).interpolate(d3.interpolateHcl);
           // newData[keyName].colorScale = colorScale;
        }
    });
    return {
        chartData: newData,
        _allDateValues: _allDateValues,
    };
}


// eslint-disable-next-line no-restricted-globals
self.addEventListener("message", function (e) {
    if(e.data && e.data.data && Array.isArray(e.data.data)){
        let data = e.data.data;

      // output._allResult = _allResult;
       // console.log('output', output);
        // eslint-disable-next-line no-restricted-globals
       // self.postMessage(output);
    }
}, false);
