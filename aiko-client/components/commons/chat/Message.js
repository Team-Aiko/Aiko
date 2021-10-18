import React from 'react';
import PropTypes from 'prop-types';
import { createStyles, makeStyles } from '@material-ui/core/styles';
import Avatar from '@material-ui/core/Avatar';
import { deepOrange } from '@material-ui/core/colors';

const useStyles = makeStyles((theme) =>
    createStyles({
        messageRow: {
            display: 'flex',
        },
        messageRowRight: {
            display: 'flex',
            justifyContent: 'flex-end',
        },
        messageBlue: {
            position: 'relative',
            marginLeft: '20px',
            marginBottom: '10px',
            padding: '10px',
            backgroundColor: '#A8DDFD',
            width: '60%',
            //height: "50px",
            textAlign: 'left',
            font: "400 .9em 'Open Sans', sans-serif",
            border: '1px solid #97C6E3',
            borderRadius: '10px',
            '&:after': {
                content: "''",
                position: 'absolute',
                width: '0',
                height: '0',
                borderTop: '15px solid #A8DDFD',
                borderLeft: '15px solid transparent',
                borderRight: '15px solid transparent',
                top: '0',
                left: '-15px',
            },
            '&:before': {
                content: "''",
                position: 'absolute',
                width: '0',
                height: '0',
                borderTop: '17px solid #97C6E3',
                borderLeft: '16px solid transparent',
                borderRight: '16px solid transparent',
                top: '-1px',
                left: '-17px',
            },
        },
        messageOrange: {
            position: 'relative',
            marginRight: '20px',
            marginBottom: '10px',
            padding: '10px',
            backgroundColor: '#f8e896',
            width: '60%',
            //height: "50px",
            textAlign: 'left',
            font: "400 .9em 'Open Sans', sans-serif",
            border: '1px solid #dfd087',
            borderRadius: '10px',
            '&:after': {
                content: "''",
                position: 'absolute',
                width: '0',
                height: '0',
                borderTop: '15px solid #f8e896',
                borderLeft: '15px solid transparent',
                borderRight: '15px solid transparent',
                top: '0',
                right: '-15px',
            },
            '&:before': {
                content: "''",
                position: 'absolute',
                width: '0',
                height: '0',
                borderTop: '17px solid #dfd087',
                borderLeft: '16px solid transparent',
                borderRight: '16px solid transparent',
                top: '-1px',
                right: '-17px',
            },
        },

        messageContent: {
            padding: 0,
            margin: 0,
        },
        messageTimeStampRight: {
            position: 'absolute',
            fontSize: '.85em',
            fontWeight: '300',
            marginTop: '10px',
            bottom: '-3px',
            right: '5px',
        },

        orange: {
            color: theme.palette.getContrastText(deepOrange[500]),
            backgroundColor: deepOrange[500],
            width: theme.spacing(4),
            height: theme.spacing(4),
        },
        avatarNothing: {
            color: 'transparent',
            backgroundColor: 'transparent',
            width: theme.spacing(4),
            height: theme.spacing(4),
        },
        displayName: {
            marginLeft: '20px',
        },
    }),
);

export const MessageLeft = (props) => {
    let { message, timestamp, photoURL, displayName } = props;
    message = message || 'no message';
    timestamp = timestamp || '';
    photoURL = photoURL || '../../public/images/kotone.PNG';
    displayName = displayName || '名無しさん';
    const classes = useStyles();

    return (
        <>
            <div className={classes.messageRow}>
                <Avatar alt={displayName} className={classes.orange} src={photoURL} />
                <div>
                    <div className={classes.displayName}>{displayName}</div>
                    <div className={classes.messageBlue}>
                        <div>
                            <p className={classes.messageContent}>{message}</p>
                        </div>
                        <div className={classes.messageTimeStampRight}>{timestamp}</div>
                    </div>
                </div>
            </div>
        </>
    );
};
MessageLeft.propTypes = {
    message: PropTypes.string.isRequired,
    timestamp: PropTypes.string.isRequired,
    photoURL: PropTypes.string.isRequired,
    displayName: PropTypes.string.isRequired,
};

export const MessageRight = (props) => {
    let { message, timestamp } = props;
    const classes = useStyles();
    message = message || 'no message';
    timestamp = timestamp || '';

    return (
        <div className={classes.messageRowRight}>
            <div className={classes.messageOrange}>
                <p className={classes.messageContent}>{message}</p>
                <div className={classes.messageTimeStampRight}>{timestamp}</div>
            </div>
        </div>
    );
};
MessageRight.propTypes = {
    message: PropTypes.string.isRequired,
    timestamp: PropTypes.string.isRequired,
};
