import { Module } from '@nestjs/common';
import ApprovalController from 'src/controllers/approval.controller';
import ApprovalService from 'src/services/approval.service';
@Module({
    controllers: [ApprovalController],
    providers: [ApprovalService],
    exports: [ApprovalService],
})
export default class ApprovalModule {}
