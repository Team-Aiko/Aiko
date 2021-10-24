import { Grant } from 'src/entity';

export interface INewDepartment {
    departmentName: string;
    parentPK?: number;
    companyPK: number;
    userPK: number;
    parentDepth?: number;
}

export interface IPermissionBundle {
    authListPK: number;
    targetUserPK: number;
    grants: Grant[];
    USER_PK: number;
    companyPK: number;
}
