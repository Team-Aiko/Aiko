import React, { useState, useEffect, useCallback } from 'react';
import Router from 'next/router';
import { alpha, makeStyles } from '@material-ui/core/styles';
import {
    Menu,
    MenuItem,
    Badge,
    InputBase,
    AppBar,
    Toolbar,
    IconButton,
    Typography,
    Button,
    ThemeProvider,
    unstable_createMuiStrictModeTheme,
} from '@material-ui/core';
import MenuIcon from '@material-ui/icons/Menu';
import SearchIcon from '@material-ui/icons/Search';
import AccountCircle from '@material-ui/icons/AccountCircle';
import MailIcon from '@material-ui/icons/Mail';
import NotificationsIcon from '@material-ui/icons/Notifications';
import MoreIcon from '@material-ui/icons/MoreVert';
import { useSelector, useDispatch } from 'react-redux';
import PropTypes from 'prop-types';
import { get } from 'axios';
import { handleSideNav } from '../../_redux/popupReducer';
import { setUserInfo } from '../../_redux/accountReducer';
import { setMember, setMemberStatus, setMemberListStatus } from '../../_redux/memberReducer';
import SideNav from './SideNav';
import router from 'next/router';
import { io } from 'socket.io-client';

// * CSS Styles
const useStyles = makeStyles((theme) => ({
    grow: {
        flexGrow: 1,
    },
    menuButton: {
        marginRight: theme.spacing(2),
    },
    title: {
        display: 'none',
        [theme.breakpoints.up('sm')]: {
            display: 'block',
        },
    },
    search: {
        position: 'relative',
        borderRadius: theme.shape.borderRadius,
        backgroundColor: alpha(theme.palette.common.white, 0.15),
        '&:hover': {
            backgroundColor: alpha(theme.palette.common.white, 0.25),
        },
        marginRight: theme.spacing(2),
        marginLeft: 0,
        width: '100%',
        [theme.breakpoints.up('sm')]: {
            marginLeft: theme.spacing(3),
            width: 'auto',
        },
    },
    searchIcon: {
        padding: theme.spacing(0, 2),
        height: '100%',
        position: 'absolute',
        pointerEvents: 'none',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
    },
    inputRoot: {
        color: 'inherit',
    },
    inputInput: {
        padding: theme.spacing(1, 1, 1, 0),
        // vertical padding + font size from searchIcon
        paddingLeft: `calc(1em + ${theme.spacing(4)}px)`,
        transition: theme.transitions.create('width'),
        width: '100%',
        [theme.breakpoints.up('md')]: {
            width: '20ch',
        },
    },
    sectionDesktop: {
        display: 'none',
        [theme.breakpoints.up('md')]: {
            display: 'flex',
        },
    },
    sectionMobile: {
        display: 'flex',
        [theme.breakpoints.up('md')]: {
            display: 'none',
        },
    },
}));

// * Container Component
export default function CComp() {
    const userInfo = useSelector((state) => state.accountReducer);
    const dispatch = useDispatch();
    const memberList = useSelector((state) => state.memberReducer);

    const handleNav = (bools) => {
        dispatch(handleSideNav(bools));
    };

    const handleLogout = () => {
        (async () => {
            try {
                const url = '/api/account/logout';
                const res = await get(url);
                const flag = res.data;

                if (!flag) throw new Error('NO_SERVER_RESPONSE');

                dispatch(
                    setUserInfo({
                        COMPANY_PK: undefined, // number
                        DEPARTMENT_PK: undefined, // number
                        COUNTRY_PK: undefined, // number
                        USER_PK: undefined, // number
                        NICKNAME: undefined, // string
                        USER_PROFILE_PK: undefined, // number
                        grants: [],
                    }),
                );
                dispatch(setMember([]));

                Router.push('/');
            } catch (e) {
                console.log(e);
            }
        })();
    };

    return <PComp handleSideNav={handleNav} userInfo={userInfo} handleLogout={handleLogout} />;
}

