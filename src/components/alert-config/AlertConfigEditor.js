import React, {useContext, useEffect, useReducer} from 'react';
import Dialog from "@material-ui/core/Dialog";
import DialogContent from "@material-ui/core/DialogContent";
import AlertConfigForm from "./AlertConfigForm";
import {alertConfigService} from "../../services/alertConfigService";
import {last} from 'lodash';
import {useSnackbar} from "notistack";
import {DialogTitle} from "@material-ui/core";
import Typography from "@material-ui/core/Typography";



function reducer(currentState, newState) {
    return {...currentState, ...newState};
}

function useAlerConfigEditor({companyId, setOpen}) {
    const {enqueueSnackbar, closeSnackbar} = useSnackbar();

    const [{alertConfig}, setState] = useReducer(reducer, {
        alertConfig: undefined,
    });
    React.useEffect(()=>{
        if(companyId){
            fetchConfigData(companyId);
            return ()=> {
                setState({
                    alertConfig: undefined
                });
            }
        }
    }, [companyId]);


    function fetchConfigData(companyId) {
        alertConfigService.find({companyId: companyId}).then((configData)=>{
            if(configData && configData.data && configData.data.length > 0){
                // eslint-disable-next-line no-undef
                let _alertConfig = last(configData.data);
                setState({
                    alertConfig: _alertConfig
                });
            } else {
                setState({
                    alertConfig: { company_id:  companyId}
                })
            }
        });
    }
    function onSubmitSuccess(submittedData) {
        if(companyId){
            fetchConfigData(companyId);
        }
        enqueueSnackbar('Config has been saved successfully.', {variant: "success"});
        setOpen(false);
    }

    function onSubmitError(error) {
        enqueueSnackbar(error.message, {variant: "error"});
    }

    function onDeleteSuccess() {
        enqueueSnackbar('Config has been removed successfully.', {variant: "success"});
        setOpen(false);
    }

    return {
        alertConfig,
        onSubmitSuccess,
        onSubmitError,
        onDeleteSuccess,
    }
}

const AlertConfigEditor = React.memo(function ({open, setOpen, companyId}) {

    const {alertConfig, onSubmitSuccess, onSubmitError, onDeleteSuccess} = useAlerConfigEditor({open, setOpen, companyId});

    return (<div>
        <Dialog maxWidth={'md'} style={{minHeight: '281px'}} fullWidth={true} open={Boolean(open)} onClose={e=>setOpen(false)} aria-labelledby="form-dialog-title">
            <DialogContent>
                <DialogTitle>
                    <Typography>
                        Alert Config Editor
                    </Typography>
                </DialogTitle>
                {alertConfig && (
                    <AlertConfigForm onDeleteSuccess={onDeleteSuccess} onSubmitError={onSubmitError} onSubmitSuccess={onSubmitSuccess} setOpen={setOpen} initialValues={alertConfig}></AlertConfigForm>
                )}
            </DialogContent>
        </Dialog>
    </div>)
});


export default AlertConfigEditor;