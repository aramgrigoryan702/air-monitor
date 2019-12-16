import React, {useEffect} from 'react';
import {Card, CardContent, Paper, Typography} from "@material-ui/core";
import { Formik, useFormik} from "formik";
import * as Yup from "yup";
import GoogleMapComponent from "../googlemaps/GoogleMapComponent";
import {siteService} from "../../services/siteService";
import {useSnackbar} from "notistack";
import makeStyles from "@material-ui/core/styles/makeStyles";

export const fieldNames = [{
    name: 'lat',
    hideLabel: true,
    label: 'Lat',
    type: 'number',
    isEditable: false
}, {
    name: 'lng',
    label: 'Lon',
    hideLabel: true,
    type: 'number',
    isEditable: false
}];


const useStyles = makeStyles(theme => ({
    card: {
        width: `calc(100%)`,
        height: `calc(100%)`,
        flexGrow: 1,
        padding: theme.spacing(1),
        paddingLeft: 0,
        paddingRight: 0,
        paddingBottom: 0,
    },
    cardHeader: {
        padding: 0,
        fontSize: ".8rem",
    },
    form: {
        width: `calc(100%)`, // Fix IE 11 issue.
        height: `calc(100%)`,
        display: 'flex'
        // marginTop: theme.spacing.unit,
    },
    cardContent: {
        position: 'relative',
        height: `calc(100%)`,
        padding: 0,
    },
    mapContainer: {
        height: `calc(100%)`,
        width: `calc(100%)`,
    },
    cardActions: {
        justifyContent: 'flex-end'
    },
    submit: {
        marginTop: theme.spacing(3),
    },
    paper: {
        padding: theme.spacing(1),
        // paddingLeft: theme.spacing.unit * 1,
        // paddingRight: theme.spacing.unit * 1,
        textAlign: 'center',
        color: theme.palette.text.secondary,
        position: 'absolute',
        top: '65px',
        left: '11px',
        margin: 0,
        marginLeft: '10px',
        marginRight: '10px',
        height: '30px',
        overflow: 'hidden',
        width: '300px',
        animation: 'animate-base-container 850ms forwards'
    },
    innerFormGroup: {
        justifyContent: 'center',
        alignItems: 'center',
        margin: 0,
    },
    dropPinBtn: {
        padding: '0px'
    },
    heading: {
        fontSize: '.9rem',
        textTransform: 'uppercase',
        fontWeight: '700',
    },
}));


let SiteForm = React.memo(function SiteForm(props) {

    const classes = useStyles();
    const {enqueueSnackbar, closeSnackbar} = useSnackbar();
    const {
        open, setOpen, onSubmitSuccess,
        dataset,
        initialValues,
        deviceData,
        defaultLocation,
        onSelectDevicePosition,
        onSelectDeviceAutoRelocate,
        primarySensorName,
    } = props;

    const formikOptions = useFormik({
        enableReinitialize: true,
        validationSchema: Yup.object().shape({
            name: Yup.string().required('Enter Site name'),
            description: Yup.string(),
            lat: Yup.number(),
            lng: Yup.number(),
            initialZoom: Yup.number()
        }),
        initialValues: {
            id: dataset.id,
            name: dataset.name,
            description: dataset.description || '',
            lat: dataset.site_map ? dataset.site_map.lat : undefined,
            lng: dataset.site_map ? dataset.site_map.lng : undefined,
            initialZoom: dataset.site_map ? dataset.site_map.initialZoom : undefined,
        },
        onSubmit: async (values, {setSubmitting}) => {
            const {name, description, lat, lng, initialZoom} = values;
            const finalData = {
                ...dataset,
                name,
                description,
                site_map: {...dataset.site_map, name, lat, lng, initialZoom: initialZoom}
            };
            if (finalData.id) {
                siteService.update(finalData.id, finalData).then((result) => {
                    setSubmitting(false);
                    props.onSubmitSuccess && props.onSubmitSuccess(result);
                }).catch((error) => {
                    setSubmitting(false);
                    enqueueSnackbar(error ? error.message : 'Failed request', {variant: 'error'});
                })
            } else {
                finalData.lookupId = props.lookupId;
                siteService.create(finalData).then((result) => {
                    setSubmitting(false);
                    props.onSubmitSuccess && props.onSubmitSuccess(result);
                }).catch((error) => {
                    setSubmitting(false);
                    enqueueSnackbar(error ? error.message : 'Failed request', {variant: 'error'});
                })
            }
        },
    });

    const {
        values,
        touched,
        errors,
        handleChange,
        handleBlur,
        dirty,
        setFieldValue,
        setTouched,
        resetForm,
        handleSubmit,
        isSubmitting,
    } = formikOptions;

    useEffect(() => {
        resetForm({...dataset});
        // setShowLocationMarker(false);
    }, [dataset]);


    useEffect(() => {
        if (!isSubmitting && dirty && touched && Object.keys(touched).length > 0) {
            let touchedValues = touched;
            if (touchedValues.lat && touchedValues.lng) {
                let initialLat = null;
                let initialLng = null;
                if (initialValues && initialValues.site_map) {
                    initialLat = initialValues.site_map.lat;
                    initialLng = initialValues.site_map.lng;
                }
                if (touchedValues.lat !== initialLat && touchedValues.lng !== initialLng) {
                    handleSubmit();
                }
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
        setFieldValue('lng', event.lng, true);
        setFieldValue('initialZoom', event.initialZoom, true);
        setTouched({lat: true, lng: true, initialZoom: true});
        /* setFieldTouched('lat', true, true);
         setFieldTouched('lng', true,  true);
         setFieldTouched('initialZoom', true, true);*/
    }


    if (!dataset) {
        return null;
    }

    return (
        <Card className={classes.card}>
            <Formik {...formikOptions}>
                <React.Fragment>


                    <Typography style={{marginLeft: '15px'}}
                                className={classes.heading}>{values.id && values.id !== 'unassigned' ? `${values.name || ''}` : ''}</Typography>
                    <CardContent className={classes.cardContent}>
                        <Paper className={classes.mapContainer}>
                            <GoogleMapComponent primarySensorName={primarySensorName} deviceData={deviceData}
                                                defaultLocation={defaultLocation}
                                                defaultPosition={{...dataset.site_map}}
                                                onSelectDeviceAutoRelocate={onSelectDeviceAutoRelocate}
                                                onSelectDevicePosition={onSelectDevicePosition}
                                                onSelectPosition={onSelectPosition}></GoogleMapComponent>
                        </Paper>
                    </CardContent>
                </React.Fragment>
            </Formik>
        </Card>
    );

});


export default SiteForm;
