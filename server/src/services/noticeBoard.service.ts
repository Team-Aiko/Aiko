import { AikoError } from 'src/Helpers/classes';
import { getRepo } from 'src/Helpers/functions';
import NoticeBoardRepository from 'src/mapper/noticeBoard.repository';

export default class NoticeBoardService {
    async createArtcle(title: string, content: string, userPk: number) {
        try {
            await getRepo(NoticeBoardRepository).createArticle(title, content, userPk);
        } catch (err) {
            throw new AikoError('QUERY ERROR[insert문 에러 발생]:' + err.name, 451, 500000);
        }
    }
}