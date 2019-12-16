import React, {useContext, useEffect, useLayoutEffect} from 'react';
import TinySpinner from "../TinySpinner";
import * as classnames from "classnames";
import {makeStyles, withStyles} from "@material-ui/core";
import {MapStyles as mapStyles, MapStyles} from "./MapStyles";
import InputBase from "@material-ui/core/InputBase";
import Paper from "@material-ui/core/Paper";
import IconButton from "@material-ui/core/IconButton";
import SearchIcon from '@material-ui/icons/Search';
import {roundNumber} from '../../helpers/CommonHelper';
import * as ReactDOM from "react-dom";
import * as d3 from 'd3';

import "./_gmap.scss";
import "../../styles/_animate_heathing.scss";
import Button from "@material-ui/core/Button";
import {teal, lime, amber, yellow, green, orange} from "@material-ui/core/colors";
import LocationMapControl from './LocationMapControl';
import {WindroseColorScale} from "../Charts/MyChart/WindroseScale";
import {UserDetailsContext} from "../../containers/auth/AuthProvider";
import {useSnackbar} from "notistack";
import ContextModal from "./ContextModal";

const roomIconPath = `M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z`;

const tVocColorScale = WindroseColorScale;

let googleMapApiKey = process.env.REACT_APP_GOOGLE_MAP_API_KEY;


const useStyles =makeStyles( theme => ({
    heading: {
        margin: 0,
        paddingLeft: '9px',
        paddingTop: '10px',
        fontSize: '1rem',
        textTransform: 'uppercase',
        fontWeight:'700',
    },
    contextMenu: {
        opacity: '0',
        display: 'none !important',
        backgroundColor: theme.palette.secondary.main,
        '& .p-menuitem-link': {
            paddingLeft: '0px',
            color: theme.palette.text.primary,
            textDecoration: 'none'
        }
    },
    gmapWrapper: {
        height: '100%',
        width: '100%',
        position: 'relative'
    },
    mapContainer: {
        height: '100%',
        width: '100%',
        display: 'flex',
        flexGrow: 1,
        justifyContent: 'center',
        alignItems: 'center'
    },
    searchBox: {
        padding: '2px 2px',
        display: 'flex',
        alignItems: 'center',
        width: 400,
    },
    maptypeButton: {
        //marginLeft: '5px',
        marginRight: '5px'
    },
    iconButton: {
        padding: 10,
    },
    mapStyle: [
        {elementType: 'geometry', stylers: [{color: '#242f3e'}]},
        {elementType: 'labels.text.stroke', stylers: [{color: '#242f3e'}]},
        {elementType: 'labels.text.fill', stylers: [{color: '#746855'}]},
        {
            featureType: 'administrative.locality',
            elementType: 'labels.text.fill',
            stylers: [{color: '#d59563'}]
        },
        {
            featureType: 'poi',
            elementType: 'labels.text.fill',
            stylers: [{color: '#d59563'}]
        },
        {
            featureType: 'poi.park',
            elementType: 'geometry',
            stylers: [{color: '#263c3f'}]
        },
        {
            featureType: 'poi.park',
            elementType: 'labels.text.fill',
            stylers: [{color: '#6b9a76'}]
        },
        {
            featureType: 'road',
            elementType: 'geometry',
            stylers: [{color: '#38414e'}]
        },
        {
            featureType: 'road',
            elementType: 'geometry.stroke',
            stylers: [{color: '#212a37'}]
        },
        {
            featureType: 'road',
            elementType: 'labels.text.fill',
            stylers: [{color: '#9ca5b3'}]
        },
        {
            featureType: 'road.highway',
            elementType: 'geometry',
            stylers: [{color: '#746855'}]
        },
        {
            featureType: 'road.highway',
            elementType: 'geometry.stroke',
            stylers: [{color: '#1f2835'}]
        },
        {
            featureType: 'road.highway',
            elementType: 'labels.text.fill',
            stylers: [{color: '#f3d19c'}]
        },
        {
            featureType: 'transit',
            elementType: 'geometry',
            stylers: [{color: '#2f3948'}]
        },
        {
            featureType: 'transit.station',
            elementType: 'labels.text.fill',
            stylers: [{color: '#d59563'}]
        },
        {
            featureType: 'water',
            elementType: 'geometry',
            stylers: [{color: '#17263c'}]
        },
        {
            featureType: 'water',
            elementType: 'labels.text.fill',
            stylers: [{color: '#515c6d'}]
        },
        {
            featureType: 'water',
            elementType: 'labels.text.stroke',
            stylers: [{color: '#17263c'}]
        }
    ]
}));

