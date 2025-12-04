import mongoose, { Schema, models, model } from "mongoose";

export interface IKitchenMessage extends mongoose.Document {
  text: string;
  createdAt: Date;
}

const KitchenMessageSchema = new Schema<IKitchenMessage>(
  {
    text: { type: String, required: true, trim: true },
    createdAt: { type: Date, default: Date.now },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

const KitchenMessage =
  (models.KitchenMessage as mongoose.Model<IKitchenMessage>) ||
  model<IKitchenMessage>("KitchenMessage", KitchenMessageSchema);

export default KitchenMessage;
