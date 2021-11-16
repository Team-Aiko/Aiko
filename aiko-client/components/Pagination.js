import React from 'react';
import styles from '../styles/Pagination.module.css';

const Pagination = ({postsPerPage, totalPosts, paginate}) => {

const pageNumbers = [];

for (let i=1; i<= Math.ceil(totalPosts / postsPerPage); i++) {
    pageNumbers.push(i);
}
    
    return (
            <div className={styles.aTagContainer}>
                {pageNumbers.map(number => (
                        <a className={styles.aTag} onClick={() => paginate(number)}>
                            {number}
                        </a>
                ))}
            </div>
    )
}

export default Pagination
