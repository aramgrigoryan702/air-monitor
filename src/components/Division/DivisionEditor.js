import React, {useContext, useEffect, useState} from 'react';
import Dialog from "@material-ui/core/Dialog";
import DialogContent from "@material-ui/core/DialogContent";
import DialogActions from "@material-ui/core/DialogActions";
import Button from "@material-ui/core/Button";
import {DialogTitle, makeStyles} from "@material-ui/core";
import Typography from "@material-ui/core/Typography";
import withStyles from "@material-ui/core/es/styles/withStyles";
import TinySpinner from "../TinySpinner";
import {Form, Formik, useFormik, withFormik} from "formik";
import * as Yup from "yup";
import {collectionService} from "../../services/collectionService";
import DynamicFormField from "../DynamicFormField/DynamicFormField";
import GoogleMapComponent from "../googlemaps/GoogleMapComponent";
import {useSnackbar} from "notistack";

export const fieldNames = [{
    name: 'id',
    label: 'ID',
    type: 'number',
    isEditable: false
}, {
    name: 'name',
    label: 'Name',
    type: 'string',
    autoFocus: true
}, {
    name: 'description',
    label: 'Description',
    type: 'string'
}, {
    name: 'lat',
    label: 'Latitude',
    type: 'number',
}, {
    name: 'lng',
    label: 'Longitude',
    type: 'number',
}];


const useStyles = makeStyles(theme => ({
    form: {
        width: '100%', // Fix IE 11 issue.
        marginTop: theme.spacing(1),
    },
    mapContainer: {
        height: '200px',
        width: '100%',
    },
    submit: {
        marginTop: theme.spacing(3),
    },
}));


const DivisionEditor = React.memo(function DivisionEditor(props) {

    const classes = useStyles();
    const {enqueueSnackbar, closeSnackbar} = useSnackbar();
    const {
        open, setOpen, onSubmitSuccess,
        initialValues,
    } = props;

    const formikOptions = useFormik({
        enableReinitialize: true,
        validationSchema: Yup.object().shape({
            name: Yup.string().required('Enter name'),
            description: Yup.string(),
            lat: Yup.number(),
            lng: Yup.number(),
            initialZoom: Yup.number(),
        }),
        initialValues: {
            name: initialValues.name,
            description: initialValues.description || '',
            lat: initialValues.collection_map ? initialValues.collection_map.lat : undefined,
            lng: initialValues.collection_map ? initialValues.collection_map.lng : undefined,
            initialZoom: initialValues.collection_map ? initialValues.collection_map.initialZoom : undefined,
        },
        onSubmit: async (values, {setSubmitting}) => {
            const {name, description, lat, lng, initialZoom} = values;

            const finalData = {
                ...initialValues,
                name,
                description, collection_map: {...initialValues.collection_map, name, lat, lng, initialZoom}
            };
            if (finalData.id) {
                collectionService.update(finalData.id, finalData).then((result) => {
                    setSubmitting(false);
                    props.onSubmitSuccess && props.onSubmitSuccess(result);
                }).catch((error) => {
                    setSubmitting(false);
                    enqueueSnackbar(error ? error.message : 'Failed request', {variant: 'error'});
                })
            } else {
                finalData.lookupId = props.lookupId;
                collectionService.create(finalData).then((result) => {
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
        setFieldValue('lat', event.lat);
        setFieldValue('lng', event.lng);
        setFieldValue('initialZoom', event.initialZoom);
    }

    return (
        <div>
            <Dialog maxWidth={'sm'} fullWidth={true} open={Boolean(open)} onClose={handleClose}
                    aria-labelledby="form-dialog-title">
                <Formik {...formikOptions}>
                    <form className={classes.form} onSubmit={handleSubmit}>
                        <DialogTitle>
                            <Typography variant="h5">
                                Operational Unit
                            </Typography>
                        </DialogTitle>
                        <DialogContent>
                            {fieldNames && fieldNames.map((field, fieldIndex) => (
                                <React.Fragment key={'frag-' + fieldIndex}>
                                    {field && field.isEditable !== false && (
                                        <DynamicFormField
                                            autofocus={true}
                                            field={field}
                                            errors={errors}
                                            touched={touched}
                                            values={values}
                                            handleChange={handleChange}
                                            handleBlur={handleBlur}
                                            disabled={field.disabled}
                                            key={'form-group-' + fieldIndex}
                                        />
                                    )}
                                </React.Fragment>
                            ))}
                            <div className={classes.mapContainer}>
                                <GoogleMapComponent defaultPosition={{...initialValues}}
                                                    onSelectPosition={onSelectPosition}></GoogleMapComponent>
                            </div>
                        </DialogContent>
                        <DialogActions>
                            <Button type="submit" variant='contained' color='primary' size="small" aria-label={'Save'}>
                                {!isSubmitting && <span>Submit</span>}
                                {isSubmitting && (
                                    <span>Submitting<TinySpinner/></span>
                                )}

                            </Button>
                            <Button size="small" onClick={handleClose} aria-label={'Close'}>
                                Close
                            </Button>
                        </DialogActions>
                    </form>
                </Formik>
            </Dialog>
        </div>
    );

});

export default DivisionEditor;
