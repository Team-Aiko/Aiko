import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema()
export class StatusClientStorage {
    @Prop({ required: true })
    userPK: number;
    @Prop({ required: true })
    companyPK: number;
    @Prop({ required: true })
    clientId: string;
}

export type StatusClientStorageDocument = StatusClientStorage & Document;
export const statusClientStorageSchema = SchemaFactory.createForClass(StatusClientStorage);
