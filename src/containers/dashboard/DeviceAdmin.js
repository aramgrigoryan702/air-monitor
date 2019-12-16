import React, {useCallback, useContext, useEffect, useReducer, useRef, useState} from 'react';
import {deviceService} from "../../services/deviceService";
import Paper from "@material-ui/core/Paper";
import DataView from "../../components/DataView/DataView";
import {ListItem, withStyles} from "@material-ui/core";
import DeviceEditor, {DeviceFieldNames} from "../../components/Device/DeviceEditor";
import {withRouter} from "react-router";
import NavigationIcon from '@material-ui/icons/Navigation';
import DeviceCreator from "../../components/Device/DeviceCreator";
import {CollectionDataContext} from "../../components/collection/CollectionDataProvider";
import {siteService} from "../../services/siteService";
import {activityService} from "../../services/activityService";
import * as classnames from "classnames";
import Button from "@material-ui/core/Button";
import {roundNumber} from "../../helpers/CommonHelper";
import ActivityView from "../../components/activity/ActivityView";
import Typography from '@material-ui/core/Typography';
import {formatDistance, format, isAfter, subHours} from "date-fns";
import Tab from "@material-ui/core/Tab";
import Tabs from "@material-ui/core/Tabs";
import '../../styles/_animate_base_container.scss';
import Badge from "@material-ui/core/Badge";
import {UserDetailsContext} from "../auth/AuthProvider";
import { numberFormat } from 'underscore.string';
import {isNil} from "lodash";
import AlertNotificationContainer from "../../components/alert-notifications/AlertNotificationContainer";
import EmptyColumn from "../../components/DataTable/EmptyColumn";
import makeStyles from "@material-ui/core/styles/makeStyles";
import NotFound_404 from "../../components/notfound/NotFound_404";


