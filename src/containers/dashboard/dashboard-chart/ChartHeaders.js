import {keyBy} from "lodash";

const sensorNames = [{name: 'tVOC1', label: 'TVOC1', unitName: 'ppm', yRange: [0, 30]},
    {name: 'TVOC_PID', label: 'TVOC_PID', unitName: 'ppm', yRange: [0, 30]},
    {name: 'CH4_S', label: 'CH4_S', unitName: 'ppm'},
    {name: 'Battery', 'label': 'Battery', yRange: [0, 100], suffix: '%', unitName: '%'},
    {name: 'TempF', label: 'Temperature', unitName: '°F'}, {
        name: 'Humidity', label: 'Humidity', yRange: [0, 100],
        suffix: '%',
        unitName: '%'
    },
    {name: 'PM1_0', label: 'PM1_0'},
    {name: 'PM2_5', label: 'PM2_5'},
    {name: 'PM10', label: 'PM10'},
    {name: 'WindDirection', label: 'WindDirection'},
    {name: 'WindSpeed', unitName: 'mph', label: 'WindSpeed', yRange: [0, 20]}];

const sensorNamesByName = keyBy(sensorNames, 'name');
const sensorNameKeys = sensorNames.map(item => item.name);

const sensorOptions = [{
    name: 'tVOC1',
    label: 'TVOC1'
},{
    name: 'TVOC_PID',
    label: 'TVOC_PID'
}, {
    name: 'CH4_S',
    label: 'CH4_S'
},{
    name: 'PM1_0',
    label: 'PM1_0',
}, {
    name: 'PM2_5',
    label: 'PM2_5',
}, {
    name: 'PM10',
    label: 'PM10',
}];

export {sensorNames,sensorNamesByName,  sensorNameKeys, sensorOptions};