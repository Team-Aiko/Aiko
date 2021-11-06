import react from 'react';
import styles from '../styles/innerPost.module.css';
import { makeStyles } from '@material-ui/core/styles';
import Paper from '@material-ui/core/Paper';
import Grid from '@material-ui/core/Grid';
import Button from '@material-ui/core/Button';
import { useState } from 'react';
import {useDispatch , useSelector} from 'react-redux';
import router from 'next/router';
import {editContent, removeContent} from '../_redux/boardReducer.js';

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

export default function innerPost() {

  const { selectRowData } = useSelector(state => state.boardReducer);

  const [title, setTitle] = useState(selectRowData.title);
  const [content, setContent] = useState(selectRowData.content);

  const handleTitle = (e) => {
    setTitle(e.target.value);
  }

  const handleContent = (e) => {
    setContent(e.target.value);
  }

  const dispatch = useDispatch();

  const onChange = () => {
    const _inputData = {
      id: selectRowData.id,
      title:title,
      content: content
    }
    const url = '/api/notice-board/update-article'
    const data = {
      'num': selectRowData.id,
      'title': JSON.stringify(title),
      'content': JSON.stringify(content)
    }
    const config = {
      headers: {
        "content-type" : 'application/json'
      }
    };
    axios.post(url, data, config)
    .then((response)=> {
      console.log(response.result)
    })
    .catch((error) => {
      console.log(error)
    });
    dispatch(editContent(_inputData))
    setTitle('');
    setContent('');
    router.push('/board');
  }

  const onRemove = () => {
    dispatch(removeContent(selectRowData.id))
    setTitle('');
    setContent('');
    const url = "/api/notice-board/delete-article";
    const data = {
      'num' : selectRowData.id
    }
    const config ={
      headers: {
        'content-type' : 'application/json'
      }
    };
    axios.post(url, data, config)
    .then((response)=> {
      console.log(response.result)
    })
    .catch((error)=> {
      console.log(error)
    });
    router.push('/board');
  }


    const classes = useStyles();

    return (
        <>

        <div>
          <input type='text' value={title} onChange={handleTitle} />
        </div>

        <div>
          <textarea value={content} onChange={handleContent} />
        </div>


        <div className={styles.reviseDelete}>
        <Button variant="outlined" style={{marginRight:'20px'}}>목록으로</Button>
        <Button variant="outlined" color="primary" style={{marginRight:'20px'}} onClick={onChange}>
          수정
        </Button>
        <Button variant="outlined" color="secondary" onClick={onRemove}>
          삭제
        </Button>
        </div>


        <div className={styles.anotherPost}>
          
            <div className={styles.previousPost}>
          <Button size="small" className={classes.margin} style={{width:'20%'}}>
          이전 글 보기
          </Button>

          <p style={{fontSize:'12px', color:'#9a9a9a', cursor:'pointer'}} onClick={function(){
            alert('아직 기능 구현 중입니다.')
          }}>사내식당 공지) 2021년 11월 건강한 식생활을 위한 채식주의 방침</p>
            </div>

          <div className={styles.nextPost}>
            <Button size="small" className={classes.margin} style={{width:'20%'}}>
            다음 글 보기
            </Button>

          <p style={{fontSize:'12px', color:'#9a9a9a', cursor:'pointer'}} onClick={function(){
            alert('아직 기능 구현 중입니다.')
          }}>2021년도 Aiko 프로젝트 감사 결과</p>
          </div>
        </div>

        </>
    );
}