function getFieldNames(deviceTypesMap) {
    let isDeviceTypeS = deviceTypesMap && deviceTypesMap['Canary-S'];
    const _fieldNames = [
        {
            name: 'id',
            label: 'CanaryID',
            type: 'string',
            autoFocus: true,
            render: (row, rowIndex, onDispatch) => {
                return  (<a  style={{'cursor': 'pointer', textDecoration: 'underline'}} onClick={(e) => {
                    onDispatch( 'CORE_ID_LINK', {e, row});
                } }> {row.id} </a>);
            }
        },
        {
            name: 'last_event.event.tVOC1',
            sortName: 'last_event->event.tVOC1',
            label: 'tVOC1(ppm)',
            type: 'number',
            align: 'center',
            getReportValue : (row)=>{
                if (!isNil(row['last_event.event.tVOC1'])) {
                    return numberFormat(row['last_event.event.tVOC1'], 3);
                }
                return '';
            },
            render: (row)=>{
                if (!isNil(row['last_event.event.tVOC1'])) {
                    return numberFormat(row['last_event.event.tVOC1'], 3);
                }
                return (<EmptyColumn/>);
            }

        },
        {
            name: 'last_event.event.tVOC2',
            sortName: 'last_event->event.tVOC2',
            label: 'tVOC2(ppm)',
            type: 'number',
            align: 'center',
            render: (row)=>{
                if (!isNil(row['last_event.event.tVOC2'])) {
                    return numberFormat(row['last_event.event.tVOC2'], 3);
                }
                return (<EmptyColumn/>);
            }
        },
        {
            name: 'last_event.event.TempF',
            sortName: 'last_event->event.TempF',
            label: 'Temp(F)',
            isVisible: false,
            type: 'number',
            align: 'center',
        },
        {
            name: 'last_event.event.TempC',
            sortName: 'last_event->event.TempC',
            label: 'Temp(C)',
            isVisible: false,
            type: 'number',
            align: 'center',
            getReportValue : (row) => {
                return !isNaN(row['last_event.event.TempF']) ? roundNumber(((+(row['last_event.event.TempF']) - 32 ) * (5/9)), 2) : '-';
            },
            render: (row) => {
                return !isNaN(row['last_event.event.TempF']) ? roundNumber(((+(row['last_event.event.TempF']) - 32 ) * (5/9)), 2) :  <hr style={{width: '20px'}}/>;
            }
        },
        {
            name: 'last_event.event.Humidity',
            sortName: 'last_event->event.Humidity',
            label: 'Humidity (Rel. %)',
            isVisible: false,
            type: 'number',
            align: 'center',
        },
        {
            name: 'last_event.event.WindSpeed',
            sortName: 'last_event->event.WindSpeed',
            label: 'Wind(mph)',
            type: 'number',
            align: 'center',

            filter: (row) => {
                if (typeof row['last_event.event.WindSpeed'] === 'undefined') {
                    return '-';
                }
                if(row['last_event.event.WindSpeed'] === -9999){
                    return '-';
                }
                return row['last_event.event.WindSpeed'];
            },
            render: (row) => {
                if (!row['last_event.event.WindSpeed']) {
                    return (<EmptyColumn/>);
                }
                if(row['last_event.event.WindSpeed'] === -9999){
                    return (<EmptyColumn/>);
                }
                return (
                    <React.Fragment>
                        <div style={{'display': 'flex'}}>
                        <span>
                            {row['last_event.event.WindSpeed']}
                        </span>
                            <NavigationIcon fontSize='small' size='small'
                                            style={{'transform': `rotate(${row['last_event.event.WindDirection']}deg)`}}/>


                        </div>
                    </React.Fragment>
                );
            }
        },
        {
            name: 'last_event.event.WindSpeedMS',
            sortName: 'last_event->event.WindSpeedMS',
            label: 'Wind(m/s)',
            type: 'number',
            align: 'center',
            isVisible: false,
            filter: (row) => {
                if (!row['last_event.event.WindSpeed']) {
                    return '-';
                }
                if(row['last_event.event.WindSpeed'] === -9999){
                    return '-';
                }
                if(row['last_event.event.WindSpeed']){
                    return roundNumber(+(row['last_event.event.WindSpeed'] * 0.44704), 1)
                }
                return row['last_event.event.WindSpeed'];
            },
            render: (row) => {
                if (!row['last_event.event.WindSpeed']) {
                    return (<EmptyColumn/>);
                }
                if(row['last_event.event.WindSpeed'] === -9999){
                    return (<EmptyColumn/>);
                }
                return (
                    <React.Fragment>
                        <div style={{'display': 'flex'}}>
                        <span>
                            {row['last_event.event.WindSpeed'] && roundNumber(+(row['last_event.event.WindSpeed'] * 0.44704), 1)}
                        </span>
                            <NavigationIcon fontSize='small' size='small'
                                            style={{'transform': `rotate(${row['last_event.event.WindDirection']}deg)`}}/>


                        </div>
                    </React.Fragment>
                );
            }
        },
        {
            label: 'Availability',
            sortName: 'dataMissedInHours',
            isVisible: false,
            name: 'dataMissedInHours',
            isAdminOnly: true,
            filter: (row)=>{
                if (typeof  row['dataMissedInHours'] !== 'undefined' && row['dataMissedInHours'] !== null) {
                    return row['dataMissedInHours'];
                }
                return '';
            },
            render: (row) => {
                let colorName = "#009662";
                if (typeof  row['dataMissedInHours'] !== 'undefined') {
                    let val = row['dataMissedInHours'];
                    if (val > 0 && val <= 24) {
                        colorName = '#FFBE00';
                    } else if (val > 24 && val <= 48) {
                        colorName = '#FFD632';
                    } else if (val > 48 && val <= 72) {
                        colorName = 'orange';
                    }
                }
                return (<Badge  title={row['dataMissedHint'] || ''} size={'small'} style={{backgroundColor: `${colorName}`, borderRadius: '10px',  padding: '10px'}} badgeContent={''} variant={'dot'}></Badge>)
            }

        },
        {
            name: 'health',
            sortName: 'health',
            isVisible: false,
            label: 'Health',
            filter: (row)=>{
                if (typeof  row['health'] !== 'undefined' && row['health'] !== null) {
                    return row['health'];
                }
                return '';
            },
            render: (row) => {
                let colorName = "#009662";
                let blue = '#305780';
                if(row['last_reported_time']){
                    let compareTime = subHours(new Date(), 1);
                    let lastTime = new Date(row['last_reported_time']);
                    let _isAfter = isAfter(lastTime,  compareTime);
                    if(_isAfter){
                        colorName = '#009662';
                        if (typeof  row['health'] !== 'undefined') {
                            if (row['health'] === 1) {
                                colorName = '#FFD632';
                            } else if (row['health'] >= 2) {
                                colorName = "#FFBE00";
                            }
                        }
                    } else {
                        colorName = "#FFBE00";
                    }
                } else {
                    colorName = "#FFBE00";
                }
                if(row['healthHint'] && row['healthHint'] === 'No GPS Fix'){
                    colorName = blue;
                }
                return (<Button  title={row['healthHint'] || ''} size={'small'} style={{backgroundColor: `${colorName}`}} variant={'contained'}></Button>)
            }
        },
        {
            name: 'positionLookup.name',
            sortName: 'positionLookup.name',
            label: 'Position',
        },
        {
            name: 'distance_ft',
            sortName: 'distance_ft',
            label: 'Distance(ft)',
            getReportValue: (row)=>{
                return !isNaN(row['distance']) ? roundNumber(+(row['distance']) * 3.280839895, 0) : 'NA';
            },
            render: (row) => {
                return !isNaN(row['distance']) ? roundNumber(+(row['distance']) * 3.280839895, 0) : 'NA';
            }
        },

        {
            name: 'lat',
            sortName: 'lat',
            isVisible: false,
            label: 'Location',
            filter: (row, rowIndex, onDispatch) => {
                let  lat = row['lat'];
                let  lng  = row['lng'];
                if(!lat &&  !lng){
                    return "NA";
                }

                if(lat === 0 &&  lng === 0){
                    return "NA";
                }
                return  [lat,  lng].join(', ')
            },
            render: (row, rowIndex, onDispatch) => {

                let  lat = row['lat'];
                let  lng  = row['lng'];
                if(!lat &&  !lng){
                    return "NA";
                }

                if(lat === 0 &&  lng === 0){
                    return (<EmptyColumn/>);
                }

                return  (<a  style={{'cursor': 'pointer', textDecoration: 'underline'}} onClick={(e) => {
                    onDispatch( 'MAP_LINK', {...row, lat, lng});
                } }> {[lat,  lng].join(', ')}</a>);
            }
        },
        {
            name: 'last_reported_time',
            sortName: 'last_reported_time',
            label: 'Last Report',
            getReportValue: (row) => {
                if(row['last_reported_time']){
                    return format(new Date(row['last_reported_time']), 'MM/dd/yyyy HH:mm:ss',{awareOfUnicodeTokens: true});
                }
                return '';
            },
            render: (row) => {
                if(row['last_reported_time']){
                    return formatDistance(new Date(row['last_reported_time']), new Date(), {
                        addSuffix: true,
                        includeSeconds: true
                    });
                }
                return null;
            }
        },
        {
            name: 'last_event.event.Battery',
            sortName: 'last_event->event.Battery',
            label: 'Battery',
            type: 'number',
            isVisible: false,
            getReportValue: (row) => {
                if (typeof row['last_event.event.Battery'] !== 'undefined' && row['last_event.event.Battery'] !== null) {
                    return [row['last_event.event.Battery'], '%'].join('');
                }
                return '';
            },
            render: (row) => {
                if (typeof row['last_event.event.Battery'] !== 'undefined' && row['last_event.event.Battery'] !== null) {
                    return [row['last_event.event.Battery'], '%'].join('');
                }
                return (<EmptyColumn/>);
            }
        },
        {
            name: 'last_event.event.Voltage',
            sortName: 'last_event->event.Voltage',
            label: 'Voltage(vdc)',
            isVisible: false,
            type: 'number',
            align: 'center',
            getReportValue: (row)=>{
                if (!isNil(row['last_event.event.Voltage'])) {
                    return numberFormat(row['last_event.event.Voltage'], 3);
                }
                return '';
            },
            render: (row)=>{
                if (!isNil(row['last_event.event.Voltage'])) {
                    return numberFormat(row['last_event.event.Voltage'], 3);
                }
                return (<EmptyColumn/>);
            }
        },
        {
            label:  'ChargeDiff.',
            name: 'last_event.event.ChargeDifferential',
            isVisible: false,
            sortName: 'last_event->event.ChargeDifferential',
            type: 'number',
            align: 'center',
            getReportValue: (row)=>{
                if (!isNil(row['last_event.event.ChargeDifferential'])) {
                    return numberFormat(row['last_event.event.ChargeDifferential'], 3);
                }
                return '';
            },
            render: (row)=>{
                if (!isNil(row['last_event.event.ChargeDifferential'])) {
                    return numberFormat(row['last_event.event.ChargeDifferential'], 3);
                }
                return (<EmptyColumn/>);
            }
        },


        {
            name: 'RSSI',
            sortName: 'RSSI',
            isVisible: false,
            isAdminOnly: true,
            label: 'RSSI',

        },
        {
            name: 'last_event.event.HDOP',
            sortName: 'last_event->event.HDOP',
            isVisible: false,
            label: 'HDOP',
        },
        {
            name: 'site.name',
            label: 'Site',
            isVisible: false,
            type: 'string',
        },
        {
            name: 'firmware',
            isVisible: false,
            label: 'Firmware',
            isAdminOnly: true,
            getReportValue : (row)=>{
                if (!isNil(row['firmware'])) {
                    return numberFormat(row['firmware'] / 100, 2);
                }
                return '';
            },
            render: (row)=>{
                if (!isNil(row['firmware'])) {
                    return numberFormat(row['firmware'] / 100, 2);
                }
                return (<EmptyColumn/>);
            }
        },
        {
            name: 'boardRev',
            isVisible: false,
            label: 'Board Rev.',
            isAdminOnly: true,
        },
        {
            name: 'last_event.event.R1',
            sortName: 'last_event->event.R1',
            label: 'R1',
            type: 'number',
            align: 'center',
            isAdminOnly: true,
            isVisible: false,
        },
        {
            name: 'last_event.event.R2',
            sortName: 'last_event->event.R2',
            isVisible: false,
            label: 'R2',
            type: 'number',
            align: 'center',
            isAdminOnly: true,
        },
        {
            name: 'last_event.event.B1',
            sortName: 'last_event->event.B1',
            isVisible: false,
            label: 'B1',
            type: 'number',
            align: 'center',
            isAdminOnly: true,
        },
        {
            name: 'last_event.event.B2',
            sortName: 'last_event->event.B2',
            isVisible: false,
            label: 'B2',
            type: 'number',
            align: 'center',
            isAdminOnly: true,
        },
        {
            name: 'last_event.event.CH4',
            sortName: 'last_event->event.CH4',
            isVisible: false,
            label: 'CH4',
            type: 'number',
            align: 'center',
            isAdminOnly: true,
        },
        {
            name: 'last_event.event.tVOC1raw',
            sortName: 'last_event->event.tVOC1raw',
            label: 'tVOC1raw(ppm)',
            type: 'number',
            align: 'center',
            isAdminOnly: true,
            isVisible: false,
            getReportValue : (row)=>{
                if (!isNil(row['last_event.event.tVOC1raw'])) {
                    return numberFormat(row['last_event.event.tVOC1raw'], 3);
                }
                return '';
            },
            render: (row)=>{
                if (!isNil(row['last_event.event.tVOC1raw'])) {
                    return numberFormat(row['last_event.event.tVOC1raw'], 3);
                }
                return (<EmptyColumn/>);
            }

        },
        {
            name: 'last_event.event.tVOC2raw',
            sortName: 'last_event->event.tVOC2raw',
            label: 'tVOC2raw(ppm)',
            type: 'number',
            align: 'center',
            isAdminOnly: true,
            isVisible: false,
            getReportValue : (row)=>{
                if (!isNil(row['last_event.event.tVOC2raw'])) {
                    return numberFormat(row['last_event.event.tVOC2raw'], 3);
                }
                return '';
            },
            render: (row)=>{
                if (!isNil(row['last_event.event.tVOC2raw'])) {
                    return numberFormat(row['last_event.event.tVOC2raw'], 3);
                }
                return (<EmptyColumn/>);
            }

        },
        {
            name: 'last_event.event.U',
            sortName: 'last_event->event.U',
            label: 'U',
            type: 'number',
            align: 'center',
            deviceType: 'Canary-S',
        },
        {
            name: 'last_event.event.IT',
            sortName: 'last_event->event.IT',
            label: 'IT',
            type: 'number',
            align: 'center',
            deviceType: 'Canary-S',
        },
        {
            name: 'last_event.event.ET',
            sortName: 'last_event->event.ET',
            label: 'ET',
            type: 'number',
            align: 'center',
            deviceType: 'Canary-S',
        },
        {
            name: 'last_event.event.IH',
            sortName: 'last_event->event.IH',
            label: 'IH',
            type: 'number',
            align: 'center',
            deviceType: 'Canary-S',
        },
        {
            name: 'last_event.event.EH',
            sortName: 'last_event->event.EH',
            label: 'EH',
            type: 'number',
            align: 'center',
            deviceType: 'Canary-S',
        },
        {
            name: 'last_event.event.P',
            sortName: 'last_event->event.P',
            label: 'P',
            type: 'number',
            align: 'center',
            deviceType: 'Canary-S',
        },
        {
            name: 'last_event.event.TVOC_PID',
            sortName: 'last_event->event.TVOC_PID',
            label: 'TVOC_PID',
            type: 'number',
            align: 'center',
            deviceType: 'Canary-S',
        },
        {
            name: 'last_event.event.PM1_0',
            sortName: 'last_event->event.PM1_0',
            label: 'PM1_0',
            type: 'number',
            align: 'center',
            deviceType: 'Canary-S',
        },
        {
            name: 'last_event.event.PM2_5',
            sortName: 'last_event->event.PM2_5',
            label: 'PM2_5',
            type: 'number',
            align: 'center',
            deviceType: 'Canary-S',
        },
        {
            name: 'last_event.event.PM10',
            sortName: 'last_event->event.PM10',
            label: 'PM10',
            type: 'number',
            align: 'center',
            deviceType: 'Canary-S',
        },
        {
            name: 'last_event.event.CO',
            sortName: 'last_event->event.CO',
            label: 'CO',
            type: 'number',
            align: 'center',
            deviceType: 'Canary-S',
        },
        {
            name: 'last_event.event.CO2',
            sortName: 'last_event->event.CO2',
            label: 'CO2',
            type: 'number',
            align: 'center',
            deviceType: 'Canary-S',
        },
        {
            name: 'last_event.event.SO2',
            sortName: 'last_event->event.SO2',
            label: 'SO2',
            type: 'number',
            align: 'center',
            deviceType: 'Canary-S',
        },
        {
            name: 'last_event.event.O2',
            sortName: 'last_event->event.O2',
            label: 'O2',
            type: 'number',
            align: 'center',
            deviceType: 'Canary-S',
        },
        {
            name: 'last_event.event.O3',
            sortName: 'last_event->event.O3',
            label: 'O3',
            type: 'number',
            align: 'center',
            deviceType: 'Canary-S',
        },
        {
            name: 'last_event.event.NO2',
            sortName: 'last_event->event.NO2',
            label: 'NO2',
            type: 'number',
            align: 'center',
            deviceType: 'Canary-S',
        },
        {
            name: 'last_event.event.H2S',
            sortName: 'last_event->event.H2S',
            label: 'H2S',
            type: 'number',
            align: 'center',
            deviceType: 'Canary-S',
        },
        {
            name: 'last_event.event.CH4_S',
            sortName: 'last_event->event.CH4_S',
            label: 'CH4_S',
            type: 'number',
            align: 'center',
            deviceType: 'Canary-S',
        },
        {
            name: 'last_event.event.Sig',
            sortName: 'last_event->event.Sig',
            label: 'Sig',
            type: 'number',
            align: 'center',
            deviceType: 'Canary-S',
        },
        /*
        {
            name: 'CCS_Version',
            sortName: 'CCS_Version',
            label: 'CCS_Version',
        },
        {
            name: 'C3_Version',
            sortName: 'C3_Version',
            label: 'C3_Version',
        },
        {
            name: 'distance',
            sortName: 'distance',
            label: 'Distance(m)',
        },*/

    ];

    if(!isDeviceTypeS){
        return _fieldNames.filter(item=> item && !item.deviceType || (item.deviceType && item.deviceType !== 'Canary-S'))
    }
    return _fieldNames;
}


