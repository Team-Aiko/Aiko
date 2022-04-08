import React, { useState } from 'react';
import styles from '../../styles/components/EApprovalList.module.css';
import { List, ListItem, ListItemText, Button, makeStyles, ListItemIcon } from '@material-ui/core';
import { Check } from '@material-ui/icons';

const useStyles = makeStyles({
    list: {
        padding: 0,
    },
});

const E_Approval_List = ({ getCurrentValueFromList, getWriteStatus }) => {
    const classes = useStyles();

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

    const [selectedList, setSelectedList] = useState('');

    return (
        <div className={styles['EApprovalListDiv']}>
            <div className={styles['buttonListDiv']}>
                <Button
                    variant='contained'
                    color='primary'
                    onClick={sendWritingStatus}
                    style={{ height: '46px', margin: '15px 20px 25px', fontSize: '1vw' }}
                >
                    {writeButton.desc}
                </Button>
                {buttonList.map((button) => (
                    <List
                        className={classes.list}
                        onClick={() => {
                            getCurrentValueFromList(button.status);
                            setSelectedList(button.status);
                        }}
                    >
                        <ListItem button>
                            {selectedList == button.status ? (
                                <ListItemIcon>
                                    <Check/>
                                </ListItemIcon>
                            ) : (
                                <></>
                            )}
                            <ListItemText primary={button.desc} />
                        </ListItem>
                    </List>
                ))}
            </div>
        </div>
    );
};

export default E_Approval_List;
