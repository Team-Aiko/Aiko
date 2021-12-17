import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema()
export class GroupChatLog {
    @Prop({ required: true })
    GC_PK: number;

    @Prop({ required: true })
    companyPK: number;

    @Prop({ required: true })
    chatLog: {
        sender: number;
        file: number;
        message: string;
        date: number;
    }[];
}

export type GroupChatLogDocument = Document & GroupChatLog;
export const groupChatLogSchema = SchemaFactory.createForClass(GroupChatLog);
