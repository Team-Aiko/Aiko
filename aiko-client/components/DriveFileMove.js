import React, { useState, useEffect } from 'react';
import Modal from './Modal.js';
import styles from '../styles/Drive.module.css';

const DriveFileMove = ({openMoveModal, closeMoveModal}) => {


    return (
        <Modal title='Move Folders & Files' open={openMoveModal} onClose={closeMoveModal}
        style={{width:'100%', height:'100%'}}>
            <div className={styles.moveFileModalContainer}>
               
            </div>
        </Modal>
    )
}

export default DriveFileMove
