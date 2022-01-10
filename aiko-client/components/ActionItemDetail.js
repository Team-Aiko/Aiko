import 'date-fns';
import styles from '../styles/ActionItems.module.css';
import react, { useState, useEffect } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import { TextField, Typography, FormControl, Select, MenuItem, IconButton, Tooltip } from '@material-ui/core';
import { Edit, Delete, Save, HighlightOff } from '@material-ui/icons';
import { get, post } from '../_axios';

const useStyles = makeStyles((theme) => ({
    formControl: {
        width: 140,
        color: 'black',
    },
    exitIcon: {
        display: 'flex',
        flexDirection: 'row',
        width: '95%',
        justifyContent: 'space-between',
        alignItems: 'center',
        textAlign: 'right',
        margin: '0 auto',
    },
    titleDescDiv: {
        display: 'block',
        margin: '0 auto',
        width: '80%',
        marginTop: 5,
    },
    titleInput: {
        display: 'block',
        fontSize: '10px',
    },
    date: {
        width: 150,
    },
    assignTypo: {
        display: 'block',
        textAlign: 'right',
        color: '#404040',
    },
    dateStep: {
        width: '80%',
        display: 'flex',
        textAlign: 'center',
        margin: '0 auto',
        marginTop: 5,
    },
    buttons: {
        fontSize: 30,
    },
    bottomIcons: {
        display: 'flex',
        justifyContent: 'space-between',
        width: '80%',
        margin: '0 auto',
        marginTop: 20,
    },
}));

