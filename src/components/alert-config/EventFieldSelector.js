import React, {useEffect, useState} from "react";
import InputLabel from "@material-ui/core/InputLabel";
import NativeSelect from "@material-ui/core/NativeSelect";
import Select from "@material-ui/core/Select";
import MenuItem from "@material-ui/core/MenuItem";


const eventFields = [{
         name: 'tVOC1',
         label: 'tVOC1',
    },
    {
        name: 'tVOC2',
        label: 'tVOC2',
    }, {
        name: 'tempF',
        label: 'tempF',
    },{
        name: 'Humidity',
        label:'Humidity'
    },{
        name: 'WindSpeed',
        label: 'WindSpeed'
    },{
        name: 'Battery',
        label: 'Battery'
    },{
        name: 'Voltage',
        label: 'Voltage'
    },{
        name: 'ChargeDifferential',
        label: 'ChargeDifferential'
    },  {
        "name": "U",
        "label": "U"
    },
    {
        "name": "IT",
        "label": "IT"
    },
    {
        "name": "ET",
        "label": "ET"
    },
    {
        "name": "IH",
        "label": "IH"
    },
    {
        "name": "EH",
        "label": "EH"
    },
    {
        "name": "P",
        "label": "P"
    },
    {
        "name": "TVOC_PID",
        "label": "TVOC_PID"
    },
    {
        "name": "PM1_0",
        "label": "PM1_0"
    },
    {
        "name": "PM2_5",
        "label": "PM2_5"
    },
    {
        "name": "PM10",
        "label": "PM10"
    },
    {
        "name": "CO",
        "label": "CO"
    },
    {
        "name": "CO2",
        "label": "CO2"
    },
    {
        "name": "SO2",
        "label": "SO2"
    },
    {
        "name": "O2",
        "label": "O2"
    },
    {
        "name": "O3",
        "label": "O3"
    },
    {
        "name": "NO2",
        "label": "NO2"
    },
    {
        "name": "H2S",
        "label": "H2S"
    },
    {
        "name": "CH4_S",
        "label": "CH4_S"
    },
    {
        "name": "Sig",
        "label": "Sig"
    }];

function EventFieldSelector(props) {

    return (
        <React.Fragment>
            <InputLabel id="event-field-label">{props.label}</InputLabel>
            <Select labelId="event-field-label" {...props} value={props.defaultValue}>
                {eventFields && eventFields.map((row, index)=>(
                    <MenuItem key={'opt-'+index} value={row.name}>{row.label}</MenuItem>
                ))}
            </Select>
        </React.Fragment>
    )
}

export default EventFieldSelector;