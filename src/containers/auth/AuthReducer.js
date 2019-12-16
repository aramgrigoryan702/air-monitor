import * as jwt from 'jsonwebtoken';
import axiosInstance from "../../services/axiosInstance";

const  initialState = {
    token: undefined,
    user_data: undefined,
    token_expire_at: undefined
};

const AuthReducer = function  (state = initialState, action) {
    switch ( action.type ) {
        case 'SET_TOKEN':  {
            let { payload } = action;
            const {access_token, id_token, refresh_token} = payload;
            const decodedJwt = jwt.decode(id_token, { complete: true });
            let user_data, token_expire_at;
            if(decodedJwt && decodedJwt.payload) {
                token_expire_at = decodedJwt.payload.exp * 1000;
                //console.log('decodedJwt.payload', decodedJwt.payload);
                user_data = decodedJwt.payload;
                if(user_data['cognito:groups'] && user_data['cognito:groups'].length > 0){
                    user_data.groupName = user_data['cognito:groups'][0];
                }
            }
            return {
                ...state,
                token: payload,
                user_data,
                token_expire_at
            }
        }
        default: {
            return state;
        }
    }
};

export default AuthReducer;
