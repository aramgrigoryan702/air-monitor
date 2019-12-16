import React, {useContext, useEffect, useState} from 'react';
import {withRouter} from "react-router";
import TinySpinner from "../../components/TinySpinner";
import {useSnackbar} from "notistack";
import {makeStyles, Paper, withStyles} from "@material-ui/core";
import {useOverview} from "./Overview";
import {siteService} from "../../services/siteService";
import SiteForm from "../../components/Site/SiteForm";
import querySearch from "stringquery";
import {CollectionDataContext} from "../../components/collection/CollectionDataProvider";
import {deviceService} from "../../services/deviceService";
import NotFound_404 from "../../components/notfound/NotFound_404";


const  useStyles =makeStyles(theme => ({
    paper:{
        width: `calc(100%)`,
        display: 'flex',
        height: 'calc(100%)',
        padding: 0,
        flexDirection: 'column',
        color: theme.palette.text.secondary,
        backgroundColor: theme.palette.background.default,
    }
}));

function SiteAdmin(props) {
    const classes = useStyles();
    const { match, location} = props;
    const { enqueueSnackbar, closeSnackbar } = useSnackbar();
    const [dataset, setDataset] = useState(0);
    const [siteId,  setSiteId] = useState(0);
    const [defaultLocation,  setDefaultLocation] = useState(undefined);
    const { deviceData, primarySensorName } = useOverview({...props});
    const {collections,  refresh,  updatePartial } =  useContext(CollectionDataContext);
    const [isLoading, setIsLoading] = useState(false);
    const [siteNotFound, setSiteNotFound] = useState(false);

    useEffect(()=>{
        let idParam = match.params.id ? match.params.id : null;
        if (idParam !== 'unassigned') {
            idParam = parseInt(idParam);
        }
        setSiteId(idParam);
        if(location.search){
            let query = querySearch(location.search);
            if(query){
                const {device_id, lat, lng}  =  query;
                if(lat || lng ){
                    setDefaultLocation({ lat: parseFloat(lat), lng: parseFloat(lng)});
                } else {
                    setDefaultLocation(undefined);
                }
            } else{
                setDefaultLocation(undefined);
            }
        }else {
            setDefaultLocation(undefined);
        }

    }, [match.params.id]);

    useEffect(()=>{
        if(!siteId){
            setDataset(null);
            setIsLoading(false);
        }  else {
            setIsLoading(true);
            fetchSiteData();
        }
    }, [siteId, collections]);



    function onSelectDevicePosition(params) {
        deviceService.updateLocation(params.id, {lat: params.lat, lng: params.lng}).then(()=>{
            refresh();
            enqueueSnackbar('Device location has been updated successfully.', {variant: 'success'});
        }).catch(error=>{
            enqueueSnackbar(error.message, {variant: 'error'});
        })
    }


    function onSelectDeviceAutoRelocate(params) {
        deviceService.unlockDeviceLocation(params.id).then(()=>{
            refresh();
            enqueueSnackbar('Device location lock has been removed successfully.', {variant: 'success'});
        }).catch(error=>{
            enqueueSnackbar(error.message, {variant: 'error'});
        })
    }

    function onSubmitSuccess(newData) {
        refresh();
        enqueueSnackbar('Site data has been saved successfully.', {variant: 'success'});
    }

    function onSubmitError(error) {
        enqueueSnackbar(error.message, {variant: 'error'});
    }

    function fetchSiteData() {
        if (siteId === 'unassigned') {
            setDataset({id: 'unassigned'});
            setIsLoading(false);
            return;
        }

        siteService.findOne(siteId).then((result) => {
            if (result && result.data) {
                setDataset(result.data);
                setSiteNotFound(false);
            } else {
                setDataset(undefined);
                setSiteNotFound(true);
            }
            setIsLoading(false);
        }).catch((error) => {

            if(error && error.message === 'SITE_NOT_FOUND'){
                setSiteNotFound(true);
            } else {
                enqueueSnackbar(error.message, { variant: 'error'});
                setSiteNotFound(false);
            }
            setIsLoading(false);
        })
    }



    if(isLoading){
        return <TinySpinner/>
    }

    if(siteNotFound === true){
        return  (<NotFound_404/>)
    }

    if(!dataset){
        return null;
    }

    return (
        <Paper className={classes.paper}>
            <SiteForm key={'site_admin_form_'+dataset.id} primarySensorName={primarySensorName} onSelectDeviceAutoRelocate={onSelectDeviceAutoRelocate} onSelectDevicePosition={onSelectDevicePosition}  defaultLocation={defaultLocation} deviceData={deviceData} dataset={{...dataset}}  onSubmitError={onSubmitError} onSubmitSuccess={onSubmitSuccess}/>
        </Paper>
    )
}
export default withRouter(SiteAdmin);
