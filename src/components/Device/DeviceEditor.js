import React, {useCallback, useContext, useEffect, useReducer, useState} from 'react';
import Dialog from '@material-ui/core/Dialog';
import {Form, withFormik} from 'formik';
import {DialogTitle, makeStyles, withStyles} from '@material-ui/core';
import Typography from '@material-ui/core/Typography';
import DialogContent from '@material-ui/core/DialogContent';
import DialogActions from '@material-ui/core/DialogActions';
import Button from '@material-ui/core/Button';
import TinySpinner from '../TinySpinner';
import * as Yup from 'yup';
import {deviceEventService} from '../../services/deviceEventService';
import {deviceService} from '../../services/deviceService';
import Grid from '@material-ui/core/Grid';
import DynamicFormField from "../DynamicFormField/DynamicFormField";
import {activityService} from "../../services/activityService";
import DataViewMinimal from "../DataView/DataViewMinimal";
import FormGroup from "@material-ui/core/FormGroup";
import FormLabel from "@material-ui/core/FormLabel";
import {formatDistance, format} from "date-fns";
import {GlobalDataContext} from "../../containers/DataProvider/DataProvider";
import {UserDetailsContext} from "../../containers/auth/AuthProvider";
import Tab from "@material-ui/core/Tab";
import Tabs from "@material-ui/core/Tabs";
import DeviceCreator from "./DeviceCreator";
import DataView from "../DataView/DataView";
import {roundNumber} from "../../helpers/CommonHelper";
import NavigationIcon from '@material-ui/icons/Navigation';
import DateFnsUtils from "@date-io/date-fns";
import {isNil, pick} from "lodash";
import LookupSelector from "../lookup/LookupSelector";
import * as classnames from "classnames";
import {numberFormat} from "underscore.string";
import EmptyColumn from "../DataTable/EmptyColumn";

const dateFns = new DateFnsUtils();

