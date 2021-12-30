import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import { Modal, TextField, Button, Typography, FormControl, InputLabel, Select, MenuItem, Tooltip, IconButton } from '@material-ui/core';
import SaveIcon from '@material-ui/icons/Save';
import { useState, useEffect } from 'react';
import { get, post } from '../_axios';
import {Close} from '@material-ui/icons';
import SearchMemberModal from './SearchMemberModal';

const useStyles = makeStyles((theme) => ({
    root: {
        top:0, bottom:0, left:0, right:0,
        position:'fixed',
        backgroundColor:'rgba(0,0,0,0.3)',
        zIndex:100
    },
    modal: {
        display: 'flex',
        padding: theme.spacing(1),
        alignItems: 'center',
        justifyContent: 'center',
    },
    paper: {
        width: 600,
        height: 500,
        backgroundColor: theme.palette.background.paper,
        border: '2px solid #000',
        boxShadow: theme.shadows[5],
        padding: theme.spacing(2, 4, 3),
    },
    buttonDiv: {
        display: 'flex',
        justifyContent: 'right',
    },
    formControl: {
        margin: 3,
        width: 100,
    },
    closeIcon: {
        cursor: 'pointer',
        marginLeft: 340,
    },
    titleIcon: {
        display: 'flex',
    },
    titleButton : {
        display:'flex',
        justifyContent:'space-between'
    }
}));

