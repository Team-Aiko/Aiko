import { Module } from '@nestjs/common';
import DriveController from 'src/controllers/drive.controller';
import DriveService from 'src/services/drive.service';

@Module({ imports: [], controllers: [DriveController], providers: [DriveService], exports: [DriveService] })
export default class DriveModule {}
