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
import Email from "@material-ui/icons/Email";
import Person from "@material-ui/icons/Person";
import {authStyles} from "./authStyles";


function AcceptInvitationForm(props) {
    const {classes, initialValues, onSubmit} = props;
    const formikOptions = useFormik({
        validationSchema: Yup.object().shape({
            email: Yup.string().email().required('Enter your email'),
            name: Yup.string().required('Enter your name'),
            password: Yup.string().required('Enter your temp. password'),
            newPassword: Yup.string().required('Enter your new password').min(6, 'Must be at least 6 characters'),
            rePassword: Yup.string().required('Enter your password again').oneOf([Yup.ref('newPassword'), null], 'Passwords must match'),
        }),
        initialValues: {
            email: initialValues.email,
            name: initialValues.name,
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
            <Typography component="h1" variant="h5">
                Join Project Canary
            </Typography>
            <Formik {...formikOptions}>
                <Form className={classes.form} onSubmit={(e) => handleSubmit(e)}>
                    <FormGroup>
                        <InputFieldFormik
                            InputProps={{
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <Person name="contact" className={classnames({'error': errors.name})}/>
                                    </InputAdornment>
                                ),
                            }}
                            label="Name"
                            fullWidth
                            name="name"
                            id="name"
                            type={"text"}
                            placeholder="Enter your name"
                            errorMsg={errors.name}
                            error={!!(touched.name && errors.name)}
                            onChange={handleChange}
                            onBlur={handleBlur}
                            defaultValue={values.name}
                        />
                    </FormGroup>
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
                            type="email"
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
                                                <LockOutlinedIcon className={classnames('error')} name="contact" />
                                            </InputAdornment>
                                        ),
                                    }}
                                    label="Temp. Password"
                                    fullWidth
                                    name="password"
                                    id="password"
                                    type="password"
                                    placeholder="Enter your temporary password"
                                    errorMsg={errors.password}
                                    error={!!(touched.password && errors.password)}
                                    onChange={handleChange}
                                    onBlur={handleBlur}
                                    defaultValue={values.password}
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
                        {!isSubmitting && <span> Join </span>} {isSubmitting && (<span>Joining <TinySpinner/></span>)}
                    </Button>
                </Form>
            </Formik>
        </React.Fragment>
    );
}

AcceptInvitationForm.propTypes = {
    classes: PropTypes.object.isRequired,
};

const _AcceptInvitationForm = withFormik({
    validationSchema: Yup.object().shape({
        email: Yup.string().email().required('Enter your email'),
        name: Yup.string().required('Enter your name'),
        password: Yup.string().required('Enter your temp. password'),
        newPassword: Yup.string().required('Enter your new password').min(6, 'Must be at least 6 characters'),
        rePassword: Yup.string().required('Enter your password again').oneOf([Yup.ref('newPassword'), null], 'Passwords must match'),
    }),
    mapPropsToValues: props => ({
        email: props.initialValues.email,
        name: props.initialValues.name,
        password: props.initialValues.password,
        newPassword: props.initialValues.newPassword,
        rePassword: props.initialValues.rePassword,
    }),
    handleSubmit: async (values, {setSubmitting, props}) => {
        await props.onSubmit(values, setSubmitting);
        setSubmitting(false);

    },
})(AcceptInvitationForm);

export default withStyles(authStyles)(_AcceptInvitationForm);
