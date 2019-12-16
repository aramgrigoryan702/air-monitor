import React, {useContext} from 'react';
import CssBaseline from '@material-ui/core/CssBaseline/index';
import Paper from '@material-ui/core/Paper/index';
import withStyles from '@material-ui/core/styles/withStyles';
import { UserDetailsContext} from "./AuthProvider";
import * as classnames from "classnames";
import {authStyles} from "../../components/auth/authStyles";
import Divider from "@material-ui/core/Divider";
import Button from "@material-ui/core/Button";
import BackgroundComponent from "../../components/public/BackgroundComponent";
import PublicHeader from "../../components/public/PublicHeader";
import AcceptInvitationForm from "../../components/auth/AcceptInvitationForm";

function AcceptInvitation(props) {
    const { classes , history, match} = props;
    const { join, errorMessage } = useContext(UserDetailsContext);
    const { email, verificationCode} = match.params;

    return (
        <main className={classnames(classes.main, 'container')}>
            <BackgroundComponent/>
            <PublicHeader/>
            <CssBaseline />
            <Paper className={classes.paper}>
                <AcceptInvitationForm
                    onSubmit={(e)=>join(e)}
                    errorMessage={errorMessage}
                    initialValues={{
                        email: email ? unescape(email) : '',
                        name: '',
                        password: verificationCode ? unescape(verificationCode) : '',
                        rePassword: '',
                    }}
                />
                <Divider variant="middle" />
                <div className={'button-container'}>
                    <Button size='small' onClick={()=> history.push('/request-access')}>Request Access</Button>
                    <Button  size='small' onClick={()=> history.push('/forgot-password')}>Forgot Password</Button>
                </div>

            </Paper>
        </main>
    );
}

export default withStyles(authStyles)(AcceptInvitation);
//export default SignIn;
