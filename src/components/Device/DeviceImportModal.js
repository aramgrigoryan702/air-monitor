import React, {useContext, useEffect, useState} from 'react';
import Dialog from '@material-ui/core/Dialog';
import {Form, withFormik} from 'formik';
import {DialogTitle, withStyles} from '@material-ui/core';
import Typography from '@material-ui/core/Typography';
import DialogContent from '@material-ui/core/DialogContent';
import DialogActions from '@material-ui/core/DialogActions';
import Button from '@material-ui/core/Button';
import TinySpinner from '../TinySpinner';
import * as Yup from 'yup';
import {deviceService} from '../../services/deviceService';
import Grid from '@material-ui/core/Grid';
import DynamicFormField from "../DynamicFormField/DynamicFormField";

export const DeviceFieldNames = [
    {
        name: 'id',
        label: 'ID',
        type: 'number',
        isEditable: false,
    },
    {
        name: 'coreid',
        label: 'Core Id',
        type: 'string',
        autoFocus: true
    },
    {
        name: 'firmware',
        label: 'Firmware',
        type: 'lookup',
        domainName: 'FIRMWARE'
    },
    {
        name: 'boardRev',
        label: 'Board Rev',
        type: 'lookup',
        domainName: 'BOARDREV'
    },
    {
        name: 'position',
        label: 'Position',
        type: 'lookup',
        domainName: 'POSITION'
    },
    {
        name: 'activity_ID',
        label: 'Activity',
        type: 'lookup',
        isEditable: false,
        domainName: 'ACTIVITY'
    },
    {
        name: 'active',
        label: 'Active',
        type: 'boolean',
        isEditable: false,
    },
    {
        name: 'notes',
        label: 'Notes',
        type: 'text',
        columnGrow: 12
    },
];

const style = theme => ({
    form: {
        width: '100%', // Fix IE 11 issue.
        marginTop: theme.spacing(1),
    },
    formGroupItem: {},
    formGroupWrapper: {
        display: 'flex',
        flexGrow: '1',
        flexDirection: 'row',
        justifyContent: 'space-around',
        alignItems: 'flex-start',
        flexWrap: 'wrap',
    },
    submit: {
        marginTop: theme.spacing(3),
    },
});


const DeviceImportModal = React.memo(function DeviceEditor(props) {
    const {
        open,
        setOpen,
        onSubmitSuccess,
        values,
        classes,
        touched,
        errors,
        handleChange,
        handleBlur,
        handleSubmit,
        isSubmitting,
        initialValues,
    } = props;

    function handleClickOpen() {
        setOpen(true);
    }

    function handleClose() {
        setOpen(false);
    }

    async function doSubmit(e) {
        onSubmitSuccess(e);
    }

    return (
        <div>
            <Dialog
                maxWidth={'sm'}
                fullWidth={true}
                open={Boolean(open)}
                onClose={handleClose}
                aria-labelledby="form-dialog-title"
            >
                <Form className={classes.form} onSubmit={handleSubmit}>
                    <DialogTitle>
                        <Typography component="h1" variant="h5">
                            Project Canary Device
                        </Typography>
                    </DialogTitle>
                    <DialogContent>
                        <Grid container spacing={16} direction='row' alignItems="stretch" justify="space-evenly">
                            {DeviceFieldNames &&
                            DeviceFieldNames.map((field, fieldIndex) => (
                                <React.Fragment>
                                    {field && field.isEditable !== false && (
                                        <Grid item xs={field.columnGrow ? field.columnGrow : 6} spacing={16}>
                                            <DynamicFormField
                                                autofocus={true}
                                                field={field}
                                                errors={errors}
                                                touched={touched}
                                                values={values}
                                                handleChange={handleChange}
                                                handleBlur={handleBlur}
                                                key={'form-group-' + fieldIndex}
                                            />
                                        </Grid>
                                    )}
                                </React.Fragment>
                            ))}
                        </Grid>
                    </DialogContent>
                    <DialogActions>
                        <Button type="submit" variant="contained" color="primary">
                            {!isSubmitting && <span> Submit </span>}{' '}
                            {isSubmitting && (
                                <span>
                  Submitting in <TinySpinner/>
                </span>
                            )}
                        </Button>
                        <Button onClick={handleClose} variant="contained" color="secondary">
                            Cancel
                        </Button>
                    </DialogActions>
                </Form>
            </Dialog>
        </div>
    );
});

const _DeviceEditor = withFormik({
    validationSchema: Yup.object().shape({
        coreid: Yup.string().required('Enter coreid'),
        firmware: Yup.number().required('Enter firmware'),
        boardRev: Yup.number().required('Enter BoardRev'),
        notes: Yup.string(),
        position: Yup.number(),
    }),
    mapPropsToValues: props => ({
        coreid: props.initialValues.coreid,
        active: props.initialValues.active,
        firmware: props.initialValues.firmware,
        boardRev: props.initialValues.boardRev,
        notes: props.initialValues.notes,
        activity_ID: props.initialValues.activity_ID,
        retiredDate: props.initialValues.retiredDate,
        lookup_ID: props.initialValues.lookup_ID,
        position: props.initialValues.position,
    }),
    handleSubmit: async (values, {setSubmitting, props}) => {
        const {initialValues} = props;
        const finalData = {...initialValues, ...values};
        if (finalData.id) {
            deviceService
                .update(finalData.id, finalData)
                .then(result => {
                    setSubmitting(false);
                    props.onSubmitSuccess && props.onSubmitSuccess(result);
                })
                .catch(error => {
                    setSubmitting(false);
                });
        } else {
            deviceService
                .create(finalData)
                .then(result => {
                    setSubmitting(false);
                    props.onSubmitSuccess && props.onSubmitSuccess(result);
                })
                .catch(error => {
                    setSubmitting(false);
                    props.onSubmitError && props.onSubmitError(error);
                });
        }
    },
})(DeviceEditor);

export default withStyles(style)(_DeviceEditor);
