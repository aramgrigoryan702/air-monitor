// eslint-disable-next-line no-restricted-globals
//const ctx = global.self;
import {WindDirectionsWeight} from "../components/Charts/MyChart/WindroseScale";
import {roundNumber} from "../helpers/CommonHelper";
import {isValid} from "date-fns";
import {sensorNames, sensorNamesByName, sensorNameKeys} from "../containers/dashboard/dashboard-chart/ChartHeaders";
import {groupBy, keyBy, sortBy} from "lodash/collection";
import {pick} from "lodash/object";
import {meanBy} from "lodash/math";
import {numberFormat} from "underscore.string";
import {uniq} from "lodash";

function prepareChartReadyData(data, primarySensor) {
    const newData = groupBy(data, 'positionName');
    let newDataKeys = Object.keys(newData);
    newDataKeys = sortBy(newDataKeys, function (item) {
        return item && WindDirectionsWeight[item];
    });

    let allDateValues = [];
    let chartReadyData = newDataKeys.map((keyName) => {
        let firstVal = newData[keyName] && newData[keyName].length > 0 ? newData[keyName][newData[keyName].length - 1] : undefined;
        let _values = sortBy(newData[keyName], 'TimeStamp');
        let _valueMap = groupBy(newData[keyName], (item) => {
            return item && item.TimeStamp && item.TimeStamp.toISOString();
        });
        allDateValues = uniq([...allDateValues, ...Object.keys(_valueMap)]);
        return {
            name: keyName,
            keyName: keyName,
            distance: firstVal && firstVal.distance,
            CoreId: firstVal && firstVal.CoreId,
            positionName: firstVal && firstVal.positionName,
            values: _values,
            valueMap: _valueMap,
        }
    });

    allDateValues = sortBy(allDateValues, item => new Date(item));
    const allWindSpeedData = [];
    chartReadyData = chartReadyData.map((item) => {
        item.values = item.values.map((__item) => {
            if (__item.WindSpeed > 0) {
                allWindSpeedData.push({
                    WindSpeed: __item.WindSpeed,
                    WindDirection: __item.WindDirection,
                    date: __item.TimeStamp
                });
            }
            return {
                date: __item.TimeStamp,
                name: __item.positionLookupName,
                keyName: __item.keyName,
                CoreId: __item.CoreId,
                meta: {...pick(__item, sensorNameKeys)},
            }
        });
        let len = item.values.length;
        for (let i = 0; i < len; i++) {

            /*let prevTvoc1 = item.values[i-1] ? item.values[i-1].meta.tVOC1: undefined;
            let prevPrevTvoc1 = item.values[i-2] ?  item.values[i-2].meta.tVOC1 : undefined;
            let prevTVOC_PID = item.values[i-1] ? item.values[i-1].meta.TVOC_PID: undefined;
            let prevPrevTVOC_PID  = item.values[i-2] ?  item.values[i-2].meta.TVOC_PID : undefined;
*/
            let prevPrimarySensorVal = item.values[i - 1] ? item.values[i - 1].meta[primarySensor] : undefined;
            let prevPrevPrimarySensorVal = item.values[i - 2] ? item.values[i - 2].meta[primarySensor] : undefined;
            if (prevPrimarySensorVal && prevPrevPrimarySensorVal && item.values[i].meta[primarySensor]) {
                item.values[i].meta[primarySensor] = roundNumber((item.values[i].meta[primarySensor] * .50) + (prevPrimarySensorVal * .30) + (prevPrevPrimarySensorVal * .2), 3);
            }
            /* if(prevTvoc1 && prevPrevTvoc1 && item.values[i].meta.tVOC1){
                 item.values[i].meta.tVOC1 =  roundNumber((item.values[i].meta.tVOC1 *.50)+ (prevTvoc1 * .30) + (prevPrevTvoc1 *.2), 3);
             }
             if(prevTVOC_PID && prevPrevTVOC_PID && item.values[i].meta.TVOC_PID){
                 item.values[i].meta.TVOC_PID =  roundNumber((item.values[i].meta.TVOC_PID *.50)+ (prevTVOC_PID * .30) + (prevPrevTVOC_PID *.2), 3);
             }*/
        }

        //console.log('chartReadyData', chartReadyData);
        const groupByTimestamp = groupBy(item.values, 'date');
        const newVals = Object.keys(groupByTimestamp).reduce((accum, keyName) => {
            if (groupByTimestamp[keyName].length > 1) {
                let firstItem = groupByTimestamp[keyName][0];
                let computedData = {
                    ...firstItem,
                };
                sensorNameKeys.forEach((sensorKey) => {
                    if (sensorKey === 'Battery') {
                        computedData[sensorKey] = numberFormat(meanBy(groupByTimestamp[keyName], `meta.${sensorKey}`), 3);
                    } else {
                        computedData[sensorKey] = roundNumber(meanBy(groupByTimestamp[keyName], `meta.${sensorKey}`), 4);
                    }
                });
                accum.push(computedData);
            } else {
                accum = [...accum, ...groupByTimestamp[keyName]];
            }
            return accum;
        }, []);
        // item.keyName = item.keyName,
        item.values = newVals;
        item.visible = true;
        return item;
    });

    const groupedSensorData = sensorNames.filter(sensor => sensor.name === 'Humidity' || sensor.name === 'TempF');
    let groupedData = [];
    groupedSensorData.forEach((sensor) => {
        groupedData.push({name: sensor.name, keyName: sensor.keyName, visible: true, values: []});
    });
    let newDataValues = [];
    Object.values(newData).map((itemValues) => {
        itemValues && itemValues.forEach((val => {
            val && newDataValues.push({...val, date: val.TimeStamp});
        }))
    });

    newDataValues = sortBy(newDataValues, 'date');
    let groupedDataAsMap = keyBy(groupedData, 'name');
    const grpByDate = groupBy(newDataValues, 'date');
    Object.keys(grpByDate).forEach((keyName) => {
        groupedSensorData.forEach((sensor) => {
            let value = roundNumber(meanBy(grpByDate[keyName], sensor.name), 2);
            let groupedDataItem = groupedDataAsMap[sensor.name];
            if (groupedDataItem && value) {
                groupedDataItem.values.push({date: new Date(keyName), value: value});
            }
        });
    });


    groupedData = groupedData.map((item) => {
        let newDataValuesLen = item.values.length;
        for (let i = 0; i < newDataValuesLen; i++) {
            //Humidity
            //TempF
            let prevVal = item.values[i - 1] ? item.values[i - 1].value : undefined;
            let prevPrevVal = item.values[i - 2] ? item.values[i - 2].value : undefined;
            if (prevVal && prevPrevVal && item.values[i].value) {
                item.values[i].value = roundNumber((item.values[i].value * .50) + (prevVal * .30) + (prevPrevVal * .2), 0);
            }
        }

        return item;
    });


    let _windSpeedData = [];
    let windSpeedHourGroup = groupBy(allWindSpeedData, 'date');
    Object.keys(windSpeedHourGroup).forEach((keyName) => {
        let keyDate = new Date(keyName);
        if (isValid(keyDate)) {
            const values = windSpeedHourGroup[keyName];
            if (values && values.length > 0) {
                let meanWindSpeed = roundNumber(meanBy(values, 'WindSpeed'), 1);
                let meanWindDirection = roundNumber(meanBy(values, 'WindDirection'), 1);
                _windSpeedData.push({date: keyDate, value: meanWindSpeed, WindDirection: meanWindDirection});
            }
        }
    });
    _windSpeedData = sortBy(_windSpeedData, 'date');
    return {
        _allDateValues: allDateValues,
        _chartReadyData: chartReadyData,
        _windSpeedData,
        _combinedAvgData: groupedData,

    };
}


function mergeWithExistingData(output, existingData){
    

    return output;
}


// eslint-disable-next-line no-restricted-globals
self.addEventListener("message", function (e) {
    console.log("message posted");
    console.log(e.data);
    if (e.data && e.data.data && Array.isArray(e.data.data)) {
        let data = e.data.data;
        let existingData = e.data.existingData;
        if(!existingData){
            existingData = {};
        }
        let primarySensor = e.data.primarySensor;
        let _allResult = [...data];
        let output = prepareChartReadyData(_allResult, primarySensor, existingData);
        output = mergeWithExistingData(output, existingData);
        output._allResult = _allResult;
        // eslint-disable-next-line no-restricted-globals
        
        self.postMessage(output);
    }
}, false);
