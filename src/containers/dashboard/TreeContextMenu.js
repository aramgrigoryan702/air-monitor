import MenuList from "@material-ui/core/MenuList";
import MenuItem from "@material-ui/core/MenuItem";
import React, {useContext} from "react";
import {withStyles} from "@material-ui/core";
import {UserDetailsContext} from "../auth/AuthProvider";

const styles = theme => ({
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
});

const TreeContextMenu = React.memo(React.forwardRef(function TreeContextMenu(props,ref) {
    const {user_data} = useContext(UserDetailsContext);
    const {selectedNodeAtContext, setState, classes} = props;

    if(!selectedNodeAtContext){
        return null;
    }

    if (selectedNodeAtContext.nodeType === "DIVISION" && user_data && user_data.groupName !== 'VIEWER') {
        return (
            <MenuList ref={ref} className={classes.menuList}>
                <MenuItem className={classes.menuItem} onClick={(e) => {
                    setState({
                        dataToEdit: {collection_ID: selectedNodeAtContext.id},
                        openSiteEditor: true
                    });
                }}>Add New Site</MenuItem>
                <MenuItem className={classes.menuItem}  onClick={(e) => {
                    setState({
                        dataToEdit: {...selectedNodeAtContext},
                        openDivEditor: true
                    });
                }}>Edit Operational Unit</MenuItem>
                {!selectedNodeAtContext.deviceCount && (
                    <MenuItem  className={classes.menuItem}  onClick={(e) => {
                        setState({
                            dataToDelete: {...selectedNodeAtContext},
                            confirmationMessage: `Are you sure to remove the operattional unit ${selectedNodeAtContext.name}`,
                            showConfirmation: true,
                        });
                    }}>Remove</MenuItem>
                )}

            </MenuList>
        )
    } else if (selectedNodeAtContext.nodeType === "COMPANY" && user_data && user_data.groupName !== 'VIEWER') {
        return (
            <MenuList ref={ref} className={classes.menuList}>
                <MenuItem className={classes.menuItem}  onClick={(e) => {
                    setState({
                        dataToEdit: {parentID: selectedNodeAtContext.id},
                        openDivEditor: true
                    });
                }}>Add New Operational Unit</MenuItem>
                <MenuItem className={classes.menuItem}  onClick={(e) => {
                    setState({
                        dataToEdit: {...selectedNodeAtContext},
                        openCompanyEditor: true
                    });
                }}>Edit</MenuItem>
                {!selectedNodeAtContext.deviceCount && (
                    <MenuItem  className={classes.menuItem}  onClick={(e) => {
                        setState({
                            dataToDelete: {...selectedNodeAtContext},
                            confirmationMessage: `Are you sure to remove the company ${selectedNodeAtContext.name}`,
                            showConfirmation: true,
                        });
                    }}>Remove</MenuItem>
                )}
            </MenuList>
        )
    } else if (selectedNodeAtContext.nodeType === 'SITE' && user_data && user_data.groupName !== 'VIEWER') {
        return (
            <MenuList ref={ref} className={classes.menuList}>
                <MenuItem  className={classes.menuItem}  onClick={(e) => {
                    setState({
                        dataToEdit: {...selectedNodeAtContext},
                        openSiteEditor: true
                    });
                }}>Edit Site</MenuItem>
                {!selectedNodeAtContext.deviceCount && (
                    <MenuItem  className={classes.menuItem}  onClick={(e) => {
                        setState({
                            dataToDelete: {...selectedNodeAtContext},
                            confirmationMessage: `Are you sure to remove the site ${selectedNodeAtContext.name}`,
                            showConfirmation: true,
                        });
                    }}>Remove Site</MenuItem>
                )}
            </MenuList>
        )
    } else if (selectedNodeAtContext.nodeType === 'global' && user_data && user_data.groupName === 'ADMIN') {
        return (
            <MenuList ref={ref} className={classes.menuList}>
                <MenuItem  className={classes.menuItem}  onClick={(e) => {
                    setState({
                        dataToEdit: {parentID: null},
                        openCompanyEditor: true
                    });
                }}>Add New Company</MenuItem>
            </MenuList>
        )
    } else {
        return null;
    }

}));

export default withStyles(styles)(TreeContextMenu);