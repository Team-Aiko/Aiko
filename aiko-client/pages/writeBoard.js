import * as React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import styles from '../styles/WriteBoard.module.css';
import {useState} from 'react';
import Button from '@material-ui/core/Button';
import TextField from '@material-ui/core/TextField';
import axios from 'axios';
import { get, post } from 'axios';

const useStyles = makeStyles((theme) => ({
  root: {
    '& .MuiTextField-root': {
      margin: theme.spacing(1),
      width: '25ch'
    },
  },
}));


export default function writeBoard() {

    const [title, setTitle] = useState('');
    const [text, setText] = useState('');
    const [file, setFile] = useState(null);

    const classes = useStyles();
  
    const titleChange = (e) => {
      setTitle(e.target.value);
    };
    
    const textChange = (e) => {
      setText(e.target.value);
    };

    const handleFile = (e) => {
      setFile(e.target.file);
    };


    const upload = () => {
      const formData = new FormData();
      const url = '/api/notice-board/write'
      const data = {
        title: title,
        content: text,
      }
      formData.append('data', JSON.stringify(data))
      formData.append('image', file);
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

    
    
    return (
        <>

    <div className={styles.writeBoard}>

    <form className={styles.root} noValidate autoComplete="off">
      <div className={styles.titleInput}>
        <TextField
          id="standard-multiline-flexible"
          label="제목"
          multiline
          maxRows={4}
          onChange={titleChange}
        />
        <TextField
          id="standard-multiline-static"
          label="내용"
          multiline
          rows={12}
          onChange={textChange}
          style={{marginTop:'50px'}}
        />
      </div>
      <input type="file" multiple onChange={handleFile}/>
    </form>

      <Button variant="contained" color="primary" style={{marginTop:'30px',
      width:'150px', height:'50px'}} onClick={upload}>
        등록
      </Button>

    </div>
        </>
    )
}