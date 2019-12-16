import React, {useContext} from 'react';
import CssBaseline from '@material-ui/core/CssBaseline/index';
import Paper from '@material-ui/core/Paper/index';
import withStyles from '@material-ui/core/styles/withStyles';
import { UserDetailsContext} from "./AuthProvider";
import * as classnames from "classnames";
import ConfirmPasswordForm from "../../components/auth/ConfirmPasswordForm";
import {authStyles} from "../../components/auth/authStyles";
import BackgroundComponent from "../../components/public/BackgroundComponent";
import PublicHeader from "../../components/public/PublicHeader";
import {withRouter} from "react-router";


function ConfirmPassword(props) {
    //codeParameter
    const { classes, location, match, history } = props;
    const { confirmPassword, errorMessage } = useContext(UserDetailsContext);
    const {email, verificationCode} = match.params;
    return (
        <main className={classnames(classes.main, 'container')}>
            <BackgroundComponent/>
            <PublicHeader/>
            <CssBaseline />
            <Paper className={classes.paper}>
                <ConfirmPasswordForm
                    onSubmit={(e)=>confirmPassword(e)}
                    errorMessage={errorMessage}
                    initialValues={{
                        email: email ? unescape(email) : '',
                        verificationCode: verificationCode ? unescape(verificationCode) : '',
                    }}
                />
            </Paper>
        </main>
    );
}

export default withStyles(authStyles)(ConfirmPassword);
