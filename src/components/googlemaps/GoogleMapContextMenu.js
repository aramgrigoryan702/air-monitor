import React, {useContext} from "react";
import {makeStyles} from "@material-ui/core";
import MenuItem from "@material-ui/core/MenuItem";
import MenuList from "@material-ui/core/MenuList";

const useStyles = makeStyles(theme => ({
    menuList: {
        backgroundColor: theme.palette.background.default,
        color: theme.palette.primary.contrastText,
        padding: '2px'
    },
    menuItem:{
        color: theme.palette.primary.contrastText,
        padding: '2px',
        fontSize: '.9rem',
        minHeight: 'auto',
    }
}));


const GoogleMapContextMenu = React.memo(React.forwardRef((props,ref)=>{
    const classes = useStyles();

    return (<MenuList ref={ref} className={classes.menuList}>
        <MenuItem className={classes.menuItem} onClick={(e) => {

        }}>Add New Site</MenuItem>
    </MenuList>)

}));


export default GoogleMapContextMenu;