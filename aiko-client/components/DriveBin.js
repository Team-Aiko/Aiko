import React from 'react';
import { useState, useEffect } from 'react';
import styles from '../styles/Drive.module.css';
import { Typography, Divider, ListItem, ListItemIcon, ListItemText, Button } from '@material-ui/core';
import { DeleteForever, Description } from '@material-ui/icons';
import { makeStyles } from '@material-ui/core/styles';
import Modal from './Modal';
import { get, post } from '../_axios';

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


const DriveBin = ({deletedFile}) => {
    const classes = useStyles();

    const [deleteConfirmModal, setDeleteConfirmModal] = useState(false);

    const [deleted, setDeleted] = useState({});

    const getDeletedFiles = () => {
        const url = '/api/store/drive/get-files';
        const data = {
            filePKs : 4
        }
        get(url, data)
        .then((res) => {
            setDeleted(res);
            console.log('getDeletedFiles?', res);
        })
        .catch((error) => {
            console.log(error);
        })
    }

    useEffect(() => {
        getDeletedFiles()
    },[])

    console.log('deleted', deleted)

    return (
        <div className={styles.fileContainer}>

            <button onClick={getDeletedFiles}>
            아오 getFiles
            </button>

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
                {deletedFile?.map((file) => (
                    <div className={classes.root}>
                        <ListItem button dense divider selected>
                            <ListItemIcon>
                                <Description />
                            </ListItemIcon>
                            <ListItemText primary={file.FOLDER_NAME}/>
                        </ListItem>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default DriveBin;
