import React from 'react';
import {useEffect, useState} from 'react';
import {useRouter} from 'next/router';
import axios from 'axios';
import styles from '../../styles/innerPost.module.css';
import Button from '@material-ui/core/Button';
import { makeStyles } from '@material-ui/core/styles';
import DeletePostModal from '../../components/DeletePostModal.js';


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

const innerPost = () => {


    const [innerPosts, setInnerPosts] = useState([]);
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [name, setName] = useState('');
    const [date, setDate] = useState('')
    const [pkNum, setPkNum] = useState('');
    const [popup, setPopup] = useState(false);
    const [files, setFiles] = useState([])

    const [isdel, setIsDel] = useState(0);
    const [filePkNum, setFilePkNum] = useState('');
    const [deletedFilePk, setDeletedFilePk] = useState([]);

    //타임스탬프 변환


    //이전 게시글, 다음 게시글 제목
    const [prevTitle, setPrevTitle] = useState('');
    const [nextTitle, setNextTitle] = useState('');

    //현재 유저 데이터 (from decoding token API)
    const [currentUserPk, setCurrentUserPk] = useState(undefined);

    //게시글 작성자 pkNum
    const [writerPk, setWriterPk] = useState(undefined);

    const router = useRouter();
    const {pk} = router.query;

    const [presentPk, setPresentPk] = useState({pk})

    useEffect(() => {
        const getFileNames = async () => {
            const res = await axios.get(`/api/notice-board/detail?num=${pk}`)
            .then((res) => {
                const fileNumber = [];
                for(let i=0; i<res.data.result.files.length; i++) {
                    fileNumber.push(res.data.result.files[i].ORIGINAL_NAME)
                }; if (res.data.result.files.length < 2) {
                    console.log('파일이 2개보다 작습니다')
                }
            setFiles([...files, fileNumber]);
            console.log(files)
            })
            .catch(error => {
                console.log(error)
            })
        }
        getFileNames()
    },[])

    useEffect(() => {
        const getDetails = async () => {
            const res = await axios.get(`/api/notice-board/detail?num=${pk}`);
            console.log(res);
            setInnerPosts(res.data.result);
            setTitle(res.data.result.TITLE);
            setContent(res.data.result.CONTENT);
            setName(res.data.result.USER_NAME);
            setDate(res.data.result.CREATE_DATE);
            setPkNum(res.data.result.NOTICE_BOARD_PK);
            setWriterPk(res.data.result.USER_PK)
        }
        getDetails()
    }, []);

    useEffect(() => {
        const getSpecifics = async () => {
            const res = await axios.get(`/api/notice-board/detail?num=${pk}`)
            .then((res) => {
                if(res.data.result.files.length == 0){
                    setFilePkNum(0);
                } if(res.data.result.files.length > 0) {
                    setFilePkNum(res.data.result.files[0].NBF_PK)
                }
            })
        }
        getSpecifics()
    }, []);


    const handleTitle = (e) => {
        setTitle(e.target.value);
    };

    const handleContent = (e) => {
        setContent(e.target.value);
    };

    const deleteFile1 = () => {
        setDeletedFilePk([...deletedFilePk, filePkNum]);
        console.log(deletedFilePk)
    };

    const deleteFile2 = () => {
        setDeletedFilePk([...deletedFilePk, filePkNum+1]);
        console.log(deletedFilePk)
    };

        const deleteFile3 = () => {
        setDeletedFilePk([...deletedFilePk, filePkNum+2]);
        console.log(deletedFilePk)
    };

    const updateArticle = () => {
      const formData = new FormData();
      const url = '/api/notice-board/update-article';
      const obj = {
        'num' : pkNum,
        'title' : title,
        'content' : content,
        'delFilePks[]': deletedFilePk
      }
      formData.append('obj', JSON.stringify(obj));
      formData.append('file', files[0]);
      formData.append('file', files[1]);
      formData.append('file', files[2]);
      const config = {
        headers: {
          "content-type" : "multipart/form-data"
        },
      };
      if(title.length < 1) {
        alert('제목을 입력하세요')
        return;
      };
      axios.post(url, formData, config)
        .then((response) => {
          console.log(response);
          router.push('/board');
        })
        .catch((error) => {
          console.log('작성 실패 이유' + error);
          alert('게시글 작성에 실패하셨습니다.')
        })
    };

    const deleteArticle = () => {
        const url = '/api/notice-board/delete-article';
        const data = {
            'num' : pkNum
        }
        const config = {
            headers: {
                "content-type" : "application/json"
            }
        }
        axios.post(url, data, config)
        .then((response) => {
            console.log(response);
            alert('삭제되었습니다.');
            router.push('/board')
        })
        .catch((error) => {
            console.log(error)
        })
    };

    const downloadFile1 = async () => {
        const url = `/api/store/download-noticeboard-file?fileId=${filePkNum}`
        await axios.get(url)
        .then((res) => {
            console.log(res)
        })
    }

    const downloadFile2 = () => {
        const url = `/api/store/download-noticeboard-file?fileId=${filePkNum+1}`;
        axios.get(url)
    }

    const downloadFile3 = () => {
        const url = `/api/store/download-noticeboard-file?fileId=${filePkNum+2}`;
        axios.get(url)
    }

    const classes = useStyles();

    const getCurrentUserInfo = async () => {
            const res = await axios.get('/api/account/decoding-token')
            .then((res) => {
                console.log(res);
                setCurrentUserPk(res.data.result.USER_PK)
                console.log(currentUserPk)
            })
            .catch((error) => {
                console.log(error)
            })
    };

    useEffect(() => {
        getCurrentUserInfo()
    },[])

    function getUnixTime(t) {
        const date = new Date(t * 1000);
        const year = date.getFullYear();
        const month = "0" + (date.getMonth() + 1);
        const day = "0" + date.getDate();
        const hour = "0" + date.getHours();
        const minute = "0" + date.getMinutes();
        const second = "0" + date.getSeconds();
        return year + "-" + month.substr(-2) + "-" + day.substr(-2) + " " + hour.substr(-2) + ":" + second.substr(-2);
    }

    return (

<>

    <div className={styles.outerContainer}>

        <div className={styles.titleName}>
            <input className={styles.titleInput} value={title} disabled={writerPk !== currentUserPk} onChange={handleTitle}/>
            <p style={{fontSize:'13px', color:'#6F6A6A'}}>Posted by {name}, {getUnixTime(date)}</p>
        </div>

        <div className={styles.contentArea}>
            <textarea className={styles.contentInput} value={content} disabled={writerPk !== currentUserPk} onChange={handleContent}/>
        </div>

        {
            files.map(file => {
                if(file.length == 0){
                    return <div className={styles.fileInput}>
                                <h5 style={{color:'#3F51B5'}}>THERE IS NO FILE.</h5>
                           </div>
                }
                if(file.length == 1) {
                    return <div className={styles.fileInput}>
                                <div>
                                <a onClick={downloadFile1} className={styles.files}>{file[0]}</a>
                                <Button size="small" onClick={deleteFile1} className={classes.margin} style={{color:'grey'}}>삭제</Button>
                                </div>
                            </div>
                }
                if(file.length == 2) {
                    return <div className={styles.fileInput}>
                                <div>
                                <a onClick={downloadFile1} className={styles.files}>{file[0]}</a>
                                <Button size="small" onClick={deleteFile1} className={classes.margin} style={{color:'grey'}}>삭제</Button>
                                </div>
                                <div>
                                <a onClick={downloadFile2} className={styles.files}>{file[1]}</a>
                                <Button size="small" onClick={deleteFile2} className={classes.margin} style={{color:'grey'}}>삭제</Button>
                                </div>
                            </div>
                }
                if(file.length == 3) {
                    return   <div className={styles.fileInput}>
                                <div>
                                <a onClick={downloadFile1} className={styles.files}>{file[0]}</a>
                                <Button size="small" onClick={deleteFile1} className={classes.margin} style={{color:'grey'}}>삭제</Button>
                                </div>
                                <div>
                                <a onClick={downloadFile2} className={styles.files}>{file[1]}</a>
                                <Button size="small" onClick={deleteFile2} className={classes.margin} style={{color:'grey'}}>삭제</Button>
                                </div>
                                <div>
                                <a onClick={downloadFile3} className={styles.files}>{file[2]}</a>
                                <Button size="small" onClick={deleteFile3} className={classes.margin} style={{color:'grey'}}>삭제</Button>
                                </div>
                            </div>
                }
            })
        }

        <div className={styles.reviseDelete}>
            <Button variant="contained" color="primary"style={{
            width:'80px', height:'40px', borderRadius:'15px', backgroundColor:'#969696'}}
            onClick={()=>{router.push('/board')}}>
                LIST
            </Button>

            <div className={styles.align}>
            <Button onClick={updateArticle} variant="contained" color="primary" style={{
                width:'80px', height:'40px', borderRadius:'15px'}}
            >
                REVISE
            </Button>

            <Button onClick={deleteArticle} variant="contained" color="primary" style={{
                width:'80px', height:'40px', borderRadius:'15px', marginLeft:'5px', backgroundColor:'#D93D3D'}}
            >
                DELETE
            </Button>
            </div>
        </div>

        <div className={styles.anotherPost} style={{marginTop:'15px'}}>
            <div className={styles.previousPost}>
                <Button size="small" className={classes.margin} style={{width:'20%'}}>
                이전 글 보기
                </Button>
                <p style={{fontSize:'12px', color:'#9a9a9a', cursor:'pointer'}} onClick={function(){
                alert('아직 기능 구현 중입니다.')
                }}>기능 구현 필요</p>
            </div>

            <div className={styles.nextPost}>
                <Button size="small" className={classes.margin} style={{width:'20%'}}>
                다음 글 보기
                </Button>
                <p style={{fontSize:'12px', color:'#9a9a9a', cursor:'pointer'}} onClick={function(){
                alert('아직 기능 구현 중입니다.')
                }}>기능 구현 필요</p>
            </div>
        </div>

        </div>

        <DeletePostModal popup={popup} />

</>
    )
}

export default innerPost;
