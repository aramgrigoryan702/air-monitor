import React, {useCallback, useContext, useEffect, useMemo, useReducer, useState} from "react";
import {useSnackbar} from "notistack";
import Toolbar from "@material-ui/core/Toolbar";
import * as classnames from "classnames";
import Typography from "@material-ui/core/Typography";
import {Button, IconButton, makeStyles, withStyles} from "@material-ui/core";
import DataTable from "../DataTable/DataTable";
import TinySpinner from "../TinySpinner";
import AddIcon from "@material-ui/icons/AddCircleOutline";
import DateRangeIcon from "@material-ui/icons/DateRange";
import ExportIcon from "../icons/ExportIcon";
import CsvDownLoader from "./CsvDownLoader";
import debounce from 'lodash.debounce';
import {from, fromEvent, timer} from 'rxjs';
import {map, catchError, debounceTime} from 'rxjs/operators';
import {isUndefined, isString, keyBy, sortBy, orderBy as _orderBy } from "lodash";
import ConfirmationModal from "../confirmation/ConfirmationModal";
import InputAdornment from "@material-ui/core/InputAdornment";
import TextField from "@material-ui/core/TextField";
import SearchIcon from '@material-ui/icons/Search';
import BackspaceIcon from '@material-ui/icons/Backspace';
import Tooltip from "@material-ui/core/Tooltip";
import TablePagination from "@material-ui/core/TablePagination";
import DateFnsUtils from "@date-io/date-fns";
import {KeyboardDateTimePicker,  MuiPickersUtilsProvider} from "@material-ui/pickers";
import {subDays, isAfter, format } from "date-fns";
import useRouter from "../../useRouter";
import {CollectionDataContext} from "../collection/CollectionDataProvider";
const dateFns = new DateFnsUtils();


const useStyles = makeStyles(theme => ({
    root: {
        backgroundColor: theme.palette.background.default,
        padding: 0,
        paddingLeft: '10px',
        minHeight: '5px',
        height:'auto',
    },
    container:{
        height:'calc(100%)',
        display: 'flex',
        flexDirection:'column',
        alignItems:  'stretch',
        position:  'relative',
        justifyContent:'stretch',

    },
    toolbarAddButton: {},
    title: {
        flexGrow: 1,
        height: 20,
        minHeight: 20,
        paddingRight: 2,
        fontSize: '.9rem',
    },
    row: {
        '&:nth-of-type(odd)': {
            backgroundColor: theme.palette.background.default,
        },
    },
    dataTable: {
        width: 'calc(100%)',
        overflow: 'hidden'
    },
    exportButton: {
        padding: 0
    },
    recordCount:{
        fontSize: '.7rem'
    },
    datePicker:{
        '& .MuiInputBase-input':{
           // fontSize: '.9rem',
            padding:0,
            margin:0,
           // width: '130px',
        },
        '& .MuiIconButton-root':{
            padding:'0px',
            '& .MuiSvgIcon-root':{
                width: '.9rem',
                height: '.9rem',
            }
        },
        marginLeft: '10px',

    },
    pagingToolbar:{
        '& .MuiTablePagination-toolbar': {
            height: 20,
            minHeight: 20,
            paddingRight: 2,
        },
    },
    datePickerDialogue:{
        color: 'inherit',
        '& .MuiDialogActions-root':{
            '& button': {
                color: 'inherit'
            }
        }
    },
    searchBoxInput:{
        flexGrow: 1,
        '& .MuiInput-formControl':{
            height:'16px',
        },
        '& input':{
            height:'16px',
        }
    },
    searchIcon:{
        height:'1rem',
    }
}));

function reducer(currentState, newState) {
    return {...currentState, ...newState};
}



