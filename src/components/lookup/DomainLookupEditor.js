import React, {useContext} from 'react';
import Dialog from "@material-ui/core/Dialog";
import DialogContent from "@material-ui/core/DialogContent";
import DialogActions from "@material-ui/core/DialogActions";
import Button from "@material-ui/core/Button";
import {DialogTitle} from "@material-ui/core";
import Typography from "@material-ui/core/Typography";
import withStyles from "@material-ui/core/es/styles/withStyles";
import TinySpinner from "../TinySpinner";
import {Form, withFormik} from "formik";
import * as Yup from "yup";
import {domainLookupService} from "../../services/domainLookupService";
import DynamicFormField from "../DynamicFormField/DynamicFormField";
import {GlobalDataContext} from "../../containers/DataProvider/DataProvider";
import ClearIcon from '@material-ui/icons/Clear';

export  const DomainLookupFieldNames = [{
    name:  'id',
    label: 'ID',
    type: 'number',
    isEditable: false
},{
    name:  'name',
    label: 'Name',
    type: 'string',
    autoFocus:  true
}, {
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

function DomainLookupEditor(props) {

    const {open, setOpen, onSubmitSuccess, values,
        classes,
        touched,
        errors,
        handleChange,
        handleBlur,
        handleSubmit,
        isSubmitting,
        initialValues} = props;

   const {refreshAllLookups} = useContext(GlobalDataContext);

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
            <Dialog maxWidth={'xs'} fullWidth={true} open={Boolean(open)} onClose={handleClose} aria-labelledby="form-dialog-title">
                <Form className={classes.form} onSubmit={handleSubmit}>
                    <DialogTitle>
                        <Typography  variant="h5">
                           Domain Lookup
                        </Typography>
                    </DialogTitle>
                    <DialogContent>
                        {DomainLookupFieldNames && DomainLookupFieldNames.map((field, fieldIndex)=>(
                            <React.Fragment key={'frag-'+ fieldIndex}>
                                {field && field.isEditable !== false &&  (
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
                                )}
                            </React.Fragment>
                        ))}

                    </DialogContent>
                    <DialogActions>
                        <Button type="submit" size="small"  aria-label={'Save'}>
                            {!isSubmitting &&  <span>Submit</span>}
                            {isSubmitting && (
                                <span>Submitting<TinySpinner/></span>
                            )}

                        </Button>
                        <Button onClick={handleClose} size="small"   aria-label={'Cancel'}>
                            <ClearIcon/>
                        </Button>
                    </DialogActions>
                </Form>
            </Dialog>
        </div>
    );

}


const _DomainLookupEditor = withFormik({
    validationSchema: Yup.object().shape({
        name: Yup.string().required('Enter name'),
        description : Yup.string()
    }),
    mapPropsToValues: props => ({
        name:    props.initialValues.name,
        description: props.initialValues.description
    }),
    handleSubmit: async (values, { setSubmitting, props}) => {
        const  { initialValues } = props;
        const finalData = { ...initialValues, ...values};
        if(finalData.id){
            domainLookupService.update(finalData.id, finalData).then((result)=>{
                setSubmitting(false);
                props.onSubmitSuccess && props.onSubmitSuccess(result);
            }).catch((error)=>{
                setSubmitting(false);
                props.onSubmitError && props.onSubmitError(error);
            })
        }  else {
            domainLookupService.create(finalData).then((result)=>{
                setSubmitting(false);
                props.onSubmitSuccess && props.onSubmitSuccess(result);
            }).catch((error)=>{
                setSubmitting(false);
                props.onSubmitError && props.onSubmitError(error);
            })
        }
    },
})(DomainLookupEditor);


export default withStyles(style)(_DomainLookupEditor);