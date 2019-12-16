/**
 * Created by IntelliJ IDEA.
 * User: Sajib Sarkar
 * Email: thebapi@gmail.com
 * Date: 2019-05-16
 * Time: 01:40
 */

import axiosInstance from "./axiosInstance";
const  subEndpoint   = '/events';

export const eventService = {

    find: (query: any) => {
        return axiosInstance
            .get(subEndpoint, {params: query}).then(result=>  result);
    },
    findOne: (id: any) => {
        return axiosInstance
            .get(subEndpoint+'/'+id).then(result=>  {
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