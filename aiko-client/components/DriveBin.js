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
    confirmDiv: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        textAlign: 'center',
        padding: 20,
    },
}));

const DriveBin = () => {
    const classes = useStyles();

        const [deletedFile, setDeletedFile] = useState([]);
        const [deletedRootFolder, setDeletedRootFolder] = useState([]);
        const [selectedFolderPk, setSelectedFolderPk] = useState(1);

        // 만들어진 폴더 가져오기, 의존값은 selectedFolderPk 삭제된 폴더와 파일 구분함 (휴지통)
        const viewFolder = () => {
            const url = `/api/store/drive/view-folder?folderId=${selectedFolderPk}`;
            get(url)
            .then((res) => {
                const deletedFolder = res.directChildrenFolders.filter(folder => folder.IS_DELETED === 1);
                setDeletedRootFolder(deletedFolder);
                const deletedFile = res.filesInFolder.filter(file => file.IS_DELETED === 1);
                setDeletedFile(deletedFile);
            })
            .catch((error) => {
                console.log(error)
            })
        };
    
        useEffect(() => {
            viewFolder()
        }, [])

    return (
        <div className={styles.fileContainer}>

            <div className={classes.pageDesc}>
                <div style={{ display: 'flex', alignItems: 'center' }}>
                    <DeleteForever fontSize='large' />

                    <Typography>Recycle Bin</Typography>
                </div>
            </div>

            <Divider />

            <div className={styles.folderDiv}>
                {deletedFile?.map((file) => (
                    <div className={classes.root}>
                        <ListItem button dense divider selected>
                            <ListItemIcon>
                                <Description />
                            </ListItemIcon>
                            <ListItemText primary={file.FOLDER_NAME} />
                        </ListItem>
                    </div>
                ))}

                {deletedRootFolder?.map((folder) => (
                    <div className={classes.root}>
                        <ListItem button dense divider selected>
                            <ListItemIcon>
                                <Description />
                            </ListItemIcon>
                            <ListItemText primary={folder.FOLDER_NAME} />
                        </ListItem>
                    </div>
                ))}
            </div>

        </div>
    );
};

export default DriveBin;
