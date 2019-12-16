import React from 'react';
import TextField from '@material-ui/core/TextField';
import { FormControl } from '@material-ui/core';
import { Field } from 'formik';
import FormHelperText from '@material-ui/core/FormHelperText';
import { Warning } from '@material-ui/icons';
import './_input_field.scss';
import withStyles from "@material-ui/core/es/styles/withStyles";

const  styles= theme => ({
    tinyIcon: {
        height: `.7em`
    }
});

const InputFieldFormik = ({
  name,
  label,
  placeholder,
  error,
  errorMsg,
  value,
  onChange,
  onBlur,
  classes,
  component,
  ...props
}) => {
  return (
  <FormControl className={'input-form-control'}>
    <Field
      component={component||TextField}
      value={value}
      placeholder={placeholder}
      name={name}
      label={label}
      error={error}
      onChange={onChange(name)}
      onBlur={onBlur(name)}
      {...props}
      inputlabelprops={{
          shrink : true,
          fontSize: "small",
         }
       }
    />
    <FormHelperText error={error}>
      {error && errorMsg ? (
        <span className={'error-wrapper'}>
            <Warning fontSize="small" className={classes.tinyIcon} /> <span  className={'error-message'}>{errorMsg}</span>
        </span>
      ) : (
        ''
      )}
    </FormHelperText>
  </FormControl>
)};

export default withStyles(styles)(InputFieldFormik);
