import React  from 'react';
import Icon from '@material-ui/core/Icon';
import { makeStyles } from '@material-ui/core';
import red from "@material-ui/core/es/colors/red";
import * as SiteImg from '../../assets/canary_icons/site.png';

const useStyles = makeStyles(theme => ({
    root: {
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'flex-end',
    },
    icon: {
        margin: 0,
        backgroundImage: 'url('+SiteImg+')',
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

function SiteIcon(props) {
    const classes = useStyles();
    return (
        <Icon {...props} className={classes.icon}></Icon>
    )
}

export default SiteIcon;
