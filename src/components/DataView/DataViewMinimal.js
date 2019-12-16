import React, {useEffect, useState} from "react";
import {useSnackbar} from "notistack";
import {withStyles} from "@material-ui/core";
import DataTable from "../DataTable/DataTable";
import TinySpinner from "../TinySpinner";
import DataTableMinimal from "../DataTable/DataTableMinimal";

const styles = theme => ({
    root: {
        backgroundColor: theme.palette.background.default,
        paddingTop: '10px',
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
        fontSize: '.9rem',
    },
    row: {
        '&:nth-of-type(odd)': {
            backgroundColor: theme.palette.background.default,
        },
    }
});

const DataViewMinimal = React.memo(function ({classes, dataProvider, providedData, viewOrderBy, noDataFoundMessage,highlightedRow,
                                                 setViewOrderBy, title, EditorRef, CreatorRef, fieldNames, params, hideControls}) {

    const [data, setData] = useState([]);
    const [orderBy, setOrderBy] = useState({});
    const [dataFetched, setDataFetched] = useState(null);
    const [openEditor, setOpenEditor] = useState(null);
    const [isEditMode, setEditMode] = useState(false);
    const [selectedData, setSelectedData] = useState({});
    const {enqueueSnackbar, closeSnackbar} = useSnackbar();
    const [askRemoveConfirmation, setAskRemoveConfirmation] = useState(null);
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);

    useEffect(() => {
        if (!providedData) {
            fetchData();
        }
    }, [orderBy, page, rowsPerPage, params]);

    useEffect(() => {
        if (providedData) {
            setData(providedData);
            setDataFetched(true);
        }
    }, [providedData]);

    function fetchData() {

        let offset = 0;
        if (page > 0) {
            offset = (page * rowsPerPage);
        }
        let whereCondition = {};
        if (params) {
            whereCondition = {...params};
        }

        dataProvider.find({
            whereCondition,
            sort_column: orderBy.field,
            sort_order: orderBy.direction,
            offset: offset,
            limit: rowsPerPage
        }).then((result) => {
            setDataFetched(true);
            setData(result);
        }).catch(err => {
            console.log(err);
        });
    }

    function onSubmitSuccess(submittedData) {
        if (!providedData) {
            fetchData();
        }
        if (onSubmitSuccess) {
            onSubmitSuccess(submittedData);
        }
        enqueueSnackbar('Data has been saved successfully.', {variant: "success"});
        setOpenEditor(false);
    }

    function onRemoveRowClick(row) {
        const result = window.confirm("Are  you sure to delete?");
        if (result === true) {
            row.removing = true;
            dataProvider.delete(row.id).then(() => {
                fetchData();
                enqueueSnackbar('Data has been removed successfully.', {variant: "success"});
            }).catch((error) => {
                enqueueSnackbar(error.message, {variant: "error"});
            });
        }
    }

    function onRowDoubleClick(row) {
        setSelectedData({...row});
        setEditMode(true);
        setOpenEditor(true);
    }

    function openEditorToCreate() {
        if (params) {
            setSelectedData({...params});
        } else {
            setSelectedData({});
        }
        setEditMode(false);
        setOpenEditor(true);
    }

    function onSubmitError(error) {
        enqueueSnackbar(error.message, {variant: "error"});
    }

    function handleChangePage(e, newPage) {
        setPage(newPage);
    }

    function handleChangeRowsPerPage(e) {
        if (e && e.target && e.target.value) {
            setRowsPerPage(e.target.value);
        }
    }

    return (
        <React.Fragment>
            {dataFetched ? (
                <div className={classes.container}>
                    <DataTableMinimal fields={fieldNames}
                                      data={data.data}
                                      hideControls={hideControls}
                                      page={page}
                                      highlightedRow={highlightedRow}
                                      noDataFoundMessage={noDataFoundMessage}
                                      rowsPerPage={rowsPerPage}
                                      totalCount={data.paging ? data.paging.count : null}
                                      orderBy={viewOrderBy || orderBy}
                                      setOrderBy={setViewOrderBy || setOrderBy}
                                      handleChangePage={handleChangePage}
                                      handleChangeRowsPerPage={handleChangeRowsPerPage}
                                      onRowDoubleClick={onRowDoubleClick}
                                      onRemoveRowClick={onRemoveRowClick}></DataTableMinimal>
                </div>
            ) : (
                    <TinySpinner> Loading data</TinySpinner>
            )}
        </React.Fragment>
    )
});


export default withStyles(styles)(DataViewMinimal);
