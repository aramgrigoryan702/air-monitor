import React, {useContext} from 'react';
import {Input, Paper} from "@material-ui/core";
import FormControlLabel from "@material-ui/core/FormControlLabel";
import Switch from "@material-ui/core/Switch";
import IconButton from "@material-ui/core/IconButton";
import RoomIcon from '@material-ui/icons/Room';
import {UserDetailsContext} from "../../containers/auth/AuthProvider";
import makeStyles from "@material-ui/core/styles/makeStyles";

const useStyles = makeStyles(theme => ({
    form: {
        width: '100%', // Fix IE 11 issue.
        height: '100%',
        display: 'flex'
        // marginTop: theme.spacing.unit,
    },
    cardContent: {
        position:  'relative',
        padding:0,
    },
    mapContainer: {
        height: '80vh',
        width: '100%',
    },
    cardActions: {
        justifyContent: 'flex-end'
    },
    submit: {
        marginTop: theme.spacing(3),
    },
    paper: {
        padding: '0px',
        paddingLeft: '0px',
        paddingRight: theme.spacing(1),
        textAlign: 'center',
        color: theme.palette.text.secondary,
        position:  'absolute',
        top: '48px',
        left: '5px',
        margin: 0,
        height: '30px',
        overflow:'hidden',
        animation: 'animate-base-container 850ms forwards'
    },
    formLabel:{
        paddingLeft: '0px',
        marginLeft: '10px',
        paddingRight: 0,
       // marginRight: 0,
    },
        formLabelAuto:{
           // marginLeft: 0,
            paddingLeft: '15px',
            paddingRight: 0,
        },
    innerFormGroup:{
        justifyContent: 'center',
        alignItems: 'center',
        margin: 0,
    },
    dropPinBtn:{
        paddingBottom:  '0px',
        paddingTop:  '0px',
        marginLeft:  '0px',
        paddingLeft: '5px',
        paddingRight: '0px',
    },
    switchControl: {

    }
}));

const LocationMapControl =  React.memo(function LocationMapControl({ mapMode, setMapMode, showLocationMarker, setShowLocationMarker}){
    const classes = useStyles();
    const {user_data} = useContext(UserDetailsContext);
    return (
            <Paper className={classes.paper}>
                <form className={classes.form}>
                    <FormControlLabel className={classes.formLabel}
                                      control={<Input style={{display: 'none',  visibility: 'hidden'}}/>}
                                      label="Site Centroid"
                                      labelPlacement="start">
                    </FormControlLabel>
                    <FormControlLabel className={classes.formLabelAuto} control={<Switch checked={mapMode === "auto" ? true: false} className={classes.switchControl} onChange={e=>setMapMode(mapMode==='auto'? "centeroid":"auto")}
                    />}
                      label="auto"
                      labelPlacement="start">
                    </FormControlLabel>
                    {user_data && user_data.groupName !=='VIEWER' && (
                        <IconButton style={{width: '50px'}} key={'drop_map_btn'} onClick={e=> {setShowLocationMarker(!!!showLocationMarker);}}  className={classes.dropPinBtn}  color={showLocationMarker === true ? 'secondary': 'default' } size="small"
                                    aria-label='Set location on map'>
                            <RoomIcon/>
                        </IconButton>
                    )}

                </form>
            </Paper>
    )

});


export default LocationMapControl;
