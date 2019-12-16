import React  from 'react';
import Icon from '@material-ui/core/Icon';
import { makeStyles } from '@material-ui/core';
import red from "@material-ui/core/es/colors/red";
import * as UserImg from '../../assets/canary_icons/user.png';

const useStyles = makeStyles(theme => ({
    root: {
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'flex-end',
    },
    icon: {
        margin: theme.spacing(1),
        backgroundImage: 'url('+UserImg+')',
        backgroundRepeat: 'no-repeat',
        content: ' ',
        backgroundSize: 'contain'
    },
    iconHover: {
        margin: theme.spacing(2),
        '&:hover': {
            color: red[800],
        },
    }
}));

function UserIcon(props) {
    const classes = useStyles();
    return (
        <Icon {...props} className={classes.icon}></Icon>
    )
}

export default UserIcon;
