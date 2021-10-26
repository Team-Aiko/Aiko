import { AikoError } from 'src/Helpers/classes';
import { getRepo } from 'src/Helpers/functions';
import NoticeBoardRepository from 'src/mapper/noticeBoard.repository';

export default class NoticeBoardService {
    async createArtcle(title: string, content: string, userPk: number, comPk: number) {
        try {
            await getRepo(NoticeBoardRepository).createArticle(title, content, userPk, comPk);
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
    async createBtnSize(option: number, comPk: number) {
        return await getRepo(NoticeBoardRepository).createBtnSize(option, comPk);
    }
}