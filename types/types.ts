import { WAMessage, MessageUpsertType } from "baileys";

export type MessageBody = {
    messages: WAMessage[];
    type: MessageUpsertType;
    requestId?: string;
};

