import React, { useState, useEffect } from 'react';
// * socket Test
import { useSelector, useDispatch } from 'react-redux';
import { sendGet } from '../_axios/util';

export default function CComp() {
    const userInfo = useSelector((state) => state.accountReducer);

    useEffect(() => {
        if (userInfo.USER_PK) {
            console.log('🚀 ~ file: index.js ~ line 16 ~ CComp ~ userInfo', userInfo);
        }

        const url = '/test';
        const aa = {
            q1: 123,
            q2: 'str',
        };

        sendGet(url, aa);
    }, [userInfo.USER_PK]);

    return <PComp userInfo={userInfo} />;
}

function PComp(props) {
    return <></>;
}
