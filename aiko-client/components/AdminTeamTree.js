import React, { useState } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import TreeView from '@material-ui/lab/TreeView';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import ChevronRightIcon from '@material-ui/icons/ChevronRight';
import TreeItem from '@material-ui/lab/TreeItem';

const useStyles = makeStyles({
    root: {
        height: '100%',
        flexGrow: 1,
        maxWidth: 400,
    },
});

export default function AdminTeamTree() {
    const classes = useStyles();
    const [teamList, setTeamList] = useState([
        {
            team: 'A',
            children: [
                {
                    team: 'a-1',
                },
                {
                    team: 'a-2',
                    children: [
                        {
                            team: 'a-2-1',
                        },
                        {
                            team: 'a-2-2',
                        },
                        {
                            team: 'a-2-3',
                        },
                    ],
                },
                {
                    team: 'a-3',
                },
            ],
        },
        {
            team: 'B',
        },
        {
            team: 'C',
        },
    ]);

    function treeItemJsx(team) {
        console.log('team : ', team);
        return (
            <TreeItem nodeId={team.team} label={team.team} key={team.team}>
                {team.children &&
                    team.children.map((children) => {
                        return treeItemJsx(children);
                    })}
            </TreeItem>
        );
    }

    return (
        <TreeView
            className={classes.root}
            defaultCollapseIcon={<ExpandMoreIcon />}
            defaultExpandIcon={<ChevronRightIcon />}
        >
            {teamList.map((team) => {
                return treeItemJsx(team);
            })}
        </TreeView>
    );
}
