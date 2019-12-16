import React, {useContext, useEffect, useReducer, useState} from 'react';
import {Field, FieldArray, Form, withFormik} from 'formik';
import {DialogTitle, makeStyles, withStyles} from '@material-ui/core';
import Button from '@material-ui/core/Button';
import TinySpinner from '../TinySpinner';
import * as Yup from 'yup';
import FormGroup from "@material-ui/core/FormGroup";
import {formatDistance, format} from "date-fns";
import {roundNumber} from "../../helpers/CommonHelper";
import NavigationIcon from '@material-ui/icons/Navigation';
import DateFnsUtils from "@date-io/date-fns";
import {isNil, pick, uniq} from "lodash";
import {numberFormat} from "underscore.string";
import {alertConfigService} from "../../services/alertConfigService";
import InputFieldFormik from "../InputFieldFormik";
import OperationalTypeSelector from "./OperationalTypeSelector";
import EventFieldSelector from "./EventFieldSelector";

const dateFns = new DateFnsUtils();


const _fieldNames = [
    {
        name: 'TimeStamp',
        label: 'Report Time',
        getReportValue: (row) => {
            if (row['TimeStamp']) {
                return format(new Date(row['TimeStamp']), 'MM/dd/yyyy HH:mm:ss', {awareOfUnicodeTokens: true});
            }
            return '';
        },
        render: (row) => {
            if (row['TimeStamp']) {
                return format(new Date(row['TimeStamp']), dateFns.dateTime12hFormat, {awareOfUnicodeTokens: true});
            }
            return null;
        }
    },
    {
        name: 'tVOC1',
        sortName: 'tVOC1',
        label: 'tVOC1(ppm)',
        type: 'number',
        align: 'left',
        render: (row) => {
            if (!isNil(row['tVOC1'])) {
                return numberFormat(row['tVOC1'], 3);
            }
            return 'NA';
        }
    },
    {
        name: 'tVOC2',
        sortName: 'tVOC2',
        label: 'tVOC2(ppm)',
        type: 'number',
        align: 'left',
        render: (row) => {
            if (!isNil(row['tVOC2'])) {
                return numberFormat(row['tVOC2'], 3);
            }
            return 'NA';
        }
    },
    {
        name: 'TempF',
        sortName: 'TempF',
        label: 'Temp(F)',
        isVisible: false,
        type: 'number',
        align: 'left',
    },
    {
        name: 'TempC',
        sortName: 'TempC',
        label: 'Temp(C)',
        isVisible: false,
        type: 'number',
        align: 'left',
        render: (row) => {
            return !isNaN(row['TempF']) ? roundNumber(((+(row['TempF']) - 32) * (5 / 9)), 2) : 'NA';
        }
    },
    {
        name: 'Humidity',
        sortName: 'Humidity',
        label: 'Humidity (Rel. %)',
        isVisible: false,
        type: 'number',
        align: 'left',
    },
    {
        name: 'WindSpeed',
        sortName: 'WindSpeed',
        label: 'Wind(mph)',
        type: 'number',
        align: 'center',

        filter: (row) => {
            if (typeof row['WindSpeed'] === 'undefined') {
                return 'NA';
            }
            return row['WindSpeed'];
        },
        render: (row) => {
            if (typeof row['WindSpeed'] === 'undefined') {
                return 'NA';
            }
            if (row['WindSpeed'] === -9999) {
                return (<hr style={{width: '20px'}}/>);
            }
            return (
                <React.Fragment>
                    <div style={{'display': 'flex'}}>
                        <span>
                            {row['WindSpeed']}
                        </span>
                        <NavigationIcon fontSize='small' size='small'
                                        style={{'transform': `rotate(${row['WindDirection']}deg)`}}/>


                    </div>
                </React.Fragment>
            );
        }
    },
    {
        name: 'WindSpeedms',
        sortName: 'WindSpeedms',
        label: 'Wind(m/s)',
        type: 'number',
        align: 'center',
        isVisible: false,
        filter: (row) => {
            if (typeof row['WindSpeed'] === 'undefined') {
                return 'NA';
            }

            if (row['WindSpeed']) {
                return roundNumber(+(row['WindSpeed'] * 0.0002777778), 1)
            }
            return row['WindSpeed'];
        },
        render: (row) => {
            if (typeof row['WindSpeed'] === 'undefined') {
                return 'NA';
            }
            if (row['WindSpeed'] === -9999) {
                return (<hr style={{width: '20px'}}/>);
            }
            return (
                <React.Fragment>
                    <div style={{'display': 'flex'}}>
                        <span>
                            {row['WindSpeed'] && roundNumber(+(row['WindSpeed'] * 0.0002777778), 1)}
                        </span>
                        <NavigationIcon fontSize='small' size='small'
                                        style={{'transform': `rotate(${row['WindDirection']}deg)`}}/>


                    </div>
                </React.Fragment>
            );
        }
    },
    {
        name: 'Battery',
        sortName: 'Battery',
        label: 'Battery',
        type: 'number',
        isVisible: false,
        render: (row) => {
            if (typeof row['Battery'] !== 'undefined' && row['Battery'] !== null) {
                return [row['Battery'], '%'].join('');
            }
            return 'NA';
        }
    },
    {
        name: 'Voltage',
        sortName: 'Voltage',
        label: 'Voltage(vdc)',
        isVisible: false,
        type: 'number',
        align: 'left',
        render: (row) => {
            if (!isNil(row['Voltage'])) {
                return numberFormat(row['Voltage'], 3);
            }
            return 'NA';
        }
    },
    {
        label: 'ChargeDiff.',
        name: 'ChargeDifferential',
        isVisible: false,
        align: 'left',
        sortName: 'ChargeDifferential',
        type: 'number',
        render: (row) => {
            if (!isNil(row['ChargeDifferential'])) {
                return numberFormat(row['ChargeDifferential'], 3);
            }
            return 'NA';
        }
    },

    {
        name: 'R1',
        sortName: 'R1',
        isVisible: false,
        label: 'R1',
        type: 'number',
        align: 'left',
        isAdminOnly: true,
    },
    {
        name: 'R2',
        sortName: 'R2',
        isVisible: false,
        label: 'R2',
        type: 'number',
        align: 'left',
        isAdminOnly: true,
    },
    {
        name: 'B1',
        sortName: 'B1',
        isVisible: false,
        label: 'B1',
        type: 'number',
        align: 'left',
        isAdminOnly: true,
    },
    {
        name: 'B2',
        sortName: 'B2',
        isVisible: false,
        label: 'B2',
        type: 'number',
        align: 'left',
        isAdminOnly: true,
    },
    {
        name: 'RSSI',
        sortName: 'RSSI',
        isVisible: false,
        isAdminOnly: true,
        label: 'RSSI',
    },
    {
        name: 'HDOP',
        sortName: 'HDOP',
        isVisible: false,
        label: 'HDOP',
    },
    {
        name: 'Latitude',
        sortName: 'Latitude',
        label: 'Location',
        filter: (row, rowIndex, onDispatch) => {
            let lat = row['Latitude'];
            let lng = row['Longitude'];
            if (!lat && !lng) {
                return "NA";
            }

            if (lat === 0 && lng === 0) {
                return "NA";
            }
            return [lat, lng].join(', ')
        },
        render: (row, rowIndex, onDispatch) => {
            let lat = row['Latitude'];
            let lng = row['Longitude'];

            if (!lat && !lng) {
                return "NA";
            }

            if (lat === 0 && lng === 0) {
                return "NA";
            }

            return (<Button onClick={(e) => {
                onDispatch('MAP_LINK', {...row, lat, lng});
            }}> {[lat, lng].join(', ')}</Button>);
        }
    },
    {
        name: 'tVOC1raw',
        sortName: 'tVOC1raw',
        label: 'tVOC1raw(ppm)',
        type: 'number',
        align: 'left',
        isAdminOnly: true,
        isVisible: false,
        render: (row) => {
            if (!isNil(row['tVOC1raw'])) {
                return numberFormat(row['tVOC1raw'], 3);
            }
            return 'NA';
        }

    },
    {
        name: 'tVOC2raw',
        sortName: 'tVOC2raw',
        label: 'tVOC2raw(ppm)',
        type: 'number',
        align: 'left',
        isAdminOnly: true,
        isVisible: false,
        render: (row) => {
            if (!isNil(row['tVOC2raw'])) {
                return numberFormat(row['tVOC2raw'], 3);
            }
            return 'NA';
        }

    },
    {
        name: 'CH4',
        sortName: 'CH4',
        label: 'CH4',
        type: 'number',
        isAdminOnly: true,
        align: 'left',
        isVisible: false,
    },
];


