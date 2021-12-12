import React from 'react';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import axios from 'axios';
import {get, post} from '../../_axios';
import styles from '../../styles/innerPost.module.css';
import Button from '@material-ui/core/Button';
import { makeStyles } from '@material-ui/core/styles';
import ReactHtmlParser from 'react-html-parser';
import draftToHtml from 'draftjs-to-html';
const htmlToDraft = dynamic(
    () => {
        return import('html-to-draftjs');
    },
    { ssr: false },
);
import { stateToHTML } from 'draft-js-export-html';
import 'react-draft-wysiwyg/dist/react-draft-wysiwyg.css';
import { EditorState, convertToRaw, ContentState, convertFromRaw } from 'draft-js';
import dynamic from 'next/dynamic';
const Editor = dynamic(() => import('react-draft-wysiwyg').then((mod) => mod.Editor), { ssr: false });
import styled from 'styled-components';
import createImagePlugin from '@draft-js-plugins/image';
import {stateFromHTML} from 'draft-js-import-html';

const useStyles = makeStyles((theme) => ({
    root: {
        flexGrow: 1,
    },
    paper: {
        padding: theme.spacing(2),
        textAlign: 'center',
        color: theme.palette.text.secondary,
    },
}));

const imagePlugin = createImagePlugin();

const MyBlock = styled.div`
    .wrapper-class {
        width: 80%;
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

const IntroduceContent = styled.div`
    position: relative;
    border: 0.0625rem solid #d7e2eb;
    border-radius: 0.75rem;
    overflow: hidden;
    padding: 1.5rem;
    width: 50%;
    margin: 0 auto;
    margin-bottom: 4rem;
