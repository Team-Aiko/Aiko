import React from 'react';
import axios from 'axios';
import { useState, useEffect } from 'react';
import Posts from '../components/Posts.js';
import Paginations from '../components/Paginations.js';
import axiosInstance from '../_axios/interceptor.js';
import { useDispatch } from 'react-redux';

const post = () => {
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [postsPerPage, setPostsPerPage] = useState(10);

    useEffect(() => {
        const fetchPosts = async () => {
            setLoading(true);
            const res = await axios.get('https://jsonplaceholder.typicode.com/posts');
            setPosts(res.data);
            setLoading(false);
        };

        fetchPosts();
    }, []);

    //GET CURRENT POSTS
    const indexOfLastPost = currentPage * postsPerPage;
    const indexOfFirstPost = indexOfLastPost - postsPerPage;
    const currentPosts = posts.slice(indexOfFirstPost, indexOfLastPost);

    // Change Page

    const paginate = (pageNumber) => {
        setCurrentPage(pageNumber);
    };

    return (
        <div>
            <h1>PAGINATION TEST</h1>
            <Posts posts={currentPosts} loading={loading} />
            <Paginations postsPerPage={postsPerPage} totalPosts={posts.length} paginate={paginate} />
        </div>
    );
};

export default post;
