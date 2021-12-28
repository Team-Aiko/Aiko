import React from 'react';
import {useState, useEffect} from 'react';
import {get, post} from '../_axios';
import styles from '../styles/forgot.module.css';
import Link from 'next/link';
import {Button} from '@material-ui/core';

const idpw = () => {


    return (
        <div>
            <div className={styles.container}>
                <div className={styles.login}>
                    <div className={styles.maincontainer}>
                        <div className={styles.buttonContainer}>
                        <Link href='/forgot-id'>
                            <Button className={`${styles.idBox} ${styles.box}`} style={{backgroundColor:'#ABB2B9', color:'white'}}>
                                <span>I lost my ID</span>
                            </Button>
                        </Link>

                        <Link href='/forgot-pw'>
                            <Button className={`${styles.pwBox} ${styles.box}`} style={{backgroundColor:'#ABB2B9', color:'white'}}>
                                <span>I lost my Password</span>
                            </Button>
                        </Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default idpw;
