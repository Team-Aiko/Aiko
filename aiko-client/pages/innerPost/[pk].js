import React from 'react';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import axios from 'axios';
import styles from '../../styles/innerPost.module.css';
import { Button, Typography } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import { Delete, Save, List, Edit } from '@material-ui/icons';
import { get, post } from '../../_axios';
import Link from 'next/link';
import Modal from '../../components/Modal.js';

//TEXT EDITOR imports!
import dynamic from 'next/dynamic';
const Editor = dynamic(() => import('react-draft-wysiwyg').then((mod) => mod.Editor), { ssr: false });
import { stateToHTML } from 'draft-js-export-html';
import draftToHtml from 'draftjs-to-html';
import styled from 'styled-components';
import { EditorState, convertToRaw, ContentState, KeyBindingUtil } from 'draft-js';
import 'react-draft-wysiwyg/dist/react-draft-wysiwyg.css';
import htmlToDraft from 'html-to-draftjs';

const MyBlock = styled.div`
    .wrapper-class {
        width: 100%;
        margin: 0 auto;
        margin-bottom: 4rem;
        z-index: 10 !important;
    }
    .editor {
        height: 400px !important;
        border: 1px solid #f1f1f1 !important;
        padding: 5px !important;
        border-radius: 2px !important;
        z-index: 10 !important;
    }
    .toolbarHidden {
        display: none;
    }
`;

const useStyles = makeStyles((theme) => ({
    root: {
        flexGrow: 1,
    },
    paper: {
        padding: theme.spacing(2),
        textAlign: 'center',
        color: theme.palette.text.secondary,
    },
    editor: {
        zIndex: '10 !important',
    },
    postNo: {
        color: '#3F51B5',
        paddingTop: '20px',
        paddingLeft: '15%',
    },
    margin: {
        color: 'grey',
    },
    prevNext: {
        fontSize: '12px',
        color: '#9a9a9a',
        cursor: 'pointer',
    },
    modalDesc: {
        width: '90%',
        height: '30%',
        margin: '0 auto',
        textAlign: 'center',
    },
    modalButton: {
        display: 'flex',
        width: '80%',
        margin: '0 auto',
        justifyContent: 'space-around',
        padding: '20px',
    },
    fileLabel: {
        cursor: 'pointer',
        color: '#3f51b5',
    },
}));

