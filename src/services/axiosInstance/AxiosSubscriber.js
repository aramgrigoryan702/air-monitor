import { Observable, Subscriber } from 'rxjs';
import axiosInstance, {CancelToken} from "./index";

export class AxiosSubscriber extends Subscriber {
    constructor( observer, url , params={}) {
        super( observer );
        // create sample request id
        // XHR complete pointer
        this.url = url;
        this.completed = false;
        this.source = CancelToken.source();
        // make axios request on subscription
        axiosInstance.get(url, {
            params: params,
            cancelToken: this.source.token
        } ).then( ( response ) => {
            observer.next( response );
            this.completed = true;
            observer.complete();
        } ).catch( ( error ) => {
                observer.error(error);
                this.completed = true;
                observer.complete();
        });
    }
    unsubscribe() {
        super.unsubscribe();
        // cancel XHR
        if( this.completed === false) {
            this.source.cancel('Operation canceled by the user. '+ this.url);
            this.completed = true;
        }
    }
}