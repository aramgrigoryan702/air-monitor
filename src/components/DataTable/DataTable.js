import React, {useCallback, useEffect, useReducer, useState} from "react";
import {makeStyles, TableFooter, withStyles} from "@material-ui/core";
import TableCell from "@material-ui/core/TableCell";
import TableHead from "@material-ui/core/TableHead";
import TableRow from "@material-ui/core/TableRow";
import Tooltip from "@material-ui/core/Tooltip";
import TableSortLabel from "@material-ui/core/TableSortLabel";
import TableBody from "@material-ui/core/TableBody";
import IconButton from "@material-ui/core/IconButton";
import Table from "@material-ui/core/Table";
import TinySpinner from "../TinySpinner";
import DeleteIcon from "../icons/DeleteIcon";
import Grow from "@material-ui/core/Grow";
import Paper from "@material-ui/core/Paper";
import ClickAwayListener from "@material-ui/core/ClickAwayListener";
import MenuList from "@material-ui/core/MenuList";
import MenuItem from "@material-ui/core/MenuItem";
import Popper from "@material-ui/core/Popper";
import ViewHeadlineIcon from '@material-ui/icons/ViewHeadline';
import DragIndicatorIcon from '@material-ui/icons/DragIndicator';
import FindInPageIcon from '@material-ui/icons/FindInPage';
import Checkbox from "@material-ui/core/Checkbox";
import ListItemText from "@material-ui/core/ListItemText";
import FormControlLabel from "@material-ui/core/FormControlLabel";
import {isNil, keyBy, sortBy} from "lodash";
import domtoimage from 'dom-to-image';
import classnames from "classnames";
import * as ReactDOM from "react-dom";
import 'react-sticky-table/dist/react-sticky-table.css';
import '../../styles/_animate_base_container.scss';
import InspectionIcon from "../icons/InspectionIcon";
import EmptyColumn from "./EmptyColumn";

const CustomTableCell = withStyles(theme => ({
    head: {
        backgroundColor: theme.palette.common.black,
        color: theme.palette.common.white,
        height: '30px',
    },
    body: {
        fontSize: 12,
    },
}))(TableCell);

const CustomTableHeaderCell = withStyles(theme => ({
    head: {
        backgroundColor: theme.palette.common.black,
        color: theme.palette.common.white,
        height: '20px',
        padding: 2,
        paddingLeft: '10px',
        position: 'sticky',
        top: 0,
        zIndex: 100,
    },
    body: {
        fontSize: 12,
        padding: 0,
        paddingLeft: '10px'
    },
}))(TableCell);

const useStyles = makeStyles(theme => ({
    root: {
        width: 'calc(100%)',
        marginTop: theme.spacing(3),
        overflowX: 'auto',
    },
    container: {
        overflow: "auto",
        height: 'calc(100%)',
        willChange: 'transform, opacity',
        maxHeight: 'calc(100%)',
        //height: '200px',
        position: "relative",
        display: 'block',
    },
    table: {
        width: 'calc(100%)',
        maxWidth: 'calc(100%)',
        minHeight: '100px',
        // padding: theme.spacing.unit * 23
        //minWidth: 500,
    },
    thead: {
        height: 0,
        lineHeight: 0,
        paddingTop: 0,
        paddingBottom: 0,
        color: 'transparent',
        border: 'none',
        whiteSpace: 'nowrap',
    },
    headerRow: {
        height: '30px',
    },
    th: {
        position: 'absolute',
        background: 'transparent',
        padding: '9px 10px',
        top: 0,
        left: 0,
        lineHeight: 'normal',
    },
    avatar: {
        margin: theme.spacing(1),
        backgroundColor: theme.palette.secondary.main,
        color: theme.palette.text.primary,
    },
    toolbarAddButton: {
        position: 'absolute',
        right: '15px',
        bottom: '0px'
    },
    row: {
        //  height: '30px',
        padding: 2,
        '&:nth-of-type(odd)': {
            backgroundColor: theme.palette.background.default,
        },
        height: '30px',
        animation: 'animate-bezier-container 850ms forward'
    },
    column: {
        whiteSpace: 'nowrap',
        padding: 0,
        paddingLeft: '10px'

    },
    rowSelected: {
        border: `2px solid #1b7ade`,
    },
    button: {
        padding: '0px',
    },
    removeButton: {
        // color: theme.palette.error.main
    },
    editButton: {
        color: theme.palette.grey[500]
    },
    paper: {
        padding: theme.spacing(2),
        textAlign: 'center',
        color: theme.palette.text.secondary,
    },
    menuList: {
        zIndex: 1600,
        maxHeight: '90vh',
        overflow: 'hidden',
        overflowY: 'auto',
    },
    menuItem: {
        fontSize: '.8rem',
        padding: 0,
        margin: 0,
        paddingLeft: '10px',
        paddingRight: '10px',
        minHeight: '30px',
        height: '30px'

    },
    menuListLabel: {
        fontSize: '.8rem',
        minHeight: '30px',
        height: '30px',
        padding: 0,
        margin: 0,
        '& span': {
            fontSize: '.8rem',
        },
    },
    userButton: {
        height: '20px',
        padding: 0,
        margin: 0,
        marginTop: '-5px',
    },
    dragIcon: {
        fontSize: '1rem',
        padding: 0,
        margin: 0,
        marginLeft: '-10px',
        // width: '1rem',
        // paddingTop: '5px',
    }
}));


