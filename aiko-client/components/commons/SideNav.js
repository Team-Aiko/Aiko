import React from 'react';
import clsx from 'clsx';
import {makeStyles} from '@material-ui/core/styles';
import {ListItemText, ListItemIcon, Drawer, Button, List, ListItem} from '@material-ui/core';
import {Home, Create, DeleteForever} from '@material-ui/icons';
import {useSelector, useDispatch} from 'react-redux';

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
    const dispatch = useDispatch();
    return <PComp sideNavIsOpen={sideNavIsOpen} dispatch={dispatch} />;
}

// * Presentational component
function PComp(props) {
    const closeDrawer = () => {
        dispatch(handleSideNav());
    };

    return (
        <React.Fragment>
            <Drawer open={props.sideNavIsOpen} onClose={closeDrawer}>
                <div className={clsx(classes.list)} role='presentation' onClick={closeDrawer} onKeyDown={closeDrawer}>
                    <List>
                        <ListItem button onClick={goToHome}>
                            <ListItemIcon>
                                <Home />
                            </ListItemIcon>
                            <ListItemText primary='戻る' />
                        </ListItem>
                        <ListItem button>
                            <ListItemIcon>
                                <DeleteForever />
                            </ListItemIcon>
                            <ListItemText primary='カードの削除' />
                        </ListItem>
                        <ListItem button>
                            <ListItemIcon>
                                <Create />
                            </ListItemIcon>
                            <ListItemText primary='カードの編集' />
                        </ListItem>
                    </List>
                </div>
            </Drawer>
        </React.Fragment>
    );
}
