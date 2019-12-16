import React, {useContext} from 'react';
import Paper from '@material-ui/core/Paper/index';
import withStyles from '@material-ui/core/styles/withStyles';
import { UserDetailsContext} from "./AuthProvider";
import SignInForm from '../../components/auth/SigninForm';
import * as classnames from "classnames";
import {authStyles} from "../../components/auth/authStyles";
import Divider from "@material-ui/core/Divider";
import {NavLink, withRouter} from "react-router-dom";
import Button from "@material-ui/core/Button";
import BackgroundComponent from "../../components/public/BackgroundComponent";
import PublicHeader from "../../components/public/PublicHeader";

function SignIn(props) {
    const { classes, location, history } = props;
    const { login, errorMessage } = useContext(UserDetailsContext);
    return (
        <React.Fragment>
        <BackgroundComponent/>
        <PublicHeader/>
        <main className={classnames(classes.main, 'container')}>
            <Paper className={classes.paper}>
                <SignInForm
                    onSubmit={(e)=>login(e)}
                    errorMessage={errorMessage}
                    initialValues={{
                        email: location && location.state && location.state.email  || '',
                        password: '',
                    }}
                />
                <Divider variant="middle" />
                <div className={'button-container'}>
                    <Button size='small' onClick={()=> history.push('/request-access')}>Request Access</Button>
                    <Button  size='small' onClick={()=> history.push('/forgot-password')}>Forgot Password</Button>
                </div>
            </Paper>
        </main>
        </React.Fragment>
    );
}

export default withStyles(authStyles)(withRouter(SignIn));
//export default SignIn;
