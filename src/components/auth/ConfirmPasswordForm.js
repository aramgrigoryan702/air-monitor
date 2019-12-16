import React, {useContext, useState} from 'react';
import PropTypes from 'prop-types';
import Button from '@material-ui/core/Button';
import LockOutlinedIcon from '@material-ui/icons/LockOutlined';
import Typography from '@material-ui/core/Typography';
import withStyles from '@material-ui/core/styles/withStyles';
import {Field, Form, Formik, useFormik, withFormik} from "formik";
import * as Yup from "yup";
import FormGroup from "@material-ui/core/FormGroup";
import InputAdornment from "@material-ui/core/InputAdornment";
import InputFieldFormik from "../InputFieldFormik";
import TinySpinner from "../TinySpinner";
import './_auth.scss';
import * as classnames from "classnames";
import {authStyles} from "./authStyles";
import Email from "@material-ui/icons/Email";


function ConfirmPasswordForm(props) {
    const {classes, initialValues, onSubmit} = props;
    const formikOptions = useFormik({
        validationSchema: Yup.object().shape({
            email: Yup.string().email().required('Enter your email'),
            verificationCode: Yup.string().required('Enter verification code from email'),
            newPassword: Yup.string().required('Enter your password').min(6, 'Must be at least 6 characters'),
            rePassword: Yup.string().required('Enter your password again').oneOf([Yup.ref('newPassword'), null], 'Passwords must match'),
        }),
        initialValues: {
            email: initialValues.email,
            verificationCode: initialValues.verificationCode,
            newPassword: initialValues.newPassword,
            rePassword: initialValues.rePassword,
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
                Confirm Password
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
                    {/*<FormGroup>
                        <InputFieldFormik
                            InputProps={{
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <LockOutlinedIcon className={classnames('error')} name="contact"/>
                                    </InputAdornment>
                                ),
                            }}
                            label="Verification Code"
                            fullWidth
                            name="verificationCode"
                            id="verificationCode"
                            placeholder="Enter verification code from email"
                            errorMsg={errors.verificationCode}
                            error={!!(touched.verificationCode && errors.verificationCode)}
                            onChange={handleChange}
                            onBlur={handleBlur}
                            defaultValue={values.verificationCode}
                        />
                    </FormGroup>*/}
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
                            name="newPassword"
                            id="newPassword"
                            type="password"
                            placeholder="Enter your password"
                            errorMsg={errors.newPassword}
                            error={!!(touched.newPassword && errors.newPassword)}
                            onChange={handleChange}
                            onBlur={handleBlur}
                            defaultValue={values.newPassword}
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
                            label="Verify Password"
                            fullWidth
                            name="rePassword"
                            id="rePassword"
                            type="password"
                            placeholder="Enter your password again"
                            errorMsg={errors.rePassword}
                            error={!!(touched.rePassword && errors.rePassword)}
                            onChange={handleChange}
                            onBlur={handleBlur}
                            defaultValue={values.rePassword}
                        />
                    </FormGroup>
                    <Button
                        type="submit"
                        fullWidth
                        variant="contained"
                        color="primary"
                        className={classes.submit}>
                        {!isSubmitting && <span> Submit </span>} {isSubmitting && (
                        <span>Submitting<TinySpinner/></span>)}
                    </Button>
                </form>
            </Formik>
        </React.Fragment>
    );
}

ConfirmPasswordForm.propTypes = {
    classes: PropTypes.object.isRequired,
};

export default withStyles(authStyles)(ConfirmPasswordForm);
