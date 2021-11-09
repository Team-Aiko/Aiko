import React from 'react';
import { List, ListItem, ListItemText, makeStyles } from '@material-ui/core';
import styles from '../styles/components/ListView.module.css';

const useStyles = makeStyles({
    'list-view': {
        height: '100%',
    },
});

export default function ListView(props) {
    const { value, id, view, onClick } = props;
    const classes = useStyles();

    return (
        <List component='nav' classes={{ root: classes['list-view'] }}>
            {value.map((item) => {
                return (
                    <ListItem button onClick={item[onClick]} key={item[id]}>
                        <ListItemText primary={item[view]} />
                    </ListItem>
                );
            })}
        </List>
    );
}
