import React from 'react';
import styles from '../styles/MemberInfo.module.css';
import { makeStyles } from '@material-ui/core/styles';
import DeletePostModal from './DeletePostModal.js';

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

    const reviseActionItem = () => {
    };

    const removeActionItem = () => {
    };

    const openDeleteModal = () => {
        return (
        <DeletePostModal/>
        )
    };


    return (
        <>
        {
            actionItemArray.map(item => (
                <tr className={styles.styledTable}>
                    <td className={styles.styledTd}>{item.TITLE}</td>
                    <td className={styles.styledTd}>{item.P_PK}</td>
                    <td className={styles.styledTd}>Assigned</td>
                    <td className={styles.styledTd}>{item.START_DATE}</td>
                    <td className={styles.styledTd}>{item.DUE_DATE}</td>
                    <td className={styles.styledTd}>{item.owner.FIRST_NAME + item.owner.LAST_NAME}</td>
                    <td className={styles.styledTd}><a className={styles.styledATag}>상세보기</a></td>
                    <td className={styles.styledTd}><a className={styles.styledATag}>수정</a></td>
                    <td className={styles.styledTd}><a className={styles.styledATag} onClick={openDeleteModal}>삭제</a></td>
                </tr>
            ))
        }
        </>
    )
}

export default CreatedActionItems
