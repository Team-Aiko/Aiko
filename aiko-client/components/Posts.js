import React from 'react';
import Link from 'next/link';
import styles from '../styles/Posts.module.css';
import useState from 'react';

const Posts = ({ posts, loading }) => {
    function getUnixTime(t) {
        const date = new Date(t * 1000);
        const year = date.getFullYear();
        const month = '0' + (date.getMonth() + 1);
        const day = '0' + date.getDate();
        const hour = '0' + date.getHours();
        const minute = '0' + date.getMinutes();
        const second = '0' + date.getSeconds();
        return year + '-' + month.substr(-2) + '-' + day.substr(-2) + ' ' + hour.substr(-2) + ':' + second.substr(-2);
    }

    return (
        <>
            {posts.map((post) => (
                <tr key={post.NOTICE_BOARD_PK}>
                    <td className={styles.td} style={{ width: '7%' }}>
                        <Link href={'/innerPost/' + post.NOTICE_BOARD_PK}>
                            <a>{post.NOTICE_BOARD_PK}</a>
                        </Link>
                    </td>
                    <td className={styles.td} style={{ textAlign: 'left', width: '50%' }}>
                        <Link href={'/innerPost/' + post.NOTICE_BOARD_PK}>
                            <a>{post.TITLE}</a>
                        </Link>
                    </td>
                    <td className={styles.td} style={{ width: '25%', textAlign: 'left' }}>
                        {post.USER_NAME}
                    </td>
                    <td className={styles.td} style={{ width: '20%', textAlign: 'left' }}>
                        {getUnixTime(post.CREATE_DATE)}
                    </td>
                </tr>
            ))}
        </>
    );
};

export default Posts;
