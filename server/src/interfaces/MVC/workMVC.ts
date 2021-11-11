import { Grant } from 'src/entity';

export interface IItemBundle {
    ACTION_PK?: number;
    P_PK: number;
    STEP_PK?: number;
    DEPARTMENT_PK: number;
    USER_PK: number | undefined | null;
    ASSIGNER_PK: number;
    DUE_DATE: number;
    START_DATE: number;
    TITLE: string;
    COMPANY_PK: number;
    DESCRIPTION: string;
    grants: Grant[];
    updateCols?: string[];
    IS_FINISHED?: number;
}

export interface IPaginationBundle {
    USER_PK: number;
    COMPANY_PK: number;
    currentPage: number;
    feedsPerPage?: number;
    groupCnt?: number;
    totCnt?: number;
}
