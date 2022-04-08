import React, { useState } from 'react';
import styles from '../styles/eApproval.module.css';
import E_Approval_View from '../components/E-Approval/E_Approval_View';
import E_Approval_List from '../components/E-Approval/E_Approval_List';
import E_Approval_Write from '../components/E-Approval/E_Approval_Write';

const eApproval = () => {
    const allList = {
        desc: '전체',
        write: '작성자',
        title: '제목',
        process: '진행',
        date: '날짜',
    };

    const waitingList = {
        desc: '대기',
        write: '작성자',
        title: '제목',
        process: '결재대기',
        date: '날짜',
    };

    const processingList = {
        desc: '진행',
        write: '작성자',
        title: '제목',
        process: '현재 결재선',
        date: '날짜',
    };

    const completedList = {
        desc: '완료',
        write: '작성자',
        title: '제목',
        process: '진행',
        date: '날짜',
    };

    //현재 E_Approval_View 컴포넌트로 보내줄 객체 변수명
    const [currentData, setCurrentData] = useState(allList);

    //받은 문자열 -> 변수명으로 변환을 위해 eval()
    const getCurrentValueFromList = (value) => {
        setCurrentData(eval(value));
    };

    //기안서 작성 Button은 UI가 다르기 때문에 같은 배열에 넣고 map()으로 순회 불가능. 따로 함수 작성 후 status값 받음
    const getWriteStatus = (value) => {
        setCurrentData(value);
    };

    return (
        <div className={styles['approvalPageMainDiv']}>
            <E_Approval_List getCurrentValueFromList={getCurrentValueFromList} getWriteStatus={getWriteStatus} />
            {currentData == 'writeNewApproval' ? <E_Approval_Write /> : <E_Approval_View currentData={currentData} />}
        </div>
    );
};

export default eApproval;
