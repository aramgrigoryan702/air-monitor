import React from 'react';
import PropTypes from 'prop-types';
import clsx from 'clsx';
import { withStyles } from '@material-ui/core/styles';
import TableCell from '@material-ui/core/TableCell';
import Paper from '@material-ui/core/Paper';
import { AutoSizer, Column, Table } from 'react-virtualized';
import TableSortLabel from "@material-ui/core/TableSortLabel";
import Tooltip from "@material-ui/core/Tooltip";
import IconButton from "@material-ui/core/IconButton";
import ViewHeadlineIcon from "@material-ui/core/SvgIcon/SvgIcon";

const styles = theme => ({
    flexContainer: {
        display: 'flex',
        alignItems: 'center',
        boxSizing: 'border-box',
    },
    tableRow: {
        cursor: 'pointer',
    },
    tableRowHover: {
        '&:hover': {
            backgroundColor: theme.palette.grey[200],
        },
    },
    tableCell: {
        flex: 1,
    },
    noClick: {
        cursor: 'initial',
    },
});

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

class MuiVirtualizedTable extends React.PureComponent {
    static defaultProps = {
        headerHeight: 48,
        rowHeight: 48,
    };

    getRowClassName = ({ index }) => {
        const { classes, onRowClick } = this.props;

        return clsx(classes.tableRow, classes.flexContainer, {
            [classes.tableRowHover]: index !== -1 && onRowClick != null,
        });
    };

    cellRenderer = ({ cellData, columnIndex, rowData }) => {
        const { columns, classes, rowHeight, onRowClick } = this.props;
        const  column = columns[columnIndex];
        console.log('cellData', cellData, columns[columnIndex]);
        if(!rowData){
            return null;
        }
        return (
            <TableCell
                component="div"
                className={clsx(classes.tableCell, classes.flexContainer, {
                    [classes.noClick]: onRowClick == null,
                })}
                variant="body"
                style={{ height: rowHeight }}
                align={(columnIndex != null && columns[columnIndex].numeric) || false ? 'right' : 'left'}
            >
                {column.render? column.render(rowData): rowData[column.name]}
            </TableCell>
        );
    };

    headerRenderer = ({ label, columnIndex }) => {
        const { headerHeight, columns, classes, orderBy, setOrderBy } = this.props;
        const  column = columns[columnIndex];
        const { name, sortName } = column;
        return (
            <TableCell
                component="div"
                className={clsx(classes.tableCell, classes.flexContainer, classes.noClick)}
                variant="head"
                style={{ height: headerHeight }}
                align={columns[columnIndex].numeric || false ? 'right' : 'left'}
            >
                <Tooltip
                    title="Sort"
                    placement={'bottom-end'}
                    enterDelay={300}
                >
                    <TableSortLabel
                        active={(orderBy.field === name || (sortName && orderBy.field === sortName)) ? true : false}
                        direction={orderBy.direction ? orderBy.direction : 'asc'}
                        onClick={() => {
                            setOrderBy({
                                field: sortName || name,
                                direction: orderBy.direction === 'asc' ? 'desc' : 'asc'
                            })
                        }}
                    >
                <span>{ label }</span>
                    </TableSortLabel>
                </Tooltip>
            </TableCell>
        );
    };

    render() {
        const { classes, columns,orderBy,handleFilterColumnClick,onRowClick,  ...tableProps } = this.props;
        return (
            <AutoSizer>
                {({ height, width }) => (
                    <Table height={height} width={width} {...tableProps} rowClassName={this.getRowClassName}>
                        {columns.map(({ name, render,sortName, ...other }, index) => {
                            return (
                                <Column
                                    key={name}
                                    sortDirection={( sortName && orderBy.field === sortName || orderBy.field === name) ? 'asc' : 'desc'}
                                    headerRenderer={headerProps =>
                                        this.headerRenderer({
                                            ...headerProps,
                                            columnIndex: index,
                                        })
                                    }
                                    className={classes.flexContainer}
                                    cellRenderer={this.cellRenderer}
                                    dataKey='name'
                                    {...other}
                                />
                            );
                        })}
                        );
                    </Table>
                )}
            </AutoSizer>
        );
    }
}

MuiVirtualizedTable.propTypes = {
    classes: PropTypes.object.isRequired,
    columns: PropTypes.arrayOf(PropTypes.object).isRequired,
    headerHeight: PropTypes.number,
    onRowClick: PropTypes.func,
    rowHeight: PropTypes.number,
};

export  const VirtualizedTable = withStyles(styles)(MuiVirtualizedTable);
