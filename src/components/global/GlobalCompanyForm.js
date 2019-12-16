import React, {useEffect} from 'react';
import Button from "@material-ui/core/Button";
import {Card, CardContent, CardHeader, DialogTitle, Paper, Typography} from "@material-ui/core";
import withStyles from "@material-ui/core/es/styles/withStyles";
import TinySpinner from "../TinySpinner";
import {Form, withFormik} from "formik";
import * as Yup from "yup";
import {collectionService} from "../../services/collectionService";
import DynamicFormField from "../DynamicFormField/DynamicFormField";
import GoogleMapComponent from "../googlemaps/GoogleMapComponent";
import Grid from "@material-ui/core/Grid";

export const fieldNames = [{
    name: 'lat',
    hideLabel:  true,
    label: 'Lat',
    type: 'number',
    isEditable: false
}, {
    name: 'lng',
    label: 'Lon',
    hideLabel:  true,
    type: 'number',
    isEditable: false
}];


const style = theme => ({
    card: {
        width: '100%',
        height: '100%',
        flexGrow: 1,
        padding: theme.spacing(1),
    },
    cardHeader:{
        padding:  0,
        fontSize: ".8rem",
    },
    form: {
        width: '100%', // Fix IE 11 issue.
        height: '100%',
        display: 'flex'
        // marginTop: theme.spacing.unit,
    },
    cardContent: {
        position:  'relative',
        padding: 0,
    },
    mapContainer: {
        height: '85vh',
        width: '100%',
    },
    cardActions: {
        justifyContent: 'flex-end'
    },
    submit: {
        marginTop: theme.spacing(3),
    },
    paper: {
        padding:  theme.spacing(1),
        textAlign: 'center',
        color: theme.palette.text.secondary,
        position:  'absolute',
        top: '65px',
        left: '11px',
        margin: 0,
        marginLeft: '10px',
        marginRight: '10px',
        height: '30px',
        overflow:'hidden',
        width: '300px',
        animation: 'animate-base-container 850ms forwards'
    },
    innerFormGroup:{
        justifyContent: 'center',
        alignItems: 'center',
        margin: 0,
    },
    dropPinBtn:{
        padding:  '0px'
    },
    heading: {
        fontSize: '.9rem',
        textTransform: 'uppercase',
        fontWeight:'700',
    },
});

function GlobalCompanyForm(props) {

    const {
        open, setOpen, onSubmitSuccess, values,
        dataset,
        classes,
        touched,
        dirty,
        handleSubmit,
        isSubmitting,
        setFieldValue,
        setTouched,
        resetForm,
        deviceData
    } = props;

    useEffect(() => {
        resetForm({...dataset});
        // setShowLocationMarker(false);
    }, [dataset]);


    useEffect(() => {
        if(!isSubmitting && dirty && touched && Object.keys(touched).length > 0){
            let touchedValues = touched;
            if(touchedValues.lat && touchedValues.lng){
                handleSubmit();
            }
        }

    }, [dirty, touched]);



    function handleClickOpen() {
        setOpen(true);
    }

    function handleClose() {
        setOpen(false);
    }

    async function doSubmit(e) {
        onSubmitSuccess(e);
    }

    function onSelectPosition(event) {
        setFieldValue('lat', event.lat, true);
        setFieldValue('lng', event.lng,  true);
        setFieldValue('initialZoom', event.initialZoom, true);
        setTouched({ lat: true, lng: true, initialZoom: true });
    }

    if (!dataset) {
        return null;
    }

    return (
        <Card className={classes.card}>
            <Typography style={{marginLeft: '15px'}} className={classes.heading}>{values.id  ? `${values.name || 'Operational Unit'}` : ''}</Typography>
            <CardContent className={classes.cardContent}>
                <Grid container spacing={24}>
                    <Grid item xs={12}>
                        <Paper className={classes.mapContainer}>
                            <GoogleMapComponent deviceData={deviceData} defaultPosition={{...dataset.collection_map}}
                                                onSelectPosition={onSelectPosition}></GoogleMapComponent>
                        </Paper>
                    </Grid>
                </Grid>
            </CardContent>
        </Card>
    );

}


const _GlobalCompanyForm = withFormik({
    enableReinitialize: true,
    validationSchema: Yup.object().shape({
        name: Yup.string().required('Enter name'),
        description: Yup.string(),
        lat: Yup.number(),
        lng: Yup.number(),
        initialZoom: Yup.number()
    }),
    mapPropsToValues: props => ({
        id: props.dataset.id,
        name: props.dataset.name,
        description: props.dataset.description || '',
        lat: props.dataset.collection_map ? props.dataset.collection_map.lat : undefined,
        lng: props.dataset.collection_map ? props.dataset.collection_map.lng : undefined,
        initialZoom: props.dataset.collection_map ? props.dataset.collection_map.initialZoom : undefined,
    }),
    handleSubmit: async (values, {setSubmitting, props}) => {
        const {dataset} = props;
        const {name, description, lat, lng, initialZoom} = values;
        const finalData = {
            ...dataset,
            name,
            description, collection_map: {...dataset.collection_map, name, lat, lng, initialZoom}
        };
        if (finalData.id) {
            collectionService.update(finalData.id, finalData).then((result) => {
                setSubmitting(false);
                props.onSubmitSuccess && props.onSubmitSuccess(result);
            }).catch((error) => {
                setSubmitting(false);
                props.onSubmitError && props.onSubmitError(error);
            })
        } else {
            finalData.lookupId = props.lookupId;
            collectionService.create(finalData).then((result) => {
                setSubmitting(false);
                props.onSubmitSuccess && props.onSubmitSuccess(result);
            }).catch((error) => {
                setSubmitting(false);
                props.onSubmitError && props.onSubmitError(error);
            })
        }
    },
})(GlobalCompanyForm);


export default withStyles(style)(_GlobalCompanyForm);