function getFieldNames(deviceTypesMap) {
    let isDeviceTypeS = deviceTypesMap && deviceTypesMap['Canary-S'];
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
            align: 'center',
            render: (row) => {
                if (!isNil(row['tVOC1'])) {
                    return numberFormat(row['tVOC1'], 3);
                }
                return (<EmptyColumn/>);
            }
        },
        {
            name: 'tVOC2',
            sortName: 'tVOC2',
            label: 'tVOC2(ppm)',
            type: 'number',
            align: 'center',
            render: (row) => {
                if (!isNil(row['tVOC2'])) {
                    return numberFormat(row['tVOC2'], 3);
                }
                return (<EmptyColumn/>);
            }
        },
        {
            name: 'TempF',
            sortName: 'TempF',
            label: 'Temp(F)',
            isVisible: false,
            type: 'number',
            align: 'center',
        },
        {
            name: 'TempC',
            sortName: 'TempC',
            label: 'Temp(C)',
            isVisible: false,
            type: 'number',
            align: 'center',
            getReportValue: (row) => {
                return !isNaN(row['TempF']) ? roundNumber(((+(row['TempF']) - 32) * (5 / 9)), 2) : (<EmptyColumn/>);
            },
            render: (row) => {
                return !isNaN(row['TempF']) ? roundNumber(((+(row['TempF']) - 32) * (5 / 9)), 2) : (<EmptyColumn/>);
            }
        },
        {
            name: 'Humidity',
            sortName: 'Humidity',
            label: 'Humidity (Rel. %)',
            isVisible: false,
            type: 'number',
            align: 'center',
        },
        {
            name: 'WindSpeed',
            sortName: 'WindSpeed',
            label: 'Wind(mph)',
            type: 'number',
            align: 'center',
            getReportValue: (row) => {
                if (!row['WindSpeed']) {
                    return '-';
                }
                if (row['WindSpeed'] === -9999) {
                    return '-';
                }
                return row['WindSpeed'];
            },
            render: (row) => {
                if (!row['WindSpeed']) {
                    return (<EmptyColumn/>);
                }
                if (row['WindSpeed'] === -9999) {
                    return (<EmptyColumn/>);
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
            getReportValue: (row) => {
                if (!row['WindSpeed']) {
                    return '-';
                }
                if (row['WindSpeed'] === -9999) {
                    return '-';
                }
                if (row['WindSpeed']) {
                    return roundNumber(+(row['WindSpeed'] * 0.44704), 1)
                }
                return row['WindSpeed'];
            },
            render: (row) => {
                if (!row['WindSpeed']) {
                    return (<EmptyColumn/>);
                }
                if (row['WindSpeed'] === -9999) {
                    return (<EmptyColumn/>);
                }
                return (
                    <React.Fragment>
                        <div style={{'display': 'flex'}}>
                        <span>
                            {row['WindSpeed'] && roundNumber(+(row['WindSpeed'] * 0.44704), 1)}
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
            getReportValue: (row) => {
                if (typeof row['Battery'] !== 'undefined' && row['Battery'] !== null) {
                    return [row['Battery'], '%'].join('');
                }
                return '-';
            },
            render: (row) => {
                if (typeof row['Battery'] !== 'undefined' && row['Battery'] !== null) {
                    return [row['Battery'], '%'].join('');
                }
                return (<EmptyColumn/>);
            }
        },
        {
            name: 'Voltage',
            sortName: 'Voltage',
            label: 'Voltage(vdc)',
            isVisible: false,
            type: 'number',
            align: 'center',
            render: (row) => {
                if (!isNil(row['Voltage'])) {
                    return numberFormat(row['Voltage'], 3);
                }
                return (<EmptyColumn/>);
            }
        },
        {
            label: 'ChargeDiff.',
            name: 'ChargeDifferential',
            isVisible: false,
            align: 'center',
            sortName: 'ChargeDifferential',
            type: 'number',
            getReportValue : (row) => {
                if (!isNil(row['ChargeDifferential'])) {
                    return numberFormat(row['ChargeDifferential'], 3);
                }
                return '-';
            },
            render: (row) => {
                if (!isNil(row['ChargeDifferential'])) {
                    return numberFormat(row['ChargeDifferential'], 3);
                }
                return (<EmptyColumn/>);
            }
        },

        {
            name: 'R1',
            sortName: 'R1',
            isVisible: false,
            label: 'R1',
            type: 'number',
            align: 'center',
            isAdminOnly: true,
        },
        {
            name: 'R2',
            sortName: 'R2',
            isVisible: false,
            label: 'R2',
            type: 'number',
            align: 'center',
            isAdminOnly: true,
        },
        {
            name: 'B1',
            sortName: 'B1',
            isVisible: false,
            label: 'B1',
            type: 'number',
            align: 'center',
            isAdminOnly: true,
        },
        {
            name: 'B2',
            sortName: 'B2',
            isVisible: false,
            label: 'B2',
            type: 'number',
            align: 'center',
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
            align: 'center',
            isAdminOnly: true,
            isVisible: false,
            getReportValue: (row) => {
                if (!isNil(row['tVOC1raw'])) {
                    return numberFormat(row['tVOC1raw'], 3);
                }
                return '-';
            },
            render: (row) => {
                if (!isNil(row['tVOC1raw'])) {
                    return numberFormat(row['tVOC1raw'], 3);
                }
                return (<EmptyColumn/>);
            }

        },
        {
            name: 'tVOC2raw',
            sortName: 'tVOC2raw',
            label: 'tVOC2raw(ppm)',
            type: 'number',
            align: 'center',
            isAdminOnly: true,
            isVisible: false,
            getReportValue: (row) => {
                if (!isNil(row['tVOC2raw'])) {
                    return numberFormat(row['tVOC2raw'], 3);
                }
                return '-';
            },
            render: (row) => {
                if (!isNil(row['tVOC2raw'])) {
                    return numberFormat(row['tVOC2raw'], 3);
                }
                return (<EmptyColumn/>);
            }

        },
        {
            name: 'CH4',
            sortName: 'CH4',
            label: 'CH4',
            type: 'number',
            isAdminOnly: true,
            align: 'center',
            isVisible: false,
        },
        {
            name: 'U',
            sortName: 'U',
            label: 'U',
            type: 'number',
            align: 'center',
            deviceType: 'Canary-S',
        },
        {
            name: 'IT',
            sortName: 'IT',
            label: 'IT',
            type: 'number',
            align: 'center',
            deviceType: 'Canary-S',
        },
        {
            name: 'ET',
            sortName: 'ET',
            label: 'ET',
            type: 'number',
            align: 'center',
            deviceType: 'Canary-S',
        },
        {
            name: 'IH',
            sortName: 'IH',
            label: 'IH',
            type: 'number',
            align: 'center',
            deviceType: 'Canary-S',
        },
        {
            name: 'EH',
            sortName: 'EH',
            label: 'EH',
            type: 'number',
            align: 'center',
            deviceType: 'Canary-S',
        },
        {
            name: 'P',
            sortName: 'P',
            label: 'P',
            type: 'number',
            align: 'center',
            deviceType: 'Canary-S',
        },
        {
            name: 'TVOC_PID',
            sortName: 'TVOC_PID',
            isVisible: false,
            label: 'TVOC_PID',
            type: 'number',
            align: 'center',
            deviceType: 'Canary-S',
        },
        {
            name: 'PM1_0',
            sortName: 'PM1_0',
            label: 'PM1_0',
            type: 'number',
            align: 'center',
            deviceType: 'Canary-S',
        },
        {
            name: 'PM2_5',
            sortName: 'PM2_5',
            label: 'PM2_5',
            type: 'number',
            align: 'center',
            deviceType: 'Canary-S',
        },
        {
            name: 'PM10',
            sortName: 'PM10',
            label: 'PM10',
            type: 'number',
            align: 'center',
            deviceType: 'Canary-S',
        },
        {
            name: 'CO',
            sortName: 'CO',
            label: 'CO',
            type: 'number',
            align: 'center',
            deviceType: 'Canary-S',
        },
        {
            name: 'CO2',
            sortName: 'CO2',
            label: 'CO2',
            type: 'number',
            align: 'center',
            deviceType: 'Canary-S',
        },
        {
            name: 'SO2',
            sortName: 'SO2',
            label: 'SO2',
            type: 'number',
            align: 'center',
            deviceType: 'Canary-S',
        },
        {
            name: 'O2',
            sortName: 'O2',
            label: 'O2',
            type: 'number',
            align: 'center',
            deviceType: 'Canary-S',
        },
        {
            name: 'O3',
            sortName: 'O3',
            label: 'O3',
            type: 'number',
            align: 'center',
            deviceType: 'Canary-S',
        },
        {
            name: 'NO2',
            sortName: 'NO2',
            label: 'NO2',
            type: 'number',
            align: 'center',
            deviceType: 'Canary-S',
        },
        {
            name: 'H2S',
            sortName: 'H2S',
            label: 'H2S',
            type: 'number',
            align: 'center',
            deviceType: 'Canary-S',
        },
        {
            name: 'CH4_S',
            sortName: 'CH4_S',
            label: 'CH4_S',
            type: 'number',
            align: 'center',
            deviceType: 'Canary-S',
        },
        {
            name: 'Sig',
            sortName: 'Sig',
            label: 'Sig',
            type: 'number',
            align: 'center',
            deviceType: 'Canary-S',
        }
    ];
    if(!isDeviceTypeS){
        return _fieldNames.filter(item=> item && !item.deviceType || (item.deviceType && item.deviceType !== 'Canary-S'))
    }
    return _fieldNames;
}


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
}));


