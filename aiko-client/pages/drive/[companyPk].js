import React from 'react';
import styles from '../../styles/Drive.module.css';
import DriveFolder from '../../components/DriveFolder';
import DriveFile from '../../components/DriveFile';
import { useRouter } from 'next/router';

const drive = () => {

    const router = useRouter();
    const { companyPk } = router.query;

    return (
        <div className={styles.mainContainer}>
            <DriveFolder />
            <DriveFile />
        </div>
    )
}

export default drive
