import styles from '../styles/ActionItems.module.css';
import react, {useState, useEffect} from 'react';
import { makeStyles } from '@material-ui/core/styles';
import {TextField,Typography, FormControl, InputLabel, Select, MenuItem, Button, IconButton
        ,Tooltip} from '@material-ui/core';
import {CancelPresentation, Edit, Delete, Save, HighlightOff} from '@material-ui/icons';



const useStyles = makeStyles((theme) => ({
    formControl : {
        width:100
    },
    exitIcon : {
        display:'flex',
        flexDirection:'row',
        width:'95%',
        justifyContent:'space-between',
        alignItems:'center',
        textAlign:'right',
        margin:'0 auto'
    },
    titleDescDiv : {
        display:'block',
        margin:'0 auto',
        width:'80%',
        marginTop:5,
    },
    titleInput : {
        display:'block',
        fontSize:'10px'
    },
    assignTypo : {
        display:'block',
        textAlign:'right',
        color:'#404040'
    },
    buttons : {
        fontSize: 30
    },
    bottomIcons : {
        display:'flex',
        justifyContent:'space-between',
        width:'80%',
        margin: '0 auto',
        marginTop:30
    }
}));

const ActionItemDetail = ({actionItemArray, activeRow, openDetailModal}) => {

    const classes = useStyles();

    return (
        <div className={styles.detailModalContainer}>
            <div className={styles.detailModal}>

                <div className={classes.exitIcon}>
                <Typography variant="overline" gutterBottom>Details of Action Item No.{actionItemArray[activeRow].ACTION_PK}</Typography>

                <IconButton>
                <HighlightOff className={classes.buttons} onClick={openDetailModal}/>
                </IconButton>
                </div>

                <div className={classes.titleDescDiv}>
                <TextField className={classes.titleInput} fullWidth variant="outlined" label='Title' placeholder=''
                value={actionItemArray[activeRow].TITLE}/>

                <TextField
                label="Description"
                multiline
                rows={4}
                style={{marginTop:10}}
                value={actionItemArray[activeRow].DESCRIPTION}
                variant="outlined"
                fullWidth
                />

                <Typography variant="caption" className={classes.assignTypo}>
                Assigned to {actionItemArray[activeRow].assigner.FIRST_NAME + ' ' + actionItemArray[activeRow].assigner.LAST_NAME + ' '}
                by {actionItemArray[activeRow].owner.FIRST_NAME + ' ' + actionItemArray[activeRow].owner.LAST_NAME }
                </Typography>
                </div>
                

                <div>
                <FormControl className={classes.formControl} style={{margin:3}}>
                    <InputLabel id="demo-simple-select-label">Priority</InputLabel>
                    <Select
                    labelId="demo-simple-select-label"
                    id="demo-simple-select"
                    >
                    <MenuItem value={1}>High</MenuItem>
                    <MenuItem value={2}>Normal</MenuItem>
                    <MenuItem value={3}>Low</MenuItem>
                    </Select>
                </FormControl>

                <FormControl className={classes.formControl} style={{margin:3}}>
                    <InputLabel id="demo-simple-select-label">Step</InputLabel>
                    <Select
                    labelId="demo-simple-select-label"
                    id="demo-simple-select"
                    >
                    <MenuItem value={1}>Assigned</MenuItem>
                    <MenuItem value={2}>Ongoing</MenuItem>
                    <MenuItem value={3}>Done</MenuItem>
                    </Select>
                </FormControl>
                </div>

                <div className={classes.bottomIcons}>

                <div style={{display:'flex'}}>
                <Tooltip title="Delete this item">
                    <IconButton>
                        <Delete className={classes.buttons} color='secondary'/>
                    </IconButton>
                </Tooltip>

                <Tooltip title="Edit this item">
                    <IconButton>
                        <Edit className={classes.buttons} color='action'/>
                    </IconButton>
                </Tooltip>
                </div>

                <Tooltip title="Save">
                    <IconButton>
                        <Save className={classes.buttons} color='primary'/>
                    </IconButton>
                </Tooltip>
                </div>
                

            </div>
        </div>
    )
}

export default ActionItemDetail