function reducer(currentState, newState) {
    return {...currentState, ...newState};
}


function useDeviceEditor({
                             open,
                             setOpen,
                             onSubmitSuccess,
                             onCloseEditor,
                             values,
                             classes,
                             touched,
                             errors,
                             handleChange,
                             handleBlur,
                             handleSubmit,
                             isSubmitting,
                             initialValues,
                             isEditMode,
                             triggerDetailRefresh,
                             resetForm,
                         }) {

    const {getAllDomainLookups} = useContext(GlobalDataContext);
    const {user_data} = useContext(UserDetailsContext);

    const [{orderBy, detailData, referenceType, selectedTab, DeviceFieldNames, params, activityParams, fieldNames, deviceTypeMap}, setState] = useReducer(reducer, {
            orderBy: {},
            detailData: [],
            selectedTab: 0,
            referenceType: [],
            params: undefined,
            DeviceFieldNames: [],
            activityParams: undefined,
            fieldNames: getFieldNames(),
            deviceTypeMap: undefined,
        }
    );

    useEffect(() => {
        if (values.id && initialValues.id) {
            setState({
                params: {id: values.id},
                activityParams: {device_id: initialValues.id},
                deviceTypeMap:   initialValues.type === 'Canary-S' ? {'Canary-S': true}: undefined ,
            });
        }
    }, [values.id, initialValues.id]);


    useEffect(() => {
        const lookupVals = getAllDomainLookups();
        if (lookupVals) {
            const deviceDomain = lookupVals.find(item => item.name === 'DEVICE');
            if (deviceDomain) {
                setState({
                    referenceType: deviceDomain.id
                });
            }
        }
    }, []);

    useEffect(() => {
        setState({
            DeviceFieldNames: getDeviceFieldNames(isEditMode)
        });
    }, [isEditMode]);


    useEffect(() => {
        if (user_data && user_data.groupName !== 'ADMIN') {
            let fNames = getFieldNames(deviceTypeMap).filter(item => !item.isAdminOnly);
            setState({
                fieldNames: fNames
            });
        } else if (user_data) {
            setState({
                fieldNames: getFieldNames(deviceTypeMap),
            });
        }
    }, [user_data, deviceTypeMap]);


    useEffect(() => {
        fetchDetailData();
    }, [initialValues.id, orderBy, triggerDetailRefresh]);

    function fetchDetailData() {
        activityService.find({
            whereCondition: {device_id: initialValues.id},
            sort_column: orderBy.field,
            sort_order: orderBy.direction,
            offset: 0,
            limit: 100
        }).then((result) => {
            setState({
                detailData: result
            });
        }).catch(err => {
            console.log(err);
        });
    }


    function setOrderBy(val) {
        setState({
            orderBy: val
        });
    }


    function handleClose() {
        if (onCloseEditor) {
            onCloseEditor();
        }
        setOpen(false);
    }


    return {
        orderBy,
        detailData,
        referenceType,
        selectedTab,
        DeviceFieldNames,
        params,
        activityParams,
        getAllDomainLookups,
        user_data,
        setOrderBy,
        handleClose,
        fieldNames,
        setState
    };

}