function reducer(currentState, newState) {
    return {...currentState, ...newState};
}


const RenderColumn = React.memo(function RenderColumn({field, row, rowIndex, onDispatch}) {

    if (typeof field.render === 'function') {
        return field.render(row, rowIndex, onDispatch);
    } else if (!isNil(row[field.name])) {
        return row[field.name];
    } else {
        return (<EmptyColumn/>)
    }
});


function useDataTable({
                          fields, useDragger, data, orderBy, setOrderBy, rowsPerPage, page, onRowDoubleClick,
                          handleChangePage,
                          handleChangeRowsPerPage,
                          dataViewName,
                          hideEditButton, hideRemoveButton,
                          filterValue,
                          onRemoveRowClick, onRefresh, onRowSelect, totalCount,
                          hideControls,
                          onColumnReorder,
                          showPaging,
                          onColumnVisibiltyChanged,
                          onDispatch,
                          dataRefreshTime,
                          useSelection
                      }) {

    const dummyPlaceHolderRef = React.useRef();
    const classes = useStyles();

    const [{columnFilterMenuOpen, visibleFields, menuFields, anchorEl, dataLen, selectedRows}, setState] = useReducer(reducer, {
        columnFilterMenuOpen: 'false',
        visibleFields: [],
        menuFields: [],
        anchorEl: null,
        dataLen: 0,
        selectedRows: new Map(),
    });

    useEffect(() => {
        if (Array.isArray(fields)) {
            setState({
                visibleFields: fields.filter((item) => item.isVisible !== false),
                menuFields: [...fields]
            });
        }

    }, [fields]);

    useEffect(() => {
        if (dataRefreshTime && data && data.length > 0) {
            if (selectedRows) {
                let _selectedRows = new Map(selectedRows);
                let idMap = keyBy(data, 'id');
                let values = [..._selectedRows.values()];
                values.forEach((valItem) => {
                    if (valItem && valItem.id) {
                        if (!idMap[valItem.id]) {
                            _selectedRows.delete(valItem.id);
                        }
                    }
                });
                setState({dataLen: data.length, selectedRows: _selectedRows});
            } else {
                setState({dataLen: data.length, selectedRows: new Map()});
            }

            return () => {
                if (dummyPlaceHolderRef.current && dummyPlaceHolderRef.current.length > 0) {
                    dummyPlaceHolderRef.current.forEach((item) => {
                        if (item) {
                            item.remove();
                        }
                    })
                }
            };
        } else {
            setState({dataLen: data.length, selectedRows: new Map()});
        }
    }, [dataRefreshTime]);

    const onDragStart = useCallback(function onDragStart(e, row) {
        let _selectedRows = new Map(selectedRows);
        if (!_selectedRows.has(row.id)) {
            _selectedRows.set(row.id, {...row});
            setState({
                selectedRows: _selectedRows,
            });
        }
        let param = {rows: [..._selectedRows.values()], type: 'DEVICE'};
        e.dataTransfer.setData('text', JSON.stringify(param));
        e.dataTransfer.dropEffect = "copy";
        try {
            let tbody = e.target.closest('tbody');
            if (tbody) {
                let tdElem = e.target.closest('td');
                let elem = tdElem.cloneNode();
                document.body.append(elem);
                ReactDOM.render((
                    <div>{param.rows.map((item, i) => (<div className={classes.row}>{item.id}</div>))}</div>), elem);
                e.dataTransfer.setDragImage(elem, 0, 0);
                dummyPlaceHolderRef.current.push(elem);
                /// elem.remove();
            }

        } catch (ex) {
            console.log(ex);
        }
    }, [selectedRows]);

    const onTableColumnDragStart = useCallback(function onTableColumnDragStart(e, field, index) {
        let param = {...field, sortIndex: index, type: 'TABLE_COLUMN'};
        e.dataTransfer.setData('text', JSON.stringify(param));
        e.dataTransfer.dropEffect = "copy";
    }, [visibleFields]);

    const onDragOver = useCallback(function onDragOver(ev) {
        ev.preventDefault();
        ev.dataTransfer.dropEffect = "move";
    }, [visibleFields, fields, dataViewName]);

    const onColumnDrop = useCallback(function onColumnDrop(e, field, index) {
        e.preventDefault();
        if (!dataViewName) {
            return false;
        }
        try {
            let transerData = e.dataTransfer.getData('text');
            if (transerData) {
                // let myRef = confirmModalRef.current;
                transerData = JSON.parse(transerData) || {};
                // console.log('data received here ',transerData);
                // console.log('node here',node);
                const {type, sortIndex, name} = transerData;
                if (type !== 'TABLE_COLUMN') {
                    return false;
                }
                if (name === field.name) {
                    return false;
                }

                onColumnReorder && onColumnReorder({sourceField: transerData, targetField: field});
            }
        } catch (err) {
            console.log(err);
        }
    }, [visibleFields, fields, dataViewName]);

    const handleFilterColumnClick = useCallback(function handleFilterColumnClick(event) {
        setState({
            anchorEl: event.currentTarget,
            //columnFilterMenuOpen:  true,
        });
    }, [visibleFields, fields, menuFields]);

    const handleRowClick = useCallback(function handleRowClick(event, data) {
        if (useSelection !== false) {
            let _selectedRows = new Map(selectedRows);
            if (_selectedRows.has(data.id)) {
                _selectedRows.delete(data.id);
            } else {
                _selectedRows.set(data.id, {...data});
            }
            setState({
                selectedRows: _selectedRows,
            });
        }
    }, [selectedRows]);

    const handleFilterColumnMenuClose = useCallback(function handleFilterColumnMenuClose() {
        setState({
            anchorEl: null
        });
    }, [visibleFields, fields, menuFields]);

    const onColumnVisibiltyChangeCallback = useCallback(function onColumnVisibiltyChangeCallback(e, fieldItem) {
        onColumnVisibiltyChanged(fieldItem);
    }, [menuFields, fields, visibleFields]);


    return {
        columnFilterMenuOpen,
        visibleFields,
        menuFields,
        anchorEl,
        dataLen,
        selectedRows,
        onDragStart,
        onTableColumnDragStart,
        onDragOver,
        onColumnDrop,
        handleFilterColumnClick,
        handleRowClick,
        handleFilterColumnMenuClose,
        onColumnVisibiltyChangeCallback,
        setState

    }

}

