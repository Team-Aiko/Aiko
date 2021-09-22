import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { SvgIcon, Collapse } from '@material-ui/core';
import { alpha, makeStyles, withStyles } from '@material-ui/core/styles';
import { TreeView, TreeItem } from '@material-ui/lab';
import { ControlPoint, RemoveCircleOutline } from '@material-ui/icons';
import { get } from 'axios';

// * Redux import
import { useDispatch, useSelector } from 'react-redux';
import { setDeptMember, setDeptPK } from '../_redux/businessReducer';

// * CSS Styles
const useStyles = makeStyles({
    root: {
        height: 264,
        flexGrow: 1,
        maxWidth: 400,
    },
});

// * Container Component
export default function ContainerComp() {
    const userInfoState = useSelector((state) => state.accountReducer);
    const dispatch = useDispatch();
    const [organizeTree, setOrganizeTree] = useState([]);

    const handleDeptPK = (deptPK) => {
        dispatch(setDeptPK(deptPK));
    };

    const handleDeptMems = (memsArr) => {
        dispatch(setDeptMember(memsArr));
    };

    useEffect(() => {
        (async () => {
            if (userInfoState.COMPANY_PK) {
                const url = '/api/company/getOrganizationTree?id=' + userInfoState.COMPANY_PK;
                const { data } = await get(url);
                setOrganizeTree(data);
            }
        })();
    }, [userInfoState]);

    return (
        <OrganizationTree
            handleDeptMems={handleDeptMems}
            handleDeptPK={handleDeptPK}
            userInfoState={userInfoState}
            organizeTree={organizeTree}
        />
    );
}

// * data fetching -> 아 이해함 이건 최초 빌드 될 때네 deprecated
// export async function getStaticProps(context) {
//     const userInfoState = useSelector(state => state.accountReducer);
//     const url = '/api/company/getOrganizationTree?id=' + userInfoState.COMPANY_PK;
//     const { data } = await get(url);

//     return {
//         props: {
//             organizeTree: data,
//         },
//     };
// }

// * Presentational Component
function OrganizationTree(props) {
    const classes = useStyles();
    const { userInfoState, organizeTree } = props;
    return (
        <TreeView
            className={classes.root}
            defaultExpanded={['1']}
            defaultCollapseIcon={<MinusSquare />}
            defaultExpandIcon={<PlusSquare />}
            defaultEndIcon={<CloseSquare />}
        >
            {props.organizeTree.length ? (
                <React.Fragment>
                    <RenderNode
                        myself={{
                            DEPARTMENT_PK: organizeTree[0].DEPARTMENT_PK,
                            DEPARTMENT_NAME: organizeTree[0].DEPARTMENT_NAME,
                            COMPANY_PK: organizeTree[0].COMPANY_PK,
                            PARENT_PK: organizeTree[0].PARENT_PK,
                            DEPTH: organizeTree[0].DEPTH,
                        }}
                        children={organizeTree[0].CHILDREN}
                        handleDeptMems={props.handleDeptMems}
                        handleDeptPK={props.handleDeptPK}
                    />
                </React.Fragment>
            ) : (
                <React.Fragment />
            )}
        </TreeView>
    );
}

function RenderNode(props) {
    if (props.children.length) {
        return (
            <StyledTreeItem
                nodeId={props.myself.DEPARTMENT_PK.toString()}
                label={props.myself.DEPARTMENT_NAME}
                handleDeptPK={props.handleDeptPK}
                handleDeptMems={props.handleDeptMems}
            >
                {props.children.map((curr) => {
                    return (
                        <RenderNode
                            key={curr.DEPARTMENT_PK}
                            id={curr.DEPARTMENT_PK}
                            myself={{
                                DEPARTMENT_PK: curr.DEPARTMENT_PK,
                                DEPARTMENT_NAME: curr.DEPARTMENT_NAME,
                                COMPANY_PK: curr.COMPANY_PK,
                                PARENT_PK: curr.PARENT_PK,
                                DEPTH: curr.DEPTH,
                            }}
                            children={curr.CHILDREN}
                            handleDeptMems={props.handleDeptMems}
                            handleDeptPK={props.handleDeptPK}
                        />
                    );
                })}
            </StyledTreeItem>
        );
    } else {
        return (
            <StyledTreeItem
                nodeId={props.myself.DEPARTMENT_PK.toString()}
                label={props.myself.DEPARTMENT_NAME}
                handleDeptMems={props.handleDeptMems}
                handleDeptPK={props.handleDeptPK}
            />
        );
    }
} // Tree bootstrap component

