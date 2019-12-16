import React, {createRef, useContext, useEffect, useRef, useState} from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import {withStyles} from '@material-ui/core/styles';
import Drawer from '@material-ui/core/Drawer';
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import Typography from '@material-ui/core/Typography';
import Divider from '@material-ui/core/Divider';
import IconButton from '@material-ui/core/IconButton';
import MenuIcon from '@material-ui/icons/Menu';
import ChevronLeftIcon from '@material-ui/icons/ChevronLeft';
import ChevronRightIcon from '@material-ui/icons/ChevronRight';
import CssBaseline from '@material-ui/core/CssBaseline';
import Button from "@material-ui/core/Button";
import {UserDetailsContext, UserDetailsProvider} from "../auth/AuthProvider";
import {Link, withRouter} from "react-router-dom";
import Overview from "./Overview";
import AccountModal from "../../components/auth/AccountModal";
import MenuItem from "@material-ui/core/MenuItem";
import Popper from "@material-ui/core/Popper";
import Grow from "@material-ui/core/Grow";
import ClickAwayListener from "@material-ui/core/ClickAwayListener";
import MenuList from "@material-ui/core/MenuList";
import Paper from "@material-ui/core/Paper";
import './_dashboard.scss';
import DeviceAdmin from "./DeviceAdmin";
import TreeBar from "./TreeBar";
import * as mainLogo from "../../assets/canary_img/Project-Canary-Official-Logo-White.png";
import MapIcon from "../../components/icons/MapIcon";
import FolderIcon from "../../components/icons/FolderIcon";
import GraphIcon from "../../components/icons/GraphIcon";
import UserIcon from "../../components/icons/UserIcon";
import {Redirect} from "react-router";
import DivisionAdmin from "./DivisionAdmin";
import CompanyAdmin from "./CompanyAdmin";
import LatestChart from "./dashboard-chart/LatestChart";
import SiteAdmin from "./SiteAdmin";
import UserManagerContainer from "../admin/UserManagerContainer";
import GlobalAdmin from "./GlobalAdmin";
import {AdminTools} from "../admin/AdminTools";
import GroupedSiteChart from "./dashboard-chart/GroupedSiteChartContainer";
import GlobalSuccessRateContainer from "./dashboard-chart/GlobalSuccessRateContainer";
import CompanySuccessRateChart from "../../components/CompanySuccessRateChart/CompanySuccessRateChart";
import {makeStyles} from "@material-ui/core";


let apiUrl = process.env.REACT_APP_API_URL;
let isStagingSite = apiUrl &&  (apiUrl.search('https://api-staging.projectcanary.io/') > -1 || apiUrl.search('http://localhost') > -1) ? true : false;
const drawerWidth = 225;

