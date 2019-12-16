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

let ContextModal = React.forwardRef((props, ref) => {

    const {open, setOpen, onChangeLocation, onAutoRelocate, selectedDevice, children, classes} = props;

    function handleClose() {
        //onSubmitSuccess(false);
        setOpen(false);
    }

    function doChangeLocation(e) {
        onChangeLocation();
    }

    function doAutoRelocate(e) {
        onAutoRelocate();
    }

    return (
        <div>
            <Dialog ref={ref} maxWidth={'xs'} fullWidth={true} open={Boolean(open)} onClose={handleClose}
                    aria-labelledby="form-dialog-title">
                <DialogContent>
                    {selectedDevice && selectedDevice.isLocationLocked === false && (
                        <Button onClick={doChangeLocation}   autoFocus={true} size="small"
                                aria-label='Change Location'>
                            Change Device Location to Locked
                        </Button>
                    )}
                    {selectedDevice && selectedDevice.isLocationLocked === true && (
                    <Button onClick={doAutoRelocate}   autoFocus={true} size="small"
                            aria-label='Auto Relocate'>
                        Change Device Location to Auto Relocate
                    </Button>
                    )}
                    <Button onClick={handleClose} size="small" ariaLabel={'Cancel'}>
                        Cancel
                    </Button>
                </DialogContent>
            </Dialog>
        </div>
    )

});


export default withStyles(style)(ContextModal);