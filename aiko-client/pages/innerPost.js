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

    const classes = useStyles();

    return (
        <>

        <div className={styles.outerContainer}>

        <div className={styles.nameDate}>
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

        <div className={styles.buttonDiv}>
            <Button size="small" className={classes.margin} style={{width:'20%'}}>
            이전 글 보기
            </Button>
            <Button size="small" className={classes.margin} style={{width:'20%'}}>
            다음 글 보기
            </Button>
        </div>

        </>
    );
}