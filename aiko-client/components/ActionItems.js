import React from 'react';
import styles from '../styles/ActionItems.module.css';
import {useState, useEffect} from 'react';
import { makeStyles } from '@material-ui/core/styles';
import AddActionItem from './AddActionItem.js';
import ActionItemDetail from './ActionItemDetail.js';
import {get, post} from '../_axios';
import {Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Button, TablePagination,
        TableFooter, Tooltip, IconButton} from '@material-ui/core';
import PageviewIcon from '@material-ui/icons/Pageview';


const useStyles = makeStyles({
  table: {
    minWidth: 650,
  },
});


const ActionItems = () => {

    const [currentPage, setCurrentPage] = useState(1);
    const [ownerPK, setOwnerPK] = useState(undefined);
    const [currentUserPK, setCurrentUserPK] = useState(undefined);

    //All information about created Action Items.
    const [actionItemArray, setActionItemArray] = useState([]);


    // 액션 아이템 추가 모달, 액션 아이템 상세보기 모달 boolean 값.
    const [addActionItemModal, setAddActionItemModal] = useState(false);
    const [actionItemDetailModal, setActionItemDetailModal] = useState(false);

    const [activeRow, setActiveRow] = useState(0);

    const openAddModal = () => {
        setAddActionItemModal(!addActionItemModal)
    };

    const openDetailModal = (id) => {
        setActionItemDetailModal(!actionItemDetailModal);
        setActiveRow(id);
    };


    //Unix time 변환 함수
    function getUnixTime(t) {
        const date = new Date(t * 1000);
        const year = date.getFullYear();
        const month = "0" + (date.getMonth() + 1);
        const day = "0" + date.getDate();
        return year.toString().substr(-2) + "-" + month.substr(-2) + "-" + day.substr(-2)
    }

    //현재 USER_PK 가져오는 API
    const getCurrentUserPk = async () => {
        const url = '/api/account/decoding-token';
        const res = await get(url)
        .then((res) => {
            console.log(res)
            setCurrentUserPK(res.data.USER_PK)
        })
        .catch((error) => {
            console.log(error)
        })
    }

    //생성된 액션 아이템 불러오기 API
    const getActionItems = async () => {
        const url = `/api/work/view-items`;
        const params = {
            id: currentUserPK,
            currentPage: currentPage,
        };
        await get(url, { params: params }).then((res) => {
            setActionItemArray(res.items);
            console.log(res);
            console.log(params)
        });
    };

    useEffect(() => {
        getActionItems();
    }, []);

    //Pagination
    const [page, setPage] = React.useState(0);
    const [rowsPerPage, setRowsPerPage] = React.useState(10);

    const handleChangePage = (event, newPage) => {
        setPage(newPage);
    };

    const handleChangeRowsPerPage = (event) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0);
    };


    const classes = useStyles();

    return (   
    <>
        {
            addActionItemModal
            ? <AddActionItem setAddActionItemModal={setAddActionItemModal}/>
            : <></>
        }

        {
            actionItemDetailModal
            ? <ActionItemDetail actionItemArray={actionItemArray}
                                activeRow={activeRow}
                                openDetailModal={openDetailModal}/>
            : <></>
        }

        <TableContainer component={Paper}>
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
        <Table className={classes.table} aria-label="simple table">
            <TableHead>
                <TableRow>
                    <TableCell>No.</TableCell>
                    <TableCell>Title</TableCell>
                    <TableCell align="right">Owner</TableCell>
                    <TableCell align="right">Start date</TableCell>
                    <TableCell align="right">Due date</TableCell>
                    <TableCell align="right">Details</TableCell>
                </TableRow>
            </TableHead>
            
            <TableBody>
            {actionItemArray.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((row, key) => (
                <TableRow key={key}>
                    <TableCell align='left'>{row.ACTION_PK}</TableCell>
                    <TableCell component="th" scope="row" align='left'>{row.TITLE}</TableCell>
                    <TableCell align="right">{row.owner.FIRST_NAME + ' ' + row.owner.LAST_NAME}</TableCell>
                    <TableCell align="right">{getUnixTime(row.START_DATE)}</TableCell>
                    <TableCell align="right">{getUnixTime(row.DUE_DATE)}</TableCell>
                    <TableCell align="right">

                    <Tooltip title="View details">
                        <IconButton>
                            <PageviewIcon onClick={() => openDetailModal(key)}/>
                        </IconButton>
                    </Tooltip>

                    </TableCell>
                </TableRow>
            ))}
            </TableBody>
        </Table>

        <TableFooter>
            <TablePagination
            rowsPerPageOptions={[10, 20, 30]}
            component="div"
            count={actionItemArray.length}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={handleChangePage}
            onRowsPerPageChange={handleChangeRowsPerPage}
            />
        </TableFooter>
        </TableContainer>
    </>
    )
}

export default ActionItems;
