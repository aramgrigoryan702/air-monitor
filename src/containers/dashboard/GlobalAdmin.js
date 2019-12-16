import React, {useContext, useEffect, useState} from 'react';
import {withRouter} from "react-router";
import {Card, makeStyles, Paper, Typography, withStyles} from "@material-ui/core";
import {useOverview} from "./Overview";
import GoogleMapComponent from "../../components/googlemaps/GoogleMapComponent";


const  useStyles = makeStyles(theme => ({
    paper:{
        width: `calc(100%)`,
        display: 'flex',
        height: 'calc(100%)',
        padding: 0,
        flexDirection: 'column',
        color: theme.palette.text.secondary,
        backgroundColor: theme.palette.background.default,
    },
    heading: {
        fontSize: '.9rem',
        textTransform: 'uppercase',
        fontWeight:'700',
        marginLeft: '15px',
        marginTop: '5px'
    },
}));

function GlobalAdmin(props) {
    const classes = useStyles();
    const  {deviceData, containerType} = useOverview(props);
    return(
        <Paper className={classes.paper}>
            <Typography  className={classes.heading}>Global</Typography>
            <GoogleMapComponent showLocationMarker={false} deviceData={deviceData}></GoogleMapComponent>
        </Paper>
    )
}
export default withRouter(GlobalAdmin);
