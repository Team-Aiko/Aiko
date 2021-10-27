import * as React from 'react';
import { DataGrid } from '@material-ui/data-grid';
import axios from 'axios';
import { useState } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import Button from '@material-ui/core/Button';

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
      editable: true,
    },
    {
      field: 'name',
      headerName: '작성자',
      type: 'string',
      width: 130,
      editable: true,
    },
    {
      field: 'date',
      headerName: '작성일',
      type: 'string',
      width: 230,
      editable: true,
    },
    {
      field: 'count',
      headerName: '조회수',
      type: 'number',
      width: 150,
      editable: true,
    },
  ];

  const now = new Date

  const [count, setCount] = useState(1);
  const [id, setId] = useState(1);
  const [date, setDate] = useState(now.toLocaleString());
  const [title, setTitle] = useState('');
  const [name, setName] = useState('');
  const [rows, setRows] = useState([{ id: 1, title: 'Snow', name: '이치코', date: date, count:null}])

  const onChangeTitle = (e) => {
    setTitle(e.target.value);
  }

  const onChangeName = (e) => {
    setName(e.target.value);
  }


  function onClickAdd() {
    setId(id+1);
    setCount(count+1)
    setRows([...rows, {id:id, title:title, name:name, date:date, count:count}])
  }

  return (
    <>

    <Button variant="contained" style={{width:170, display:'flex', marginLeft:'auto', padding:'10px'}}>글쓰기</Button>

    <div style={{ height: 800, width: '100%' }}>
      <DataGrid
        rows={rows}
        columns={columns}
        pageSize={10}
        checkboxSelection
        disableSelectionOnClick
      />

      <input style={{height:100, width:'20%'}} onChange={onChangeName} value={name}/>
      <input type="text" style={{height:100, width:'60%'}} onChange={onChangeTitle} value={title}/>
      <button onClick={onClickAdd}>등록</button>
    </div>

    </>
  );
}