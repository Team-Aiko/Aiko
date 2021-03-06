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
    postedUpdated : {
        display:'flex',
        flexDirection:'column'
    }
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

    const [updatedTime, setUpdatedTime] = useState('');
    const [updateUserPk, setUpdateUserPk] = useState('');

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

    //????????? ????????? pk??? ??????
    const [deletedFilePk, setDeletedFilePk] = useState([]);

    //?????? ?????? ????????? (from decoding token API)
    const [currentUserPk, setCurrentUserPk] = useState(undefined);

    //Editor Content State
    const [editorState, setEditorState] = useState(EditorState.createEmpty());

    const editorToHtml = draftToHtml(convertToRaw(editorState.getCurrentContent()));

    const onEditorStateChange = (editorState) => {
        setEditorState(editorState);
        console.log(stateToHTML(editorState.getCurrentContent()));
    };

    //????????? ????????? pkNum
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

    //Post Detail ???????????? (??????, ?????????, ?????? ??????, ????????? ?????? ???)
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
            setUpdatedTime(res.UPDATE_DATE)
            setUpdateUserPk(res.UPDATE_USER_PK)
        })
        .catch((error) => {
            console.log(error)
        })
    };

    useEffect(() => {
        getDetails();
    }, [pk]);

    const handleTitle = (e) => {
        setTitle(e.target.value);
    };

    //????????? ??????
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
                console.log('?????? ?????? ??????' + error);
                alert('????????? ????????? ?????????????????????.');
            });
    };

    //????????? ??????
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
                alert('?????????????????????.');
                router.push('/board');
            })
            .catch((error) => {
                console.log(error);
            });
    };

    //?????? ???????????? ?????? ?????? (??? ????????? ?????? ??????)
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

    // ????????? ?????? ???????????? ????????? ???????????? ??????
    const removeSelectedFile = (filePk) => {
        setFiles(files.filter((file) => file.NBF_PK !== filePk));
    };

    //???????????? ????????? ??????, ?????? ?????? ??????, ?????? ?????? ??????
    const [addedFile, setAddedFile] = useState([]);

    const handleAddedFile = (e) => {
        setAddedFile((prev) => [...prev, ...e.target.files]);
        console.log(addedFile);
    };

    const deleteAddedFile = (name) => {
        setAddedFile(addedFile.filter((file) => file.name !== name));
    };

    //?????? ??????
    const maxFile = () => {
        if(addedFile.length + files.length > 3) {
            alert('????????? ?????? ???????????? ?????? ???????????????.');
            setAddedFile([]);
        }
    }

    useEffect(() => {
        maxFile()
    }, [files, addedFile])

    //UnixTimeStamp ??????
    function getUnixTime(t) {
        const date = new Date(t * 1000);
        const year = date.getFullYear();
        const month = '0' + (date.getMonth() + 1);
        const day = '0' + date.getDate();
        const hour = '0' + (date.getHours() +2);
        const minute = '0' + (date.getMinutes());
        const second = '0' + date.getSeconds();
        return year + '-' + month.substr(-2) + '-' + day.substr(-2) + ' ' + hour.substr(-2) + ':' + minute.substr(-2);
    }

    const updateCheck = () => {
        if(getUnixTime(updatedTime) == getUnixTime(date)) {
            setUpdateUserPk('');
            setUpdatedTime (0);
        }
    };

    useEffect(() => {
        updateCheck()
    }, [updatedTime]);

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
                        disabled={writerPk !== currentUserPk || isAdmin}
                        onChange={handleTitle}
                        disabled={disabled}
                    />

                    <div className={classes.postedUpdated}>
                    <p style={{ fontSize: '13px', color: '#6F6A6A' }}>
                        Posted by {name}, {getUnixTime(date)}
                    </p>

                    {
                        updatedTime !== 0
                        ? <p style={{ fontSize: '13px', color: '#6F6A6A' }}>
                        Updated by {updateUserPk}, {getUnixTime(updatedTime)}
                    </p>
                        : <></>
                    }
                    </div>
                </div>

                <MyBlock>
                    <Editor
                        className={classes.editor}
                        // ???????????? ?????? ????????? ???????????? ?????????
                        wrapperClassName='wrapper-class'
                        // ????????? ????????? ????????? ?????????
                        editorClassName='editor'
                        // ?????? ????????? ????????? ?????????
                        toolbarClassName={disabled ? 'toolbarHidden' : 'toolbar'}
                        // ?????? ??????
                        toolbar={{
                            // inDropdown: ?????? ????????? ????????? ????????? ?????????????????? ??????????????????
                            list: { inDropdown: true },
                            textAlign: { inDropdown: true },
                            link: { inDropdown: true },
                            history: { inDropdown: false },
                        }}
                        placeholder='????????? ??????????????????.'
                        // ????????? ??????
                        localization={{
                            locale: 'ko',
                        }}
                        // ????????? ??????
                        editorState={editorState}
                        // ???????????? ?????? ????????? ????????? onEditorStateChange ??????
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
                                ??????
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
                            {disabled == false ? (
                                <Button
                                    size='small'
                                    className={classes.margin}
                                    style={{ color: 'grey' }}
                                    onClick={() => {
                                        setDeletedFilePk([...deletedFilePk, file.NBF_PK]);
                                        removeSelectedFile(file.NBF_PK);
                                    }}
                                >
                                    ??????
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

                        {writerPk == currentUserPk || isAdmin? (
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

                    {writerPk == currentUserPk || isAdmin ? (
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
            </div>
        </>
    );
};

export default innerPost;
