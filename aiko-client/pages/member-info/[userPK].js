import React from 'react';
import styles from '../../styles/MemberInfo.module.css';
import { makeStyles } from '@material-ui/core/styles';
import PersonIcon from '@material-ui/icons/Person';
import ContactPhoneIcon from '@material-ui/icons/ContactPhone';
import ContactMailIcon from '@material-ui/icons/ContactMail';
import AssignmentIndIcon from '@material-ui/icons/AssignmentInd';
import SettingsIcon from '@material-ui/icons/Settings';
import {useState, useEffect} from 'react';
import {Paper, Tabs, Tab, Button, Avatar} from '@material-ui/core';
import ActionItems from '../../components/ActionItems.js';
import axios from 'axios';
import Icon from '@material-ui/core/Icon';
import SaveIcon from '@material-ui/icons/Save';
import ExitToAppIcon from '@material-ui/icons/ExitToApp';
import {get, post} from '../../_axios'
import {useRouter} from 'next/router'
import CreatedActionItems from '../../components/CreatedActionItems.js'

const useStyles = makeStyles((theme) => ({
  root: {
    '& > *': {
      margin: theme.spacing(1),
    },
  },
  large: {
    width: theme.spacing(25),
    height: theme.spacing(25),
  },
}));

const MemberInfo = () => {

    const router = useRouter();
    const { userPK } = router.query;



    //모달창 열기
    const [openModalNum, setOpenModalNum] = useState(0);

    const openModal = () => {
        setOpenModalNum(1);
    };

    const closeModal = () => {
        setOpenModalNum(0);
    };


    //manage all data for transer to components
    const [allData, setAllData] = useState([]);

    const [title, setTitle] = useState('');
    //priority = P_PK 
    const [priority, setPriority] = useState(0);
    const [status, setStatus] = useState('Assigned');

    const [startDate, setStartDate] = useState(undefined);
    const [dueDate, setDueDate] = useState(undefined);

    const [assigner, setAssigner] = useState('');
    const [owner, setOwner] = useState('');
    const [description, setDescription] = useState('');
    const [del, setDel] = useState(0);
    const [step, setStep] = useState(1);

    const [currentPage, setCurrentPage] = useState(1);
    const [ownerPk, setOwnerPK] = useState(0);
    const [currentUserPK, setCurrentUserPK] = useState(undefined)


    const [buttonColor, setButtonColor] = useState('#68A8F4');

    const classes = useStyles();


    //Tab Menu
    const [value, setValue] = useState(0);

    const handleChange = (event, newValue) => {
        setValue(newValue);
    };

    const titleChange = (e) => {
        setTitle(e.target.value);
        console.log(title);
    };

    const descriptionChange = (e) => {
        setDescription(e.target.value);
        console.log(description);
    };

    const dueDateChange = (date) => {
        setDueDate(date);
        console.log(dueDate);
    };

    const startDateChange = (date) => {
        setStartDate(date);
        console.log(startDate);
    };

    const stepChange = (e) => {
        setStep(e.target.value);
        console.log(step);
    };

    const priorityChange = (e) => {
        setPriority(e.target.value);
        console.log(priority)
    };

    const createActionItems = () => {
        const url = '/api/work/create-action-item';
        const data = {
            'OWNER_PK' : null,
            'TITLE' : title,
            'DESCRIPTION' : description,
            'DUE_DATE' : dueDate,
            'START_DATE' : startDate,
            'P_PK' : priority,
            'STEP_PK' : step
        }
        const config = {
            headers : {
                "content-type" : "application/json"
            }
        }
        post(url, data, config)
        .then((res) => {
            setOpenModalNum(0);
            console.log(res)
        })
        .catch((error) => {
            console.log(error)
        })
    };

    const viewItems = () => {
        const res = get(`/api/work/view-items?id=${userPK}&currentPage=${currentPage}`)
        .then((res) => {
            console.log(res)
        })
    }

    useEffect(() => {
        viewItems()
    },[])

    return (
        <>
        <div className={styles.outerContainer}>

            <div className={styles.upperContainer}>

                <div className={classes.root}>
                <Avatar src="../static/testImages/kotone.PNG" className={classes.large}/>
                </div>

            <div className={styles.profileInfo}>
                <div className={styles.leftDiv}>
                    <div className={styles.icons}>
                        <PersonIcon style={{ fontSize: 40 }}/>
                        <p style={{fontSize:'14px', color:'#7D7D7D', marginLeft:'5px'}}>Kotone Aivyss</p>
                        </div>
                        <div className={styles.icons}>
                        <ContactPhoneIcon style={{ fontSize: 40 }}/>
                        <p style={{fontSize:'14px', color:'#7D7D7D', marginLeft:'5px'}}>Personnel Division</p>
                    </div>
                </div>

                <div className={styles.rightDiv}>
                    <div className={styles.icons}>
                        <ContactPhoneIcon style={{ fontSize: 40 }}/>
                        <p style={{fontSize:'14px', color:'#7D7D7D', marginLeft:'5px'}}>010-1234-5678</p>
                        </div>
                        <div className={styles.icons}>
                        <ContactMailIcon style={{ fontSize: 40 }}/>
                        <p style={{fontSize:'14px', color:'#7D7D7D', marginLeft:'5px'}}>kotone@gmail.com</p>
                        </div>
                    </div>

                    <SettingsIcon style={{fontSize:70, cursor:'pointer'}} onClick={()=> {
                        alert('you may edit your profile')
                    }}/>
                </div>
            </div>

            <div className={styles.tabContainer}>
                <Paper className={classes.root}>
                <Tabs
                    value={value}
                    onChange={handleChange}
                    indicatorColor="primary"
                    textColor="primary"
                    centered
                >
                    <Tab label="Action Items"/>

                    <Tab label="Meeting Schedules" />

                    <Tab label="null" />
                </Tabs>
                </Paper>

            {
                value == 0
                ? 
        <div className={styles.actionItemsOuterContainer}>
            <div>
                <button onClick={openModal}>ADD ACTION ITEMS</button>
            </div>
            <div style={{width:'90%', display:'block', margin:'0 auto', overflow:'hidden'}}>
                <table>
                    <thead>
                        <tr>    
                            <td style={{width:'15%'}} className={styles.theadTd}>Title</td>
                            <td style={{width:'5%'}} className={styles.theadTd}>Priority</td>
                            <td style={{width:'10%'}} className={styles.theadTd}>Status</td>
                            <td style={{width:'10%'}} className={styles.theadTd}>Start Date</td>
                            <td style={{width:'10%'}} className={styles.theadTd}>Due Date</td>
                            <td style={{width:'10%'}} className={styles.theadTd}>Assigner</td>
                            <td style={{width:'10%'}} className={styles.theadTd}>Owner</td>
                            <td style={{width:'15%'}} className={styles.theadTd}>Description</td>
                            <td style={{width:'10%'}} className={styles.theadTd}>Del</td>
                        </tr>
                    </thead>

                    <tbody style={{width:'90%', backgroundColor:'grey'}}>
                        <CreatedActionItems />
                    </tbody>
                </table>
            </div>
        </div>
                :
                <></>
            }
            {
                openModalNum == 1
                ?
                <div className={styles.modalOuterContainer}>
                    <div className={styles.modalInnerContainer}>

                        <div className={styles.contentContainer}>
                            <div>
                                <Button
                                variant="contained"
                                color="primary"
                                className={classes.button}
                                endIcon={<ExitToAppIcon/>}
                                onClick={closeModal}
                                >
                                EXIT
                                </Button>
                            </div>

                            <div>
                                <input placeholder='title' onChange={titleChange}/>
                                <input placeholder='start-date' type='date' onChange={startDateChange}/>
                                <input placeholder='due-date' type='date' onChange={dueDateChange}/>
                                <input placeholder='description' onChange={descriptionChange}/>
                                <input placeholder='del'/>
                                <input placeholder='priority' onChange={priorityChange}/>
                            </div>

                            <div>
                                <Button
                                variant="contained"
                                color="primary"
                                size="medium"
                                className={classes.button}
                                startIcon={<SaveIcon />}
                                onClick={createActionItems}
                                >
                                Save
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
                : <></>
            } 
            {
                value == 1
                ?
                <div>
                    PAGE NUMBER 2
                </div>
                :
                <></>
            }
            {
                value == 2
                ?
                <div>
                    PAGE NUMBER 3
                </div>
                :
                <></>
            }
            </div>

        </div>
        </>
    )
};

export default MemberInfo;