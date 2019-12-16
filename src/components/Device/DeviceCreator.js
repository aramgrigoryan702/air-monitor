import React from 'react';
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
import DateFnsUtils from "@date-io/date-fns";

const dateFns = new DateFnsUtils();

export function getDeviceFieldNames(isEditMode) {
     return [
        {
            name: 'id',
            label: 'Core Id',
            type: 'string',
            columnGrow: 12,
            autoFocus: true,
        },
        {
            name: 'firmware',
            label: 'Firmware',
            type: 'lookup',
            domainName: 'FIRMWARE',
            columnGrow: 6
        },
        {
            name: 'boardRev',
            label: 'Board',
            type: 'lookup',
            domainName: 'BOARDREV',
            columnGrow: 6
        },
        {
            name: 'active',
            label: 'Active',
            type: 'boolean',
            autoFocus: true,
            columnGrow: 2
        },
        {
            name: 'position',
            label: 'Position',
            type: 'lookup',
            domainName: 'POSITION',
            columnGrow: 8
        }
    ];
}

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


const DeviceCreator = React.memo(function DeviceEditor(props) {
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
        isEditMode,
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

    let DeviceFieldNames = getDeviceFieldNames(isEditMode);
    return (
        <div>
            <Dialog
                maxWidth={'xs'}
                fullWidth={true}
                open={Boolean(open)}
                onClose={handleClose}
                aria-labelledby="form-dialog-title"
            >
                <Form className={classes.form} onSubmit={handleSubmit}>
                    <DialogTitle>
                        <Typography  variant="h5">
                            Project Canary Device Creator
                        </Typography>
                    </DialogTitle>
                    <DialogContent>
                        <Grid container spacing={16} direction='row' alignItems="stretch" justify="space-evenly">
                            {DeviceFieldNames &&
                            DeviceFieldNames.map((field, fieldIndex) => (
                                <React.Fragment key={'frag-'+ fieldIndex}>
                                    {field && field.isEditable !== false && (
                                        <Grid item xs={field.columnGrow ? field.columnGrow : 6} spacing={16}>
                                            <DynamicFormField
                                                autofocus={field.autoFocus}
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
                        <Button type="submit"  size="small"  aria-label={'Save'}>
                            {!isSubmitting &&  <span>Submit</span>}
                            {isSubmitting && (
                                <span><TinySpinner/></span>
                            )}
                        </Button>
                        <Button    size="small" onClick={handleClose}  aria-label={'Cancel'}>
                           Close
                        </Button>
                    </DialogActions>
                </Form>
            </Dialog>
        </div>
    );
});

const _DeviceCreator = withFormik({
   // enableReinitialize: true,
    validationSchema: Yup.object().shape({
        id: Yup.string().required('Enter coreid').length(24),
        firmware: Yup.number().required('Enter firmware'),
        boardRev: Yup.number().required('Enter BoardRev'),
       // activity_ID: number().required('Enter BoardRev'),
        position: Yup.number(),
    }),
    mapPropsToValues: props => ({
        id: props.initialValues.id|| '',
        active: props.initialValues.active,
        firmware: props.initialValues.firmware,
        boardRev: props.initialValues.boardRev,
        lookup_ID: props.initialValues.lookup_ID,
        position: props.initialValues.position,
        site_ID: props.initialValues.site_ID,
    }),
    handleSubmit: async (values, {setSubmitting, props}) => {
        const {initialValues} = props;
        const finalData = {...initialValues, ...values};
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
    },
})(DeviceCreator);

export default withStyles(style)(_DeviceCreator);
