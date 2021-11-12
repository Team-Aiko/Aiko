import React from 'react';
import styles from '../styles/MemberInfo.module.css';
import Button from '@material-ui/core/Button';
import { makeStyles } from '@material-ui/core/styles';
import Avatar from '@material-ui/core/Avatar';
import PersonIcon from '@material-ui/icons/Person';
import ContactPhoneIcon from '@material-ui/icons/ContactPhone';
import ContactMailIcon from '@material-ui/icons/ContactMail';
import AssignmentIndIcon from '@material-ui/icons/AssignmentInd';
import SettingsIcon from '@material-ui/icons/Settings';

const useStyles = makeStyles((theme) => ({
  root: {
    '& > *': {
      margin: theme.spacing(1),
    },
  },
  large: {
    width: theme.spacing(25),
    height: theme.spacing(25),
  },
}));

const MemberInfo = () => {

    const classes = useStyles();

    return (
        <>
        <div className={styles.outerContainer}>

            <div className={styles.upperContainer}>

                <div className={classes.root}>
                <Avatar src="../static/testImages/kotone.PNG" className={classes.large}/>
                </div>

            <div className={styles.profileInfo}>

                <div className={styles.leftDiv}>
                    <div className={styles.icons}>
                        <PersonIcon style={{ fontSize: 40 }}/>
                        <p style={{fontSize:'14px', color:'#7D7D7D', marginLeft:'5px'}}>Kotone Aivyss</p>
                        </div>
                        <div className={styles.icons}>
                        <ContactPhoneIcon style={{ fontSize: 40 }}/>
                        <p style={{fontSize:'14px', color:'#7D7D7D', marginLeft:'5px'}}>Personnel Division</p>
                    </div>
                </div>

                <div className={styles.rightDiv}>
                    <div className={styles.icons}>
                        <ContactPhoneIcon style={{ fontSize: 40 }}/>
                        <p style={{fontSize:'14px', color:'#7D7D7D', marginLeft:'5px'}}>010-1234-5678</p>
                        </div>
                        <div className={styles.icons}>
                        <ContactMailIcon style={{ fontSize: 40 }}/>
                        <p style={{fontSize:'14px', color:'#7D7D7D', marginLeft:'5px'}}>kotone@gmail.com</p>
                        </div>
                    </div>

                    <SettingsIcon style={{fontSize:70, cursor:'pointer'}} onClick={()=> {
                        alert('you may edit your profile')
                    }}/>

                </div>

            </div>

            <div className={styles.lowerContainer}>
                <div className={styles.btnDiv}>
                    <div className={styles.buttons}>
                        <Button variant="contained" style={{backgroundColor: '#2dccff', color:'white'}}>
                        Available
                        </Button>

                        <Button variant="contained" style={{backgroundColor: '#ffb302', color:'white'}}>
                        Busy
                        </Button>

                        <Button variant="contained" style={{backgroundColor: '#9ea7ad', color:'white'}}>
                        Unavailable
                        </Button>
                    </div>
                </div>

                <div className={styles.logDiv}>
                </div>

                <div className={styles.optionDiv}>
                    <Button variant="contained" style={{backgroundColor: '#68A8F4', color:'white'}}>
                    Invite
                    </Button>

                    <Button variant="contained" style={{backgroundColor: '#68A8F4', color:'white'}}>
                    Message
                    </Button>

                    <Button variant="contained" style={{backgroundColor: '#68A8F4', color:'white'}}>
                    Assign
                    </Button>
                </div>
            </div>

        </div>
        </>
    )
};

export default MemberInfo;