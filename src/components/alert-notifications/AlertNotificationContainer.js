import React, {useContext, useEffect, useReducer} from 'react';
import {CollectionDataContext} from "../collection/CollectionDataProvider";
import {withRouter} from "react-router";
import {Grid, makeStyles, Paper} from "@material-ui/core";
import '../../styles/_animate_base_container.scss';
import Button from "@material-ui/core/Button";
import AlertConfigEditor from "../alert-config/AlertConfigEditor";
import classnames from "classnames";
import Toolbar from "@material-ui/core/Toolbar";
import {alertNotificationService} from "../../services/alertNotificationService";
import DataViewMinimal from "../DataView/DataViewMinimal";
import {format, formatDistance} from "date-fns";


const useStyles = makeStyles(theme => ({
    paper: {
        padding: 0,
        textAlign: 'center',
        color: theme.palette.text.secondary,
        //  height: '100%',
        animation: 'animate-base-container 850ms forwards',
        //display: 'flex',
        //  flexWrap: 'wrap',
        //  flexGrow:1,
        //  flexDirection:  'row',
        background: 'transparent',
        height: 'calc(100%)',
        minHeight: 'calc(100%)',
        maxHeight: 'calc(100%)',
        alignItems: 'stretch',
        justifyContent: 'stretch',
    },
    Container: {
        flexGrow: 1,
        display: 'flex',
        //flexDirection: 'column',
        padding: 0,
        flexWrap: 'wrap',
        height: 'calc(100%)',
        width: 'calc(100%)',
        alignItems: 'stretch',
        justifyContent: 'stretch',
        backgroundColor: 'none'
    },
    root: {
        backgroundColor: theme.palette.background.default,
        display: 'flex',
        flexWrap: 'wrap',
        paddingLeft: '10px',
        minHeight: '5px',
        height: '30px'
    },
    toolbar: {
        height: 'auto',
        flex: 'none',
        width: 'calc(100%)'
    },
    toolbarAddButton: {
        padding: 0
    },
    exportButton: {
        padding: 0,
    },
    title: {
        textAlign: 'left',
        flexGrow: 1,
        paddingTop: '5px',
    },
    heading: {
        fontSize: '.9rem',
        textTransform: 'uppercase',
        fontWeight: '700',
    },
    selectedButton: {
        color: theme.palette.text.primary,
        backgroundColor: theme.palette.primary.main
    },
    smallButton:{
        minWidth: '30px',
        padding: 0,
    },
    datePickerDialogue: {
        color: 'inherit',
        '& .MuiDialogActions-root': {
            '& button': {
                color: 'inherit'
            }
        }
    },
    card: {
        maxWidth: 345,
        animation: 'animate-base-container 850ms forwards'
    },
    container:{
        animation: 'animate-base-container 850ms forwards'
    }
}));

function reducer(currentState, newState) {
    return {...currentState, ...newState};
}

function useAlertNotificationContainer({reference_id, reference_type, match, history, companyId}) {

    const {collections,  refresh,  updatePartial } =  useContext(CollectionDataContext);

    const [{isAlertConfigOpen}, setState] = useReducer(reducer, {
        isAlertConfigOpen: false,

    });

    function setOpen(isOpen) {
        setState({
            isAlertConfigOpen: false
        })
    }

    return {
        isAlertConfigOpen,
        setState,
        setOpen
    }



}

const fieldNames = [{
    name: 'timestamp',
    label: 'Date',
    render: (row) => {
        if (row && row['timestamp']) {
            return format(new Date(row['timestamp']), 'MM/dd/yyyy HH:mm:ss', {awareOfUnicodeTokens: true});
        }
        return null;
    }},
    {
        name: 'alert_values',
        label:'Alert',
        render: (row) => {
            if (row && row['alert_values']) {
                let alert_values = row['alert_values'];
                 let str =  alert_values.map(item => {
                     return item.property +
                         ' : ' +
                         item.propertyVal +
                         ' ( ' +
                         item.op +
                         ' ' +
                         item.compareVal +
                         ' )';
                 }).join('');

                return str;
            }
            return null;
        },
}];

const AlertNotificationContainer = React.memo(function ({reference_id, reference_type, companyId, operational_unit_id, site_id, match, history}) {

    const {isAlertConfigOpen,
        setState, setOpen} = useAlertNotificationContainer({reference_id, reference_type, match, history, companyId});

    const classes = useStyles();

    return (<Paper className={classes.paper}>
        <Grid container spacing={1}>
            <Grid item xs={12} className={classes.toolbar}>
                <Toolbar
                    className={classnames(classes.root)}>
                    <Button color='primary' onClick={e=> setState({isAlertConfigOpen: true})}>Alert Configs</Button>
                </Toolbar>
            </Grid>
            <Grid item xs={12}>
                {(companyId || operational_unit_id || site_id) && (
                    <DataViewMinimal dataViewName={'notification-table'} hideTitle={true}
                                     dataProvider={alertNotificationService}
                                     params={{companyId : companyId, '$site.collection_ID$': operational_unit_id, site_ID: site_id}}
                                     hideRemoveButton={true}
                                     fieldNames={fieldNames} title="Notifications"
                    >
                    </DataViewMinimal>
                )}
            </Grid>
            {isAlertConfigOpen && (
                <AlertConfigEditor companyId={companyId} open={Boolean(isAlertConfigOpen)} setOpen={setOpen} />
            )}
        </Grid>
    </Paper>)
});


export default withRouter(AlertNotificationContainer);