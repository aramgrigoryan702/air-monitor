import axiosInstance from "./axiosInstance";
import {roundNumber} from "../helpers/CommonHelper";
import {round} from "lodash";

const  subEndpoint   = '/device_events';

export const deviceEventService = {

    find: (params: any) => {
        let id;
        if(params.whereCondition){
            id = params.whereCondition.id;
        }

        return axiosInstance
            .get(subEndpoint+'/'+id, {params: params}).then(result=>  {
                if(result && result.data){
                    if (Array.isArray(result.data)){
                        result.data = result.data.map((item)=>{

                            if(item && item['tVOC1']){
                                item['tVOC1'] = roundNumber(item['tVOC1'] / 1000, 3);
                            }
                            if(item && item['tVOC2']){
                                item['tVOC2'] = roundNumber(item['tVOC2'] / 1000, 3);
                            }

                            if(item && item['tVOC1raw']){
                                item['tVOC1raw'] = roundNumber(item['tVOC1raw'] / 1000, 3);
                            }
                            if(item && item['tVOC2raw']){
                                item['tVOC2raw'] = roundNumber(item['tVOC2raw'] / 1000, 3);
                            }


                            if(item && item['Voltage']){
                                item['Voltage'] = roundNumber(item['Voltage'], 3);
                            }

                            if(item && item.TimeStamp){
                                item.TimeStamp = new Date(item.TimeStamp);
                            }
                            if(item && item.Latitude){
                                item.Latitude = roundNumber(item['Latitude'], 5);
                            }

                            if(item && item.Longitude){
                                item.Longitude = roundNumber(item['Longitude'], 5);
                            }

                            if(item  && item.WindSpeed){
                                item.WindSpeed =  roundNumber(item.WindSpeed, 1);
                               /* if(item.WindSpeed > 5){
                                    item.WindSpeed =  roundNumber(item.WindSpeed, 0);
                                } else {

                                }*/
                            }
                            return item;
                        });
                    }
                }
                return result;
            });
    },
    getStream: (params: any) => {
        let id;
        if(params.whereCondition){
            id = params.whereCondition.id;
        }
        return axiosInstance
            .get(subEndpoint+'/'+id+'/stream', {params: params}).then((result: any)=>  {
                if(result){
                    if (Array.isArray(result)){
                        result = result.map((item)=>{
                            if(item && item['tVOC1']){
                                item['tVOC1'] = roundNumber(item['tVOC1'] / 1000, 3);
                            }
                            if(item && item['tVOC2']){
                                item['tVOC2'] = roundNumber(item['tVOC2'] / 1000, 3);
                            }

                            if(item && item['tVOC1raw']){
                                item['tVOC1raw'] = roundNumber(item['tVOC1raw'] / 1000, 3);
                            }
                            if(item && item['tVOC2raw']){
                                item['tVOC2raw'] = roundNumber(item['tVOC2raw'] / 1000, 3);
                            }

                            if(item && item['Voltage']){
                                item['Voltage'] = roundNumber(item['Voltage'], 3);
                            }

                            if(item && item.TempF){
                                item.TempC = roundNumber(((+(item['TempF']) - 32 ) * (5/9)), 2)
                            }

                            if(item && item.TimeStamp){
                                item.TimeStamp = new Date(item.TimeStamp);
                            }
                            if(item && item.Latitude){
                                item.Latitude = roundNumber(item['Latitude'], 5);
                            }

                            if(item && item.Longitude){
                                item.Longitude = roundNumber(item['Longitude'], 5);
                            }

                            if(item  && item.WindSpeed){
                                item.WindSpeed =  roundNumber(item.WindSpeed, 1);

                              /*  if(item.WindSpeed > 5){
                                    item.WindSpeed =  roundNumber(item.WindSpeed, 0);
                                } else {
                                    item.WindSpeed =  roundNumber(item.WindSpeed, 1);
                                }*/
                            }
                            return item;
                        });
                    }
                }
                return result;
            });
    }
};
