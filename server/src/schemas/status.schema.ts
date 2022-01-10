import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema()
export class Status {
    @Prop({ required: true })
    userPK: number;
    @Prop({ required: true })
    companyPK: number;
    @Prop()
    status: number;
}

export type StatusDocument = Status & Document;
export const StatusSchema = SchemaFactory.createForClass(Status);
