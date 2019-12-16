import React, {useContext} from 'react';
import withStyles from "@material-ui/core/es/styles/withStyles";
import {AdminService} from "../../services/admin/AdminService";
import Paper from "@material-ui/core/Paper";
import * as classnames from "classnames";
import Tabs from "@material-ui/core/Tabs";
import Tab from "@material-ui/core/Tab";
import UserDataView from "./UserDataView";
import ConfirmationModal from "../../components/confirmation/ConfirmationModal";
import {useSnackbar} from "notistack";
import SendInvitationWindow from "./SendInvitationWindow";
import {sortBy, orderBy} from "lodash";
import {Observable, from, fromEvent, queueScheduler,forkJoin, of} from 'rxjs';
import {map, switchMap, concatMap, catchError, debounceTime, mergeMap, concatAll} from 'rxjs/operators';
import ChangeUserGroupWindow from "./ChangeUserGroupWindow";
import {CollectionDataContext} from "../../components/collection/CollectionDataProvider";
import {companyService} from "../../services/companyService";


const styles  = theme => ({
    root: {
        width: '100%',
            //marginTop: theme.spacing.unit,
            overflowX: 'auto',
    },
    paper: {
        overflowY: 'auto',
            overflowX: 'hidden',
            width: '100%',
            height: '100%',
        // margin: theme.spacing.unit,
    },
    heading: {
        margin: 0,
            paddingLeft: '9px',
    },
    tabHeader: {
        color: theme.palette.text.primary
    }
});

function reducer(currentState, newState) {
    return {...currentState, ...newState};

}

