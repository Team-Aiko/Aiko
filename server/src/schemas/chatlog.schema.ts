import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type PrivateChatlogDocument = PriavateChatlog & Document;

@Schema()
export class PriavateChatlog {
    @Prop({ required: true })
    roomId: string;
    @Prop({ required: true })
    sender: number;
    @Prop({ required: true })
    receiver: number;
    @Prop()
    file: number;
    @Prop()
    message: string;
    @Prop({ required: true })
    date: number;
}

export const PrivateChatlogSchema = SchemaFactory.createForClass(PriavateChatlog);
