import React from 'react';
import styles from '../styles/Drive.module.css';
import { useState, useEffect } from 'react';
import { get, post } from '../_axios';
import { makeStyles } from '@material-ui/core/styles';
import ListSubheader from '@material-ui/core/ListSubheader';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemText from '@material-ui/core/ListItemText';
import FolderOpenIcon from '@material-ui/icons/FolderOpen';
import DeleteIcon from '@material-ui/icons/Delete';

const useStyles = makeStyles((theme) => ({
    root: {
        width: '100%',
        maxWidth: 360,
        backgroundColor: theme.palette.background.paper,
    },
    nested: {
        paddingLeft: theme.spacing(4),
    },
}));

const DriveFolder = ({ getFolderPk, openPasteBin }) => {
    const classes = useStyles();

    // const [open, setOpen] = React.useState(true);

    // const handleClick = () => {
    //     setOpen(!open);
    // };

    return (
        <div className={styles.folderContainer}>
            <List
                component='nav'
                aria-labelledby='nested-list-subheader'
                subheader={
                    <ListSubheader component='div' id='nested-list-subheader'>
                        Aiko Drive System
                    </ListSubheader>
                }
                className={classes.root}
            >
                <ListItem
                    button
                    onClick={() => {
                        openPasteBin(false);
                        getFolderPk(1);
                    }}
                >
                    <ListItemIcon>
                        <FolderOpenIcon />
                    </ListItemIcon>
                    <ListItemText primary='Folders' style={{ overflow: 'hidden' }} />
                </ListItem>
                {/* <ListItem button onClick={handleClick}>
                    <ListItemIcon>
                        <StarIcon />
                    </ListItemIcon>
                    <ListItemText primary='Starred' />
                    {open ? <ExpandLess /> : <ExpandMore />}
                </ListItem> */}
                {/* <Collapse in={open} timeout='auto' unmountOnExit>
                    <List component='div' disablePadding>
                        <ListItem button className={classes.nested}>
                            <ListItemIcon>
                                <StarBorder />
                            </ListItemIcon>
                            <ListItemText primary='Important' />
                        </ListItem>
                    </List>
                </Collapse> */}
                <ListItem
                    button
                    onClick={() => {
                        openPasteBin(true);
                    }}
                >
                    <ListItemIcon>
                        <DeleteIcon />
                    </ListItemIcon>
                    <ListItemText primary='Bin' style={{ overflow: 'hidden' }} />
                </ListItem>
            </List>
        </div>
    );
};

export default DriveFolder;
