import React from 'react';
import OrganizationTree from '../components/OrganizationTree';
import moduleStyles from '../styles/organize.module.css';

export default function Organize() {
    const companyPK = 1; //sessionStorage.getItem('COMPANY_PK');
    return (
        <div className={moduleStyles.container}>
            <div className={moduleStyles.leftSide}>
                <OrganizationTree companyPK={companyPK} />
            </div>
            <div className={moduleStyles.rightSide}>
                <div className={moduleStyles.rightSideTop}></div>
                <div className={moduleStyles.rightSideBottom}></div>
            </div>
        </div>
    );
}
