import React, {useState, useEffect} from 'react';
import Modal from './Modal.js';
import styles from '../styles/Drive.module.css';
import { Button, ListItem, ListItemText, Checkbox } from '@material-ui/core';
import { get, post, sendPost } from '../_axios';
import { makeStyles } from '@material-ui/core/styles';

const useStyles = makeStyles(theme => ({
    listItemText:{
    fontSize:'1.2vw',
    },
    button: {
        fontSize:'1.2vw',
        margin:5,
    }
}));


const DriveFileDetailModal = ({ open, onClose, selectedFilePk }) => {

    const classes = useStyles();

    //파일 히스토리에 필요한 state값
    const [file, setFile] = useState(undefined);

    const addFileHistory = () => {
        const url = '/api/store/drive/add-history';
        sendPost(url, 'multipart', {file: file[0], filePK: selectedFilePk })
        .then((res) => {
            alert('파일 히스토리 추가 완료');
            console.log(res)
        })
        .catch((error) => {
            console.log(error)
        })
    }

    const fileUpload = (e) => {
        setFile(e.target.files)
    }

    const [fileHistoryName, setFileHistoryName] = useState([])

    useEffect(() => {
        if(selectedFilePk){
            const getHistory = () => {
                const url = `/api/store/drive/file-history?fileKey=${selectedFilePk}`;
                get(url)
                .then((res) => {
                    console.log(res);
                    setFileHistoryName(res)
                })
                .catch((error) => {
                    console.log(error)
                })
            };
            getHistory()
        }
    },[selectedFilePk])

    console.log('filehistory?', fileHistoryName)
    
    

    const [isChecked, setIsChecked] = useState(false);


    return (
        <Modal title='File Detail' open={open} onClose={onClose}>

            <input label='file upload' type='file' onChange={fileUpload}/>
            <button onClick={addFileHistory}>업로드</button>

            <div className={styles.fileDetailDiv}>
                <div className={styles.filePreview}>
                    {
                        fileHistoryName && fileHistoryName.map((name) => {
                            return (
                                <ListItem
                                button
                                style={{borderBottom: '2px dotted grey'}}
                                >
                                <Checkbox
                                    color='default'
                                />
                                <ListItemText
                                    classes={{primary:classes.listItemText}}
                                    primary={name.ORIGINAL_FILE_NAME}
                                    
                                />
                            </ListItem>
                            )
                        })
                    }
                </div>
            </div>

            <div style={{ textAlign: 'center', margin: 10 }}>
                <a href={`/api/store/download-drive-file?fileId=${selectedFilePk}`}>
                    <Button variant='contained' color='primary' fontSize='small'
                    className={classes.button}>
                        Download
                    </Button>
                    <Button variant='contained' color='default' fontSize='small'
                    className={classes.button}>
                        Add version
                    </Button>
                </a>
            </div>
        </Modal>
    );
};

export default DriveFileDetailModal;
