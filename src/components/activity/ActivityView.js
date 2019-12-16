import React, {useContext} from 'react';
import {Card, CardContent, CardHeader, Typography, withStyles} from "@material-ui/core";
import {activityService} from "../../services/activityService";
import DataViewMinimal from "../DataView/DataViewMinimal";
import ActivityForm from './ActivityForm';
import DateFnsUtils from "@date-io/date-fns";
import {CollectionDataContext} from "../collection/CollectionDataProvider";
import {useSnackbar} from "notistack";
import {format, formatDistance} from 'date-fns';
import {UserDetailsContext} from "../../containers/auth/AuthProvider";
import makeStyles from "@material-ui/core/styles/makeStyles";

const activityFieldNames = [{
    name: 'timestamp',
    label: 'Date',
    render: (row) => {
        if (row && row['timestamp']) {
                return format(new Date(row['timestamp']), 'MM/dd/yyyy HH:mm:ss', {awareOfUnicodeTokens: true});
        }
        return null;
    }
}, {
    name: 'userID',
    label: 'User',
}, {
    name: 'lookup.name',
    label: 'Activity',
    type: 'string'
}, {
    name: 'notes',
    label: 'Notes',
    type: 'string'
},  {
    name: 'changes',
    label: 'Changes',
    type: 'string',
    render: (row) => {
        if (row && row['changes']) {
          let changesString = [];
          let changes = row.changes;
          if(Array.isArray(changes)){
            changes.forEach((item, i)=>{
              if(item){
                const {property, from, to} = item;
                if(i=== 0){
                  changesString.push(`changed ${property} from "${from || 'NA'}" to "${to|| 'NA'}"`);
                }  else {
                  changesString.push(`${property} from "${from || 'NA'}" to "${to|| 'NA'}"`);

                }
              }
            });
            return changesString.join(', ');
          }
            return '';
        }
        return null;
    }
}];

const useStyles = makeStyles(theme => ({

    detailViewWrapper: {
        display: 'flex',
        overflow: 'auto',
        flexDirection: 'column',
        alignItems: 'stretch',
        justifyContent:'stretch',
        height:'calc(100%)',

    },
    highlightedRow: {
        borderBottom: `2px  solid ${theme.palette.secondary.light}`,
        transition: theme.transitions.create(['borderColor', 'borderWidth'], {
          easing: theme.transitions.easing.easeOut,
          duration: theme.transitions.duration.enteringScreen,
        }),
    },
    cardBody: {
        padding:'0px',
        height:'calc(100%)',
        display: 'flex',
        flexDirection:'column',
        alignItems:  'stretch',
        position:  'relative',
        justifyContent:'stretch',
        '&:last-child':{
            paddingBottom: 0,
        }
    },
    lookup: {
        paddingLeft: theme.spacing(1),
    }
}));

const ActivityView = React.memo(function ActivityView(props) {

    const classes = useStyles();
    const {user_data} = useContext(UserDetailsContext);
    const {collections, refresh} = React.useContext(CollectionDataContext);
    const {reference_id, reference_type} = props;
    const [detailData, setDetailData] = React.useState([]);
    const {enqueueSnackbar, closeSnackbar} = useSnackbar();

    React.useEffect(() => {
        if (reference_id && reference_type) {
            fetchActivities(reference_id, reference_type);
        } else {
            setDetailData(undefined);
        }
    }, [reference_id, reference_type, collections]);

    function fetchActivities(reference_id, reference_type) {
        activityService.find({
            whereCondition: {reference_id: reference_id, reference_type: reference_type},
            sort_column: 'timestamp',
            sort_order: 'desc',
            offset: 0,
            limit: 1000
        }).then((result) => {
            setDetailData(result);
        }).catch(err => {
            console.log(err);
        });
    }

    function onSubmitSuccess(result) {
        if (result && result.data && result.data.id && detailData && detailData.data) {
            let newDetailData = {...detailData};
            newDetailData.data = [result.data, ...newDetailData.data];
            if (newDetailData.paging && newDetailData.paging.count) {
                newDetailData.paging.count++;
            }
            setDetailData(newDetailData);
        } else {
            if (reference_id && reference_type) {
                fetchActivities(reference_id, reference_type);
            }
        }
        enqueueSnackbar('Activity has been saved successfully.', {variant: 'success'});
    }

    function onSubmitError(error) {
        enqueueSnackbar(error.message, {variant: 'error'});
    }


    return (
        <Card className={classes.detailViewWrapper}>
            <CardContent className={classes.cardBody}>
                {user_data && user_data.groupName !== 'VIEWER'  && (
                    <div className={classes.lookup}>
                        <ActivityForm  reference_id={reference_id} reference_type={reference_type} initialValues={{}} onSubmitSuccess={onSubmitSuccess}
                                       onSubmitError={onSubmitError}/>
                    </div>
                )}
                <DataViewMinimal highlightedRow={classes.highlightedRow} noDataFoundMessage={'No Activities found.'} providedData={detailData} classes={classes}
                                 fieldNames={activityFieldNames} title={"Activities"}>
                </DataViewMinimal>
            </CardContent>
        </Card>
    )

});


export default ActivityView;
