import { Grant } from 'src/entity';

export interface IActionCreateBundle {
    P_PK: number;
    STEP_PK?: number;
    DEPARTMENT_PK: number;
    COMPANY_PK: number;
    USER_PK: number | undefined | null;
    ASSIGNER_PK: number;
    DUE_DATE: number;
    START_DATE: number;
    TITLE: string;
    DESCRIPTION: string;
    grants: Grant[];
}
