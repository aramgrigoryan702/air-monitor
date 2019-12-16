import React, {useRef} from 'react';
import {withStyles} from "@material-ui/core";
import Tooltip from "@material-ui/core/Tooltip";
import Button from "@material-ui/core/Button";
import Typography from "@material-ui/core/Typography";

function arrowGenerator(color) {
    return {
        '&[x-placement*="bottom"] $arrow': {
            top: 0,
            left: 0,
            marginTop: '-0.95em',
            width: '3em',
            height: '1em',
            '&::before': {
                borderWidth: '0 1em 1em 1em',
                borderColor: `transparent transparent ${color} transparent`,
            },
        },
        '&[x-placement*="top"] $arrow': {
            bottom: 0,
            left: 0,
            marginBottom: '-0.95em',
            width: '3em',
            height: '1em',
            '&::before': {
                borderWidth: '1em 1em 0 1em',
                borderColor: `${color} transparent transparent transparent`,
            },
        },
        '&[x-placement*="right"] $arrow': {
            left: 0,
            marginLeft: '-0.95em',
            height: '3em',
            width: '1em',
            '&::before': {
                borderWidth: '1em 1em 1em 0',
                borderColor: `transparent ${color} transparent transparent`,
            },
        },
        '&[x-placement*="left"] $arrow': {
            right: 0,
            marginRight: '-0.95em',
            height: '3em',
            width: '1em',
            '&::before': {
                borderWidth: '1em 0 1em 1em',
                borderColor: `transparent transparent transparent ${color}`,
            },
        },
    };
}


const  styles = theme => ({
    htmlPopper: arrowGenerator('#dadde9'),
    htmlTooltip: {
        backgroundColor: theme.palette.primary.main,
        color: theme.palette.text.primary,
        //maxWidth: 220,
        fontSize: theme.typography.pxToRem(12),
       // border: '1px solid #dadde9',
        '& b': {
            fontWeight: theme.typography.fontWeightMedium,
        },
    },
});


const BlueTooltip = React.memo(function BlueTooltip(props) {
    const {classes, title, children} = props;
    return (
        <Tooltip placement="top" enterDelay={500}  classes={{
            popper: classes.htmlPopper,
            tooltip: classes.htmlTooltip,
        }} title={
            <React.Fragment>
                <Typography  color="textPrimary">{title}</Typography>
            </React.Fragment>
        }>
            {children}
        </Tooltip>
    )



});

export default withStyles(styles)(BlueTooltip);
