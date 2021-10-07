import React, { useState } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import AddIcon from '@material-ui/icons/Add';
import Fab from '@material-ui/core/Fab';
import Tooltip from '@material-ui/core/Tooltip';
import PropTypes from 'prop-types';
import ChatComp from './ChatComp';

// * CSS Styles
const useStyles = makeStyles((theme) => ({
    absolute: {
        position: 'absolute',
        bottom: theme.spacing(2),
        right: theme.spacing(3),
    },
}));

// * Container Component
export default function CComp() {
    return <PComp />;
}

// * Presentational Component
function PComp() {
    const classes = useStyles();
    const [visibility, setVisibility] = useState(false);

    const handleChatBox = () => {
        setVisibility(!visibility);
    };

    return (
        <>
            {visibility ? <ChatComp /> : null}
            <Tooltip title='Add' aria-label='chat' onClick={handleChatBox}>
                <Fab color='secondary' className={classes.absolute}>
                    <AddIcon />
                </Fab>
            </Tooltip>
        </>
    );
}