const useStyles = makeStyles(theme => ({
    root: {
        width: 'calc(100%)',
        //marginTop: theme.spacing.unit,
        overflowX: 'auto',
    },
    paper: {
        //overflowY: 'auto',
        overflow: 'hidden',
        width: 'calc(100%)',
        height: 'calc(100%)',
        display:'flex',
        flexDirection:'column',
        alignItems:'stretch',
        position:  'relative',
        // margin: theme.spacing.unit,
    },
    container: {
        flexGrow:1,
        display:'flex',
        position:  'relative',
        flexDirection:'column',
        alignItems:'stretch',
        justifyContent:'stretch',
        animation: 'animate-base-container 850ms forwards',
       // paddingBottom: '10px',
        height: '100%',
    },
    heading: {
        paddingTop: '9px',
        paddingLeft: '9px',
        paddingBottom: '4px',
        fontSize: '.9rem',
        textTransform: 'uppercase',
        fontWeight:'700',
        backgroundColor: theme.palette.background.default,
    },
    tabRoot:{
        minHeight: '40px',
    },
    tabHeader: {
        color: theme.palette.text.primary,
        minHeight: '30px',
        height: '30px',
    }
}));

function reducer(currentState, newState) {
    return {...currentState, ...newState};
}



function useDeviceAdmin({classes, match, history, containerType}) {


    const {user_data} = useContext(UserDetailsContext);
    const {collections, refresh, signalRefresh } = useContext(CollectionDataContext);
    const [{reference_id, reference_type, selectedTab, title, operational_unit_id, site_id, loading, params, fieldNames, companyId, hideRemoveButton, deviceTypeMap, resourceNotFound}, setReducerState] = useReducer(reducer, {
        reference_id: undefined,
        reference_type, undefined,
        selectedTab: 0,
        siteData: undefined,
        title:  '',
        loading: false,
        params: undefined,
        fieldNames: getFieldNames(),
        hideRemoveButton: true,
        companyId: undefined,
        operational_unit_id: undefined,
        site_id: undefined,
        deviceTypeMap: undefined,
        resourceNotFound: false,
    });

    useEffect(() => {
        if (match.params.id && containerType && match.params.id !== 'devices' && match.params.id !== 'unassigned' ) {
            setReducerState({
                selectedTab: 0,
                params: {id: match.params.id, containerType: containerType}
            });
            setContainerDetailHeader();
            fetchAvailableDeviceTypes();
        } else {
            setReducerState({
                params: undefined
            });
        }
    }, [match.params.id, containerType]);

    useEffect(()=>{
        if(user_data && user_data.groupName !== 'ADMIN'){
            let fNames = getFieldNames(deviceTypeMap).filter(item=> !item.isAdminOnly);
            setReducerState({
                fieldNames: fNames,
                hideRemoveButton: true,
            });
        } else if(user_data && user_data.groupName === 'ADMIN'){
            setReducerState({
                fieldNames: getFieldNames(deviceTypeMap),
                hideRemoveButton: false,
            });
        }

    },[user_data, deviceTypeMap]);


    const setContainerDetailHeader =  useCallback(function setContainerDetailHeader() {

        //console.log('containerType', containerType);
        setReducerState({
            loading: true
        });
        switch (containerType) {
            case 'company':
            case 'companies':
                fetchCompanyData();
                break;
            case 'division':
            case 'divisions':
                fetchDivisionData();
                break;
            case 'site':
                fetchSiteData();
                break;
            default:
                //fetchSiteData();
                break;

        }
    },[match.params.id, containerType]);


    const  fetchCompanyData = useCallback(function fetchCompanyData() {
        if(match.params.id) {
            let _companyId;
            let idParam = parseInt(match.params.id);
            if (collections[idParam]) {
                let resultData = {...collections[idParam]};
                setReducerState({
                    reference_id: resultData.id,
                    reference_type: resultData.lookup_ID,
                    title: `${resultData.name}`,
                    loading: false,
                    companyId: resultData.id,
                    operational_unit_id: undefined,
                    site_id: undefined,
                    resourceNotFound: false,
                })
                //fetchActivities(resultData.id, resultData.lookup_ID);
            } else {
                refresh().then((data) => {
                    if (data && data[idParam]) {
                        let resultData = {...data[idParam]};
                        setReducerState({
                            reference_id: resultData.id,
                            reference_type: resultData.lookup_ID,
                            title: `${resultData.name}`,
                            loading: false,
                            companyId: resultData.id,
                            operational_unit_id: undefined,
                            site_id: undefined,
                            resourceNotFound: false,
                        })
                    } else {
                        setReducerState({
                            resourceNotFound: true,
                        });
                    }

                }).catch(err => {
                    console.log(err);
                });
            }
        }
    },[match.params.id, collections]);

    const fetchDivisionData = useCallback(function fetchDivisionData() {
        if(match.params.id) {
            let idParam = parseInt(match.params.id);
            if (collections[idParam]) {
                let resultData = {...collections[idParam]};
                setReducerState({
                    reference_id: resultData.id,
                    reference_type: resultData.lookup_ID,
                    title: `${resultData.name}`,
                    loading: false,
                    companyId: resultData.parentID,
                    operational_unit_id: resultData.id,
                    site_id: undefined,
                    resourceNotFound: false,
                })
            } else {
                refresh().then((data) => {
                    if (data && data[idParam]) {
                        let resultData = {...data[idParam]};
                        setReducerState({
                            reference_id: resultData.id,
                            reference_type: resultData.lookup_ID,
                            title: `${resultData.name}`,
                            loading: false,
                            companyId: resultData.parentID,
                            operational_unit_id: resultData.id,
                            site_id: undefined,
                            resourceNotFound: false,
                        });
                    } else {
                        setReducerState({
                            resourceNotFound: true
                        });
                    }
                }).catch(err => {
                    console.log(err);
                });
            }
        }
    },[match.params.id,  collections]);

    const  fetchSiteData =  useCallback(function fetchSiteData() {
        if(match.params.id) {
            let idParam = parseInt(match.params.id);
            if (idParam === 'unassigned') {
                setReducerState({
                    title: `Unassigned`,
                    loading: false
                });
                return;
            }
            siteService.findOne(idParam).then((result) => {
                if (result && result.data) {
                    let _companyId;
                    if(result.data.operational_unit && result.data.operational_unit.parentID){
                        _companyId = parseInt(result.data.operational_unit.parentID);
                    }
                    setReducerState({
                        reference_id: result.data.id,
                        reference_type: result.data.lookup_ID,
                        title: result.data.name ? `${result.data.name}` : '',
                        siteData: result.data,
                        loading: false,
                        companyId: _companyId,
                        operational_unit_id: undefined,
                        site_id: result.data.id,
                        resourceNotFound: false,
                    })
                } else {
                    setReducerState({
                        loading: false,
                        companyId: undefined,
                        operational_unit_id: undefined,
                        site_id: undefined,
                        resourceNotFound: true,
                    });
                }
            }).catch((error) => {
                //console.log(error);
                if(error && error.message === 'SITE_NOT_FOUND'){
                    setReducerState({
                        resourceNotFound: true
                    });
                } else {
                   // enqueueSnackbar(error.message, { variant: 'error'})
                    setReducerState({
                        resourceNotFound: false,
                    });
                }
            });
        }
    },[match.params.id, collections, containerType]);

    const  fetchAvailableDeviceTypes =  useCallback(function fetchAvailableDeviceTypes() {
        if(match.params.id) {
            let idParam = parseInt(match.params.id);
            if (idParam === 'unassigned') {

                return;
            }
            deviceService.listAvailableDeviceTypes({id: idParam, containerType: containerType}).then((result) => {
                if (result && result.data) {

                    let _deviceTypeMap = {};
                    result.data.map((item)=>{
                        if(item && item.type){
                            _deviceTypeMap[item.type]= true;
                        }
                    });
                    setReducerState({
                        deviceTypeMap: _deviceTypeMap,
                    });
                } else {
                    setReducerState({
                        deviceTypeMap: {},
                    });
                }
            }).catch((error) => {
                console.log(error);

            })
        }
    },[match.params.id, containerType]);

    const  handleTabChange = useCallback(function handleTabChange(event, newValue) {
        setReducerState({selectedTab: newValue});
    },[]);

    const onDispatch = useCallback(function onDispatch(params){
        if(params){
            const topic = match.params.topic;
            const  { action, payload} = params;
            switch (action) {
                case 'MAP_LINK':
                    const {lat,  lng, id }  =  payload;
                    history.push('/dashboard/'+topic+ '/' + match.params.id + '/' + 'overview?device_id='+id+'&lat='+lat+'&lng='+ lng +'');
                    break;
                case 'REFRESH':
                    signalRefresh();
                    break;
            }
        }
    },[match.params.id,  containerType]);

    return {collections, refresh, signalRefresh, reference_id, reference_type, selectedTab, title, loading, params, handleTabChange, onDispatch, fieldNames,companyId, user_data,  operational_unit_id, site_id, resourceNotFound}
};


