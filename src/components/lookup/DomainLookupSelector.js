import React, {useEffect, useState} from "react";
import {domainLookupService} from "../../services/domainLookupService";
import InputLabel from "@material-ui/core/InputLabel";
import NativeSelect from "@material-ui/core/NativeSelect";

function DomainLookupSelector(props) {
    const [lookups, setLookups] = useState([]);
    useEffect(()=>{
        domainLookupService.find({offset: 0, limit:  100, sort_column: 'name', sort_order: 'asc'}).then((result)=>{
            setLookups(result.data);
        }).catch(err=>{
            console.log(err);
        });
    },[]);

    return (
        <React.Fragment>
            <InputLabel>{props.label}</InputLabel>
            <NativeSelect {...props} defaultValue={props.defaultValue}>
                <option value=''>Select {props.label}</option>
                {lookups && lookups.map((row)=>(
                    <option value={row.id}  key={row.id}>{row.name}</option>
                ))}
            </NativeSelect>
        </React.Fragment>
    )
}

export  default DomainLookupSelector;
