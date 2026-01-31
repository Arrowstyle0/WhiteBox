import mongoose, { Document, Schema } from 'mongoose';

export interface IElement extends Document {
    boardId: string;
    type: 'path' | 'rect' | 'circle' | 'text' | 'eraser';
    points?: { x: number; y: number }[]; // For freehand paths
    x?: number; // For shapes
    y?: number; // For shapes
    width?: number; // For shapes
    height?: number; // For shapes
    text?: string; // For text tool
    fontSize?: number; // For text tool
    color: string;
    strokeWidth: number;
}

const ElementSchema: Schema = new Schema({
    boardId: { type: String, required: true },
    type: { type: String, enum: ['path', 'rect', 'circle', 'text', 'eraser'], required: true },
    points: [{ x: Number, y: Number }],
    x: Number,
    y: Number,
    width: Number,
    height: Number,
    text: String,
    fontSize: Number,
    color: { type: String, default: '#000000' },
    strokeWidth: { type: Number, default: 3 },
});

export default mongoose.model<IElement>('Element', ElementSchema);
