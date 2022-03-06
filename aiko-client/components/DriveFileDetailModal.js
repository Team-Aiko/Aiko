import React from 'react';
import Modal from './Modal.js';
import styles from '../styles/Drive.module.css';
import { Button } from '@material-ui/core';

const DriveFileDetailModal = () => {
    return (
        <Modal
        title='File Detail'
        >
        <div className={styles.fileDetailDiv}>
            <div className={styles.filePreview}>Image Preview</div>
        </div>

        <div style={{ textAlign: 'center', margin: 10 }}>
            <Button variant='contained' color='primary' fontSize='small'>
                Download
            </Button>
        </div>
        </Modal>
    )
}

export default DriveFileDetailModal
