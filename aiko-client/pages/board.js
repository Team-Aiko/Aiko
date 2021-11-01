import * as React from 'react';
import { DataGrid } from '@material-ui/data-grid';
import axios from 'axios';
import { useState } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import Button from '@material-ui/core/Button';
import Router from 'next/router';
import Link from 'next/link';
import writeBoard from './writeBoard.js';

const useStyles = makeStyles((theme) => ({
  root: {
    '& > *': {
      margin: theme.spacing(1),
    },
  },
}));


export default function Board() {

  let columns = [
    { field: 'id',
      headerName: 'ID',
      width: 100
    },
    {
      field: 'title',
      headerName: '제목',
      width: 600,
      editable: false,
    },
    {
      field: 'name',
      headerName: '작성자',
      type: 'string',
      width: 130,
      editable: false,
    },
    {
      field: 'date',
      headerName: '작성일',
      type: 'string',
      width: 230,
      editable: false,
    },
    {
      field: 'count',
      headerName: '조회수',
      type: 'number',
      width: 150,
      editable: false,
    },
  ];

    
  const now = new Date

  const [count, setCount] = useState(1);
  const [id, setId] = useState(1);
  const [date, setDate] = useState(now.toLocaleString());
  const [title, setTitle] = useState('');
  const [name, setName] = useState('');

  const [rows, setRows] = useState([{ id: id, title: title, name: name, date: date, count:count}])


  return (

    <>

    <Link href='/writeBoard'>
    <Button variant="contained" style={{width:170, display:'flex', marginLeft:'auto', padding:'10px'}}>
      <writeBoard title={title} name={name}/>
      글쓰기
    </Button>
    </Link>

    <div style={{ height: 800, width: '100%' }}>
        <DataGrid
          rows={rows}
          columns={columns}
          pageSize={10}
          checkboxSelection
          disableSelectionOnClick
        />
    </div>



    </>
  );
}