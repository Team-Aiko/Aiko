import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import {Modal, TextField, Button} from '@material-ui/core';
import SaveIcon from '@material-ui/icons/Save';
import {useState, useEffect} from 'react';
import {get, post} from '../_axios'

const useStyles = makeStyles((theme) => ({
  root: {
    height: 530,
    flexGrow: 1,
    minWidth: 300,
    transform: 'translateZ(0)',
    // The position fixed scoping doesn't work in IE 11.
    // Disable this demo to preserve the others.
    '@media all and (-ms-high-contrast: none)': {
      display: 'none',
    },
  },
  modal: {
    display: 'flex',
    padding: theme.spacing(1),
    alignItems: 'center',
    justifyContent: 'center',
  },
  paper: {
    width: 600,
    height: 500,
    backgroundColor: theme.palette.background.paper,
    border: '2px solid #000',
    boxShadow: theme.shadows[5],
    padding: theme.spacing(2, 4, 3),
  },
  buttonDiv : {
      display:'flex',
      justifyContent:'right',
      marginTop: 10
  }
}));


const AddActionItem = ({setAddActionItemModal}) => {

    const classes = useStyles();
    const rootRef = React.useRef(null);

    const [title, setTitle] = useState('');
    const [priority, setPriority] = useState(1);
    const [status, setStatus] = useState('');
    const [startDate, setStartDate] = useState('');
    const [dueDate, setDueDate] = useState('');
    const [assigner, setAssigner] = useState('');
    const [owner, setOwner] = useState('');
    const [description, setDescription] = useState('');
    const [step, setStep] = useState(1);

    //할당자 PK 값
    const [ownerPK, setOwnerPK] = useState(undefined);

    const getOwnerPK = async () => {
        const url = '/api/account/decoding-token';
        const res = await get(url)
        .then((res) => {
            console.log(res);
            setOwnerPK(res.USER_PK)
        })
    };

    useEffect(() => {
        getOwnerPK()
    },[]);

    const titleChange = (e) => {
        setTitle(e.target.value);
        console.log(title);
    };

    const priorityChange = (e) => {
        if (e.target.value == null) {
            setPriority(1);
        } else {
            setPriority(e.target.value);
        }
    };

    const statusChange = (e) => {
        if (e.target.value == null) {
            setStatus('Assigned');
        } else {
            setStatus(e.target.value);
        }
    };

    const startDateChange = (e) => {
        setStartDate(Math.floor(new Date().getTime(e.target.value) / 1000));
        console.log(startDate);
    };

    const dueDateChange = (e) => {
        setDueDate(Math.floor(new Date().getTime(e.target.value) / 1000));
        console.log(dueDate);
    };

    const assignerChange = (e) => {
        setAssigner(e.target.value);
    };

    const ownerChange = (e) => {
        setOwner(e.target.value);
    };

    const descriptionChange = (e) => {
        setDescription(e.target.value);
        console.log(description);
    };

    const stepChange = (e) => {
        setStep(e.target.value);
        console.log(step);
    };

    //액션 아이템 생성 API
    const createActionItems = () => {
        const url = '/api/work/create-action-item';
        const data = {
            OWNER_PK: ownerPK,
            TITLE: title,
            DESCRIPTION: description,
            DUE_DATE: dueDate,
            START_DATE: startDate,
            P_PK: priority,
            STEP_PK: step,
        };
        post(url, data)
            .then((res) => {
                console.log(res);
                setAddActionItemModal(false);
            })
            .catch((error) => {
                console.log(error);
            });
    };
    
    return (
        <div className={classes.root} ref={rootRef}>
            <Modal
                disablePortal
                disableEnforceFocus
                disableAutoFocus
                open
                aria-labelledby="server-modal-title"
                aria-describedby="server-modal-description"
                className={classes.modal}
                container={() => rootRef.current}
            >
                <div className={classes.paper}>
                <h2 id="server-modal-title">Add Action Item</h2>

                <div>
                <TextField id="standard-basic" label="Title" style={{margin:3}} onChange={titleChange}/>
                <TextField id="standard-basic" label="Priority" placeholder='Number' style={{margin:3, width:100}} onChange={priorityChange}/>
                <TextField id="standard-basic" label="Status" placeholder='Default: Assigned' style={{margin:3, width:150}} onChange={statusChange}/>
                </div>

                <div style={{marginTop:10}}>
                <TextField id="standard-basic" label="Start Date" style={{margin:3}} onChange={startDateChange}/>
                <TextField id="standard-basic" label="Due Date" style={{margin:3}} onChange={dueDateChange}/>
                </div>

                <div style={{marginTop:10}}>
                <TextField id="standard-basic" label="Owner" style={{margin:3}} onChange={ownerChange}/>
                <TextField id="standard-basic" label="Assigner" style={{margin:3}} onChange={assignerChange}/>
                </div>

                <div style={{marginTop:10}}>
                <TextField
                id="standard-multiline-static"
                label="Description"
                multiline
                rows={7}
                style={{width:300}}
                onChange={descriptionChange}
                />
                </div>

                <div className={classes.buttonDiv}>
                <Button
                variant="contained"
                color="primary"
                size="small"
                className={classes.button}
                startIcon={<SaveIcon />}
                onClick={createActionItems}
                >
                Save
                </Button>
                </div>

                </div>
            </Modal>
        </div>
    )
}

export default AddActionItem
