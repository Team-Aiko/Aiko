import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type statusDocument = Status & Document;

@Schema()
export class Status {
    @Prop({ required: true })
    userPK: number;
    @Prop({ required: true })
    companyPK: number;
    @Prop({ required: true })
    socketId: string;
    @Prop()
    logoutPending: boolean;
    @Prop()
    status: number;
}

export const StatusSchema = SchemaFactory.createForClass(Status);
