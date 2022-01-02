import React, { useState, useEffect, useCallback } from 'react';
import Router from 'next/router';
import styles from '../../styles/components/TopNav.module.css';
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
    Collapse,
    Avatar,
} from '@material-ui/core';
import MenuIcon from '@material-ui/icons/Menu';
import SearchIcon from '@material-ui/icons/Search';
import AccountCircle from '@material-ui/icons/AccountCircle';
import MailIcon from '@material-ui/icons/Mail';
import NotificationsIcon from '@material-ui/icons/Notifications';
import MoreIcon from '@material-ui/icons/MoreVert';
import { useSelector, useDispatch } from 'react-redux';
import PropTypes from 'prop-types';
import { get } from '../../_axios/index';
import axios from 'axios';
import { handleSideNav } from '../../_redux/popupReducer';
import { setUserInfo, resetUserInfo } from '../../_redux/accountReducer';
import { setMember, setMemberStatus, setMemberListStatus } from '../../_redux/memberReducer';
import SideNav from './SideNav';
import router from 'next/router';
import { io } from 'socket.io-client';
import { ExpandLess, ExpandMore, StarBorder } from '@material-ui/icons';

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
    const classes = useStyles();
    const theme = unstable_createMuiStrictModeTheme();
    const [anchorEl, setAnchorEl] = React.useState(null);
    const [mobileMoreAnchorEl, setMobileMoreAnchorEl] = React.useState(null);
    const isMenuOpen = Boolean(anchorEl);
    const isMobileMenuOpen = Boolean(mobileMoreAnchorEl);
    const { USER_PK } = userInfo;
    const [status, setStatus] = useState(undefined);
    const [statusMenuOpen, setStatusMenuOpen] = useState(false);

    useEffect(() => {
        if (userInfo.USER_PK) {
            console.log('###### render ######');

            (async () => {
                const loadMember = await loadMemberList();

                if (loadMember) {
                    const status = io('http://localhost:5001/status', { withCredentials: true });
                    setStatus(status);

                    status.emit('handleConnection');
                    status.on('client/status/getStatusList', (payload) => {
                        console.log('### getStatusList ### : ', payload);
                        dispatch(setMemberListStatus(payload));
                        for (const row of payload) {
                            if (row.userPK === userInfo.USER_PK) {
                                dispatch(setUserInfo({ status: row.status }));
                            }
                        }
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
                        dispatch(setMemberStatus(payload));
                    });
                    status.on('client/status/logoutEventExecuted', () => {
                        status.emit('handleDisconnect');
                    });
                }
            })();
        }
    }, [userInfo.USER_PK]);

    const handleLogout = () => {
        setAnchorEl(null);
        handleMobileMenuClose();
        if (status) {
            status.emit('server/status/logoutEvent');

            (async () => {
                try {
                    const url = '/api/account/logout';
                    const result = await get(url);

                    if (!result) throw new Error('NO_SERVER_RESPONSE');

                    dispatch(resetUserInfo());
                    dispatch(setMember([]));

                    Router.push('/');
                } catch (e) {
                    console.error(e);
                }
            })();
        }
    };

    const loadMemberList = () => {
        const url = '/api/company/member-list';

        return get(url)
            .then((result) => {
                if (result === 2) {
                    dispatch(resetUserInfo());

                    return false;
                }
                const excludeMe = result.filter((row) => row.USER_PK !== userInfo.USER_PK);
                dispatch(setMember(excludeMe));

                return true;
            })
            .catch((error) => {
                console.error(error);
                return false;
            });
    };

    const statusList = [
        {
            status: 1,
            onClick: () => {
                status.emit('server/status/changeStatus', 1);
                dispatch(setUserInfo({ status: 1 }));
                setStatusMenuOpen(false);
            },
            view: '온라인',
            color: '#2196f3',
        },
        {
            status: 2,
            onClick: () => {
                status.emit('server/status/changeStatus', 2);
                dispatch(setUserInfo({ status: 2 }));
                setStatusMenuOpen(false);
            },
            view: '부재중',
            color: '#ffe082',
        },
        {
            status: 3,
            onClick: () => {
                status.emit('server/status/changeStatus', 3);
                dispatch(setUserInfo({ status: 3 }));
                setStatusMenuOpen(false);
            },
            view: '바쁨',
            color: '#e91e63',
        },
        {
            status: 4,
            onClick: () => {
                status.emit('server/status/changeStatus', 4);
                dispatch(setUserInfo({ status: 4 }));
                setStatusMenuOpen(false);
            },
            view: '회의중',
            color: '#26a69a',
        },
    ];

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
        dispatch(handleSideNav(true));
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
            <MenuItem
                onClick={() => {
                    setStatusMenuOpen(!statusMenuOpen);
                }}
            >
                {statusList.map((row) => {
                    return row.status === userInfo.status ? (
                        <div key={row.status} style={{ display: 'flex', alignItems: 'center' }}>
                            <div className={styles.status} style={{ backgroundColor: row.color }}></div>
                            {row.view}
                            {statusMenuOpen ? <ExpandLess /> : <ExpandMore />}
                        </div>
                    ) : null;
                })}
            </MenuItem>
            <Collapse in={statusMenuOpen} timeout='auto' unmountOnExit>
                {statusList.map((row) => {
                    return row.status !== userInfo.status ? (
                        <MenuItem style={{ paddingLeft: '20px' }} onClick={row.onClick} key={row.status}>
                            <div className={styles.status} style={{ backgroundColor: row.color }}></div>
                            {row.view}
                        </MenuItem>
                    ) : null;
                })}
            </Collapse>
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
            <MenuItem
                onClick={() => {
                    setStatusMenuOpen(!statusMenuOpen);
                }}
            >
                <IconButton
                    edge='end'
                    aria-label='account of current user'
                    aria-controls={menuId}
                    aria-haspopup='true'
                    color='inherit'
                >
                    <Avatar
                        src={
                            userInfo.USER_PROFILE_PK
                                ? `/api/store/download-profile-file?fileId=${userInfo.USER_PROFILE_PK}`
                                : null
                        }
                        style={{ width: '24px', height: '24px' }}
                    />
                    {statusList.map((row) =>
                        row.status === userInfo.status ? (
                            <div
                                key={row.status}
                                className={styles['status-badge']}
                                style={{ backgroundColor: row.color }}
                            ></div>
                        ) : null,
                    )}
                </IconButton>
                {statusList.map((row) => {
                    return row.status === userInfo.status ? (
                        <div className={styles['mobile-status']} key={row.status}>
                            {row.view}
                            {statusMenuOpen ? <ExpandLess /> : <ExpandMore />}
                        </div>
                    ) : null;
                })}
            </MenuItem>
            <Collapse in={statusMenuOpen} timeout='auto' unmountOnExit>
                {statusList.map((row) => {
                    return row.status !== userInfo.status ? (
                        <MenuItem style={{ paddingLeft: '20px' }} onClick={row.onClick} key={row.status}>
                            <div className={styles.status} style={{ backgroundColor: row.color }}></div>
                            {row.view}
                        </MenuItem>
                    ) : null;
                })}
            </Collapse>
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
                <MenuItem onClick={goToMyMemberInfo}>
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
                                        <Avatar
                                            src={
                                                userInfo.USER_PROFILE_PK
                                                    ? `/api/store/download-profile-file?fileId=${userInfo.USER_PROFILE_PK}`
                                                    : null
                                            }
                                            style={{ width: '24px', height: '24px' }}
                                        />
                                        {statusList.map((row) =>
                                            row.status === userInfo.status ? (
                                                <div
                                                    key={row.status}
                                                    className={styles['status-badge']}
                                                    style={{ backgroundColor: row.color }}
                                                ></div>
                                            ) : null,
                                        )}
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
