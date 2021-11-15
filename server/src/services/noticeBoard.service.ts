import { NoticeBoardFile } from 'src/entity';
import { AikoError } from 'src/Helpers/classes';
import { getRepo } from 'src/Helpers/functions';
import { NoticeBoardFileRepository } from 'src/mapper';
import NoticeBoardRepository from 'src/mapper/noticeBoard.repository';

export default class NoticeBoardService {
    //게시글 생성
    async createArtcle(title: string, content: string, userPk: number, comPk: number, files: Express.Multer.File[]) {
        try {
            const nbfPk = await getRepo(NoticeBoardRepository).createArticle(title, content, userPk, comPk);
            await getRepo(NoticeBoardFileRepository).createFiles(files, nbfPk, userPk, comPk); //파일 생성
        } catch (err) {
            throw new AikoError('QUERY ERROR[insert문 에러 발생]:' + err.name, 451, 500000);
        }
    }

    //게시글 수정

    async updateArtcle(title: string, content: string, userPk: number, num: number) {
        try {
            await getRepo(NoticeBoardRepository).updateArticle(title, content, userPk, num);
        } catch (err) {
            throw new AikoError('QUERY ERROR[update문 에러 발생]:' + err.name, 451, 500000);
        }
    }

    //게시글 삭제

    async deleteArtcle(userPk: number, num: number) {
        try {
            await getRepo(NoticeBoardRepository).deleteArticle(userPk, num);
        } catch (err) {
            throw new AikoError('QUERY ERROR[delete문 에러 발생]:' + err.name, 451, 500000);
        }
    }

    // 버튼 생성

    async createBtnSize(option: number, comPk: number) {
        return await getRepo(NoticeBoardRepository).createBtnSize(option, comPk);
    }

    // 게시글 목록 출력

    async getList(option: number, comPk: number, pageNum: number) {
        return await getRepo(NoticeBoardRepository).getList(option, comPk, pageNum);
    }

    // 게시글 상세 내용

    async getDetail(num: number, userPk: number) {
        return await getRepo(NoticeBoardRepository).getDetail(num, userPk);
    }

    // 파일 다운로드

    async getFile(uuid: number, userPk: number) {
        console.log(uuid, userPk);
        // throw new AikoError('에러테스트', 451, 500000);
    }
}
