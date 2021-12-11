import React, { useState, useEffect } from 'react';
import 'react-draft-wysiwyg/dist/react-draft-wysiwyg.css';
import { EditorState } from 'draft-js';
import dynamic from 'next/dynamic';
const Editor = dynamic(() => import('react-draft-wysiwyg').then((mod) => mod.Editor), { ssr: false });
import styled from 'styled-components';
import createImagePlugin from '@draft-js-plugins/image';
import styles from '../styles/WritePost.module.css';
import { Button } from '@material-ui/core';
import {get, post} from '../_axios'

const imagePlugin = createImagePlugin();

const MyBlock = styled.div`
    .wrapper-class {
        width: 40%;
        margin: 0 auto;
        margin-bottom: 4rem;
    }
    .editor {
        height: 500px !important;
        border: 1px solid #f1f1f1 !important;
        padding: 5px !important;
        border-radius: 2px !important;
    }
`;

const writePost1 = () => {
    const [editorState, setEditorState] = useState(EditorState.createEmpty());

    const onEditorStateChange = (editorState) => {
        // editorState에 값 설정
        setEditorState(editorState);
    };

    const [title, setTitle] = useState('');
    const [name, setName] = useState('');
    const [files, setFiles] = useState([]);

    const titleChange = (e) => {
        setTitle(e.target.value);
    };

    const handleFile = (e) => {
        setFiles([...files, e.target.files[0], e.target.files[1], e.target.files[2]]);
        if (e.target.files[1] == null) {
            setFiles([...files, e.target.files[0]]);
        }
        if (e.target.files[2] == null) {
            setFiles([...files, e.target.files[0], e.target.files[1]]);
        }
        if (e.target.files[1] == null && e.target.files[2] == null) {
            setFiles([...files, e.target.files[0]]);
        }
    };

    const deleteSelectedFile = () => {
        setFiles([]);
    };

    const getCurrentUserName = async () => {
        const res = await get('/api/account/decoding-token')
            .then((res) => {
                console.log(res);
                setName(res.data.result.FIRST_NAME + ' ' + res.data.result.LAST_NAME);
            })
            .catch((error) => {
                console.log(error);
            });
    };

    useEffect(() => {
        getCurrentUserName();
    }, []);

    const upload = () => {
        const formData = new FormData();
        const url = '/api/notice-board/write';
        const obj = {
            title: title,
            content: editorState,
        };
        formData.append('obj', JSON.stringify(obj));
        formData.append('file', files[0]);
        formData.append('file', files[1]);
        formData.append('file', files[2]);
        const config = {
            headers: {
                'content-type': 'multipart/form-data',
            },
        };
        if (title.length < 1) {
            alert('제목을 입력하세요.');
            return;
        }
        if (editorState.length < 1) {
            alert('내용을 입력하세요.');
            return;
        }
        post(url, formData, config)
            .then((response) => {
                console.log(response);
                router.push('/board');
            })
            .catch((error) => {
                console.log('작성 실패 이유' + error);
                alert('게시글 작성에 실패하셨습니다.');
            });
    };

    return (
        <div>
            <div className={styles.titleName} style={{ marginBottom: '20px' }}>
                <div style={{ width: '50%' }}>
                    <h4 style={{ color: '#656565' }}>Title</h4>
                    <input
                        className={styles.titleInput}
                        type='text'
                        value={title}
                        placeholder='제목을 입력해주세요'
                        onChange={titleChange}
                        onInvalid={'야'}
                    />
                </div>
                <div style={{ width: '20%' }}>
                    <h4 style={{ color: '#656565' }}>Name</h4>
                    <input className={styles.nameInput} type='text' value={name} disabled />
                </div>
            </div>

            <MyBlock>
                <Editor
                    // 에디터와 툴바 모두에 적용되는 클래스
                    wrapperClassName='wrapper-class'
                    // 에디터 주변에 적용된 클래스
                    editorClassName='editor'
                    // 툴바 주위에 적용된 클래스
                    toolbarClassName='toolbar-class'
                    // 툴바 설정
                    toolbar={{
                        // inDropdown: 해당 항목과 관련된 항목을 드롭다운으로 나타낼것인지
                        list: { inDropdown: true },
                        textAlign: { inDropdown: true },
                        link: { inDropdown: true },
                        history: { inDropdown: false },
                    }}
                    placeholder='내용을 작성해주세요.'
                    // 한국어 설정
                    localization={{
                        locale: 'ko',
                    }}
                    // 초기값 설정
                    editorState={editorState}
                    // 에디터의 값이 변경될 때마다 onEditorStateChange 호출
                    onEditorStateChange={onEditorStateChange}
                    plugins={[imagePlugin]}
                />
            </MyBlock>

            <div style={{ display: 'flex', flexDirection: 'column', width: '50%' }}>
                {files.map((file) => (
                    <label style={{ fontSize: '10px', display: 'flex', flexDirection: 'row' }} key={file.name}>
                        <input
                            value={JSON.stringify(file.name)}
                            disabled
                            style={{ borderStyle: 'none', color: '#3F51B5', width: '100%', backgroundColor: 'white' }}
                        />
                    </label>
                ))}
            </div>

            {files.length > 0 ? (
                <Button size='small' style={{ width: '20%', color: '#656565' }} onClick={deleteSelectedFile}>
                    파일 일괄 삭제
                </Button>
            ) : (
                <div>
                    <h5 style={{ color: '#3F51B5' }}>파일이 존재하지 않습니다.</h5>
                    <p style={{ fontSize: '7px', color: '#848482' }}>* 파일은 한 번에 세개까지 첨부 가능합니다.</p>
                </div>
            )}

            <div className={styles.fileSubmit}>
                <label className={styles.fileLabel} onChange={handleFile}>
                    <input type='file' multiple style={{ display: 'none' }} />+ Attach File
                </label>
                <Button
                    variant='contained'
                    color='primary'
                    style={{
                        width: '100px',
                        height: '50px',
                        borderRadius: '15px',
                    }}
                    onClick={upload}
                >
                    SUBMIT
                </Button>
            </div>
        </div>
    );
};

export default writePost1;
