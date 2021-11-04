import { Module } from '@nestjs/common';
import TestController from 'src/controllers/test.controller';

@Module({
    controllers: [TestController],
    providers: [],
    exports: [],
})
export default class TestModule {}
