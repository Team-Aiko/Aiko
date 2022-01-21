import React from 'react';
import styles from '../styles/Drive.module.css';
import { useState, useEffect } from 'react';
import { get, post } from '../_axios';

const DriveFolder = ( {getFolderPk} ) => {

    //사용자가 지정한 폴더 이름
    const [folderName, setFolderName] = useState('');

    //폴더 이름 변경시 필요한 함수
    const changeFolderName = (e) => {
        setFolderName(e.target.value)
    };

    //폴더 생성 API, 최상단 폴더 생성 API기 때문에 parentPK 프로퍼티 값 1로 고정
    const createFolder = () => {
        const url = `/api/store/drive/create-folder`;
        const data = {
            folderName: folderName,
            parentPK: 1
        };
        post(url, data)
        .then((res) => {
            console.log('Make Root Folder', res);
            setFolderName('');
        })
        .catch((error) => {
            console.log(error)
        })
    };

    return (
        <div className={styles.folderContainer}>
            <input value={folderName} onChange={changeFolderName} /> <button onClick={createFolder}>파일 추가</button>

            <div>
                <div onClick={ () => { getFolderPk(1) } }>파일함</div>
            </div>

            <div>
                <div>휴지통</div>
            </div>
        </div>
    )
}

export default DriveFolder
