import React, { useState, useEffect } from 'react';
import { sendGet, sendPost } from '../_axios';
import axios from 'axios';
import { compressFiles } from '../_fileCompressor';
import { saveAs } from 'file-saver';

export default function DownloadDemo() {
    useEffect(() => {
        const url = '/api/store/download-drive-file?fileId=5';

        axios({
            url: url, //your url
            method: 'GET',
            responseType: 'blob', // important
        }).then((response) => {
            let disposition = decodeURIComponent(response.headers['content-disposition']);
            let strList = disposition.split(';');
            let fileName = strList[strList.length - 1];
            fileName = fileName.split(`filename\*\=UTF-8\'\'`)[1];
            saveAs(new Blob([response.data]), fileName);
        });

        // const urls = [
        //     'http://localhost:5000/store/download-drive-file?fileId=4',
        //     'http://localhost:5000/store/download-drive-file?fileId=5',
        // ];
        // const fileNames = ['냥켓.gif', 'miko.jpg'];

        // compressFiles('files.zip', urls, fileNames);
    }, []);

    return <>파일 다운로드 데모</>;
}
