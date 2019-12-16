export  const authStyles = theme => ({
    main: {
        display: 'flex', // Fix IE 11 issue.
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100%',
       // background:  'linear-gradient(to bottom, rgba(245, 246, 252, 0.52), rgba(117, 19, 93, 0.73)), url('+bg+')',
       // backgroundSize: 'cover',
       // backgroundPosition: 'center',
        [theme.breakpoints.up(400 + theme.spacing(1) * 3 * 2)]: {
            minWidth: '400px',
        }
    },
    paper: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        opacity:'.9',
        padding: `${theme.spacing(2)}px ${theme.spacing(3)}px ${theme.spacing(3)}px`,
    },
    avatar: {
        margin: theme.spacing(1),
        backgroundColor: theme.palette.secondary.main,
        color: theme.palette.text.primary,
    },
    form: {
        width: '100%', // Fix IE 11 issue.
        minWidth: '350px',
        marginTop: theme.spacing(1),
    },
    submit: {
        marginTop: theme.spacing(1),
    },
});