const DeviceEditor = React.memo(function DeviceEditor({
                                                          open,
                                                          setOpen,
                                                          onSubmitSuccess,
                                                          onCloseEditor,
                                                          values,
                                                          touched,
                                                          errors,
                                                          handleChange,
                                                          handleBlur,
                                                          handleSubmit,
                                                          isSubmitting,
                                                          initialValues,
                                                          isEditMode,
                                                          triggerDetailRefresh,
                                                          resetForm,
                                                      }) {

    const classes = useStyles();

    const {orderBy, detailData, referenceType, selectedTab, DeviceFieldNames, params, activityParams, getAllDomainLookups, user_data, setOrderBy, handleClose, fieldNames, setState} = useDeviceEditor({
        open,
        setOpen,
        onSubmitSuccess,
        onCloseEditor,
        values,
        classes,
        touched,
        errors,
        handleChange,
        handleBlur,
        handleSubmit,
        isSubmitting,
        initialValues,
        isEditMode,
        triggerDetailRefresh,
        resetForm,
    });

    return (
        <div>
            <Dialog
                maxWidth={'lg'}
                fullWidth={true}
                open={Boolean(open)}
                onClose={handleClose}
                aria-labelledby="form-dialog-title"
            >
                <Form className={classes.form} onSubmit={handleSubmit}>
                    <DialogTitle className={classes.title}>
                        <Typography>
                            Project Canary Device
                        </Typography>
                    </DialogTitle>
                    <DialogContent>
                        <Grid container spacing={1} direction='row' alignItems="stretch" justify="space-evenly">
                            {DeviceFieldNames &&
                            DeviceFieldNames.map((field, fieldIndex) => {
                                if (field && field.type === 'grid') {
                                    return (
                                        <React.Fragment key={'top-frag-' + fieldIndex}>
                                            <Grid item xs={field.columnGrow ? field.columnGrow : 6}
                                                  key={'form-group-grid-frag-' + fieldIndex}>
                                                <Tabs className={classes.tab} value={selectedTab}
                                                      onChange={(e, val) => setState({selectedTab: val})}>
                                                    <Tab className={classes.tabHeader} label="Events"/>
                                                    <Tab className={classes.tabHeader} label="Activities"/>
                                                    }
                                                </Tabs>
                                                <div
                                                    className={classnames(classes.detailViewWrapper, selectedTab == 1 && user_data && user_data.groupName !== 'VIEWER' && classes.detailViewWithFormWrapper)}>
                                                    {selectedTab == 1 && (
                                                        <DataViewMinimal viewOrderBy={orderBy}
                                                                         setViewOrderBy={setOrderBy}
                                                                         providedData={detailData} classes={classes}
                                                                         params={activityParams}
                                                                         fieldNames={activityFieldNames}
                                                                         title={"Activities"}>
                                                        </DataViewMinimal>
                                                    )}
                                                    {selectedTab === 0 && (
                                                        <DataView dataViewName={'device-detail-table'}
                                                                  hideAddDataBtn={true}
                                                                  dataProvider={deviceEventService}
                                                                  showDateRangeFilter={true}
                                                                  params={params}
                                                                  numOfRows={100}
                                                                  remoteAction={true}
                                                                  hideEditButton={true}
                                                                  hideRemoveButton={true}
                                                                  showPaging={true}
                                                                  useDragger={false}
                                                                  fieldNames={fieldNames}
                                                        >
                                                        </DataView>
                                                    )}
                                                </div>
                                            </Grid>
                                        </React.Fragment>
                                    )
                                } else if (user_data && user_data.groupName !== 'VIEWER') return (
                                    <React.Fragment key={'form-group-top-frag-' + fieldIndex}>
                                        {field && field.isEditable !== false && (
                                            <React.Fragment key={'form-group-frag-' + fieldIndex}>
                                                {field.disabled ? (
                                                    <Grid item xs={field.columnGrow ? field.columnGrow : 6}>
                                                        <FormGroup style={{'flexDirection': 'row'}}>
                                                            <FormLabel
                                                                style={{'minWidth': '80px'}}>  {field.label} : </FormLabel>
                                                            <FormLabel
                                                                className={classes.formValueText}>  {values[field.name]}</FormLabel>
                                                        </FormGroup>
                                                    </Grid>
                                                ) : (
                                                    <React.Fragment key={'form-group-frag-grid-' + fieldIndex}>
                                                        {selectedTab === 1 && (
                                                            <Grid item style={{marginBottom: '3px'}}
                                                                  xs={field.columnGrow ? field.columnGrow : 6}>
                                                                <DynamicFormField
                                                                    autofocus={field.autofocus}
                                                                    field={field}
                                                                    errors={errors}
                                                                    touched={touched}
                                                                    values={values}
                                                                    reference_type={referenceType}
                                                                    component={field.type === 'lookup' ? LookupSelector : undefined}
                                                                    handleChange={handleChange}
                                                                    variant='outlined'
                                                                    handleBlur={handleBlur}
                                                                    disabled={!isEditMode ? false : field.disabled}
                                                                    key={'form-group-' + fieldIndex}
                                                                />
                                                            </Grid>
                                                        )}
                                                    </React.Fragment>

                                                )}
                                            </React.Fragment>
                                        )}
                                    </React.Fragment>
                                )
                            })}
                        </Grid>
                    </DialogContent>
                    <DialogActions>
                        {user_data && user_data.groupName !== 'VIEWER' && selectedTab === 1 && (
                            <Button type="submit" variant='contained' color='primary' size="small" aria-label={'Save'}>
                                {!isSubmitting && <span>Save</span>}
                                {isSubmitting && (
                                    <span><TinySpinner/></span>
                                )}
                            </Button>
                        )}

                        <Button size="small" onClick={handleClose} aria-label={'Cancel'}>
                            Close
                        </Button>
                    </DialogActions>
                </Form>
            </Dialog>
        </div>
    );
});

