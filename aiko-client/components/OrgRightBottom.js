import React, {useState} from 'react';
import {DataGrid} from '@mui/x-data-grid';

// * Container Component
export default function CComp(props) {
    return <PComp />;
}

// * Presentational Component
function PComp(props) {
    const column = [
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
    return (
        <React.Fragment>
            <div style={{height: 400, width: '100%'}}>
                <DataGrid rows={[]} columns={column} />
            </div>
        </React.Fragment>
    );
}
