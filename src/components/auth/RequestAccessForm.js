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
import BuinessIcon from "@material-ui/icons/Business";
import ContactPhoneIcon from "@material-ui/icons/Phone";
import {authStyles} from "./authStyles";


function RequestAccessForm(props) {
    const {classes, errorMessage, initialValues, onSubmit} = props;
    const formikOptions = useFormik({
        validationSchema: Yup.object().shape({
            email: Yup.string().email().required('Enter your email'),
            name: Yup.string().required('Enter your name'),
            organization: Yup.string().required('Enter Organization name'),
            phone: Yup.string().required('Enter your Phone number'),
        }),
        initialValues: {
            email: initialValues.email,
            name: initialValues.name,
            organization: initialValues.organization,
            phone: initialValues.phone,
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
                Request Access to the Project Canary Dashboard
            </Typography>
            <Formik {...formikOptions}>
                <form className={classes.form} onSubmit={(e) => handleSubmit(e)}>
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
                                        <BuinessIcon name="contact"
                                                     className={classnames({'error': errors.organization})}/>
                                    </InputAdornment>
                                ),
                            }}
                            label="Organization"
                            fullWidth
                            name="organization"
                            type={"text"}
                            placeholder="Enter Organization name"
                            errorMsg={errors.organization}
                            error={!!(touched.organization && errors.organization)}
                            onChange={handleChange}
                            onBlur={handleBlur}
                            defaultValue={values.organization}
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
                    <FormGroup>
                        <InputFieldFormik
                            InputProps={{
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <ContactPhoneIcon name="phone"/>
                                    </InputAdornment>
                                ),
                            }}
                            label="Phone"
                            fullWidth
                            name="phone"
                            type="phone"
                            placeholder="Enter your phone number"
                            errorMsg={errors.phone}
                            error={!!(touched.phone && errors.phone)}
                            onChange={handleChange}
                            onBlur={handleBlur}
                            defaultValue={values.phone}
                        />
                    </FormGroup>

                    <Button
                        type="submit"
                        fullWidth
                        variant="contained"
                        color="primary"
                        className={classes.submit}>
                        {!isSubmitting && <span> Request Access </span>} {isSubmitting && (
                        <span>Requesting Access up <TinySpinner/></span>)}
                    </Button>
                </form>
            </Formik>
        </React.Fragment>
    );
}

RequestAccessForm.propTypes = {
    classes: PropTypes.object.isRequired,
};

export default withStyles(authStyles)(RequestAccessForm);
