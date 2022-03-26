import React, {useState, useEffect} from 'react';
import Modal from './Modal.js';
import styles from '../styles/Drive.module.css';
import { Button, ListItem, ListItemText, Checkbox, Typography, IconButton} from '@material-ui/core';
import { get, post, sendPost } from '../_axios';
import { makeStyles } from '@material-ui/core/styles';
import { ClearSharp } from '@material-ui/icons';

const useStyles = makeStyles(theme => ({
    listItemText:{
    fontSize:'1.2vw',
    },
    button: {
        fontSize:'1.2vw',
        margin:5,
    },
    historyModalDiv: {
        width: '40vw',
        height: '20vh',
        display:'flex',
        flexDirection:'column',
        textAlign:'center',
        alignItems:'center',
    },
    hideButton : {
        display:'none'
    },
    historyUploadButton: {
        margin: 1
    },
    fileName: {
        margin: 10,
        fontSize: '1.2vw'
    }
}));

const DriveFileDetailModal = ({ open, onClose, selectedFilePk }) => {

    const classes = useStyles();

    //파일 히스토리에 필요한 state값
    const [file, setFile] = useState([]);

    const fileUpload = (e) => {
        setFile(Object.values(e.target.files))
    }

    //map으로 렌더링해줄 파일 이름, 버튼 클릭하면 Pk 값을 useState에 저장, 다운로드에 이용
    const [fileHistoryName, setFileHistoryName] = useState([])

    //selectedFilePk값이 넘어오면 작동.
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


    //history modal 
    const [openHistoryModal, setOpenHistoryModal] = useState(false);

    const deleteFile = (name) => {
        setFile(file.filter((file) => file.name !== name));
    };

    //Checkbox oversee
    const [isChecked, setIsChecked] = useState(false);

    const handleCheckButton = () => {
        setIsChecked(true);
    };

    const [selectedCheckboxIndex, setSelectedCheckboxIndex] = useState(undefined);

    const getCheckboxIndexNum = (index) => {
        setSelectedCheckboxIndex(index);
        setSelectedFilePkNum()
    };

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


    return (
        <Modal title='File Detail' open={open} onClose={onClose}>

            <div className={styles.fileDetailDiv}>
                <div className={styles.filePreview}>
                    {
                        fileHistoryName && fileHistoryName.map((name, index) => {
                            return (
                                <ListItem
                                button
                                style={{borderBottom: '2px dotted grey'}}
                                >
                                <Checkbox
                                    color='default'
                                    checked={index == selectedCheckboxIndex ? isChecked : false}
                                    onChange={handleCheckButton}
                                    onClick={() => {
                                        getCheckboxIndexNum(index)
                                    }}
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
                </a>
                <Button variant='contained' color='default' fontSize='small'
                    className={classes.button} onClick={() => {setOpenHistoryModal(true)}}>
                        Add version
                </Button>
            </div>

            {
            openHistoryModal
            ?
            <Modal open={openHistoryModal} onClose={()=>{setOpenHistoryModal(false)}}
            title='Add Another History'>
                <div className={classes.historyModalDiv}>
                    <Button variant="contained" color='primary' component="label">
                    Select File
                    <input type="file" hidden onChange={fileUpload}/>
                    </Button>

                    {
                        file.map((uploaded) => (
                            <div key={uploaded.name}>
                                <Typography variant='caption' gutterBottom
                                className={classes.fileName}>
                                {uploaded.name}
                                </Typography>

                                <IconButton>
                                <ClearSharp
                                    fontSize='small'
                                    onClick={() => {
                                        deleteFile(uploaded.name);
                                    }}
                                />
                                </IconButton>
                            </div>
                        ))
                    }

                    <Button variant="contained" color='primary' component="label"
                    className={file.length > 0 ? classes.historyUploadButton : classes.hideButton}>
                    Upload
                    </Button>
                </div>

            </Modal>
            : <></>
            }
        </Modal>

    );
};


export default DriveFileDetailModal;
