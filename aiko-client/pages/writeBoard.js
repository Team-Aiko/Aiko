import * as React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import styles from '../styles/WriteBoard.module.css';
import {useState} from 'react';
import Button from '@material-ui/core/Button';
import TextField from '@material-ui/core/TextField';

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

    const classes = useStyles();
  
    const titleChange = (e) => {
      setTitle(e.target.value);
    };
    
    const textChange = (e) => {
      setText(e.target.value);
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
    </form>

      <Button variant="contained" color="primary" style={{marginTop:'30px',
      width:'150px', height:'50px'}}>
        등록
      </Button>

    </div>
        </>
    )
}