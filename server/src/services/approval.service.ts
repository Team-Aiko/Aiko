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
            await getRepo(ApprovalFrameRepository).createApproval(
                queryRunner.manager,
                title,
                content,
                comPk,
                departmentPk,
                userPk,
            );
            await getRepo(ApprovalStepRepository).createApprovalStep()
            await queryRunner.commitTransaction();
        } catch (err) {
            await queryRunner.rollbackTransaction();
            console.log('apporval.service 파일의 createApproval 에서 에러발생 : ' + err);
        } finally {
            queryRunner.release();
        }
    }
}
