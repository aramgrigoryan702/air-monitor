import React, {useEffect, useState} from "react";
import {companyService} from "../../services/companyService";
import InputLabel from "@material-ui/core/InputLabel";
import NativeSelect from "@material-ui/core/NativeSelect";

function CollectionSelector(props) {
    const [collectionData, setCollectionData] = useState([]);
    useEffect(()=>{
        companyService.query({offset: 0, limit:  100, sort_column: 'name', sort_order: 'asc'}).then((result)=>{
            if(result && result.data){
                setCollectionData(result.data);
            }
        }).catch(err=>{
            console.log(err);
        });
    },[]);

    return (
        <React.Fragment>
            <InputLabel >{props.label}</InputLabel>
            <NativeSelect {...props} defaultValue={props.defaultValue}>
                <option key={'top-option'}>Select Company</option>
                {collectionData && collectionData.map((row, index)=>(
                    <option key={'opt-'+index} value={row.id}>{row.name}</option>
                ))}
            </NativeSelect>
        </React.Fragment>
    )
}

export default CollectionSelector;