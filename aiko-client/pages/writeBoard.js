import * as React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import FilledInput from '@material-ui/core/FilledInput';
import FormControl from '@material-ui/core/FormControl';
import FormHelperText from '@material-ui/core/FormHelperText';
import Input from '@material-ui/core/Input';
import InputLabel from '@material-ui/core/InputLabel';
import OutlinedInput from '@material-ui/core/OutlinedInput';
import styles from '../styles/WriteBoard.module.css';
import {useState} from 'react';
import TextareaAutosize from '@material-ui/core/TextareaAutosize';
import Button from '@material-ui/core/Button';

const useStyles = makeStyles((theme) => ({
  root: {
    '& > *': {
      margin: theme.spacing(1),
    },
  },
}));


export default function writeBoard() {

    const [title, setTitle] = useState('');
    const [text, setText] = useState('');
    const [name, setName] = useState('');
    const [position, setPosition] = useState('');

    const classes = useStyles();
  
    const titleChange = (e) => {
      setTitle(e.target.value);
    };
    
    const textChange = (e) => {
      setText(e.target.value);
    };

    const nameChange = (e) => {
      setName(e.target.value);
    };

    const positionChange = (e) => {
      setPosition(e.target.value);
    };

    const sendPost = () => {
      title={title}
      text={text}
    };


    
    return (
        <>

    <div className={styles.writeBoard}>

      <div className={styles.namePosition}>
      <div className={styles.titleContainer}>
      <FormControl variant="outlined" >
        <InputLabel htmlFor="component-outlined">이름</InputLabel>
        <OutlinedInput id="component-outlined" className={styles.nameInput}
        value={name} onChange={nameChange} label="Name" placeholder="이름을 입력해주세요"
        />
      </FormControl>
      </div>
      <div className={styles.titleContainer}>
      <FormControl variant="outlined" >
        <InputLabel htmlFor="component-outlined">직급</InputLabel>
        <OutlinedInput id="component-outlined" className={styles.positionInput}
        value={position} onChange={positionChange} label="Name" placeholder="직급을 입력해주세요"
        />
      </FormControl>
      </div>
      </div>

      <div className={styles.titleContainer}>
      <FormControl variant="outlined" >
        <InputLabel htmlFor="component-outlined">제목</InputLabel>
        <OutlinedInput id="component-outlined" className={styles.titleInput}
        value={title} onChange={titleChange} label="Name" placeholder="제목을 입력해주세요"
        />
      </FormControl>
      </div>

      

      <div>
        <InputLabel htmlFor="component-outlined">내용</InputLabel>
        <TextareaAutosize id="component-outlined" aria-label="empty textarea" 
        onChange={textChange} value={text} className={styles.textInput} minRows={15}/>
      </div>

      <Button variant="contained" color="primary" style={{marginTop:'30px',
      width:'150px', height:'50px'}}>
        등록
      </Button>

    </div>
        </>
    )
}