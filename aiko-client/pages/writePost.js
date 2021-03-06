import React, { useState, useEffect } from 'react';
import 'react-draft-wysiwyg/dist/react-draft-wysiwyg.css';
import { EditorState, convertToRaw, ContentState } from 'draft-js';
import dynamic from 'next/dynamic';
const Editor = dynamic(() => import('react-draft-wysiwyg').then((mod) => mod.Editor), { ssr: false });
import styled from 'styled-components';
import styles from '../styles/WritePost.module.css';
import { Button } from '@material-ui/core';
import { post } from '../_axios';
import axios from 'axios';
import router from 'next/router';
import draftToHtml from 'draftjs-to-html';
const htmlToDraft = dynamic(
    () => {
        return import('html-to-draftjs');
    },
    { ssr: false },
);
import { stateToHTML } from 'draft-js-export-html';
import useInputCustom from '../customHook/custom';

const MyBlock = styled.div`
    .wrapper-class {
        width: 100%;
        margin: 0 auto;
        margin-bottom: 4rem;
    }
    .editor {
        height: 400px !important;
        border: 1px solid #f1f1f1 !important;
        padding: 5px !important;
        border-radius: 2px !important;
    }
`;

const writePost = () => {
    const [editorState, setEditorState] = useState(EditorState.createEmpty());
    const editorToHtml = draftToHtml(convertToRaw(editorState.getCurrentContent()));
    const onEditorStateChange = (editorState) => {
        setEditorState(editorState);
        console.log(stateToHTML(editorState.getCurrentContent()));
    };

    const title = useInputCustom('');
    const [name, setName] = useState('');
    const [files, setFiles] = useState([]);

    const handleFile = (e) => {
        setFiles((prev) => [...prev, ...Object.values(e.target.files)]);
    };

    const deleteSelectedFile = (name) => {
        setFiles(files.filter((file) => file.name !== name));
    };

    useEffect(() => {
        const maxFileWarning = () => {
            if (files.length > 3) {
                alert('3개까지 전송 가능합니다.');
                setFiles(files.splice(0, 3));
            }
        };
        maxFileWarning();
    }, [files]);

    useEffect(() => {
        const getCurrentUserName = async () => {
            await axios
                .get('/api/account/decoding-token')
                .then((res) => {
                    console.log(res);
                    setName(res.data.result.FIRST_NAME + ' ' + res.data.result.LAST_NAME);
                })
                .catch((error) => {
                    console.log(error);
                });
        };
        getCurrentUserName();
    }, []);

    const upload = () => {
        const formData = new FormData();
        const url = '/api/notice-board/write';
        const obj = {
            title: title.value,
            content: editorToHtml,
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
        if (title.length < 1 || editorState.length < 1) {
            alert('제목 혹은 내용을 입력해주세요.');
            return;
        }
        post(url, formData, config)
            .then(() => {
                router.push('/board');
            })
            .catch(() => {
                alert('게시글 작성에 실패하셨습니다.');
            });
    };

    return (
        <div>
            <h2 style={{ color: '#3F51B5', paddingTop: '20px', paddingLeft: '15%' }}>New Post</h2>

            <hr className={styles.writeHr} />

            <div className={styles.titleName} style={{ marginBottom: '20px' }}>
                <div style={{ width: '50%' }}>
                    <h4 style={{ color: '#656565' }}>Title</h4>
                    <input className={styles.titleInput} type='text' placeholder='제목을 입력해주세요' {...title} />
                </div>
                <div style={{ width: '20%' }}>
                    <h4 style={{ color: '#656565' }}>Name</h4>
                    <input className={styles.nameInput} type='text' value={name} disabled />
                </div>
            </div>
            <div className={styles.contentBox}>
                <div style={{ width: '70%' }}>
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
                        />
                    </MyBlock>

                    {files.map((file, index) => (
                        <div className={styles.fileContainer}>
                            <div key={index} style={{ display: 'flex' }}>
                                <p className={styles.files}>{file.name}</p>
                                <Button
                                    size='small'
                                    onClick={() => {
                                        deleteSelectedFile(file.name);
                                    }}
                                    style={{ color: 'grey' }}
                                >
                                    삭제
                                </Button>
                            </div>
                        </div>
                    ))}

                    {files.length == 0 ? (
                        <div>
                            <h5 style={{ color: '#3F51B5' }}>파일이 존재하지 않습니다.</h5>
                            <p style={{ fontSize: '7px', color: '#848482' }}>
                                * 파일은 한 번에 세개까지 첨부 가능합니다.
                            </p>
                        </div>
                    ) : (
                        <></>
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
            </div>
        </div>
    );
};

export default writePost;
