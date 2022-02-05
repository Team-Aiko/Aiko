import React from 'react';
import { useState, useEffect } from 'react';
import styles from '../styles/Drive.module.css';
import { Typography, Divider, ListItem, ListItemIcon, ListItemText, Button } from '@material-ui/core';
import { DeleteForever, Description } from '@material-ui/icons';
import { makeStyles, createTheme, ThemeProvider } from '@material-ui/core/styles';

    const useStyles = makeStyles((theme) => ({
        root: {
            width: '30%',
            height: '28%',
            margin: 10,
            overflow: 'auto',
        },
        pageDesc : {
            display:'flex',
            padding: 15,
            alignItems:'center',
            justifyContent:'space-between'
        }
    }));

    const theme = createTheme();

    theme.typography.h3 = {
    fontSize: '0.8rem',
    marginLeft:15,
    '@media (min-width:600px)': {
        fontSize: '1.2rem',
    },
    [theme.breakpoints.up('md')]: {
        fontSize: '1.7rem',
    },
    };

const DriveBin = () => {

    const classes = useStyles();

    return (
        <div className={styles.fileContainer}>

            <div className={classes.pageDesc}>
            
            <div style={{display:'flex', alignItems:'center'}}>

            <DeleteForever fontSize='large' />

            <ThemeProvider theme={theme}>
                <Typography variant='h3'>Recycle Bin</Typography>
            </ThemeProvider>

            </div>

            <div>
                <Button color='primary' variant='outlined'>Emptying</Button>
            </div>
            </div>

            <Divider/>

            <div className={styles.folderDiv}>
                <div className={classes.root}>
                    <ListItem button dense divider selected>
                        <ListItemIcon>
                            <Description />
                        </ListItemIcon>
                        <ListItemText/>
                    </ListItem>
                </div>
            </div>
        </div>
    )
}

export default DriveBin
