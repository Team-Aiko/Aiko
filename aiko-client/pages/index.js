import React, { useState, useEffect } from 'react';
// * socket Test
import { useSelector, useDispatch } from 'react-redux';
import { get } from '../_axios';
import { setMember } from '../_redux/memberReducer';

export default function CComp() {
    const userInfo = useSelector((state) => state.accountReducer);
    const memberList = useSelector((state) => state.memberReducer);
    const dispatch = useDispatch();

    useEffect(() => {
        if (userInfo.USER_PK) {
            loadMemberList();
            console.log('🚀 ~ file: index.js ~ line 16 ~ CComp ~ userInfo', userInfo);
        }
    }, [userInfo.USER_PK]);

    const loadMemberList = () => {
        const url = '/api/company/member-list';

        get(url).then((result) => {
            const excludeMe = result.filter((row) => row.USER_PK !== userInfo.USER_PK);
            dispatch(setMember(excludeMe));
        });
    };

    return <PComp userInfo={userInfo} />;
}

function PComp(props) {
    return <></>;
}
