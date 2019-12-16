// eslint-disable-next-line @typescript-eslint/no-angle-bracket-type-assertion
import axiosInstance from "./axiosInstance";
import {roundNumber} from "../helpers/CommonHelper";
const  subEndpoint   = '/device_success_rate';

export const deviceSuccessRateService = {

    getEndPoint: ()=>{
        return subEndpoint;
    },
    find: (query: any) => {
        return axiosInstance
            .get(subEndpoint, {params: query}).then(result=>  {
                if(result && result.data){
                    if (Array.isArray(result.data)){
                        result.data = result.data.map((item)=> {
                            return item;
                        });
                    }
                }
                
                return result;
            });
    }
};
