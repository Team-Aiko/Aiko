import react from 'react';
import styles from '../styles/innerPost.module.css';
import { makeStyles } from '@material-ui/core/styles';
import Button from '@material-ui/core/Button';
import { useState, useEffect } from 'react';
import router from 'next/router';
import axios from 'axios';


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

  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [name, setName] = useState('');
  const [date, setDate] = useState('');
  const [postNum, setPostNum] = useState(4);

  console.log(innerPost)

  const handleTitle = (e) => {
    setTitle(e.target.value);
  };

  const handleContent = (e) => {
    setContent(e.target.value);
  };

  const handleName = (e) => {
    setName(e.target.value);
  };


  useEffect(() => {
    const getDetail = async () => {
      const res = await axios.get(`/api/notice-board/detail?num=${postNum}`);
      setTitle(res.data.result.TITLE);
      setContent(res.data.result.CONTENT);
    }
    getDetail()
  },[]);


  const classes = useStyles();

    return (
    <>

  <div className={styles.outerContainer}>

      <div className={styles.titleName}>
        <input className={styles.titleInput} onChange={handleTitle} value={title}/>
        <p style={{fontSize:'17px', color:'#6F6A6A'}}>Posted by {name}, {date}</p>
      </div>

      <div className={styles.contentArea}>
        <textarea className={styles.contentInput} value={content} onChange={handleContent} />
      </div>


      <div className={styles.reviseDelete}>
        <Button variant="contained" color="primary"style={{
          width:'100px', height:'50px', borderRadius:'15px', marginLeft:'15%' , backgroundColor:'#969696'}}
        onClick={()=>{router.push('/board')}}>
            LIST
        </Button>

        <div className={styles.align} style={{marginRight:'10%'}}>
          <Button variant="contained" color="primary" style={{
            width:'100px', height:'50px', borderRadius:'15px'}}
          >
              REVISE
          </Button>

          <Button variant="contained" color="primary" style={{
            width:'100px', height:'50px', borderRadius:'15px', marginLeft:'10px', backgroundColor:'#D93D3D'}}
          >
              DELETE
          </Button>
        </div>
      </div>

      <div className={styles.anotherPost} style={{marginTop:'15px'}}>
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



    </div>

        </>
    );
}