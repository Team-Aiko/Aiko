import React, { useState, useEffect, useCallback } from 'react';
import Router from 'next/router';
import { alpha, makeStyles } from '@material-ui/core/styles';
import { Menu, MenuItem, Badge, InputBase, AppBar, Toolbar, IconButton, Typography, Button } from '@material-ui/core';
import MenuIcon from '@material-ui/icons/Menu';
import SearchIcon from '@material-ui/icons/Search';
import AccountCircle from '@material-ui/icons/AccountCircle';
import MailIcon from '@material-ui/icons/Mail';
import NotificationsIcon from '@material-ui/icons/Notifications';
import MoreIcon from '@material-ui/icons/MoreVert';
import { handleSideNav } from '../../_redux/popupReducer';
import { useSelector, useDispatch } from 'react-redux';
import SideNav from './SideNav';

// * CSS Styles
const useStyles = makeStyles(theme => ({
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
    const sideNavIsOpen = useSelector(state => state.popupReducer.sideNavIsOpen);
    const userInfo = useSelector(state => state.accountReducer);
    console.log('🚀 ~ file: TopNav.js ~ line 84 ~ CComp ~ userInfo', userInfo);
    const dispatch = useDispatch();

    const handleSideNav = bools => {
        dispatch(handleSideNav(bools));
    };

    return <PComp sideNavIsOpen={sideNavIsOpen} handleSideNav={handleSideNav} userInfo={userInfo} />;
}

// * Presentational component
function PComp(props) {
    const classes = useStyles();
    const [anchorEl, setAnchorEl] = React.useState(null);
    const [mobileMoreAnchorEl, setMobileMoreAnchorEl] = React.useState(null);
    const isMenuOpen = Boolean(anchorEl);
    const isMobileMenuOpen = Boolean(mobileMoreAnchorEl);
    const userPk = props.userInfo.USER_PK;
    console.log('🚀 ~ file: TopNav.js ~ line 101 ~ PComp ~ userPk', userPk);

    const handleProfileMenuOpen = event => {
        setAnchorEl(event.currentTarget);
    };

    const handleMobileMenuClose = () => {
        setMobileMoreAnchorEl(null);
    };

    const handleMenuClose = () => {
        setAnchorEl(null);
        handleMobileMenuClose();
    };

    const handleMobileMenuOpen = event => {
        setMobileMoreAnchorEl(event.currentTarget);
    };

    const handleSignup = useCallback(() => {
        Router.push('/signup');
    }, []);

    const handleLogin = useCallback(() => {
        Router.push('/login');
    }, []);

    const handleSideNav = useCallback(() => {
        props.handleSideNav(true);
    }, []);

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
            <MenuItem onClick={handleMenuClose}>Profile</MenuItem>
            <MenuItem onClick={handleMenuClose}>My account</MenuItem>
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
            {userPk ? (
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
        <React.Fragment>
            <Button variant='contained' color='secondary' onClick={handleSignup}>
                Signup
            </Button>
            <Button variant='contained' onClick={handleLogin}>
                Login
            </Button>
        </React.Fragment>
    );

    return (
        <div className={classes.grow}>
            <AppBar position='static'>
                <Toolbar>
                    <IconButton
                        edge='start'
                        className={classes.menuButton}
                        color='inherit'
                        aria-label='open drawer'
                        onClick={handleSideNav}
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

                    {userPk ? (
                        <React.Fragment>
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
                        </React.Fragment>
                    ) : (
                        <React.Fragment>
                            <div className={classes.sectionDesktop}>{accountBtns}</div>
                            <div className={classes.sectionMobile}>{accountBtns}</div>
                        </React.Fragment>
                    )}
                </Toolbar>
            </AppBar>
            {renderMobileMenu}
            {renderMenu}
            <SideNav />
        </div>
    );
}
