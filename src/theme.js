/**
 * Created by IntelliJ IDEA.
 * User: Sajib Sarkar
 * Email: thebapi@gmail.com
 * Date: 2019-04-05
 * Time: 00:17
 */

import {createMuiTheme} from '@material-ui/core/styles';

export const theme = createMuiTheme({
    palette: {
        type: 'dark',
        primary: {
            light: '#6083b0',
            main: '#305780',
            dark: '#002e53',
            contrastText: '#FFFFFF',
        },
        toolbarBG: {},
        secondary: {
            light: "#4fc890",
            main: "#009662",
            dark: '#006737',
            contrastText: '#000',
        },
        lightGreen: {
            light: "#7bfb93",
            main: "#42C764",
            dark: '#009537',
            contrastText: '#000',
        },
        canaryBlack: {
            light: "#293848",
            main: "#001221",
            dark: '#000000',
            contrastText: '#fff',
        },
        canaryYellow: {
            light: "#ffff69",
            main: "#FFD632",
            dark: '#c8a500',
            contrastText: '#000',
        },
        canaryPurple: {
            light: "#e78eff",
            main: "#ffcf44",
            dark: '#7c2bcb',
            contrastText: '#FFF',
        },
        canaryBlue: {
            light: "#a9ffff",
            main: "#72deff",
            dark: '#34accc',
            contrastText: '#000',
        },

        error: {
            light: '#ff7d47',
            main: '#e64a19',
            dark: '#ac0800',
            contrastText: '#fff',
        },
        background: {
            default: "#283237",
            paper: "#3a464f"
        },
        text: {
            disabled: "rgba(255, 255, 255, 0.6)",
            hint: "rgba(255, 255, 255, 0.6)",
            icon: "rgba(255, 255, 255, 1)",
            primary: "#fff",
            secondary: "rgba(255, 255, 255, 0.7)",
        }
    },
    palette3: {
        type: 'dark',
        primary: {
            light: '#62ecb0',
            main: '#1eb980',
            dark: '#008853',
            contrastText: '#FFFFFF',
        },
        secondary: {
            light: "#ffff77",
            main: "#ffcf44",
            dark: '#c89e00',
            contrastText: '#000',
        },
        canaryOrange: {
            light: "#ff9a86",
            main: "#ff6859",
            dark: '#c6352f',
            contrastText: '#fff',
        },
        canaryYellow: {
            light: "#ffff77",
            main: "#ffcf44",
            dark: '#c89e00',
            contrastText: '#000',
        },
        canaryPurple: {
            light: "#e78eff",
            main: "#ffcf44",
            dark: '#7c2bcb',
            contrastText: '#FFF',
        },
        canaryBlue: {
            light: "#a9ffff",
            main: "#72deff",
            dark: '#34accc',
            contrastText: '#000',
        },

        error: {
            light: '#ff7d47',
            main: '#e64a19',
            dark: '#ac0800',
            contrastText: '#fff',
        },
        background: {
            default: "#42424f",
            paper: "#33333c"
        },
        text: {
            disabled: "rgba(255, 255, 255, 0.6)",
            hint: "rgba(255, 255, 255, 0.6)",
            icon: "rgba(255, 255, 255, 1)",
            primary: "#fff",
            secondary: "rgba(255, 255, 255, 0.7)",
        }
    },
    palette1: {
        type: 'dark',
        primary: {
            light: '#62ecb0',
            main: '#1eb980',
            dark: '#008853',
            contrastText: '#FFFFFF',
        },
        secondary: {
            light: '#418b82',
            main: '#045D56',
            dark: '#00332d',
            contrastText: '#fff',
        },
        error: {
            light: '#ff7d47',
            main: '#e64a19',
            dark: '#ac0800',
            contrastText: '#fff',
        },
        background: {
            default: "#42424f",
            paper: "#33333c"
        },
        text: {
            disabled: "rgba(255, 255, 255, 0.6)",
            hint: "rgba(255, 255, 255, 0.6)",
            icon: "rgba(255, 255, 255, 1)",
            primary: "#fff",
            secondary: "rgba(255, 255, 255, 0.7)",
        }
    },
    typography: {
        // Tell Material-UI what's the font-size on the html element is.
        // htmlFontSize: 8,
        useNextVariants: true,
        fontFamily: [
            'Roboto',
            '-apple-system',
            'BlinkMacSystemFont',
            '"Segoe UI"',
            '"Helvetica Neue"',
            'Arial',
            '"Apple Color Emoji"',
            '"Segoe UI Emoji"',
            '"Segoe UI Symbol"',
        ].join(','),
        fontSize: 12,
       // htmlFontSize: 10,

    },


});