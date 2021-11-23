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

    const [normalColor, setNormalColor] = useState('#3F51B5');
    const [deleteColor, setDeleteColor] = useState('light-grey');


    const router = useRouter();
    const {pk} = router.query;

    useEffect(() => {
        const getFileNames = async () => {
            const res = await axios.get(`/api/notice-board/detail?num=${pk}`)
            .then((res) => {
                const fileNumber = [];
                for(let i=0; i<res.data.result[0].files.length; i++) {
                    fileNumber.push(res.data.result[0].files[i].ORIGINAL_NAME)
                };
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
            setIsDel(res.data.result[0].files[0].IS_DELETE);
            setFilePkNum(res.data.result[0].files[0].NBF_PK)
        }
        getDetails()
    }, []);


    const handleTitle = (e) => {
        setTitle(e.target.value);
    };

    const handleContent = (e) => {
        setContent(e.target.value);
    };

    const deleteFile = () => {
        setDeletedFilePk(filePkNum);
        setNormalColor('#E0E0E0');
    };

    const returnColor =() => {
        setNormalColor("#3F51B5")
    }


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
                    <a className={styles.files}>{file[0]}</a>
                    <a className={styles.files}>{file[1]}</a>
                    <a className={styles.files}>{file[2]}</a>
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
                }}>2021년도 Aiko 프로젝트 감사 결과</p>
            </div>
        </div>

        </div>

        <DeletePostModal popup={popup} />

</>
    )
}

export default innerPost;
