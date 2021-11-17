import * as React from 'react';
import axios from 'axios';
import { useState, useEffect } from 'react';
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
import Posts from '../components/Posts.js';


const useStyles = makeStyles((theme) => ({
  root: {
    '& > *': {
      marginTop: theme.spacing(2),
    },
  },
}));

export default function board() {

const [posts, setPosts] = useState([]);
const [loading, setLoading] = useState(false);
const [currentPage, setCurrentPage] = useState(1);
const [postsPerPage, setPostsPerPage] = useState(10);
const [btnNumbers, setBtnNumbers] = useState([]);
const [row, setRow] = useState(10);

useEffect(() => {
    const fetchPosts = async () => {
        setLoading(true);
        const res = await axios.get(`/api/notice-board/list?option=${postsPerPage}&pageNum=${currentPage}`);
        setPosts(res.data.result);
        console.log(res.data.result);
        setLoading(false);
    }
    fetchPosts()
},[currentPage, postsPerPage]);

const pageBtn = () => {
    const pageButtons = [];
    axios.get(`/api/notice-board/btn-size?option=${postsPerPage}`)
    .then((res) => {
        for(let i=0; i<=res.data.result; i++) {
            pageButtons = [...pageButtons, i];
        }
        setBtnNumbers(pageButtons)
    })
}

useEffect(() => {
    pageBtn()
},[])


// useEffect(() => {
//     axios.get(`/api/notice-board/btn-size?option=${postsPerPage}`)
//     .then((res) => {
//         console.log(res.data.result);
//         for (let i=1; i <= res.data.result; i++){
//         setBtnNumbers([...btnNumbers, i]);
//         }
//     })
//     .catch((error) => {
//         console.log(error)
//     })
// },[postsPerPage])


const handleChange = (e) => {
        setRow(e.target.value)
};

const classes = useStyles();

return (
    <>

    <div className={styles.desc}>
        <h2 className={styles.aikoBoard}>AIKO notice board</h2>
            <div style={{marginRight:'30px'}}>
                <button onClick={() => {setPostsPerPage(10)}}>10</button>
                <button onClick={() => {setPostsPerPage(20)}}>20</button>
                <button onClick={() => {setPostsPerPage(30)}}>30</button>
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
                <Posts posts={posts} loading={loading}/>
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

    <div className={styles.paginateDiv}>
        {btnNumbers.map(btn => (
            <a className={styles.aTag} onClick={()=>{setCurrentPage(btn)}}>
                {btn}
            </a>
        ))}
    </div>

    </>
);
}