export function getDeviceFieldNames(isEditMode) {
    return [
        {
            name: 'site_name',
            label: 'Site',
            disabled: true,
        },
        {
            name: 'positionLookup.name',
            label: 'Position',
            type: 'string',
            disabled: true,
        },
        {
            name: 'distance',
            label: 'Distance',
            type: 'number',
            disabled: true,
        },
        {
            name: 'id',
            label: 'Canary ID',
            type: 'string',
            disabled: true,
        },
        {
            name: 'activities',
            label: 'Activities',
            type: 'grid',
            columnGrow: 12
        },
        {
            name: 'lookup_ID',
            //label: 'Activity',
            type: 'lookup',
            domainName: 'ACTIVITY',
            columnGrow: 3,
            isEditable: isEditMode
        },
        {
            name: 'notes',
            label: 'Notes',
            type: 'string',
            columnGrow: 9,
            isEditable: isEditMode
        }
    ];
}

const activityFieldNames = [{
    name: 'timestamp',
    label: 'Date',
    render: (row) => {
        if (row['timestamp']) {
            return formatDistance(new Date(row['timestamp']), new Date(), {addSuffix: true, includeSeconds: true});
        }
        return null;
    }
}, {
    name: 'userID',
    label: 'User',
}, {
    name: 'lookup.name',
    label: 'Activity',
    type: 'string'
}, {
    name: 'notes',
    label: 'Notes',
    type: 'string'
}];
const useStyle = makeStyles(theme => ({
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
    detailViewWrapper: {
        'display': 'block',
        position: 'relative',
        maxHeight: '400px',
        height: '400px',
        'overflow': 'hidden',
        marginTop: '5px',
        marginBottom: '5px',
    },
    detailViewWithFormWrapper: {
        'display': 'block',
        position: 'relative',
        maxHeight: '323px',
        height: '323px',
        'overflow': 'hidden',
        marginTop: '5px',
        marginBottom: '5px',
    },
    tab: {
        minHeight: 'auto',

    },
    tabHeader: {
        minHeight: 'auto',
        padding: '2px',
        margin: 0,
    },
    title: {
        paddingBottom: '0px',
    },
    submit: {
        marginTop: theme.spacing(3)
    },
    conditionConatiner: {
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'space-around',

    },
    buttonContainer:{
        display: 'flex',
        justifyContent: 'flex-end'
    },
    inputSelector:{
        minWidth: '200px',
    }
}));


