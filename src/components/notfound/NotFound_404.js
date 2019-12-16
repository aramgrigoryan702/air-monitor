import React from 'react';
import {makeStyles, Paper} from "@material-ui/core";

const useStyles = makeStyles(theme => ({
    paper:{
        width: `calc(100%)`,
        display: 'flex',
        height: 'calc(100%)',
        padding: 0,
        flexDirection: 'column',
        color: theme.palette.text.secondary,
        backgroundColor: theme.palette.background.default,
    }
}));

const NotFound_404 =  function  () {
    const classes = useStyles();
    return  (<Paper className={classes.paper}>
        <h1 style={{ margin: '20pt'}}> The requested resource is not available.</h1>
    </Paper>);
};

export default NotFound_404;

