import React from 'react';
import styles from '../styles/DeletePostModal.module.css';
import { makeStyles } from '@material-ui/core/styles';
import {Tooltip, IconButton, Typography, Button} from '@material-ui/core';
import {Delete, Close} from '@material-ui/icons'

const useStyles = makeStyles((theme) => ({
  root: {
    '& > *': {
      margin: theme.spacing(1),
    },
  },
  features : {
    display:'flex',
    alignItems:'center',
    flexDirection:'column',
    width:'90%',
    height:'50%',
    margin:'0 auto',
    marginTop:'30%'
  },
  button : {
    display:'flex',
    width: '70%',
    height:'20%',
    justifyContent:'space-between',
    marginTop:'30%'
  }
}));

const DeletePostModal = ({deleteArticle, setOpenModal}) => {

    const classes = useStyles();

    return (
        <div className={styles.modalContainer}>
            <div className={styles.modal}>
              <div style={{float:'right'}}>
              <Tooltip title="Exit">
                <IconButton aria-label="delete" onClick={() => setOpenModal(false)}>
                  <Close />
                </IconButton>
              </Tooltip>
              </div>

              <div className={classes.features}>
                <div>
                  <Typography variant="h5" gutterBottom style={{color:'#F92F28'}}>Are you sure to delete the post?</Typography>
                </div>

                <div className={classes.button}>
                  <Button onClick={() => setOpenModal(false)}>No</Button>
                  <Button onClick={deleteArticle}>Yes</Button>
                </div>
              </div>
            </div>
        </div>
    )
}
export default DeletePostModal;
