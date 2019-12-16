import React from 'react';
import axios from 'axios';
import * as superagent from 'superagent';
import axiosRetry from 'axios-retry';
import * as jwt from "jsonwebtoken";


export const CancelToken = axios.CancelToken;

let tokenRefreshPromise;
let isTokenRefreshing = false;

let refreshSkipMap = {
    '/auth/refresh_token': true,
    '/auth/signup': true,
    '/auth/signin': true,
    '/auth/acceptInvitation': true,
    '/auth/forgot_password': true,
    '/auth/confirm_password': true,

};

const API_URL = process.env.REACT_APP_API_URL;

axiosRetry(axios, {
    retries: 20, retryDelay: axiosRetry.exponentialDelay, retryCondition: (error) => {
        if (error.message === 'Network Error') {
            return true;
        }
        if (error.message === 'token_expired') {
            return true;
        }
        console.log('error.code', error.code);
        return (
            error.code !== 'ECONNABORTED' &&
            (!error.response || (error.response.status > 500 && error.response.status < 599))
        );
    }
});
// Add a request interceptor 
const axiosInstance = axios.create({
    baseURL: API_URL,
});

//axiosInstance.defaults.headers.common['Accept-Encoding'] = 'deflate, gzip;q=1.0, *;q=0.5';

axiosRetry(axiosInstance, {
    retries: 20, retryDelay: axiosRetry.exponentialDelay, retryCondition: (error) => {
        if (error.message === 'Network Error') {
            return true;
        }
        if (error.message === 'token_expired') {
            return true;
        }
        console.log('error.code', error.code);
        return (
            error.code !== 'ECONNABORTED' &&
            (!error.response || (error.response.status > 500 && error.response.status < 599))
        );
    }
});

axiosInstance.tokenData = {
    access_token: undefined,
    id_token: undefined,
    token_expire_at: undefined,
    refresh_token: undefined
};

axiosInstance.setTokenData = function (data = {}) {
    let token_expire_at;
    if (Object.keys(data).length > 0) {
        const decodedJwt = jwt.decode(data.id_token, {complete: true});
        if (decodedJwt && decodedJwt.payload) {
            token_expire_at = decodedJwt.payload.exp * 1000;
        }
        this.tokenData = {...data, token_expire_at};
        window.localStorage.setItem('tokendata', JSON.stringify(this.tokenData));
    } else {
        this.tokenData = {};
        window.localStorage.removeItem('tokendata');
    }
};


axiosInstance.interceptors.request.use(config => {
    //console.log('requesting...', config.url);
    let shouldSkipTokenCheck = refreshSkipMap[config.url];
    //config.headers.common['Accept-Encoding'] =  'gzip,deflate';
    let accessToken = axiosInstance.tokenData ? axiosInstance.tokenData.id_token : undefined;
    if (!shouldSkipTokenCheck && isTokenRefreshing) {
        //console.log('Looks  like token is getting  refreshed lets  wait');
        return tokenRefreshPromise.then((response) => {
            const { id_token } = response;
            //axiosInstance.setTokenData(response);
            config.headers.authorization = `Bearer ${id_token}`;
            return Promise.resolve(config);
        });
    }
    if (!shouldSkipTokenCheck && axiosInstance.tokenData && axiosInstance.tokenData.token_expire_at && (axiosInstance.tokenData.token_expire_at - Date.now()) < 3000) {
        //console.log('Token looks  like  expired so going to refresh');
        isTokenRefreshing = true;
        tokenRefreshPromise = _refreshToken().catch(err => {
            if (err && err.response && err.response.data && err.response.data.message &&  err.response.data.message && (err.response.status === 401 || err.response.status === 400) && (err.response.data.message === 'access_token_expired' || err.response.data.message=== 'Unathorized')) {
                axiosInstance.setTokenData(undefined);
            }
            isTokenRefreshing = false;
            return Promise.reject(err);
        });

        return tokenRefreshPromise.then((response) => {
            axiosInstance.setTokenData(response);
            config.headers.authorization = `Bearer ${response.id_token}`;
            isTokenRefreshing = false;
            return Promise.resolve(config);
        }).catch((err) => {
            console.log(err);
        });
    }
    if (accessToken && config.method !== 'OPTIONS') {
        config.headers.authorization = `Bearer ${accessToken}`;
        return config;
    }
    return config;
}, error => {
    if (axios.isCancel(error)) {
        console.log('Request canceled');
    }
    console.log('error  at  options', error);
    return Promise.reject(error);
});


axiosInstance.interceptors.response.use(function (response) {
    // Do something with response data
    if (response && response.data){
        return  response.data;
    } else {
        return response;
    }

}, function (error) {
    if (axios.isCancel(error)) {
        console.log('post Request canceled');
    }
    if (error && error.message === 'Network Error') {
        console.log('whoops network error');
    }
    console.log('axiosInstance received error', error);
    if (error && error.response && error.response.data && error.response.data.message) {
        if (error.response.status === 401 && (error.response.data.message === 'access_token_expired' || error.response.data.message === 'Unathorized')) {
            //axiosInstance.setTokenData(undefined);
        }
        //let err = new Error();
        //console.log('axiosInstance received error', err);
        return Promise.reject({message: error.response.data.message, code: error.response.code});
    } else {
        return Promise.reject(error);
    }
    // Do something with response error
});


function _refreshToken(attempt=1) {
    return new Promise((resolve, reject) => {
        const {id_token, refresh_token} = axiosInstance.tokenData;
        axios.post(API_URL + '/auth/refresh_token', {
            id_token,
            refresh_token
        }).then((res)=>{
            if(res.data && res.data.data){
                resolve(res.data.data);
            } else {
                reject(new Error({ message: 'Authentication failed'}));
            }
        }).catch((err)=>{
            reject(err);
        });
    });
}


export default axiosInstance;