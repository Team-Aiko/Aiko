import React, { useState } from 'react';

const E_Approval_List = ({ getCurrentValueFromList, getWriteStatus }) => {
    const writeButton = {
        desc: '기안서 작성',
        status: 'writeNewApproval',
    };

    const buttonList = [
        {
            desc: '전체',
            status: 'allList',
        },
        {
            desc: '대기',
            status: 'waitingList',
        },
        {
            desc: '진행',
            status: 'processingList',
        },
        {
            desc: '완료',
            status: 'completedList',
        },
    ];

    //기안서 작성 페이지를 위한 상위 컴포넌트로 writeButton.status 전달.
    const sendWritingStatus = () => {
        getWriteStatus(writeButton.status);
    };

    return (
        <div>
            <button onClick={sendWritingStatus}>{writeButton.desc}</button>
            {buttonList.map((button) => (
                <button
                    onClick={() => {
                        getCurrentValueFromList(button.status);
                    }}
                >
                    {button.desc}
                </button>
            ))}
        </div>
    );
};

export default E_Approval_List;