const useStyles = makeStyles(theme => ({
    root: {
        display: 'flex',
    },
    toolbar: {
        paddingRight: 24, // keep right padding when drawer closed
        backgroundColor: theme.palette.canaryBlack.main,
    },
    toolbarIcon: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'flex-end',
        padding: '0 8px',
        ...theme.mixins.toolbar,
        backgroundColor: theme.palette.background.default,

    },
    appBar: {
        height: '50px',
        transition: theme.transitions.create(['margin', 'width'], {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.leavingScreen,
        }),
    },
    appBarShift: {
        width: `calc(100% - ${drawerWidth}px)`,
        marginLeft: drawerWidth,
        transition: theme.transitions.create(['margin', 'width'], {
            easing: theme.transitions.easing.easeOut,
            duration: theme.transitions.duration.enteringScreen,
        }),
    },
    menuButton: {
        marginLeft: 12,
        marginRight: 36,
    },
    menuButtonHidden: {
        display: 'none',
    },
    treebeard: {
        backgroundColor: 'transparent !important'
    },
    button: {
        margin: '1px',
        padding: '0px',
        border: '0px',
    },
    userButton: {
        margin: '1px',
        marginLeft: '10px',
        padding: '0px',
        border: '0px',
    },

    chip: {
        margin: theme.spacing(1),
    },
    drawerPaper1: {
        position: 'relative',
        whiteSpace: 'nowrap',
        width: drawerWidth,
        transition: theme.transitions.create('width', {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.enteringScreen,
        }),
    },
    drawerPaperClose: {
        overflowX: 'hidden',
        transition: theme.transitions.create('width', {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.leavingScreen,
        }),
        width: '0px',
    },
    hide: {
        display: 'none',
    },
    drawer: {
        width: drawerWidth,
        flexShrink: 0,
    },
    drawerPaper: {
        width: drawerWidth,
        height: '100vh',
        overflow: 'hidden',
    },
    drawerHeader: {
        display: 'flex',
        alignItems: 'center',
        padding: '0 8px',
        ...theme.mixins.toolbar,
        justifyContent: 'flex-end',
    },
    appBarSpacer: theme.mixins.toolbar,
    chartContainer: {
        marginLeft: -22,
    },
    tableContainer: {
        height: 320,
    },
    h5: {
        marginBottom: theme.spacing(2),
    },
    logoWrapper: {
        flexGrow: 1,
        paddingTop: '5px',
    },
    logoContainer: {
        backgroundImage: 'url(' + mainLogo + ')',
        backgroundSize: 'contain',
        backgroundRepeat: 'no-repeat',
        width: '300px',
        height: '50px',
        display: 'inline-block',
    },
    content: {
        flexGrow: 1,
        //flexWrap: 'wrap',
        // overflow:'auto',
        //position: 'relative',
        // display: 'block',
        paddingTop: '60px',
        minHeight: '100vh',
        height: '100vh',
        maxHeight: '100vh',
        width: `calc(100%)`,
        overflow: 'hidden',
        overflowY:'auto',
        maxWidth: `calc(100%)`,
        transition: theme.transitions.create('margin', {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.leavingScreen,
        }),
        marginLeft: -drawerWidth,
    },
    contentShift: {
        // flexGrow: 1,
        // flexWrap: 'wrap',
        width: `calc(100% - ${drawerWidth}px)`,
        maxWidth: `calc(100% - ${drawerWidth}px)`,
        transition: theme.transitions.create('margin', {
            easing: theme.transitions.easing.easeOut,
            duration: theme.transitions.duration.enteringScreen,
        }),
        //border: '1px solid green',
        //minHeight: '90vh',
        marginLeft: 0,
    },
    dragger: {
        width: '5px',
        cursor: 'ew-resize',
        padding: '4px 0 0',
        borderTop: '1px solid transparent',
        position: 'absolute',
        top: 0,
        right: 0,
        bottom: 0,
        zIndex: '100',
        backgroundColor: 'transparent'
    },
    treebar:{
        height: 'calc(100%)',
        position:'relative',
        display: 'block',
        overflow:'hidden',
    }
}));


export const DashboardContext = React.createContext({
    isSidebarOpen: true
});

