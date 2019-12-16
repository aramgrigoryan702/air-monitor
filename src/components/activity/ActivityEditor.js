import React, {useContext, useEffect, useState} from 'react';
import Dialog from "@material-ui/core/Dialog";
import DialogContent from "@material-ui/core/DialogContent";
import DialogActions from "@material-ui/core/DialogActions";
import {DialogTitle} from "@material-ui/core";
import Button from "@material-ui/core/Button";
import Typography from "@material-ui/core/Typography";
import withStyles from "@material-ui/core/es/styles/withStyles";
import FormGroup from "@material-ui/core/FormGroup";
import InputFieldFormik from "../InputFieldFormik";
import TinySpinner from "../TinySpinner";
import {Form, withFormik} from "formik";
import * as Yup from "yup";
import {activityService} from "../../services/activityService";
import LookupSelector from "../lookup/LookupSelector";

export  const fieldNames = [{
    name:  'id',
    label: 'ID',
    type: 'number',
    isEditable: false
}, {
    name:  'lookup_ID',
    label: 'Lookup',
    type: 'lookup'
},{
    name:  'notes',
    label: 'Notes',
    type: 'string'
}];


const style = theme => ({
    form: {
        width: '100%', // Fix IE 11 issue.
        marginTop: theme.spacing(1),
    },
    submit: {
        marginTop: theme.spacing(3),
    },
});



function ActivityEditor(props) {

    const {open, setOpen, onSubmitSuccess, values,
        classes,
        touched,
        errors,
        handleChange,
        handleBlur,
        handleSubmit,
        isSubmitting,
        initialValues} = props;


    function handleClickOpen() {
        setOpen(true);
    }

    function handleClose() {
        setOpen(false);
    }

    async function  doSubmit(e){
        onSubmitSuccess(e);
    }

    return (
        <div>
            <Dialog maxWidth={'sm'} fullWidth={true} open={Boolean(open)} onClose={handleClose} aria-labelledby="form-dialog-title">
                <Form className={classes.form} onSubmit={handleSubmit}>
                    <DialogTitle>
                        <Typography component="h1" variant="h5">
                            Activity Editor
                        </Typography>
                    </DialogTitle>

                    <DialogContent>
                        {fieldNames && fieldNames.map((field, fieldIndex)=>(
                            <React.Fragment key={'frag-'+ fieldIndex}>
                                {field && field.isEditable !== false &&  (
                                    <FormGroup  key={'form-group-'+ fieldIndex}>

                                        <InputFieldFormik
                                            label={field.label}
                                            fullWidth
                                            name={field.name}
                                            id={field.name}
                                            component={field.type === 'lookup'? LookupSelector: undefined }
                                            type={field.type === 'number'? 'number': 'text'}
                                            placeholder={`Enter ${field.label}`}
                                            errorMsg={errors[field.name]}
                                            error={!!(touched[field.name] && errors[field.name])}
                                            onChange={handleChange}
                                            onBlur={handleBlur}
                                            defaultValue={values[field.name]}
                                        />
                                    </FormGroup>
                                )}
                            </React.Fragment>
                        ))}

                    </DialogContent>
                    <DialogActions>
                        <Button  type="submit" variant="contained" color="primary">
                            {!isSubmitting && <span> Submit </span>} {isSubmitting && ( <span>Submitting in <TinySpinner /></span>)}
                        </Button>
                        <Button onClick={handleClose}  variant="contained">
                            Cancel
                        </Button>
                    </DialogActions>
                </Form>
            </Dialog>
        </div>
    );

}


const _ActivityEditor = withFormik({
    validationSchema: Yup.object().shape({
         notes : Yup.string(),
        lookup_ID: Yup.number().required('Select Lookup')
    }),
    mapPropsToValues: props => ({
        notes: props.initialValues.notes,
        lookup_ID: props.initialValues.lookup_ID,
    }),
    handleSubmit: async (values, { setSubmitting, props}) => {
        const  { initialValues } = props;
        const finalData = { ...initialValues, ...values};
        console.log('finalData', finalData);
        if(finalData.id){
            activityService.update(finalData.id, finalData).then((result)=>{
                setSubmitting(false);
                props.onSubmitSuccess && props.onSubmitSuccess(result);
            }).catch((error)=>{
                setSubmitting(false);
                props.onSubmitError && props.onSubmitError(error);
            })
        }  else {
            activityService.create(finalData).then((result)=>{
                setSubmitting(false);
                props.onSubmitSuccess && props.onSubmitSuccess(result);
            }).catch((error)=>{
                setSubmitting(false);
                props.onSubmitError && props.onSubmitError(error);
            })
        }
    },
})(ActivityEditor);


export default withStyles(style)(_ActivityEditor);
