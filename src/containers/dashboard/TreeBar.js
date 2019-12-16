import React, {useEffect, useContext, useLayoutEffect, useCallback} from 'react';
import {ListItem, withStyles} from "@material-ui/core";
import groupBy from 'lodash/groupBy';
import debounce from 'lodash.debounce';
import ListItemText from "@material-ui/core/ListItemText";
import CompanyEditor from "../../components/Company/CompanyEditor";
import DivisionEditor from "../../components/Division/DivisionEditor";
import SiteEditor from "../../components/Site/SiteEditor";
import {companyService} from "../../services/companyService";
import * as classnames from "classnames";
import {useSnackbar} from "notistack";
import {withRouter} from "react-router";
import {GlobalDataContext} from "../DataProvider/DataProvider";
import 'primereact/resources/primereact.min.css';
import 'primeicons/primeicons.css';
import './_treebar.scss';
import {Tree} from 'primereact/tree';
import {ContextMenu} from 'primereact/contextmenu';
import Grow from "@material-ui/core/Grow";
import Paper from "@material-ui/core/Paper";
import ClickAwayListener from "@material-ui/core/ClickAwayListener";
import Popper from "@material-ui/core/Popper";
import TreeContextMenu from "./TreeContextMenu";
import CompanyIcon from "../../components/icons/CompanyIcon";
import DivisionIcon from "../../components/icons/DivisionIcon";
import SiteIcon from "../../components/icons/SiteIcon";
import {CollectionDataContext} from "../../components/collection/CollectionDataProvider";
import ConfirmationModal from "../../components/confirmation/ConfirmationModal";
import {deviceService} from "../../services/deviceService";
import {siteService} from "../../services/siteService";
import List from "@material-ui/core/List";
import Tooltip from '@material-ui/core/Tooltip';
import BlueTooltip from "../../components/Tooltip/BlueTooltip";
import IconButton from '@material-ui/core/IconButton';
import ChevronLeftIcon from '@material-ui/icons/ChevronLeft';
import Divider from "@material-ui/core/Divider";
import {UserDetailsContext} from "../auth/AuthProvider";
import {collectionService} from "../../services/collectionService";

const treeData = [];
const styles = theme => ({
    root: {
        width: '100%',
        padding: '0px',
        maxWidth: 360,
        overflow: 'hidden',
        overflowY: 'auto',
        backgroundColor: theme.palette.background.paper,
    },
    toogle: {
        color: theme.palette.text.primary,
        paddingLeft: '0px'
    },
    list: {
        padding: '0px'
    },
    draggedOverEffect: {
        border: `1px dashed ${theme.palette.secondary.light}`
    },
    subHeader: {
        paddingLeft: '0px',
        display: 'flex',
        justifyContent: 'left',
        alignItems: 'center',
        marginBottom: '2px',
    },
    listItem: {
        padding: '0px',
        paddingRight:  '5px',
        cursor: 'pointer',
    },
    listItemSelected:{
        border: `2px  solid ${theme.palette.primary.main}`,
        backgroundColor: 'inherit'
    },
    unassignedList: {
        width: '100%',
        margin: '0px',
        padding: '0px',
    },
    listItemText: {
        padding: '1px 1px',
        fontSize: 'small',
        textOverflow: 'ellipsis',
        overflow: 'hidden',
        cursor: 'pointer',
        '&:first-child': {
            paddingLeft: 0,
            fontSize: ".7rem",
            cursor: 'pointer',
        },
        '& span': {
            cursor: 'pointer',
        },
    },
    treeContextMenu: {
        opacity: '0',
        display: 'none !important',
        backgroundColor: theme.palette.secondary.main,
        '& .p-menuitem-link': {
            paddingLeft: '0px',
            color: theme.palette.text.primary,
            textDecoration: 'none'
        }
    },
    button: {
        padding: '1px',
        cursor: 'pointer',
    },
    nested: {
        padding: '0px',
        paddingLeft: theme.spacing(2),
    },
    unassignedSiteNode:{
        paddingLeft:  '1px',
        width: '110px',
    },
    unassignedSiteNodeTextItem:{
        paddingLeft:  '10px',
        '&:first-child': {
            paddingLeft: '10px',
            fontSize: ".7rem !important"
        },
    },
    toolbarIcon: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'flex-end',
        padding: '0 8px',
        ...theme.mixins.toolbar,
        backgroundColor: theme.palette.background.default,

    },
});

function reducer(currentState, newState) {
    return {...currentState, ...newState};
}


