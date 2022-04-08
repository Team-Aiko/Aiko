import React, { useState } from 'react';

const E_Approval_View = ({ currentData }) => {

    console.log(currentData);

    return (
        <div>
            {currentData.desc}
            {currentData.write}
            {currentData.process}
            {currentData.date}
        </div>
    );
};

export default E_Approval_View;
