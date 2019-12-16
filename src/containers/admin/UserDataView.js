import * as React from "react";
import DataView from "../../components/DataView/DataView";
import {formatDistance, format} from "date-fns";
import DateFnsUtils from "@date-io/date-fns";
import Button from "@material-ui/core/Button";
import Toolbar from "@material-ui/core/Toolbar";
import * as classnames from "classnames";
import AddIcon from "@material-ui/core/SvgIcon/SvgIcon";
import Grid from "@material-ui/core/Grid";
import {makeStyles} from "@material-ui/core";

const dateFns = new DateFnsUtils();

const _fieldNames = [
    {
        name: 'email',
        label: 'Email',
        type: 'string',
        align: 'left',
        autoFocus: true
    },
    {
        name: 'name',
        label: 'Name',
        align: 'left',
        type: 'string',
    },
    {
        name: 'companyName',
        label: 'Company',
        align: 'left',
        type: 'string',
    }, {
        name: 'Enabled',
        label: 'Enabled',
        render: (row) => {
            if (row['Enabled']) {
                return 'Yes';
            }
            return 'No';
        }
    }, {
        name: "email_verified",
        label: 'Verified',
        render: (row) => {
            if (row['email_verified']) {
                return 'Yes';
            }
            return 'No';
        }
    }, {
        name: "UserStatus",
        label: 'Status'
    }, {
        name: "UserLastModifiedDate",
        label: 'Last modified',
        render: (row) => {
            if (row['UserLastModifiedDate']) {
                return format(new Date(row['UserLastModifiedDate']), dateFns.dateTime12hFormat);
            }
            return null;
        }
    }, {
        name: "UserCreateDate",
        label: 'Created',
        render: (row) => {
            if (row['UserCreateDate']) {
                return format(new Date(row['UserCreateDate']), dateFns.dateTime12hFormat);
            }
            return null;
        }
    }, {
        name: "actions",
        label: 'Actions',
        render: (row, index, onDispatch) => {
            if (row['Enabled']) {
                return (<React.Fragment key={'frag-' + row.sub + index}>
                        <Button key={row.sub + index} onClick={e => onDispatch('DISABLE', row)}
                                color={'secondary'}>DISABLE</Button>
                        <Button key={'changeGroup' + row.sub + index} onClick={e => onDispatch('CHANGE_GROUP', row)}
                                color={'secondary'}>CHANGE GROUP</Button>
                    </React.Fragment>
                )
            } else {
                return (<React.Fragment key={'frag-' + row.sub + index}>
                        <Button key={row.sub + index} onClick={e => onDispatch('ENABLE', row)}
                                color={'secondary'}> ENABLE</Button>
                        <Button key={'remove-' + row.sub + 'index'} onClick={e => onDispatch('REMOVE', row)}
                                color={'secondary'}> DELETE</Button>
                        <Button key={'changeGroup' + row.sub + index} onClick={e => onDispatch('CHANGE_GROUP', row)}
                                color={'secondary'}>CHANGE GROUP</Button>
                    </React.Fragment>
                )
            }

        }
    }];


const useStyle = makeStyles(theme => ({
    root: {
        backgroundColor: theme.palette.background.default,
        display: 'flex',
        flexWrap: 'wrap',
        justifyContent: 'flex-end',
        padding: 0,
        paddingRight: '10px',
        minHeight: '10px',
    },
    toolbarAddButton: {},
    exportButton: {
        padding: 0
    }
}));

const UserDataView = React.memo(function UserDataView({title, groupName, data, onDispatch}) {
    const  classes  = useStyle();

    return (
        <Grid container direction='row' alignItems="stretch" justify="space-evenly">
            <Grid item xs={12}>
                <Toolbar
                    className={classnames(classes.root)}>
                    <Button className={classes.exportButton} color='secondary'
                            align={'right'}
                            aria-label={'Send Invitation'} onClick={(e) => onDispatch({action:'SEND_INVITATION'})}>
                        <AddIcon/>
                        Send User Invitation
                    </Button>
                </Toolbar>
            </Grid>
            <Grid item xs={12}>
                <DataView onDispatchEvent={onDispatch}  hideControls={false} dataViewName={'title'} providedData={{data}}
                          useDragger={false} hideAddDataBtn={true}
                          CreatorRef={undefined}
                          EditorRef={undefined}
                          useSelection={false}
                          fieldNames={_fieldNames} title={title}>
                </DataView>
            </Grid>
        </Grid>
    )
});


export default UserDataView;