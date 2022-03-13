import React from 'react';
import Modal from './Modal.js';
import styles from '../styles/Drive.module.css';
import { Button } from '@material-ui/core';
import { get, post } from '../_axios';

const DriveFileDetailModal = ({ open, onClose, selectedFilePk }) => {
    return (
        <Modal title='File Detail' open={open} onClose={onClose}>
            <div className={styles.fileDetailDiv}>
                <div className={styles.filePreview}>Image Preview</div>
            </div>

            <div style={{ textAlign: 'center', margin: 10 }}>
                <a href={`/api/store/download-drive-file?fileId=${selectedFilePk}`}>
                    <Button variant='contained' color='primary' fontSize='small'>
                        Download
                    </Button>
                </a>
            </div>
        </Modal>
    );
};

export default DriveFileDetailModal;
