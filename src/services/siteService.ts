import axiosInstance from "./axiosInstance";
const  subEndpoint   = '/sites';

export const siteService = {

    getEndPoint: function (){
        return subEndpoint;
    },
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
    findSitesByOperationalUnit: (collection_ID:  any) => {
        return axiosInstance
            .put(subEndpoint+'/list/byOperationalUnit', { collection_ID: collection_ID}).then(result=>  {
                return  result;
            });
    },
    findSitesByCompany: (companyId:  any) => {
        return axiosInstance
            .put(subEndpoint+'/list/byCompany', {companyId : companyId}).then(result=>  {
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