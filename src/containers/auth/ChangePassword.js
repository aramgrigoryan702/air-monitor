import React, {useContext} from 'react';
import CssBaseline from '@material-ui/core/CssBaseline/index';
import Paper from '@material-ui/core/Paper/index';
import withStyles from '@material-ui/core/styles/withStyles';
import { UserDetailsContext} from "./AuthProvider";
import * as classnames from "classnames";
import ChangePasswordForm from "../../components/auth/ChangePasswordForm";
import {authStyles} from "../../components/auth/authStyles";

function ChangePassword(props) {

    const { classes } = props;
    const { changePassword, errorMessage } = useContext(UserDetailsContext);
    return (
        <main className={classnames(classes.main, 'container')}>
            <Paper className={classes.paper}>
                <ChangePasswordForm
                    onSubmit={(e)=>changePassword(e)}
                    errorMessage={errorMessage}
                    initialValues={{
                    }}
                />
            </Paper>
        </main>
    );
}

export default withStyles(authStyles)(ChangePassword);