const ActiveConfigForm = React.memo(function ActiveConfigForm({
                                                                  values,
                                                                  touched,
                                                                  errors,
                                                                  handleChange,
                                                                  handleBlur,
                                                                  handleSubmit,
                                                                  isSubmitting,
                                                                  initialValues, companyId,
                                                                  setOpen,
                                                              }) {


    const classes = useStyle();
    return (
        <div>
            <Form className={classes.form} onSubmit={handleSubmit}>
                <FormGroup>
                    <InputFieldFormik
                        label='Email Addresses'
                        fullWidth
                        name='email_addresses'
                        id='email_addresses'
                        type='text'
                        placeholder="a@example.com, b@example.com"
                        errorMsg={errors.email_addresses}
                        error={!!(touched.email_addresses && errors.email_addresses)}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        defaultValue={values.email_addresses}
                    />
                </FormGroup>
                <FieldArray
                    name="conditions"
                    render={arrayHelpers => (
                        <div>
                            {values && values.conditions && values.conditions.map((condition, index) => (
                                <div className={classes.formGroupWrapper} key={index}>
                                    <FormGroup style={{width: '150px'}}>
                                        <InputFieldFormik
                                            label='Property'
                                            fullWidth
                                            name={`conditions[${index}].property`}
                                            component={EventFieldSelector}
                                            errorMsg={`Select property`}
                                            error={!!(touched.conditions && errors.conditions && touched.conditions[index] && errors.conditions[index] && touched.conditions[index].property && errors.conditions[index].property)}
                                            onChange={handleChange}
                                            onBlur={handleBlur}
                                            defaultValue={condition.property}
                                        />
                                    </FormGroup>
                                    <FormGroup style={{width: '90px'}}>
                                        <InputFieldFormik
                                            label='Operator'
                                            fullWidth
                                            name={`conditions[${index}].op`}
                                            component={OperationalTypeSelector}
                                            errorMsg={`Select op`}
                                            error={!!(touched.conditions && errors.conditions && touched.conditions[index] && errors.conditions[index]  && touched.conditions[index].op && errors.conditions[index].op)}
                                            onChange={handleChange}
                                            onBlur={handleBlur}
                                            defaultValue={condition.op}
                                        />
                                    </FormGroup>
                                    <FormGroup style={{width: '150px'}}>
                                        <InputFieldFormik
                                            label='Value'
                                            fullWidth
                                            name={`conditions[${index}].value`}
                                            type='number'
                                            inputProps={{
                                                'step': '0.01',
                                            }}
                                            placeholder="Enter Value"
                                            errorMsg={`Enter value`}
                                            error={!!(touched.conditions && errors.conditions && touched.conditions[index] && errors.conditions[index] && touched.conditions[index].value && errors.conditions[index].value)}
                                            onChange={handleChange}
                                            onBlur={handleBlur}
                                            defaultValue={condition.value}
                                        />
                                    </FormGroup>
                                    <Button style={{marginTop: '10px' }} onClick={e=> arrayHelpers.remove(index)}> Remove </Button>
                                </div>
                                ))}
                            <Button onClick={e=> arrayHelpers.push({property: undefined, op: undefined, value: undefined})}> Add New Condition </Button>
                        </div>
                    )}
           />
            <div className={classes.buttonContainer}>
                <Button  type="submit" variant="contained" color="secondary">
                    {!isSubmitting && <span> Submit </span>} {isSubmitting && ( <span>Submitting in <TinySpinner /></span>)}
                </Button>
                <Button onClick={e=>setOpen(false)}>
                    Close
                </Button>
            </div>
            </Form>
        </div>
    );
});

