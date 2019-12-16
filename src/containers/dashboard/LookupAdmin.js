import React, {useContext, useEffect, useState} from 'react';
import {lookupService} from "../../services/lookupService";
import Paper from "@material-ui/core/Paper";
import LookupEditor, {LookupFieldNames} from "../../components/lookup/LookupEditor";
import DataView from "../../components/DataView/DataView";
import {withStyles} from "@material-ui/core";
import DomainLookupEditor, {DomainLookupFieldNames} from "../../components/lookup/DomainLookupEditor";
import {domainLookupService} from "../../services/domainLookupService";
import {GlobalDataContext} from "../DataProvider/DataProvider";

const styles = theme => ({
    root: {
        width: '100%',
        marginTop: theme.spacing(1),
        overflowX: 'auto',
    },
    paper: {
        display: 'flex',
        overflow: 'auto',
        flexDirection: 'column',
        alignItems: 'left',
    }
});

function LookupAdmin(props) {
    const {classes} = props;
    const {refreshAllLookups} = useContext(GlobalDataContext);
    function onSubmitSuccess() {
        refreshAllLookups();
    }

    return (
        <Paper className={classes.paper}>
            <DataView  dataProvider={lookupService}  onSubmitSuccess={onSubmitSuccess} fieldNames={LookupFieldNames} title={"Lookups"} EditorRef={LookupEditor}>
            </DataView>
            <DataView  dataProvider={domainLookupService} fieldNames={DomainLookupFieldNames}   onSubmitSuccess={onSubmitSuccess}  title={"Domain Lookups"} EditorRef={DomainLookupEditor}>
            </DataView>
        </Paper>
    )
}


export default withStyles(styles)(LookupAdmin);