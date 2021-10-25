import { getRepo } from 'src/Helpers/functions';
import { NoticeBoardRepository } from 'src/mapper';

export default class NoticeBoardService {
    async createArtcle(title: string, content: string, userPk: number) {
        try {
            await getRepo(NoticeBoardRepository).createArticle(title, content, userPk);
        } catch (err) {
            console.log(err);
        }
    }
}