import { Module } from '@nestjs/common';
import ApprovalController from 'src/controllers/approval.controller';

@Module({
    controllers: [ApprovalController],
    providers: [],
    exports: [],
})
export default class ApprovalModule {}