`;

const innerPost = () => {

    const onEditorStateChange = (editorState) => {
        setEditorState(editorState);
    };

    const [innerPosts, setInnerPosts] = useState([]);
    const [title, setTitle] = useState('');
    const [name, setName] = useState('');
    const [date, setDate] = useState('');
    const [pkNum, setPkNum] = useState('');
    const [files, setFiles] = useState([]);
    
    const [editorState, setEditorState] = useState('Dude what the');

    const [filePkNum, setFilePkNum] = useState('');
    const [deletedFilePk, setDeletedFilePk] = useState([]);

    //현재 유저 데이터 (from decoding token API)
    const [currentUserPk, setCurrentUserPk] = useState(undefined);

    //게시글 작성자 pkNum
    const [writerPk, setWriterPk] = useState(undefined);

    const router = useRouter();
    const { pk } = router.query;

    useEffect(() => {
        const getFileNames = async () => {
            const res = await axios
                .get(`/api/notice-board/detail?num=${pk}`)
                .then((res) => {
                    const fileNumber = [];
                    for (let i = 0; i < res.data.result.files.length; i++) {
                        fileNumber.push(res.data.result.files[i].ORIGINAL_NAME);
                    }
                    if (res.data.result.files.length < 2) {
                        console.log('파일이 2개보다 작습니다');
                    }
                    setFiles([...files, fileNumber]);
                    console.log(files);
                })
                .catch((error) => {
                    console.log(error);
                });
        };
        getFileNames();
    }, []);

    const getDetails = async () => {
        const url = (`/api/notice-board/detail?num=${pk}`)
        await axios.get(url)
        .then((res) => {
            setInnerPosts(res.data.result);
            setTitle(res.data.result.TITLE);
            setEditorState(res.data.result.DESCRIPTION);
            setName(res.data.result.USER_NAME);
            setDate(res.data.result.CREATE_DATE);
            setPkNum(res.data.result.NOTICE_BOARD_PK);
            setWriterPk(res.data.result.USER_PK);
        })
    };

    useEffect(() => {
        getDetails()
    },[])

    useEffect(() => {
        const getSpecifics = async () => {
            const res = await axios.get(`/api/notice-board/detail?num=${pk}`).then((res) => {
                if (res.data.result.files.length == 0) {
                    setFilePkNum(0);
                }
                if (res.data.result.files.length > 0) {
                    setFilePkNum(res.data.result.files[0].NBF_PK);
                }
            });
        };
        getSpecifics();
    }, []);

    const handleTitle = (e) => {
        setTitle(e.target.value);
    };

    const deleteFile1 = () => {
        setDeletedFilePk([...deletedFilePk, filePkNum]);
        console.log(deletedFilePk);
    };

    const deleteFile2 = () => {
        setDeletedFilePk([...deletedFilePk, filePkNum + 1]);
        console.log(deletedFilePk);
    };

    const deleteFile3 = () => {
        setDeletedFilePk([...deletedFilePk, filePkNum + 2]);
        console.log(deletedFilePk);
    };

    const updateArticle = () => {
        const formData = new FormData();
        const url = '/api/notice-board/update-article';
        const obj = {
            num: pkNum,
            title: title,
            content: stateToHTML(editorState.getCurrentContent()),
            'delFilePks[]': deletedFilePk,
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
        axios
            .post(url, formData, config)
            .then((response) => {
                console.log(response);
                router.push('/board');
            })
            .catch((error) => {
                console.log('작성 실패 이유' + error);
                alert('게시글 작성에 실패하셨습니다.');
            });
    };

    const deleteArticle = () => {
        const url = '/api/notice-board/delete-article';
        const data = {
            num: pkNum,
        };
        const config = {
            headers: {
                'content-type': 'application/json',
            },
        };
        axios
            .post(url, data, config)
            .then((response) => {
                console.log(response);
                alert('삭제되었습니다.');
                router.push('/board');
            })
            .catch((error) => {
                console.log(error);
            });
    };

    const classes = useStyles();

    const getCurrentUserInfo = async () => {
        const res = await axios
            .get('/api/account/decoding-token')
            .then((res) => {
                console.log(res);
                setCurrentUserPk(res.data.result.USER_PK);
                console.log(currentUserPk);
            })
            .catch((error) => {
                console.log(error);
            });
    };

    useEffect(() => {
        getCurrentUserInfo();
    }, []);

    function getUnixTime(t) {
        const date = new Date(t * 1000);
        const year = date.getFullYear();
        const month = '0' + (date.getMonth() + 1);
        const day = '0' + date.getDate();
        const hour = '0' + date.getHours();
        const minute = '0' + date.getMinutes();
        const second = '0' + date.getSeconds();
        return year + '-' + month.substr(-2) + '-' + day.substr(-2) + ' ' + hour.substr(-2) + ':' + second.substr(-2);
    }

    return (
        <>
            <div className={styles.outerContainer}>
                <div className={styles.titleName}>
                    <input
                        className={styles.titleInput}
                        value={title}
                        disabled={writerPk !== currentUserPk}
                        onChange={handleTitle}
                    />
                    <p style={{ fontSize: '13px', color: '#6F6A6A' }}>
                        Posted by {name}, {getUnixTime(date)}
                    </p>
                </div>

                <div className={styles.contentArea}>
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
                </div>

                {files.map((file) => {
                    if (file.length == 0) {
                        return (
                            <div className={styles.fileInput}>
                                <h5 style={{ color: '#3F51B5' }}>THERE IS NO FILE.</h5>
                            </div>
                        );
                    }
                    if (file.length == 1) {
                        return (
                            <div className={styles.fileInput}>
                                <div>
                                    <a
                                        href={`/api/store/download-noticeboard-file?fileId=${filePkNum}`}
                                        className={styles.files}
                                    >
                                        {file[0]}
                                    </a>
                                    <Button
                                        size='small'
                                        onClick={deleteFile1}
                                        className={classes.margin}
                                        style={{ color: 'grey' }}
                                    >
                                        삭제
                                    </Button>
                                </div>
                            </div>
                        );
                    }
                    if (file.length == 2) {
                        return (
                            <div className={styles.fileInput}>
                                <div>
                                    <a
                                        href={`/api/store/download-noticeboard-file?fileId=${filePkNum}`}
                                        className={styles.files}
                                    >
                                        {file[0]}
                                    </a>
                                    <Button
                                        size='small'
                                        onClick={deleteFile1}
                                        className={classes.margin}
                                        style={{ color: 'grey' }}
                                    >
                                        삭제
                                    </Button>
                                </div>
                                <div>
                                    <a
                                        href={`/api/store/download-noticeboard-file?fileId=${filePkNum + 1}`}
                                        className={styles.files}
                                    >
                                        {file[1]}
                                    </a>
                                    <Button
                                        size='small'
                                        onClick={deleteFile2}
                                        className={classes.margin}
                                        style={{ color: 'grey' }}
                                    >
                                        삭제
                                    </Button>
                                </div>
                            </div>
                        );
                    }
                    if (file.length == 3) {
                        return (
                            <div className={styles.fileInput}>
                                <div>
                                    <a
                                        href={`/api/store/download-noticeboard-file?fileId=${filePkNum}`}
                                        className={styles.files}
                                    >
                                        {file[0]}
                                    </a>
                                    <Button
                                        size='small'
                                        onClick={deleteFile1}
                                        className={classes.margin}
                                        style={{ color: 'grey' }}
                                    >
                                        삭제
                                    </Button>
                                </div>
                                <div>
                                    <a
                                        href={`/api/store/download-noticeboard-file?fileId=${filePkNum + 1}`}
                                        className={styles.files}
                                    >
                                        {file[1]}
                                    </a>
                                    <Button
                                        size='small'
                                        onClick={deleteFile2}
                                        className={classes.margin}
                                        style={{ color: 'grey' }}
                                    >
                                        삭제
                                    </Button>
                                </div>
                                <div>
                                    <a href={`/api/store/download-noticeboard-file?fileId=${filePkNum + 1}`}></a>
                                    <Button
                                        size='small'
                                        onClick={deleteFile3}
                                        className={classes.margin}
                                        style={{ color: 'grey' }}
                                    >
                                        삭제
                                    </Button>
                                </div>
                            </div>
                        );
                    }
                })}

                <div className={styles.reviseDelete}>
                    <Button
                        variant='contained'
                        color='primary'
                        style={{
                            width: '80px',
                            height: '40px',
                            borderRadius: '15px',
                            backgroundColor: '#969696',
                        }}
                        onClick={() => {
                            router.push('/board');
                        }}
                    >
                        LIST
                    </Button>

                    <div className={styles.align}>
                        <Button
                            onClick={updateArticle}
                            variant='contained'
                            color='primary'
                            style={{
                                width: '80px',
                                height: '40px',
                                borderRadius: '15px',
                            }}
                        >
                            REVISE
                        </Button>

                        <Button
                            onClick={deleteArticle}
                            variant='contained'
                            color='primary'
                            style={{
                                width: '80px',
                                height: '40px',
                                borderRadius: '15px',
                                marginLeft: '5px',
                                backgroundColor: '#D93D3D',
                            }}
                        >
                            DELETE
                        </Button>
                    </div>
                </div>

                <div className={styles.anotherPost} style={{ marginTop: '15px' }}>
                    <div className={styles.previousPost}>
                        <Button size='small' className={classes.margin} style={{ width: '20%' }}>
                            이전 글 보기
                        </Button>
                        <p
                            style={{ fontSize: '12px', color: '#9a9a9a', cursor: 'pointer' }}
                            onClick={function () {
                                alert('아직 기능 구현 중입니다.');
                            }}
                        >
                            기능 구현 필요
                        </p>
                    </div>

                    <div className={styles.nextPost}>
                        <Button size='small' className={classes.margin} style={{ width: '20%' }}>
                            다음 글 보기
                        </Button>
                        <p
                            style={{ fontSize: '12px', color: '#9a9a9a', cursor: 'pointer' }}
                            onClick={function () {
                                alert('아직 기능 구현 중입니다.');
                            }}
                        >
                            기능 구현 필요
                        </p>
                    </div>
                </div>
            </div>
        </>
    );
};

export default innerPost;
