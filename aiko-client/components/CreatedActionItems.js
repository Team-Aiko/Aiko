import React from 'react';
import styles from '../styles/MemberInfo.module.css';
import { makeStyles } from '@material-ui/core/styles';
import DeletePostModal from './DeletePostModal.js';

const CreatedActionItems = ({actionItemArray}) => {

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
