import React, {useContext, useEffect, useState} from 'react';
import Dialog from "@material-ui/core/Dialog";
import DialogContent from "@material-ui/core/DialogContent";
import DialogActions from "@material-ui/core/DialogActions";
import Button from "@material-ui/core/Button";
import {DialogTitle} from "@material-ui/core";
import Typography from "@material-ui/core/Typography";
import withStyles from "@material-ui/core/es/styles/withStyles";
import FormGroup from "@material-ui/core/FormGroup";
import InputFieldFormik from "../InputFieldFormik";
import TinySpinner from "../TinySpinner";
import {Form, withFormik} from "formik";
import * as Yup from "yup";
import {collectionService} from "../../services/collectionService";
import {lookupService} from "../../services/lookupService";
import NativeSelect from "@material-ui/core/NativeSelect";
import InputLabel from "@material-ui/core/InputLabel";

export  const fieldNames = [{
    name:  'id',
    label: 'ID',
    type: 'number',
    isEditable: false
},{
    name:  'name',
    label: 'Name',
    type: 'string'
},  {
    name:  'parentID',
    label: 'Parent',
    type: 'collectionLookup'
}, {
    name:  'lookup_ID',
    label: 'Lookup',
    type: 'lookup'
},{
    name:  'description',
    label: 'Description',
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



function CollectionSelector(props) {
   const [collectionData, setCollectionData] = useState([]);
    useEffect(()=>{
        collectionService.find({offset: 0, limit:  100, sort_column: 'name', sort_order: 'asc'}).then((result)=>{
            setCollectionData(result.data);
        }).catch(err=>{
            console.log(err);
        });
    },[]);

    return (
        <React.Fragment>
            <InputLabel >{props.label}</InputLabel>
            <NativeSelect {...props} value={props.defaultValue}>
                <option>Select Collection</option>
                {collectionData && collectionData.map((row)=>(
                    <option value={row.id}>{row.name}</option>
                ))}
            </NativeSelect>
        </React.Fragment>
    )
}


function LookupSelector(props) {
    const [lookups, setLookups] = useState([]);
    useEffect(()=>{
        lookupService.find({offset: 0, limit:  100, sort_column: 'name', sort_order: 'asc'}).then((result)=>{
            setLookups(result.data);
        }).catch(err=>{
            console.log(err);
        });
    },[]);

    return (
        <React.Fragment>
        <InputLabel >{props.label}</InputLabel>
        <NativeSelect {...props} value={props.defaultValue}>
            <option>Select Lookup</option>
            {lookups && lookups.map((row)=>(
                <option value={row.id}>{row.name}</option>
            ))}
        </NativeSelect>
        </React.Fragment>
    )
}



function CollectionEditor(props) {

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
                            Collection Editor
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
                                            component={field.type === 'lookup'? LookupSelector: (field.type === 'collectionLookup'? CollectionSelector : undefined) }
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
                        <Button  type="submit">
                            {!isSubmitting && <span> Submit </span>} {isSubmitting && ( <span>Submitting in <TinySpinner /></span>)}
                        </Button>
                        <Button onClick={handleClose}>
                            Cancel
                        </Button>
                    </DialogActions>
                </Form>
            </Dialog>
        </div>
    );

}


const _CollectionEditor = withFormik({
    validationSchema: Yup.object().shape({
        name: Yup.string().required('Enter name'),
        description : Yup.string(),
        parentID: Yup.number(),
        lookup_ID: Yup.number().required('Select Lookup')
    }),
    mapPropsToValues: props => ({
        name:    props.initialValues.name,
        description: props.initialValues.description,
        parentID: props.initialValues.domainID,
        lookup_ID: props.initialValues.lookup_ID,
    }),
    handleSubmit: async (values, { setSubmitting, props}) => {
        const  { initialValues } = props;
        const finalData = { ...initialValues, ...values};
        console.log('finalData', finalData);
        if(finalData.id){
            collectionService.update(finalData.id, finalData).then((result)=>{
                setSubmitting(false);
                props.onSubmitSuccess && props.onSubmitSuccess(result);
            }).catch((error)=>{
                setSubmitting(false);
                props.onSubmitError && props.onSubmitError(error);
            })
        }  else {
            collectionService.create(finalData).then((result)=>{
                setSubmitting(false);
                props.onSubmitSuccess && props.onSubmitSuccess(result);
            }).catch((error)=>{
                setSubmitting(false);
                props.onSubmitError && props.onSubmitError(error);
            })
        }
    },
})(CollectionEditor);


export default withStyles(style)(_CollectionEditor);