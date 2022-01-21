import React from 'react';
import styles from '../styles/Drive.module.css';
import { useState, useEffect } from 'react';
import { get, post } from '../_axios';


//rootFolder, getFolderPk, selectedFolderPk는 [companyPk].js 폴더와 상호작용, 자세한건 [companyPk].js 페이지 참조
const DriveFile = ( {rootFolder, getFolderPk, selectedFolderPk} ) => {

    //하위 폴더 생성
    const [folderName, setFolderName] = useState('');

    //하위 폴더 이름
    const changeFolderName = (e) => {
        setFolderName(e.target.value)
    };
    //폴더 생성 API
    const createFolder = () => {
        const url = '/api/store/drive/create-folder';
        const data = {
            folderName : folderName,
            parentPK : selectedFolderPk
        };
        post(url, data)
        .then((res) => {
            console.log('Make Subfolder API', res);
            setFolderName('');
        })
        .catch((error) => {
            console.log(error)
        })
    };

    const [deletingFolderPk , setDeletingFolderPk] = useState(0)

    const deleteItem = () => {
        const url = '/api/store/drive/delete-files';
        const data = {
            folderPKs : deletingFolderPk
        }
        post(url, data)
        .then((res) => {
            console.log('Delete Items', res)
        })
        .catch((error) => {
            console.log(error)
        })
    };

    useEffect(() => {
        deleteItem()
    }, [deletingFolderPk])

    const [file, setFile] = useState([]);

    const fileToUpload = (e) => {
        setFile((prev) => [...prev, ...Object.values(e.target.files)]);
    }

    const uploadFile = () => {
        const formData = new FormData();
        const url = '/api/store/drive/save-files';
        formData.append('files', file);
        formData.append('folderPK', selectedFolderPk);
        const config = {
            headers: {
                'content-type': 'multipart/form-data',
            },
        };
        post(url, formData, config)
            .then((res) => {
                console.log('File Upload', res);
            })
            .catch((error) => {
                console.log(error);
            });
    };

    console.log('upload File', file)

    return (
        <div className={styles.fileContainer}>

            <input value={folderName} onChange={changeFolderName} /><button onClick={createFolder}>하위 폴더 추가</button>

            <input type='file' multiple onChange={fileToUpload} /><button onClick={uploadFile}>파일 추가</button>

            {
                rootFolder?.map((root) => (
                <div>
                    <div key={root.FOLDER_PK} onClick={ () => { getFolderPk(root.FOLDER_PK) } }>
                    {root.FOLDER_NAME}
                    </div>

                    <div>
                    <button onClick={ () => {setDeletingFolderPk(root.FOLDER_PK)} }>삭제</button>
                    </div>
                </div>
                ))
            }
        </div>
    )
}

export default DriveFile
