import React, {useState} from "react";
import {withStyles} from "@material-ui/core";
import TableCell from "@material-ui/core/TableCell";
import TableHead from "@material-ui/core/TableHead";
import TableRow from "@material-ui/core/TableRow";
import Tooltip from "@material-ui/core/Tooltip";
import TableSortLabel from "@material-ui/core/TableSortLabel";
import TableBody from "@material-ui/core/TableBody";
import Table from "@material-ui/core/Table";
import * as classnames from "classnames";
import { differenceInMinutes } from 'date-fns';

const CustomTableCell = withStyles(theme => ({
    head: {
        backgroundColor: theme.palette.canaryBlack.main,
        color: theme.palette.common.white,
        padding:0,
        paddingLeft:  '10px',
        height: '30px',
    },
    body: {
        fontSize: 12,
        padding:0,
        paddingLeft:  '10px'

    },
}))(TableCell);

const CustomTableHeaderCell = withStyles(theme => ({
    head: {
        backgroundColor: theme.palette.common.black,
        color: theme.palette.common.white,
        height: '15px',
        padding:2,
        paddingLeft:  '10px',
        position: 'sticky',
        top: 0,
        zIndex: 100,
    },
    body: {
        fontSize: 12,
        padding:0,
        paddingLeft:  '10px'
    },
}))(TableCell);

const styles = theme => ({
    root: {
        width: '100%',
        margin: '0px',
        overflowX: 'auto',
    },
    container:{
        overflow: "auto",
        height: 'calc(100%)',
        maxHeight: 'calc(100%)',
        //height: '200px',
        position: "relative",
        display: 'flex',
        alignItems: 'stretch',
        justifyContent:'stretch',
    },
    table: {
        width: 'calc(100%)',
        maxWidth: 'calc(100%)',
        minHeight: '100px',
        // padding: theme.spacing.unit * 23
        //minWidth: 500,
    },
    headerRow:{
        height: '20px',
    },
    row: {
      //  height: '30px',
        padding: 2,
        '&:nth-of-type(odd)': {
            backgroundColor: theme.palette.background.default,
        },
        height: '30px'
    },
    column:{
        whiteSpace: 'nowrap',
        padding:0,
        paddingLeft:  '10px'

    },
});

const DataTableMinimal = React.memo(function DataTableMinimal({classes, fields, data,  highlightedRow, orderBy, setOrderBy, onRowDoubleClick, noDataFoundMessage}) {

    return (
        <div className={classes.container}>
        <Table className={classes.table} aria-labelledby="tableTitle">
            <TableHead>
                <TableRow  className={classes.headerRow}>
                    {fields && fields.map((field, fieldIndex) => (
                        <CustomTableHeaderCell component="th"  align="left" key={field.name}
                                         sortDirection={orderBy.field === field.name ? 'asc' : 'desc'}>
                            <Tooltip
                                title="Sort"
                                placement={'bottom-end'}
                                enterDelay={300}
                            >
                                <TableSortLabel
                                    active={orderBy.field === field.name ? true : false}
                                    direction={orderBy.direction ? orderBy.direction : 'asc'}
                                    onClick={() => {
                                        setOrderBy({
                                            field: field.name,
                                            direction: orderBy.direction === 'asc' ? 'desc' : 'asc'
                                        })
                                    }}
                                >
                                    {field.label}
                                </TableSortLabel>
                            </Tooltip>
                        </CustomTableHeaderCell>
                    ))}
                </TableRow>
            </TableHead>
            <TableBody>
                {data && !data.length && (
                    <TableRow >
                        <CustomTableCell className={classes.row} colSpan={fields.length+1}>
                            {noDataFoundMessage ? noDataFoundMessage : 'No data Available'}
                        </CustomTableCell>
                    </TableRow>
                )}
                {data  && data.length > 0 && data.map((row, rowIndex) => (
                    <TableRow className={classnames(classes.row,   row['timestamp'] && differenceInMinutes(new Date(), new Date(row['timestamp'])) < 1 &&  highlightedRow )} key={'row_' + rowIndex}
                              onDoubleClick={(e) => onRowDoubleClick(row)}>
                        {fields && fields.map((field, fieldIndex) => (
                            <CustomTableCell  className={classes.column} component="td" scope="row"
                                             key={'col-' + row.id + '_' + rowIndex + '-' + fieldIndex}>
                                { typeof field.render === 'function' ? field.render(row) :  row[field.name]}
                            </CustomTableCell>
                        ))}
                    </TableRow>
                ))}

            </TableBody>
        </Table>
        </div>
    )
});

export default withStyles(styles)(DataTableMinimal);