let emailSchema = Yup.string().email();

const _ActiveConfigForm = withFormik({
    enableReinitialize: true,
    validationSchema: Yup.object().shape({
        conditions: Yup.array()
            .of(
                Yup.object().shape({
                    property: Yup.string().required('Required'), // these constraints take precedence
                    op: Yup.string().required('Required'), // these constraints take precedence
                    value: Yup.number().required('Required')
                })
            ) // these constraints are shown if and only if inner constraints are satisfied

    }),
    mapPropsToValues: props => ({
        id: props.initialValues.id || null,
        email_addresses: props.initialValues && props.initialValues.email_addresses ? props.initialValues.email_addresses.join(', ') : undefined,
        collection_id: props.initialValues.company_id || null,
        conditions: props.initialValues.conditions || [{
            property: undefined,
            op: undefined,
            value: undefined,
            rawValue: undefined
        }],
    }),
    handleSubmit: async (values, {setSubmitting, props, resetForm, setValues, setFieldError}) => {
        const {initialValues} = props;
        let finalData = {...initialValues, ...values};
        if (finalData.email_addresses) {
            finalData.email_addresses = finalData.email_addresses.split(',');
            finalData.email_addresses = uniq(finalData.email_addresses.map(item=> item.trim()));
        }
        if(!finalData.email_addresses){
            setFieldError('email_addresses', 'Email address is required');
            return false;
        }
        if(!finalData.email_addresses.every(item=> emailSchema.isValidSync(item))){
            setFieldError('email_addresses', 'Invalid email address');
            return false;
        }
        if(!finalData.id) {
            alertConfigService
                .create(finalData)
                .then(result => {
                    setSubmitting(false);
                    resetForm();
                    props.onSubmitSuccess && props.onSubmitSuccess(result, false);
                })
                .catch(error => {
                    setSubmitting(false);
                    props.onSubmitError && props.onSubmitError(error);
                });
        } else {
            alertConfigService.update(finalData.id, finalData)
                .then(result => {
                    setSubmitting(false);
                    resetForm();
                    props.onSubmitSuccess && props.onSubmitSuccess(result, false);
                })
                .catch(error => {
                    setSubmitting(false);
                    props.onSubmitError && props.onSubmitError(error);
                });
        }
    },
})(ActiveConfigForm);

export default _ActiveConfigForm;
