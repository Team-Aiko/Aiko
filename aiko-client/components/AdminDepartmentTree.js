import React, { useState, useEffect, useRef, createRef } from 'react';
import styles from '../styles/components/AdminDepartmentTree.module.css';
import { makeStyles } from '@material-ui/core/styles';
import TreeView from '@material-ui/lab/TreeView';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import ChevronRightIcon from '@material-ui/icons/ChevronRight';
import TreeItem from '@material-ui/lab/TreeItem';
import {
    Button,
    IconButton,
    Menu,
    MenuItem,
    TextField,
    ThemeProvider,
    unstable_createMuiStrictModeTheme,
} from '@material-ui/core';
import { get, post } from 'axios';
import MoreIcon from '@material-ui/icons/MoreHoriz';
import InputModal from './InputModal';

/**
 * @todo InputModal component props state -> 객체로 변경해서 처리하기
 * @todo 부서 추가, 이름변경, 삭제 시 reload X -> departmentList 의 해당 부서의 값만 변경해주기
 */
const useStyles = makeStyles({
    'department-tree': {
        height: '100%',
        flexGrow: 1,
        minWidth: '280px',
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

export default function AdminDepartmentTree(props) {
    const { setDepartment } = props;
    const classes = useStyles();
    const theme = unstable_createMuiStrictModeTheme();
    const [topDepartmentName, setTopDepartmentName] = useState('');
    const [departmentList, setDepartmentList] = useState([]);
    const [openOptions, setOpenOptions] = useState({
        department: {},
        anchorEl: null,
    });

    // Todo : InputModal props 객체형태로 변경하기
    // const [inputModalOptions, setInputModalOptions] = useState({});
    const [openInputModal, setOpenInputModal] = useState(false);
    const [inputModalTitle, setInputModalTitle] = useState('');
    const [inputModalValue, setInputModalValue] = useState('');
    const [inputModalButtonName, setInputModalButtonName] = useState('');
    const [inputModalPlaceholder, setInputModalPlaceholder] = useState('');
    const [inputModalHandleClick, setInputModalHandleClick] = useState('');

    useEffect(() => {
        loadDepartmentList();
    }, []);

    const loadDepartmentList = () => {
        const url = 'api/company/department-tree';
        setDepartmentList([]);
        get(url).then((response) => {
            setDepartmentList(response.data.result);
        });
    };

    const openAddDepartment = (event) => {
        event.preventDefault();

        setOpenInputModal(true);
        setInputModalTitle('소속 부서 추가');
        setInputModalButtonName('추가');
        setInputModalPlaceholder(openOptions.department.DEPARTMENT_NAME);
        setInputModalHandleClick('add');
    };

    // Todo : 부서추가, 삭제, 이름변경 시 state 에서 해당 부서의 값만 변경해주기 - reload X
    const addDepartment = () => {
        if (!inputModalHandleClick && !topDepartmentName) return;

        const url = '/api/company/new-department';
        const data = {
            departmentName: openOptions.anchorEl ? inputModalValue : topDepartmentName,
            parentPK: openOptions.anchorEl ? openOptions.department.DEPARTMENT_PK : null,
            parentDepth: openOptions.anchorEl ? openOptions.department.DEPTH : 0,
        };
        post(url, data).then((result) => {
            resetInputModal();
            resetOpenOptions();
            setTopDepartmentName('');
            loadDepartmentList();
        });
    };

    const updateDepartment = (event) => {
        event.preventDefault();

        setOpenInputModal(true);
        setInputModalTitle('부서 이름 변경');
        setInputModalButtonName('변경');
        setInputModalPlaceholder(openOptions.department.DEPARTMENT_NAME);
        setInputModalHandleClick('update');

        if (!inputModalValue) return;

        const url = '/api/company/change-department-name';
        const data = {
            departmentPK: openOptions.department.DEPARTMENT_PK,
            departmentName: inputModalValue,
        };
        post(url, data).then((result) => {
            resetInputModal();
            resetOpenOptions();
            loadDepartmentList();
        });
    };

    const deleteDepartment = (event) => {
        event.preventDefault();

        if (openOptions.department.children.length > 0) {
            alert('소속 부서를 먼저 삭제해주세요');
            resetOpenOptions();
            return;
        }

        const url = '/api/company/delete-department';
        const data = {
            departmentPK: openOptions.department.DEPARTMENT_PK,
        };
        post(url, data)
            .then((result) => {
                loadDepartmentList();
            })
            .catch((error) => {
                alert('appCode : ', error.response.data.appCode);
            });
    };

    const handleClose = (event) => {
        event.preventDefault();
        resetOpenOptions();
    };

    const handleMore = (event, department) => {
        event.preventDefault();

        setOpenOptions({
            department: department,
            anchorEl: event.currentTarget,
        });
    };

    const resetOpenOptions = () => {
        setOpenOptions({
            department: {},
            anchorEl: null,
        });
    };

    const resetInputModal = () => {
        setOpenInputModal(false);
        setInputModalValue('');
        setInputModalHandleClick('');
    };

    const filterDepartment = (departmentList, departmentName) => {
        for (const item of departmentList) {
            if (item.DEPARTMENT_NAME === departmentName) {
                return setDepartment(item);
            }

            if (item.children.length > 0) {
                filterDepartment(item.children, departmentName);
            }
        }
    };

    function treeItemJsx(department) {
        return (
            <TreeItem
                nodeId={department.DEPARTMENT_PK + ''}
                label={
                    <div className={styles['tree-item-label']}>
                        {department.DEPARTMENT_NAME}
                        <IconButton
                            id={department.DEPARTMENT_PK}
                            aria-controls='basic-menu'
                            aria-haspopup='true'
                            aria-expanded={openOptions.department.DEPARTMENT_NAME === department.DEPARTMENT_NAME}
                            onClick={(e) => handleMore(e, department)}
                        >
                            <MoreIcon />
                        </IconButton>
                        <Menu
                            anchorEl={openOptions.anchorEl}
                            open={openOptions.department.DEPARTMENT_NAME === department.DEPARTMENT_NAME}
                            onClose={handleClose}
                            getContentAnchorEl={null}
                            anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
                            MenuListProps={{
                                'aria-labelledby': department.DEPARTMENT_PK,
                            }}
                        >
                            <MenuItem onClick={updateDepartment}>이름 변경</MenuItem>
                            <MenuItem onClick={openAddDepartment}>소속 부서 추가</MenuItem>
                            <MenuItem onClick={deleteDepartment}>삭제</MenuItem>
                        </Menu>
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

    return (
        <div className={styles['department-container']}>
            <div className={styles['input-department-wrapper']}>
                <TextField
                    className={classes['input-department']}
                    variant='outlined'
                    size='small'
                    fullWidth
                    onChange={(e) => setTopDepartmentName(e.target.value)}
                    value={topDepartmentName}
                />
                <Button variant='contained' color='primary' onClick={addDepartment} style={{ flexShrink: 0 }}>
                    부서추가
                </Button>
            </div>

            <ThemeProvider theme={theme}>
                <TreeView
                    className={classes['department-tree']}
                    defaultCollapseIcon={<ExpandMoreIcon />}
                    defaultExpandIcon={<ChevronRightIcon />}
                    onNodeSelect={(event) => {
                        filterDepartment(departmentList, event.target.textContent);
                    }}
                >
                    {departmentList.map((department) => {
                        return treeItemJsx(department);
                    })}
                </TreeView>
            </ThemeProvider>
            <InputModal
                open={openInputModal}
                onClose={() => setOpenInputModal(false)}
                title={inputModalTitle}
                value={inputModalValue}
                onChangeInput={(e) => setInputModalValue(e.target.value)}
                buttonName={inputModalButtonName}
                handleClick={inputModalHandleClick === 'update' ? updateDepartment : addDepartment}
                placeholder={inputModalPlaceholder}
            />
        </div>
    );
}
