import { Typography, IconButton, Button } from '@material-ui/core';
import { Clear } from '@material-ui/icons';
import styles from '../../styles/components/EApprovalWrite.module.css';
import SearchMemberModal from '../SearchMemberModal';
import { useState, useEffect } from 'react';

function ApprovalTableElement({ index, removeApprovalSpace, getObjectFromChild }) {
    const [openSearchMemberModal, setOpenSearchMemberModal] = useState(false);

    const memberModalTrigger = () => {
        setOpenSearchMemberModal(!openSearchMemberModal);
    };

    //결재자 합의자
    const [condition, setCondition] = useState('');

    //멤버 선택
    const [selectedUser, setSelectedUser] = useState([]);

    const [stepStatusValue, setStepStatusValue] = useState(undefined);
    const [userPkValue, setUserPkValue] = useState(undefined);
    const [stepLevelValue, setStepLevelValue] = useState(undefined);

    const key1 = 'stepStatus';
    const key2 = 'userPk';
    const key3 = 'stepLevel';

    const approvalInfo = {
        [key1]: stepStatusValue,
        [key2]: userPkValue,
        [key3]: stepLevelValue,
    };

    useEffect(() => {
        if (selectedUser[0]) {
            setUserPkValue(selectedUser[0].USER_PK);
        }
    });

    useEffect(() => {
        if (approvalInfo[key1] && approvalInfo[key2] && approvalInfo[key3]) {
            getObjectFromChild(approvalInfo);
        }
        setStepStatusValue(undefined);
        setUserPkValue(undefined);
        setStepLevelValue(undefined);
    });

    return (
        <>
            <table className={styles['approvalTable']}>
                <IconButton
                    size='small'
                    style={{ float: 'right' }}
                    onClick={() => {
                        removeApprovalSpace(index);
                    }}
                >
                    <Clear style={{ width: 15, color: 'grey' }} />
                </IconButton>
                <tbody className={styles['approval']}>
                    <tr className={styles['name']}>
                        <th>
                            <select
                                style={{ marginLeft: 10 }}
                                onChange={(e) => {
                                    setStepStatusValue(e.target.value);
                                }}
                            >
                                <option value=''>선택</option>
                                <option value='0'>결재자</option>
                                <option value='1'>합의자</option>
                            </select>
                        </th>
                    </tr>
                    <tr className={styles['signature']}>
                        <td>
                            <Button disabled>승인</Button>
                        </td>
                    </tr>
                    <tr className={styles['name']} onClick={memberModalTrigger}>
                        <td>
                            {selectedUser && selectedUser[0] ? (
                                selectedUser[0].LAST_NAME + selectedUser[0].FIRST_NAME
                            ) : (
                                <Typography variant='button' display='block'>
                                    <Button
                                        size='small'
                                        onClick={() => {
                                            setStepLevelValue(index);
                                        }}
                                    >
                                        검색
                                    </Button>
                                </Typography>
                            )}
                        </td>
                    </tr>
                </tbody>
            </table>

            {openSearchMemberModal ? (
                <SearchMemberModal
                    open={openSearchMemberModal}
                    onClose={memberModalTrigger}
                    onClickSelectedUserList={(user) => {
                        setSelectedUser(user);
                        setOpenSearchMemberModal(false);
                    }}
                    multipleSelection={true}
                />
            ) : (
                <></>
            )}
        </>
    );
}

export default ApprovalTableElement;
