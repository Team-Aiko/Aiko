import React, { useState } from 'react';
import { DataGrid } from '@mui/x-data-grid';
import { useSelector, useDispatch } from 'react-redux';
import { setOneMem } from '../_redux/businessReducer';

// * Container Component
export default function CComp(props) {
    const deptMember = useSelector(state => state.businessReducer.deptMems);
    const dispatch = useDispatch();

    const handleOneMem = oneMem => {
        dispatch(setOneMem(oneMem));
    };

    return <PComp deptMember={deptMember} handleOneMem={handleOneMem} />;
}

// * Presentational Component
function PComp(props) {
    const columns = [
        {
            field: 'NAME',
            headerName: 'name',
            width: 70,
        },
        {
            field: 'DEPARTMENT_PK',
            headerName: 'department id',
            width: 10,
        },
        {
            field: 'DEPARTMENT_NAME',
            headerName: 'dpt. name',
            width: 10,
        },
        {
            field: 'EMAIL',
            headerName: 'email',
            width: 100,
        },
    ];

    const rows = props.deptMember;
    let refinedRows = [];
    if (rows && rows.length > 0) {
        refinedRows = rows.map(curr => {
            curr.NAME = curr.FIRST_NAME + curr.LAST_NAME;
            return curr;
        });
    }
    console.log('🚀 ~ file: OrgRightBottom.js ~ line 45 ~ PComp ~ rows', rows);
    return (
        <React.Fragment>
            <div style={{ height: 400, width: '100%' }}>
                <DataGrid rows={[]} columns={columns} />
            </div>
        </React.Fragment>
    );
}
