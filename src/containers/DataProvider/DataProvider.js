import React from 'react';
import sortBy from 'lodash/sortBy'
import {createContext, useEffect, useReducer} from "react";
import {useSnackbar} from "notistack";
import {domainLookupService} from "../../services/domainLookupService";
import {lookupService} from "../../services/lookupService";
import createCachedSelector from 're-reselect';

export const GlobalDataContext = createContext({
    getAllLookups: (domainName) => {
    },
    getAllDomainLookups: (domainName) => {
    },
    getLookupsForDomainName: (domainName) => {
    },
    refreshLookups: () => {
    },
    refreshDomainLookups: () => {
    },
    refreshAllLookups: () => {
    }
});


function DataReducer(state, action) {



    switch (action.type) {
        case "LOOKUP_LOAD_SUCCESS": {
            let newState;
            let lookups = action.payload;
            let entities = {};
            let entitiesByName = {};
            let entitiesByDomainId = {};
            if(lookups && Array.isArray(lookups)) {
                lookups.map((item) => {
                    if(item) {
                        entities[item.id] = item;
                        if (entitiesByName[item.name]) {
                            entitiesByName[item.name].push(item);
                        } else {
                            entitiesByName[item.name] = [item];
                        }
                        if (entitiesByDomainId[item.domainID]) {
                            entitiesByDomainId[item.domainID].push(item);
                        } else {
                            entitiesByDomainId[item.domainID] = [item];
                        }
                    }
                });

            }
            newState = {
                ...state,
                lookups: {entities, entitiesByName, entitiesByDomainId, loaded: true},
            };
            return newState;
           // break;
        }

        case "DOMAIN_LOOKUP_LOAD_SUCCESS" : {
            let newState;
            let lookups = action.payload;
            let entities = {};
            let entitiesByName = {};
            if(lookups && Array.isArray(lookups)) {
                lookups.map((item) => {
                    if(item){
                    entities[item.id] = item;
                    if (entitiesByName[item.name]) {
                        entitiesByName[item.name].push(item);
                    } else {
                        entitiesByName[item.name] = [item];
                    }}
                });
            }
            newState = {
                ...state,
                domain_lookups: {entities, entitiesByName, loaded: true},
            };
            return newState;
            //break;
        }
    }

    return state;
}


export default function GlobalDataProvider(props) {
    const {children} = props;
    const [state, dispatch] = useReducer(DataReducer, {
        lookups: {
            entities: {},
            entitiesByName: {},
            entitiesByDomainId: {},
            loaded: false
        },
        domain_lookups: {
            entities: {},
            entitiesByName: {},
            loaded: false
        },
    });


    function refreshLookups() {
        lookupService.find({offset: 0, limit: 100, sort_column: 'id', sort_order: 'asc'}).then((result) => {
            if (result && result.data) {
                //console.log('result.data', result.data);
                dispatch({type: 'LOOKUP_LOAD_SUCCESS', payload: result.data})
            }
        }).catch(err => {
            console.log(err);
        });
    }

    function refreshDomainLookups() {
        domainLookupService.find({offset: 0, limit: 100, sort_column: 'id', sort_order: 'asc'}).then((result) => {
            if (result && result.data) {
                dispatch({type: 'DOMAIN_LOOKUP_LOAD_SUCCESS', payload: result.data})
            }
        }).catch(err => {
            console.log(err);
        });
    }

    function refreshAllLookups() {
        refreshDomainLookups();
        refreshLookups();
    }

    function getAllLookups() {
        return _getAllLookupsSelector(state, 'all_lookups');
    }

    function getAllDomainLookups() {
        return _getAllDomainLookupsSelector(state, 'all_domain_lookups');
    }

    const getLookups = state => state.lookups;

    const getDomainLookups = state => state.domain_lookups;

    const _getAllLookupsSelector = createCachedSelector(
        getLookups,
        (state, key) => key,
        (lookups, key) => {
            if (lookups && lookups.entities) {
                let entitiesKey = Object.keys(lookups.entities);
                let  list= entitiesKey.map((key) => lookups.entities[key]);
                return sortBy(list, 'name');
            } else {
                return [];
            }
        },
    )(
        (state, key) => key,
    );

    const _getAllDomainLookupsSelector = createCachedSelector(
        getDomainLookups,
        (state, key) => key,
        (domain_lookups, key) => {
            if (domain_lookups && domain_lookups.entities) {
                let entitiesKey = Object.keys(domain_lookups.entities);
                let  list=  entitiesKey.map((key) => domain_lookups.entities[key]);
                return sortBy(list, 'name');
            } else {
                return [];
            }
        },
    )(
        (state, key) => key,
    );


    function groupByDomainName(lookups, domainLookups, domainName) {
        if (domainLookups && domainLookups.entitiesByName && domainLookups.entitiesByName[domainName]) {
            let selectedEntities =  domainLookups.entitiesByName[domainName] || [];
            let selectedData = [];
            if (lookups.entitiesByDomainId) {
                selectedEntities.map(entity => {
                    if (entity && entity.id && lookups.entitiesByDomainId[entity.id]) {
                        lookups.entitiesByDomainId[entity.id].forEach((item) => {
                            if (item && item.id) {
                                selectedData.push(item);
                            }
                        })
                    }
                });
            }
            return sortBy(selectedData, 'name');
        }
        return [];
    }

    const getLookupsForDomainNameSelector = createCachedSelector(
        getLookups,
        getDomainLookups,
        (state, domainName) => domainName,
        (lookups, domainLookups, domainName) => groupByDomainName(lookups, domainLookups, domainName),
    )(
        (state, domainName) => domainName,
    );


    function getLookupsForDomainName(domainName) {
        return getLookupsForDomainNameSelector(state, domainName);
    }

    useEffect(() => {
        refreshDomainLookups();
        refreshLookups();
    }, []);


 /*   useEffect(() => {
        if (state.lookups.loaded) {
            "
            let list = getAllLookups();
        }
    }, [state])*/
    return (
        <GlobalDataContext.Provider value={{
            getLookupsForDomainName,
            getAllDomainLookups: getAllDomainLookups,
            refreshAllLookups: refreshAllLookups,
            refreshLookups: refreshLookups,
            refreshDomainLookups: refreshDomainLookups
        }}>
            {children}
        </GlobalDataContext.Provider>

    )
}