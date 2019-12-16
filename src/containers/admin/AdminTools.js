import * as React from "react";
import makeStyles from "@material-ui/core/styles/makeStyles";
import {Grid, Paper} from "@material-ui/core";
import {useSnackbar} from "notistack";
import {AdminService} from "../../services/admin/AdminService";
import {useState} from "react";
import {from, fromEvent, timer} from 'rxjs';
import {map, catchError, debounceTime} from 'rxjs/operators';
import TinySpinner from "../../components/TinySpinner";
import Button from "@material-ui/core/Button";
import Card from "@material-ui/core/Card";
import CardHeader from "@material-ui/core/CardHeader";
import CardContent from "@material-ui/core/CardContent";
import Typography from "@material-ui/core/Typography";
import {useEffect} from "react";
import RadarChart from "../../components/Charts/radarChart/RadarChart";

const useStyles = makeStyles({
    card: {
        minWidth: 275,
    },
    bullet: {
        display: 'inline-block',
        margin: '0 2px',
        transform: 'scale(0.8)',
    },
    title: {
        fontSize: 14,
    },
    pos: {
        marginBottom: 12,
    },
});

export function AdminTools() {


    const classes = useStyles();
    const {enqueueSnackbar} = useSnackbar();
    const subscriptionRef = React.useRef();
    const [isRefreshingDataView, setRefreshingDataView] = useState(false);
    const [isRefreshingStagingDb, setRefreshingStagingDB] = useState(false);
    const [currentAdminJob, setCurrentAdminJob] = useState(false);

    useEffect(()=>{
        subscriptionRef.current = [];
        try {
            const dt = window.localStorage.getItem("current_admin_job");
            if (dt) {
                    let _parsedJob = JSON.parse(dt);
                    if(_parsedJob && _parsedJob.id){
                        setCurrentAdminJob(_parsedJob);
                        setRefreshingStagingDB(true);
                    }
            }
        } catch (err) {
            console.log(err);
        }
    }, []);



    useEffect(()=>{
        if(currentAdminJob && currentAdminJob.id){
            try {
                window.localStorage.setItem("current_admin_job", JSON.stringify(currentAdminJob) );
            } catch (err) {
                console.log(err);
            }

            if (subscriptionRef && subscriptionRef.current) {
                subscriptionRef.current.forEach((subscription) => {
                    if (subscription) {
                        subscription.unsubscribe();
                    }
                });
            }
            if(currentAdminJob.state === 'stuck'){
                enqueueSnackbar(currentAdminJob.reason, {variant: 'error'});
                setCurrentAdminJob(undefined);
                window.localStorage.removeItem("current_admin_job");
            } else {
                let newSub= timer((1000 * 5), (1000 * 25)).subscribe(()=>{
                    refreshJobStatus();
                });
                subscriptionRef.current.push(newSub);
            }

            return () => {
                if (subscriptionRef && subscriptionRef.current) {
                    subscriptionRef.current.forEach((subscription) => {
                        if (subscription) {
                            subscription.unsubscribe();
                        }
                    });
                    subscriptionRef.current = [];
                }
            }
        }

    }, [currentAdminJob]);

    function refreshDataView() {
        setRefreshingDataView(true);
        AdminService.refreshDataView().then(()=>{
            setRefreshingDataView(false);
        }).catch((err)=>{
            setRefreshingDataView(false);
        });
    }

    function saveJobOnStorage(job) {
        setTimeout(() => {
            try {
                window.localStorage.setItem("current_admin_job", JSON.stringify(job));
            } catch (err) {
                console.log(err);
            }
        }, 50);
    }

    function refreshStagingDB() {
        setRefreshingStagingDB(true);
        AdminService.refreshStagingData().then((result)=>{
            let job = result;
            if(job && job.id){
                setCurrentAdminJob(job);
            }
            enqueueSnackbar('Staging DB syncing job has been initiated successfully.', {variant: "success"});
           // setRefreshingStagingDB(false);
        }).catch((err)=>{
            setRefreshingStagingDB(false);
        });
    }

    function refreshJobStatus() {
        AdminService.getQueueStatus(currentAdminJob.id).then((result)=>{
            let job = result;
            console.log('job refreshed data', job);
            if(job && job.id){
                setCurrentAdminJob(job);
            }
        }).catch((err)=>{
            if(currentAdminJob && currentAdminJob.state === 'active'){
                enqueueSnackbar('Staging DB syncing job has been executed successfully. Please refresh the browser', {variant: "success"});
                setCurrentAdminJob(undefined);
                window.localStorage.removeItem("current_admin_job");
            }
            setRefreshingStagingDB(false);
        });
    }


    return (
        <Card>
            <CardContent>
            <Typography className={classes.title} color="textSecondary" gutterBottom>
                Admin Tools
            </Typography>
                <Button color="secondary" onClick={refreshDataView}>
                    {isRefreshingDataView ? (<TinySpinner>Refreshing</TinySpinner>): 'Force Refresh Dataview'}
                </Button>
                <Button color="secondary" onClick={refreshStagingDB}>
                    {isRefreshingStagingDb ? (<React.Fragment>Updating Staging Database is { currentAdminJob && currentAdminJob.state } <TinySpinner></TinySpinner> </React.Fragment>): 'Sync Staging DB with Production'}
                </Button>
            </CardContent>
        </Card>
    )

}