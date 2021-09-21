import React, { useState } from 'react';
import moduleStyles from '../styles/components/OrgRightTop.module.css';
import { makeStyles } from '@material-ui/core';
import { TextField, Button } from '@material-ui/core';

// * CSS Button Styles
const useStyles = makeStyles(theme => ({
    btnWrapper: {
        margin: theme.spacing(1),
    },
}));
// * Container comp
export default function ContainerComp(props) {
    return <PComp companyPK={props.companyPK} />;
}

// * Presentational Comp

function PComp(props) {
    const companyPk = props.companyPK;
    const classes = useStyles();
    const [toggleEditor, setToggleEditor] = useState(true);
    const [departmentName, setDepartmentName] = useState('');

    const editDptName = e => {
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
        <React.Fragment>
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
        </React.Fragment>
    );
}