function MinusSquare(props) {
    return (
        <SvgIcon fontSize='inherit' style={{ width: 14, height: 14 }} {...props}>
            {/* tslint:disable-next-line: max-line-length */}
            <path d='M22.047 22.074v0 0-20.147 0h-20.12v0 20.147 0h20.12zM22.047 24h-20.12q-.803 0-1.365-.562t-.562-1.365v-20.147q0-.776.562-1.351t1.365-.575h20.147q.776 0 1.351.575t.575 1.351v20.147q0 .803-.575 1.365t-1.378.562v0zM17.873 11.023h-11.826q-.375 0-.669.281t-.294.682v0q0 .401.294 .682t.669.281h11.826q.375 0 .669-.281t.294-.682v0q0-.401-.294-.682t-.669-.281z' />
        </SvgIcon>
    );
}

function PlusSquare(props) {
    return (
        <SvgIcon fontSize='inherit' style={{ width: 14, height: 14 }} {...props}>
            {/* tslint:disable-next-line: max-line-length */}
            <path d='M22.047 22.074v0 0-20.147 0h-20.12v0 20.147 0h20.12zM22.047 24h-20.12q-.803 0-1.365-.562t-.562-1.365v-20.147q0-.776.562-1.351t1.365-.575h20.147q.776 0 1.351.575t.575 1.351v20.147q0 .803-.575 1.365t-1.378.562v0zM17.873 12.977h-4.923v4.896q0 .401-.281.682t-.682.281v0q-.375 0-.669-.281t-.294-.682v-4.896h-4.923q-.401 0-.682-.294t-.281-.669v0q0-.401.281-.682t.682-.281h4.923v-4.896q0-.401.294-.682t.669-.281v0q.401 0 .682.281t.281.682v4.896h4.923q.401 0 .682.281t.281.682v0q0 .375-.281.669t-.682.294z' />
        </SvgIcon>
    );
}

function CloseSquare(props) {
    return (
        <SvgIcon className='close' fontSize='inherit' style={{ width: 14, height: 14 }} {...props}>
            {/* tslint:disable-next-line: max-line-length */}
            <path d='M17.485 17.512q-.281.281-.682.281t-.696-.268l-4.12-4.147-4.12 4.147q-.294.268-.696.268t-.682-.281-.281-.682.294-.669l4.12-4.147-4.12-4.147q-.294-.268-.294-.669t.281-.682.682-.281.696 .268l4.12 4.147 4.12-4.147q.294-.268.696-.268t.682.281 .281.669-.294.682l-4.12 4.147 4.12 4.147q.294.268 .294.669t-.281.682zM22.047 22.074v0 0-20.147 0h-20.12v0 20.147 0h20.12zM22.047 24h-20.12q-.803 0-1.365-.562t-.562-1.365v-20.147q0-.776.562-1.351t1.365-.575h20.147q.776 0 1.351.575t.575 1.351v20.147q0 .803-.575 1.365t-1.378.562v0z' />
        </SvgIcon>
    );
}

function TransitionComponent(props) {
    const style = {
        from: { opacity: 0, transform: 'translate3d(20px,0,0)' },
        to: { opacity: props.in ? 1 : 0, transform: `translate3d(${props.in ? 0 : 20}px,0,0)` },
    };

    return (
        <div style={style}>
            <Collapse {...props} />
        </div>
    );
}

const StyledTreeItem = withStyles((theme) => ({
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
}))((props) => (
    <div
        onClick={(e) => {
            e.stopPropagation();
            setTargetDepartment(props.nodeId, props.handleDeptPK, props.handleDeptMems);
        }}
    >
        <TreeItem {...props} TransitionComponent={TransitionComponent} />
    </div>
));

// * Redux Business function
const setTargetDepartment = (deptId, handleDeptPK, handleDeptMems) => {
    const url = '/api/company/getDepartmentMembers?deptId=' + deptId;
    handleDeptPK(deptId);
    get(url)
        .then((res) => {
            const data = res.data;
            handleDeptMems(data);
        })
        .catch((err) => console.log(err));
};

TransitionComponent.propTypes = {
    /**
     * Show the component; triggers the enter or exit states
     */
    in: PropTypes.bool,
};
