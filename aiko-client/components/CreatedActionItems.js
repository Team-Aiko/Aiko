import React from 'react';
import styles from '../styles/MemberInfo.module.css';
import { makeStyles } from '@material-ui/core/styles';
import DeletePostModal from './DeletePostModal.js';

const CreatedActionItems = () => {

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
        <tr className={styles.styledTable}>
            <td className={styles.styledTd}>Title</td>
            <td className={styles.styledTd}>1</td>
            <td className={styles.styledTd}>Assigned</td>
            <td className={styles.styledTd}>1992-01-20</td>
            <td className={styles.styledTd}>1999-01-20</td>
            <td className={styles.styledTd}>Chiho Lee</td>
            <td className={styles.styledTd}><a className={styles.styledATag}>상세보기</a></td>
            <td className={styles.styledTd}><a className={styles.styledATag}>수정</a></td>
            <td className={styles.styledTd}><a className={styles.styledATag} onClick={openDeleteModal}>삭제</a></td>
        </tr>

        <tr className={styles.styledTable}>
            <td className={styles.styledTd}>Title</td>
            <td className={styles.styledTd}>2</td>
            <td className={styles.styledTd}>Pending</td>
            <td className={styles.styledTd}>1922-01-20</td>
            <td className={styles.styledTd}>2019-01-20</td>
            <td className={styles.styledTd}>Aivyss Kim</td>
            <td className={styles.styledTd}><a className={styles.styledATag}>상세보기</a></td>
            <td className={styles.styledTd}><a className={styles.styledATag}>수정</a></td>
            <td className={styles.styledTd}><a className={styles.styledATag}>삭제</a></td>
        </tr>
        </>
    )
}

export default CreatedActionItems
