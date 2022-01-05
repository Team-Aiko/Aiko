import React from 'react';
import DriveFolder from '../components/DriveFolder';
import DriveFile from '../components/DriveFile'
import styles from '../styles/Drive.module.css'

const drive = () => {
    return (
        <div className={styles.drive}>
            <DriveFolder></DriveFolder>
            <DriveFile></DriveFile>
        </div>
    )
}

export default drive;