function useDataView({hideTitle, showDateRangeFilter, remoteAction, hideEditButton, hideRemoveButton,numOfRows, dataProvider, showPaging, providedData, title, EditorRef, CreatorRef, useDragger, fieldNames, params, hideControls, hideAddDataBtn, dataViewName, onDispatchEvent}) {

    const classes = useStyles();
    const { history } = useRouter();
    const [startTime, setStartDate] = useState(subDays(new Date(),1));
    const [endTime, setEndDate] = useState(new Date());
    const subscriptionRef = React.useRef();
    const searchBoxRef = React.useRef(null);

    const {enqueueSnackbar} = useSnackbar();
    const {collections, refresh, updatePartial, signalRefresh, refreshTimeStamp} = useContext(CollectionDataContext);

    const [{data, filteredData, dataRefreshTime, filterPlaceholder, orderBy,filterValue, dataFetched, openEditor, isEditMode, loading, mounted, selectedData, page, rowsPerPage, triggerDetailRefresh, fields, confirmationMessage,  showConfirmation, rowToRemove, isCsvImporting }, setState] = useReducer(reducer, {
        data: {data: []},
        dataRefreshTime: new Date(),
        filteredData: [],
        orderBy:  {},
        dataFetched: null,
        openEditor:  false,
        isEditMode: false,
        loading: false,
        mounted: false,
        selectedData: {},
        page: 0,
        rowsPerPage: numOfRows || 1000,
        triggerDetailRefresh: Date.now(),
        fields: [],
        confirmationMessage: '',
        showConfirmation: false,
        rowToRemove: null,
        filterValue: '',
        filterPlaceholder:  'Search',
        isCsvImporting: false,
    });

    //const t= useWhyDidYouUpdate('DataView_useWhyDidYouUpdate', {providedData, startTime, endTime, orderBy, page, rowsPerPage, params})

    let confirmModalRef = React.useRef(null);

    React.useEffect(() => {
        subscriptionRef.current = [];
    }, []);


    React.useLayoutEffect(()=>{
        if(searchBoxRef.current){
            let inputElem = searchBoxRef.current;
            if(inputElem) {
                let _subscription = fromEvent(inputElem, 'keyup').pipe(map(x => x.currentTarget.value), debounceTime(700)).subscribe((value) => {
                    if (!value) {
                        setState({
                            filterValue: undefined,
                        });
                    } else {
                        setState({
                            filterValue: value.toString().toLowerCase().trim(),
                        });
                    }
                });
                return () => {
                    if (_subscription) {
                        _subscription.unsubscribe();
                    }
                }
            }
        }
    },[searchBoxRef.current]);

    useEffect(()=>{
        setState({
            data: [],
            loading:  false,
            dataFetched: false,
        });
    },[params]);

    useEffect(() => {
        if (!providedData) {
            if(params){
                debounce(fetchData, 500)();
                let newSub= timer((1000 * 60), (1000 * 60)).subscribe(()=>{
                    fetchData();
                });
                subscriptionRef.current.push(newSub);
            }
            // subscriptionRef.current.push(newSub);
            return () => {
                if (subscriptionRef && subscriptionRef.current) {
                    subscriptionRef.current.forEach((subscription) => {
                        if (subscription) {
                            subscription.unsubscribe();
                        }
                    });
                    subscriptionRef.current = [];
                }
            }
        }
    }, [providedData,  startTime, endTime, orderBy, page, rowsPerPage, params, collections]);

    useEffect(() => {
        if (providedData) {
            setState({
                data: providedData,
                loading:  false,
                dataRefreshTime: new Date(),
                dataFetched: true,
            });
        }
    }, [providedData]);

    useEffect(() => {
        if (fieldNames && fieldNames.length > 0) {
            loadViewFields(fieldNames);
        }
    }, [fieldNames]);

    useEffect(()=>{
        if(!remoteAction) {
            if (filterValue) {
                let _filtertext = filterValue;
                if (data && data.data) {
                    let visibleFields = fields.filter(item => item && item.isVisible !== false);
                    let _filteredData = [...data.data];
                    _filteredData = _filteredData.filter(rowItem => {
                        if (rowItem) {
                            let val = visibleFields.map(item => {
                                if (item) {
                                    return parseFieldValue(item, rowItem);
                                }
                                return '';
                            }).join(', ').toLowerCase();
                            return val.indexOf(_filtertext) > -1;
                        }
                        return true;
                    });
                    setState({
                        filteredData: _filteredData,
                        dataRefreshTime: new Date(),
                    });
                }
            } else {
                if (data && data.data) {
                    let sort_column, sort_order;
                    if(orderBy){
                        sort_column = orderBy.field;
                        sort_order = orderBy.direction;
                    }
                    if(sort_column && sort_order){
                        setState({
                            filteredData: _orderBy([...data.data], [sort_column], [sort_order]),
                        });
                    } else {
                        setState({
                            filteredData: [...data.data],
                            dataRefreshTime: new Date(),
                        });
                    }
                } else {
                    setState({
                        filteredData: [],
                        dataRefreshTime: new Date(),
                    });
                }
            }
        } else {
            if (data && data.data) {
                    setState({
                        filteredData: [...data.data],
                        dataRefreshTime: new Date(),
                    });
            } else {
                setState({
                    filteredData: [],
                    dataRefreshTime: new Date(),
                });
            }
        }
    }, [filterValue, data.data, orderBy, fields]);

    useEffect(()=>{
        if(remoteAction === true) {
            if (subscriptionRef && subscriptionRef.current) {
                subscriptionRef.current.forEach((subscription) => {
                    if (subscription) {
                        subscription.unsubscribe();
                    }
                });
                subscriptionRef.current = [];
            }
            fetchData();
        }
    }, [filterValue]);

    const loadViewFields= useCallback(function loadViewFields(fieldNames) {
        try {
            if (dataViewName) {
                const dt = window.localStorage.getItem(getViewNameForLocalStorage());
                if (dt) {
                    const storedConfig = JSON.parse(dt);
                    let _orderBy = {};
                    if (storedConfig && storedConfig.orderBy){
                        _orderBy = storedConfig.orderBy;
                        if(_orderBy.field){
                            let foundIndex = -1;
                            if(_orderBy.field) {
                                if (Array.isArray(fieldNames) && fieldNames.length > 0) {
                                    foundIndex = fieldNames.findIndex(function (item) {
                                        if (item) {
                                            if (item.sortName && item.sortName === _orderBy.field) {
                                                return true;
                                            }
                                            return item.name && item.name === _orderBy.field;
                                        }
                                        return false;
                                    });
                                }
                            }
                             if(foundIndex < 0) {
                                 _orderBy = {};
                            }
                        }
                        if(!_orderBy){
                            _orderBy = {};
                        }
                    }
                    if (storedConfig && storedConfig.fields) {
                        const sortedFieldNames = fieldNames.map((item) => {
                            if (item && item.name && storedConfig.fields[item.name]) {
                                const innerItem = storedConfig.fields[item.name];
                                if (typeof innerItem.sortIndex !== 'undefined') {
                                    item.sortIndex = innerItem.sortIndex;
                                }
                                if (typeof innerItem.isVisible !== 'undefined') {
                                    item.isVisible = innerItem.isVisible;
                                } else {
                                    item.isVisible = true;
                                }
                            }
                            return item;
                        });
                        setState({
                            fields: sortBy(sortedFieldNames, 'sortIndex'),
                            orderBy: _orderBy
                        });
                        return true;
                    } else {
                        const sortedFieldNames = fieldNames.map((item) => {
                            if (typeof item.isVisible !== 'undefined') {
                                item.isVisible = item.isVisible;
                            } else {
                                item.isVisible = true;
                            }
                            return item;
                        });
                        setState({
                            fields: sortedFieldNames,
                            orderBy: _orderBy
                        });
                    }
                } else {
                    setState({
                        fields: fieldNames
                    });
                }
            } else {
                setState({
                    fields: fieldNames
                });
            }
        } catch (err) {
            console.log(err);
            setState({
                fields: fieldNames
            });
        }

    },[fieldNames]);

    const refreshData = function refreshData(params) {
        return dataProvider.find(params).then((result)=>{
            return result;
        }).catch(err => {
            console.log(err);
            return Promise.reject(err);
        });
    };

    const fetchDataStream = function fetchDataStream(params) {
        if(typeof dataProvider.getStream === 'undefined'){
            return refreshData(params);
        } else {
            return dataProvider.getStream(params).then((result) => {
                return result;
            }).catch(err => {
                console.log(err);
                return Promise.reject(err);
            });
        }
    };

    const buildQueryParameterObject = React.useCallback(function buildQueryParameterObject() {
        let offset = 0;
        if (page > 0) {
            offset = (page * rowsPerPage);
        }
        let whereCondition = {};
        if (params) {
            whereCondition = {...params};
        }
        if(showDateRangeFilter === true){
            if(isAfter(endTime, startTime)){
                whereCondition.startTime= startTime;
                whereCondition.endTime= endTime;
            }
        }

        if(remoteAction === true){
            whereCondition.filterValue = filterValue ? filterValue.toString().toLowerCase().trim():  undefined;
        }

        return {
            whereCondition,
            sort_column: orderBy.field,
            sort_order: orderBy.direction,
            offset: offset,
            limit: rowsPerPage
        };

    }, [params, dataProvider, filterValue, startTime, endTime, orderBy, page, rowsPerPage]);


    const fetchData = React.useCallback(function fetchData() {
        setState({
            loading: true
        });
        let newSub= from(refreshData(buildQueryParameterObject())).pipe(map(result=>result), catchError((err)=>{
            setState({
                loading: false,
                data: [],
                dataRefreshTime: new Date(),
                //filteredData: result.data,
                dataFetched: true
            });
            if(err && err.message && (err.message === 'access_token_expired'|| err.message === 'Unathorized')){
                if(history.location.pathname.startsWith('/dashboard')){
                    history.push('/login');
                }
                enqueueSnackbar("Your session  has been expired. Please try login", {variant: 'error'});
            } else {
                enqueueSnackbar(err? err.message: 'Failed request',  {variant:'error'});
            }
            return [];
        })).subscribe(((result=[])=>{
            setState({
                loading: false,
                data: result,
                dataRefreshTime: new Date(),
                //filteredData: result.data,
                dataFetched: true
            });
        }));
        subscriptionRef.current.push(newSub);
    }, [params, dataProvider, filterValue, startTime, endTime, orderBy, page, rowsPerPage, subscriptionRef.current]);

    const parseFieldValue = React.useCallback(function parseFieldValue(item, rowItem) {
        if(item.filter){
            return  item.filter(rowItem);
        } else if(item.render){
            let renderedVal = item.render(rowItem);
            return isString(renderedVal)? renderedVal: (rowItem[item.name] ? rowItem[item.name].toString(): '');
        } else if(item.name){
            return rowItem[item.name] ? rowItem[item.name].toString(): '';
        }
        return '';
    },[data.data, setState]);

    const onSubmitSuccess = useCallback(function onSubmitSuccess(submittedData, editorPersist) {
        fetchData();
        if (onSubmitSuccess) {
            onSubmitSuccess(submittedData);
        }
        setState({
            triggerDetailRefresh: Date.now(),
            openEditor: false
        });
        enqueueSnackbar('Data has been saved successfully.', {variant: "success"});
    },[setState, data.data]);

    const onRemoveRowClick =  useCallback(function onRemoveRowClick(row) {
        setState({
            rowToRemove: row,
            confirmationMessage: 'Are you sure to delete?',
            showConfirmation: true,
        });
    },[setState, dataViewName, data.data]);

    const onRowDoubleClick = useCallback(function onRowDoubleClick(event, row) {
        if(event && event.stopPropagation) {
            event.stopPropagation();
        }
        if(EditorRef) {
            if (row && row.id && data && data.data) {
                let foundRow = data.data.find((item) => item && item.id && item.id === row.id);
                if (foundRow) {
                    setState({
                        selectedData: {...foundRow},
                        isEditMode: true,
                        openEditor: true,
                    });
                } else {
                    setState({
                        selectedData: {...row},
                        isEditMode: true,
                        openEditor: true,
                    });
                }
            } else {
                setState({
                    selectedData: {...row},
                    isEditMode: false,
                    openEditor: true,
                });
            }
        }
    },[EditorRef, setState, data.data]);

    const openEditorToCreate = useCallback(function openEditorToCreate() {
        if (params) {
            setState({
                selectedData: {...params},
                isEditMode: false,
                openEditor: true,
            });
        } else {
            setState({
                selectedData: {},
                isEditMode: false,
                openEditor: true,
            });
        }
    },[setState]);


    const onCloseEditor = useCallback(function onCloseEditor() {
        fetchData();
    },[setState, data.data, dataProvider, dataViewName]);

    const onSubmitError = useCallback(function onSubmitError(error) {
        enqueueSnackbar(error.message, {variant: "error"});
    },[]);

    const handleChangePage = useCallback(function handleChangePage(e, newPage) {
        setState({
            page: newPage
        });
    },[setState]);

    const handleChangeRowsPerPage = useCallback(function handleChangeRowsPerPage(e) {
        if (e && e.target && e.target.value) {
            setState({
                rowsPerPage: e.target.value
            });
        }
    },[setState]);

    const getViewNameForLocalStorage = useCallback(function getViewNameForLocalStorage() {
        return 'datatable-meta-' + dataViewName;
    },[dataViewName, fields]);

    const  onColumnReorder = useCallback(function onColumnReorder({sourceField, targetField}) {
        if (!dataViewName) {
            return false;
        }
        let  originalFields = [...fields];
        let _sourceFieldIndex = originalFields.findIndex(item => item && item.name === sourceField.name);
        let _sourceField = originalFields[_sourceFieldIndex];
        originalFields.splice(_sourceFieldIndex, 1);
        let targetIndex = originalFields.findIndex(item => item && item.name === targetField.name);
        originalFields.splice(targetIndex, 0, _sourceField);
        originalFields = originalFields.map((item, index)=> {
            if(item){
                item.sortIndex = index;
            }
            return item;
        });
        const sortedFields = sortBy(originalFields, 'sortIndex');
        setState({
            fields: sortedFields
        });
        saveFieldStatesOnStorage(sortedFields);
    },[fields,  setState]);


   const getStoredConfig =  useCallback(function saveStatesOnStorage(sortedFields) {
            const dt = window.localStorage.getItem(getViewNameForLocalStorage());
            let storeData = {};
            if (dt) {
                try {
                    storeData = JSON.parse(dt);
                    if(!storeData){
                        storeData = {};
                    }
                } catch (err) {
                    console.log(err);
                }
            }
            return storeData;
    },[dataViewName, setState]);

    const  saveFieldStatesOnStorage =  useCallback(function saveStatesOnStorage(sortedFields) {
        setTimeout(() => {
            let storeData = getStoredConfig();
            storeData.fields = sortedFields.reduce((accu, item) => {
                accu[item.name] = {sortIndex: item.sortIndex, isVisible: item.isVisible};
                return accu;
            }, {});
            try {
                window.localStorage.setItem(getViewNameForLocalStorage(), JSON.stringify(storeData));
            } catch (err) {
                console.log(err);
            }
        }, 50);

    },[fields, setState]);

    const  saveOrderByStatesOnStorage =  useCallback(function saveStatesOnStorage(orderBy) {
        setTimeout(() => {
            try {
                let storeData = getStoredConfig();
                storeData.orderBy = orderBy;
                window.localStorage.setItem(getViewNameForLocalStorage(), JSON.stringify(storeData));
            } catch (err) {
                console.log(err);
            }
        }, 50);

    },[orderBy, setState]);

    const  onConfirmResult = useCallback(function onConfirmResult(result) {

        if (result === true && rowToRemove) {
            rowToRemove.removing = true;
            dataProvider.delete(rowToRemove.id).then(() => {
                setState({
                    rowToRemove: null
                });
                fetchData();
                enqueueSnackbar('Data has been removed successfully.', {variant: "success"});
                onDispatch("REFRESH", {});
            }).catch((error) => {
                enqueueSnackbar(error.message, {variant: "error"});
            });
        } else {
            setState({
                rowToRemove: null
            });
        }
        setState({
            showConfirmation: false
        });
    }, [dataProvider, setState, rowToRemove]);

    const onColumnVisibiltyChanged  = useCallback(function onColumnVisibiltyChanged(changedField) {
        if (!dataViewName) {
            return false;
        }
        if (changedField) {
            const existingFields = [...fields];
            const existingFieldsByName = keyBy(existingFields, 'name');
            if (existingFieldsByName && existingFieldsByName[changedField.name]) {
                existingFieldsByName[changedField.name].isVisible = changedField.isVisible === false ? true : false;
                const sortedFields = sortBy(existingFields, 'sortIndex');
                setState({
                    fields: sortedFields
                });
                saveFieldStatesOnStorage(sortedFields);
            }
        }
    },[fields, setState]);


    const exportToCsv = React.useCallback(function exportToCsv() {

        let titleMsg  =  title? title.toLowerCase(): 'Data';
        let downloadOptions = {
            filename: `${titleMsg}_${format(new Date(), dateFns.dateTime12hFormat)}.csv`,
            separator: ','
        };
        setState({
            isCsvImporting: true
        });
        if(remoteAction === true) {
            let downloadedData = [];
            let params = buildQueryParameterObject();
            let initialLimit = 10;
            params.offset = 0;
            params.limit = initialLimit;
            let sub = from(fetchDataStream(params)).pipe(catchError(err=>{
                if (err && err.message && (err.message === 'access_token_expired' || err.message === 'Unathorized')) {
                    if (history.location.pathname.startsWith('/dashboard')) {
                        history.push('/login');
                    }
                    enqueueSnackbar("Your session  has been expired. Please try login", {variant: 'error'});
                } else if(err) {
                    enqueueSnackbar(err ? err.message : 'Failed request', {variant: 'error'});
                }
                setState({
                    isCsvImporting: false
                });
            })).subscribe((data)=> {
                setState({
                    isCsvImporting: false
                });
                let dataRow = data && data.data ? data.data : data;
                if (Array.isArray(dataRow)) {
                    dataRow.map((item) => {
                        if (item) {
                            downloadedData.push(item);
                        }
                    });
                    CsvDownLoader(fields.map(item => {
                        if (item.isVisible !== false) {
                            item.download = true;
                        }
                        return item;
                    }), downloadedData.map(item => {
                        return {
                            data: item
                        }
                    }), {downloadOptions});
                }
                subscriptionRef.current.push(sub);
            });
        } else {
            setState({
                isCsvImporting: false
            });
            if (!filteredData || (filteredData && !filteredData.length)) {
                return true;
            }
            CsvDownLoader(fields.map(item => {
                if(item.isVisible !== false){
                    item.download = true;
                }
                return item;
            }), filteredData.map(item => {
                return {
                    data: item
                }
            }), {downloadOptions})
        }

    },[filteredData, data.data, remoteAction, fieldNames, setState, fields, dataViewName, dataProvider]);

    const setOpenEditor =  React.useCallback(function setOpenEditor(val) {
        setState({
            openEditor: val,
        })

    },[setState, dataViewName, dataProvider]);

    const setOrderBy = React.useCallback(function setOrderBy(val) {
        setState({
            orderBy : val,
        });
        saveOrderByStatesOnStorage(val);
    },[fields, setState]);

    const onDispatch = React.useCallback(function onDispatch(action, payload) {
        if(action && action  === 'SEARCH') {
            setState({
                filterValue: payload
            });
        } else if(action && action === 'CORE_ID_LINK'){
            const {e,  row }  =  payload;
            onRowDoubleClick(e, row);
        } else if (onDispatchEvent) {
            onDispatchEvent({action, payload});
        }
    }, [onDispatchEvent]);


    return {
        data, filteredData, filterPlaceholder, orderBy,filterValue, dataFetched,
        onColumnVisibiltyChanged,
        onColumnReorder,
        exportToCsv,
        confirmModalRef,
        openEditor, isEditMode, loading,
        mounted, selectedData, page, rowsPerPage, triggerDetailRefresh, fields,
        confirmationMessage,  showConfirmation, rowToRemove, setState,
        enqueueSnackbar, startTime, endTime, setOrderBy,
        setStartDate, setEndDate,
        searchBoxRef,
        onSubmitSuccess,
        onSubmitError,
        openEditorToCreate,
        onRowDoubleClick,
        onConfirmResult,
        onDispatch,
        onRemoveRowClick,
        handleChangePage,
        handleChangeRowsPerPage,
        onCloseEditor,
        setOpenEditor,
        isCsvImporting,
        dataRefreshTime,
    }
}




