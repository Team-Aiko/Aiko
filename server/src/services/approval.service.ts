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
        // 진행중인 결제 => 내가 올린 결제건
        // 완료난 건 => 이미 결제 완료된 건

        const framePks = []; // 결제 프레임 Pk
        if (view === 'done') {
            const result = await getRepo(ApprovalFrameRepository).doneList(comPk, departmentPk);
            return result;
        } // 완료된 결제
        //////////////////////
        else if (view === 'wait') {
            const stepLevels = await getRepo(ApprovalFrameRepository).generateStepLevels(userPk, comPk, departmentPk);
            for (const info of stepLevels) {
                const result = await getRepo(ApprovalStepRepository).needToDoPks(
                    userPk,
                    info.AF_PK,
                    info.CURRENT_STEP_LEVEL,
                );
                framePks.push(result?.AF_PK);
            }
        } // 대기중인 결제
        /////////////////////
        else if (view === 'process') {
            const stepLevels = await getRepo(ApprovalFrameRepository).generateStepLevels(userPk, comPk, departmentPk);
            for (const info of stepLevels) {
                const doingPks = await getRepo(ApprovalFrameRepository).doingPks(
                    userPk,
                    info.AF_PK,
                    comPk,
                    departmentPk,
                );
                framePks.push(doingPks?.AF_PK);
            }
        } // 내가올린 결제
        /////////////////////
        else if (view === 'all') {
            const stepLevels = await getRepo(ApprovalFrameRepository).generateStepLevels(userPk, comPk, departmentPk);
            for (const info of stepLevels) {
                const needPks = await getRepo(ApprovalStepRepository).needToDoPks(
                    userPk,
                    info.AF_PK,
                    info.CURRENT_STEP_LEVEL,
                );
                const donePks = await getRepo(ApprovalFrameRepository).donePks(info.AF_PK, comPk, departmentPk);
                const doingPks = await getRepo(ApprovalFrameRepository).doingPks(
                    userPk,
                    info.AF_PK,
                    comPk,
                    departmentPk,
                );
                console.log(donePks);
                framePks.push(needPks?.AF_PK);
                framePks.push(donePks?.AF_PK);
                framePks.push(doingPks?.AF_PK);
            }
        } // 전체 결제
        //////////////
        const result = await getRepo(ApprovalFrameRepository).generateList(framePks);
        return result; /// 결과반환
    }
}
