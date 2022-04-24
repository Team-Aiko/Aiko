import { makeStyles, TextField, Typography, Input, Divider } from '@material-ui/core';
import React, { useState, useEffect, useCallback } from 'react';
import styles from '../styles/components/Report.module.css';

const useStyles = makeStyles({
    textField: {
        height: '100%',
    },
    input: {
        height: '100%',
    },
    divider: {
        marginTop: 10,
        marginBottom: 10,
    }
});

export default function Report(props) {

    const { mode, containerStyles } = props;
    const classes = useStyles();

    const [inputs, setInputs] = useState({
        writer: '',
        title: '',
        description: '',
    });

    const { writer, title, description } = inputs;

    const onChange = useCallback((e) => {
        const { value, name } = e.target;
        setInputs((prevInput) => ({
            ...prevInput,
            [name]:value
        }))
    }, []);


    return (
        <div className={styles['report']} style={containerStyles}>
            <div className={styles['top-container']}>
                <div className={styles['top-item']}>
                    {mode === 'write' && <Typography>기본 설정</Typography>}
                    <table className={styles['default-settings']}>
                        <tbody>
                            <tr>
                                <td>작성자</td>
                                <td>
                                    <Input name='writer' onChange={onChange} value={writer} disableUnderline/>
                                </td>
                            </tr>
                            <tr>
                                <td>문서종류</td>
                                <td>
                                    {mode === 'write' ? (
                                        <select name='pets' id='pet-select' style={{width:'10vw'}}>
                                            <option value=''>선택해주세요</option>
                                            <option value='dog'>Dog</option>
                                            <option value='cat'>Cat</option>
                                        </select>
                                    ) : (
                                        <></>
                                    )}
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
                <div className={styles['top-item']}>
                    {mode === 'write' && <Typography>결재선</Typography>}
                    <table className={styles.approval}>
                        <tbody>
                            <tr className={styles.name}>
                                <td></td>
                                <td></td>
                                <td></td>
                                <td></td>
                            </tr>
                            <tr className={styles.signature}>
                                <td></td>
                                <td></td>
                                <td></td>
                                <td></td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
            <div className={styles['body-container']}>
                {mode === 'write' && <div><Typography>상세입력</Typography><Divider className={classes.divider} /></div>}
                <div className={styles.title}>
                    {mode === 'write' ? (
                        <>
                            <Typography style={{ flexShrink: 0, marginRight: '60px' }}>제목</Typography>
                            <TextField name='title' fullWidth variant='outlined' size='small' value={title} onChange={onChange}/>
                        </>
                    ) : (
                        <Typography>제목ㄱㄱㄱㄱㄱ</Typography>
                    )}
                </div>
                {mode === 'write' ? (
                    <TextField
                        multiline
                        variant='outlined'
                        style={{ marginTop: '10px', height: '100%' }}
                        inputProps={{
                            style: {
                                flex: 1,
                                height: '100%',
                            },
                        }}
                        InputProps={{ className: classes.input }}
                        classes={{ root: classes.textField }}
                        onChange={onChange}
                        name='description'
                        value={description}
                    />
                ) : (
                    <Typography>내용ㅇㅇㅇㅇㅇ</Typography>
                )}
            </div>
        </div>
    );
}