const Dashboard = React.memo(function Dashboard(props) {

    const classes = useStyles();
    const [open, setOpen] = useState(true);
    const [openChangePassword, setChangePassword] = useState(false);
    const [accountMenu, setAccountMenu] = useState(false);
    const userDetailCtx = useContext(UserDetailsContext);
    const {history, match, location} = props;
    const [anchorEl, setAnchorEl] = React.useState(null);
    const menuOpen = Boolean(anchorEl);

    function handleMenuClick(event) {
        setAnchorEl(event.currentTarget);
    }

    function handleMenuClose() {
        setAnchorEl(null);
    }


    const handleDrawerOpen = () => {
        setOpen(true);
    };

    const handleDrawerClose = () => {
        setOpen(false);
    };

    const navigate = (path) => {
        history.push(path);
    };

    const getActivatedRouteForDivisionSubTopic = (subTopic = "overview") => {
        let subTopicRef;
        switch (subTopic) {
            case 'overview':
                // setSelectedPageName('overview');
                subTopicRef = (<DivisionAdmin containerType='division'/>);
                break;
            case 'analyze':
                if(isStagingSite){
                    subTopicRef = (<GroupedSiteChart containerType={'division'}/>);
                } else {
                    subTopicRef = (<LatestChart containerType={'division'}/>);
                }
                break;
            case 'data':
                // setSelectedPageName('devices');
                subTopicRef = (<DeviceAdmin containerType={'division'}/>);
                break;
            default  :
                subTopicRef = (<Redirect to={`/dashboard/${topic}/${id}/overview`}/>);
        }
        return subTopicRef;
    };


    const getActivatedRouteForCompaniesSubTopic = (subTopic = "overview") => {
        let subTopicRef;
        switch (subTopic) {
            case 'overview':
                // setSelectedPageName('overview');
                subTopicRef = (<CompanyAdmin containerType='company'/>);
                break;
            case 'analyze':
                //setSelectedPageName('linechart');
                if(isStagingSite){
                    subTopicRef = (<GroupedSiteChart containerType={'company'}/>);
                } else {
                    subTopicRef = (<LatestChart containerType={'company'}/>);
                }
                break;
            case 'data':
                // setSelectedPageName('devices');
                subTopicRef = (<DeviceAdmin containerType={'company'}/>);
                break;
            default  :
                subTopicRef = (<Redirect to={`/dashboard/${topic}/${id}/overview`}/>);
        }
        return subTopicRef;
    };


    const getActivatedRouteForSiteSubTopic = (subTopic = "overview") => {
        let subTopicRef;
        switch (subTopic) {
            case 'overview':
                // setSelectedPageName('overview');
                subTopicRef = (<SiteAdmin containerType='site'/>);
                break;
            case 'analyze':
                //setSelectedPageName('linechart');
                subTopicRef = (<LatestChart containerType='site'/>);
                break;
            case 'data':
                // setSelectedPageName('devices');
                subTopicRef = (<DeviceAdmin containerType='site'/>);
                break;
            default  :
                subTopicRef = (<Redirect to={`/dashboard/${topic}/${id}/overview`}/>);
        }
        return subTopicRef;
    };


    const getActivatedRouteForGlobalSubTopic = (subTopic = "overview", companyId) => {
        let subTopicRef;
        switch (subTopic) {
            case 'overview':
                // setSelectedPageName('overview');
                subTopicRef = (<GlobalAdmin containerType='global'/>);
                break;
            case 'analyze':
                //setSelectedPageName('linechart');
               // subTopicRef = (<LatestChart containerType='global'/>);
                if(user_data && user_data.groupName === 'ADMIN'){
                    if(match.params.companyId) {
                        subTopicRef = (<CompanySuccessRateChart></CompanySuccessRateChart>);
                    } else {
                        subTopicRef = (<GlobalSuccessRateContainer/>);
                    }
                } else {
                    subTopicRef = (<LatestChart containerType='global'/>);
                }
                break;
            case 'data':
                // setSelectedPageName('devices');
                subTopicRef = (<DeviceAdmin containerType='global'/>);
                break;
            default  :
                subTopicRef = (<Redirect to={`/dashboard/${topic}/${id}/overview`}/>);
        }
        return subTopicRef;
    };

    const getActivatedRout = (topic, subTopic) => {
        let topicRef;
        switch (topic) {
            case 'companies':
                //setSelectedPageName('linechart');
                topicRef = getActivatedRouteForCompaniesSubTopic(subTopic);
                break;
            case 'divisions':
                topicRef = getActivatedRouteForDivisionSubTopic(subTopic);
                break;
            /* case 'lookups':
                // setSelectedPageName('lookup_admin');
                 topicRef = (<LookupAdmin/>);
                 break;*/
            case 'sites':
                // setSelectedPageName('devices');
                topicRef = getActivatedRouteForSiteSubTopic(subTopic);
                break;
            case 'global':
                // setSelectedPageName('devices');
                topicRef = getActivatedRouteForGlobalSubTopic(subTopic);
                break;
            case  'user-management':
                topicRef = (<UserManagerContainer></UserManagerContainer>)
                break;
            case  'admin-tools':
                topicRef = (<AdminTools></AdminTools>)
                break;
            default  :
                topicRef = (<Redirect to={`/dashboard/global/devices/overview`}/>);
        }
        return topicRef;
    };

    const topic = match.params.topic;
    const subTopic = match.params.subTopic;
    const id = match.params.id;

    const user_data = userDetailCtx.user_data || {};

    function handleLogoutClick() {
        userDetailCtx.logout().then(() => {
        }).catch(err => {
            console.log(err);
        });
    }

    return (
        <div className={classes.root}>
            <DashboardContext.Provider value={{isSidebarOpen: open}}>
                <CssBaseline/>
                <AppBar
                    position="fixed"
                    className={classNames(classes.appBar, open && classes.appBarShift)}
                >
                    <Toolbar disableGutters={!open} className={classes.toolbar}>
                        <IconButton
                            color="inherit"
                            aria-label="Open drawer"
                            onClick={handleDrawerOpen}
                            className={classNames(
                                classes.menuButton,
                                open && classes.menuButtonHidden,
                            )}

                        >
                            <ChevronRightIcon/>
                        </IconButton>
                        <div className={classes.logoWrapper}>
                            <span className={classes.logoContainer}></span>
                        </div>
                        <Button variant={subTopic === 'overview' ? 'contained' : 'outlined'}
                                color={subTopic === 'overview' ? 'secondary' : 'default'}
                                component={Link} to={`/dashboard/${topic}/${id}/overview`}
                                aria-label="Overview"
                                size='small'
                                className={classNames(classes.button, 'selected')}>

                            <MapIcon/>
                        </Button>

                        <Button variant={subTopic === 'analyze' ? 'contained' : 'outlined'}
                                color={subTopic === 'analyze' ? 'secondary' : 'default'}
                                component={Link} to={`/dashboard/${topic}/${id}/analyze`}
                                aria-label="Analyze"
                                size='small'
                                className={classes.button}>
                            <GraphIcon/>
                        </Button>

                        <Button variant={subTopic === 'data' ? 'contained' : 'outlined'}
                                color={subTopic === 'data' ? 'secondary' : 'default'}
                                component={Link}
                                size='small'
                                to={`/dashboard/${topic}/${id}/data`} aria-label='Devices'
                                className={classNames(classes.button, 'selected')}>
                            <FolderIcon/>
                        </Button>
                        <div className={classes.appBarSpacer}/>
                        <Button className={classes.userButton}
                                aria-owns={accountMenu ? 'account-menu-list-grow' : undefined}
                                aria-haspopup="true"
                                onClick={handleMenuClick}>
                            <UserIcon/>
                        </Button>
                        <Typography>{user_data.name || ''}</Typography>
                        <Popper open={Boolean(menuOpen)} anchorEl={anchorEl} transition disablePortal>
                            {({TransitionProps, placement}) => (
                                <Grow
                                    {...TransitionProps}
                                    id="account-menu-list-grow"
                                    style1={{transformOrigin: placement === 'bottom' ? 'center top' : 'center bottom'}}
                                >
                                    <Paper>
                                        <ClickAwayListener onClickAway={handleMenuClose}>
                                            <MenuList>
                                                <MenuItem onClick={(e) => setChangePassword(true)}>Change
                                                    password</MenuItem>
                                                {user_data.groupName === 'ADMIN' && (<React.Fragment> <MenuItem onClick={e=> navigate('/dashboard/user-management')}> User Management</MenuItem> <MenuItem onClick={e=> navigate('/dashboard/admin-tools')}> Admin Tools</MenuItem>  </React.Fragment>)}
                                                <MenuItem onClick={handleLogoutClick}>Logout</MenuItem>
                                            </MenuList>
                                        </ClickAwayListener>
                                    </Paper>
                                </Grow>
                            )}
                        </Popper>
                    </Toolbar>
                </AppBar>
                <Drawer className={classes.drawer}
                        variant="persistent"
                        anchor="left"
                        open={Boolean(open)}
                        classes={{
                            paper: classes.drawerPaper,
                        }}>
                    <div
                        id="dragger"
                       // onMouseDown={event => handleMousedown(event)}
                        className={classes.dragger}
                    />
                    <div className={classNames(classes.treebar)}>
                        <TreeBar handleDrawerClose={handleDrawerClose}/>
                    </div>

                    <Divider/>
                </Drawer>
                <main
                    className={classNames(classes.content, {
                        [classes.contentShift]: open,
                    })}
                >
                    {getActivatedRout(topic, subTopic, subTopic)}
                    <AccountModal open={(openChangePassword)} setOpen={setChangePassword}/>
                </main>
            </DashboardContext.Provider>
        </div>
    )
});

export default withRouter(Dashboard);