function useContainerState(props){

    const  {classes} = props;

    const [{adminUsers, editorUsers, currentData, allUsers, viewerUsers, selectedTab, showConfirmationModal, showChangeGroupWindow, showSendInvitationWindow, confirmationMessage,showEnbaleDisbaleConfirmationModal}, setState] = React.useReducer(reducer, {
        allUsers: [],
        adminUsers: [],
        editorUsers: [],
        viewerUsers: [],
        selectedTab: 0,
        collectionData: undefined,
        showConfirmationModal: false,
        confirmationMessage: '',
        showEnbaleDisbaleConfirmationModal: false,
        showSendInvitationWindow: false,
        showChangeGroupWindow: false,
        currentData: {},
    });

    const {enqueueSnackbar} = useSnackbar();

    const  confirmModalRef = React.useRef();

    React.useEffect(()=>{
        refreshAllData();
    }, []);


    function refreshAllData() {

        forkJoin(companyService.query({offset: 0, limit:  1000, sort_column: 'name', sort_order: 'asc'}), AdminService.findAdminUsers(), AdminService.findEditorUsers(), AdminService.findViewerUsers(), AdminService.findAllUsers()).pipe(catchError(err=>{
            console.log(err);
        })).subscribe((result)=>{
            if(Array.isArray(result)){
                let _collection = {};
                let [_companyData, adminUsers, editorUsers, viewUsers, allUser] = result;
                if(_companyData && Array.isArray(_companyData.data)){
                    _collection = _companyData.data.reduce((acc, item)=> {
                        acc[item.id] = item;
                       return acc;
                    },{})
                }
                if(adminUsers && Array.isArray(adminUsers)){
                    adminUsers = adminUsers.map((user)=> {
                        let _user = parseUser(user);
                        if(_user.companyId && _collection[_user.companyId]){
                            _user.companyName =_collection[_user.companyId].name;
                        }
                        return _user;
                    });
                }

                if(editorUsers && Array.isArray(editorUsers)){
                    editorUsers = editorUsers.map((user)=> {
                        let _user = parseUser(user);
                        if(_user.companyId && _collection[_user.companyId]){
                            _user.companyName =_collection[_user.companyId].name;
                        }
                        return _user;
                    });
                }

                if(viewUsers && Array.isArray(viewUsers)){
                    viewUsers = viewUsers.map((user)=> {
                        let _user = parseUser(user);
                        if(_user.companyId && _collection[_user.companyId]){
                            _user.companyName =_collection[_user.companyId].name;
                        }
                        return _user;
                    });
                }

                if(allUser && Array.isArray(allUser)){
                    allUser = allUser.map((user)=> {
                        let _user = parseUser(user);
                        if(_user.companyId && _collection[_user.companyId]){
                            _user.companyName =_collection[_user.companyId].name;
                        }
                        return _user;
                    });
                }
                setState({allUsers: sortBy(allUser, 'email'), adminUsers: sortBy(adminUsers, 'email'),
                    editorUsers: sortBy(editorUsers, 'email'), viewerUsers: sortBy(viewUsers, 'email')});

            }


        });

        //loadAllUsers();
        //loadAdminUsers();
        //loadEditorUsers();
        //loadViewerUsers();
    }


    function parseUser(user) {
        if(user){
            if(user.UserCreateDate){
                user.UserCreateDate = new  Date(user.UserCreateDate);
            }
            if(user.UserLastModifiedDate){
                user.UserLastModifiedDate = new  Date(user.UserLastModifiedDate);
            }
            if(user.Attributes){
                user.Attributes.map(atItem=>{
                    user[atItem.Name] = atItem.Value;
                });
            }
            if(user['custom:companyId']){
                user.companyId = user['custom:companyId'];
            }
        }

        return user;
    }

    const  loadAllUsers = React.useCallback(()=>{
        AdminService.findAllUsers().then((data)=>{
            // console.log(data);
            let users = data.map(item=>{
                if(item){
                    if(item.UserCreateDate){
                        item.UserCreateDate = new  Date(item.UserCreateDate);
                    }
                    if(item.UserLastModifiedDate){
                        item.UserLastModifiedDate = new  Date(item.UserLastModifiedDate);
                    }
                    if(item.Attributes){
                        item.Attributes.map(atItem=>{
                            item[atItem.Name] = atItem.Value;
                        });
                    }
                }
                return item;
            });
            setState({allUsers: sortBy(users, 'name')});
        }).catch((err)=>{
            console.log(err);
        })
    },[]);

    const loadAdminUsers = React.useCallback(()=>{
        AdminService.findAdminUsers().then((data)=>{
            // console.log(data);
            let users = data.map(item=>{
                if(item){
                    if(item.UserCreateDate){
                        item.UserCreateDate = new  Date(item.UserCreateDate);
                    }
                    if(item.UserLastModifiedDate){
                        item.UserLastModifiedDate = new  Date(item.UserLastModifiedDate);
                    }
                    if(item.Attributes){
                        item.Attributes.map(atItem=>{
                            item[atItem.Name] = atItem.Value;
                        });
                    }
                }
                return item;
            });
            setState({adminUsers: sortBy(users, 'name')});
        }).catch((err)=>{
            console.log(err);
        })
    },[]);

    const loadEditorUsers = React.useCallback(()=>{
        AdminService.findEditorUsers().then((data)=>{
            let users = data.map(item=>{
                if(item){
                    if(item.UserCreateDate){
                        item.UserCreateDate = new  Date(item.UserCreateDate);
                    }
                    if(item.UserLastModifiedDate){
                        item.UserLastModifiedDate = new  Date(item.UserLastModifiedDate);
                    }
                    if(item.Attributes){
                        item.Attributes.map(atItem=>{
                            item[atItem.Name] = atItem.Value;
                        });
                    }
                }
                return item;
            });
            setState({editorUsers: sortBy(users, 'name')});
        }).catch((err)=>{
            console.log(err);
        })
    },[]);

    const loadViewerUsers = React.useCallback(()=>{
        AdminService.findViewerUsers().then((data)=>{
            let users = data.map(item=>{
                if(item){
                    if(item.UserCreateDate){
                        item.UserCreateDate = new  Date(item.UserCreateDate);
                    }
                    if(item.UserLastModifiedDate){
                        item.UserLastModifiedDate = new  Date(item.UserLastModifiedDate);
                    }
                    if(item.Attributes){
                        item.Attributes.map(atItem=>{
                            item[atItem.Name] = atItem.Value;
                        });
                    }
                }
                return item;
            });
            setState({viewerUsers: sortBy(users, 'name')});
        }).catch((err)=>{
            console.log(err);
        })
    },[]);

    const handleTabChange =  React.useCallback(function handleTabChange(event, newValue) {
        setState({selectedTab: newValue});
    },[]);


    const onDispatch = React.useCallback(function onDispatch({action, payload}) {
        if(action === 'ENABLE'){
            setState({
                currentData:{
                    action,
                    payload
                },
                confirmationMessage: `Are you sure to enable ${payload['email']}?`,
                showEnbaleDisbaleConfirmationModal: true,
            });
        } else if(action === 'DISABLE'){

            setState({
                confirmationMessage: `Are you sure to disable ${payload['email']}?`,
                showEnbaleDisbaleConfirmationModal: true,
                currentData:{
                    action,
                    payload
                },
            });
        }  else  if(action === 'SEND_INVITATION'){
            setState({
                showSendInvitationWindow: true
            })
        } else if(action === 'CHANGE_GROUP'){
            setState({
                showChangeGroupWindow: true,
                currentData:{
                    action,
                    payload
                },
            })
        } else  if(action === 'REMOVE'){

            setState({
                confirmationMessage: `Are you sure to remove user ${payload['email']}?`,
                showEnbaleDisbaleConfirmationModal: true,
                currentData:{
                    action,
                    payload
                },
            });
        }
    },[confirmModalRef.current]);

    const  onConfirmEnableDisableResult = React.useCallback(function   onConfirmResult () {
        const {payload,action} = currentData;
        if(action  ==='DISABLE'){
            setState({
                confirmationMessage: undefined,
                showEnbaleDisbaleConfirmationModal: false,
            });
            AdminService.disableUser({Username: payload['Username']}).then((data)=>{
                refreshAllData();
                enqueueSnackbar('User has been  disabled successfully', {variant: 'success'});
            }).catch((err)=>{
                enqueueSnackbar(err.message, {variant: 'error'});
            });
        } else if(action  ==='ENABLE'){
            setState({
                confirmationMessage: undefined,
                showEnbaleDisbaleConfirmationModal: false,
            });
            AdminService.enableUser({Username: payload['Username']}).then((data)=>{
                refreshAllData();
                enqueueSnackbar('User has been  enabled successfully', {variant: 'success'});
            }).catch((err)=>{
                enqueueSnackbar(err.message, {variant: 'error'});
            });
        } else if(action  ==='REMOVE'){
            setState({
                confirmationMessage: undefined,
                showEnbaleDisbaleConfirmationModal: false,
            });
            AdminService.deleteUser({Username: payload['Username']}).then((data)=>{
                refreshAllData();
                enqueueSnackbar('User has been  deleted successfully', {variant: 'success'});
            }).catch((err)=>{
                enqueueSnackbar(err.message, {variant: 'error'});
            });
        }
    },[currentData]);

    const  onConfirmEnableDisableCancel = React.useCallback(function   onConfirmEnableDisableCancel () {
        setState({
            confirmationMessage: undefined,
            showEnbaleDisbaleConfirmationModal: false,
        });
    },[confirmModalRef.current]);

    const onSendInvitationSuccess =  React.useCallback(function onSendInvitationSuccess (message) {
        refreshAllData();
        setState({
            confirmationMessage: undefined,
            showSendInvitationWindow: false,
        });
        enqueueSnackbar(message || 'User has been invited successfully', {variant: 'success'});
    }, [confirmModalRef.current,  currentData]);

    const onChangeGroupNameSuccess =  React.useCallback(function onChangeGroupNameSuccess () {
        refreshAllData();
        setState({
            confirmationMessage: undefined,
            showChangeGroupWindow: false,
        });
        enqueueSnackbar( 'User\'s  group  has been successfully', {variant: 'success'});
    }, [confirmModalRef.current,  currentData]);


    const  onSendInvitationError = React.useCallback(function onSendInvitationError(error) {
        enqueueSnackbar(error.message, {variant: 'error'});
    });

    const  onChangeGroupNameError  = React.useCallback(function onChangeGroupNameError(error) {
        enqueueSnackbar(error.message, {variant: 'error'});
    });
    const  onSendInvitationCancel = React.useCallback(function onSendInvitationCancel() {
        setState({
            confirmationMessage: undefined,
            showSendInvitationWindow: false,
        });
    },[confirmModalRef.current]);

    const  onChangeGroupNameCancel = React.useCallback(function onChangeGroupNameCancel() {
        setState({
            confirmationMessage: undefined,
            showChangeGroupWindow: false,
        });
    }, [confirmModalRef.current,  currentData]);



    return { classes, adminUsers,editorUsers, currentData, allUsers, viewerUsers,
        selectedTab, showConfirmationModal, showChangeGroupWindow,
        showSendInvitationWindow, confirmationMessage,showEnbaleDisbaleConfirmationModal,
        handleTabChange,
        onDispatch,
        confirmModalRef, onConfirmEnableDisableResult, onConfirmEnableDisableCancel, onSendInvitationError,onSendInvitationCancel,
        onSendInvitationSuccess,
        onChangeGroupNameError,
        onChangeGroupNameCancel,
        onChangeGroupNameSuccess
    }

};

