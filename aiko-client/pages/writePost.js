import * as React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import styles from '../styles/WriteBoard.module.css';
import {useState} from 'react';
import Button from '@material-ui/core/Button';
import axios from 'axios';
import {useDispatch} from 'react-redux';
import {dataSave} from '../_redux/boardReducer';
import router from 'next/router';

const useStyles = makeStyles((theme) => ({
  root: {
    '& .MuiTextField-root': {
      margin: theme.spacing(1),
      width: '25ch'
    },
  },
}));


export default function writePost() {


    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [file, setFile] = useState(null);

    const classes = useStyles();
  
    const titleChange = (e) => {
      setTitle(e.target.value);
    };
    
    const contentChange = (e) => {
      setContent(e.target.value);
    };

    const handleFile = (e) => {
      setFile(e.target.files);
    };

    const dispatch = useDispatch();


    const upload = () => {
      const formData = new FormData();
      const url = '/api/notice-board/write';
      formData.append("title", JSON.stringify(title));
      formData.append("content", JSON.stringify(content));
      for (let i=0; i<3; i++) {
      formData.append("file", JSON.stringify(file[i]));
      }
      const config = {
        headers: {
          "content-type" : "multipart/form-data"
        },
      };
      axios.post(url, formData, config)
        .then((response) => {
          console.log(response);
        })
        .catch((error) => {
          console.log(error)
        })
    };

    const onSave = () => {
      const _inputData = {
        id: '',
        title:title,
        content: content
      }
      dispatch(dataSave(_inputData))
      setTitle('')
      setContent('')
      router.push('/board')
      upload();
    }

    
    
    return (
        <>

    <div className={styles.writeBoard}>

      <div>
      <input type="text" value={title} placeholder="제목을 입력해주세요" onChange={titleChange}/>
      </div>

      <div>
      <textarea type="text" value={content} placeholder="내용을 입력해주세요" onChange={contentChange} />
      </div>
      
      <div>
      <input type="file" multiple onChange={handleFile}/>
      </div>

      <Button variant="contained" color="primary" style={{marginTop:'30px',
      width:'150px', height:'50px'}} onClick={onSave}>
        등록
      </Button>

    </div>
        </>
    )
}