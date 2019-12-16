import { hot } from 'react-hot-loader/root'
import React, {Component, useContext, useEffect} from 'react';
import './App.scss';
import {withStyles} from "@material-ui/core";
import {theme} from "./theme";
import SignIn from "./containers/auth/SignIn";
import {Route, Switch, Link, Redirect} from "react-router-dom";
import CssBaseline from '@material-ui/core/CssBaseline';
import UserDetailsProvider, {UserDetailsContext} from "./containers/auth/AuthProvider";
import RequestAccess from "./containers/auth/RequestAccess";
import ForgotPassword from "./containers/auth/ForgotPassword";
import ConfirmPassword from "./containers/auth/ConfirmPassword";
import ChangePassword from "./containers/auth/ChangePassword";
import {SnackbarProvider} from "notistack";
import DashboardPage from './containers/dashboard';
import {amber, green} from "@material-ui/core/colors";
import ErrorBoundary from './components/ErrorBoundary/ErrorBoundary';
import GlobalDataProvider from "./containers/DataProvider/DataProvider";
import CollectionDataProvider from './components/collection/CollectionDataProvider';
import AcceptInvitation from "./containers/auth/AcceptInvitation";
import {MuiThemeProvider} from "@material-ui/core/styles";
import DateFnsUtils from '@date-io/date-fns';
import MuiPickersUtilsProvider from "@material-ui/pickers/MuiPickersUtilsProvider";
import RequestAccessSuccess from "./containers/auth/RequestAccessSuccess";
import DashboardNew from "./containers/dashboard/DashboardNew";

const notiStickStyles = (theme : any) => ({
    success: {
        backgroundColor: green[700],
        color: 'white',
    },
    error: {
        backgroundColor: theme.palette.error.dark,
        color: 'white',
    },
    info: {
        backgroundColor: theme.palette.primary.dark,
    },
    warning: {
        backgroundColor: amber[700],
    },
});


function App (props: any) {
    const  { classes} = props;
        return (
                <MuiThemeProvider theme={theme}>
                <CssBaseline />
                <SnackbarProvider classes={{
                    variantSuccess: classes.success,
                    variantError: classes.error,
                    variantWarning: classes.warning,
                    variantInfo: classes.info,
                }} autoHideDuration={3000}
                  anchorOrigin={{
                    vertical: 'top',
                    horizontal: 'center',
                }} preventDuplicate={true} maxSnack={3}>
                    <MuiPickersUtilsProvider utils={DateFnsUtils}>
                    <ErrorBoundary>
                        <GlobalDataProvider>
                            <UserDetailsProvider>
                                <RouterConfigComponent></RouterConfigComponent>
                            </UserDetailsProvider>
                        </GlobalDataProvider>
                    </ErrorBoundary>
                    </MuiPickersUtilsProvider>
                </SnackbarProvider>
            </MuiThemeProvider>
        );
}


function RouterConfigComponent() {
    const  userDetailCtx : any = useContext(UserDetailsContext);
    return (
        <React.Fragment>
            <Switch>
                <Route exact path="/login" component={SignIn} />
                <Route exact path="/request-access" component={RequestAccess} />
                <Route exact path="/request-access-success" component={RequestAccessSuccess} />
                <Route exact path="/accept-invitation/:email/:verificationCode" component={AcceptInvitation} />
                <Route exact path="/accept-invitation" component={AcceptInvitation} />
                <Route exact path="/forgot-password" component={ForgotPassword} />
                <Route exact path="/confirm-password/:email/:verificationCode" component={ConfirmPassword} />
                <Route exact path="/confirm-password" component={ConfirmPassword} />
                <Route exact path="/change-password" component={ChangePassword} />
                {userDetailCtx.user_data &&  userDetailCtx.user_data.email && (
                    <CollectionDataProvider>
                        <Route exact path="/dashboard" component={DashboardPage}></Route>
                        <Route exact path="/dashboard/:topic" component={DashboardPage}></Route>
                        <Route exact path="/dashboard/:topic/:id/:subTopic/:companyId" component={DashboardPage}></Route>
                        <Route exact path="/dashboard/:topic/:id/:subTopic" component={DashboardPage}></Route>
                        <Route exact path="/dashboard/:topic/:id" component={DashboardPage}></Route>

                        <Route exact path="/dashboardnew" component={DashboardNew}></Route>
                        <Route exact path="/dashboardnew/:topic" component={DashboardNew}></Route>
                        <Route exact path="/dashboardnew/:topic/:id/:subTopic/:companyId" component={DashboardNew}></Route>
                        <Route exact path="/dashboardnew/:topic/:id/:subTopic" component={DashboardNew}></Route>
                        <Route exact path="/dashboardnew/:topic/:id" component={DashboardNew}></Route>
                    </CollectionDataProvider>
                )}
                <Route exact path="/" component={DashboardPage} />
                <Route exact path="/dashboardnew" component={DashboardNew} />
            </Switch>
        </React.Fragment>
    )

}
//export default withStyles(notiStickStyles)(App);
export default process.env.NODE_ENV === "development" ? hot(withStyles(notiStickStyles)(App)) : withStyles(notiStickStyles)(App)
