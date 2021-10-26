import WorkController from 'src/controllers/work.controller';
import WorkService from 'src/services/work.service';
import { Module } from '@nestjs/common';

@Module({
    imports: [],
    controllers: [WorkController],
    providers: [WorkService],
    exports: [WorkService],
})
export default class WorkModule {}
