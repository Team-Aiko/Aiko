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
        approvalInfo: any[],
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
            for (const approval of approvalInfo) {
                await getRepo(ApprovalStepRepository).createApprovalStep(
                    queryRunner.manager,
                    insertId.AF_PK,
                    approval.stepStatus,
                    approval.userPk,
                    approval.stepLevel,
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
    async viewApproval(userPk: number, departmentPk: number, comPk: number, view: string) {
        // const result = await getRepo(ApprovalStepRepository).list(userPk, comPk, departmentPk, view);
        // 결제 전체보기 => 내가 결제 해야할 건 + 이미 결제가 완료난 건들 + 진행중인 결제
        // 대기중인 결제 => 내가 결제 해야할 건
        // 진행중인 결제 => 내가 올린 결제건 - 내가 결제해야할 건
        // 완료난 건 => 이미 결제 완료된 건
        if (view === 'done') {
            const result = await getRepo(ApprovalFrameRepository).doneList(comPk, departmentPk);
            return result;
        } // 완료된 결제
        else if (view === 'wait') {
            const infos = await getRepo(ApprovalFrameRepository).myRelatedList(userPk, comPk, departmentPk);
            let result;
            for (const info of infos) {
                result = await getRepo(ApprovalStepRepository).needToDoList(info.AF_PK, info.CURRENT_STEP_LEVEL);
                console.log(result);
            }
            return result;
        } // 대기중인 결제
        else if (view === 'all') {
            const done = await getRepo(ApprovalFrameRepository).doneList(comPk, departmentPk);
            const infos = await getRepo(ApprovalFrameRepository).myRelatedList(userPk, comPk, departmentPk);
            for (const info of infos) {
                const result = await getRepo(ApprovalStepRepository).needToDoList(info.AF_PK, info.CURRENT_STEP_LEVEL);
                console.log(result);
            }
            return done;
        } // 전체보기 건

        // process
    }
}
