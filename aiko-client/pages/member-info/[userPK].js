import React from 'react';
import styles from '../../styles/MemberInfo.module.css';
import { makeStyles } from '@material-ui/core/styles';
import PersonIcon from '@material-ui/icons/Person';
import ContactPhoneIcon from '@material-ui/icons/ContactPhone';
import ContactMailIcon from '@material-ui/icons/ContactMail';
import AssignmentIndIcon from '@material-ui/icons/AssignmentInd';
import SettingsIcon from '@material-ui/icons/Settings';
import { useState, useEffect } from 'react';
import { Paper, Tabs, Tab, Button, Avatar, TextField } from '@material-ui/core';
import ActionItems from '../../components/ActionItems.js';
import axios from 'axios';
import Icon from '@material-ui/core/Icon';
import SaveIcon from '@material-ui/icons/Save';
import ExitToAppIcon from '@material-ui/icons/ExitToApp';
import { get, post } from '../../_axios';
import { useRouter } from 'next/router';
import CreatedActionItems from '../../components/CreatedActionItems.js';
import MyMeetingSchedule from '../../components/MyMeetingSchedule';

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
    const [priority, setPriority] = useState(1);
    const [status, setStatus] = useState('Assigned');

    const [startDate, setStartDate] = useState('');
    const [dueDate, setDueDate] = useState('');

    const [assigner, setAssigner] = useState('');
    const [owner, setOwner] = useState('');
    const [description, setDescription] = useState('');
    const [step, setStep] = useState(1);

    const [currentPage, setCurrentPage] = useState(1);
    const [ownerPk, setOwnerPK] = useState(undefined);
    const [currentUserPK, setCurrentUserPK] = useState(undefined);

    //every action item (for props use)
    const [actionItemArray, setActionItemArray] = useState([]);

    //For Detail Modal (for props use)
    const [actionItemDesc, setActionItemDesc] = useState([])

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

    const priorityChange = (e) => {
        if (e.target.value == null) {
            setPriority(1);
        } else {
            setPriority(e.target.value);
        }
    };

    const statusChange = (e) => {
        if (e.target.value == null) {
            setStatus('Assigned');
        } else {
            setStatus(e.target.value);
        }
    };

    const startDateChange = (e) => {
        setStartDate(Math.floor(new Date().getTime(e.target.value) / 1000));
        console.log(startDate);
    };

    const dueDateChange = (e) => {
        setDueDate(Math.floor(new Date().getTime(e.target.value) / 1000));
        console.log(dueDate);
    };

    const assignerChange = (e) => {
        setAssigner(e.target.value);
    };

    const ownerChange = (e) => {
        setOwner(e.target.value);
    };

    const descriptionChange = (e) => {
        setDescription(e.target.value);
        console.log(description);
    };

    const stepChange = (e) => {
        setStep(e.target.value);
        console.log(step);
    };

    //액션 아이템 생성 API
    const createActionItems = () => {
        const url = '/api/work/create-action-item';
        const data = {
            OWNER_PK: undefined,
            TITLE: title,
            DESCRIPTION: description,
            DUE_DATE: dueDate,
            START_DATE: startDate,
            P_PK: priority,
            STEP_PK: step,
        };
        post(url, data)
            .then((res) => {
                setOpenModalNum(0);
                console.log(res);
            })
            .catch((error) => {
                console.log(error);
            });
    };

    //생성된 액션 아이템 불러오기 API
    const getActionItems = async () => {
        const url = `/api/work/view-items`;
        const params = {
            id: userPK,
            currentPage: currentPage,
        };
        await get(url, { params: params }).then((res) => {
            console.log(res);
            setActionItemArray(res);
        });
    };

    useEffect(() => {
        getActionItems();
    }, []);



    return (
        <>
            <div className={styles.outerContainer}>
                <div className={styles.upperContainer}>
                    <div className={classes.root}>
                        <Avatar src='../static/testImages/kotone.PNG' className={classes.large} />
                    </div>

                    <div className={styles.profileInfo}>
                        <div className={styles.leftDiv}>
                            <div className={styles.icons}>
                                <PersonIcon style={{ fontSize: 40 }} />
                                <p style={{ fontSize: '14px', color: '#7D7D7D', marginLeft: '5px' }}>Kotone Aivyss</p>
                            </div>
                            <div className={styles.icons}>
                                <ContactPhoneIcon style={{ fontSize: 40 }} />
                                <p style={{ fontSize: '14px', color: '#7D7D7D', marginLeft: '5px' }}>
                                    Personnel Division
                                </p>
                            </div>
                        </div>

                        <div className={styles.rightDiv}>
                            <div className={styles.icons}>
                                <ContactPhoneIcon style={{ fontSize: 40 }} />
                                <p style={{ fontSize: '14px', color: '#7D7D7D', marginLeft: '5px' }}>010-1234-5678</p>
                            </div>
                            <div className={styles.icons}>
                                <ContactMailIcon style={{ fontSize: 40 }} />
                                <p style={{ fontSize: '14px', color: '#7D7D7D', marginLeft: '5px' }}>
                                    kotone@gmail.com
                                </p>
                            </div>
                        </div>

                        <SettingsIcon
                            style={{ fontSize: 70, cursor: 'pointer' }}
                            onClick={() => {
                                alert('you may edit your profile');
                            }}
                        />
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

                    {value == 0 ? (
                        <div className={styles.actionItemsOuterContainer}>
                            <div style={{ marginLeft: '10px' }}>
                                <Button
                                    variant='contained'
                                    color='primary'
                                    className={classes.button}
                                    onClick={openModal}
                                    style={{ marginTop: '10px' }}
                                >
                                    Add Action Item
                                </Button>
                            </div>

                            <div className={styles.actionItemTableDiv}>
                                <table className={styles.actionItemTable} style={{ marginTop: '20px' }}>
                                    <thead>
                                        <tr className={styles.actionItemTr}>
                                            <td style={{ width: '28%' }} className={styles.theadTd}>
                                                Title
                                            </td>
                                            <td style={{ width: '5%' }} className={styles.theadTd}>
                                                Priority
                                            </td>
                                            <td style={{ width: '10%' }} className={styles.theadTd}>
                                                Status
                                            </td>
                                            <td style={{ width: '8%' }} className={styles.theadTd}>
                                                Start Date
                                            </td>
                                            <td style={{ width: '8%' }} className={styles.theadTd}>
                                                Due Date
                                            </td>
                                            <td style={{ width: '8%' }} className={styles.theadTd}>
                                                Owner
                                            </td>
                                            <td style={{ width: '8%' }} className={styles.theadTd}>
                                                Detail
                                            </td>
                                            <td style={{ width: '5%' }} className={styles.theadTd}>
                                                Revise
                                            </td>
                                            <td style={{ width: '5%' }} className={styles.theadTd}>
                                                Delete
                                            </td>
                                        </tr>
                                    </thead>

                                    <tbody style={{ width: '90%', backgroundColor: 'grey' }}>
                                        <CreatedActionItems actionItemArray={actionItemArray}/>
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    ) : (
                        <></>
                    )}
                    {openModalNum == 1 ? (
                        <div className={styles.modalOuterContainer}>
                            <div className={styles.modalInnerContainer}>
                                <div className={styles.modalTopBar}>
                                    <div className={styles.modalTopBarContentsDiv}>
                                        <div className={styles.modalTopBarDesc}>Add action Item</div>
                                        <Button
                                            variant='contained'
                                            color='primary'
                                            className={classes.button}
                                            endIcon={<ExitToAppIcon />}
                                            onClick={closeModal}
                                        >
                                            EXIT
                                        </Button>
                                    </div>
                                </div>

                                <div className={styles.modalInputDiv}>
                                    <TextField onChange={titleChange} label='Title' style={{ margin: 8, width: 500 }} />
                                    <TextField
                                        onChange={priorityChange}
                                        label='Priority'
                                        placeholder='Number'
                                        style={{ margin: 8, width: 80 }}
                                    />
                                    <TextField
                                        onChange={statusChange}
                                        label='Status'
                                        placeholder="Default : 'Assigned'"
                                        style={{ margin: 8 }}
                                    />
                                </div>

                                <div className={styles.modalInputDiv}>
                                    <TextField
                                        onChange={startDateChange}
                                        label='StartDate'
                                        placeholder='YYYY-MM-DD'
                                        style={{ margin: 8 }}
                                    />
                                    <TextField
                                        onChange={dueDateChange}
                                        label='DueDate'
                                        placeholder='YYYY-MM-DD'
                                        style={{ margin: 8 }}
                                    />
                                    <TextField
                                        onChange={stepChange}
                                        label='Step'
                                        placeholder='Number'
                                        style={{ margin: 8, width: 80 }}
                                    />
                                </div>

                                <div className={styles.modalInputDiv}>
                                    <TextField onChange={assignerChange} label='Assigner' style={{ margin: 8 }} />
                                    <TextField onChange={ownerChange} label='Owner' style={{ margin: 8 }} />
                                </div>

                                <div className={styles.modalInputDiv}>
                                    <TextField
                                        onChange={descriptionChange}
                                        label='Description'
                                        multiline
                                        rows={6}
                                        value={description}
                                        onChange={descriptionChange}
                                        style={{ marginTop: 50, width: 400 }}
                                    />
                                </div>

                                <div className={styles.modalButtonDiv}>
                                    <Button
                                        variant='contained'
                                        color='primary'
                                        size='medium'
                                        className={classes.button}
                                        startIcon={<SaveIcon />}
                                        onClick={createActionItems}
                                        style={{ marginTop: 100 }}
                                    >
                                        Save
                                    </Button>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <></>
                    )}
                    {value == 1 ? <MyMeetingSchedule userPK={userPK} /> : <></>}
                    {value == 2 ? <div>PAGE NUMBER 3</div> : <></>}
                </div>
            </div>
        </>
    );
};

export default MemberInfo;
