import React from 'react'

const Paginations = ({postsPerPage, totalPosts, paginate}) => {

    const pageNumbers = [];
    for(var i=1; i <= Math.ceil(totalPosts/ postsPerPage); i++) {
        pageNumbers.push(i);
    }

    return (
        <div>
            <ul>
                {pageNumbers.map(number => (
                    <li>
                        <a onClick={() => {
                            paginate(number)
                        }}>
                            {number}
                        </a>
                    </li>
                ))}
            </ul>
        </div>
    )
}

export default Paginations