// * Presentational component
function PComp(props) {
    const classes = useStyles();
    const theme = unstable_createMuiStrictModeTheme();
    const [anchorEl, setAnchorEl] = React.useState(null);
    const [mobileMoreAnchorEl, setMobileMoreAnchorEl] = React.useState(null);
    const isMenuOpen = Boolean(anchorEl);
    const isMobileMenuOpen = Boolean(mobileMoreAnchorEl);
    const { userInfo } = props;
    const { USER_PK } = userInfo;
    const [status, setStatus] = useState(undefined);
    const memberList = useSelector((state) => state.memberReducer);
    const dispatch = useDispatch();

    useEffect(() => {
        console.log('memberList : ', memberList);
    }, [memberList]);

    useEffect(() => {
        if (userInfo) {
            const status = io('http://localhost:5000/status');
            setStatus(status);

            const uri = '/api/account/raw-token';
            get(uri)
                .then((response) => {
                    status.emit('handleConnection', response.data.result);
                })
                .catch((err) => {
                    console.error('handleConnection - error : ', err);
                });
            status.on('client/status/getStatusList', (payload) => {
                dispatch(setMemberListStatus(payload));
            });
            status.on('client/status/loginAlert', (payload) => {
                dispatch(setMemberStatus(payload.user));
            });
            status.on('client/status/logoutAlert', (payload) => {
                dispatch(setMemberStatus(payload));
            });
            status.on('client/status/error', (err) => {
                console.error('status - error : ', err);
            });
            status.on('client/status/changeStatus', (payload) => {
                console.log('🚀 ~ file: index.js ~ line 53 ~ useEffect ~ payload', payload);
            });
        }
    }, [userInfo]);

    const handleProfileMenuOpen = (event) => {
        setAnchorEl(event.currentTarget);
    };

    const handleMobileMenuClose = () => {
        setMobileMoreAnchorEl(null);
    };

    const handleMenuClose = () => {
        setAnchorEl(null);
        handleMobileMenuClose();
    };

    const handleLogout = () => {
        setAnchorEl(null);
        handleMobileMenuClose();
        if (status) {
            status.disconnect();
        }
        props.handleLogout();
    };

    const handleMobileMenuOpen = (event) => {
        setMobileMoreAnchorEl(event.currentTarget);
    };

    const handleSignup = useCallback(() => {
        Router.push('/signup');
    }, []);

    const handleLogin = useCallback(() => {
        Router.push('/login');
    }, []);

    const handleSNav = useCallback(() => {
        props.handleSideNav(true);
    }, []);

    const goToAdmin = () => {
        Router.push('/admin');
    };

    const goToMyMemberInfo = () => {
        router.push(`/member-info/${userInfo.NICKNAME}`);
        setAnchorEl(null);
        handleMobileMenuClose();
    };

    const menuId = 'primary-search-account-menu';
    const renderMenu = (
        <Menu
            anchorEl={anchorEl}
            anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
            id={menuId}
            keepMounted
            transformOrigin={{ vertical: 'top', horizontal: 'right' }}
            open={isMenuOpen}
            onClose={handleMenuClose}
        >
            <MenuItem onClick={goToMyMemberInfo}>Profile</MenuItem>
            <MenuItem onClick={handleMenuClose}>My account</MenuItem>
            <MenuItem onClick={handleLogout}>Logout</MenuItem>
        </Menu>
    );

    const mobileMenuId = 'primary-search-account-menu-mobile';
    const renderMobileMenu = (
        <Menu
            anchorEl={mobileMoreAnchorEl}
            anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
            id={mobileMenuId}
            keepMounted
            transformOrigin={{ vertical: 'top', horizontal: 'right' }}
            open={isMobileMenuOpen}
            onClose={handleMobileMenuClose}
        >
            <MenuItem>
                <IconButton aria-label='show 4 new mails' color='inherit'>
                    <Badge badgeContent={4} color='secondary'>
                        <MailIcon />
                    </Badge>
                </IconButton>
                <p>Messages</p>
            </MenuItem>
            <MenuItem>
                <IconButton aria-label='show 11 new notifications' color='inherit'>
                    <Badge badgeContent={11} color='secondary'>
                        <NotificationsIcon />
                    </Badge>
                </IconButton>
                <p>Notifications</p>
            </MenuItem>
            {USER_PK ? (
                <MenuItem onClick={handleProfileMenuOpen}>
                    <IconButton
                        aria-label='account of current user'
                        aria-controls='primary-search-account-menu'
                        aria-haspopup='true'
                        color='inherit'
                    >
                        <AccountCircle />
                    </IconButton>
                    <p>Profile</p>
                </MenuItem>
            ) : null}
        </Menu>
    );
    const accountBtns = (
        <>
            <Button variant='contained' color='secondary' onClick={handleSignup}>
                Signup
            </Button>
            <Button variant='contained' onClick={handleLogin}>
                Login
            </Button>
        </>
    );

    return (
        <div className={classes.grow}>
            <ThemeProvider theme={theme}>
                <AppBar position='static'>
                    <Toolbar>
                        <IconButton
                            edge='start'
                            className={classes.menuButton}
                            color='inherit'
                            aria-label='open drawer'
                            onClick={handleSNav}
                        >
                            <MenuIcon />
                        </IconButton>
                        <Typography className={classes.title} variant='h6' noWrap>
                            Aiko
                        </Typography>
                        <div className={classes.search}>
                            <div className={classes.searchIcon}>
                                <SearchIcon />
                            </div>
                            <InputBase
                                placeholder='Search…'
                                classes={{
                                    root: classes.inputRoot,
                                    input: classes.inputInput,
                                }}
                                inputProps={{ 'aria-label': 'search' }}
                            />
                        </div>
                        <div className={classes.grow} />

                        {USER_PK ? (
                            <>
                                <div className={classes.sectionDesktop}>
                                    <IconButton aria-label='show 4 new mails' color='inherit'>
                                        <Badge badgeContent={4} color='secondary'>
                                            <MailIcon />
                                        </Badge>
                                    </IconButton>
                                    <IconButton aria-label='show 17 new notifications' color='inherit'>
                                        <Badge badgeContent={17} color='secondary'>
                                            <NotificationsIcon />
                                        </Badge>
                                    </IconButton>
                                    <IconButton
                                        edge='end'
                                        aria-label='account of current user'
                                        aria-controls={menuId}
                                        aria-haspopup='true'
                                        onClick={handleProfileMenuOpen}
                                        color='inherit'
                                    >
                                        <AccountCircle />
                                    </IconButton>
                                </div>
                                <div className={classes.sectionMobile}>
                                    <IconButton
                                        aria-label='show more'
                                        aria-controls={mobileMenuId}
                                        aria-haspopup='true'
                                        onClick={handleMobileMenuOpen}
                                        color='inherit'
                                    >
                                        <MoreIcon />
                                    </IconButton>
                                </div>
                            </>
                        ) : (
                            <>
                                <div className={classes.sectionDesktop}>{accountBtns}</div>
                                <div className={classes.sectionMobile}>{accountBtns}</div>
                            </>
                        )}
                    </Toolbar>
                </AppBar>
                {renderMobileMenu}
                {renderMenu}
                <SideNav />
            </ThemeProvider>
        </div>
    );
}

PComp.propTypes = {
    userInfo: PropTypes.object.isRequired,
    handleSideNav: PropTypes.func.isRequired,
    handleLogout: PropTypes.func.isRequired,
};
