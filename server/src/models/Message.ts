import mongoose, { Document, Schema } from 'mongoose';

export interface IMessage extends Document {
    roomId: string;
    senderId: string; // Socket ID or User ID
    content: string;
    createdAt: Date;
}

const MessageSchema: Schema = new Schema({
    roomId: { type: String, required: true }, // Using string roomId (uuid) not ObjectId ref for simplicity
    senderId: { type: String, required: true },
    content: { type: String, required: true },
}, { timestamps: true });

export default mongoose.model<IMessage>('Message', MessageSchema, 'chats');
