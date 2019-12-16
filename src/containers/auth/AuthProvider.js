import React, {createContext, Fragment, useContext, useEffect, useReducer, useState} from 'react';
import {authService} from "../../services/authService/authService";
import {merge} from 'lodash'
import {useSnackbar} from "notistack";
import useRouter from "../../useRouter";
import axiosInstance from "../../services/axiosInstance";
import * as jwt from 'jsonwebtoken';


export const UserDetailsContext = createContext({
    access_token: undefined,
    id_token: undefined,
    refresh_token: undefined,
    errorMessage: '',
    setUserDetails: userDetails => {},
    login: data => {},
    signup: data => {},
    join: data => {},
    forgotPassword: data => {},
    confirmPassword: data => {},
    changePassword: data => {},
    logout: ()=>{}
});

const UserDetailsProvider = React.memo(function UserDetailsProvider (props)  {
    const {children} = props;
    let {history} = useRouter();
    const { enqueueSnackbar, closeSnackbar } = useSnackbar();

    /**
     * User details state / controls
     */
    const setUserDetails = (data) => {
        if(data &&  data.user_data && data.user_data['cognito:groups'] && data.user_data['cognito:groups'].length > 0){
            data.user_data.groupName = data.user_data['cognito:groups'][0];
        }
        updateUserDetails(prevState => {
            const newState = { ...prevState };
            return merge(newState, {
                ...data
            })
        });
    };

    const login = async (data) => {
        try {
            let response= await authService
                .login(data);

            axiosInstance.setTokenData(response);
            setUserDetails(response);
            enqueueSnackbar(`You have been logged in successfully.`, {variant: 'success'});
            history.push('/dashboard/overview');
            return response;
        } catch(error){
            enqueueSnackbar(error.message, {variant: 'error'});
            setUserDetails({errorMessage: error.message});
            return error;
        }
    };

    const signup = async (data) => {
        try {
            let response= await authService
                .register(data);
            //enqueueSnackbar('An verification link has been sent to your email. Please confirm and  login.', {  variant: 'success'});
            history.push('/request-access-success', {});
            return response;
        } catch(error){
            enqueueSnackbar(error.message, {variant: 'error'});
            return error;
        }
    };

    const join = async (data) => {
        try {
            let response= await authService
                .acceptInvitation(data);
            axiosInstance.setTokenData(response);
            setUserDetails(response);
            enqueueSnackbar('Successfully joined', {  variant: 'success'});
            history.push('/dashboard/overview');
            return response;
        } catch(error){
            enqueueSnackbar(error.message, {variant: 'error'});
            return error;
        }
    };

    const logout = async () => {
        try {
            axiosInstance.setTokenData({});
            setUserDetails(undefined);
            enqueueSnackbar('You have been logged out successfully.', { variant: 'success'});
            history.push('/login');
            return true;
        } catch(error){
            enqueueSnackbar(error.message, {variant: 'error'});
            return error;
        }
    };

    const forgotPassword = async (data) => {
        try {
            let response = await authService
                .forgotPassword(data);
            enqueueSnackbar('An password reset link has been sent to your email. Please check your email.', {  variant: 'success'});
            return response;
        } catch(error){
            enqueueSnackbar(error.message, {variant: 'error'});
            return error;
        }
    };

    const refreshToken = async (tokenData)=> {
        try{
            let response = await authService.refreshToken(tokenData);
            axiosInstance.setTokenData(response);
            setUserDetails(response);
        }catch(error){
            console.log(error);
            return error;
        }
    };

    const confirmPassword = async (data) => {
        try {
            let response= await authService
                .confirmPassword(data);
            enqueueSnackbar('Your password has been confirmed successfully.', {variant: 'success'});
            axiosInstance.setTokenData(response);
            setUserDetails(response);
           history.push('/dashboard');
            return response;
        } catch(error){
            enqueueSnackbar(error.message, {variant: 'error'});
            return error;
        }
    };

    const changePassword = async (data) => {
        try {
            let response= await authService
                .changePassword(data);
            enqueueSnackbar('Your password has been changed successfully.', {variant: 'success'});
            return response;
        } catch(error){
            enqueueSnackbar(error.message, {variant: 'error'});
            return error;
        }
    };

    const userState = {
        access_token: undefined,
        id_token: undefined,
        refresh_token: undefined,
        setUserDetails,
        login,
        signup,
        join,
        forgotPassword,
        confirmPassword,
        changePassword,
        logout
    };

    let _tokendata = ()=> {
        let item = window.localStorage.getItem('tokendata');
        if (item !== 'undefined') {
            return JSON.parse(item);
        }
        return null;
    };
    const [tokenData, setTokenData] = useState(_tokendata);
    const [userDetails, updateUserDetails] = useState(userState);

    useEffect(()=>{
        if(tokenData){
             axiosInstance.setTokenData(tokenData);
             const decodedJwt = jwt.decode(tokenData.id_token, { complete: true });
            if(decodedJwt && decodedJwt.payload){
                 let user_data = decodedJwt.payload;
                setUserDetails({user_data: user_data});
               // refreshToken(tokenData);
            } else {
                setUserDetails({user_data: undefined});
                if(history.location.pathname.startsWith('/dashboard')){
                    history.push('/login');
                }
            }
        } else {
            if(history.location.pathname.startsWith('/dashboard') || history.location.pathname ===  '/'){
                setUserDetails({user_data: undefined});
                history.push('/login');
            }
        }
    }, []);

    useEffect(()=>{
        if(axiosInstance.tokenData &&  axiosInstance.tokenData.id_token){

        } else if(userDetails && userDetails.user_data){
            setUserDetails({user_data: undefined});
            if(history.location.pathname.startsWith('/dashboard')){
                enqueueSnackbar("Your session  has been expired. Please try login", {variant: 'error'});
                history.push('/login');
            }
        }

    },[axiosInstance.tokenData.id_token]);

    return (
        <UserDetailsContext.Provider value={userDetails}>
            {children}
        </UserDetailsContext.Provider>
    )
});


export default UserDetailsProvider;
