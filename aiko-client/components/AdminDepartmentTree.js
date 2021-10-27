import React, { useState, useEffect, useRef, createRef } from 'react';
import styles from '../styles/components/AdminDepartmentTree.module.css';
import { makeStyles } from '@material-ui/core/styles';
import TreeView from '@material-ui/lab/TreeView';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import ChevronRightIcon from '@material-ui/icons/ChevronRight';
import TreeItem from '@material-ui/lab/TreeItem';
import {
    Button,
    ClickAwayListener,
    Grow,
    IconButton,
    MenuItem,
    MenuList,
    Paper,
    Popper,
    TextField,
} from '@material-ui/core';
import { get, post } from 'axios';
import MoreIcon from '@material-ui/icons/MoreVert';

const useStyles = makeStyles({
    'department-tree': {
        height: '100%',
        flexGrow: 1,
        width: 400,
        border: '1px solid #bdbdbd',
        borderRadius: '4px',
    },
    'input-department': {
        marginRight: '8px',
    },
    'tree-item-label': {
        height: '48px',
        display: 'flex',
    },
});

export default function AdminDepartmentTree() {
    const classes = useStyles();
    const [topDepartmentName, setTopDepartName] = useState('');
    const [departmentList, setDepartmentList] = useState([]);
    const [openOption, setOpenOption] = useState('');
    const [anchorEl, setAnchorEl] = useState(null);
    const anchorRef = useRef([]);

    useEffect(() => {
        setAnchorEl(anchorRef.current);
    }, [anchorRef]);

    useEffect(() => {
        const url = 'api/company/department-tree';
        get(url).then((response) => {
            setDepartmentList(response.data.result);
        });
    }, []);

    function treeItemJsx(department, index) {
        return (
            <TreeItem
                nodeId={department.DEPARTMENT_PK + ''}
                label={
                    <div className={styles['tree-item-label']}>
                        {department.DEPARTMENT_NAME}
                        <IconButton ref={anchorRef} onClick={() => setOpenOption(department.DEPARTMENT_NAME)}>
                            <MoreIcon />
                        </IconButton>
                        <Popper
                            open={department.DEPARTMENT_NAME === openOption}
                            anchorEl={anchorEl}
                            role={undefined}
                            placement='bottom-end'
                            transition
                            disablePortal
                        >
                            <Paper>
                                <ClickAwayListener onClickAway={() => setOpenOption('')}>
                                    <MenuList
                                        autoFocusItem={!!openOption}
                                        id={`${department.DEPARTMENT_PK}-menu`}
                                        key={department.DEPARTMENT_PK}
                                    >
                                        <MenuItem onClick={() => updateDepartment(department)}>이름 변경</MenuItem>
                                        <MenuItem onClick={() => addDepartment(department)}>하위 부서 추가</MenuItem>
                                        <MenuItem onClick={() => deleteDepartment(department)}>삭제</MenuItem>
                                    </MenuList>
                                </ClickAwayListener>
                            </Paper>
                        </Popper>
                    </div>
                }
                key={department.DEPARTMENT_PK}
                classes={{ label: classes['tree-item-label'] }}
            >
                {department.children &&
                    department.children.map((children) => {
                        return treeItemJsx(children);
                    })}
            </TreeItem>
        );
    }

    const addDepartment = (value) => {
        if (value) {
            console.log('alert 띄우기');
            return;
        }
        const url = '/api/company/new-department';
        const data = {
            departmentName: topDepartmentName,
            parentPK: null,
            parentDepth: 15,
        };
        post(url, data).then((result) => {
            console.log(result);
        });
    };

    const updateDepartment = (value) => {
        console.log('update');
        // const url = '/api/company/change-department-name';
        // const data = {
        //     departmentPK: value.DEPARTMENT_PK,
        //     departmentName:
        // }
    };

    const deleteDepartment = (value) => {
        const url = '/api/company/delete-department';
        const data = {
            departmentPK: value.DEPARTMENT_PK,
        };
        post(url, data).then((result) => {
            console.log(result);
        });
    };

    return (
        <div className={styles['department-container']}>
            <div className={styles['input-department-wrapper']}>
                <TextField
                    className={classes['input-department']}
                    variant='outlined'
                    size='small'
                    fullWidth
                    onChange={(e) => setTopDepartName(e.target.value)}
                />
                <Button variant='contained' color='primary' onClick={addDepartment}>
                    추가
                </Button>
            </div>

            <TreeView
                className={classes['department-tree']}
                defaultCollapseIcon={<ExpandMoreIcon />}
                defaultExpandIcon={<ChevronRightIcon />}
            >
                {departmentList.map((department, index) => {
                    return treeItemJsx(department, index);
                })}
            </TreeView>
        </div>
    );
}
