import * as React from 'react';
import axios from 'axios';
import { useState } from 'react';
import Button from '@material-ui/core/Button';
import router from 'next/router';
import Link from 'next/link';
import { useSelector, useDispatch } from 'react-redux';
import {selectRow} from '../_redux/boardReducer';
import styles from '../styles/Board.module.css';
import FormControl from '@material-ui/core/FormControl';
import Select from '@material-ui/core/Select';
import { makeStyles } from '@material-ui/core/styles';
import InputLabel from '@material-ui/core/InputLabel';
import Pagination from '@material-ui/lab/Pagination';


const handleLogin = () => {
    const url = '/api/notice-board/files';
    const config = {
        header: {
            'content-type': 'application/json',
        },
    };
    (async () => {
        try {
            await get(url, config);
        } catch (err) {
            console.log(err);
        }
    })();
};

const useStyles = makeStyles((theme) => ({
  root: {
    '& > *': {
      marginTop: theme.spacing(2),
    },
  },
}));


export default function board() {

const {inputData} = useSelector((state) => state.boardReducer);
const {lastId} = useSelector((state) => state.boardReducer);

const dispatch = useDispatch();

const selectContent = (id) => {
    dispatch(selectRow(id))
};

const handleChange = (e) => {
        setRow(e.target.value)
};

const [row, setRow] = useState('');
const [pagingNum, setPagingNum] = useState(10)

const classes = useStyles();

return (
    <>
    <div className={styles.desc}>
        <h2 className={styles.aikoBoard}>AIKO notice board</h2>

        <div style={{marginRight:'30px'}}>
        <FormControl variant="outlined" className={styles.formControl}>
            <InputLabel htmlFor="outlined-age-native-simple">Rows</InputLabel>
            <Select
            native
            value={row}
            onChange={handleChange}
            label="Age"
            >
            <option aria-label="None" value="" />
            <option value={10}>10</option>
            <option value={20}>20</option>
            <option value={30}>30</option>
            </Select>
        </FormControl>
        </div>
    </div>

    <div>
        <table className={styles.table}>
            <thead className={styles.thead}>
                <tr>
                    <th className={styles.th} style={{width:'7%'}}>No.</th>
                    <th className={styles.th} style={{width:'50%', textAlign:'left'}}>Title</th>
                    <th className={styles.th} style={{width:'20%', textAlign:'left'}}>Posted by</th>
                    <th className={styles.th} style={{width:'15%', textAlign:'left'}}>Date</th>
                </tr>
            </thead>

            <tbody className={styles.tbody}>
                <tr>
                    <td></td>
                    <td></td>
                </tr>
                {
                    lastId !== 0 ?
                    inputData.map(rowData => (
                        rowData.id !== '' &&
                    <tr>
                        <td className={styles.td} onClick={() => selectContent(rowData.id)}><Link href='/innerPost'><a>{rowData.id}</a></Link></td>
                        <td className={styles.td} style={{textAlign:'left'}} onClick={() => selectContent(rowData.id)}><Link href='/innerPost'><a>{rowData.title}</a></Link></td>
                        <td className={styles.td} style={{textAlign:'left'}}>{rowData.name}</td>
                        <td className={styles.td} style={{textAlign:'left'}}>{rowData.date}</td>
                    </tr>
                    )) :
                    <tr>
                        <td className={styles.td}></td>
                        <td className={styles.td}>작성된 글이 없습니다.</td>
                    </tr>
                }   
            </tbody>
        </table>
    </div>

    <div className={styles.postButtonContainer}>
        <Button variant="contained" color="primary" style={{
          width:'100px', height:'50px', borderRadius:'15px'}}
        onClick={()=>{router.push('/writePost')}}>
            NEW POST
        </Button>
    </div>

    <div className={styles.root}>
      <Pagination count={pagingNum}/>
    </div>


    <div style={{ height: 300, width: '30%' }}>
        <div onClick={handleLogin}> 파일 다운로드 테스트 </div>
    </div>

    </>
);
}