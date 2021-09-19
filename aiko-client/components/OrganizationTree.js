import React from 'react';
import PropTypes from 'prop-types';
import SvgIcon from '@material-ui/core/SvgIcon';
import {alpha, makeStyles, withStyles} from '@material-ui/core/styles';
import TreeView from '@material-ui/lab/TreeView';
import TreeItem from '@material-ui/lab/TreeItem';
import Collapse from '@material-ui/core/Collapse';

import {ControlPoint, RemoveCircleOutline} from '@material-ui/icons';

function MinusSquare(props) {
    return (
        <SvgIcon fontSize='inherit' style={{width: 14, height: 14}} {...props}>
            {/* tslint:disable-next-line: max-line-length */}
            <path d='M22.047 22.074v0 0-20.147 0h-20.12v0 20.147 0h20.12zM22.047 24h-20.12q-.803 0-1.365-.562t-.562-1.365v-20.147q0-.776.562-1.351t1.365-.575h20.147q.776 0 1.351.575t.575 1.351v20.147q0 .803-.575 1.365t-1.378.562v0zM17.873 11.023h-11.826q-.375 0-.669.281t-.294.682v0q0 .401.294 .682t.669.281h11.826q.375 0 .669-.281t.294-.682v0q0-.401-.294-.682t-.669-.281z' />
        </SvgIcon>
    );
}

function PlusSquare(props) {
    return (
        <SvgIcon fontSize='inherit' style={{width: 14, height: 14}} {...props}>
            {/* tslint:disable-next-line: max-line-length */}
            <path d='M22.047 22.074v0 0-20.147 0h-20.12v0 20.147 0h20.12zM22.047 24h-20.12q-.803 0-1.365-.562t-.562-1.365v-20.147q0-.776.562-1.351t1.365-.575h20.147q.776 0 1.351.575t.575 1.351v20.147q0 .803-.575 1.365t-1.378.562v0zM17.873 12.977h-4.923v4.896q0 .401-.281.682t-.682.281v0q-.375 0-.669-.281t-.294-.682v-4.896h-4.923q-.401 0-.682-.294t-.281-.669v0q0-.401.281-.682t.682-.281h4.923v-4.896q0-.401.294-.682t.669-.281v0q.401 0 .682.281t.281.682v4.896h4.923q.401 0 .682.281t.281.682v0q0 .375-.281.669t-.682.294z' />
        </SvgIcon>
    );
}

function CloseSquare(props) {
    return (
        <SvgIcon className='close' fontSize='inherit' style={{width: 14, height: 14}} {...props}>
            {/* tslint:disable-next-line: max-line-length */}
            <path d='M17.485 17.512q-.281.281-.682.281t-.696-.268l-4.12-4.147-4.12 4.147q-.294.268-.696.268t-.682-.281-.281-.682.294-.669l4.12-4.147-4.12-4.147q-.294-.268-.294-.669t.281-.682.682-.281.696 .268l4.12 4.147 4.12-4.147q.294-.268.696-.268t.682.281 .281.669-.294.682l-4.12 4.147 4.12 4.147q.294.268 .294.669t-.281.682zM22.047 22.074v0 0-20.147 0h-20.12v0 20.147 0h20.12zM22.047 24h-20.12q-.803 0-1.365-.562t-.562-1.365v-20.147q0-.776.562-1.351t1.365-.575h20.147q.776 0 1.351.575t.575 1.351v20.147q0 .803-.575 1.365t-1.378.562v0z' />
        </SvgIcon>
    );
}

function TransitionComponent(props) {
    const style = {
        from: {opacity: 0, transform: 'translate3d(20px,0,0)'},
        to: {opacity: props.in ? 1 : 0, transform: `translate3d(${props.in ? 0 : 20}px,0,0)`},
    };

    return (
        <div style={style}>
            <Collapse {...props} />
        </div>
    );
}

TransitionComponent.propTypes = {
    /**
     * Show the component; triggers the enter or exit states
     */
    in: PropTypes.bool,
};

const StyledTreeItem = withStyles(theme => ({
    iconContainer: {
        '& .close': {
            opacity: 0.3,
        },
    },
    group: {
        marginLeft: 7,
        paddingLeft: 18,
        borderLeft: `1px dashed ${alpha(theme.palette.text.primary, 0.4)}`,
    },
}))(props => <TreeItem {...props} TransitionComponent={TransitionComponent} />);

const useStyles = makeStyles({
    root: {
        height: 264,
        flexGrow: 1,
        maxWidth: 400,
    },
});

export default function ContainerComp(props) {
    return <OrganizationTree companyPK={props.companyPK} />;
}

function RenderNode(props) {
    if (props.children.length) {
        return (
            <StyledTreeItem nodeId={props.myself.pk.toString()} label={props.myself.department}>
                {props.children.map(curr => {
                    return (
                        <RenderNode
                            key={curr.myself.pk}
                            id={curr.myself.pk}
                            myself={curr.myself}
                            children={curr.children}
                        />
                    );
                })}
            </StyledTreeItem>
        );
    } else {
        return <StyledTreeItem nodeId={props.myself.pk.toString()} label={props.myself.department} />;
    }
}

function OrganizationTree(props) {
    const classes = useStyles();
    const companyPK = props.companyPK;

    return (
        <TreeView
            className={classes.root}
            defaultExpanded={['1']}
            defaultCollapseIcon={<MinusSquare />}
            defaultExpandIcon={<PlusSquare />}
            defaultEndIcon={<CloseSquare />}
        >
            <RenderNode
                myself={{department: '할배', pk: 1}}
                children={[
                    {
                        myself: {department: '아빠', pk: 2},
                        children: [
                            {myself: {department: '자식1', pk: 4}, children: []},
                            {myself: {department: '자식2', pk: 5}, children: []},
                            {myself: {department: '자식3', pk: 6}, children: []},
                        ],
                    },
                    {
                        myself: {department: '작은아빠', pk: 3},
                        children: [
                            {
                                myself: {department: '사촌1', pk: 7},
                                children: [
                                    {
                                        myself: {department: '이건뭐냐', pk: 11},
                                        children: [
                                            {myself: {department: '이건fasd', pk: 15}, children: []},
                                            {myself: {department: '이건', pk: 16}, children: []},
                                            {myself: {department: '이건we', pk: 17}, children: []},
                                        ],
                                    },
                                    {myself: {department: '이건뭐sy', pk: 12}, children: []},
                                    {myself: {department: '이건뭐매', pk: 13}, children: []},
                                ],
                            },
                            {myself: {department: '사촌2', pk: 8}, children: []},
                            {myself: {department: '사촌3', pk: 9}, children: []},
                            {myself: {department: '사촌4', pk: 10}, children: []},
                        ],
                    },
                ]}
            />
        </TreeView>
    );
}
