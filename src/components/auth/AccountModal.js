import React, {useContext} from 'react';
import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import ChangePasswordForm from "./ChangePasswordForm";
import {UserDetailsContext} from "../../containers/auth/AuthProvider";

function AccountModal(props) {

    const {open, setOpen} = props;
    const { changePassword, errorMessage } = useContext(UserDetailsContext);
    function handleClickOpen() {
        setOpen(true);
    }

    function handleClose() {
        setOpen(false);
    }

    async function  doSubmit(e){
        let  result = await changePassword(e);
        setOpen(false);
    }

    return (
        <div>
            <Dialog maxWidth={'xs'} fullWidth={true} open={Boolean(open)} onClose={handleClose} aria-labelledby="form-dialog-title">
                <DialogContent>
                    <ChangePasswordForm
                        onSubmit={(e)=>doSubmit(e)}
                        errorMessage={errorMessage}
                        initialValues={{
                        }}
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleClose}>
                        Cancel
                    </Button>
                </DialogActions>
            </Dialog>
        </div>
    );
}

export default AccountModal;