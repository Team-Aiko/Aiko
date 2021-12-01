import React from 'react';
import styles from '../styles/DeletePostModal.module.css';
import Image from 'next/image';
import { makeStyles } from '@material-ui/core/styles';
import Button from '@material-ui/core/Button';

const useStyles = makeStyles((theme) => ({
  root: {
    '& > *': {
      margin: theme.spacing(1),
    },
  },
}));

const DeletePostModal = () => {

    const classes = useStyles();

    return (
        <div className={styles.window}>
            <div className={styles.outerContainer}>

                <div className={styles.upperContainer}>
                    <div className={styles.warning}>
                        <Image src="/../public/images/question.png" width={200} height={200}/>
                    </div>

                    <div>
                        <h1 style={{color:'white', width:'100%', textAlign:'center', fontFamily:'SeoulHangang CBL'}}>Are you sure you delete the post?</h1>
                    </div>
                </div>

                <div className={styles.lowerContainer}>
                    <Button className={styles.yesBtn} variant="contained" style={{backgroundColor:"#d93d3d", color:'white', width:'30%', borderRadius:'15px'}}>
                    <span style={{fontWeight:'bold'}}>YES</span>
                    </Button>
                    <Button className={styles.noBtn} variant="contained" style={{backgroundColor:"#6c6969", color:'white', width:'30%', borderRadius:'15px'}}>
                    <span style={{fontWeight:'bold'}}>NO</span>
                    </Button>
                </div>

            </div>
        </div>
    )
}
export default DeletePostModal;
