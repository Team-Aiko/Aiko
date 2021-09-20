import React from 'react';
import OrganizationTree from '../components/OrganizationTree';
import OrgRightBottom from '../components/OrgRightBottom';
import OrgRightTop from '../components/OrgRightTop';
import moduleStyles from '../styles/organize.module.css';

export default function Organize() {
    const companyPK = 1; //sessionStorage.getItem('COMPANY_PK');
    return (
        <div className={moduleStyles.container}>
            <div className={moduleStyles.leftSide}>
                <OrganizationTree companyPK={companyPK} />
            </div>
            <div className={moduleStyles.rightSide}>
                <div className={moduleStyles.rightSideTop}>
                    <OrgRightTop companyPK={companyPK} />
                </div>
                <div className={moduleStyles.rightSideBottom}>
                    <OrgRightBottom companyPK={companyPK} />
                </div>
            </div>
        </div>
    );
}
