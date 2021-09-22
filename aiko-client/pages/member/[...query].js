import React from 'react';

// * Container Component
export default function CComp() {
    return <PComp />;
}

// * Presentational Component
function PComp(props) {
    return <div>sample</div>;
}

// * Data Fetch
export async function getStaticProps(context) {
    const { userPK, companyPK } = context.param;
}
