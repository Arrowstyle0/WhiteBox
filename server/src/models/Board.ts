import mongoose, { Document, Schema } from 'mongoose';

export interface IBoard extends Document {
    title: string;
    owner: string;
    roomId: string; // Short ID
    createdAt: Date;
    updatedAt: Date;
}

const BoardSchema: Schema = new Schema({
    title: { type: String, required: true, default: 'Untitled Board' },
    owner: { type: String, required: true }, // Changed from ObjectId to String to support Guest UUIDs
    roomId: { type: String, required: true, unique: true },
}, { timestamps: true });

export default mongoose.model<IBoard>('Board', BoardSchema, 'rooms');
