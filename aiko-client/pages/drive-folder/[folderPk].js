import React from 'react';
import styles from '../../styles/Drive.module.css';
import { useRouter } from 'next/router';
import { useState, useEffect } from 'react';
import { get, post } from '../../_axios';
import { Paper, Grid } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';


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

const drivefolder = () => {

    //not important
    const classes = useStyles();
    const router = useRouter();
    const { folderPk } = router.query;
    const numberFolderPk = Number(folderPk)

    //하위 폴더 추가
    const [subFolder, setSubFolder] = useState([]);

    //폴더 불러오기
    const viewFolder = async () => {
        const url = `/api/store/drive/view-folder?folderId=${numberFolderPk}`
        await get(url)
        .then((res) => {
            console.log('SUB folders = ',res);
            setSubFolder(res.directChildrenFolders);
        })
        .catch((error) => {
            console.log(error)
        })
    };


    useEffect(() => {
        viewFolder()
    }, []);

    // 하위 폴더 생성
    const createFolder = () => {
        const url = '/api/store/drive/create-folder';
        const data = {
            folderName: '11 SubFolder',
            parentPK: 11
        }
        post(url, data)
        .then((res) => {
            console.log('파일 생성', res)
        })
        .catch((error) => {
            console.log(error)
        })
    }

    const [file, setFile] = useState([]);
    const [currentFolderPk, setCurrentFolderPk] = useState(undefined);

    const uploadFile = (e) => {
        setFile((file) => [...file, Object.values(e.target.files)])
        console.log(file)
    }

    const saveFile = () => {
        const formData = new FormData();
        const url = '/api/store/drive/save-files';
        formData.append('files', file);
        formData.append('folderPK', folderPk)
        const config = {
            headers: {
                'content-type': 'multipart/form-data',
            },
        };
        post(url, formData, config)
        .then((res) => {
            console.log('upload File' , res)
        })
        .catch((error) => {
            console.log(error)
        })
    };

    return (
        <div>
            <div className={styles.mainContainer}>
                <input/><button onClick={createFolder}>하위 폴더 추가</button>
                <input type='file'onChange={uploadFile}/><button onClick={saveFile}>파일 추가</button>
                <div>
                    {
                        subFolder.map((sub, key) => (
                            <Grid container spacing={1}>
                                <Grid item xs={5}>
                                    <Paper className={classes.paper}>{sub.FOLDER_NAME}</Paper>
                                </Grid>
                            </Grid>
                        ))
                    }
                </div>
            </div>
        </div>
    )
}

export default drivefolder
