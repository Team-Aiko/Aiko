export default class ApprovalService {
    createApproval(
        title: string,
        content: string,
        approverPks: number[],
        agreerPks: number[],
        departmentPk: number,
        comPk: number,
        userPk: number,
    ) {
        console.log(title, content, approverPks, agreerPks, comPk, departmentPk, userPk);
    }
}
