import React, {useContext} from 'react';
import CssBaseline from '@material-ui/core/CssBaseline/index';
import Paper from '@material-ui/core/Paper/index';
import withStyles from '@material-ui/core/styles/withStyles';
import { UserDetailsContext} from "./AuthProvider";
import * as classnames from "classnames";
import SignupForm from "../../components/auth/RequestAccessForm";
import {authStyles} from "../../components/auth/authStyles";
import Divider from "@material-ui/core/Divider";
import Button from "@material-ui/core/Button";
import BackgroundComponent from "../../components/public/BackgroundComponent";
import PublicHeader from "../../components/public/PublicHeader";

function RequestAccess(props) {
    const { classes , history} = props;
    const { signup, errorMessage } = useContext(UserDetailsContext);
    return (
        <main className={classnames(classes.main, 'container')}>
            <BackgroundComponent/>
            <PublicHeader/>
            <CssBaseline />
            <Paper className={classes.paper}>
                <SignupForm
                    onSubmit={(e)=>signup(e)}
                    errorMessage={errorMessage}
                    initialValues={{
                        email: '',
                        name: '',
                        organization: '',
                        phone: '',
                    }}
                />
                <Divider variant="middle" />
                <div className={'button-container'}>
                    <Button size={'small'} onClick={()=> history.push('/login')}>Sign in</Button>
                    <Button  size={'small'} onClick={()=> history.push('/forgot-password')}>Forgot Password</Button>
                </div>

            </Paper>
        </main>
    );
}

export default withStyles(authStyles)(RequestAccess);
//export default SignIn;
