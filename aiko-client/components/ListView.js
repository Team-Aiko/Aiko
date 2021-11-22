import React, { useState, useEffect } from 'react';
import styles from '../styles/components/ListView.module.css';
import {
    IconButton,
    List,
    ListItem,
    ListItemText,
    makeStyles,
    Menu,
    MenuItem,
    ThemeProvider,
    unstable_createMuiStrictModeTheme,
} from '@material-ui/core';
import MoreIcon from '@material-ui/icons/MoreHoriz';

const useStyles = makeStyles({
    'list-view': {
        height: '100%',
    },
});

export default function ListView(props) {
    const { value, id, view, onClick, reRendering } = props;
    const classes = useStyles();
    const theme = unstable_createMuiStrictModeTheme();
    const [openOptions, setOpenOptions] = useState({
        item: {},
        anchorEl: null,
    });

    useEffect(() => {
        setOpenOptions({
            item: {},
            anchorEl: null,
        });
    }, [reRendering]);

    const handleMore = (event, item) => {
        event.preventDefault();

        setOpenOptions({
            item: item,
            anchorEl: event.currentTarget,
        });
    };

    const handleClose = (event) => {
        event.preventDefault();
        setOpenOptions({
            item: {},
            anchorEl: null,
        });
    };

    return (
        <List component='nav' classes={{ root: classes['list-view'] }}>
            {value && value.length > 0
                ? value.map((item) => {
                      return (
                          <ListItem button onClick={item[onClick]} key={item[id]} style={{ paddingRight: 0 }}>
                              <ListItemText primary={item[view]} />
                              {item.options ? (
                                  <IconButton
                                      id={item[id]}
                                      onClick={(e) => {
                                          handleMore(e, item);
                                      }}
                                  >
                                      <MoreIcon />
                                  </IconButton>
                              ) : null}
                              {item.options ? (
                                  <ThemeProvider theme={theme}>
                                      <Menu
                                          anchorEl={openOptions.anchorEl}
                                          open={openOptions.item[id] === item[id]}
                                          onClose={(e) => {
                                              handleClose(e);
                                          }}
                                      >
                                          {item.options.map((option) => {
                                              return (
                                                  <MenuItem key={option.key} onClick={() => option.onClick(item)}>
                                                      {option.view}
                                                  </MenuItem>
                                              );
                                          })}
                                      </Menu>
                                  </ThemeProvider>
                              ) : null}
                          </ListItem>
                      );
                  })
                : null}
        </List>
    );
}
