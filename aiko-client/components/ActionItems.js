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
    }
}));

const ActionItems = () => {
    const [currentPage, setCurrentPage] = useState(1);
    const [rowsPerPage, setRowsPerPage] = useState(10);

    const [ownerPK, setOwnerPK] = useState(undefined);
    const [currentUserPK, setCurrentUserPK] = useState(undefined);

    //All information about created Action Items.
    const [actionItemArray, setActionItemArray] = useState([]);

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

    //현재 USER_PK 가져오는 API
    const getCurrentUserPk = async () => {
        const url = '/api/account/decoding-token';
        const res = await get(url)
            .then((res) => {
                console.log(res);
                setCurrentUserPK(res.data.USER_PK);
            })
            .catch((error) => {
                console.log(error);
            });
    };

    useEffect(() => {
        getCurrentUserPk()
    },[]);

    //생성된 액션 아이템 불러오기 API
    const getActionItems = async () => {
        const url = `/api/work/view-items`;
        const params = {
            id: currentUserPK,
            currentPage: currentPage,
            feedsPerPage: rowsPerPage,
        };
        await get(url, { params: params }).then((res) => {
            setActionItemArray(res.items);
        });
    };

    useEffect(() => {
        getActionItems();
    }, [currentPage, rowsPerPage]);

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
            {addActionItemModal ? <AddActionItem setAddActionItemModal={setAddActionItemModal} /> : <></>}

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
                            <TableCell align='right'>Details</TableCell>
                        </TableRow>
                    </TableHead>

                    <TableBody>
                        {actionItemArray.map((row, key) => (
                            <TableRow key={key}>
                                <TableCell align='left'>{row.ACTION_PK}</TableCell>
                                <TableCell component='th' scope='row' align='left'>
                                    {row.TITLE}
                                </TableCell>
                                <TableCell align='right'>{row.owner.FIRST_NAME + ' ' + row.owner.LAST_NAME}</TableCell>
                                <TableCell align='right'>{getUnixTime(row.START_DATE)}</TableCell>
                                <TableCell align='right'>{getUnixTime(row.DUE_DATE)}</TableCell>
                                <TableCell align='right'>
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
