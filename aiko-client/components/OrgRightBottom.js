import React, { useState } from 'react';
import Router from 'next/router';
import PropTypes from 'prop-types';
import { DataGrid } from '@mui/x-data-grid';
import { useSelector, useDispatch } from 'react-redux';
import { get } from 'axios';
import { setOneMem } from '../_redux/businessReducer';

// * Container Component
export default function CComp(props) {
    const deptMember = useSelector((state) => state.businessReducer.deptMember);
    const dispatch = useDispatch();

    const handleOneMem = (oneMem) => {
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
            width: 150,
        },
        {
            field: 'DEPARTMENT_PK',
            headerName: 'dept. ID',
            width: 150,
        },
        {
            field: 'DEPARTMENT_NAME',
            headerName: 'dept. name',
            width: 150,
        },
        {
            field: 'EMAIL',
            headerName: 'email',
            width: 200,
        },
        {
            field: 'TEL',
            headerName: 'tel',
            width: 200,
        },
    ];
    const { deptMember } = props;
    const rows = deptMember;
    let refinedRows = [];
    if (rows && rows.length > 0) {
        refinedRows = rows.map((curr) => {
            const temp = { ...curr };
            temp.NAME = curr.FIRST_NAME + curr.LAST_NAME;
            temp.id = curr.USER_PK;
            return temp;
        });
    }

    const handleShowSpecific = (param, event) => {
        const userPK = param.id;
        Router.push(`/member/${userPK}`);
    };

    return (
        <>
            <div style={{ height: 400, width: '100%' }}>
                <DataGrid rows={refinedRows} columns={columns} onCellClick={handleShowSpecific} />
            </div>
        </>
    );
}

PComp.propTypes = {
    deptMember: PropTypes.array.isRequired,
};
