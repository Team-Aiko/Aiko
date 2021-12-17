import { NoticeBoardFile } from 'src/entity';
import { AikoError } from 'src/Helpers/classes';
import { getRepo, propsRemover } from 'src/Helpers/functions';
import { NoticeBoardFileRepository } from 'src/mapper';
import NoticeBoardRepository from 'src/mapper/noticeBoard.repository';
import { getConnection } from 'typeorm';
import ApprovalFrameRepository from 'src/mapper/approvalFrame.repository';
import ApprovalStepRepository from 'src/mapper/approvalStep.repository';

export default class ApprovalService {
    async createApproval(
        title: string,
        content: string,
        approverPks: number[],
        agreerPks: number[],
        departmentPk: number,
        comPk: number,
        userPk: number,
    ) {
        const queryRunner = getConnection().createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();
        try {
            const insertId = await getRepo(ApprovalFrameRepository).createApproval(
                queryRunner.manager,
                title,
                content,
                comPk,
                departmentPk,
                userPk,
            );
            let stepStatus = 1;
            for (const agreerPk of agreerPks) {
                await getRepo(ApprovalStepRepository).createApprovalStepOfAgreer(
                    queryRunner.manager,
                    insertId.AF_PK,
                    agreerPk,
                    stepStatus,
                );
            }
            for (const approverPk of approverPks) {
                stepStatus++;
                await getRepo(ApprovalStepRepository).createApprovalStepOfApprover(
                    queryRunner.manager,
                    insertId.AF_PK,
                    approverPk,
                    stepStatus,
                );
            }

            await queryRunner.commitTransaction(); //커밋 트랜젝션
        } catch (err) {
            await queryRunner.rollbackTransaction();
            console.log(err);
            throw new AikoError(err.message, 451, 500000);
        } finally {
            queryRunner.release();
        }
    }
    async viewApproval() {

    }
}
