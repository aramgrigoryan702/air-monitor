import React from "react";
import Dialog from "@material-ui/core/Dialog";
import {DialogTitle, Paper, withStyles} from "@material-ui/core";
import Typography from "@material-ui/core/Typography";
import DialogContent from "@material-ui/core/DialogContent";
import DialogActions from "@material-ui/core/DialogActions";
import Button from "@material-ui/core/Button";

const style = theme => ({
    paper: {
        width: '100%',
        height: '100%',
        backgroundColor: theme.palette.secondary.main,
        color: theme.palette.text.primary,
    },
});

let ConfirmationModal = React.forwardRef((props, ref) => {

    const {open, setOpen, onSubmitSuccess, children, classes} = props;


    function handleClose() {
        //onSubmitSuccess(false);
        setOpen(false);
    }

    function doSubmit(e) {
        onSubmitSuccess(true);
    }

    return (
        <div>
            <Dialog ref={ref} maxWidth={'xs'} fullWidth={true} open={Boolean(open)} onClose={handleClose}
                    aria-labelledby="form-dialog-title">
                <DialogTitle>
                        Confirmation
                </DialogTitle>
                <DialogContent>
                    <Typography fontSize='small' variant="body2">
                        {children}
                    </Typography>
                </DialogContent>
                <DialogActions>
                    <Button onClick={doSubmit} variant='contained' color='primary' autoFocus={true} size="small"
                            aria-label='Yes'>
                        Yes
                    </Button>
                    <Button onClick={handleClose} size="small" ariaLabel={'Cancel'}>
                        No
                    </Button>
                </DialogActions>
            </Dialog>
        </div>
    )

});


export default withStyles(style)(ConfirmationModal);