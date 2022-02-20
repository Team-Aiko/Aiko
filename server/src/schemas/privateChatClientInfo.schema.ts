import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema()
export class PrivateChatClientInfo {
    @Prop({ required: true })
    clientId: string;

    @Prop({ required: true })
    userPK: number;

    @Prop({ required: true })
    companyPK: number;
}

export type PrivateChatClientInfoDocument = PrivateChatClientInfo & Document;
export const PrivateChatClientInfoSchema = SchemaFactory.createForClass(PrivateChatClientInfo);
