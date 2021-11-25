import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import styles from '../styles/WritePost.module.css';
import {useState, useEffect} from 'react';
import Button from '@material-ui/core/Button';
import axios from 'axios';
import {useDispatch} from 'react-redux';
import {dataSave} from '../_redux/boardReducer';
import router from 'next/router';


export default function writePost() {

    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [name, setName] = useState('');
    const [files, setFiles] = useState([]);
    
    const titleChange = (e) => {
      setTitle(e.target.value);
    };
    
    const contentChange = (e) => {
      setContent(e.target.value);
    };

    const handleFile = (e) => {
      setFiles([...files, e.target.files[0], e.target.files[1], e.target.files[2]])
      if (e.target.files[1] == null) {
        setFiles([...files, e.target.files[0]])
      } if (e. target.files[2] == null) {
        setFiles([...files, e.target.files[0]])
      }
    };

    const nameChange = (e) => {
      setName(e.target.value);
    };

    const maxFileAlert = (handleFile) => {
      if(files.length > 3) {
        alert('파일 전송은 최대 3개 까지 가능합니다.')
      }
    };

    useEffect(() => {
      maxFileAlert();
      console.log(files[0], files[1], files[2]);
    }, [files]);

    const upload = () => {
      const formData = new FormData();
      const url = '/api/notice-board/write';
      const obj = {
        'title' : title,
        'content' : content
      }
      formData.append('obj', JSON.stringify(obj));
      formData.append('file', files[0]);
      formData.append('file', files[1]);
      formData.append('file', files[2]);
      const config = {
        headers: {
          "content-type" : "multipart/form-data"
        },
      };
      if(title.length < 1) {
        alert('제목을 입력하세요')
        return;
      };
      axios.post(url, formData, config)
        .then((response) => {
          console.log(response);
          router.push('/board');
        })
        .catch((error) => {
          console.log('작성 실패 이유' + error);
          alert('게시글 작성에 실패하셨습니다.')
        })
    };
    
    return (
  <>

<div className={styles.writeBoard}>

  <h2 style={{color:'#3F51B5', paddingTop:'20px', paddingLeft:'15%'}}>New Post</h2>

  <hr className={styles.writeHr}/>

  <div className={styles.titleName} style={{marginBottom:'20px'}}>
    <div style={{width:'50%'}}>
        <h4 style={{color:'#656565'}}>Title</h4>
        <input className={styles.titleInput} type="text" value={title} placeholder="제목을 입력해주세요" onChange={titleChange} onInvalid={'야'}/>
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
          
    <div style={{display:'flex', flexDirection:'column', width:'40%'}}>      
      {files.map(file => (
            <label style={{fontSize:'10px'}}>
              <input value={(JSON.stringify(file.name))} disabled style={{borderStyle:"none",color:'#3F51B5',width:'100%'}}/>
            </label>
        ))}
    </div>

      <div className={styles.fileSubmit}>
        <label className={styles.fileLabel} onChange={handleFile}>
          <input type="file" multiple style={{display:'none'}}/>
          + Attach File
        </label>
        <Button variant="contained" color="primary" style={{
          width:'100px', height:'50px', borderRadius:'15px'}} onClick={upload}>
            SUBMIT
        </Button>
      </div>
    </div>
  </div>

</div>



  </>
    )
}