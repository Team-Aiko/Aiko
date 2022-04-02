import React, { useState, useEffect } from 'react';
import { useDropzone } from 'react-dropzone';
import Modal from './Modal.js';
import styles from '../styles/Drive.module.css';
import { Typography, IconButton, Button } from '@material-ui/core';
import { ClearSharp, CloudUpload } from '@material-ui/icons';
import { makeStyles } from '@material-ui/core/styles';
import { post, get, sendPost } from '../_axios';

const useStyles = makeStyles((theme) => ({
    button: {
        margin: theme.spacing(1),
        float: 'right',
    },
}));

const DriveUpload = ({ fileModalOpen, setFileModalOpen, selectedFolderPk, isSomethingChanged }) => {
    const [files, setFiles] = useState([]);

    const { getRootProps, getInputProps } = useDropzone({
        accept: 'image/*',
        onDrop: (acceptedFiles) => {
            setFiles((prev) => [...prev, ...Object.values(acceptedFiles)]);
        },
    });

    const removeItem = (name) => {
        setFiles(files.filter((file) => file.name !== name));
    };

    const fileName = files.map((file) => (
        <div key={file.name}>
            <Typography variant='caption' gutterBottom>
                {file.name}
            </Typography>
            <IconButton>
                <ClearSharp
                    fontSize='small'
                    onClick={() => {
                        removeItem(file.name);
                    }}
                />
            </IconButton>
        </div>
    ));

    const uploadFile = () => {
        const url = '/api/store/drive/save-files';
        sendPost(url, 'multipart', { files: files[0], folderPK: selectedFolderPk })
            .then((res) => {
                alert('파일 업로드를 완료했습니다.');
                setFileModalOpen(false);
                isSomethingChanged('upload File complete');
            })
            .catch((err) => console.error(err));
    };

    const classes = useStyles();

    return (
        <Modal
            title='Upload New Files'
            open={fileModalOpen}
            onClose={() => {
                setFileModalOpen(false);
            }}
        >
            <section className='container'>
                <div {...getRootProps()}>
                    <input {...getInputProps()} />
                    <div className={styles.dragDropDiv}>
                        <Typography variant='overline' gutterBottom style={{ margin: 20 }}>
                            Drag and drop some files here or click here to upload manually.
                        </Typography>
                    </div>
                </div>
                <aside>
                    <ul>{fileName}</ul>
                </aside>
                <Button
                    variant='contained'
                    color='primary'
                    className={classes.button}
                    startIcon={<CloudUpload />}
                    onClick={uploadFile}
                >
                    Upload
                </Button>
            </section>
        </Modal>
    );
};

export default DriveUpload;
