import * as React from 'react';
import { DataGrid } from '@material-ui/data-grid';

const columns = [
  { field: 'id', headerName: 'ID', width: 100 },
  {
    field: '성함',
    headerName: '성함',
    width: 150,
    editable: true,
  },
  {
    field: '부서',
    headerName: '부서',
    type: 'string',
    width: 110,
    editable: true,
  },
  {
    field: '직급',
    headerName: '직급',
    type: 'string',
    width: 110,
    editable: true,
  },
  {
    field: '게시글',
    headerName: '게시글',
    description: 'This column has a value getter and is not sortable.',
    sortable: false,
    width: 800,
    valueGetter: (params) =>
      `${params.getValue(params.id, 'firstName') || ''} ${
        params.getValue(params.id, 'lastName') || ''
      }`,
  },
];

const rows = [
  { id: 1, 성함: 'Snow', 부서: null, 직급: '사장'},
  { id: 2, 성함: 'Lannister', 부서: '생산관리', 직급: '사원'},
  { id: 3, 성함: 'Lannister', 부서: '국내영업', 직급: '팀장'},
  { id: 4, 성함: 'Stark', 부서: '감사팀', 직급: '사원'},
  { id: 5, 성함: 'Targaryen', 부서: '생산관리', 직급: '대리'},
  { id: 6, 성함: 'Melisandre', 부서: '고객지원', 직급: '부장'},
  { id: 7, 성함: 'Clifford', 부서: '생산관리', 직급: '과장'},
  { id: 8, 성함: 'Frances', 부서: '해외영업', 직급: '사원'},
  { id: 9, 성함: 'Roxie', 부서: '경영지원', 직급: '사원'},
  { id: 10, 성함: 'Roxie', 부서: '회계팀', 직급: '과장'},
  { id: 11, 성함: 'Roxie', 부서: '경영관리', 직급: '대리'},
  { id: 12, 성함: 'Roxie', 부서: '인사팀', 직급: '차장'},

];
const handleLogin = () => {
  const url = '/api/notice-board/files';
  const config = {
      header: {
          'content-type': 'application/json',
      },
  };
  (async () => {
      try {
      await get(url, config);
      } catch (err) {
          console.log(err);
      }
  })();
};


export default function Board() {
  return (
    <div style={{ height: 800, width: '100%' }}>
      <DataGrid
        rows={rows}
        columns={columns}
        pageSize={10}
        checkboxSelection
        disableSelectionOnClick
      />
      <div onClick={handleLogin}> 파일 다운로드 테스트 </div>
    </div>
  );
}