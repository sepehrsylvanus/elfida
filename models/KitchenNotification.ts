import mongoose, { Schema, models, model } from "mongoose";

export interface IKitchenNotification extends mongoose.Document {
  messageId?: string;
  text: string;
  sentAt: Date;
  read: boolean;
}

const KitchenNotificationSchema = new Schema<IKitchenNotification>(
  {
    messageId: { type: String, required: false },
    text: { type: String, required: true },
    sentAt: { type: Date, default: Date.now },
    read: { type: Boolean, default: false },
  },
  { timestamps: { createdAt: false, updatedAt: false } }
);

const KitchenNotification =
  (models.KitchenNotification as mongoose.Model<IKitchenNotification>) ||
  model<IKitchenNotification>("KitchenNotification", KitchenNotificationSchema);

export default KitchenNotification;
