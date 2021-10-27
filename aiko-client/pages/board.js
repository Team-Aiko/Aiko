import * as React from 'react';
import { DataGrid } from '@material-ui/data-grid';
import axios from 'axios';
import { useState } from 'react';



export default function Board() {

  let columns = [
    { field: 'id',
      headerName: 'ID',
      width: 100
    },
    {
      field: 'title',
      headerName: '제목',
      width: 800,
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
      width: 130,
      editable: true,
    },
    {
      field: 'count',
      headerName: '조회수',
      type: 'number',
      width:130,
      editable: true,
    },
  ];


  
  let rows = [
    { id: 1, title: 'Snow', name: '이치코', date: '21/10/27', count:null},
  ];

  const [title, setTitle] = useState('');
  const [name, setName] = useState('');

  const onChangeTitle = (e) => {
    setTitle(e.target.value);
  }

  const onChangeName = (e) => {
    setName(e.target.value);
  }


  function onClickAdd() {
    rows.push({id:null, title:{title}, name:{name}, date:null, count:null})
  }

  return (
    <div style={{ height: 800, width: '100%' }}>
      <DataGrid
        rows={rows}
        columns={columns}
        pageSize={10}
        checkboxSelection
        disableSelectionOnClick
      />

      <input style={{height:100, width:'20%'}} onChange={onChangeTitle} value={title}/>
      <input type="text" style={{height:100, width:'60%'}} onChange={onChangeName} value={name}/>
      <button onClick={onClickAdd}>등록</button>
    </div>
  );
}