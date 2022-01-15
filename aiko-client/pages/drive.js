import React from 'react';
import styles from '../styles/Drive.module.css';
import { useState, useEffect } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import { Paper, Grid } from '@material-ui/core';
import {get, post} from '../_axios';
import Link from 'next/link';

const useStyles = makeStyles((theme) => ({
    root: {
        flexGrow: 1,
    },
    paper: {
        padding: theme.spacing(2),
        textAlign: 'center',
        color: theme.palette.text.secondary,
    },
}));

const drive = () => {
    const classes = useStyles();

    //폴더 생성에 필요한 변수 & 함수
    const [folderName, setFolderName] = useState('');
    const [parentPk, setParentPk] = useState(1);

    const folderNameChange = (e) => {
        setFolderName(e.target.value)
    }

    const createFolder = () => {
        const url = '/api/store/drive/create-folder';
        const data = {
            folderName: folderName,
            parentPK: parentPk
        }
        post(url, data)
        .then((res) => {
            console.log('파일 생성', res)
            setFolderName('');
        })
        .catch((error) => {
            console.log(error)
        })
    }

    // 루트 폴더, 폴더 불러오기
    const [rootFolder, setRootFolder] = useState([]);

    const viewFolder = async () => {
        const url = `/api/store/drive/view-folder?folderId=${1}`
        await get(url)
        .then((res) => {
            console.log('Folders = ',res);
            setRootFolder(res.directChildrenFolders);
        })
        .catch((error) => {
            console.log(error)
        })
    };

    useEffect(() => {
        viewFolder()
    }, []);

    return (
        <div>
            <div className={styles.mainContainer}>
                <div>
                    <input value={folderName} onChange={folderNameChange} />
                    <button onClick={createFolder}>추가</button>
                </div>

                <div className={classes.root}>
                    {
                        rootFolder.map((root, key) => (
                            <Link href={'/drive-folder/' + root.FOLDER_PK}>
                        <Grid container spacing={1}>
                            <Grid item xs={5}>
                                <Paper className={classes.paper}>{root.FOLDER_NAME}</Paper>
                            </Grid>
                        </Grid>
                        </Link>
                        ))
                    }
                </div>
            </div>
        </div>
    );
};

export default drive;
