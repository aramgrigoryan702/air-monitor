import React from 'react';
import * as mainLogo  from '../../assets/canary_img/Project-Canary-Official-Logo-White.png';
import {withStyles} from "@material-ui/core";

const  styles = theme => ({
    logoContainer: {
        backgroundImage: 'url('+mainLogo+')',
        backgroundSize: 'contain',
        backgroundRepeat: 'no-repeat',
        width: '300px',
        height: '50px',
        display: 'inline-block',
        margin:  '15px',
        position: 'fixed',
        top: '0px',
        left: '0px'
    }
});

function PublicHeader(props) {
    const  { classes } = props;
    return (
        <header>
            <div className={classes.logoContainer}></div>
        </header>
    )
}

export default withStyles(styles)(PublicHeader);