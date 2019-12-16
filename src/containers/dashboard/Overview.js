import React, {useCallback, useContext, useEffect, useState} from 'react';
import {makeStyles, Paper, withStyles} from "@material-ui/core";
import {withRouter} from "react-router";
import {CollectionDataContext} from "../../components/collection/CollectionDataProvider";
import {deviceService} from "../../services/deviceService";
import GoogleMapComponent from "../../components/googlemaps/GoogleMapComponent";
import DateFnsUtils from "@date-io/date-fns";
import {useSnackbar} from "notistack";
import {debounce} from "lodash";
import {Observable, empty, from, fromEvent, queueScheduler, of} from 'rxjs';
import {map, switchMap, concatMap, catchError, debounceTime, mergeMap, concatAll} from 'rxjs/operators';
import {AxiosSubscriber} from "../../services/axiosInstance/AxiosSubscriber";
import {roundNumber} from "../../helpers/CommonHelper";
import {UserDetailsContext} from "../auth/AuthProvider";
const dateFns = new DateFnsUtils();

const useStyles = makeStyles(theme => ({
    paper: {
        padding: theme.spacing(2) ,
        paddingLeft:0,
        paddingRight:0,
        textAlign: 'center',
        color: theme.palette.text.secondary,
        height: 'calc(100%)',
        animation: 'animate-base-container 850ms forwards'
    },
}));

