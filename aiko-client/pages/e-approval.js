import React, { useState } from 'react';
import E_Approval_View from '../components/E-Approval/E_Approval_View';
import E_Approval_List from '../components/E-Approval/E_Approval_List';
import E_Approval_Write from '../components/E-Approval/E_Approval_Write';

const eApproval = () => {
    const allList = {
        desc: '전체',
        write: '작성자',
        process: '진행',
        date: '날짜',
    };

    const waitingList = {
        desc: '대기',
        write: '작성자',
        process: '결재대기',
        date: '날짜',
    };

    const processingList = {
        desc: '진행',
        write: '작성자',
        process: '현재 결재선',
        date: '날짜',
    };

    const completedList = {
        desc: '완료',
        write: '작성자',
        process: '진행',
        date: '날짜',
    };

    const [currentData, setCurrentData] = useState(allList);

    const getCurrentValueFromList = (value) => {
        setCurrentData(eval(value));
    };

    const getWriteStatus = (value) => {
        setCurrentData(value)
    }

    return (
        <div>
            <E_Approval_List getCurrentValueFromList={getCurrentValueFromList} getWriteStatus={getWriteStatus}/>
            <E_Approval_View currentData={currentData} />
            {currentData == 'writeNewApproval' ? <E_Approval_Write /> : <></>}
        </div>
    );
};

export default eApproval;
