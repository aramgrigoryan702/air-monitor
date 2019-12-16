import axiosInstance from "./axiosInstance";
import {roundNumber} from "../helpers/CommonHelper";
const  subEndpoint   = '/alert_notifications';

export const alertNotificationService = {

    getEndPoint: ()=>{
        return subEndpoint;
    },
    find: (query: any) => {
        return axiosInstance
            .get(subEndpoint, {params: query}).then(result=>  {
                return result;
            });
    },
};
