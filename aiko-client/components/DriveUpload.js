import React, {useState, useEffect}from 'react';
import { useDropzone } from 'react-dropzone';
import Modal from './Modal.js';
import styles from '../styles/Drive.module.css';
import { Typography, IconButton, Button } from '@material-ui/core';
import { ClearSharp, CloudUpload } from '@material-ui/icons';
import { makeStyles } from '@material-ui/core/styles';
import { post, get } from '../_axios';

const useStyles = makeStyles((theme) => ({
        button: {
        margin: theme.spacing(1),
        float:'right'
        },
    }));

const DriveUpload = ({fileModalOpen, setFileModalOpen, selectedFolderPk}) => {

    const [files, setFiles] = useState([]);

    const {getRootProps, getInputProps} = useDropzone({
        accept: "image/*",
        onDrop: (acceptedFiles) => {
            setFiles( (prev) => [...prev, ...Object.values(acceptedFiles)] )
        }
    })

    const removeItem = (name) => {
        setFiles(files.filter(file => file.name !== name))
    };

    const fileName = files.map((file) => (
        <div key={file.name}>
            <Typography variant='caption' gutterBottom>{file.name}</Typography>
            <IconButton>
                <ClearSharp fontSize='small' onClick={() => { removeItem(file.name)}} />
            </IconButton>
        </div>
    ));

    //파일 업로드 API
    const uploadFile = () => {
        const formData = new FormData();
        const url = '/api/store/drive/save-files';
        formData.append('files', files);
        formData.append('folderPK', selectedFolderPk);
        const config = {
            headers: {
                'content-type': 'multipart/form-data',
            },
        };
        post(url, formData, config)
            .then((res) => {
                console.log('File Upload', res);
            })
            .catch((error) => {
                console.log(error);
            });
    };

    const classes = useStyles();

    return (
        <Modal title='Upload New Files' open={fileModalOpen} onClose={() => {setFileModalOpen(false)}}>
            <section className="container">
                <div {...getRootProps()}>
                <input {...getInputProps()} />
                    <div className={styles.dragDropDiv}>
                    <Typography variant='overline' gutterBottom style={{margin:20}}>Drag and drop some files here</Typography>
                    </div>
                </div>
                <aside>
                    <ul>{fileName}</ul>
                </aside>
                <Button
                variant="contained"
                color="primary"
                className={classes.button}
                startIcon={<CloudUpload />}
                onClick={uploadFile}
                >
                    Upload
                </Button>
            </section>
        </Modal>
    )
}

export default DriveUpload
