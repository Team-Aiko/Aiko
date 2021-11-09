import * as React from 'react';
import axios from 'axios';
import { useState } from 'react';
import Button from '@material-ui/core/Button';
import router from 'next/router';
import Link from 'next/link';
import { useSelector, useDispatch } from 'react-redux';
import {selectRow} from '../_redux/boardReducer';


const handleLogin = () => {
    const url = '/api/notice-board/files';
    const config = {
        header: {
            'content-type': 'application/json',
        },
    };
    (async () => {
        try {
            await get(url, config);
        } catch (err) {
            console.log(err);
        }
    })();
};

export default function board() {

const {inputData} = useSelector((state) => state.boardReducer);
const {lastId} = useSelector((state) => state.boardReducer);

const dispatch = useDispatch();

const selectContent = (id) => {
    dispatch(selectRow(id))
};

return (
    <>
    <div>
        <table className="table">
            <thead>
                <tr>
                    <th>번호</th>
                    <th>제목</th>
                    <th>작성자</th>
                    <th>날짜</th>
                    <th>조회수</th>
                </tr>
            </thead>

            <tbody>
                <tr>
                    <td></td>
                    <td></td>
                </tr>
                {
                    lastId !== 0 ?
                    inputData.map(rowData => (
                        rowData.id !== '' &&
                    <tr>
                        <td onClick={() => selectContent(rowData.id)}><Link href='/innerPost'><a>{rowData.id}</a></Link></td>
                        <td onClick={() => selectContent(rowData.id)}><Link href='/innerPost'><a>{rowData.title}</a></Link></td>
                    </tr>
                    )) :
                    <tr>
                        <td></td>
                        <td>작성된 글이 없습니다.</td>
                    </tr>
                }   
            </tbody>
        </table>
    </div>

    <button onClick={()=>{router.push('/writePost')}}>글작성</button>

        <div style={{ height: 800, width: '100%' }}>
            <div onClick={handleLogin}> 파일 다운로드 테스트 </div>
        </div>
    </>
);
}