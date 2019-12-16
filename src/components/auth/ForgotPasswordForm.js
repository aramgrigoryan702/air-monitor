import React from 'react';
import PropTypes from 'prop-types';
import Button from '@material-ui/core/Button';
import Typography from '@material-ui/core/Typography';
import withStyles from '@material-ui/core/styles/withStyles';
import {Field, Form, Formik, useFormik, withFormik} from "formik";
import * as Yup from "yup";
import FormGroup from "@material-ui/core/FormGroup";
import InputAdornment from "@material-ui/core/InputAdornment";
import InputFieldFormik from "../InputFieldFormik";
import TinySpinner from "../TinySpinner";
import './_auth.scss';
import {authStyles} from "./authStyles";
import Email from "@material-ui/icons/Email";


function ForgotPasswordForm(props) {
    const {classes, errorMessage, initialValues, onSubmit} = props;
    const formikOptions = useFormik({
        validationSchema: Yup.object().shape({
            email: Yup.string().email().required('Enter your email'),
        }),
        initialValues: {
            email: initialValues.email,
        },
        onSubmit: async (values, {setSubmitting}) => {
            await onSubmit(values, setSubmitting);
            setSubmitting(false);
        },
    });

    const {
        values,
        touched,
        errors,
        handleChange,
        handleBlur,
        handleSubmit,
        isSubmitting,
    } = formikOptions;

    return (
        <React.Fragment>
            <Typography component="h1" variant="h5">
                Forgot project canary password
            </Typography>
            <Formik {...formikOptions}>
                <form className={classes.form} onSubmit={(e) => handleSubmit(e)}>
                    <FormGroup>
                        <InputFieldFormik
                            InputProps={{
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <Email name="contact"/>
                                    </InputAdornment>
                                ),
                            }}
                            label="Email"
                            fullWidth
                            name="email"
                            id="email"
                            placeholder="Enter your email address"
                            errorMsg={errors.email}
                            error={!!(touched.email && errors.email)}
                            onChange={handleChange}
                            onBlur={handleBlur}
                            defaultValue={values.email}
                        />
                    </FormGroup>
                    <Button
                        type="submit"
                        fullWidth
                        variant="contained"
                        color="primary"
                        className={classes.submit}>
                        {!isSubmitting && <span> Submit </span>} {isSubmitting && (
                        <span>Submitting <TinySpinner/></span>)}
                    </Button>
                </form>
            </Formik>
        </React.Fragment>
    );
}

ForgotPasswordForm.propTypes = {
    classes: PropTypes.object.isRequired,
};

export default withStyles(authStyles)(ForgotPasswordForm);
