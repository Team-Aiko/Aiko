import React from 'react';
import styles from '../styles/ActionItems.module.css';
import {useState, useEffect} from 'react';

const ActionItemDetail = ({actionItemArray}) => {

    console.log(actionItemArray)

    return (
        <div className={styles.detailModalContainer}>
            <div className={styles.detailModal}>
                {
                    actionItemArray.map(() => (
                        actionItemArray.DESCRIPTION
                    ))
                }
            </div>
        </div>
    )
}

export default ActionItemDetail
