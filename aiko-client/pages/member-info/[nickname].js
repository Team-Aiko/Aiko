import React from 'react';
import axios from 'axios';
import { get, post } from '../../_axios';
import styles from '../../styles/MemberInfo.module.css';
import { makeStyles } from '@material-ui/core/styles';
import { useState, useEffect } from 'react';
import {Paper, Tabs, Tab, Avatar} from '@material-ui/core';
import ActionItems from '../../components/ActionItems.js';
import { useRouter } from 'next/router';
import MyMeetingSchedule from '../../components/MyMeetingSchedule';
import MailOutlineIcon from '@material-ui/icons/MailOutline';
import PhoneAndroidIcon from '@material-ui/icons/PhoneAndroid';
import AssignmentIndIcon from '@material-ui/icons/AssignmentInd';
import TelegramIcon from '@material-ui/icons/Telegram';

const useStyles = makeStyles((theme) => ({
    root: {
        '& > *': {
            margin: theme.spacing(1),
        },
    },
    large: {
        width: theme.spacing(15),
        height: theme.spacing(15),
        border: '2px solid #d0d0d0',
        margin: 'auto'
    },
    avatar : {
        width: '35%',
        background:'linear-gradient(to right, #3F51B5, #6677d8)',
        borderTopLeftRadius: '5px',
        borderBottomLeftRadius:'5px',
        textAlign:'center',
        color:'#fff',
        paddingTop:'10px'
    },
    wrapper : {
        width: '80%',
        height: 250,
        display:'flex',
        boxShadow: '0 1px 20px 0 rgba(69,90,100,0.08)',
        margin: '0 auto',
        borderTop:'10px solid #dee1ed',
        overflow:'hidden'
    },
    right : {
        width: '33%',
        background: '#fff',
        borderTopRightRadius: '5px',
        borderBottomRightRadius:'5px',
        padding:'5px 15px',
        overflow:'hidden',
        marginLeft:'10px'
    },
    data : {
        marginTop:'25px'
    }
}));

const MemberInfo = () => {

    const router = useRouter();
    const { nickname } = router.query;

    const classes = useStyles();

    const [name, setName] = useState('');
    const [company, setCompany] = useState('');
    const [email, setEmail] = useState('');
    const [phoneNumber, setPhoneNumber] = useState('');
    const [division, setDivision] = useState('');
    const [userPK, setUserPK] = useState(undefined);
    const [profilePic, setProfilePic] = useState('')

    const phoneNumberFormat = (num) => {
        const result = num.substr(0, 3) + "-" + num.substr(3, 4) + "-" + num.substr(7);
        return result
    };

    const handleChange = (event, newValue) => {
        setValue(newValue);
    };

    const getUserInfo = () => {
        const url=('/api/account/user-info');
        const data = {
            nickname : nickname
        };
        post(url, data)
        .then((res) => {
            setName(res.FIRST_NAME + ' ' + res.LAST_NAME);
            setCompany(res.company.COMPANY_NAME  + ' ' + 'Company');
            setEmail(res.EMAIL);
            setPhoneNumber(phoneNumberFormat(res.TEL));
            setDivision(res.department.DEPARTMENT_NAME);
            setUserPK(res.USER_PK)
            console.log(res)
        })
        .catch((error) => {
            console.log(error)
        })
    }

    useEffect(() => {
        getUserInfo()
    },[])

    const [value, setValue] = useState(0);

    return (
        <>
            <div className={styles.outerContainer}>

                <div className={classes.wrapper}>
                    <div className={classes.avatar}>
                        <Avatar className={classes.large}/>
                        <h4>{name}</h4>
                        <p style={{fontSize:'12px'}}>{company}</p>
                    </div>
                    <div className={classes.right}>
                        <div className={classes.info}>
                            <h3 style={{color:'#3F51B5'}}>Information</h3>
                            <div className={classes.infoData}>
                                <div className={classes.data}>
                                    <MailOutlineIcon/>
                                    <p style={{color:'#2c3e50'}}>{email}</p>
                                </div>
                                <div className={classes.data}>
                                    <PhoneAndroidIcon/>
                                    <p style={{color:'#2c3e50'}}>{phoneNumber}</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className={classes.right}>
                        <div className={classes.info}>
                            <h3 style={{color:'#3F51B5'}}>Division</h3>
                            <div className={classes.infoData}>
                                <div className={classes.data}>
                                    <AssignmentIndIcon/>
                                    <p style={{color:'#2c3e50'}}>{division}</p>
                                </div>
                                {/* <div className={classes.data}>
                                    <TelegramIcon/>
                                    <p style={{color:'#2c3e50'}}>Something</p>
                                </div> */}
                            </div>
                        </div>
                    </div>
                </div>
                


                <div className={styles.tabContainer}>
                    <Paper className={classes.root}>
                        <Tabs
                            value={value}
                            onChange={handleChange}
                            indicatorColor='primary'
                            textColor='primary'
                            centered
                        >
                            <Tab label='Action Items' />

                            <Tab label='Meeting Schedules' />

                            <Tab label='null' />
                        </Tabs>
                    </Paper>

                    {value == 0 ? <ActionItems /> : <></>}
                    {value == 1 ? <MyMeetingSchedule nickname={nickname} /> : <></>}
                    {value == 2 ? <div>PAGE NUMBER 3</div> : <></>}
                </div>
            </div>
        </>
    );
};

export default MemberInfo;
