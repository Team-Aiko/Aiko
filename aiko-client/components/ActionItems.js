import React from 'react';
import styles from '../styles/ActionItems.module.css';
import { useState, useEffect } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import AddActionItem from './AddActionItem.js';
import ActionItemDetail from './ActionItemDetail.js';
import { get, post } from '../_axios';
import {
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    Button,
    TableFooter,
    Tooltip,
    IconButton,
    Typography,
    Select,
    MenuItem,
    FormControl,
    InputLabel,
} from '@material-ui/core';
import { Pageview, ArrowBackIos, ArrowForwardIos } from '@material-ui/icons';

const useStyles = makeStyles(() => ({
    footerDiv: {
        display: 'flex',
        alignItems: 'center',
        textAlign: 'center',
        width: 700,
    },
    input : {
        width:100,
        textAlign:'center'
    }
}));

const ActionItems = ({nickname}) => {
    const [currentPage, setCurrentPage] = useState(1);
    const [rowsPerPage, setRowsPerPage] = useState(10);

    //All information about created Action Items.
    const [actionItemArray, setActionItemArray] = useState([]);

    const priorityChange = (e, num) => {
        const index = actionItemArray.findIndex((item) => item.ACTION_PK === num)
        const arr = [...actionItemArray];
        arr[index].P_PK = e.target.value;
        setActionItemArray([...arr]);
        console.log(actionItemArray);
    };

    const stepChange = (e, num) => {
        const index = actionItemArray.findIndex((item) => item.ACTION_PK === num);
        const arr = [...actionItemArray];
        arr[index].STEP_PK = e.target.value;
        setActionItemArray([...arr]);
        console.log(actionItemArray);
    };

    // Priority 값 변경 & Update 요청
    const priorityUpdate = (num) => {
        const url = '/api/work/update-action-item';
        const index = actionItemArray.findIndex((item) => item.ACTION_PK === num);
        const data = {
            ACTION_PK: actionItemArray[index].ACTION_PK,
            OWNER_PK: actionItemArray[index].owner.USER_PK,
            TITLE: actionItemArray[index].TITLE,
            DESCRIPTION: actionItemArray[index].DESCRIPTION,
            START_DATE: Math.floor(new Date(actionItemArray[index].START_DATE).getTime() / 1000),
            DUE_DATE: Math.floor(new Date(actionItemArray[index].DUE_DATE).getTime() / 1000),
            P_PK: actionItemArray[index].P_PK,
            STEP_PK: actionItemArray[index].STEP_PK,
            updateCols: ['P_PK', 'STEP_PK'],
        };
        post(url, data)
            .then((res) => {
                alert('수정되었습니다');
                console.log(res);
            })
            .catch((error) => {
                console.log(error);
            });
    };

    // 액션 아이템 추가 모달, 액션 아이템 상세보기 모달 boolean 값.
    const [addActionItemModal, setAddActionItemModal] = useState(false);
    const [actionItemDetailModal, setActionItemDetailModal] = useState(false);

    const [activeRow, setActiveRow] = useState(0);

    const openAddModal = () => {
        setAddActionItemModal(!addActionItemModal);
    };

    const openDetailModal = (id) => {
        setActionItemDetailModal(!actionItemDetailModal);
        setActiveRow(id);
    };

    //Unix time 변환 함수
    function getUnixTime(t) {
        const date = new Date(t * 1000);
        const year = date.getFullYear();
        const month = '0' + (date.getMonth() + 1);
        const day = '0' + date.getDate();
        return year.toString().substr(-2) + '-' + month.substr(-2) + '-' + day.substr(-2);
    }

    const [userPk, setUserPk] = useState('');

    const getUserInfo = () => {
        const url = '/api/account/user-info';
        const data = {
            nickname: nickname
        };
        post(url, data)
        .then((res) => {
            console.log('^^'+res.USER_PK)
            setUserPk(res.USER_PK)
        })
    };

    useEffect(() => {
        getUserInfo()
    },[nickname])

    //생성된 액션 아이템 불러오기 API
    const getActionItems = async () => {
        const url = `/api/work/view-items`;
        const params = {
            id: userPk,
            currentPage: currentPage,
            feedsPerPage: rowsPerPage,
        };
        console.log(params)
        await get(url, { params: params }).then((res) => {
            setActionItemArray(res.items);
        });
    };

    useEffect(() => {
        getActionItems();
    }, [userPk, rowsPerPage, currentPage]);

    const nullPageAlert = () => {
        if (actionItemArray.length == 0) {
            setCurrentPage(1)
        }
    };

    useEffect(() => {
        nullPageAlert()
    }, [actionItemArray]);

    const classes = useStyles();

    return (
        <>
            {addActionItemModal ? <AddActionItem setAddActionItemModal={setAddActionItemModal} nickname={nickname} /> : <></>}

            {actionItemDetailModal ? (
                <ActionItemDetail
                    actionItemArray={actionItemArray}
                    activeRow={activeRow}
                    openDetailModal={openDetailModal}
                />
            ) : (
                <></>
            )}


            <TableContainer component={Paper} style={{marginBottom:'50px'}}>
                <div>
                    <div style={{ marginLeft: '10px' }}>
                        <Button
                            variant='contained'
                            color='primary'
                            className={classes.button}
                            style={{ marginTop: '10px' }}
                            onClick={openAddModal}
                        >
                            Add Action Item
                        </Button>
                    </div>
                </div>
                <Table className={classes.table} aria-label='simple table'>
                    <TableHead>
                        <TableRow>
                            <TableCell>No.</TableCell>
                            <TableCell>Title</TableCell>
                            <TableCell align='right'>Owner</TableCell>
                            <TableCell align='right'>Start date</TableCell>
                            <TableCell align='right'>Due date</TableCell>
                            <TableCell align='center'>Priority</TableCell>
                            <TableCell align='center'>Step</TableCell>
                            <TableCell align='right'>Details</TableCell>
                        </TableRow>
                    </TableHead>

                    <TableBody>
                        {actionItemArray.map((row, key) => (
                            <TableRow key={row.ACTION_PK}>
                                <TableCell align='left'>{row.ACTION_PK}</TableCell>
                                <TableCell component='th' scope='row' align='left'>
                                    {row.TITLE}
                                </TableCell>
                                <TableCell align='right' style={{width:'13%'}}>{row.owner.FIRST_NAME + ' ' + row.owner.LAST_NAME}</TableCell>
                                <TableCell align='right' style={{width:'13%'}}>{getUnixTime(row.START_DATE)}</TableCell>
                                <TableCell align='right' style={{width:'13%'}}>{getUnixTime(row.DUE_DATE)}</TableCell>
                                <TableCell align='right' style={{width:'13%'}}><Select
                                labelId="demo-simple-select-label"
                                id="demo-simple-select"
                                value={row.P_PK}
                                onChange={(e) => {priorityChange(e, row.ACTION_PK)}}
                                className={classes.input}
                                onClick={() => priorityUpdate(row.ACTION_PK)}
                                >
                                <MenuItem value={1}>High</MenuItem>
                                <MenuItem value={2}>Normal</MenuItem>
                                <MenuItem value={3}>Low</MenuItem>
                                </Select></TableCell>
                                <TableCell align='right' style={{width:'10%'}}><Select
                                labelId="demo-simple-select-label"
                                id="demo-simple-select"
                                value={row.STEP_PK}
                                onChange={(e) => {stepChange(e, row.ACTION_PK)}}
                                className={classes.input}
                                onClick={() => priorityUpdate(row.ACTION_PK)}
                                >
                                <MenuItem value={1}>Assigned</MenuItem>
                                <MenuItem value={2}>Ongoing</MenuItem>
                                <MenuItem value={3}>Done</MenuItem>
                                </Select></TableCell>
                                <TableCell align='right' style={{width:'3%'}}>
                                    <Tooltip title='View details'>
                                        <IconButton>
                                            <Pageview onClick={() => openDetailModal(key)} />
                                        </IconButton>
                                    </Tooltip>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>

                <div className={classes.footerDiv}>
                    <TableFooter style={{ height: 80, display: 'flex', width: 500, alignItems: 'center' }}>
                        <Typography style={{ margin: 10 }}>Rows per page:</Typography>
                        <FormControl className={classes.formControl} style={{ margin: 5 }}>
                            <Select labelId='demo-simple-select-label' id='demo-simple-select' value={rowsPerPage}>
                                <MenuItem
                                    value={10}
                                    onClick={() => {
                                        setRowsPerPage(10);
                                    }}
                                >
                                    10
                                </MenuItem>
                                <MenuItem
                                    value={20}
                                    onClick={() => {
                                        setRowsPerPage(20);
                                    }}
                                >
                                    20
                                </MenuItem>
                                <MenuItem
                                    value={30}
                                    onClick={() => {
                                        setRowsPerPage(30);
                                    }}
                                >
                                    30
                                </MenuItem>
                            </Select>
                        </FormControl>

                        <Tooltip title='Previous Page' style={{ marginLeft: 20 }}>
                            <IconButton>
                                <ArrowBackIos
                                    onClick={() => {
                                        setCurrentPage(currentPage - 1);
                                    }}
                                />
                            </IconButton>
                        </Tooltip>

                        <Tooltip title='Next page'>
                            <IconButton>
                                <ArrowForwardIos
                                    onClick={() => {
                                        setCurrentPage(currentPage + 1);
                                    }}
                                />
                            </IconButton>
                        </Tooltip>
                    </TableFooter>
                </div>
            </TableContainer>
        </>
    );
};

export default ActionItems;