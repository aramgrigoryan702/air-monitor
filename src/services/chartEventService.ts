/**
 * Created by IntelliJ IDEA.
 * User: Sajib Sarkar
 * Email: thebapi@gmail.com
 * Date: 2019-05-16
 * Time: 01:40
 */

import axiosInstance from "./axiosInstance";
const  subEndpoint   = '/chart_events';

export const chartEventService = {

    find: (query: any) => {
        return axiosInstance
            .get(subEndpoint, {params: query}).then(result=>  result);
    },
    getStream: (query: any) => {
        return axiosInstance
            .get(subEndpoint+'/stream', {params: query}).then(result=>  result);
    },
    findHourly: (query: any) => {
        return axiosInstance
            .get(subEndpoint+'/hourly', {params: query}).then(result=>  result);
    },
    getFirstEventDate: (query: any) => {
        return axiosInstance
            .get(subEndpoint+'/getFirstEventDate', {params: query}).then(result=>  result);
    },

};