import React, {useCallback, useEffect, useReducer, useState} from "react";
import {TableFooter, withStyles} from "@material-ui/core";
import TableCell from "@material-ui/core/TableCell";
import TableHead from "@material-ui/core/TableHead";
import TableRow from "@material-ui/core/TableRow";
import Tooltip from "@material-ui/core/Tooltip";
import TableSortLabel from "@material-ui/core/TableSortLabel";
import TableBody from "@material-ui/core/TableBody";
import IconButton from "@material-ui/core/IconButton";
import TablePagination from "@material-ui/core/TablePagination";
import Table from "@material-ui/core/Table";
import TinySpinner from "../TinySpinner";
import EditIcon from "../icons/EditIcon";
import DeleteIcon from "../icons/DeleteIcon";
import Button from "@material-ui/core/Button";
import Grow from "@material-ui/core/Grow";
import Paper from "@material-ui/core/Paper";
import ClickAwayListener from "@material-ui/core/ClickAwayListener";
import MenuList from "@material-ui/core/MenuList";
import MenuItem from "@material-ui/core/MenuItem";
import Popper from "@material-ui/core/Popper";
import ViewHeadlineIcon from '@material-ui/icons/ViewHeadline';
import Checkbox from "@material-ui/core/Checkbox";
import ListItemText from "@material-ui/core/ListItemText";
import FormControlLabel from "@material-ui/core/FormControlLabel";
import {sortBy} from "lodash";
import {VirtualizedTable} from "./VirtualizedTable";

const CustomTableCell = withStyles(theme => ({
    head: {
        backgroundColor: theme.palette.common.black,
        color: theme.palette.common.white,
        height: '30px'
    },
    body: {
        fontSize: 12,
    },
}))(TableCell);

const styles = theme => ({
    root: {
        width: 'calc(100%)',
        marginTop: theme.spacing(3),
        overflowX: 'auto',
    },
    table: {
        width: 'calc(100%)',
        maxWidth: 'calc(100%)',
        minHeight: '100px',
       // padding: theme.spacing.unit * 23
        //minWidth: 500,
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
        '&:nth-of-type(odd)': {
            backgroundColor: theme.palette.background.default,
        },
        height: '30px',
    },
    column:{
        whiteSpace: 'nowrap',
        padding:0,
        paddingLeft:  '10px',

    },
    button:{
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
});



function reducer(currentState, newState) {
    return {...currentState, ...newState};
}

const DataTable_New = React.memo(function DataTable(props) {

    const {
        classes, fields, useDragger, data, orderBy, setOrderBy, rowsPerPage, page, onRowDoubleClick,
        handleChangePage,
        handleChangeRowsPerPage,
        dataViewName,
        onRemoveRowClick, onRefresh, onRowSelect, totalCount,
        hideControls,
        onColumnReorder,
        showPaging,
        onColumnVisibiltyChanged,
        onDispatch
    } = props;


    const [{columnFilterMenuOpen,  visibleFields, menuFields, anchorEl, dataLen }, setState] = useReducer(reducer, {
        columnFilterMenuOpen:  'false',
        visibleFields:  [],
        menuFields:[],
        anchorEl:  null,
        dataLen: 0
    });

    useEffect(()=>{
        if(Array.isArray(fields)){
            let _visibleFields = fields.filter((item) => item.isVisible !== false);
            _visibleFields.push({
                isheaderOnly: true,
                render: ()=>{
                return (
                    <CustomTableCell className={classes.column}>
                        <IconButton  className={classes.userButton}
                                     aria-owns={  'filter-column-list-grow' }
                                     aria-haspopup="true"
                                     onClick={handleFilterColumnClick}>
                            <ViewHeadlineIcon/>
                        </IconButton>
                    </CustomTableCell>
                )

            }
        });

            setState({
                visibleFields: _visibleFields,
                menuFields:  sortBy(fields, 'label')
            });
        }

    }, [fields]);

    useEffect(()=>{
        if(data && data.length){
            setState({dataLen: data.length});
        }  else {
            setState({dataLen: 0});
        }
    }, [data]);

    const onDragStart = useCallback(function onDragStart(e, row) {
        let  param = {...row, type: 'DEVICE'};
        e.dataTransfer.setData('text', JSON.stringify(param));
        e.dataTransfer.dropEffect = "copy";
        try{
            e.dataTransfer.setDragImage(e.target.querySelector('td'),  0, 0);
        } catch(ex){
          console.log(ex);
        }
    }, [visibleFields]);

    const   onTableColumnDragStart = useCallback(function  onTableColumnDragStart(e, field, index){
      let  param = {...field, sortIndex:  index, type: 'TABLE_COLUMN'};
      e.dataTransfer.setData('text', JSON.stringify(param));
      e.dataTransfer.dropEffect = "copy";

      //console.log('e.dataTransfer',  e.dataTransfer, e.target);
    }, [visibleFields]);

    const  onDragOver = useCallback(function onDragOver(ev) {
        ev.preventDefault();
        ev.dataTransfer.dropEffect = "move";
    }, [visibleFields]);

    const  onColumnDrop = useCallback(function onColumnDrop(e, field, index) {
        e.preventDefault();
        if(!dataViewName){
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
                let  originalFields = [...fields];
                let sourceField = originalFields.find(item => item && item.name === name);
                originalFields.splice(sortIndex, 1);
                originalFields.splice(index, 0, sourceField);
                onColumnReorder && onColumnReorder(originalFields);
            }
        } catch (err) {
            console.log(err);
        }
    },[visibleFields, dataViewName]);

   const  handleFilterColumnClick =  useCallback(function handleFilterColumnClick(event) {
        setState({
            anchorEl: event.currentTarget,
            columnFilterMenuOpen:  true,
        });
    }, [visibleFields, menuFields]);

    const handleFilterColumnMenuClose = useCallback(function handleFilterColumnMenuClose() {
        setState({
            columnFilterMenuOpen:  false
        });
    },[visibleFields, menuFields]);

   const  onColumnVisibiltyChange =  useCallback(function onColumnVisibiltyChange(e, fieldItem) {
        onColumnVisibiltyChanged(fieldItem);
    }, [menuFields]);

    console.log('rendering datatable')
    return (
        <div className={classes.table}  style={{ height: 400, width: '100%' }}>
            <VirtualizedTable rowCount={dataLen} orderBy={orderBy} setOrderBy={setOrderBy}  columns={visibleFields}
                              rowGetter={({ index }) => data[index] || {} }
                              handleFilterColumnClick={handleFilterColumnClick}>

            </VirtualizedTable>
        <Popper open={Boolean(columnFilterMenuOpen)} anchorEl={anchorEl} transition>
            {({TransitionProps, placement}) => (
                <Grow
                    {...TransitionProps}
                    id="filter-column-list-grow"
                    style1={{transformOrigin: placement === 'bottom' ? 'center top' : 'center bottom'}}
                >
                    <Paper>
                        <ClickAwayListener onClickAway={handleFilterColumnMenuClose}>
                            <MenuList>
                                {menuFields && menuFields.map((fieldItem, fieldIndex)=>(
                                    <MenuItem key={"table-col-filter"+ fieldIndex}  onClick={(e) => {}}>
                                        <FormControlLabel color={fieldItem.isVisible ? 'primary': 'default'}
                                            control={<Checkbox checked={fieldItem.isVisible !== false } onChange={e=> onColumnVisibiltyChange(e, fieldItem)} />}
                                            label={ fieldItem.label ||  fieldItem.name}
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

export default withStyles(styles)(DataTable_New);
