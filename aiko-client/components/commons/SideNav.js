import React from 'react';
import clsx from 'clsx';
import { makeStyles } from '@material-ui/core/styles';
import { ListItemText, ListItemIcon, Drawer, Button, List, ListItem } from '@material-ui/core';
import { Home, Create, DeleteForever } from '@material-ui/icons';
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
    const sideNavIsOpen = useSelector(state => state.popupReducer.sideNavIsOpen);
    console.log('🚀 ~ file: SideNav.js ~ line 22 ~ CComp ~ sideNavIsOpen', sideNavIsOpen);
    const dispatch = useDispatch();
    return <PComp sideNavIsOpen={sideNavIsOpen} dispatch={dispatch} handleSideNav={handleSideNav} />;
}

// * Presentational component
function PComp(props) {
    const classes = useStyles();

    const closeDrawer = () => {
        props.dispatch(props.handleSideNav(false));
    };

    return (
        <React.Fragment>
            <Drawer open={props.sideNavIsOpen} onClose={closeDrawer}>
                <div className={clsx(classes.list)} role='presentation' onClick={closeDrawer} onKeyDown={closeDrawer}>
                    <List>
                        <ListItem button>
                            <ListItemIcon>
                                <Home />
                            </ListItemIcon>
                            <ListItemText primary='Organize' />
                        </ListItem>
                        <ListItem button>
                            <ListItemIcon>
                                <DeleteForever />
                            </ListItemIcon>
                            <ListItemText primary='Conference' />
                        </ListItem>
                        <ListItem button>
                            <ListItemIcon>
                                <Create />
                            </ListItemIcon>
                            <ListItemText primary='Settings' />
                        </ListItem>
                    </List>
                </div>
            </Drawer>
        </React.Fragment>
    );
}