const innerPost = () => {
    const classes = useStyles();

    const router = useRouter();
    const { pk } = router.query;

    //Details of Posts
    const [innerPosts, setInnerPosts] = useState([]);
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [name, setName] = useState('');
    const [date, setDate] = useState('');
    const [pkNum, setPkNum] = useState(undefined);
    const [files, setFiles] = useState([]);

    console.log(files);
    console.log(addedFile);

    const [isAdmin, setIsAdmin] = useState(false);
    const adminCheck = async () => {
        const url = '/api/company/check-admin';
        await get(url)
        .then((res) => {
            console.log('is this user Admin? =' + res)
            setIsAdmin(res);
        })
        .catch((error) => {
            console.log(error)
        })
    };
    useEffect(() => {
        adminCheck()   
    },[])

    //페이지 이동에 필요한 변수
    const goNext = Number(pk) + 1;
    const goPrev = Number(pk) - 1;

    //삭제할 파일들 pk값 받기
    const [deletedFilePk, setDeletedFilePk] = useState([]);

    //현재 유저 데이터 (from decoding token API)
    const [currentUserPk, setCurrentUserPk] = useState(undefined);

    //Editor Content State
    const [editorState, setEditorState] = useState(EditorState.createEmpty());

    const editorToHtml = draftToHtml(convertToRaw(editorState.getCurrentContent()));

    const onEditorStateChange = (editorState) => {
        setEditorState(editorState);
        console.log(stateToHTML(editorState.getCurrentContent()));
    };

    //게시글 작성자 pkNum
    const [writerPk, setWriterPk] = useState(undefined);

    //warning modal open
    const [openModal, setOpenModal] = useState(false);

    //Edit Authority
    const [disabled, setDisabled] = useState(true);

    //Edit Authoirty Check
    const editCheck = () => {
        if (writerPk == currentUserPk || isAdmin == true) {
            setDisabled(!disabled);
        }
    };

    //Post Detail 불러오기 (제목, 작성자, 작성 날짜, 게시글 내용 등)
    const getDetails = async () => {
        await get(`/api/notice-board/detail?num=${pk}`).then((res) => {
            console.log('res' + res);
            setInnerPosts([...innerPosts, res]);
            setTitle(res.TITLE);
            setContent(res.CONTENT);
            setName(res.USER_NAME);
            setDate(res.CREATE_DATE);
            setPkNum(res.NOTICE_BOARD_PK);
            setWriterPk(res.USER_PK);
            const filtered = res.files.filter(file => file.IS_DELETE == 0);
            setFiles(filtered);
        });
    };

    useEffect(() => {
        getDetails();
    }, [pk]);

    const [nextPage, setNextPage] = useState('');

    const next = Number(pk) + 1;

    const [previousPage, setPreviousPage] = useState('');
    //Post, Previous Post Title
    const getNextPage = async () => {
        await get(`/api/notice-board/detail?num=${next}`).then((res) => {
            setNextPage(res.TITLE);
        });
    };

    const previous = Number(pk) - 1;

    const getPreviousPage = async () => {
        await get(`/api/notice-board/detail?num=${previous}`).then((res) => {
            setPreviousPage(res.TITLE);
        });
    };

    useEffect(() => {
        getNextPage();
        getPreviousPage();
        if (previousPage == '') {
            previous - 1;
            getPreviousPage();
        }
    }, [pk]);

    const handleTitle = (e) => {
        setTitle(e.target.value);
    };

    //게시글 수정
    const updateArticle = () => {
        const formData = new FormData();
        const url = '/api/notice-board/update-article';
        const obj = {
            num: pkNum,
            title: title,
            content: editorToHtml,
            delFilePks: deletedFilePk,
        };
        if (deletedFilePk.length == 0) {
            deletedFilePk.push(0);
        }
        formData.append('obj', JSON.stringify(obj));
        formData.append('file', addedFile[0]);
        formData.append('file', addedFile[1]);
        formData.append('file', addedFile[2]);
        const config = {
            headers: {
                'content-type': 'multipart/form-data',
            },
        };
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

    //게시글 삭제
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

    //현재 접속중인 유저 정보 (글 작성자 자동 기입)
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

    // 선택한 파일 삭제버튼 클릭시 배열에서 제거
    const removeSelectedFile = (filePk) => {
        setFiles(files.filter((file) => file.NBF_PK !== filePk));
    };

    //차례대로 추가된 파일, 파일 추가 함수, 파일 삭제 함수
    const [addedFile, setAddedFile] = useState([]);

    const handleAddedFile = (e) => {
        setAddedFile((prev) => [...prev, ...e.target.files]);
        console.log(addedFile);
    };

    const deleteAddedFile = (name) => {
        setAddedFile(addedFile.filter((file) => file.name !== name));
    };

    //파일 제한
    const maxFile = () => {
        if(addedFile.length + files.length > 3) {
            alert('파일은 최대 세개까지 전송 가능합니다.');
        }
    }

    useEffect(() => {
        maxFile()
    }, [files, addedFile])

    //UnixTimeStamp 변경
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

    //rendering editor states
    const htmlToEditor = content;

    useEffect(() => {
        const blocksFromHtml = htmlToDraft(htmlToEditor);
        if (blocksFromHtml) {
            const { contentBlocks, entityMap } = blocksFromHtml;
            const contentState = ContentState.createFromBlockArray(contentBlocks, entityMap);
            const editorState = EditorState.createWithContent(contentState);
            setEditorState(editorState);
        }
    }, [content]);

    return (
        <>
            <h2 className={classes.postNo}>Post no.{pkNum}</h2>

            <hr className={styles.writeHr} />

            <div className={styles.outerContainer}>
                <div className={styles.titleName}>
                    <input
                        className={disabled ? styles.titleInput : styles.titleInputOnChange}
                        value={title}
                        disabled={writerPk !== currentUserPk}
                        onChange={handleTitle}
                        disabled={disabled}
                    />
                    <p style={{ fontSize: '13px', color: '#6F6A6A' }}>
                        Posted by {name}, {getUnixTime(date)}
                    </p>
                </div>

                <MyBlock>
                    <Editor
                        className={classes.editor}
                        // 에디터와 툴바 모두에 적용되는 클래스
                        wrapperClassName='wrapper-class'
                        // 에디터 주변에 적용된 클래스
                        editorClassName='editor'
                        // 툴바 주위에 적용된 클래스
                        toolbarClassName={disabled ? 'toolbarHidden' : 'toolbar'}
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
                        readOnly={disabled}
                    />
                </MyBlock>

                {disabled == false ? (
                    <label className={classes.fileLabel} onChange={handleAddedFile}>
                        <input type='file' multiple style={{ display: 'none' }} />+ Attach File
                    </label>
                ) : (
                    <></>
                )}

                {addedFile?.map((file, key) => (
                    <div className={styles.fileInput} key={file.name}>
                        <div>
                            <a className={styles.files}>{file.name}</a>
                            <Button
                                size='small'
                                className={classes.margin}
                                style={{ color: 'grey' }}
                                onClick={() => deleteAddedFile(file.name)}
                            >
                                삭제
                            </Button>
                        </div>
                    </div>
                ))}

                {files?.map((file, key) => (
                    <div className={styles.fileInput} key={file.NBF_PK}>
                        <div>
                            <a
                                href={`/api/store/download-noticeboard-file?fileId=${file.NBF_PK}`}
                                className={styles.files}
                            >
                                {file.ORIGINAL_NAME}
                            </a>
                            {writerPk == currentUserPk && disabled == false ? (
                                <Button
                                    size='small'
                                    className={classes.margin}
                                    style={{ color: 'grey' }}
                                    onClick={() => {
                                        setDeletedFilePk([...deletedFilePk, file.NBF_PK]);
                                        removeSelectedFile(file.NBF_PK);
                                    }}
                                >
                                    삭제
                                </Button>
                            ) : (
                                <></>
                            )}
                        </div>
                    </div>
                ))}


                <div className={styles.reviseDelete}>
                    <div>
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
                            <List />
                        </Button>

                        {writerPk == currentUserPk ? (
                            <Button
                                variant='contained'
                                color='primary'
                                style={{
                                    width: '80px',
                                    height: '40px',
                                    borderRadius: '15px',
                                    backgroundColor: '#969696',
                                    marginLeft: '5px',
                                }}
                                onClick={editCheck}
                            >
                                <Edit />
                            </Button>
                        ) : (
                            <></>
                        )}
                    </div>

                    {writerPk == currentUserPk ? (
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
                                <Save />
                            </Button>

                            <Button
                                onClick={() => {
                                    setOpenModal(!openModal);
                                }}
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
                                <Delete />
                            </Button>
                        </div>
                    ) : (
                        <></>
                    )}
                </div>

                {openModal == true ? (
                    <Modal
                        open={openModal}
                        onClose={() => {
                            setOpenModal(false);
                        }}
                        Title='Delete Post'
                    >
                        <div className={classes.modalDesc}>
                            <Typography variant='h6' gutterBottom>
                                Are you sure to delete the post?
                            </Typography>
                        </div>

                        <div className={classes.modalButton}>
                            <Button onClick={deleteArticle}>Yes</Button>
                        </div>
                    </Modal>
                ) : (
                    <></>
                )}

                <div className={styles.anotherPost} style={{ marginTop: '15px' }}>
                    <Link
                        href={
                            previousPage == null
                                ? `/innerPost/${encodeURIComponent(pk)}`
                                : `/innerPost/${encodeURIComponent(goPrev)}`
                        }
                    >
                        <div className={styles.previousPost}>
                            <Button size='small' style={{ width: '20%' }}>
                                이전 글 보기
                            </Button>
                            <p className={classes.prevNext}>{previousPage}</p>
                        </div>
                    </Link>

                    <Link
                        href={
                            nextPage == null
                                ? `/innerPost/${encodeURIComponent(pk)}`
                                : `/innerPost/${encodeURIComponent(goNext)}`
                        }
                    >
                        <div className={styles.nextPost}>
                            <Button size='small' style={{ width: '20%' }}>
                                다음 글 보기
                            </Button>
                            <p className={classes.prevNext}>{nextPage}</p>
                        </div>
                    </Link>
                </div>
            </div>
        </>
    );
};

export default innerPost;