const DataView = React.memo(function ({hideTitle,  showDateRangeFilter, remoteAction, hideEditButton, hideRemoveButton,numOfRows, dataProvider, showPaging, providedData, title, EditorRef, CreatorRef, useDragger, fieldNames, params,useSelection, hideControls, hideAddDataBtn, dataViewName, onDispatchEvent}) {


    const classes = useStyles();
    const {  data, filteredData, filterPlaceholder, orderBy,filterValue, dataFetched,
        onColumnVisibiltyChanged,
        onColumnReorder,
        exportToCsv,
        confirmModalRef,
        openEditor, isEditMode, loading,
        mounted, selectedData, page, rowsPerPage, triggerDetailRefresh, fields,
        confirmationMessage,  showConfirmation, rowToRemove, setState,
        enqueueSnackbar, startTime, endTime, setOrderBy,
        setStartDate, setEndDate, searchBoxRef,
        onSubmitSuccess,
        onSubmitError,
        openEditorToCreate,
        onRowDoubleClick,
        onConfirmResult,
        onDispatch,
        onRemoveRowClick, handleChangePage,
        handleChangeRowsPerPage,
        onCloseEditor,
        setOpenEditor, isCsvImporting, dataRefreshTime,  } =  useDataView({classes,hideTitle,  showDateRangeFilter, remoteAction, hideEditButton, hideRemoveButton,numOfRows, dataProvider, showPaging, providedData, title, EditorRef, CreatorRef, useDragger, fieldNames, params, hideControls, hideAddDataBtn, dataViewName, onDispatchEvent, useSelection});

    return (
        <div className={classes.container}>
            {dataFetched ? (
                <React.Fragment>
                    {!hideControls && (
                            <Toolbar
                                className={classnames(classes.root)}>
                                <Typography  component={'span'}  className={classes.title}>
                                    {!hideTitle && title} {filterValue ? (<em className={classes.recordCount}>({filteredData.length} match found)</em>):''}
                                </Typography>

                                {showDateRangeFilter === true && (
                                    <MuiPickersUtilsProvider utils={DateFnsUtils}>
                                    <KeyboardDateTimePicker
                                        variant="outline"
                                        ampm={true}
                                        style={{width: '200px'}}
                                        className={classes.datePicker}
                                        DialogProps={{className: classes.datePickerDialogue}}
                                        autoOk={true}

                                        value={startTime}
                                        onChange={setStartDate}
                                        onError={console.log}
                                        format={dateFns.dateTime12hFormat}
                                        InputProps={{
                                            endAdornment: (
                                                <InputAdornment position="end">
                                                    <IconButton style={{padding: '0px'}}>
                                                        <DateRangeIcon size="small" style={{
                                                            fontSize: 'small',
                                                            padding: '0px',
                                                            width: '.9rem',
                                                            height: '.9rem'
                                                        }}/>
                                                    </IconButton>
                                                </InputAdornment>
                                            ),
                                        }}
                                    />
                                    <KeyboardDateTimePicker
                                            variant="outline"
                                            ampm={true}
                                            style={{  width: '200px'}}
                                            DialogProps={{className: classes.datePickerDialogue}}
                                            className={classes.datePicker}
                                             autoOk={true}
                                            // label="Date from"
                                            inputProps={{
                                                InputLabelProps:{
                                                    labelPlacement: 'start'
                                                }
                                            }}

                                            value={endTime}
                                            onChange={setEndDate}
                                            onError={console.log}
                                            format={dateFns.dateTime12hFormat}
                                            disableFuture={true}
                                            showTodayButton
                                        />

                                    </MuiPickersUtilsProvider>
                                )}
                                <TextField
                                    style={{ float: 'left', marginLeft: '10px'}}
                                    type={{'number' : 'text'}}
                                    className={classes.searchBoxInput}
                                    // value={filterValue || ''}
                                    defaultValue={filterValue || ''}
                                    placeholder={filterPlaceholder || ''}
                                   // onChange={onSearchFieldChange}
                                    inputRef={searchBoxRef}
                                    InputProps={{
                                        startAdornment: (
                                            <InputAdornment position="start">
                                                <Tooltip title='Search'>
                                                    <SearchIcon className={classes.searchIcon} size="sm" />
                                                </Tooltip>
                                            </InputAdornment>
                                        ),
                                        endAdornment: (
                                            <InputAdornment position="end">
                                                {filterValue && filterValue.length > 0 && (
                                                    <IconButton style={{padding: '0px'}} onClick={e=>{ e.stopPropagation();
                                                    if(searchBoxRef && searchBoxRef.current){
                                                        searchBoxRef.current.value='';
                                                    }
                                                    setState({
                                                        filterValue: ''
                                                    })}}>
                                                        <BackspaceIcon size="small" style={{fontSize: 'small',padding: '0px', width: '.9rem', height: '.9rem'}} />
                                                    </IconButton>
                                                )}
                                            </InputAdornment>

                                        ),
                                    }}
                                />
                                <Button size="small" className={classes.exportButton} aria-label={'Export data'}
                                        align={'right'} onClick={exportToCsv}>
                                    {isCsvImporting === true ? (
                                        <TinySpinner>...</TinySpinner>
                                    ):(<ExportIcon fontSize="small"/>)}
                                </Button>
                                {!hideAddDataBtn && (
                                    <Button className={classes.toolbarAddButton} size="small" color='primary'
                                            align={'right'}
                                            aria-label={'Add new data'} onClick={(e) => openEditorToCreate()}>
                                        <AddIcon/>
                                    </Button>)}

                            </Toolbar>
                    )}
                        <DataTable  fields={fields}
                                   data={filteredData}
                                   dataViewName={dataViewName}
                                   useDragger={useDragger}
                                   hideControls={hideControls}
                                   page={page}
                                   dataRefreshTime={dataRefreshTime}
                                   onDispatch={onDispatch}
                                    hideEditButton={hideEditButton}
                                    hideRemoveButton={hideRemoveButton}
                                   onColumnReorder={onColumnReorder}
                                   onColumnVisibiltyChanged={onColumnVisibiltyChanged}
                                   rowsPerPage={rowsPerPage}
                                   totalCount={data.paging ? data.paging.count : null}
                                   orderBy={orderBy}
                                   showPaging={showPaging}
                                   setOrderBy={setOrderBy}
                                    useSelection={useSelection}
                                   handleChangePage={handleChangePage}
                                   handleChangeRowsPerPage={handleChangeRowsPerPage}
                                   onRowDoubleClick={onRowDoubleClick}
                                   onRemoveRowClick={onRemoveRowClick}></DataTable>
                    {showPaging && (
                        <TablePagination
                            align='left'
                            className={classes.pagingToolbar}
                            rowsPerPageOptions={[10, 50, 100]}
                            component="div"
                            count={data.paging ? data.paging.count : null || filteredData.length}
                            rowsPerPage={rowsPerPage}
                            page={page}
                            backIconButtonProps={{
                                'aria-label': 'Previous Page',
                                fontSize: 'small',
                                size: 'small',
                            }}
                            nextIconButtonProps={{
                                'aria-label': 'Next Page',
                                fontSize: 'small',
                                size: 'small',
                            }}
                            onChangePage={handleChangePage}
                            onChangeRowsPerPage={handleChangeRowsPerPage}
                        />
                    )}
                    {openEditor && isEditMode ===  true && EditorRef && (
                        <EditorRef onCloseEditor={onCloseEditor} triggerDetailRefresh={triggerDetailRefresh}
                                   setTriggerDetailRefresh={e=> setState({
                                       triggerDetailRefresh: Date.now()
                                   })} isEditMode={isEditMode}
                                   initialValues={selectedData} open={Boolean(openEditor)} setOpen={setOpenEditor}
                                   onSubmitError={onSubmitError} onSubmitSuccess={onSubmitSuccess}/>
                    )}
                    {openEditor && !isEditMode && (
                        <React.Fragment>
                            {
                                CreatorRef ?
                                    (
                                        <CreatorRef isEditMode={isEditMode} initialValues={selectedData}
                                                    open={Boolean(openEditor)}
                                                    setOpen={setOpenEditor} onSubmitError={onSubmitError}
                                                    onSubmitSuccess={onSubmitSuccess}/>

                                    ) : (
                                        <EditorRef isEditMode={isEditMode} initialValues={selectedData} open={Boolean(openEditor)}
                                                   setOpen={setOpenEditor} onSubmitError={onSubmitError}
                                                   onSubmitSuccess={onSubmitSuccess}/>

                                    )
                            }
                        </React.Fragment>
                    )}
                    <ConfirmationModal ref={confirmModalRef} onSubmitSuccess={onConfirmResult} open={Boolean(showConfirmation)}
                                       setOpen={e=> setState({ showConfirmation: e.value})}>
                        {confirmationMessage}
                    </ConfirmationModal>
                </React.Fragment>

            ) : (
                    <TinySpinner> Loading data</TinySpinner>
            )}
        </div>
    )
});


export default DataView;