const  UserManagerContainer = React.memo(function UserManager(props) {

    const { classes, adminUsers,editorUsers, currentData, allUsers, viewerUsers,
        selectedTab, showConfirmationModal, showChangeGroupWindow, showSendInvitationWindow, confirmationMessage,showEnbaleDisbaleConfirmationModal,
        handleTabChange, onDispatch,
        confirmModalRef, onConfirmEnableDisableResult, onConfirmEnableDisableCancel, onSendInvitationError,onSendInvitationCancel,
        onSendInvitationSuccess,
        onChangeGroupNameError,
        onChangeGroupNameCancel,
        onChangeGroupNameSuccess
    }  = useContainerState(props);

    return (
        <Paper className={classnames(classes.paper)}>
            <Tabs value={selectedTab} onChange={handleTabChange}>
                <Tab className={classes.tabHeader} label="Admins"/>
                <Tab className={classes.tabHeader} label="Editors"/>
                <Tab className={classes.tabHeader} label="Viewer"/>
                 <Tab className={classes.tabHeader} label="All Users"/>
            </Tabs>

            {selectedTab === 0 && (
                <UserDataView onDispatch={onDispatch} title={'Admin'} data={adminUsers}></UserDataView>
            )}
            {selectedTab === 1 && (
                <UserDataView onDispatch={onDispatch} title={'Editor'} data={editorUsers}></UserDataView>
            )}
            {selectedTab === 2 && (
                <UserDataView onDispatch={onDispatch} title={'Viewer'} data={viewerUsers}></UserDataView>
            )}
            {selectedTab === 3 && (
                <UserDataView onDispatch={onDispatch} title={'All Users'} data={allUsers}></UserDataView>
            )}
            <ConfirmationModal ref={confirmModalRef} onSubmitSuccess={onConfirmEnableDisableResult} open={Boolean(showEnbaleDisbaleConfirmationModal)}
                                   setOpen={onConfirmEnableDisableCancel}>
                    {confirmationMessage}
                </ConfirmationModal>

            {showSendInvitationWindow && (
                <SendInvitationWindow onSubmitError={onSendInvitationError}
                                      setOpen={onSendInvitationCancel}
                                      onSubmitSuccess={onSendInvitationSuccess} open={Boolean(showSendInvitationWindow)}>

                </SendInvitationWindow>
            )}

            {showChangeGroupWindow && currentData && currentData.payload && (
                <ChangeUserGroupWindow initialValues={currentData.payload} onSubmitError={onChangeGroupNameError}
                                      setOpen={onChangeGroupNameCancel}
                                      onSubmitSuccess={onChangeGroupNameSuccess} open={Boolean(showChangeGroupWindow)}>

                </ChangeUserGroupWindow>
            )}

        </Paper>
    )
});

export default withStyles(styles)(UserManagerContainer);