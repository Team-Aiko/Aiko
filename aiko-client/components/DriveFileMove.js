import React, { useState, useEffect } from 'react';
import Modal from './Modal.js';
import styles from '../styles/Drive.module.css';
import { makeStyles } from '@material-ui/core/styles';
import {
    List,
    ListItem,
    ListSubheader,
    ListItemText,
    Button,
    Checkbox
} from '@material-ui/core';
import { Folder } from '@material-ui/icons';
import { get, post } from '../_axios';

const useStyles = makeStyles((theme) => ({
    root: {
        width: '100%',
        height: 'auto',
    },
}));

const DriveFileMove = ({ openMoveModal, closeMoveModal }) => {
    const classes = useStyles();

    const [rootNumber, setRootNumber] = useState(1);

    const viewFolders = () => {
        
    }

    const moveFolder = () => {
        const url = '/api/store/drive/move-folder';
        const data = {
            fromFilePKs : 34 ,
            fromFolderPKs : 184 ,
            toFolderPK :  1
        }
        post(url, data)
        .then((res) => {
            console.log('moveFolder', res)
        })
        .catch((error) => {
            console.log(error);
        })
    }


    return (
        <Modal title='Move Folders & Files' open={openMoveModal} onClose={closeMoveModal}>
            <div className={styles.moveFileModalContainer}>
                <div className={styles.moveFileModalInnerContainer}>
                    <List
                    component="nav"
                    aria-labelledby="nested-list-subheader"
                    subheader={
                        <ListSubheader component="div" id="nested-list-subheader">
                        Folders
                        </ListSubheader>
                    }
                    className={classes.root}
                    >
                    <ListItem button style={{borderTop:'2px solid #eaeaea', borderBottom:'2px solid #eaeaea'}}>
                        <Checkbox
                            color="default"
                        />
                        <ListItemText primary="Sent mail" />
                    </ListItem>
                    </List>
                </div>
            </div>

            <div>
                <Button variant='contained' onClick={moveFolder}>Move</Button>
            </div>
        </Modal>
    );
};

export default DriveFileMove;
