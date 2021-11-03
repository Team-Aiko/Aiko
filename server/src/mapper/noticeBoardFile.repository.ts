import { EntityRepository, Repository } from 'typeorm';
import { NoticeBoard } from '../entity';
import { unixTimeStamp } from 'src/Helpers/functions';

@EntityRepository(NoticeBoard)
export default class NoticeBoardFileRepository extends Repository<NoticeBoard> {
    
}
