import axiosInstance from '../axiosInstance';
import {AxiosSubscriber} from "../axiosInstance/AxiosSubscriber";
import { Observable, Subscriber } from 'rxjs';

export const authService = {
    register: (data) => {
        return axiosInstance
            .post('/auth/signup', data).then(result => result.data);
    },
    login: (data) => {
        return axiosInstance
            .post('/auth/signin', data).then(result => {
                let resultData = result.data;
                if (resultData && resultData.id_token) {
                    axiosInstance.id_token = resultData.id_token;
                }
                return resultData;
            })
    },
    ping: () => {
        let observable$ = new Observable( ( observer ) => {
            return new AxiosSubscriber( observer, '/auth/ping', {});
        });
        return observable$;
    },
    acceptInvitation: (data) => {
        return axiosInstance
            .post('/auth/acceptInvitation', data).then(result => {
                let resultData = result.data;
                if (resultData && resultData.id_token) {
                    axiosInstance.id_token = resultData.id_token;
                }
                return resultData;
            })
    },
    changePassword: (data) => {
        return axiosInstance
            .post('/auth/change_password',
                data,
            ).then(result => result.data);
    },
    forgotPassword: (data) => {
        return axiosInstance
            .post('/auth/forgot_password',
                data,
            ).then(result => result.data);
    },
    confirmPassword: (data) => {
        return axiosInstance
            .post('/auth/confirm_password',
                data,
            ).then(result => result.data);
    },
    getUserData: () => {
        return axiosInstance
            .get('/auth/profile').then(result => result.data);
    },
    refreshToken: ({id_token, refresh_token}) => {
        // let refresh_token = sessionService.getRefreshToken();
        return axiosInstance
            .post('/auth/refresh_token', {
                refresh_token,
                id_token
            }).then(result => result.data);
    }

};