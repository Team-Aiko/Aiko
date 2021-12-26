import { AikoError } from 'src/Helpers/classes';
import { getRepo, stackAikoError } from 'src/Helpers/functions';
import { headErrorCode } from 'src/interfaces/MVC/errorEnums';
import { NoticeBoardFileRepository } from 'src/mapper';
import NoticeBoardRepository from 'src/mapper/noticeBoard.repository';

enum noticeBoardServiceError {
    createArtcle = 1,
    updateArtcle = 2,
    deleteArtcle = 3,
    createBtnSize = 4,
    getList = 5,
    getDetail = 6,
}

export default class NoticeBoardService {
    //게시글 생성
    async createArtcle(title: string, content: string, userPk: number, comPk: number, files: Express.Multer.File[]) {
        try {
            const nbfPk = await getRepo(NoticeBoardRepository).createArticle(title, content, userPk, comPk);
            await getRepo(NoticeBoardFileRepository).createFiles(files, nbfPk, userPk, comPk); //파일 생성
        } catch (err) {
            throw stackAikoError(
                err,
                'NoticeBoardService/createArtcle',
                500,
                headErrorCode.noticeBoard + noticeBoardServiceError.createArtcle,
            );
        }
    }

    //게시글 수정

    async updateArtcle(
        title: string,
        content: string,
        userPk: number,
        comPk: number,
        num: number,
        delFilePks: number[],
        files: Express.Multer.File[],
    ) {
        try {
            await getRepo(NoticeBoardRepository).updateArticle(title, content, userPk, num);
            await getRepo(NoticeBoardFileRepository).createFiles(files, num, userPk, comPk); //파일 생성
            await getRepo(NoticeBoardFileRepository).deleteFiles(delFilePks);
        } catch (err) {
            throw stackAikoError(
                err,
                'NoticeBoardService/updateArtcle',
                500,
                headErrorCode.noticeBoard + noticeBoardServiceError.updateArtcle,
            );
        }
    }

    //게시글 삭제

    async deleteArtcle(userPk: number, num: number) {
        try {
            await getRepo(NoticeBoardRepository).deleteArticle(userPk, num);
        } catch (err) {
            throw stackAikoError(
                err,
                'NoticeBoardService/deleteArtcle',
                500,
                headErrorCode.noticeBoard + noticeBoardServiceError.deleteArtcle,
            );
        }
    }

    // 버튼 생성

    async createBtnSize(option: number, comPk: number) {
        try {
            return await getRepo(NoticeBoardRepository).createBtnSize(option, comPk);
        } catch (err) {
            throw stackAikoError(
                err,
                'NoticeBoardService/createBtnSize',
                500,
                headErrorCode.noticeBoard + noticeBoardServiceError.createBtnSize,
            );
        }
    }

    // 게시글 목록 출력

    async getList(option: number, comPk: number, pageNum: number) {
        try {
            return await getRepo(NoticeBoardRepository).getList(option, comPk, pageNum);
        } catch (err) {
            throw stackAikoError(
                err,
                'NoticeBoardService/getList',
                500,
                headErrorCode.noticeBoard + noticeBoardServiceError.getList,
            );
        }
    }

    // 게시글 상세 내용

    async getDetail(num: number, userPk: number) {
        try {
            const result = await getRepo(NoticeBoardRepository).getDetail(num, userPk);
            return result;
        } catch (err) {
            throw stackAikoError(
                err,
                'NoticeBoardService/getDetail',
                500,
                headErrorCode.noticeBoard + noticeBoardServiceError.getDetail,
            );
        }
    }
}
