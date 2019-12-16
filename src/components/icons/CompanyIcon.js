import React  from 'react';
import Icon from '@material-ui/core/Icon';
import { makeStyles } from '@material-ui/core';
import red from "@material-ui/core/es/colors/red";
import * as CompanyImg from '../../assets/canary_icons/Company.png';

const useStyles = makeStyles(theme => ({
    root: {
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'flex-end',
    },
    icon: {
        margin: 0,
        backgroundImage: 'url('+CompanyImg+')',
        backgroundRepeat: 'no-repeat',
        content: ' ',
        backgroundSize: 'contain',
        height:'.7em',
        width:'.7em',
        marginRight: '2px'
    },
    iconHover: {
        margin: '1px',
        '&:hover': {
            color: red[800],
        },
    }
}));

function CompanyIcon(props) {
    const classes = useStyles();

    return (
        <Icon {...props} className={classes.icon}></Icon>
    )
}

export default CompanyIcon;
