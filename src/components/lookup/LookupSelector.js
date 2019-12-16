import React, {useContext, useEffect, useState} from "react";
import InputLabel from "@material-ui/core/InputLabel";
import NativeSelect from "@material-ui/core/NativeSelect";
import {GlobalDataContext} from "../../containers/DataProvider/DataProvider";

function LookupSelector(props) {

    const  {domainName, reference_type} = props;
    const {getLookupsForDomainName} = useContext(GlobalDataContext);
    const [lookups, setLookups] = useState([]);
    useEffect(()=>{
        //referenceType
        let _data =  getLookupsForDomainName(domainName);
        if(reference_type){
            _data = _data.filter(item=> item && item.reference_domainID  === reference_type);
        }
        setLookups(_data);
    },[domainName, reference_type]);

    return (
        <React.Fragment>
            <InputLabel>{props.label}</InputLabel>
            <NativeSelect {...props} defaultValue={props.value}>
                <option value=''>Select {props.label}</option>
                {lookups && lookups.map((row)=>(
                    <option value={row.id} key={row.id}>{row.name}</option>
                ))}
            </NativeSelect>
        </React.Fragment>
    )
}

export  default LookupSelector;
