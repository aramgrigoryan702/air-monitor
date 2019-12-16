import React, {useContext, useState} from 'react';
import PropTypes from 'prop-types';
import Avatar from '@material-ui/core/Avatar';
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

function ChangePasswordForm(props) {
    const {classes, initialValues, onSubmit} = props;
    const formikOptions = useFormik({
        validationSchema: Yup.object().shape({
            password: Yup.string().required('Enter your password'),
            newPassword: Yup.string().required('Enter your new password').min(6, 'Must be at least 6 characters'),
            rePassword: Yup.string().required('Enter your password again').oneOf([Yup.ref('newPassword'), null], 'Passwords must match'),
        }),
        initialValues: {
            password: initialValues.password,
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
            <Typography component="h5">
                Change Password
            </Typography>
            <Formik {...formikOptions}>
                <form className={classes.form} onSubmit={(e) => handleSubmit(e)}>
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
                    <FormGroup>
                        <InputFieldFormik
                            InputProps={{
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <LockOutlinedIcon className={classnames('error')} name="contact"/>
                                    </InputAdornment>
                                ),
                            }}
                            label="New Password"
                            fullWidth
                            name="newPassword"
                            id="newPassword"
                            type="password"
                            placeholder="Enter your new password"
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
                            label="Re-Password"
                            fullWidth
                            name="rePassword"
                            id="rePassword"
                            type="password"
                            placeholder="Enter your new password again"
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

ChangePasswordForm.propTypes = {
    classes: PropTypes.object.isRequired,
};

export default withStyles(authStyles)(ChangePasswordForm);
