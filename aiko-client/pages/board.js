import * as React from 'react';
import axios from 'axios';
import { useState, useEffect } from 'react';
import router from 'next/router';
import styles from '../styles/Board.module.css';
import { makeStyles } from '@material-ui/core/styles';
import Posts from '../components/Posts.js';
import { MenuItem, InputLabel, Select, FormControl, Button } from '@material-ui/core';

const useStyles = makeStyles((theme) => ({
    formControl: {
        margin: theme.spacing(1),
        minWidth: 120,
    },
    selectEmpty: {
        marginTop: theme.spacing(2),
    },
}));

export default function board() {
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [postsPerPage, setPostsPerPage] = useState(10);
    const [btnNumbers, setBtnNumbers] = useState([]);

    // Rows 갯수 관리
    const handleChange = (e) => {
        setPostsPerPage(e.target.value);
    };

    useEffect(() => {
        const fetchPosts = async () => {
            setLoading(true);
            const res = await axios.get(`/api/notice-board/list?option=${postsPerPage}&pageNum=${currentPage}`);
            setPosts(res.data.result);
            console.log(res.data.result);
            console.log(res);
            setLoading(false);
        };
        fetchPosts();
    }, [currentPage, postsPerPage]);

    const pageBtn = () => {
        const pageButtons = [];
        axios.get(`/api/notice-board/btn-size?option=${postsPerPage}`).then((res) => {
            for (let i = 1; i <= res.data.result; i++) {
                pageButtons.push(i);
            }
            setBtnNumbers(pageButtons);
            console.log('loop?');
        });
    };

    useEffect(() => {
        pageBtn();
    }, [postsPerPage]);

    const classes = useStyles();

    return (
        <>
            <div className={styles.desc}>
                <h3 className={styles.aikoBoard}>
                    <span style={{ color: '#3f51b5', fontSize: '35px' }}>AIKO</span> notice board
                </h3>
                <div className={styles.forRows}>
                    <FormControl className={classes.formControl}>
                        <InputLabel id='demo-simple-select-label' style={{ color: '#3f51b5' }}>
                            For rows
                        </InputLabel>
                        <Select
                            labelId='demo-simple-select-label'
                            id='demo-simple-select'
                            value={postsPerPage}
                            onChange={handleChange}
                        >
                            <MenuItem value={10}>10</MenuItem>
                            <MenuItem value={20}>20</MenuItem>
                            <MenuItem value={30}>30</MenuItem>
                        </Select>
                    </FormControl>
                </div>
            </div>

            <div style={{ width: '80%', height: '90%', display: 'block', margin: '3% auto' }}>
                <div>
                    <table className={styles.table}>
                        <thead className={styles.thead}>
                            <tr>
                                <th className={styles.th} style={{ width: '7%' }}>
                                    No.
                                </th>
                                <th className={styles.th} style={{ width: '50%', textAlign: 'left' }}>
                                    Title
                                </th>
                                <th className={styles.th} style={{ width: '20%', textAlign: 'left' }}>
                                    Posted by
                                </th>
                                <th className={styles.th} style={{ width: '15%', textAlign: 'left' }}>
                                    Date
                                </th>
                            </tr>
                        </thead>

                        <tbody className={styles.tbody}>
                            <Posts posts={posts} loading={loading} />
                        </tbody>
                    </table>
                </div>

                <div className={styles.postButtonContainer}>
                    <Button
                        variant='contained'
                        color='primary'
                        style={{
                            width: '100px',
                            height: '50px',
                            borderRadius: '15px',
                        }}
                        onClick={() => {
                            router.push('/writePost');
                        }}
                    >
                        NEW POST
                    </Button>
                </div>

                <div className={styles.paginateDiv}>
                    {btnNumbers.map((btn) => (
                        <a
                            className={styles.aTag}
                            onClick={() => {
                                setCurrentPage(btn);
                            }}
                        >
                            {btn}
                        </a>
                    ))}
                </div>
            </div>
        </>
    );
}
