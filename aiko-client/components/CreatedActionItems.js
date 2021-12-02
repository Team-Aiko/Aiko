import React from 'react';
import styles from '../styles/MemberInfo.module.css';
import { makeStyles } from '@material-ui/core/styles';
import DeletePostModal from './DeletePostModal.js';
import {Select, MenuItem} from '@material-ui/core';
import {useState, useEffect} from 'react';
import {Button, TextField} from '@material-ui/core';
import ExitToAppIcon from '@material-ui/icons/ExitToApp';


const CreatedActionItems = ({actionItemArray}) => {

    function getUnixTime(t) {
        const date = new Date(t * 1000);
        const year = date.getFullYear();
        const month = "0" + (date.getMonth() + 1);
        const day = "0" + date.getDate();
        const hour = "0" + date.getHours();
        const minute = "0" + date.getMinutes();
        const second = "0" + date.getSeconds();
        return year + "-" + month.substr(-2) + "-" + day.substr(-2) + " " + hour.substr(-2) + ":" + second.substr(-2);
    }

    const [age,setAge] = React.useState([]);

    const handleChange = (event,index) => {
        setAge([...age.map((data,i) => i === index ? event.target.value:data )]);
    };

    const [modalVal, setModalVal] = useState(false);

    const removeModal = () => {
        setModalVal(false)
    };

    if (modalVal == true) {
        return  <div className={styles.detailModal}>
                    <div className={styles.innerDetailModal}>
                        <div className={styles.modalTopBar}>
                            <div className={styles.modalTopBarContentsDiv}>
                                <div className={styles.modalTopBarDesc}>Action Item Description</div>
                                <Button
                                    variant='contained'
                                    color='primary'
                                    endIcon={<ExitToAppIcon />}
                                    onClick={removeModal}
                                >
                                    EXIT
                                </Button>
                            </div>

                            {
                                actionItemArray.map((item, i) => (
                                    <div style={{marginTop:'10%'}}>
                                        <div className={styles.modalInputDiv}>
                                            <TextField label='Owner' value={item.owner.FIRST_NAME + item.owner.LAST_NAME} style={{ margin: 8 }} />
                                            <TextField label='Assigner'  value={item.assigner.FIRST_NAME + item.owner.LAST_NAME} style={{ margin: 8 }} />
                                        </div>

                                        <div className={styles.modalInputDiv}>
                                            <TextField
                                                label='Description'
                                                multiline
                                                rows={6}
                                                value={item.DESCRIPTION}
                                                style={{ marginTop: 50, width: 400 }}
                                            />
                                        </div>
                                    </div>
                                ))
                            }
                        </div>

                        <div></div>

                        <div></div>
                    </div>
                </div>
    }

    const getModal = () => {
        setModalVal(true);
        console.log(actionItemArray)
    }


    return (
        <>
            {
                actionItemArray.map((item, i) => (
                    <tr className={styles.styledTable}>
                        <td className={styles.styledTd}>{item.TITLE}</td>
                        <td className={styles.styledTd}>{item.P_PK}</td>
                        <td className={styles.styledTd}>
                        <Select
                        value={age[i]} // to get the current age value
                        onChange={(e) => handleChange(e,i)}
                        >
                        <MenuItem value='Assigned'>Assigned</MenuItem>
                        <MenuItem value='Processing'>Processing</MenuItem>
                        <MenuItem value='Done'>Done</MenuItem>
                        </Select>
                        </td>
                        <td className={styles.styledTd}>{getUnixTime(item.START_DATE)}</td>
                        <td className={styles.styledTd}>{getUnixTime(item.DUE_DATE)}</td>
                        <td className={styles.styledTd}>{item.owner.FIRST_NAME + item.owner.LAST_NAME}</td>
                        <td className={styles.styledTd}><a className={styles.styledATag} onClick={getModal}>상세보기</a></td>
                        <td className={styles.styledTd}><a className={styles.styledATag}>수정</a></td>
                        <td className={styles.styledTd}><a className={styles.styledATag}>삭제</a></td>
                    </tr>
                ))
            }
        </>
    )
}

export default CreatedActionItems
