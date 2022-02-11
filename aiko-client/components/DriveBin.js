import React from 'react';
import { useState, useEffect } from 'react';
import styles from '../styles/Drive.module.css';
import { Typography, Divider, ListItem, ListItemIcon, ListItemText, Button } from '@material-ui/core';
import { DeleteForever, Description } from '@material-ui/icons';
import { makeStyles } from '@material-ui/core/styles';
import Modal from './Modal';

const useStyles = makeStyles((theme) => ({
    root: {
        width: '30%',
        height: '28%',
        margin: 10,
        overflow: 'auto',
    },
    pageDesc: {
        display: 'flex',
        padding: 15,
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    confirmDiv : {
        display: 'flex',
        flexDirection: 'column',
        alignItems:'center',
        textAlign:'center',
        padding: 20
    }
}));


const DriveBin = () => {
    const classes = useStyles();

    const [deleteConfirmModal, setDeleteConfirmModal] = useState(false);

    return (
        <div className={styles.fileContainer}>
            <div className={classes.pageDesc}>
                <div style={{ display: 'flex', alignItems: 'center' }}>
                    <DeleteForever fontSize='large' />

                    <Typography>Recycle Bin</Typography>
                </div>

                <div>
                    <Button color='primary' variant='outlined' onClick={() => {setDeleteConfirmModal(true)}}>
                        Emptying
                    </Button>
                </div>

                {
                    deleteConfirmModal
                    ? <Modal title='Emptying Bin' open={deleteConfirmModal}
                    onClose={() => {setDeleteConfirmModal(false)}}>
                        <div className={classes.confirmDiv}>
                        <Typography variant='overline'>Are you sure you want to <span style={{color:'tomato'}}>empty recycle bin?</span></Typography>
                        <Button style={{margin:20}} color='primary' variant='contained'>YES</Button>
                        </div>
                    </Modal>
                    : <></>
                }
            </div>

            <Divider />

            <div className={styles.folderDiv}>
                <div className={classes.root}>
                    <ListItem button dense divider selected>
                        <ListItemIcon>
                            <Description />
                        </ListItemIcon>
                        <ListItemText />
                    </ListItem>
                </div>
            </div>
        </div>
    );
};

export default DriveBin;
