import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

@Schema()
export class GroupChatClientInfo {
    @Prop({ required: true })
    clientId: string;

    @Prop({ required: true })
    userPK: number;

    @Prop({ required: true })
    companyPK: number;
}

export type GroupChatClientInfoDocument = GroupChatClientInfo & Document;
export const GroupChatClientInfoSchema = SchemaFactory.createForClass(GroupChatClientInfo);
