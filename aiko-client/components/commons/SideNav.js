import React from 'react';
import clsx from 'clsx';
import Router from 'next/router';
import { makeStyles } from '@material-ui/core/styles';
import { ListItemText, ListItemIcon, Drawer, Button, List, ListItem } from '@material-ui/core';
import { MeetingRoom, GroupAdd, Home, Create, Settings } from '@material-ui/icons';
import { useSelector, useDispatch } from 'react-redux';
import { handleSideNav } from '../../_redux/popupReducer';

// * CSS Styles
const useStyles = makeStyles({
    list: {
        width: 250,
    },
    fullList: {
        width: 'auto',
    },
});

// * Container Component
export default function CComp(props) {
    const sideNavIsOpen = useSelector((state) => state.popupReducer.sideNavIsOpen);
    const dispatch = useDispatch();

    const handleNav = (bools) => {
        dispatch(handleSideNav(bools));
    };

    return <PComp sideNavIsOpen={sideNavIsOpen} handleSideNav={handleNav} />;
}

// * Presentational component
function PComp(props) {
    const classes = useStyles();

    const closeDrawer = () => {
        props.handleSideNav(false);
    };

    const goToMain = () => {
        Router.push('/');
    };
    const goToOrganize = () => {
        Router.push('/organize');
    };

    return (
        <React.Fragment>
            <Drawer open={props.sideNavIsOpen} onClose={closeDrawer}>
                <div className={clsx(classes.list)} role='presentation' onClick={closeDrawer} onKeyDown={closeDrawer}>
                    <List>
                        <ListItem button onClick={goToMain}>
                            <ListItemIcon>
                                <Home />
                            </ListItemIcon>
                            <ListItemText primary='Main' />
                        </ListItem>
                        <ListItem button onClick={goToOrganize}>
                            <ListItemIcon>
                                <GroupAdd />
                            </ListItemIcon>
                            <ListItemText primary='Organize' />
                        </ListItem>
                        <ListItem button>
                            <ListItemIcon>
                                <MeetingRoom />
                            </ListItemIcon>
                            <ListItemText primary='Meet' />
                        </ListItem>
                        <ListItem button>
                            <ListItemIcon>
                                <Settings />
                            </ListItemIcon>
                            <ListItemText primary='Settings' />
                        </ListItem>
                    </List>
                </div>
            </Drawer>
        </React.Fragment>
    );
}
