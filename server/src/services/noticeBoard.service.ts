import { AikoError } from 'src/Helpers/classes';
import { getRepo } from 'src/Helpers/functions';
import NoticeBoardRepository from 'src/mapper/noticeBoard.repository';

export default class NoticeBoardService {
    async createArtcle(title: string, content: string, userPk: number, comPk: number, files) {
        try {
            await getRepo(NoticeBoardRepository).createArticle(title, content, userPk, comPk);
            console.log(files);
        } catch (err) {
            throw new AikoError('QUERY ERROR[insert문 에러 발생]:' + err.name, 451, 500000);
        }
    }
    async updateArtcle(title: string, content: string, userPk: number, num: number) {
        try {
            await getRepo(NoticeBoardRepository).updateArticle(title, content, userPk, num);
        } catch (err) {
            throw new AikoError('QUERY ERROR[update문 에러 발생]:' + err.name, 451, 500000);
        }
    }
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
    async getList(option: number, comPk: number, pageNum: number) {
        return await getRepo(NoticeBoardRepository).getList(option, comPk, pageNum);
    }

    async getDetail(num: number, userPk: number) {
        return await getRepo(NoticeBoardRepository).getDetail(num, userPk);
    }
}
