import React, {useContext, useEffect, useState} from 'react';
import DivisionForm from "../../components/Division/DivisionForm";
import {withRouter} from "react-router";
import TinySpinner from "../../components/TinySpinner";
import {CollectionDataContext} from "../../components/collection/CollectionDataProvider";
import {useSnackbar} from "notistack";
import {makeStyles, Paper, withStyles} from "@material-ui/core";
import {useOverview} from "./Overview";
import NotFound_404 from "../../components/notfound/NotFound_404";


const  useStyles = makeStyles(theme => ({
    paper:{
        width:  '100%',
        display: 'flex',
        flexDirection: 'column',
        padding: 0,
        color: theme.palette.text.secondary,
        backgroundColor: theme.palette.background.default,
    }
}));

function DivisionAdmin(props) {

    const {match} = props;
    const classes = useStyles();
    const { enqueueSnackbar, closeSnackbar } = useSnackbar();
    const [dataset, setDataset] = useState(0);
    const [divisionId,  setDivisionId] = useState(0);
    const {collections,  refresh,  updatePartial } =  useContext(CollectionDataContext);
    const {deviceData, primarySensorName } = useOverview({...props, containerType: 'division'});
    const [isLoading, setIsLoading] = useState(false);
    const [divisionNotFound, setDivisionNotFound] = useState(false);

    useEffect(()=>{
        if(!divisionId){
            setDataset(null);
        }  else {
            setIsLoading(true);
            fetchCompanyData();
        }
    }, [divisionId, collections]);

    useEffect(()=>{
        let _id = match.params.id ? parseInt(match.params.id): null;
        setDivisionId(_id);
    }, [match.params.id]);


    function onSubmitSuccess(newData) {
        if(newData && newData.data){
            updatePartial(newData);
        }
        enqueueSnackbar('Operational unit has been saved successfully.', {variant: 'success'});
    }

    function onSubmitError(error) {
        enqueueSnackbar(error.message, {variant: 'error'});
    }

    function fetchCompanyData() {
        let fetchedData = collections[divisionId];
        if(fetchedData){
            setDataset({...fetchedData});
            setDivisionNotFound(false);
        } else {
            setDataset(undefined);
            setDivisionNotFound(true);
        }
        setIsLoading(false);
    }

    if(isLoading){
        return <TinySpinner/>
    }
    if(divisionNotFound === true){
        return  (<NotFound_404/>)
    }
    if(!dataset){
        return null;
    }

    return (
        <Paper className={classes.paper}>
            <DivisionForm  primarySensorName={primarySensorName} key={'division_admin_form_'+dataset.id} deviceData={deviceData} dataset={{...dataset}} onSubmitError={onSubmitError} onSubmitSuccess={onSubmitSuccess}/>
        </Paper>
    )
}
export default withRouter(DivisionAdmin);
