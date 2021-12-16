import React, { useState, useEffect } from 'react';
import { sendPost } from '../_axios';

export default function fileUploadDemo(props) {
    const [file, setFile] = useState(undefined);

    const onChangeFile = () => {
        const uploader = document.getElementById('fileSlot');
        const uploadedFile = uploader.files[0];
        setFile(uploadedFile);
    };

    const onSubmit = () => {
        const url = '/api/store/drive/save-files';
        sendPost(url, 'multipart', { file: file, folderPK: 1 })
            .then((data) => {
                console.log(data);
            })
            .catch((err) => console.error(err));
    };

    return (
        <>
            <input id='fileSlot' type='file' onChange={onChangeFile} />
            <input type='submit' value='전송' onClick={onSubmit} />
        </>
    );
}