const DataTable = React.memo(function DataTable({
                                                    fields, useDragger, data, orderBy, setOrderBy, rowsPerPage, page, onRowDoubleClick,
                                                    handleChangePage,
                                                    handleChangeRowsPerPage,
                                                    dataViewName,
                                                    hideEditButton, hideRemoveButton,
                                                    filterValue,
                                                    onRemoveRowClick, onRefresh, onRowSelect, totalCount,
                                                    hideControls,
                                                    onColumnReorder,
                                                    showPaging,
                                                    onColumnVisibiltyChanged,
                                                    onDispatch,
                                                    dataRefreshTime,
                                                    useSelection,
                                                }) {


    const classes = useStyles();
    const {
        columnFilterMenuOpen, visibleFields, menuFields, anchorEl, dataLen, selectedRows, onDragStart, onTableColumnDragStart, onDragOver, onColumnDrop,
        handleFilterColumnClick, handleRowClick, handleFilterColumnMenuClose, onColumnVisibiltyChangeCallback, setState

    } = useDataTable({
        classes, fields, useDragger, data, orderBy, setOrderBy, rowsPerPage, page, onRowDoubleClick,
        handleChangePage,
        handleChangeRowsPerPage,
        dataViewName,
        hideEditButton, hideRemoveButton,
        filterValue,
        onRemoveRowClick, onRefresh, onRowSelect, totalCount,
        hideControls,
        onColumnReorder,
        showPaging,
        onColumnVisibiltyChanged,
        onDispatch,
        dataRefreshTime,
        useSelection
    });


    return (
        <div className={classes.container}>
            <Table className={classes.table} aria-labelledby="tableTitle">
                <TableHead>
                    <TableRow className={classes.headerRow}>
                        {visibleFields && visibleFields.map((field, fieldIndex) => (
                            <CustomTableHeaderCell component="th" onDragOver={onDragOver}
                                                   onDrop={e => onColumnDrop(e, field, fieldIndex)}
                                                   dropabble="true" draggable="true"
                                                   onDragStart={e => onTableColumnDragStart(e, field, fieldIndex)}
                                                   className={classes.column} align={field.align || "center"}
                                                   key={'field-header'+fieldIndex}
                                                   sortDirection={(field.sortName && orderBy.field === field.sortName || orderBy.field === field.name) ? 'asc' : 'desc'}>

                                <Tooltip
                                    title="Sort"
                                    placement={'bottom-end'}
                                    enterDelay={100}
                                >
                                    <TableSortLabel
                                        active={(orderBy.field === field.name || (field.sortName && orderBy.field === field.sortName)) ? true : false}
                                        direction={orderBy.direction ? orderBy.direction : 'asc'}
                                        onClick={() => {
                                            setOrderBy({
                                                field: field.sortName || field.name,
                                                direction: orderBy.direction === 'asc' ? 'desc' : 'asc'
                                            })
                                        }}
                                    >{field.label}
                                    </TableSortLabel>
                                </Tooltip>
                            </CustomTableHeaderCell>
                        ))}
                        {<CustomTableHeaderCell component="th" className={classes.column}>
                            <IconButton className={classes.userButton}
                                        aria-owns={'filter-column-list-grow'}
                                        aria-haspopup="true"
                                        onClick={handleFilterColumnClick}>
                                <ViewHeadlineIcon/>
                            </IconButton>
                        </CustomTableHeaderCell>}
                    </TableRow>
                </TableHead>
                <TableBody>
                    {data && !data.length && (
                        <TableRow className={classes.row}>
                            <CustomTableCell colSpan={fields.length + 1}>
                                No data Available
                            </CustomTableCell>
                        </TableRow>
                    )}
                    {data && data.length > 0 && data.map((row, rowIndex) => (
                        <TableRow className={classnames(classes.row, selectedRows.has(row.id) && classes.rowSelected)}
                                  onClick={(e) => handleRowClick(e, row)} key={'row_' + rowIndex + "_" + row.id}
                                  onDoubleClick={(e) => onRowDoubleClick(e, row)}>
                            {visibleFields && visibleFields.map((field, fieldIndex) => (
                                <CustomTableCell align={field.align || 'center'} className={classes.column}
                                                 component="td" scope="row"
                                                 key={'col-' + row.id + '_' + rowIndex + '-' + fieldIndex}>
                                    {fieldIndex === 0 && useDragger && (
                                        <IconButton className={classes.dragIcon} title="Drag and drop into site"
                                                    onDragStart={e => onDragStart(e, row)} draggable={useDragger}>
                                            <DragIndicatorIcon/>
                                        </IconButton>
                                    )}
                                    <RenderColumn key={'row-cell-' + rowIndex + '-' + fieldIndex} field={field}
                                                  row={row} rowIndex={rowIndex} onDispatch={onDispatch}/>
                                </CustomTableCell>
                            ))}

                            <CustomTableCell className={classes.column}>
                                {!hideControls && (
                                    <React.Fragment>
                                        {!hideEditButton && (
                                            <IconButton size="small" onClick={(e) => onRowDoubleClick(e, row)}
                                                        className={classes.button}
                                                        aria-label="Edit">
                                                <InspectionIcon/>
                                            </IconButton>
                                        )}
                                        {!hideRemoveButton && (
                                            <IconButton size="small" onClick={(e) => onRemoveRowClick(row)}
                                                        className={classes.button}
                                                        aria-label="Delete">
                                                <DeleteIcon fontSize="small"/>
                                                {row.removing && <TinySpinner/>}
                                            </IconButton>
                                        )}
                                    </React.Fragment>
                                )}
                            </CustomTableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
            <Popper style={{zIndex: 1600}} open={Boolean(anchorEl)} anchorEl={anchorEl} transition>
                {({TransitionProps, placement}) => (
                    <Grow
                        {...TransitionProps}
                    >
                        <Paper>
                            <ClickAwayListener onClickAway={handleFilterColumnMenuClose}>
                                <MenuList className={classes.menuList}>
                                    {menuFields && menuFields.map((fieldItem, fieldIndex) => (
                                        <MenuItem className={classes.menuListLabel}
                                                  key={"table-col-filter" + fieldIndex} onClick={(e) => {
                                        }}>
                                            <FormControlLabel className={classes.menuListLabel}
                                                              color={fieldItem.isVisible ? 'primary' : 'default'}
                                                              control={<Checkbox checked={fieldItem.isVisible !== false}
                                                                                 onChange={e => onColumnVisibiltyChangeCallback(e, fieldItem)}/>}
                                                              label={fieldItem.label || fieldItem.name}
                                            />
                                        </MenuItem>
                                    ))}
                                </MenuList>
                            </ClickAwayListener>
                        </Paper>
                    </Grow>
                )}
            </Popper>
        </div>
    )
});

export default DataTable;
