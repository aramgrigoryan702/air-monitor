import React, {createContext, useEffect, useState} from 'react';
import {collectionService} from "../../services/collectionService";


export const CollectionDataContext = createContext({
    collections: [],
    refresh: ()=>{},
    refreshTimeStamp: null,
    updatePartial:  ()=>{},
    signalRefresh: ()=>{}
});




function reducer(currentState, newState) {
    return {...currentState, ...newState};
}
function CollectionDataProvider({children}) {

    const  [{collections, refreshTimeStamp}, setState] = React.useReducer(reducer,{
        collections: [],
        refreshTimeStamp: Date.now(),
    });

    useEffect(()=>{
        refreshCollections().catch((err)=>{
            console.log(err);
        });
    }, []);


    function refreshCollections() {
        return new Promise((resolve, reject)=>{
            collectionService.find({offset: 0, limit:  1000, sort_column: 'name', sort_order: 'asc'}).then((result)=>{
                if (result &&  result.data){
                    let data = result.data.reduce((map, item)=>{
                        map[[item.id]]  = item;
                        return map;
                    }, {});
                    setState({
                        collections: data,
                    });
                    resolve(data);
                }
            }).catch(err=>{
                console.log(err);
                reject(err);
            });
        });
    }

    function signalRefresh() {
        setState({
            refreshTimeStamp: Date.now(),
        })
    }

    function updatePartial(result) {
        if (result &&  result.data){
          let  _data = result.data;
            if(!Array.isArray(_data)){
              _data = [_data];
            }
            let newData = _data.reduce((map, item)=>{
                map[[item.id]] = item;
                return map;
            }, {...collections});
           setState({
               collections: newData
           });
        }
    }

    return  (
        <CollectionDataContext.Provider value={{collections: collections, refreshTimeStamp: refreshTimeStamp, signalRefresh: signalRefresh, refresh: refreshCollections, updatePartial: updatePartial}}>
            {children}
        </CollectionDataContext.Provider>
    )
}


export default CollectionDataProvider;
