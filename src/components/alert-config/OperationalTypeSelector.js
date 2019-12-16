import React, {useEffect, useState} from "react";
import InputLabel from "@material-ui/core/InputLabel";
import NativeSelect from "@material-ui/core/NativeSelect";
import MenuItem from "@material-ui/core/MenuItem";
import Select from "@material-ui/core/Select";

const opfields = [{
        name: 'GT',
        label: 'is greater than'
    },{
        name: 'GTE',
        label: 'is greater than/equal'
    },
    {
        name: 'LT',
        label: 'is less than',
    }, {
        name: 'LTE',
        label: 'is less than/equal',
    }, {
        name: 'EQ',
        label: 'is equal',
    }];


function OperationalTypeSelector(props) {

    return (
        <React.Fragment>
            <InputLabel id="op-field-label">{props.label}</InputLabel>
            <Select labelId="op-field-label" {...props} value={props.defaultValue}>
                {opfields && opfields.map((row, index)=>(
                    <MenuItem key={'opt-'+index} value={row.name}>{row.label}</MenuItem>
                ))}
            </Select>
        </React.Fragment>
    )
}

export default OperationalTypeSelector;