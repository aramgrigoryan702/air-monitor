import axiosInstance from "./axiosInstance";
import {roundNumber} from "../helpers/CommonHelper";
const  subEndpoint   = '/devices';

export const deviceService = {

    getEndPoint: ()=>{
        return subEndpoint;
    },
    find: (query: any) => {
        if(query && query.sort_column === 'distance_ft'){
            query.sort_column = 'distance';
        }
        return axiosInstance
            .get(subEndpoint, {params: query}).then(result=>  {
                if(result && result.data){
                    if (Array.isArray(result.data)){
                        result.data = result.data.map((item)=> {
                            if(item && item['last_event.event.tVOC1']){
                                item['last_event.event.tVOC1'] = roundNumber(item['last_event.event.tVOC1'] / 1000, 3);
                            }
                            if(item && item['last_event.event.tVOC2']){
                                item['last_event.event.tVOC2'] = roundNumber(item['last_event.event.tVOC2'] / 1000, 3);
                            }

                            if(item && item['last_event.event.tVOC1raw']){
                                item['last_event.event.tVOC1raw'] = roundNumber(item['last_event.event.tVOC1raw'] / 1000, 3);
                            }
                            if(item && item['last_event.event.tVOC2raw']){
                                item['last_event.event.tVOC2raw'] = roundNumber(item['last_event.event.tVOC2raw'] / 1000, 3);
                            }

                            if(item && item['last_event.event.Voltage']){
                                item['last_event.event.Voltage'] = roundNumber(item['last_event.event.Voltage'], 3);
                            }

                            if(item &&  item['last_event.TimeStamp']){
                                item['last_event.TimeStamp'] = new Date(item['last_event.TimeStamp']);
                            }
                            if(item && item["last_event.event.Latitude"]){
                                item["last_event.event.Latitude"] = roundNumber(item['last_event.event.Latitude'], 5);
                            }
                            if(item && item["last_event.event.Longitude"]){
                                item["last_event.event.Longitude"] = roundNumber(item['last_event.event.Longitude'], 5);
                            }



                            if(item && item['last_event.event.WindSpeed']){
                                item['last_event.event.WindSpeed'] =  roundNumber(item['last_event.event.WindSpeed'], 1);
                                /*if(item['last_event.event.WindSpeed'] > 5){
                                    item['last_event.event.WindSpeed'] =  roundNumber(item['last_event.event.WindSpeed'], 0);
                                } else {
                                    item['last_event.event.WindSpeed'] =  roundNumber(item['last_event.event.WindSpeed'], 1);
                                }*/
                            }
                            return item;
                        });
                    }
                }
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
    }
    ,findUnassignedDeviceCount: () => {
        return axiosInstance
            .get(subEndpoint+'/findUnassignedDevice/count').then(result =>  {
                return  result;
            });
    },
    listAvailableDeviceTypes :(query: any)=>{
      ///availableTypes/lists
        return axiosInstance
            .get(subEndpoint+'/availableTypes/lists', {params: query}).then(result =>  {
                return  result;
            });

    },
    update: (id:  any, data: any) => {
        return axiosInstance
            .put(subEndpoint+'/'+id, data).then(result=>  {
                return  result;
            });
    },
    updateSiteId:(id:  any, data: any)=>{
        return axiosInstance
            .put(subEndpoint+'/'+id+'/updateSiteId', data).then(result=>  {
                return  result;
            });
    },
    updateLocation:(id:  any, data: any)=>{
        return axiosInstance
            .put(subEndpoint+'/'+id+'/updateLocation', data).then(result=>  {
                return  result;
            });
    },
    unlockDeviceLocation: (id:  any) =>{
        return axiosInstance
            .put(subEndpoint+'/'+id+'/unlockDeviceLocation').then(result=>  {
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
