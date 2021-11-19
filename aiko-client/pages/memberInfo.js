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
import {useState} from 'react';

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

    const [buttonColor, setButtonColor] = useState('#68A8F4');

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

            <div style={{marginLeft:'7%', marginBottom:'-1.2%'}}>
                <ul style={{listStyle:'none'}}>
                    <li className={styles.tabs} style={{backgroundColor:buttonColor}}>Action Items</li>
                    <li className={styles.tabs}>Meeting Schedules</li>
                </ul>
            </div>

            <div className={styles.actionItemContainer}>
                <div>
                    <Button variant="contained" color="primary" style={{
                    width:'70px', height:'40px', borderRadius:'15px', marginLeft:'5%', marginTop:'2%'}}>
                        ADD
                    </Button>
                </div>

                <div className={styles.tableDiv}>

                    <table className={styles.outerTable}>
                        <tr>
                            <th className={styles.th} style={{width:'15%'}}>Title</th>
                            <th className={styles.th} style={{width:'5%'}}>Priority</th>
                            <th className={styles.th} style={{width:'10%'}}>Status</th>
                            <th className={styles.th} style={{width:'9%'}}>Start Date</th>
                            <th className={styles.th} style={{width:'9%'}}>Due Date</th>
                            <th className={styles.th} style={{width:'9%'}}>Assigner</th>
                            <th className={styles.th} style={{width:'9%'}}>Owner</th>
                            <th className={styles.th}>Description</th>
                            <th className={styles.th} style={{width:'7%'}}>Del.</th>
                        </tr>
                    </table>
                </div>

                <div className={styles.underTableDiv}>
                
                </div>
            </div>

        </div>
        </>
    )
};

export default MemberInfo;