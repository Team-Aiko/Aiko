/* eslint-disable react/jsx-boolean-value */
/* eslint-disable max-len */
import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { createStyles, makeStyles, Theme } from '@material-ui/core/styles';
import { Paper } from '@material-ui/core';
import { MessageLeft, MessageRight } from './Message';
import TextInput from './TextInput';

export default function CComp() {
    return <PComp />;
}

const useStyles = makeStyles((theme) =>
    createStyles({
        paper: {
            width: '80vw',
            height: '80vh',
            maxWidth: '500px',
            maxHeight: '700px',
            display: 'flex',
            alignItems: 'center',
            flexDirection: 'column',
            position: 'relative',
        },
        paper2: {
            width: '80vw',
            maxWidth: '500px',
            display: 'flex',
            alignItems: 'center',
            flexDirection: 'column',
            position: 'relative',
        },
        container: {
            width: '100vw',
            height: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
        },
        messagesBody: {
            width: 'calc( 100% - 20px )',
            margin: 10,
            overflowY: 'scroll',
            height: 'calc( 100% - 80px )',
        },
    }),
);

function PComp(props) {
    const classes = useStyles();

    return (
        <>
            <div className={classes.container}>
                <Paper className={classes.paper} zDepth={2}>
                    <Paper id='style-1' className={classes.messagesBody}>
                        <MessageLeft
                            message='あめんぼあかいなあいうえお'
                            timestamp='MM/DD 00:00'
                            photoURL='https://lh3.googleusercontent.com/a-/AOh14Gi4vkKYlfrbJ0QLJTg_DLjcYyyK7fYoWRpz2r4s=s96-c'
                            displayName=''
                            avatarDisp={true}
                        />
                        <MessageLeft
                            message='xxxxxhttps://yahoo.co.jp xxxxxxxxxあめんぼあかいなあいうえおあいうえおかきくけこさぼあかいなあいうえおあいうえおかきくけこさぼあかいなあいうえおあいうえおかきくけこさいすせそ'
                            timestamp='MM/DD 00:00'
                            photoURL=''
                            displayName='テスト'
                            avatarDisp={false}
                        />
                        <MessageRight
                            message='messageRあめんぼあかいなあいうえおあめんぼあかいなあいうえおあめんぼあかいなあいうえお'
                            timestamp='MM/DD 00:00'
                            photoURL='https://lh3.googleusercontent.com/a-/AOh14Gi4vkKYlfrbJ0QLJTg_DLjcYyyK7fYoWRpz2r4s=s96-c'
                            displayName='まさりぶ'
                            avatarDisp={true}
                        />
                        <MessageRight
                            message='messageRあめんぼあかいなあいうえおあめんぼあかいなあいうえお'
                            timestamp='MM/DD 00:00'
                            photoURL='https://lh3.googleusercontent.com/a-/AOh14Gi4vkKYlfrbJ0QLJTg_DLjcYyyK7fYoWRpz2r4s=s96-c'
                            displayName='まさりぶ'
                            avatarDisp={false}
                        />
                    </Paper>
                    <TextInput />
                </Paper>
            </div>
        </>
    );
}
