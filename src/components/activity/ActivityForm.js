import React from 'react';
import Button from "@material-ui/core/Button";
import Typography from "@material-ui/core/Typography";
import withStyles from "@material-ui/core/es/styles/withStyles";
import FormGroup from "@material-ui/core/FormGroup";
import FormLabel from "@material-ui/core/FormLabel";
import InputFieldFormik from "../InputFieldFormik";
import TinySpinner from "../TinySpinner";
import {Form, withFormik} from "formik";
import * as Yup from "yup";
import {activityService} from "../../services/activityService";
import LookupSelector from "../lookup/LookupSelector";
import Grid from '@material-ui/core/Grid';
import DynamicFormField from "../DynamicFormField/DynamicFormField";
import differenceInMinutes from 'date-fns/differenceInMinutes';
import {makeStyles} from "@material-ui/core";

export  const fieldNames = [{
    name:  'id',
    label: 'ID',
    type: 'number',
    isEditable: false
}, {
    name:  'lookup_ID',
    //label: 'Lookup',
    type: 'lookup',
    columnGrow: 3,
    domainName: 'ACTIVITY',
},{
    name:  'notes',
    label: 'Notes',
    type: 'string',
    columnGrow: 7,
}];


const useStyles = makeStyles(theme => ({
  form: {
      width: '100%', // Fix IE 11 issue.
      marginTop: theme.spacing(1),
  },
  formValueText: {
    color: theme.palette.text.primary,
    marginLeft: '10px'
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
  detailViewWrapper:{
      'display': 'block',
      maxHeight: '200px',
      'overflowY': 'auto',
      'overflowX': 'hidden',
      marginTop: '5px',
  },
}));


function ActivityForm(props){

    const classes = useStyles();

  const {onSubmitSuccess, values,
      touched,
      errors,
      handleChange,
      handleBlur,
      handleSubmit,
      isSubmitting,
      reference_type,
      reference_id,
      initialValues
    } = props;


  async function  doSubmit(e){
      onSubmitSuccess(e);
  }


return (
  <Form className={classes.form} onSubmit={handleSubmit}>
         <Grid container spacing="2" direction='row' alignItems="stretch" justify="space-evenly">
        {fieldNames && fieldNames.map((field, fieldIndex)=>(
              <React.Fragment key={'form-top-frag-' + fieldIndex}>
                  {field && field.isEditable !== false &&  (
                    <React.Fragment key={'form-group-frag-' + fieldIndex}>
                        {field.disabled ? (
                            <Grid item xs={field.columnGrow ? field.columnGrow : 6}>
                                <FormGroup style={{'flexDirection': 'row'}}>
                                    <FormLabel
                                        style={{'minWidth': '80px'}}>  {field.label} : </FormLabel>
                                    <FormLabel className={classes.formValueText}>  {values[field.name]}</FormLabel>
                                </FormGroup>
                            </Grid>
                        ) : (
                            <Grid item xs={field.columnGrow ? field.columnGrow : 6}>
                                <DynamicFormField
                                    autofocus={field.autofocus}
                                    field={field}
                                    reference_type={props.reference_type}
                                    errors={errors}
                                    touched={touched}
                                    component={field.type === 'lookup'? LookupSelector: undefined }
                                    values={values}
                                    handleChange={handleChange}
                                    variant='outlined'
                                    handleBlur={handleBlur}
                                    disabled={field.disabled}
                                    key={'form-group-' + fieldIndex}
                                />
                            </Grid>
                        )}
                    </React.Fragment>
                  )}
              </React.Fragment>
          ))}
          <Grid item xs={2}>
                <Button  type="submit" variant="contained" color="secondary">
                    {!isSubmitting && <span> Submit </span>} {isSubmitting && ( <span>Submitting in <TinySpinner /></span>)}
                </Button>
          </Grid>
  </Grid>
    </Form>
)
}

const _ActivityForm = withFormik({
    enableReinitialize: true,
    validationSchema: Yup.object().shape({
         notes : Yup.string().required('Enter Notes'),
         lookup_ID: Yup.number().required('Select Activity'),
    }),
    mapPropsToValues: props => ({
        notes: props.initialValues.notes,
        lookup_ID: props.initialValues.lookup_ID,
        reference_type:  props.reference_type,
        reference_id:   props.reference_id,
    }),
    handleSubmit: async (values, { setSubmitting,resetForm,setValues,  props}) => {

        const  { initialValues, reference_type,  reference_id} = props;
        const finalData = { ...initialValues, ...values};

        if(finalData.id){
            activityService.update(finalData.id, finalData).then((result)=>{
                setSubmitting(false);
                setValues({lookup_ID: null, notes: ''});
                resetForm();
                props.onSubmitSuccess && props.onSubmitSuccess(result);
            }).catch((error)=>{
                setSubmitting(false);
                props.onSubmitError && props.onSubmitError(error);
            })
        }  else {
            activityService.create(finalData).then((result)=>{
                setSubmitting(false);
                setValues({lookup_ID: null, notes: ''});
                resetForm();
                props.onSubmitSuccess && props.onSubmitSuccess(result);

            }).catch((error)=>{
                setSubmitting(false);
                props.onSubmitError && props.onSubmitError(error);
            })
        }
    },
})(ActivityForm);


export default _ActivityForm;
