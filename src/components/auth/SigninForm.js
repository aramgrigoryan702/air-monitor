import React from 'react';
import PropTypes from 'prop-types';
import Button from '@material-ui/core/Button';
import LockOutlinedIcon from '@material-ui/icons/LockOutlined';
import Typography from '@material-ui/core/Typography';
import withStyles from '@material-ui/core/styles/withStyles';
import {Form, Formik, useFormik, useFormikContext, withFormik} from "formik";
import * as Yup from "yup";
import FormGroup from "@material-ui/core/FormGroup";
import InputAdornment from "@material-ui/core/InputAdornment";
import InputFieldFormik from "../InputFieldFormik";
import TinySpinner from "../TinySpinner";
import Email from "@material-ui/icons/Email";

import './_auth.scss';
import * as classnames from "classnames";
import {authStyles} from "./authStyles";

function SignInForm(props) {

    const {classes, errorMessage, theme, initialValues, onSubmit} = props;

    const formikOptions = useFormik({
        validationSchema: Yup.object().shape({
            email: Yup.string().email().required('Enter your email'),
            password: Yup.string().required('Enter your password'),
        }),
        initialValues: {
            email: initialValues.email,
            password: initialValues.password,
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
                Log in to the Project Canary
            </Typography>
            <Formik {...formikOptions}>
                <form className={classes.form} onSubmit={handleSubmit}>
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
                            type="text"
                            placeholder="Enter your email address"
                            errorMsg={errors.email}
                            error={!!(touched.email && errors.email)}
                            onChange={handleChange}
                            onBlur={handleBlur}
                            defaultValue={values.email}
                        />
                    </FormGroup>
                    <FormGroup>
                        <InputFieldFormik
                            InputProps={{
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <LockOutlinedIcon className={classnames('error')} name="contact"/>
                                    </InputAdornment>
                                ),
                            }}
                            label="Password"
                            fullWidth
                            name="password"
                            id="password"
                            type="password"
                            placeholder="Enter your password"
                            errorMsg={errors.password}
                            error={!!(touched.password && errors.password)}
                            onChange={handleChange}
                            onBlur={handleBlur}
                            defaultValue={values.password}
                        />
                    </FormGroup>
                    <Button
                        type="submit"
                        fullWidth
                        variant="contained"
                        color="primary"
                        className={classes.submit}>
                        {!isSubmitting && <span> Sign in </span>} {isSubmitting && (
                        <span>Signing in <TinySpinner/></span>)}
                    </Button>
                </form>
            </Formik>
        </React.Fragment>
    );
}

SignInForm.propTypes = {
    classes: PropTypes.object.isRequired,
};

/*const _SignInForm = withFormik({
    validationSchema: Yup.object().shape({
        email: Yup.string().email().required('Enter your email'),
        password: Yup.string().required('Enter your password'),
    }),
    mapPropsToValues: props => ({
        email:    props.initialValues.email,
        password: props.initialValues.password,
    }),
    handleSubmit: async (values, { setSubmitting, props }) => {
           await props.onSubmit(values, setSubmitting);
           setSubmitting(false);

    },
})(SignInForm);*/

export default withStyles(authStyles)(SignInForm);
