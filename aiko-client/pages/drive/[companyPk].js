import React from 'react';
import styles from '../../styles/Drive.module.css';
import DriveFolder from '../../components/DriveFolder';
import DriveFile from '../../components/DriveFile';
import DriveBin from '../../components/DriveBin';
import { useRouter } from 'next/router';
import { useState, useEffect } from 'react';
import { get, post } from '../../_axios';


const drive = () => {

    const router = useRouter();
    const { companyPk } = router.query;

    //폴더들, DriveFile.js의 Props
    const [rootFolder, setRootFolder] = useState([]);
    //현재 사용자가 선택한 Folder_PK 값 추적
    const [selectedFolderPk, setSelectedFolderPk] = useState(0);
    //현재 클릭한 folder의 하위 파일들
    const [folderFile, setFolderFile] = useState([]);


    // DriveFile 컴포넌트에서 사용자가 선택한 Folder_Pk 값 추적시 필요한 함수 (부모 <--> 자식)
    const getFolderPk = (number) => {
        setSelectedFolderPk(number)
    };

    // 만들어진 폴더 가져오기, 의존값은 selectedFolderPk
    const viewFolder = () => {
        const url = `/api/store/drive/view-folder?folderId=${selectedFolderPk}`;
        get(url)
        .then((res) => {
            console.log('Get Root Folders', res);
            setRootFolder(res.directChildrenFolders);
            setFolderFile(res.filesInFolder);
        })
        .catch((error) => {
            console.log(error)
        })
    };


    useEffect(() => {
        viewFolder()
    }, [selectedFolderPk])

    console.log('folderFile', folderFile)

    return (
        <div className={styles.mainContainer}>
            <DriveFolder getFolderPk={getFolderPk}/>

            {
                selectedFolderPk !== 0
                ? <DriveFile rootFolder={rootFolder} getFolderPk={getFolderPk} selectedFolderPk={selectedFolderPk}
                    folderFile={folderFile}/>
                : <></>
            }

            {
                selectedFolderPk == 0
                ? <DriveBin></DriveBin>
                : <></>
            }
        </div>
    )
}

export default drive
