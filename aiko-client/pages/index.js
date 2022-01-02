import React, { useState, useEffect } from 'react';
// * socket Test
import { useSelector, useDispatch } from 'react-redux';

export default function CComp() {
    const userInfo = useSelector((state) => state.accountReducer);

    useEffect(() => {
        if (userInfo.USER_PK) {
            console.log('🚀 ~ file: index.js ~ line 16 ~ CComp ~ userInfo', userInfo);
        }
    }, [userInfo.USER_PK]);

    console.log(userInfo.USER_PK)

    return <PComp userInfo={userInfo} />; 
}

function PComp(props) {

    return <>이게.. 로구인?</>;
}