const GoogleMapComponent = React.memo(function GoogleMapComponent({onSelectPosition, onSelectDevicePosition, onSelectDeviceAutoRelocate, defaultPosition, initialMapMode, hideAddressPicker, hideLocationPicker, deviceData,  defaultLocation, primarySensorName}) {

    const classes = useStyles();
    const {user_data} = useContext(UserDetailsContext);
    const [mapLoaded, setMapLoaded] = React.useState(false);
    const [formSubmitted, setFormSubmitted] = React.useState(false);
    const [error_address, setError_address] = React.useState(false);
    const [currentHour, setCurrentHour] = React.useState(0);
    const [mapType, setMapType] = React.useState('terrain');
    const addressAutoCompltRef = React.useRef();
    const searchBoxRef = React.useRef();
    const [open, setOpen] = React.useState(false);
    const markers = new Set();
    const deviceMarkers = new Set();
    const [showLocationMarker, setShowLocationMarker] = React.useState(false);
    const [mapMode, setMapMode] = React.useState(initialMapMode ? initialMapMode : 'auto');
    const mapRef = React.useRef();
    const mapRefContainer = React.useRef();
    let ctMenuRef = React.useRef(null);
    const menu = [
        {
            label: 'Add',
            command: (event, item) => {
            }
        }
    ];
    const {enqueueSnackbar} = useSnackbar();

    useEffect(() => {
        let url = `https://maps.googleapis.com/maps/api/js?key=${googleMapApiKey}&libraries=places,geometry,drawing,visualization`;
        if (!window.google || !window.google.maps) {
            loadScript(url);
        } else {
            setMapLoaded(true);
        }

        function loadScript(url) {
            const body = document.body;
            const script = document.createElement('script');
            script.innerHTML = '';
            script.src = url;
            script.async = true;
            script.defer = true;
            script.onload = function () {
                setMapLoaded(true);
            };
            body.appendChild(script);
        }
    }, []);


    useEffect(() => {
        setCurrentHour(new Date().getHours());
    }, []);

    useLayoutEffect(() => {
        if (mapLoaded && deviceData && mapRef.current) {
            setupDeviceMarkers();
        }
    }, [deviceData, mapLoaded, mapMode,  mapRef.current]);

    useEffect(() => {
        if (mapLoaded) {
            mapRef.current = new window.google.maps.Map(mapRefContainer.current, {
                // center: {...this.state.defaultPosition},
                center: defaultPosition && defaultPosition.lat && defaultPosition.lng ? defaultPosition : {
                    lat: 40.674,
                    lng: -73.945
                },
                zoom: defaultPosition && defaultPosition.initialZoom ? defaultPosition.initialZoom : 18,
                mapTypeId: mapType,
                zoomControl: true,
                zoomControlOptions: {
                    position: window.google.maps.ControlPosition.LEFT_BOTTOM
                },
                fullscreenControl: false,
                mapTypeControl: false,
                streetViewControl: false,
                visible: true,
                disableDefaultUI: true,
                styles: MapStyles.night,
            });

            if (deviceData) {
                setupDeviceMarkers();
            }

            window.google.maps.event.addListener(mapRef.current, 'click', mapClickhandler);

            if (!hideAddressPicker) {
                window.google.maps.event.addListener(mapRef.current, 'tilesloaded', setupSearchBox);
            }

            if (!defaultPosition || !defaultPosition.lat) {
                // requestPermission();
            } else {
                setMarker(defaultPosition);
            }

            return () => {
                if (mapRef.current) {
                  if(addressAutoCompltRef && addressAutoCompltRef.current){
                      window.google.maps.event.clearInstanceListeners(addressAutoCompltRef.current);
                  }

                    window.google.maps.event.clearInstanceListeners(mapRef.current);
                    // window.google.maps.event.removeListener(mapRef.current, 'click', mapClickhandler);
                    // window.google.maps.event.removeListenerOnce(mapRef.current, 'tilesloaded', setupSearchBox);
                    mapRef.current = null;
                }
            };
        }


    }, [mapLoaded]);

    useLayoutEffect(() => {
        if (mapRef.current) {
            mapRef.current.setMapTypeId(mapType);
            return () => {
                if (mapType) {
                    window.localStorage.setItem('selectedMapType', JSON.stringify(mapType));
                }
            }
        }
    }, [mapType]);

    useLayoutEffect(() => {
        if (mapRef.current && mapMode) {
            window.localStorage.setItem('selectedMapMode', JSON.stringify(mapMode));
        }
    }, [mapMode]);



    useLayoutEffect(() => {
        let item = window.localStorage.getItem('selectedMapType');
        if (item && item !== 'undefined' && item !== 'null') {
            try {
                let selectedMapType = JSON.parse(item);
                if (selectedMapType) {
                    setMapType(selectedMapType);
                }
            } catch (err) {
                console.log(err);
            }
        }
    }, []);




    useLayoutEffect(() => {
        if (mapRef.current) {
            if (showLocationMarker) {
                try {
                    if(mapRef.current.currentMarker){
                      mapRef.current.currentMarker.setOpacity(0);
                    }
                    mapRef.current.selectedDeviceId = undefined;
                    mapRef.current.selectedTaskName = 'CHANGE_SITE_LOCATION';
                    makeLocationPickerCursor();
                } catch (err) {
                    console.log(err);
                }
            } else {
                try {
                    if(mapRef.current.currentMarker){
                        //mapRef.current.currentMarker.setOpacity(1);
                        setupDeviceMarkers();
                    }
                    makeDefaultCursor();
               } catch (err) {
                    console.log(err);
                }
            }
            mapRef.current.showLocationMarker = showLocationMarker;
        }

    }, [showLocationMarker]);

    useEffect(() => {
        let _selectedMapMode = window.localStorage.getItem('selectedMapMode');
        if (_selectedMapMode && _selectedMapMode !== 'undefined' && _selectedMapMode !== 'null' && ! initialMapMode) {
            try {
                _selectedMapMode = JSON.parse(_selectedMapMode);
                if (_selectedMapMode) {
                   // alert(_selectedMapMode);
                    setMapMode(_selectedMapMode);
                }
            } catch (err) {
                console.log(err);
            }
        }
    }, []);


    function mapClickhandler(event) {
        if (mapRef.current && mapRef.current.openedInfo) {
            mapRef.current.openedInfo.close();
        }
        if (mapRef.current &&  mapRef.current.selectedTaskName ){
            
            const { latLng  } = event;
            const pos = {
                lat: roundNumber(latLng.lat(), 5),
                lng: roundNumber(latLng.lng(), 5),
            };
            makeDefaultCursor();
            if(mapRef.current.selectedTaskName === 'CHANGE_SITE_LOCATION'){
                if (onSelectPosition && typeof onSelectPosition === 'function') {
                    onSelectPosition({...pos, initialZoom: mapRef.current.zoom});
                }
                mapRef.current.showLocationMarker  = false;
            } else if(mapRef.current.selectedTaskName === 'CHANGE_DEVICE_LOCATION'){
                const selectedDeviceId = mapRef.current.selectedDeviceId;
                if(selectedDeviceId){
                    if (onSelectDevicePosition && typeof onSelectDevicePosition === 'function') {
                        onSelectDevicePosition({id: selectedDeviceId, ...pos});
                    }
                }
            }

            setShowLocationMarker(false);
            setMarker(pos, { opacity: 1});
        }
    }



    function makeDefaultCursor() {
        try {
            if(mapRef.current)
            mapRef.current.getDiv().querySelector('.gm-style').querySelector('div').lastElementChild.style.cursor = 'default';
        } catch (err) {
            console.log(err);
        }
    }


    function makeLocationPickerCursor() {
        try {
            if(mapRef.current)
            mapRef.current.getDiv().querySelector('.gm-style').querySelector('div').lastElementChild.style.cursor = 'crosshair';
        } catch (err) {
            console.log(err);
        }
    }

    function onChangeLocation() {
        setOpen(false);
        mapRef.current.selectedTaskName = 'CHANGE_DEVICE_LOCATION';
        makeLocationPickerCursor();
        enqueueSnackbar('Device re-location mode activated. Please click in the map to relocate the device.', {variant: 'success'});
    }

    function onAutoRelocate() {
        setOpen(false);
        if (mapRef.current && mapRef.current.selectedDeviceId && onSelectDeviceAutoRelocate && typeof onSelectDeviceAutoRelocate === 'function') {
            onSelectDeviceAutoRelocate({id: mapRef.current.selectedDeviceId});
        }

    }

    function setMarker({lat, lng}, params={opacity: 0}) {
        if (mapRef.current) {
          let opacity = typeof params.opacity !== 'undefined'?  params.opacity: 0;
            let mapCenter = new window.google.maps.LatLng(lat, lng);
            let marker = new window.google.maps.Marker({
                position: mapCenter,
                icon1: {
                    path: roomIconPath,
                    fillColor: green["400"],
                    fillOpacity: 1,
                    strokeColor: 'white',
                    strokeWeight: 1,
                    origin: new window.google.maps.Point(0, 0),
                    anchor: new window.google.maps.Point(20, 40),
                    scale: 2
                    // anchor: '0, -22'

                }, //icon: getDefaultMarkerIcon(),
                //title: defaultPosition && defaultPosition.name
                //    ? defaultPosition.name : undefined,
                /*label: {
                    text: defaultPosition && defaultPosition.name
                        ? defaultPosition.name : undefined,
                    color: 'white',
                    fontWeight: 'bold',
                    fontFamily: 'roboto',
                },*/
                draggable: false,
                map: mapRef.current,
                opacity: opacity
            });
            clearMarkers();
            marker.setMap(mapRef.current);
            markers.add(marker);
            mapRef.current.currentMarker = marker;
        }
    }


    function clearMarkers() {

        if (mapRef.current && mapRef.current.currentMarker) {
            mapRef.current.currentMarker.setMap(null);
        }
        Array.from(markers).forEach((marker) => {
            window.google.maps.event.clearInstanceListeners(marker);
            marker.setMap(null);
            // marker.removeAllListeners();
        });
        markers.clear();
    }

    function clearCurrentDeviceMarkers() {
        if (mapRef && mapRef.current && Array.isArray(mapRef.current.deviceMarkers)) {
            mapRef.current.deviceMarkers.map((item) => {
                window.google.maps.event.clearInstanceListeners(item);
                item.setMap(null);
            });
            mapRef.current.deviceMarkers = [];
            if (mapRef.current.locationMarker) {
                mapRef.current.locationMarker.setMap(null);
            }
        }
    }

    function placeChangeHandler(e) {
        if (addressAutoCompltRef && addressAutoCompltRef.current) {
            const place = addressAutoCompltRef.current.getPlace();
            if (place) {
                handlePlaceChanges(place);
            }
        }
    }


    function handleMarkerDragChanges(event) {
        if (mapRef && mapRef.current && event) {
            const pos = {lat: roundNumber(event.latLng.lat(), 5), lng: roundNumber(event.latLng.lng(), 5)};
            if (onSelectPosition && typeof onSelectPosition === 'function') {
                onSelectPosition({...pos, initialZoom: mapRef.current.zoom});
            }
            mapRef.current.setCenter(pos);
        }
    }

   const handlePlaceChanges = React.useCallback(function handlePlaceChanges(place) {
        if (mapRef && mapRef.current && place) {
            if (place.geometry && place.geometry.location) {
                const pos = {
                    lat:  place.geometry.location.lat(),
                    lng: place.geometry.location.lng(),
                };
                mapRef.current.setCenter(pos);
              //  clearMarkers();
              //  setMarker(pos, {opacity: 1});
                if (onSelectPosition && typeof onSelectPosition === 'function') {
                //    onSelectPosition({...pos, initialZoom: mapRef.current.zoom});
                }

            } else if (place.name) {
                const splittedPlace = place.name.toString().split(',');
                if (splittedPlace && splittedPlace.length > 1) {
                    let [lat, lng] = splittedPlace;
                    if (lat) {
                        lat = lat.trim();
                        lat = parseFloat(lat);
                    }
                    if (lng) {
                        lng = lng.trim();
                        lng = parseFloat(lng);
                    }

                    if (lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180) {
                        const pos = {
                            lat: lat,
                            lng: lng,
                        };
                        mapRef.current.setCenter(pos);
                      //  clearMarkers();
                      //  setMarker(pos, { opacity:  1});
                        if (onSelectPosition && typeof onSelectPosition === 'function') {
                        //    onSelectPosition({...pos, initialZoom: mapRef.current.zoom});
                        }
                    }
                }
            }

        }
    },[mapRef.current]);

    function setupSearchBox() {
        if (searchBoxRef.current) {
            let _searchBoxRef = ReactDOM.findDOMNode(searchBoxRef.current);
            if (_searchBoxRef) {
                addressAutoCompltRef.current = new window.google.maps.places.Autocomplete(
                    /** @type {!HTMLInputElement} */
                    _searchBoxRef.querySelector('input'),
                    {
                        types: ['geocode'],
                        // offset: 100005,
                        strictBounds: true,
                        fields: ['formatted_address', 'address_components', 'geometry', 'icon', 'name']
                    });
                addressAutoCompltRef.current.addListener('place_changed', placeChangeHandler);
            }
        }
    }

    function setupDeviceMarkers() {
        if (mapLoaded && Array.isArray(deviceData) && mapRef.current) {
            const deviceMarkers = [];
            const bounds = new window.google.maps.LatLngBounds();
            let maxTvoc = d3.max(deviceData, d => +d[primarySensorName]);
            const tVocCircleScale = d3.scaleQuantize().domain([0, maxTvoc])
                .range([15, 17, 20, 22, 25]);

            const fontSizeScale = d3.scaleQuantize().domain([0, maxTvoc])
                .range(['10px', '11px', '12px', '13px', '15px']);

           // console.log(window.google.maps.Animation);
            deviceData.map(function (device, index) {
                if (device && device.Lat && device.Lng) {
                    let position = new window.google.maps.LatLng(device.Lat, device.Lng);
                    let tVocVal = device[primarySensorName];
                    let color = tVocColorScale(device['Position']);
                    let circleScaleVal = tVocCircleScale(tVocVal);
                    let fontSizeScaleVal = fontSizeScale(tVocVal);
                    let tvocLabel = `${device[primarySensorName]  || 'NA'}`;
                    let timeStampLabel = `${device['Last Report']  || 'NA'}`;
                    let textLabel = `${device['Position'] || 'NA'}`;
                    let titleLabel = `tVOC: ${tvocLabel} (${timeStampLabel})`
                    let marker = new window.google.maps.Marker({
                        icon: {
                            path: window.google.maps.SymbolPath.CIRCLE,
                            fillColor: color || green["400"],
                            fillOpacity: .5,
                            scale: circleScaleVal,
                            strokeColor: 'white',
                            strokeWeight: .5,
                        },
                        position: position,
                        map: mapRef.current,
                        title: titleLabel,
                        deviceId: device.CanaryID,
                        label: {
                            text: textLabel,
                            color: 'white',
                            marginTop: '-20px',
                            fontSize: fontSizeScaleVal,
                            fontWeight: 'bold',
                            fontFamily: 'roboto',
                        }
                    });
                    let deviceContentString = Object.keys(device).map((keyName) => {
                        if(keyName === 'isLocationLocked'){
                            return '';
                        }
                        return `<h4>  ${keyName} :  ${typeof device[keyName] !== 'undefined' && device[keyName] !==  null ? device[keyName] : 'NA'} </h4>`;
                    }).join('\n');

                    const info = new window.google.maps.InfoWindow({
                        content: '<div class="info-content">' + deviceContentString + '</div>'
                    });

                    marker.addListener('click', function () {
                        if (mapRef.current && mapRef.current.openedInfo) {
                            mapRef.current.openedInfo.close();
                        }
                        info.open(mapRef.current, marker);
                        mapRef.current.openedInfo = info;
                    });
                    if(onSelectPosition && user_data && user_data.groupName && user_data.groupName === 'ADMIN' && device){
                        marker.addListener('rightclick', function (event) {
                            if (mapRef.current && mapRef.current.openedInfo) {
                                mapRef.current.openedInfo.close();
                            }
                            mapRef.current.selectedDeviceId = marker.deviceId;
                            mapRef.current.selectedDevice = deviceData && deviceData.find(item=> item.CanaryID === marker.deviceId);
                            setOpen(true);
                        });
                    }
                    bounds.extend(position);
                    deviceMarkers.push(marker);
                }
            });
            clearMarkers();
            clearCurrentDeviceMarkers();
            
            mapRef.current.deviceMarkers = deviceMarkers;

            if(mapMode === 'auto') {
                if(deviceMarkers && deviceMarkers.length === 0) {
                    if (defaultPosition && defaultPosition.lat && defaultPosition.lng) {
                          setMarker({lat: defaultPosition.lat, lng: defaultPosition.lng}, {opacity: 1});
                          let position = new window.google.maps.LatLng(defaultPosition.lat, defaultPosition.lng);
                          const _bounds = new window.google.maps.LatLngBounds();
                          _bounds.extend(position);
                          mapRef.current.fitBounds(_bounds);
                          mapRef.current.setCenter(_bounds.getCenter());
                    }
                } else {
                    if (defaultPosition && defaultPosition.lat && defaultPosition.lng) {
                        setMarker({lat: defaultPosition.lat, lng: defaultPosition.lng}, {opacity: 1});
                    }
                    mapRef.current.setCenter(bounds.getCenter());
                    mapRef.current.fitBounds(bounds);
                }

            } else {
                if (defaultPosition && defaultPosition.lat && defaultPosition.lng) {
                    setMarker({lat: defaultPosition.lat, lng: defaultPosition.lng}, {opacity: 1});
                    let position = new window.google.maps.LatLng(defaultPosition.lat, defaultPosition.lng);
                    const _bounds = new window.google.maps.LatLngBounds();
                    _bounds.extend(position);
                    mapRef.current.setCenter(_bounds.getCenter());
                    mapRef.current.fitBounds(_bounds);
                }  else {
                    mapRef.current.setCenter(bounds.getCenter());
                    mapRef.current.fitBounds(bounds);
                }
            }

            if (defaultLocation && defaultLocation.lat && defaultLocation.lng) {
                let position = new window.google.maps.LatLng(defaultLocation.lat, defaultLocation.lng);
                let _bounds = new window.google.maps.LatLngBounds();
                _bounds.extend(position);
                mapRef.current.fitBounds(_bounds);
                mapRef.current.setCenter(position);
            }
        }
    }

    return (
        <div className={classnames('gmap-wrapper', classes.gmapWrapper)}>
            <div className={classnames(classes.mapContainer)} ref={mapRefContainer}>
                {!mapLoaded && (<TinySpinner> <span>Loading</span> </TinySpinner>)}
            </div>
            <Paper
                className={classnames(classes.searchBox, 'search-textbox', {error: formSubmitted && error_address})}>
                <Button className={classes.maptypeButton} onClick={(e) => setMapType('terrain')}
                        color={mapType === 'terrain' ? 'secondary' : null}>
                    Terrain
                </Button>
                <Button className={classes.maptypeButton} onClick={(e) => setMapType('hybrid')}
                        color={mapType === 'hybrid' ?
                            'secondary' : null}>
                    Satellite
                </Button>
                {!hideAddressPicker && (
                    <React.Fragment>
                        <IconButton className={classes.iconButton} aria-label="Search">
                            <SearchIcon/>
                        </IconButton>
                        <InputBase style={{width: '60%'}}
                                   error={formSubmitted && error_address}
                                   ref={searchBoxRef} type='search'
                                   className={classnames(classes.input)}
                                   placeholder={"Search address"}/>

                    </React.Fragment>
                )}
            </Paper>
            {!hideLocationPicker && (
                <React.Fragment>
                <LocationMapControl mapMode={mapMode} setMapMode={setMapMode} showLocationMarker={showLocationMarker} setShowLocationMarker={setShowLocationMarker}></LocationMapControl>
              </React.Fragment>
            )}
            <ContextModal selectedDevice={mapRef.current && mapRef.current.selectedDevice} selectedDeviceId={mapRef.current && mapRef.current.selectedDeviceId} onChangeLocation={onChangeLocation} onAutoRelocate={onAutoRelocate} ref={ctMenuRef} onSubmitSuccess={()=>{}} open={open}
                               setOpen={e=> { mapRef.current.selectedDeviceId = null;  mapRef.current.selectedTaskName = null; setOpen(false); makeDefaultCursor();}}>
            </ContextModal>
        </div>
    )
});

export default GoogleMapComponent;
