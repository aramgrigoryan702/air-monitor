import axiosInstance from "./axiosInstance";
const  subEndpoint   = '/activities';

export const activityService = {

    find: (query) => {
        return axiosInstance
            .get(subEndpoint, {params: query}).then(result=>  result);
    },
    findOne: (id) => {
        return axiosInstance
            .get(subEndpoint+'/'+id).then(result=>  {
                return  result;
            });
    }
    ,create: (data) => {
        return axiosInstance
            .post(subEndpoint, data).then(result=>  {
                return  result;
            });
    },
    update: (id, data) => {
        return axiosInstance
            .put(subEndpoint+'/'+id, data).then(result=>  {
                return  result;
            });
    },
    delete: (id) => {
        return axiosInstance
            .delete(subEndpoint+'/'+id).then(result=>  {
                return  result;
            });
    }
};