import React  from 'react';
import Icon from '@material-ui/core/Icon';
import { makeStyles } from '@material-ui/core';
import red from "@material-ui/core/es/colors/red";
import * as InspectionImg from '../../assets/canary_icons/inspecticon.png';

const useStyles = makeStyles(theme => ({
    root: {
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'flex-end',
    },
    icon: {
        margin: 0,
        backgroundImage: 'url('+InspectionImg+')',
        backgroundRepeat: 'no-repeat',
        content: ' ',
        backgroundSize: 'contain',
        height:'.9em',
        width:'.9em',
        marginRight: '2px'
    },
    iconHover: {
        margin: '1px',
        '&:hover': {
            color: red[800],
        },
    }
}));

function InspectionIcon(props) {
    const classes = useStyles();
    return (
        <Icon {...props} className={classes.icon}></Icon>
    )
}

export default InspectionIcon;
