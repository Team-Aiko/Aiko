import React, { useState, useEffect } from 'react';
import Modal from './Modal.js';
import styles from '../styles/Drive.module.css';
import { makeStyles } from '@material-ui/core/styles';
import { List, ListItem, ListSubheader, ListItemText, Button, Checkbox } from '@material-ui/core';
import { Folder } from '@material-ui/icons';
import { get, post } from '../_axios';

const useStyles = makeStyles((theme) => ({
    root: {
        width: '100%',
        height: 'auto',
    },
}));

const DriveFileMove = ({ openMoveModal, closeMoveModal, fileKeyPk, folderKeyPk }) => {
    const classes = useStyles();

    //폴더 이동에 필요한 담을 폴더 pk
    const [targetFolderPk, setTargetFolderPk] = useState(undefined);

    //폴더 이동 api
    const moveFolder = () => {
        const url = '/api/store/drive/move-folder';
        const data = {
            fromFilePKs: fileKeyPk,
            fromFolderPKs: folderKeyPk,
            toFolderPK: targetFolderPk,
        };
        post(url, data)
            .then((res) => {
                console.log('moveFolder', res);
            })
            .catch((error) => {
                console.log(error);
            });
    };

    const [folders, setFolders] = useState([]);

    const [selectedFolder, setSelectedFolder] = useState(1);

    //현재 존재하는 폴더, checkbox로 이동 관리
    const viewExistingFolder = () => {
        get(`/api/store/drive/view-folder?folderId=${selectedFolder}`)
            .then((res) => {
                const notDeletedFolder = res.directChildrenFolders.filter((folder) => folder.IS_DELETED === 0);
                setFolders(notDeletedFolder);
            })
            .catch((error) => {
                console.log(error);
            });
    };

    useEffect(() => {
        viewExistingFolder();
    }, [selectedFolder]);

    //checkbox control
    const [isChecked, setIsChecked] = useState(false);

    const handleCheckButton = () => {
        setIsChecked(true);
    };

    const [selectedCheckboxIndex, setSelectedCheckboxIndex] = useState(undefined);

    const getCheckboxIndexNum = (index) => {
        setSelectedCheckboxIndex(index);
    };

    console.log(folders);

    return (
        <Modal title='Move Folders & Files' open={openMoveModal} onClose={closeMoveModal}>
            <div className={styles.moveFileModalContainer}>
                <div className={styles.moveFileModalInnerContainer}>
                    <List
                        subheader={
                            <ListSubheader component='div' id='nested-list-subheader'>
                                Folders
                            </ListSubheader>
                        }
                        className={classes.root}
                    >
                        {folders &&
                            folders.map((folder, index) => (
                                <ListItem
                                    button
                                    style={{ borderTop: '2px solid #eaeaea', borderBottom: '2px solid #eaeaea' }}
                                >
                                    <Checkbox
                                        color='default'
                                        checked={index == selectedCheckboxIndex ? isChecked : false}
                                        onChange={handleCheckButton}
                                        onClick={() => {
                                            getCheckboxIndexNum(index);
                                            setTargetFolderPk(folder.FOLDER_PK);
                                        }}
                                    />
                                    <ListItemText
                                        primary={folder.FOLDER_NAME}
                                        onClick={() => {
                                            setSelectedFolder(folder.FOLDER_PK);
                                        }}
                                    />
                                </ListItem>
                            ))}
                    </List>
                </div>
            </div>

            <div>
                <Button variant='contained' onClick={moveFolder}>
                    Move
                </Button>
            </div>
        </Modal>
    );
};

export default DriveFileMove;
