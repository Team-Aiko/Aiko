import React from 'react';
import Link from 'next/link';
import styles from '../styles/Posts.module.css';
import useState from 'react';

const Posts = ({posts, loading}) => {

    if(loading) {
        return <h2 style={{color:'#3f51b5'}}> Loading... </h2>
    };

    return (
        <>
            {posts.map(post => (
                <tr>
                    <td className={styles.td} style={{width:'7%'}}><Link href={'/innerPost/' + post.NOTICE_BOARD_PK}><a>{post.NOTICE_BOARD_PK}</a></Link></td>
                    <td className={styles.td} style={{textAlign:'left', width:'50%'}}><Link href={'/innerPost/' + post.NOTICE_BOARD_PK}><a>{post.TITLE}</a></Link></td>
                    <td className={styles.td} style={{width:'25%', textAlign:'left'}}>작성자</td>
                    <td className={styles.td} style={{width:'15%', textAlign:'left'}}>{post.CREATE_DATE}</td>
                </tr>
            ))}
        </>
    )
}

export default Posts