const TreeBar = React.memo(function TreeBar(props) {

    const {user_data} = useContext(UserDetailsContext);
    const {history, classes, match, location, handleDrawerClose} = props;
    const {enqueueSnackbar, closeSnackbar} = useSnackbar();
    const {getLookupsForDomainName} = useContext(GlobalDataContext);
    const {collections, refresh, updatePartial, signalRefresh, refreshTimeStamp} = useContext(CollectionDataContext);
    let ctMenuRef = React.useRef(null);
    let confirmModalRef = React.useRef(null);

    const [{open, dataToDelete, openSiteEditor,openDivEditor, openCompanyEditor, selectedCompany, selectedDivision, showConfirmation,  confirmationMessage,
        unassigneDeviceCount, data, expandedNodes,
        lookupIdCompany, lookupIdDivision, lookupIdSite, expandedKeys, selectedNodeKey, selectedNodeAtContext, anchorEl, dataToEdit, deviceEditData, siteEditData, draggedOverItem}, setState] = React.useReducer(reducer, {
        unassigneDeviceCount: 0,
        confirmationMessage: '',
        selectedDivision: false,
        selectedCompany: false,
        openSiteEditor: false,
        openDivEditor: false,
        openCompanyEditor: false,
        data: treeData,
        expandedNodes: {},
        open: true,
        lookupIdCompany: null,
        lookupIdDivision: null,
        lookupIdSite: null,
        expandedKeys: null,
        selectedNodeKey: null,
        selectedNodeAtContext: {},
        anchorEl: null,
        dataToEdit: null,
        dataToDelete:  undefined,
        deviceEditData: undefined,
        siteEditData: undefined,
        draggedOverItem: undefined,

    });


    const subTopic = match.params.subTopic;
    const topic = match.params.topic;
    const id = match.params.id;
    const menu = [
        {
            label: 'Add',
            command: (event, item) => {
            }
        }
    ];


    useEffect(() => {
        debounce(refreshData, 300)();
    }, [collections, refreshTimeStamp]);

    useLayoutEffect(() => {
        let item = window.localStorage.getItem('expandedKeys');
        if (item && item !== 'undefined' && item !== 'null') {
            try {
                setState({
                    expandedKeys: JSON.parse(item)
                });
            } catch (err) {
                console.log(err);
            }
        }
    }, []);

    useEffect(() => {
        let lookupId;
        if (openCompanyEditor === true) {
            let lookupsData = getLookupsForDomainName('COMPANY');
            if (lookupsData && lookupsData.length > 0) {
                if (lookupsData[0] && lookupsData[0].id) {
                    lookupId = lookupsData[0].id;
                }
            }
            setState({
                lookupIdCompany: lookupId,
                anchorEl: null
            });
        }
    }, [openCompanyEditor]);

    useEffect(() => {
        let lookupId;
        if (openDivEditor === true && user_data && user_data.groupName !== 'VIEWER') {
            let lookupsData = getLookupsForDomainName('OPERATIONAL UNIT');
            if (lookupsData && lookupsData.length > 0) {
                if (lookupsData[0] && lookupsData[0].id) {
                    lookupId = lookupsData[0].id;
                }
            }
        }
        setState({
            lookupIdDivision: lookupId,
            anchorEl: null
        });
    }, [openDivEditor]);

    useEffect(() => {
        let lookupId;
        if (openSiteEditor === true && user_data && user_data.groupName !== 'VIEWER') {
            let lookupsData = getLookupsForDomainName('SITE');
            if (lookupsData && lookupsData.length > 0) {
                if (lookupsData[0] && lookupsData[0].id) {
                    lookupId = lookupsData[0].id;
                }
            }
            setState({
                lookupIdSite: lookupId,
                anchorEl: null
            });
        }
    }, [openSiteEditor]);

    useEffect(() => {
        // setTimeout(() => {
        window.localStorage.setItem('expandedKeys', JSON.stringify(expandedKeys));
        // }, 200);
    }, [expandedKeys]);

    function setSelectedForNewData(result, keyName) {
        if (result && result.data && result.data.id && keyName) {
            let indexKey = keyName + result.data.id;
            let newExpandedNodes = {...expandedNodes};
            if (newExpandedNodes[indexKey] === true) {
                newExpandedNodes[indexKey] = false;
            } else {
                newExpandedNodes[indexKey] = true;
            }
            setState({
                expandedNodes: newExpandedNodes
            });
        }

    }

    function handleCompanyAddHanddler() {
        setState({
            openCompanyEditor: true
        });
    }

    function onCompanySubmitSuccess(result) {
        refresh();
        setState({
            anchorEl: null,
            openCompanyEditor: false
        });

    }


    function onDivisionSubmitSuccess(result) {
        let _expandedKeys;
        if(result && result.data && result.data.id){
            _expandedKeys = {...expandedKeys};
            _expandedKeys[`division_${result.data.id}`] = true;
        }
        refresh();
        setState({
            anchorEl: null,
            openDivEditor: false,
            expandedKeys: _expandedKeys ? _expandedKeys: expandedKeys,
        });
    }


    function handleSiteAddHandler(e, row) {
        e.stopPropagation();
        setState({
            selectedDivision: row.id,
            openSiteEditor: true,
        });
    }

    function onSiteSubmitSuccess(result) {
        let _expandedKeys;
        if(result && result.data && result.data.collection_ID){
            _expandedKeys = {...expandedKeys};
            _expandedKeys[`division_${result.data.collection_ID}`] = true;
        }
        refresh();
        setState({
            anchorEl: null,
            openSiteEditor: false,
            expandedKeys: _expandedKeys ? _expandedKeys: expandedKeys,
        });
    }

    function onSubmitError(error) {
        setState({
            anchorEl: null,
        });
        enqueueSnackbar(error.message, {variant: "error"});
    }

    function isSubTopicInScope() {
        return ['overview', 'data', 'analyze'].indexOf(subTopic) > -1;
    }


    function refreshData() {
        let totalDeviceCount = 0;
        let desiredExpandedKeys = {};
        companyService.find().then((result) => {
            if(result  && result.data){
                let redefinedData = result.data.map((dataItem => {
                    dataItem.key = `company_${dataItem.id}`;
                    dataItem.nodeType = 'COMPANY';
                    if(dataItem && dataItem.id && topic === 'companies' && id && id.toString() === dataItem.id.toString()){
                        desiredExpandedKeys[dataItem.key] = true;
                    }
                    if(dataItem.children && Array.isArray(dataItem.children)) {
                        dataItem.children = dataItem.children.map((child) => {
                            child.key = `division_${child.id}`;
                            child.nodeType = 'DIVISION';
                            if(child && child.id && topic === 'divisions' && id && id.toString() === child.id.toString()){
                                desiredExpandedKeys[dataItem.key] = true;
                                desiredExpandedKeys[child.key] = true;
                            }
                            if (child && child.sites && Array.isArray(child.sites)) {
                                child.children = child.sites.map((siteItem) => {
                                    if(siteItem && siteItem.id && topic === 'sites' && id && id.toString() === siteItem.id.toString()){
                                        desiredExpandedKeys[dataItem.key] = true;
                                        desiredExpandedKeys[child.key] = true;
                                    }
                                    siteItem.key = `site_${siteItem.id}`;
                                    siteItem.name = siteItem.name;
                                    siteItem.nodeType = 'SITE';
                                    siteItem.parentName = child.name;
                                    return siteItem;
                                });
                            }
                            return child;
                        });
                    }
                    if(dataItem.deviceCount){
                        totalDeviceCount += dataItem.deviceCount;
                    }
                    return dataItem;
                }));
                let newData = [{
                    key: 'global_devices',
                    nodeType: 'global',
                    label: 'Collections',
                    name: 'Collections',
                    deviceCount: totalDeviceCount,
                    children: [...redefinedData]
                }];
                let _expandedKeys = expandedKeys ? { ...expandedKeys}: {};
                _expandedKeys.global_devices = true;
                if(desiredExpandedKeys){
                    Object.keys(desiredExpandedKeys).forEach((keyName)=>{
                        if(!_expandedKeys[keyName]){
                            _expandedKeys[keyName] = true;
                        }
                    });
                }
                setState({
                    data: newData,
                    expandedKeys: _expandedKeys
                });
            }

        }).catch((err)=>{
            console.log(err);
        });
    }


    function onDeviceDrop(e, node) {
        e.preventDefault();
        try {

            if(user_data && user_data.groupName === 'VIEWER'){
                return false;
            }

            let transerData = e.dataTransfer.getData('text');
            if (transerData) {
                // let myRef = confirmModalRef.current;
                transerData = JSON.parse(transerData);
                // console.log('data received here ',transerData);
                // console.log('node here',node);
                const {type, rows} = transerData;
                if (type !== 'DEVICE') {
                    return false;
                }
                if (!rows || !rows.length) {
                    return false;
                }
                if ( rows.every(item=> item.id ===  node.site_ID)) {
                    return false;
                }
                const siteName = rows[0]['site.name'];
                const message = `Are you sure to move the device (${rows.map(item=>item.id).join(', ')}) from ${siteName} to  ${node.name}?`;
                const logMessage = `Changed device site from ${siteName} to  ${node.name}`;
                //  console.log('data received here ',siteName, type, id, message);
                setState({
                    deviceEditData: {message: logMessage, site: {...node}, devices: rows}
                });
                performDeviceMove({message, devices: rows, siteId: node.id});
            }
        } catch (err) {
            console.log(err);
        }
    }

    function onSiteDrop(e, node) {
        e.preventDefault();
        try {
            if(user_data && user_data.groupName === 'VIEWER'){
                return false;
            }
            let transerData = e.dataTransfer.getData('text');
            if (transerData) {
                // let myRef = confirmModalRef.current;
                transerData = JSON.parse(transerData) || {};
                // console.log('data received here ',transerData);
                // console.log('node here',node);
                const {type, id,} = transerData;
                if (type !== 'SITE') {
                    return false;
                }
                if (id === node.parentID) {
                    return false;
                }
                const parentName = transerData['parentName'];
                const message = `Are you sure to move the site (${transerData.name}) from ${parentName} to  ${node.name}?`;
                const logMessage = `Changed site  from ${parentName} to  ${node.name}`;
                setState({
                    siteEditData: {message: logMessage, division: {...node}, site: {...transerData}}
                });
                performSiteMove({message});
            }
        } catch (err) {
            console.log(err);
        }
    }


    function performDeviceMove({message, devices, siteId}) {
        if(user_data && user_data.groupName === 'VIEWER'){
            return false;
        }
        setState({
            confirmationMessage: message,
            showConfirmation: true,
        });
    }

    function performSiteMove({message, siteEditData}) {
        if(user_data && user_data.groupName === 'VIEWER'){
            return false;
        }
        setState({
            confirmationMessage: message,
            showConfirmation: true,
        });
    }

    function onConfirmResult(result) {
        setState({
            showConfirmation: false,
        });
        if (result === true) {
            if (deviceEditData) {
                if (deviceEditData.site && deviceEditData.devices) {
                    let _promises = [];
                    deviceEditData.devices.forEach((device)=>{
                        _promises.push(deviceService.updateSiteId(device.id, {
                            site_ID: deviceEditData.site.id,
                            message: deviceEditData.message
                        }));
                    });

                    Promise.all(_promises).then(()=>{
                        refresh();
                        signalRefresh();
                        enqueueSnackbar('Device data updated successfully.', {variant: 'success'});
                    }).catch((error) => {
                        enqueueSnackbar(error.message, {variant: 'error'})
                    });
                }
                setState({
                    deviceEditData: undefined,
                });
            } else if (siteEditData) {
                if (siteEditData.site && siteEditData.division) {
                    siteService.update(siteEditData.site.id, {
                        collection_ID: siteEditData.division.id,
                    }).then(() => {
                        refresh();
                        signalRefresh();
                        enqueueSnackbar('Site data updated successfully.', {variant: 'success'});
                        expandedKeys[siteEditData.division.key] = true;
                        setState({
                            expandedKeys: expandedKeys,
                        });
                    }).catch((error) => {
                        enqueueSnackbar(error.message, {variant: 'error'})
                    });
                    setState({
                        siteEditData: undefined,
                    });
                }
            } else if(dataToDelete){
                const {nodeType, id } = dataToDelete;
                switch (nodeType) {
                    case 'SITE':
                        siteService.delete(id).then(() => {
                            refresh();
                            enqueueSnackbar('Site removed successfully.', {variant: 'success'});
                        }).catch((error) => {
                            enqueueSnackbar(error.message, {variant: 'error'})
                        });
                        setState({
                            dataToDelete: undefined,
                            anchorEl: null
                        });
                        break;
                    case 'COMPANY':
                        collectionService.delete(id).then(() => {
                            refresh();
                            enqueueSnackbar('Company removed successfully.', {variant: 'success'});
                        }).catch((error) => {
                            enqueueSnackbar(error.message, {variant: 'error'})
                        });
                        setState({
                            dataToDelete: undefined,
                            anchorEl: null
                        });
                        break;
                    case "DIVISION":
                        collectionService.delete(id).then(() => {
                            refresh();
                            enqueueSnackbar('Operational unit removed successfully.', {variant: 'success'});
                        }).catch((error) => {
                            enqueueSnackbar(error.message, {variant: 'error'})
                        });
                        setState({
                            dataToDelete: undefined,
                            anchorEl: null
                        });
                        break;
                }

            }
        } else {
            setState({
                deviceEditData: undefined,
                siteEditData: undefined,
                dataToDelete: undefined,
                anchorEl: undefined
            });
        }
    }

    function onDragOver(ev, node) {
        ev.preventDefault();
        // Set the dropEffect to move
        ev.dataTransfer.dropEffect = "move";
        if(node && node.id){
            setState({
                draggedOverItem: node.id
            });
        }

    }

    function onSiteDragStart(e, row) {
        e.stopPropagation();
        let param = {...row, type: 'SITE'};
        e.dataTransfer.setData('text', JSON.stringify(param));
        e.dataTransfer.dropEffect = "move";
        let siteImage = new Image();
        siteImage.src = '../../assets/canary_icons/site.png';
        e.dataTransfer.setDragImage(siteImage, 5, 5);

    }

    function nodeTemplate(node) {
        if (node.nodeType === 'SITE') {
            return (
                <ListItem draggable="true" onDragStart={(e) => onSiteDragStart(e, node)} onDragOver={onDragOver}
                          onDrop={(e) => onDeviceDrop(e, node)} button
                          selectable='true'
                          className={classnames(classes.listItem, 'site-nodes', topic === 'sites' &&  id  && parseInt(id) === node.id &&  classes.listItemSelected)}
                          >
                    <SiteIcon fontSize="small"/>
                    <BlueTooltip title={node.deviceCount + ' devices available'} aria-label={node.deviceCount}>
                        <ListItemText className={classnames(classes.listItemText, 'listItemText')} primary={node.name}/>
                    </BlueTooltip>
                </ListItem>
            )
        } else if (node.nodeType === 'DIVISION') {
            return (
                <ListItem onDragOver={onDragOver} onDrop={(e) => onSiteDrop(e, node)} button
                          className={classnames(classes.listItem,  topic === 'divisions' &&  id  && parseInt(id) === node.id &&  classes.listItemSelected, draggedOverItem === node.id  ? classes.draggedOverEffect : undefined)}
                          selectable='true'>
                    <DivisionIcon fontSize="small"/>
                    <BlueTooltip title={node.deviceCount + ' devices available'} aria-label={node.deviceCount}>
                        <ListItemText className={classnames(classes.listItemText, 'listItemText')} primary={node.name}/>
                    </BlueTooltip>
                </ListItem>
            )
        } else if (node.nodeType === 'COMPANY') {
            return (
                <ListItem button className={classnames(classes.listItem, topic === 'companies' &&  id  && parseInt(id) === node.id &&  classes.listItemSelected, draggedOverItem === node.id ? classes.draggedOverEffect : undefined)}
                          selectable='true'>
                    <CompanyIcon fontSize="small"/>
                    <BlueTooltip title={node.deviceCount + ' devices available'} placement="top"
                                 aria-label={node.deviceCount}>
                        <ListItemText className={classnames(classes.listItemText, 'listItemText')} primary={node.name}/>
                    </BlueTooltip>
                </ListItem>
            )
        } else if(node.nodeType === 'global'){
            return (
                <ListItem button className={classnames(classes.listItem, topic === 'global'  &&  classes.listItemSelected)}
                          selectable='true'>
                    <CompanyIcon fontSize="small"/>
                    <BlueTooltip title={node.deviceCount + ' devices available'} placement="top"
                                 aria-label={node.deviceCount}>
                        <ListItemText className={classnames(classes.listItemText, 'listItemText')} primary={node.name}/>
                    </BlueTooltip>
                </ListItem>
            )

        } else return (
            <ListItem button  selectable='true' className={classnames(classes.listItem)}>
                <ListItemText className={classnames(classes.listItemText, 'listItemText')} primary={node.name}/>
            </ListItem>
        );
    }


    function oncontextmenu(event, node) {
        if(user_data && user_data.groupName !== 'VIEWER') {
            setState({
                selectedNodeAtContext: {...event.node},
                anchorEl: event.originalEvent.target,
            });
            ctMenuRef.current.show(event.originalEvent);
        }
    }

    const  setShowConfirmation = useCallback(function setShowConfirmation(value) {
        setState({
            showConfirmation: value,
        });
    },[]);

    const  setOpenCompanyEditor = useCallback(function setOpenCompanyEditor(value) {
        setState({
            openCompanyEditor: value,
        });
    },[]);

    const  setOpenDivEditor = useCallback(function setOpenDivEditor(value) {
        setState({
            openDivEditor: value,
        });
    },[]);

    const  setOpenSiteEditor = useCallback(function setOpenSiteEditor(value) {
        setState({
            openSiteEditor: value,
        });
    },[]);

    function onClickAwayListener(e) {
        setState({ anchorEl: null, selectedNodeAtContext: undefined})
    }

    function onSelectionChange(e) {
        let nodeKey = e.value;
        const arrVal = nodeKey.toString().split('_');
        if(arrVal.length > 1) {
            const [topic, key] = arrVal;
           // console.log('topic, key', topic, key);
            if(key && topic){
              switch (topic) {
                  case 'site':
                      history.push('/dashboard/sites/' + parseInt(key) + '/' + (isSubTopicInScope() ? subTopic : 'overview'));
                      break;
                  case 'company':
                       history.push('/dashboard/companies/' + parseInt(key) + '/' + (isSubTopicInScope() ? subTopic : 'overview'));
                        break;
                  case 'division':
                       history.push('/dashboard/divisions/' + parseInt(key) + '/' + (isSubTopicInScope() ? subTopic : 'overview'));
                       break;
                  case 'global':
                      history.push('/dashboard/global/devices/' + (isSubTopicInScope() ? subTopic : 'overview'));
                      break;
              }

            }
        }

    }

    return (
        <React.Fragment>
        <div className={classes.toolbarIcon}>
            <IconButton onClick={handleDrawerClose}>
                <ChevronLeftIcon/>
            </IconButton>
        </div>

        <Divider/>
            <div className={classnames('treebar')}>
                <ContextMenu className={classes.treeContextMenu} model={menu} ref={ctMenuRef}/>
                <Tree value={data} selectionMode="single" nodeTemplate={nodeTemplate} expandedKeys={expandedKeys}
                      onContextMenuSelectionChange={event => { setState({ selectedNodeKey: event.value})}}
                      onContextMenu={event => oncontextmenu(event)}
                      onSelectionChange={onSelectionChange}
                      onToggle={(e) => {
                          setState({expandedKeys: e.value})
                      }}/>
            </div>
            <Popper open={Boolean(anchorEl)} anchorEl={anchorEl} transition disablePortal>
                {({TransitionProps, placement}) => (
                    <Grow
                        {...TransitionProps}
                        id="menu-list-grow"
                        style={{transformOrigin: placement === 'bottom' ? 'center top' : 'center bottom'}}
                    >
                        <Paper>
                            <ClickAwayListener  onClickAway={onClickAwayListener}>
                                <TreeContextMenu
                                    selectedNodeAtContext={selectedNodeAtContext}
                                    setState={setState}
                                ></TreeContextMenu>
                            </ClickAwayListener>
                        </Paper>
                    </Grow>
                )}
            </Popper>
            <ConfirmationModal ref={confirmModalRef} onSubmitSuccess={onConfirmResult} open={Boolean(showConfirmation)}
                               setOpen={setShowConfirmation}>
                {confirmationMessage}
            </ConfirmationModal>
            {openCompanyEditor && (
                <CompanyEditor initialValues={{...dataToEdit, lookup_ID: lookupIdCompany}} open={Boolean(openCompanyEditor)}
                               setOpen={setOpenCompanyEditor} onSubmitError={onSubmitError}
                               onSubmitSuccess={onCompanySubmitSuccess}>

                </CompanyEditor>
            )}
            {openDivEditor && (
                <DivisionEditor initialValues={{...dataToEdit, lookup_ID: lookupIdDivision}} open={Boolean(openDivEditor)}
                                onSubmitError={onSubmitError} setOpen={setOpenDivEditor}
                                onSubmitSuccess={onDivisionSubmitSuccess}>

                </DivisionEditor>
            )}
            {openSiteEditor && (
                <SiteEditor initialValues={{...dataToEdit, lookup_ID: lookupIdSite}} open={Boolean(openSiteEditor)}
                            setOpen={setOpenSiteEditor} onSubmitError={onSubmitError}
                            onSubmitSuccess={onSiteSubmitSuccess}>

                </SiteEditor>
            )}

        </React.Fragment>
    )
});

export default withStyles(styles)(withRouter(TreeBar));
