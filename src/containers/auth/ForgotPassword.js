import React, {useContext} from 'react';
import CssBaseline from '@material-ui/core/CssBaseline/index';
import Paper from '@material-ui/core/Paper/index';
import withStyles from '@material-ui/core/styles/withStyles';
import { UserDetailsContext} from "./AuthProvider";
import * as classnames from "classnames";
import ForgotPasswordForm from "../../components/auth/ForgotPasswordForm";
import {authStyles} from "../../components/auth/authStyles";
import Divider from "@material-ui/core/Divider";
import Button from "@material-ui/core/Button";
import {withRouter} from "react-router";
import BackgroundComponent from "../../components/public/BackgroundComponent";
import PublicHeader from "../../components/public/PublicHeader";


function ForgotPassword(props) {
    const { classes, history } = props;
    const { forgotPassword, errorMessage } = useContext(UserDetailsContext);
    return (
        <main className={classnames(classes.main, 'container')}>
            <BackgroundComponent/>
            <PublicHeader/>
            <CssBaseline />
            <Paper className={classes.paper}>
                <ForgotPasswordForm
                    onSubmit={(e)=>forgotPassword(e)}
                    errorMessage={errorMessage}
                    initialValues={{}}
                />
                <Divider variant="middle" />
                <div className={'button-container'}>
                    <Button size='small' onClick={()=> history.push('/request-access')}>Request Access</Button>
                    <Button  size='small' onClick={()=> history.push('/login')}>Sign in</Button>
                </div>
            </Paper>
        </main>
    );
}

export default withStyles(authStyles)(withRouter(ForgotPassword));
//export default SignIn;
