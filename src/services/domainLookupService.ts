import axiosInstance from "./axiosInstance";
const  subEndpoint   = '/domain_lookups';

export const domainLookupService = {

    find: (query: any) => {
        return axiosInstance
            .get(subEndpoint, {params: query}).then(result=>  result);
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