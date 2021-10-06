import React, { useState } from 'react';
import { makeStyles, TextField, Button } from '@material-ui/core';
import PropTypes from 'prop-types';
import moduleStyles from '../styles/components/OrgRightTop.module.css';

// * CSS Button Styles
const useStyles = makeStyles((theme) => ({
    btnWrapper: {
        margin: theme.spacing(1),
    },
}));
// * Container comp
export default function ContainerComp(props) {
    const { companyPK } = props;
    return <PComp companyPK={companyPK} />;
}

ContainerComp.propTypes = {
    companyPK: PropTypes.number.isRequired,
};

// * Presentational Comp

function PComp(props) {
    const classes = useStyles();
    const [toggleEditor, setToggleEditor] = useState(true);
    const [departmentName, setDepartmentName] = useState('');

    const editDptName = (e) => {
        const text = e.target.value;
        setDepartmentName(text);
    };

    const handleEditor = () => {
        if (!toggleEditor) {
            // TODO: 값 바뀐 것 전송 필요
        }
        setToggleEditor(!toggleEditor);
    };

    return (
        <>
            <TextField
                id='department_plate'
                label='Label'
                style={{ margin: 8 }}
                placeholder='Placeholder'
                fullWidth
                margin='normal'
                InputLabelProps={{
                    shrink: true,
                }}
                inputProps={{ readOnly: toggleEditor }}
                onChange={editDptName}
            />
            <div>
                <Button
                    className={classes.btnWrapper}
                    variant='contained'
                    color={toggleEditor ? 'secondary' : 'primary'}
                    onClick={handleEditor}
                >
                    {toggleEditor ? 'Edit' : 'submit'}
                </Button>

                <Button className={classes.btnWrapper} variant='contained' color='primary'>
                    add-department
                </Button>
            </div>
        </>
    );
}
