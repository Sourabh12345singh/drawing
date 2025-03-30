import mongoose, { Schema, Document } from "mongoose";

interface IDrawing extends Document {
  sessionId: string;
  strokes: { x: number; y: number; color: string; size: number }[];
  textObjects: { id: number; text: string; x: number; y: number }[];
  createdAt: Date;
}

const DrawingSchema = new Schema<IDrawing>({
  sessionId: { type: String, required: true },
  strokes: [
    {
      x: Number,
      y: Number,
      color: String,
      size: Number,
    dragging: { type: Boolean, default: false },
    },
  ],
  textObjects: [
    {
      id: Number,
      text: String,
      x: Number,
      y: Number,
    }
  ],
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.model<IDrawing>("Drawing", DrawingSchema);
