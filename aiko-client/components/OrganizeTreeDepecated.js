/* eslint-disable import/no-unresolved */
import React, { useEffect, useState } from 'react';
import { Paper } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import { get } from 'axios';
import classnames from 'classnames';
import moduleStyles from '../styles/OrganizeTree.module.css';

// * CSS Styles
const useStyles = makeStyles(theme => ({
    root: {
        display: 'flex',
        alignItems: 'center',
        '& .papers': {
            marginLeft: theme.spacing(1),
            width: theme.spacing(10),
            height: theme.spacing(5),
        },
    },
}));

// * Container Component
export default function ContainerComp(props) {
    return <Organize companyPK={props.companyPK} />;
}

// * Presentational Components
function RenderNode(props) {
    const [doc, setDoc] = useState(undefined);

    // * calc axis function
    const getAxis = (id1, id2) => {
        if (doc !== undefined) {
            const target1 = doc.getElementById(id1.toString());
            const targetTop1 = target1.getBoundingClientRect().top;
            const targetBottom1 = target1.getBoundingClientRect().bottom;
            const targetLeft1 = target1.getBoundingClientRect().left;
            const targetRight1 = target1.getBoundingClientRect().right;

            const target2 = doc.getElementById(id2.toString());
            const targetTop2 = target2.getBoundingClientRect().top;
            const targetBottom2 = target2.getBoundingClientRect().bottom;
            const targetLeft2 = target2.getBoundingClientRect().left;
            const targetRight2 = target2.getBoundingClientRect().right;

            const horizontal1 = (targetRight1 + targetLeft1) / 2;
            const horizontal2 = (targetRight2 + targetLeft2) / 2;
            const height = targetTop2 - targetBottom1;
            console.log('🚀 ~ file: OrganizeTree.js ~ line 48 ~ getAxis ~ height', height);

            return {
                horizontal1,
                horizontal2,
                height,
            };
        }
    };

    useEffect(() => {
        /**
         * 서버사이드 렌더링이라 처음엔 document가 없다.
         * 해결하기 위해선 랜더링이 진행 된후 document가 생기므로 이것을
         * state로 넣어주자...
         */

        setDoc(document);
    }, []);
    return (
        <div className={moduleStyles.bundler}>
            {props.myself ? (
                <React.Fragment>
                    <Paper id={props.myself.pk} className={'papers'} elevation={3}>
                        {props.myself.department}
                    </Paper>
                    {props.children && doc ? (
                        <React.Fragment>
                            <div style={{ width: '100%' }}>
                                <svg width='100%' height='40px'>
                                    {props.children.map(curr => {
                                        let { horizontal1, horizontal2, height } = getAxis(
                                            props.myself.pk,
                                            curr.myself.pk,
                                        );

                                        return (
                                            <path
                                                d={`M${horizontal1} ${0} L${horizontal2} ${height}`}
                                                stroke='black'
                                                stroke-width='2'
                                                fill='transparent'
                                            />
                                        );
                                    })}
                                </svg>
                            </div>
                        </React.Fragment>
                    ) : null}
                    <div className={moduleStyles.children}>
                        {props.children
                            ? props.children.map((curr, idx) => {
                                  return <RenderNode key={idx} myself={curr.myself} children={curr.children} />;
                              })
                            : null}
                    </div>
                </React.Fragment>
            ) : null}
        </div>
    );
}
function Organize(props) {
    const companyId = props.companyPK;
    const classes = useStyles();

    useEffect(() => {
        const url = '/api/company/getOrganizeTree?companyId=' + companyId;
    }, []);

    return (
        <div>
            <div className={classes.root}>
                <RenderNode
                    myself={{ department: '할배', pk: 1 }}
                    children={[
                        {
                            myself: { department: '아빠', pk: 2 },
                            children: [
                                {
                                    myself: { department: '자식1', pk: 4 },
                                },
                                {
                                    myself: { department: '자식2', pk: 5 },
                                },
                                {
                                    myself: { department: '자식3', pk: 6 },
                                },
                            ],
                        },
                        {
                            myself: { department: '작은아빠', pk: 3 },
                            children: [
                                {
                                    myself: { department: '사촌1', pk: 7 },
                                },
                                { myself: { department: '사촌2', pk: 8 } },
                                { myself: { department: '사촌3', pk: 9 } },
                                { myself: { department: '사촌4', pk: 10 } },
                            ],
                        },
                    ]}
                />
                {/* <div className={moduleStyles.bundler}>
                    <Paper className={'papers'} elevation={3}></Paper>
                    <div className={moduleStyles.children}>
                        <div className={moduleStyles.bundler}>
                            <Paper className={'papers'} elevation={3}></Paper>
                            <div className={moduleStyles.children}>
                                <Paper className={'papers'} elevation={3}>
                                    c
                                </Paper>
                                <Paper className={'papers'} elevation={3}>
                                    c
                                </Paper>
                                <Paper className={'papers'} elevation={3}>
                                    c
                                </Paper>
                            </div>
                        </div>
                        <div className={moduleStyles.bundler}>
                            <Paper className={'papers'} elevation={3}></Paper>
                            <div className={moduleStyles.children}>
                                <Paper className={'papers'} elevation={3}>
                                    c
                                </Paper>
                                <Paper className={'papers'} elevation={3}>
                                    c
                                </Paper>
                                <Paper className={'papers'} elevation={3}>
                                    c
                                </Paper>
                            </div>
                        </div>
                    </div>
                </div> */}
            </div>
        </div>
    );
}
