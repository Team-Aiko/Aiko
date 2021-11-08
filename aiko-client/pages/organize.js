import React, { useState, useEffect } from 'react';
import OrganizeDepartmentTree from '../components/OrganizeDepartmentTree';
import OrganizeMemberList from '../components/OrganizeMemberList';
import styles from '../styles/organize.module.css';
import { get, post } from 'axios';
import router from 'next/router';

export default function organize() {
    const [department, setDepartment] = useState({});
    const [admin, setAdmin] = useState(false);

    useEffect(() => {
        const url = 'api/company/check-admin';
        get(url).then((response) => {
            setAdmin(response.data.result);
        });
    }, []);

    return (
        <div className={styles['admin-container']}>
            <OrganizeDepartmentTree
                setDepartment={(value) => {
                    setDepartment(value);
                }}
                admin={admin}
            />
            <OrganizeMemberList department={department} admin={admin} />
        </div>
    );
}
