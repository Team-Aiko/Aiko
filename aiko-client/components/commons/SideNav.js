import React from 'react';
import clsx from 'clsx';
import Router from 'next/router';
import PropTypes from 'prop-types';
import { makeStyles } from '@material-ui/core/styles';
import { ListItemText, ListItemIcon, Drawer, Button, List, ListItem } from '@material-ui/core';
import { MeetingRoom, GroupAdd, Home, Create, Settings, Assignment} from '@material-ui/icons';
import { useSelector, useDispatch } from 'react-redux';
import { handleSideNav } from '../../_redux/popupReducer';
import SpeakerNotesIcon from '@material-ui/icons/SpeakerNotes';

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
    const { sideNavIsOpen } = props;
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
    const goToElectronicApproval = () => {
        Router.push('/electronic-approval');
    };

    const goToMeetingRoom = () => {
        Router.push('/meeting-room');
    };

    const goToBoard = () => {
        Router.push('/board');
    };

    return (
        <>
            <Drawer open={sideNavIsOpen} onClose={closeDrawer}>
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
                        <ListItem button onClick={goToMeetingRoom}>
                            <ListItemIcon>
                                <MeetingRoom />
                            </ListItemIcon>
                            <ListItemText primary='Meet' />
                        </ListItem>
                        <ListItem button onClick={goToElectronicApproval}>
                            <ListItemIcon>
                                <Assignment />
                            </ListItemIcon>
                            {/* Electronic approval */}
                            <ListItemText primary='전자결재' />
                        </ListItem>
                        <ListItem button onClick={goToBoard}>
                            <ListItemIcon>
                                <SpeakerNotesIcon />
                            </ListItemIcon>
                            <ListItemText primary='게시판' />
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
        </>
    );
}

PComp.propTypes = {
    sideNavIsOpen: PropTypes.bool.isRequired,
    handleSideNav: PropTypes.func.isRequired,
};
