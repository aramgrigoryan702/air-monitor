import React, {useContext, useEffect, useState} from 'react';
import CompanyForm from "../../components/Company/CompanyForm";
import {withRouter} from "react-router";
import {GlobalDataContext} from "../DataProvider/DataProvider";
import TinySpinner from "../../components/TinySpinner";
import {CollectionDataContext} from "../../components/collection/CollectionDataProvider";
import {useSnackbar} from "notistack";
import {makeStyles, Paper, Typography} from "@material-ui/core";
import {useOverview} from "./Overview";
import NotFound_404 from "../../components/notfound/NotFound_404";

const  useStyles = makeStyles(theme => ({
    paper:{
        height: '100%',
        width:  '100%',
        display: 'flex',
        flexDirection: 'column',
        padding: 0,
        color: theme.palette.text.secondary,
        backgroundColor: theme.palette.background.default,
    }
}));

const CompanyAdmin =  React.memo(function CompanyAdmin(props) {

    const classes = useStyles();
    const { match } = props;
    const { enqueueSnackbar, closeSnackbar } = useSnackbar();
    const [dataset, setDataset] = useState(0);
    const {getLookupsForDomainName} = useContext(GlobalDataContext);
    const companyId = match.params && match.params.id ? parseInt(match.params.id): null;
    const [lookupId, setLookupId] = useState(0);
    const [isLoading, setIsLoading] = useState(false);
    const [companyNotFound, setCompanyNotFound] = useState(false);
    const {collections,  refresh,  updatePartial } =  useContext(CollectionDataContext);
    const {deviceData, primarySensorName } = useOverview({...props, containerType: 'company'});

    useEffect(()=>{
        if(!companyId){
            setDataset(null);
            setIsLoading(false);
        }  else {
            setIsLoading(true);
            setDataset(undefined);
            fetchCompanyData();
        }
    }, [companyId, collections]);

    function onSubmitSuccess(newData) {
        if(newData && newData.data){
            updatePartial(newData);
        }
        enqueueSnackbar('Company data has been saved successfully.', {variant: 'success'});
    }

    function onSubmitError(error) {
        enqueueSnackbar(error.message, {variant: 'error'});
    }

    function fetchCompanyData() {
        let lookupsData = getLookupsForDomainName('COMPANY');
        if (lookupsData && lookupsData.length > 0) {
            if (lookupsData[0] && lookupsData[0].id) {
                setLookupId(lookupsData[0].id);
            } else{
                setLookupId(undefined);
            }
        }
        let fetchedData = collections[companyId];
        if(fetchedData){
            setDataset({...fetchedData});
            setCompanyNotFound(false);
        } else {
            setDataset(undefined);
            setCompanyNotFound(true);
        }
        setIsLoading(false);
    }
    if(isLoading){
        return <TinySpinner/>
    }
    if(companyNotFound === true){
        return  (<NotFound_404/>)
    }
    return (
        <Paper className={classes.paper}>
            <CompanyForm key={'company_admin_form_'+dataset.id} primarySensorName={primarySensorName}  deviceData={deviceData} dataset={{...dataset}} onSubmitError={onSubmitError} onSubmitSuccess={onSubmitSuccess}>
            </CompanyForm>
        </Paper>
    )
});


export default withRouter(CompanyAdmin);
