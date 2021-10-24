export interface INewDepartment {
    departmentName: string;
    parentPK?: number;
    companyPK: number;
    userPK: number;
    parentDepth?: number;
}