function getFieldNames(deviceTypesMap) {
    let isDeviceTypeS = deviceTypesMap && deviceTypesMap['Canary-S'];
    const _fieldNames = [
        {
            name: 'id',
            label: 'CanaryID',
        },
        {
            name: 'site.name',
            label: 'Site',
            type: 'string',
            disabled: true,
            isEditable: false,
        },
        {
            name: 'site.operational_unit.name',
            label: 'Collection Name',
        },
        {
            name: 'last_event.event.TimeStamp',
            label: 'Last Report',
        },
        {
            name: 'last_event.event.tVOC1',
            sortName: 'last_event->event.tVOC1',
            label: 'tVOC1(ppm)',
            type: 'number',
            align: 'left',
        },
        {
            name: 'last_event.event.tVOC2',
            sortName: 'last_event->event.tVOC2',
            label: 'tVOC2(ppm)',
            type: 'number',
            align: 'left',
        },
        {
            name: 'last_event.event.TempF',
            sortName: 'last_event->event.TempF',
            label: 'Temp(F)',
            isVisible: false,
            type: 'number',
            align: 'left',
        },
        {
            name: 'last_event.event.TempC',
            sortName: 'last_event->event.TempC',
            label: 'Temp(C)',
            isVisible: false,
            type: 'number',
            align: 'left',
            render: (row) => {
                return !isNaN(row['last_event.event.TempF']) ? roundNumber(((+(row['last_event.event.TempF']) - 32) * (5 / 9)), 2) : 'NA';
            }
        },
        {
            name: 'last_event.event.Humidity',
            sortName: 'last_event->event.Humidity',
            label: 'Humidity (Rel. %)',
            isVisible: false,
            type: 'number',
            align: 'left',
        },
        {
            name: 'last_event.event.Battery',
            sortName: 'last_event->event.Battery',
            label: 'Battery',
            type: 'number',
            isVisible: false,
            render: (row) => {
                if (typeof row['last_event.event.Battery'] !== 'undefined' && row['last_event.event.Battery'] !== null) {
                    return [row['last_event.event.Battery'], '%'].join('');
                }
                return 'NA';
            }
        },
        {
            name: 'last_event.event.Voltage',
            sortName: 'last_event->event.Voltage',
            label: 'Voltage(vdc)',
            isVisible: false,
            type: 'number',
        },
        {
            label: 'ChargeDiff.',
            name: 'last_event.event.ChargeDifferential',
            isVisible: false,
            sortName: 'last_event->event.ChargeDifferential',
            type: 'number',
        },
        {
            name: 'isLocationLocked',
            label: 'isLocationLocked',
            isVisible: false,
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
            name: 'last_event.event.HDOP',
            sortName: 'last_event->event.HDOP',
            isVisible: false,
            label: 'HDOP',
        },
        {
            name: 'positionLookup.name',
            label: 'Position',
        },
        {
            name: 'lat',
            label: 'Lat',
        },
        {
            name: 'lng',
            label: 'Lng',
        },
        {
            name: 'last_event.event.WindSpeed',
            label: 'Wind'
        },
        {
            name: 'last_event.event.WindDirection',
            label: 'WindDirection'
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
    ];

    if(!isDeviceTypeS){
        return _fieldNames.filter(item=> item && !item.deviceType || (item.deviceType && item.deviceType !== 'Canary-S'))
    }
    return _fieldNames;
}

export function useOverview(props) {

    const {user_data} = useContext(UserDetailsContext);

    const {classes, match, containerType, history} = props;
    const [rawDeviceData, setRawDeviceData] = useState(null);
    const [deviceData, setDeviceData] = useState(null);
    const [primarySensorName, setPrimarySensorName] = useState('tVOC1(ppm)');
    const [deviceTypesMap, setDeviceTypesMap] = useState({'Canary-C': true });
    const [fieldNames, setFieldNames] = useState(null);
    const [isLoading, setIsLoading] = useState(false);

    const {enqueueSnackbar} = useSnackbar();
    const subscriptionRef = React.useRef();

    const {collections, refresh, updatePartial} = useContext(CollectionDataContext);
    let idParam = match && match.params && match.params.id ? match.params.id : null;
    if (idParam !== 'devices') {
        idParam = parseInt(idParam);
    }

    React.useEffect(() => {
        subscriptionRef.current = [];
        return ()=> clearSubscriptions();
    }, []);

    useEffect(()=>{
        if(user_data && user_data.groupName !== 'ADMIN'){
            let fNames = getFieldNames(deviceTypesMap).filter(item=> !item.isAdminOnly);
            setFieldNames(fNames);
        } else if(user_data){
            setFieldNames(getFieldNames(deviceTypesMap));
        }

    },[user_data, deviceTypesMap]);




    useEffect(()=> {
        if(match.params.id && match.params.id !== 'devices' && containerType){
            setIsLoading(true);
            debounce(fetchData, 50)();
            return ()=> clearSubscriptions();
        }
    },[match.params.id, collections, containerType]);

    useEffect(()=> {
        if(match.params.id && match.params.id !== 'devices' && containerType){
            let deviceTypeListSub = fetchAvailableDeviceTypes().pipe(catchError(err => {
                return {};
            })).subscribe((result)=>{
                if (result && result.data) {
                    let _deviceTypeMap = {};
                    result.data.map((item)=>{
                        if(item && item.type){
                            _deviceTypeMap[item.type]= true;
                        }
                    });
                    setDeviceTypesMap(_deviceTypeMap);
                    if(_deviceTypeMap['Canary-S'] === true){
                        setPrimarySensorName('TVOC_PID');
                    } else {
                        setPrimarySensorName('tVOC1(ppm)');

                    }
                } else {
                    setPrimarySensorName('tVOC1(ppm)');
                }
            });

            subscriptionRef.current.push(deviceTypeListSub);
        }
    },[match.params.id, containerType]);


    useEffect(()=>{
        if(fieldNames && rawDeviceData && Array.isArray(fieldNames) && Array.isArray(rawDeviceData)){
            let devices  = rawDeviceData.map((item)=>{
                if(item && item['last_event.event.tVOC1']){
                    item['last_event.event.tVOC1'] = roundNumber(item['last_event.event.tVOC1'] / 1000, 3);
                }
                if(item && item['last_event.event.tVOC2']){
                    item['last_event.event.tVOC2'] = roundNumber(item['last_event.event.tVOC2'] / 1000, 3);
                }
                if(item &&  item['last_event.TimeStamp']){
                    item['last_event.TimeStamp'] = new Date(item['last_event.TimeStamp']);
                }
                if(item && item["last_event.event.Latitude"]){
                    item["last_event.event.Latitude"] = roundNumber(item['last_event.event.Latitude'], 5);
                }
                if(item && item["last_event.event.Longitude"]){
                    item["last_event.event.Longitude"] = roundNumber(item['last_event.event.Longitude'], 5);
                }

                if(item && item['last_event.event.WindSpeed']){
                    item['last_event.event.WindSpeed'] =  roundNumber(item['last_event.event.WindSpeed'], 1);
                    /*if(item['last_event.event.WindSpeed'] > 5){
                        item['last_event.event.WindSpeed'] =  roundNumber(item['last_event.event.WindSpeed'], 0);
                    } else {
                        item['last_event.event.WindSpeed'] =  roundNumber(item['last_event.event.WindSpeed'], 1);
                    }*/
                }
                let  newItem = {};
                fieldNames.forEach((field)=>{
                    if(field.name === 'last_event.event.TimeStamp'){
                        newItem[field.label] = dateFns.format(new Date(item[field.name]), dateFns.dateTime12hFormat);
                    }  else {
                        newItem[field.label] = field.render ? field.render(item) : item[field.name];
                    }
                });
                return newItem;
            });
            setDeviceData(devices);
        }

    },[rawDeviceData, fieldNames]);

    const  fetchAvailableDeviceTypes =  useCallback(function fetchAvailableDeviceTypes() {
        if(match.params.id && containerType) {
            let observable$ = new Observable((observer) => {
                return new AxiosSubscriber(observer, '/devices/availableTypes/lists', {id: match.params.id, containerType: containerType});
            });
            return observable$;
        }
    },[match.params.id, containerType]);

    function refreshData(whereCondition) {
        return new Observable( ( observer ) => {
            return new AxiosSubscriber( observer, deviceService.getEndPoint(), {
                whereCondition,
                limit: 1000
            });
        });
    }

    function onSelectDevicePosition(id, position) {
        
    }

    const fetchData = React.useCallback(function fetchData(){
        let whereCondition = {id: idParam === 'unassigned' ? null : idParam, containerType: containerType};
        if(containerType === 'global'){
            whereCondition = {};
        }
        if(idParam === 'devices' && (containerType === 'sites')){
            return false;
        }
        let newSub= refreshData(whereCondition).pipe(map(result=>{
            if(result  && result.data){
                return result.data;
            } else {
                return [];
            }
        }), catchError((err)=>{
            if(err && err.message && (err.message === 'access_token_expired'|| err.message === 'Unathorized')){
                if(history.location.pathname.startsWith('/dashboard')){
                    history.push('/login');
                }
                enqueueSnackbar("Your session  has been expired. Please try login", {variant: 'error'});
            } else {
                enqueueSnackbar(err? err.message: 'Failed request',  {variant:'error'});
            }
            return [];
        })).subscribe(((devices=[])=>{
            setRawDeviceData(devices);
        }));
        subscriptionRef.current.push(newSub);

    },[match.params.id, collections, fieldNames, containerType]);


    const clearSubscriptions = React.useCallback(function clearSubscriptions() {
        if (subscriptionRef && subscriptionRef.current) {
            subscriptionRef.current.forEach((subscription) => {
                if (subscription) {
                    subscription.unsubscribe();
                }
            });
            subscriptionRef.current = [];
        }
    },[subscriptionRef.current]);

    return {deviceData, containerType, onSelectDevicePosition, primarySensorName, fieldNames};
}


function Overview(props) {

    const classes = useStyles();
    const  { match } = props;
    const  {deviceData, containerType, onSelectDevicePosition, primarySensorName} = useOverview({...props, classes});
    let idParam = match.params.id ? match.params.id : null;
    if (typeof idParam === undefined) {
        return null;
    }
    return(
        <Paper className={classes.paper}>
            <GoogleMapComponent primarySensorName={primarySensorName} hideAddressPicker={  !containerType? true: false} onSelectDevicePosition={onSelectDevicePosition} deviceData={deviceData}></GoogleMapComponent>
        </Paper>
    )
};


export default withRouter(Overview);
