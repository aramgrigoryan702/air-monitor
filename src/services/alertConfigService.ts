import axiosInstance from "./axiosInstance";
import {roundNumber} from "../helpers/CommonHelper";
const  subEndpoint   = '/alert_configs';

export const alertConfigService = {

    getEndPoint: ()=>{
        return subEndpoint;
    },
    find: (query: any) => {
        if(query && query.sort_column === 'distance_ft'){
            query.sort_column = 'distance';
        }
        return axiosInstance
            .get(subEndpoint, {params: query}).then(result=>  {
                return result;
            });
    },
    findOne: (id: any) => {
        return axiosInstance
            .get(subEndpoint+'/id').then(result=>  {
                return  result;
            });
    }
    ,create: (data: any) => {
        return axiosInstance
            .post(subEndpoint, data).then(result=>  {
                return  result;
            });
    },
    update: (id:  any, data: any) => {
        return axiosInstance
            .put(subEndpoint+'/'+id, data).then(result=>  {
                return  result;
            });
    },
    delete: (id:  any) => {
        return axiosInstance
            .delete(subEndpoint+'/'+id).then(result=>  {
                return  result;
            });
    }
};
