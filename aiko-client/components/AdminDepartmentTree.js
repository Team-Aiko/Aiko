import React, { useState } from 'react';
import styles from '../styles/components/AdminDepartmentTree.module.css';
import { makeStyles } from '@material-ui/core/styles';
import TreeView from '@material-ui/lab/TreeView';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import ChevronRightIcon from '@material-ui/icons/ChevronRight';
import TreeItem from '@material-ui/lab/TreeItem';
import { Button, TextField } from '@material-ui/core';
import { get, post } from 'axios';

const useStyles = makeStyles({
    'department-tree': {
        height: '100%',
        flexGrow: 1,
        width: 400,
    },
    'input-department': {
        marginRight: '8px',
    },
});

export default function AdminDepartmentTree() {
    const classes = useStyles();
    const [topDepartmentName, setTopDepartName] = useState('');
    const [departmentList, setDepartmentList] = useState([
        {
            value: 'A',
            children: [
                {
                    value: 'a-1',
                },
                {
                    value: 'a-2',
                    children: [
                        {
                            value: 'a-2-1',
                        },
                        {
                            value: 'a-2-2',
                        },
                        {
                            value: 'a-2-3',
                        },
                    ],
                },
                {
                    value: 'a-3',
                },
            ],
        },
        {
            value: 'B',
        },
        {
            value: 'C',
        },
    ]); // test용 데이터

    function treeItemJsx(department) {
        return (
            <TreeItem nodeId={department.value} label={department.value} key={department.value}>
                {department.children &&
                    department.children.map((children) => {
                        return treeItemJsx(children);
                    })}
            </TreeItem>
        );
    }

    const addDepartment = (params) => {
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
                {departmentList.map((department) => {
                    return treeItemJsx(department);
                })}
            </TreeView>
        </div>
    );
}
