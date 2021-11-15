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
import Pagination from '../components/Pagination.js';

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

const [posts, setPosts] = useState([]);
const [loading, setLoading] = useState(false);
const [currentPage, setCurrentPage] = useState(1);
const [postsPerPage, setPostsPerPage] = useState(10);

useEffect(() => {
    const fetchPosts = async () => {
        setLoading(true);
        const res = await axios.get('http://localhost:5000/notice-board/list?option=10&pageNum=1');
        setPosts(res.result);
        setLoading(false);
    }
    fetchPosts()
},[]);

//Get current posts
const indexOfLastPost = currentPage * postsPerPage;
const indexOfFirstPost = indexOfLastPost - postsPerPage;
const currentPosts = posts.slice(indexOfFirstPost, indexOfLastPost);

const paginate = (pageNumber) => setCurrentPage(pageNumber);

const handleChange = (e) => {
        setRow(e.target.value)
};

const [row, setRow] = useState(10);

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
            <option value={row}>10</option>
            <option value={20} onClick={() => setRow(20)}>20</option>
            <option value={30} onClick={() => setRow(30)}>30</option>
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
                <Posts posts={currentPosts} loading={loading}/>
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
        <Pagination postsPerPage={postsPerPage} totalPosts={posts.length} paginate={paginate}/>
    </div>


    <div style={{ height: 300, width: '30%' }}>
        <div onClick={handleLogin}> 파일 다운로드 테스트 </div>
    </div>

    </>
);
}