const ActionItemDetail = ({ actionItemArray, activeRow, openDetailModal }) => {
    const classes = useStyles();

    const [detailTitle, setDetailTitle] = useState(actionItemArray[activeRow].TITLE);
    const [detailDesc, setDetailDesc] = useState(actionItemArray[activeRow].DESCRIPTION);

    //Unix time 변환 함수
    function getUnixTime(t) {
        const date = new Date(t * 1000);
        const year = date.getFullYear();
        const month = '0' + (date.getMonth() + 1);
        const day = '0' + date.getDate();
        return year.toString() + '-' + month.substr(-2) + '-' + day.substr(-2);
    }

    const [detailStartDate, setDetailStartDate] = useState(getUnixTime(actionItemArray[activeRow].START_DATE));
    const [detailDueDate, setDetailDueDate] = useState(getUnixTime(actionItemArray[activeRow].DUE_DATE));

    const [detailPriority, setDetailPriority] = useState(actionItemArray[activeRow].P_PK);
    const [detailStep, setDetailStep] = useState(actionItemArray[activeRow].STEP_PK);

    const [disabled, setDisabled] = useState(true);

    const checkProfile = () => {
        if (
            actionItemArray[activeRow].assigner.USER_PK == actionItemArray[activeRow].owner.USER_PK &&
            actionItemArray[activeRow].assigner.DEPARTMENT_PK == actionItemArray[activeRow].owner.DEPARTMENT_PK
        ) {
            setDisabled(!disabled);
        } else {
            alert('담당자만 수정 가능합니다.');
        }
    };

    const detailTitleChange = (e) => {
        setDetailTitle(e.target.value);
    };

    const detailDescChange = (e) => {
        setDetailDesc(e.target.value);
    };

    const detailStartDateChange = (e) => {
        setDetailStartDate(e.target.value);
        console.log(detailStartDate)
    };

    const detailDueDateChange = (e) => {
        setDetailDueDate(e.target.value);
        console.log(detailDueDate)
    };

    const deleteActionItem = () => {
        const url = '/api/work/delete-action-item';
        const data = {
            ACTION_PK: actionItemArray[activeRow].ACTION_PK,
        };
        if (
            actionItemArray[activeRow].assigner.DEPARTMENT_PK == actionItemArray[activeRow].owner.DEPARTMENT_PK ||
            actionItemArray[activeRow].assigner.USER_PK == actionItemArray[activeRow].owner.USER_PK
        ) {
            post(url, data)
                .then((res) => {
                    alert('삭제되었습니다');
                    openDetailModal();
                    console.log(res);
                })
                .catch((error) => {
                    console.log(error);
                });
        }
    };

    const updateActionItem = () => {
        const url = '/api/work/update-action-item';
        const data = {
            ACTION_PK: actionItemArray[activeRow].ACTION_PK,
            OWNER_PK: actionItemArray[activeRow].owner.USER_PK,
            TITLE: detailTitle,
            DESCRIPTION: detailDesc,
            START_DATE: Math.floor(new Date(detailStartDate).getTime() / 1000),
            DUE_DATE: Math.floor(new Date(detailDueDate).getTime() / 1000),
            P_PK: detailPriority,
            STEP_PK: detailStep,
            updateCols: [],
        };
        data.TITLE !== actionItemArray[activeRow].TITLE ? data.updateCols.push('TITLE') : undefined;
        data.DESCRIPTION !== actionItemArray[activeRow].DESCRIPTION ? data.updateCols.push('DESCRIPTION') : undefined;
        data.START_DATE !== detailStartDate ? data.updateCols.push('START_DATE') : undefined;
        data.DUE_DATE !== detailDueDate ? data.updateCols.push('DUE_DATE') : undefined;
        data.P_PK !== actionItemArray[activeRow].P_PK ? data.updateCols.push('P_PK') : undefined;
        data.STEP_PK !== actionItemArray[activeRow].STEP_PK ? data.updateCols.push('STEP_PK') : undefined;
        post(url, data)
            .then((res) => {
                alert('수정되었습니다');
                openDetailModal();
                console.log(res);
            })
            .catch((error) => {
                console.log(error);
            });
    };

    const fontColor = {
        style: {
            color: 'black',
        },
    };

    return (
        <div className={styles.detailModalContainer}>
            <div className={styles.detailModal}>
                <div className={classes.exitIcon}>
                    <Typography variant='overline' gutterBottom>
                        Details of Action Item No.{actionItemArray[activeRow].ACTION_PK}
                    </Typography>

                    <IconButton>
                        <HighlightOff className={classes.buttons} onClick={openDetailModal} />
                    </IconButton>
                </div>

                <div className={classes.titleDescDiv}>
                    <TextField
                        className={classes.titleInput}
                        fullWidth
                        variant='outlined'
                        label='Title'
                        placeholder=''
                        onChange={detailTitleChange}
                        value={detailTitle}
                        disabled={disabled}
                        inputProps={fontColor}
                    />

                    <TextField
                        label='Description'
                        multiline
                        rows={4}
                        style={{ marginTop: 10 }}
                        value={detailDesc}
                        onChange={detailDescChange}
                        variant='outlined'
                        fullWidth
                        disabled={disabled}
                        inputProps={fontColor}
                    />

                    <Typography variant='caption' className={classes.assignTypo}>
                        Assigned by{' '}
                        {actionItemArray[activeRow].assigner.FIRST_NAME +
                            ' ' +
                            actionItemArray[activeRow].assigner.LAST_NAME +
                            ' '}
                        to{' '}
                        {actionItemArray[activeRow].owner.FIRST_NAME + ' ' + actionItemArray[activeRow].owner.LAST_NAME}
                    </Typography>
                </div>

                <div className={classes.dateStep}>
                    <div>
                        <Typography variant='overline' display='block' gutterBottom>
                            Start Date
                        </Typography>
                        <TextField
                            id='date'
                            className={classes.date}
                            type='date'
                            style={{ margin: 3 }}
                            placeholder='YYYY-MM-DD'
                            value={detailStartDate}
                            disabled={disabled}
                            inputProps={fontColor}
                            onChange={detailStartDateChange}
                        />
                    </div>

                    <div>
                        <Typography variant='overline' display='block' gutterBottom>
                            Due Date
                        </Typography>
                        <TextField
                            id='date'
                            className={classes.date}
                            type='date'
                            style={{ margin: 3 }}
                            placeholder='YY-MM-DD'
                            value={detailDueDate}
                            disabled={disabled}
                            inputProps={fontColor}
                            onChange={detailDueDateChange}
                        />
                    </div>

                    <FormControl className={classes.formControl} style={{ margin: 3 }} disabled={disabled}>
                        <Typography variant='overline' display='block' gutterBottom>
                            Priority
                        </Typography>
                        <Select value={detailPriority}>
                            <MenuItem
                                value={1}
                                onClick={() => {
                                    setDetailPriority(1);
                                }}
                            >
                                High
                            </MenuItem>
                            <MenuItem
                                value={2}
                                onClick={() => {
                                    setDetailPriority(2);
                                }}
                            >
                                Normal
                            </MenuItem>
                            <MenuItem
                                value={3}
                                onClick={() => {
                                    setDetailPriority(3);
                                }}
                            >
                                Low
                            </MenuItem>
                        </Select>
                    </FormControl>

                    <FormControl className={classes.formControl} style={{ margin: 3 }} disabled={disabled}>
                        <Typography variant='overline' display='block' gutterBottom>
                            Step
                        </Typography>
                        <Select value={detailStep}>
                            <MenuItem
                                value={1}
                                onClick={() => {
                                    setDetailStep(1);
                                }}
                            >
                                Assigned
                            </MenuItem>
                            <MenuItem
                                value={2}
                                onClick={() => {
                                    setDetailStep(2);
                                }}
                            >
                                Ongoing
                            </MenuItem>
                            <MenuItem
                                value={3}
                                onClick={() => {
                                    setDetailStep(3);
                                }}
                            >
                                Done
                            </MenuItem>
                        </Select>
                    </FormControl>
                </div>

                <div className={classes.bottomIcons}>
                    <div style={{ display: 'flex' }}>
                        <Tooltip title='Delete this item' disabled={disabled}>
                            <IconButton>
                                <Delete className={classes.buttons} color='secondary' onClick={deleteActionItem} />
                            </IconButton>
                        </Tooltip>

                        <Tooltip title='Edit this item'>
                            <IconButton>
                                <Edit className={classes.buttons} color='action' onClick={checkProfile} />
                            </IconButton>
                        </Tooltip>
                        {disabled == false ? (
                            <Typography
                                variant='overline'
                                style={{ display: 'flex', alignItems: 'center', color: '#3f51b5', fontSize:'10px' }}
                            >
                                You can edit & delete now.
                            </Typography>
                        ) : (
                            <></>
                        )}
                    </div>
                    <Tooltip title='Save' disabled={disabled}>
                        <IconButton>
                            <Save className={classes.buttons} color='primary' onClick={updateActionItem} />
                        </IconButton>
                    </Tooltip>
                </div>
            </div>
        </div>
    );
};

export default ActionItemDetail;