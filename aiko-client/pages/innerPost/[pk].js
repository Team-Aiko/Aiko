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
    const [deletedFilePk, setDeletedFilePk] = useState('');

    //타임스탬프 변환

    const [next] = useState(1);
    const [previous] = useState(-1);


    //이전 게시글, 다음 게시글 제목
    const [prevTitle, setPrevTitle] = useState('');
    const [nextTitle, setNextTitle] = useState('');


    const router = useRouter();
    const {pk} = router.query;

    const [presentPk, setPresentPk] = useState({pk})

    useEffect(() => {
        const getFileNames = async () => {
            const res = await axios.get(`/api/notice-board/detail?num=${pk}`)
            .then((res) => {
                const fileNumber = [];
                for(let i=0; i<res.data.result[0].files.length; i++) {
                    fileNumber.push(res.data.result[0].files[i].ORIGINAL_NAME)
                }; if (res.data.result[0].files.length < 2) {
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
            console.log(res.data.result[0]);
            setInnerPosts(res.data.result[0]);
            setTitle(res.data.result[0].TITLE);
            setContent(res.data.result[0].CONTENT);
            setName(res.data.result[0].USER_PK)
            setDate(res.data.result[0].CREATE_DATE);
            setPkNum(res.data.result[0].NOTICE_BOARD_PK);
        }
        getDetails()
    }, []);

    useEffect(() => {
        const getSpecifics = async () => {
            const res = await axios.get(`/api/notice-board/detail?num=${pk}`)
            .then((res) => {
                if(res.data.result[0].files.length == 0){
                    setFilePkNum(0);
                } if(res.data.result[0].files.length > 0) {
                    setFilePkNum(res.data.result[0].files[0].NBF_PK)
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

    const deleteFile = () => {
        setDeletedFilePk(filePkNum);
        console.log(deletedFilePk)
    };

    const updateArticle = () => {
        const url = '/api/notice-board/update-article';
        const data = {
            'num' : pkNum,
            'title': title,
            'content': content,
            'delFilePks[]': deletedFilePk
        }
        const config = {
        headers: {
            "content-type" : 'application/json'
            }
        }
        axios.post(url, data, config)
        .then((response) => {
            console.log(response)
            router.push('/board')
        })
        .catch((error) => {
            console.log(error)
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

    const downloadFile1 = () => {
        const url = `/api/store/download-noticeboard-file?fileId=${filePkNum}`;
        axios.get(url)
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

    return (

<>

    <div className={styles.outerContainer}>

        <div className={styles.titleName}>
            <input className={styles.titleInput} value={title} onChange={handleTitle}/>
            <p style={{fontSize:'17px', color:'#6F6A6A'}}>Posted by {name}, {date}</p>
        </div>

        <div className={styles.contentArea}>
            <textarea className={styles.contentInput} value={content} onChange={handleContent}/>
        </div>

        {
        files.map(file => (
            <>
                <div className={styles.fileInput}>
                    <div>
                    <a onClick={downloadFile1} className={styles.files}>{file[0]}</a>
                    <Button size="small" onClick={deleteFile} className={classes.margin} style={{color:'grey'}}>삭제</Button>
                    </div>
                    <div>
                    <a onClick={downloadFile2} className={styles.files}>{file[1]}</a>
                    <Button size="small" onClick={deleteFile} className={classes.margin} style={{color:'grey'}}>삭제</Button>
                    </div>
                    <div>
                    <a onClick={downloadFile3} className={styles.files}>{file[2]}</a>
                    <Button size="small" onClick={deleteFile} className={classes.margin} style={{color:'grey'}}>삭제</Button>
                    </div>
                </div>
            </>
            ))
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
                }}>사내식당 공지) 2021년 11월 건강한 식생활을 위한 채식주의 방침</p>
            </div>

            <div className={styles.nextPost}>
                <Button size="small" className={classes.margin} style={{width:'20%'}}>
                다음 글 보기
                </Button>
                <p style={{fontSize:'12px', color:'#9a9a9a', cursor:'pointer'}} onClick={function(){
                alert('아직 기능 구현 중입니다.')
                }}>{nextTitle}</p>
            </div>
        </div>

        </div>

        <DeletePostModal popup={popup} />

</>
    )
}

export default innerPost;
