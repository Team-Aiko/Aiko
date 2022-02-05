import React from 'react';
import styles from '../styles/Drive.module.css';
import DriveUpload from './DriveUpload';
import { useState, useEffect } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import { get, post } from '../_axios';
import {
    Button,
    Input,
    Divider,
    ListItem,
    ListItemIcon,
    ListItemText,
    Typography,
    IconButton,
    Menu,
    MenuItem
} from '@material-ui/core';
import { CreateNewFolder, Folder, NoteAdd, MoreVert } from '@material-ui/icons';
import Modal from './Modal.js';


const useStyles = makeStyles((theme) => ({
    root: {
        width: '30%',
        height: '28%',
        margin: 10,
        overflow: 'auto',
    },
    button: {
        margin: theme.spacing(1),
    },
}));

//rootFolder, getFolderPk, selectedFolderPk는 [companyPk].js 폴더와 상호작용, 자세한건 [companyPk].js 페이지 참조
const DriveFile = ({ rootFolder, getFolderPk, selectedFolderPk }) => {
    const classes = useStyles();

    // Folder Modal Open
    const [openModal, setOpenModal] = useState(false);

    // File Modal Open
    const [fileModalOpen, setFileModalOpen] = useState(false);

    //하위 폴더 생성
    const [folderName, setFolderName] = useState('');

    //하위 폴더 이름
    const changeFolderName = (e) => {
        setFolderName(e.target.value);
    };
    //폴더 생성 API
    const createFolder = () => {
        const url = '/api/store/drive/create-folder';
        const data = {
            folderName: folderName,
            parentPK: selectedFolderPk,
        };
        post(url, data)
            .then((res) => {
                console.log('Make Subfolder API', res);
                setFolderName('');
            })
            .catch((error) => {
                console.log(error);
            });
    };

    //지우려하는 폴더 PK 값
    const [deletingFolderPk, setDeletingFolderPk] = useState(undefined);

    //폴더 삭제 API
    const deleteItem = () => {
        const url = '/api/store/drive/delete-files';
        const data = {
            folderPKs: deletingFolderPk,
        };
        const config = {
            header: {
                'content-type': 'application/json',
            },
        };
        post(url, data, config)
            .then((res) => {
                console.log('Delete Items', res);
                handleClose();
            })
            .catch((error) => {
                console.log('delete Items', error);
            });
    };

    useEffect(() => {
        deleteItem()
    }, [deletingFolderPk])

    return (
        <div className={styles.fileContainer}>
            <Button
                variant='contained'
                color='primary'
                size='large'
                className={classes.button}
                startIcon={<CreateNewFolder />}
                onClick={() => {
                    setOpenModal(true);
                }}
            >
                New Folder
            </Button>

            {openModal ? (
                <Modal
                    title={'Create a New Folder'}
                    open={openModal}
                    onClose={() => {
                        setOpenModal(false);
                    }}
                >
                    <div className={styles.modalDiv}>
                        <Input placeholder='Folder Name' value={folderName} onChange={changeFolderName}></Input>{' '}
                        <Button onClick={createFolder} variant='outlined'>
                            Add
                        </Button>
                    </div>
                </Modal>
            ) : (
                <></>
            )}

            <Divider />

            <div className={styles.folderDiv}>
                {rootFolder?.map((root) => (
                    <div className={classes.root} key={root.FOLDER_PK}>
                        <ListItem button dense divider selected>
                            <ListItemIcon
                                onClick={() => {
                                    getFolderPk(root.FOLDER_PK);
                                }}
                            >
                                <Folder />
                            </ListItemIcon>
                            <ListItemText
                                primary={root.FOLDER_NAME}
                                onClick={() => {
                                    getFolderPk(root.FOLDER_PK);
                                }}
                            />
                        </ListItem>
                    </div>
                ))}
            </div>

            <Divider />

            <div className={styles.fileDiv}>
                <Typography variant='overline' style={{ fontSize: '1rem' }}>
                    {' '}
                    Files
                </Typography>
                <Button
                    variant='contained'
                    color='default'
                    size='small'
                    className={classes.button}
                    startIcon={<NoteAdd />}
                    onClick={() => {
                        setFileModalOpen(true);
                    }}
                >
                    New File
                </Button>
            </div>
            <Divider />

            {fileModalOpen ? (
                <DriveUpload fileModalOpen={fileModalOpen} setFileModalOpen={setFileModalOpen}
                selectedFolderPk={selectedFolderPk}>
                </DriveUpload>
            ) : (
                <></>
            )}
        </div>
    );
};

export default DriveFile;
