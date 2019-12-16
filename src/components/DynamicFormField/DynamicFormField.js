import FormGroup from "@material-ui/core/FormGroup";
import InputFieldFormik from "../InputFieldFormik";
import LookupSelector from "../lookup/LookupSelector";
import FormLabel from "@material-ui/core/FormLabel";
import Switch from "@material-ui/core/Switch";
import {DatePicker, MuiPickersUtilsProvider} from "material-ui-pickers";
import DateFnsUtils from "@date-io/date-fns";
import React from "react";
import DomainLookupSelector from "../lookup/DomainLookupSelector";

function DynamicFormField({
                              field,
                              errors,
                              touched,
                              handleChange,
                              handleBlur,
                              values,
                              disabled,
                              reference_type
                          }) {

    if (field.type === 'lookup') {
        return (
            <FormGroup>
                <InputFieldFormik
                    label={field.label}
                    fullWidth
                    autoFocus={field.autoFocus}
                    name={field.name}
                    id={field.name}
                    component={LookupSelector}
                    domainName={field.domainName}
                    reference_type={reference_type}
                    placeholder={`Enter ${field.label}`}
                    errorMsg={errors[field.name]}
                    error={!!(touched[field.name] && errors[field.name])}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    value={values[field.name]}
                    disabled={disabled}
                />
            </FormGroup>
        );
    }


    if (field.type === 'domain_lookup') {
        return (
            <FormGroup>
                <InputFieldFormik
                    label={field.label}
                    fullWidth
                    autoFocus={field.autoFocus}
                    name={field.name}
                    id={field.name}
                    component={DomainLookupSelector}
                    placeholder={`Enter ${field.label}`}
                    errorMsg={errors[field.name]}
                    error={!!(touched[field.name] && errors[field.name])}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    value={values[field.name]}
                    disabled={disabled}
                />
            </FormGroup>
        );
    }

    if (field.type === 'boolean') {
        return (
            <FormGroup>
                <FormLabel component="legend">{field.label}</FormLabel>
                <InputFieldFormik
                    label={field.label}
                    fullWidth
                    autoFocus={field.autoFocus}
                    name={field.name}
                    id={field.name}
                    checked={values[field.name]}
                    component={Switch}
                    color={'secondary'}
                    placeholder={`Enter ${field.label}`}
                    errorMsg={errors[field.name]}
                    error={!!(touched[field.name] && errors[field.name])}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    value={values[field.name]}
                    disabled={disabled}
                />
            </FormGroup>
        );
    }

    if (field.type === 'date') {
        return (
            <FormGroup>
                <MuiPickersUtilsProvider utils={DateFnsUtils}>
                    <InputFieldFormik
                        label={field.label}
                        fullWidth
                        autoFocus={field.autoFocus}
                        name={field.name}
                        id={field.name}
                        checked={values[field.name]}
                        component={DatePicker}
                        format={'MM/dd/yyyy'}
                        color={'primary'}
                        placeholder={`Enter ${field.label}`}
                        errorMsg={errors[field.name]}
                        error={!!(touched[field.name] && errors[field.name])}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        value={values[field.name]}
                        disabled={disabled}
                    />
                </MuiPickersUtilsProvider>
            </FormGroup>
        );
    }

    if (field.type === 'text') {
        return (
            <FormGroup>
                <InputFieldFormik
                    label={field.label}
                    fullWidth
                    name={field.name}
                    id={field.name}
                    type="text"
                    autoFocus={field.autoFocus}
                    multiline
                    rows={5}
                    rowsMax={10}
                    variant="filled"
                    placeholder={`Enter ${field.label}`}
                    errorMsg={errors[field.name]}
                    error={!!(touched[field.name] && errors[field.name])}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    disabled={disabled}
                    value={values[field.name]}
                />
            </FormGroup>
        );
    }

    return (
        <FormGroup>
            <InputFieldFormik
                label={ !field.hideLabel && field.label}
                fullWidth
                name={field.name}
                autoFocus={field.autoFocus}
                id={field.name}
                type={field.type === 'number' ? 'number' : 'text'}
                placeholder={`Enter ${field.label}`}
                errorMsg={errors[field.name]}
                error={!!(touched[field.name] && errors[field.name])}
                onChange={handleChange}
                onBlur={handleBlur}
                value={values[field.name]}
                disabled={disabled}
            />
        </FormGroup>
    );
}


export  default DynamicFormField;
