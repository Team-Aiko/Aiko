import react from 'react';
import styles from '../styles/innerPost.module.css';
import { makeStyles } from '@material-ui/core/styles';
import Paper from '@material-ui/core/Paper';
import Grid from '@material-ui/core/Grid';
import Button from '@material-ui/core/Button';

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

  const deletePost = () => {
    const url = '/api/notice-board/delete-article';
  }

    const classes = useStyles();

    return (
        <>

        <div className={styles.outerContainer}>

        <div className={styles.nameDate}>
        <Grid style={{width:'10%'}}>
          <Paper className={classes.paper} style={{textAlign:'center'}}>1</Paper>
        </Grid>
        <Grid style={{width:'30%'}}>
          <Paper className={classes.paper} style={{textAlign:'left'}}>작성자</Paper>
        </Grid>
        <Grid style={{width:'30%'}}>
          <Paper className={classes.paper} style={{textAlign:'left'}}>작성일</Paper>
        </Grid>
        </div>

            
        <Grid
          container
          direction="column"
          justifyContent="flex-start"
          alignItems="stretch"
          style={{width:'80%', marginBottom:'10px'}}
        >
          <Paper className={classes.paper} style={{textAlign:'left'}}>제목</Paper>
        </Grid>

        <Grid
          container
          direction="column"
          justifyContent="flex-start"
          alignItems="stretch"
          style={{width:'80%'}}
        >
          <Paper className={classes.paper} style={{height:'300px', textAlign:'left'}}>내용</Paper>
        </Grid>
        </div>


        <div className={styles.reviseDelete}>
        <Button variant="outlined" style={{marginRight:'20px'}}>목록으로</Button>
        <Button variant="outlined" color="primary" style={{marginRight:'20px'}}>
          수정
        </Button>
        <Button variant="outlined" color="secondary">
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