const AddActionItem = ({ setAddActionItemModal, nickname }) => {
    const classes = useStyles();
    const rootRef = React.useRef(null);

    const [title, setTitle] = useState('');
    const [priority, setPriority] = useState(1);
    const [step, setStep] = useState(1);
    const [startDate, setStartDate] = useState('');
    const [dueDate, setDueDate] = useState('');
    const [description, setDescription] = useState('');
    const [isAdmin, setIsAdmin] = useState(false);

    //nickname으로 userInfo , assigner에 부여
    // const getAssignerName = () => {
    //     const url = '/api/account/user-info';
    //     const data = {
    //         nickname: nickname
    //     };
    //     post(url, data)
    //     .then((res) => {
    //         setSelectedAssigner(res.FIRST_NAME + " " + res.LAST_NAME)
    //     })
    //     .catch((error) => {
    //         console.log(error)
    //     })
    // };

    // useEffect(() => {
    //     getAssignerName()
    // }, [nickname]);

    //member list modal로 정보 불러오기
    const [openSearchMemberModal, setOpenSearchMemberModal] = useState(false);
    const [openSearchMemberModalAssigner, setOpenSearchMemberModalAssigner] = useState(false);
    const [selectedOwner, setSelectedOwner] = useState('');
    const [selectedAssigner, setSelectedAssigner] = useState('');


    const titleChange = (e) => {
        setTitle(e.target.value);
        console.log(title);
    };

    const startDateChange = (e) => {
        setStartDate(Math.floor(new Date(e.target.value).getTime() / 1000));
        console.log(startDate);
    };

    const dueDateChange = (e) => {
        setDueDate(Math.floor(new Date(e.target.value).getTime() / 1000));
        console.log(dueDate);
    };

    const descriptionChange = (e) => {
        setDescription(e.target.value);
        console.log(description);
    };

    //액션 아이템 생성 API
    const createActionItems = (user) => {
        const url = '/api/work/create-action-item';
        const data = {
            OWNER_PK: selectedOwner[0]?.USER_PK,
            TITLE: title,
            DESCRIPTION: description,
            DUE_DATE: dueDate,
            START_DATE: startDate,
            P_PK: priority,
            STEP_PK: step,
        };
        console.log(data.OWNER_PK)
        if(data.OWNER_PK == undefined) {
            data.OWNER_PK = null
        }
        if (title.length < 1) {
            alert('제목을 입력해주세요.');
            return;
        }
        if (description.length < 1) {
            alert('상세 설명이 필요합니다.');
            return;
        }
        post(url, data)
            .then((res) => {
                console.log(res);
                console.log(data);
                setAddActionItemModal(false);
            })
            .catch((error) => {
                console.log(error);
            });
    };

    const checkAdmin = async () => {
        const url = '/api/company/check-admin';
        await get(url)
        .then((res) => {
            console.log('he is' + res)
            if(res == undefined) {
                setIsAdmin(false)
            } else {
            setIsAdmin(res);
            }
        })
        .catch((error) => {
            console.log(error)
        })
    }

    useEffect(() => {
        checkAdmin()
    }, [])

    return (
        <div className={classes.root} ref={rootRef}>
            <Modal
                disablePortal
                disableEnforceFocus
                disableAutoFocus
                open
                aria-labelledby='server-modal-title'
                aria-describedby='server-modal-description'
                className={classes.modal}
                container={() => rootRef.current}
            >
                <div className={classes.paper}>
                    <div className={classes.titleButton}>
                    <h2 id='server-modal-title'>Add Action Item</h2>
                    <Tooltip title='View details'>
                        <IconButton>
                            <Close onClick={() => {setAddActionItemModal(false)}}/>
                        </IconButton>
                    </Tooltip>
                    </div>
                    <div>
                        <TextField id='standard-basic' label='Title' style={{ margin: 3 }} onChange={titleChange} />
                        <FormControl className={classes.formControl}>
                            <InputLabel id='demo-simple-select-label'>Priority</InputLabel>
                            <Select labelId='demo-simple-select-label' id='demo-simple-select' value={priority}>
                                <MenuItem
                                    value={1}
                                    onClick={() => {
                                        setPriority(1);
                                    }}
                                >
                                    High
                                </MenuItem>
                                <MenuItem
                                    value={2}
                                    onClick={() => {
                                        setPriority(2);
                                    }}
                                >
                                    Normal
                                </MenuItem>
                                <MenuItem
                                    value={3}
                                    onClick={() => {
                                        setPriority(3);
                                    }}
                                >
                                    Low
                                </MenuItem>
                            </Select>
                        </FormControl>
                        <FormControl className={classes.formControl}>
                            <InputLabel id='demo-simple-select-label'>Step</InputLabel>
                            <Select labelId='demo-simple-select-label' id='demo-simple-select' value={step}>
                                <MenuItem
                                    value={1}
                                    onClick={() => {
                                        setStep(1);
                                    }}
                                >
                                    Assigned
                                </MenuItem>
                                <MenuItem
                                    value={2}
                                    onClick={() => {
                                        setStep(2);
                                    }}
                                >
                                    Ongoing
                                </MenuItem>
                                <MenuItem
                                    value={3}
                                    onClick={() => {
                                        setStep(3);
                                    }}
                                >
                                    Done
                                </MenuItem>
                            </Select>
                        </FormControl>
                    </div>

                    <div style={{ marginTop: 10, display: 'flex' }}>
                        <div>
                            <Typography variant='overline' display='block' gutterBottom>
                                Start Date
                            </Typography>
                            <TextField
                                id='standard-basic'
                                type='date'
                                style={{ margin: 3 }}
                                onChange={startDateChange}
                            />
                        </div>
                        <div>
                            <Typography variant='overline' display='block' gutterBottom>
                                Due Date
                            </Typography>
                            <TextField id='standard-basic' type='date' style={{ margin: 3 }} onChange={dueDateChange} />
                        </div>
                    </div>

                    <div style={{ marginTop: 10 }}>
                        <TextField id='standard-basic' label='Owner' style={{ margin: 3 }}
                        value={ selectedOwner == '' ? ''  :selectedOwner[0].FIRST_NAME + ' ' + selectedOwner[0].LAST_NAME}
                        disabled={isAdmin == false}
                        onClick={() => {setOpenSearchMemberModal(true)}}/>
                        {
                            openSearchMemberModal
                            ? <SearchMemberModal
                            open={openSearchMemberModal && isAdmin}
                            onClose={() => {setOpenSearchMemberModal(false)}}
                            onClickSelectedUserList={(user) => {
                                setSelectedOwner(user);
                                setOpenSearchMemberModal(false);
                            }}
                            multipleSelection={true}/>
                            : <></>
                        }
                        <TextField
                            id='standard-basic'
                            label='Assigner'
                            style={{ margin: 3 }}
                            onClick={() => {setOpenSearchMemberModalAssigner(true)}}
                            value={selectedAssigner == '' ? '' : selectedAssigner[0].FIRST_NAME + ' ' + selectedAssigner[0].LAST_NAME}
                        />
                        {
                            openSearchMemberModalAssigner
                            ? <SearchMemberModal
                            open={openSearchMemberModalAssigner}
                            onClose={() => {setOpenSearchMemberModalAssigner(false)}}
                            onClickSelectedUserList={(user) => {
                                setSelectedAssigner(user);
                                setOpenSearchMemberModalAssigner(false);
                            }}
                            multipleSelection={true}/>
                            : <></>
                        }
                    </div>

                    <div style={{ marginTop: 10 }}>
                        <TextField
                            id='standard-multiline-static'
                            label='Description'
                            multiline
                            rows={7}
                            style={{ width: 300 }}
                            onChange={descriptionChange}
                        />
                    </div>

                    <div className={classes.buttonDiv}>
                        <Button
                            variant='contained'
                            color='primary'
                            size='small'
                            className={classes.button}
                            startIcon={<SaveIcon />}
                            onClick={createActionItems}
                        >
                            Save
                        </Button>
                    </div>
                </div>
            </Modal>
        </div>
    );
};

export default AddActionItem;
