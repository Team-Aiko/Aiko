import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import TreeView from '@material-ui/lab/TreeView';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import ChevronRightIcon from '@material-ui/icons/ChevronRight';
import TreeItem from '@material-ui/lab/TreeItem';
import styles from '../styles/Drive.module.css';
import {Tooltip, IconButton} from '@material-ui/core'
import {CreateNewFolder, Folder, FolderOpen} from '@material-ui/icons'
import {useState, useEffect} from 'react';
import {get, post} from '../_axios';

const useStyles = makeStyles({
    root: {
        height: 240,
        flexGrow: 1,
        maxWidth: 400,
    },
    driveFolder: {
        width:'20%',
        height:'100%',
        border: '1px solid black',
    }
});

export default function DriveFolder() {

    const [folderName, setFolderName] = useState('');
    const [readyToMakeFolder, setReadyToMakeFolder] = useState(false)
    const [parentFolderPk, setParentFolderPk] = useState(undefined);


    const createFolder = () => {
        const url = '/api/store/drive/create-folder';
        const data = {
            folderName : '히히히',
            parentPK : parentFolderPk
        };
        post(url, data)
        .then((res) => {
            console.log(res);
        })
        .catch((error) => {
            console.log(error);
        })
    };

    const classes = useStyles();

    return (
        <div className={classes.driveFolder}>

            <Tooltip title='Create a New Folder'>
                <IconButton onClick={() => {setReadyToMakeFolder(true)}}>
                    <CreateNewFolder color='primary' />
                </IconButton>
            </Tooltip>

            {
                readyToMakeFolder == true
                ? <div> <input/> <button onClick={createFolder}>추가</button> </div>
                : <></>
            }

            <TreeView
                className={classes.root}
                defaultCollapseIcon={<Folder />}
                defaultExpandIcon={<FolderOpen />}
            >
                <TreeItem nodeId='1' label='Applications'>
                    <TreeItem nodeId='2' label='Calendar' />
                    <TreeItem nodeId='3' label='Chrome' />
                    <TreeItem nodeId='4' label='Webstorm' />
                </TreeItem>
                <TreeItem nodeId='5' label='Documents'>
                    <TreeItem nodeId='10' label='OSS' />
                    <TreeItem nodeId='6' label='Material-UI'>
                        <TreeItem nodeId='7' label='src'>
                            <TreeItem nodeId='8' label='index.js' />
                            <TreeItem nodeId='9' label='tree-view.js' />
                        </TreeItem>
                    </TreeItem>
                </TreeItem>
            </TreeView>
        </div>
    );
}
