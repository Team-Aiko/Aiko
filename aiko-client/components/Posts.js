import React from 'react';
import Link from 'next/link';
import {useSelector, useDispatch} from 'react-redux';


const Posts = ({posts, loading}) => {

    if(loading) {
        return <h2>Loading...</h2>
    }


    return (
        <div>
            <ul>
                {posts.map (post => (
                    <li>
                        <Link href="/innerPost">
                            <a>
                                {post.title}
                            </a>
                        </Link>
                    </li>
                ))}
            </ul>
        </div>
    )
}

export default Posts;