const _DeviceEditor = withFormik({
    enableReinitialize: true,
    validationSchema: Yup.object().shape({
        device_id: Yup.string().required('Enter coreid'),
        lookup_ID: Yup.number().required('Select Activity'),
        // activity_ID: number().required('Enter BoardRev'),
        notes: Yup.string().required('Enter notes'),
    }),
    mapPropsToValues: props => ({
        id: props.initialValues.id || null,
        device_id: props.initialValues.id || null,
        firmwarename: props.initialValues['firmwareLookup.name'],
        type: props.initialValues['type'],
        boardRevName: props.initialValues['boardRevLookup.name'],
        site_name: props.initialValues['site.name'],
        'site.operational_unit.name': props.initialValues['site.operational_unit.name'],
        'positionLookup.name': props.initialValues['positionLookup.name'],
        distance: props.initialValues['distance'],
    }),
    handleSubmit: async (values, {setSubmitting, props, resetForm, setValues}) => {
        const {initialValues} = props;
        const finalData = pick({...initialValues, ...values}, 'device_id', 'lookup_ID', 'notes');
        activityService
            .create(finalData)
            .then(result => {
                props.setTriggerDetailRefresh(Date.now());
                setSubmitting(false);
                setValues({lookup_ID: null, notes: ''});
                resetForm();
                // props.onSubmitSuccess && props.onSubmitSuccess(result, false);
            })
            .catch(error => {
                setSubmitting(false);
                props.onSubmitError && props.onSubmitError(error);
            });
    },
})(DeviceEditor);

export default _DeviceEditor;