const DeviceAdmin = React.memo(function DeviceAdmin({ match,  history, containerType}) {
    const classes = useStyles();
    const {reference_id, reference_type, selectedTab, title, loading, params, handleTabChange, onDispatch, fieldNames, hideRemoveButton, companyId, user_data,  operational_unit_id, site_id, resourceNotFound} = useDeviceAdmin({classes, match, history, containerType});

    if (typeof match.params.id === "undefined") {
        return null;
    }

    if(containerType === 'global'){
        return (<Paper className={classnames(classes.paper)}>
            <Typography className={classes.heading}>{title}
            </Typography><h1>Coming soon</h1>
        </Paper>);
    }
    if(resourceNotFound === true){
        return  (<NotFound_404/>)
    }
    return (
        <Paper className={classnames(classes.paper)}>
            <Typography className={classes.heading}>{title}</Typography>
            <Tabs className={classes.tabRoot} value={selectedTab} onChange={handleTabChange}>
                <Tab className={classes.tabHeader} label="Devices"/>
                <Tab className={classes.tabHeader} label="Activities"/>
                <Tab className={classes.tabHeader} label="Alerts"/>
            </Tabs>
            {selectedTab === 0 && params && (
                <div className={classes.container}>
                        <DataView dataViewName={'device-table'} hideTitle={true} useDragger={true} hideAddDataBtn={true}
                                  dataProvider={deviceService}
                                  onDispatchEvent={onDispatch}
                                  params={params}
                                  hideRemoveButton={hideRemoveButton}
                                  fieldNames={fieldNames} title={title}
                                  CreatorRef={DeviceCreator}
                                  EditorRef={DeviceEditor}>
                        </DataView>
                </div>
            )}
            {selectedTab === 1 && reference_id && reference_type && (
                    <div className={classes.container}>
                            <ActivityView reference_id={reference_id}
                                          reference_type={reference_type}></ActivityView>
                    </div>
            )}
            {selectedTab === 2 && reference_id && reference_type && (
                <div className={classes.container}>
                    <AlertNotificationContainer companyId={companyId} operational_unit_id={operational_unit_id} site_id={site_id} reference_id={reference_id}
                                  reference_type={reference_type}></AlertNotificationContainer>
                </div>
            )}
        </Paper>
    )
});


export default withRouter(DeviceAdmin);
