import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import styles from '../styles/WritePost.module.css';
import {useState} from 'react';
import Button from '@material-ui/core/Button';
import axios from 'axios';
import {useDispatch} from 'react-redux';
import {dataSave} from '../_redux/boardReducer';
import router from 'next/router';


export default function writePost() {

    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [name, setName] = useState('');
    const [file, setFile] = useState(null);
  
    const titleChange = (e) => {
      setTitle(e.target.value);
    };
    
    const contentChange = (e) => {
      setContent(e.target.value);
    };

    const handleFile = (e) => {
      setFile(e.target.files);
    };

    const nameChange = (e) => {
      setName(e.target.value);
    };

    const dispatch = useDispatch();

    const upload = () => {
      const formData = new FormData();
      const url = '/api/notice-board/write';
      formData.append("title", title);
      formData.append("content", content);
      for (let i=0; i<3; i++) {
      formData.append("file", file[i]);
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

    const date = new Date();

    const onSave = () => {
      const _inputData = {
        id: '',
        title:title,
        content: content,
        name: name,
        date: Date.toLocaleString()
      }
      dispatch(dataSave(_inputData))
      setTitle('')
      setContent('')
      setName('')
      router.push('/board')
      upload();
    }
    
    return (
  <>

<div className={styles.writeBoard}>

  <h2 style={{color:'#3F51B5', paddingTop:'20px', paddingLeft:'15%'}}>New Post</h2>

  <div className={styles.titleName} style={{marginBottom:'20px'}}>
  <div style={{width:'50%'}}>
      <h4 style={{color:'#656565'}}>Title</h4>
      <input className={styles.titleInput} type="text" value={title} placeholder="제목을 입력해주세요" onChange={titleChange}/>
  </div>
  <div style={{width:'20%'}}>
      <h4 style={{color:'#656565'}}>Name</h4>
      <input className={styles.nameInput} type="text" value={name} placeholder="이름을 입력해주세요" onChange={nameChange}/>
  </div>
  </div>

  <div className={styles.contentBox}>
    <div style={{width:'70%'}}>
      <h4 style={{color:'#656565'}}>Content</h4>
      <textarea className={styles.contentInput} type="text" value={content} placeholder="내용을 입력해주세요" onChange={contentChange} />

      <div className={styles.fileSubmit}>
      <label className={styles.fileLabel} onChange={handleFile}>
        <input type="file" multiple style={{display:'none'}}/>
        + Attach File
      </label>
        <Button variant="contained" color="primary" style={{
          width:'100px', height:'50px', borderRadius:'15px'}} onClick={onSave}>
            SUBMIT
        </Button>
      </div>
    </div>
  </div>

</div>



  </>
    )
}