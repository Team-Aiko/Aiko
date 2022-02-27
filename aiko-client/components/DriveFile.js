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
    MenuItem,
} from '@material-ui/core';
import { CreateNewFolder, Folder, NoteAdd, MoreVert } from '@material-ui/icons';
import Modal from './Modal.js';
import DriveFileMove from './DriveFileMove';

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

//rootFolder, getFolderPk, selectedFolderPk, folderFile는 [companyPk].js 폴더와 상호작용, 자세한건 [companyPk].js 페이지 참조
const DriveFile = ({ rootFolder, getFolderPk, selectedFolderPk, folderFile }) => {
    const classes = useStyles();

    //FOLDER Menu Item 조작
    const ThreeDotsMenu = ({ root }) => {
        const [anchorEl, setAnchorEl] = React.useState(null);
        const handleClick = (e) => {
            setAnchorEl(e.currentTarget);
        };
        const handleClose = () => {
            setAnchorEl(null);
        };

        return (
            <React.Fragment>
                <Button onClick={handleClick}>
                    <MoreVert />
                </Button>
                <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleClose}>
                    <MenuItem onClick={()=>{setDeleteFolderPk(root)}}>Delete</MenuItem>
                    <MenuItem onClick={openMoveModal}>Move</MenuItem>
                </Menu>
            </React.Fragment>
        );
    };

    const [deleteFolderPk, setDeleteFolderPk] = useState(undefined);

    const [fileMoveModalOpen, setFileMoveModalOpen] = useState(false);
    const openMoveModal = () => {
        setFileMoveModalOpen(true);
    }
    const closeMoveModal = () => {
        setFileMoveModalOpen(false);
    }

    //폴더 삭제 API
    const deleteItem = () => {
        const url = '/api/store/drive/delete-files';
        const data = {
            folderPKs: deleteFolderPk
        };
        post(url, data)
            .then((res) => {
                console.log('Delete Items', res);
            })
            .catch((error) => {
                console.log('delete Items', error);
            });
    };

    useEffect(() => {
        deleteItem();
    }, [deleteFolderPk])

    // Folder Modal Open
    const [openModal, setOpenModal] = useState(false);

    // File Upload Modal Open
    const [fileModalOpen, setFileModalOpen] = useState(false);

    // File Detail Modal Open
    const [fileDetailModalOpen, setFileDetailModalOpen] = useState(false);

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
        if(folderName.length == 0){
            alert('폴더명을 입력해주세요.')
            return;
        }
        post(url, data)
            .then((res) => {
                console.log('Make Subfolder API', res);
                setFolderName('');
                setOpenModal(false);
            })
            .catch((error) => {
                console.log(error);
            });
    };

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
                            <ThreeDotsMenu root={root.FOLDER_PK} />
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

            <div className={styles.folderDiv}>
                {folderFile?.map((file) => (
                    <div className={classes.root}>
                        <ListItem
                            button
                            dense
                            divider
                            selected
                        >
                            <ListItemIcon>
                                <Folder />
                            </ListItemIcon>
                            <ListItemText primary={file.fileHistories[0]?.ORIGINAL_FILE_NAME}
                            onClick={() => {
                                setFileDetailModalOpen(true);
                            }}/>
                            <ThreeDotsMenu />
                        </ListItem>
                    </div>
                ))}
            </div>

            {fileModalOpen ? (
                <DriveUpload
                    fileModalOpen={fileModalOpen}
                    setFileModalOpen={setFileModalOpen}
                    selectedFolderPk={selectedFolderPk}
                ></DriveUpload>
            ) : (
                <></>
            )}

            {fileDetailModalOpen == true ? (
                <Modal
                    title='File Detail'
                    open={fileDetailModalOpen}
                    onClose={() => {
                        setFileDetailModalOpen(false);
                    }}
                >
                    <div className={styles.fileDetailDiv}>
                        <div className={styles.fileHistory}>Detail</div>

                        <div className={styles.filePreview}>Image Preview</div>
                    </div>

                    <div style={{ textAlign: 'center', margin: 10 }}>
                        <Button variant='contained' color='primary' fontSize='small'>
                            Download
                        </Button>
                    </div>
                </Modal>
            ) : (
                <></>
            )}

            {
                fileMoveModalOpen == true
                ? <DriveFileMove closeMoveModal={closeMoveModal} openMoveModal={openMoveModal}></DriveFileMove>
                : <></>
            }
        </div>
    );
};

export default DriveFile;
