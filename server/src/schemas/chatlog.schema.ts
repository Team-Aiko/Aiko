import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type PrivateChatlogDocument = PrivateChatlog & Document;

@Schema()
export class PrivateChatlog {
    @Prop({ required: true })
    roomId: string;
    @Prop({ required: true })
    messages: {
        sender: number;
        file: number;
        message: string;
        date: number;
    }[];
}

export const PrivateChatlogSchema = SchemaFactory.createForClass(PrivateChatlog);
