// models/PushSubscription.ts
import mongoose, { Schema, Model, models } from "mongoose";

interface IPushSubscription {
  courierId?: string; // اگر به پیک وصلش می‌کنی
  endpoint: string;
  keys: {
    p256dh: string;
    auth: string;
  };
  createdAt: Date;
}

const pushSubscriptionSchema = new Schema<IPushSubscription>({
  courierId: { type: String }, // یا ObjectId، بستگی به مدل‌هات داره
  endpoint: { type: String, required: true, unique: true },
  keys: {
    p256dh: { type: String, required: true },
    auth: { type: String, required: true },
  },
  createdAt: { type: Date, default: Date.now },
});

const PushSubscription: Model<IPushSubscription> =
  models.PushSubscription ||
  mongoose.model<IPushSubscription>("PushSubscription", pushSubscriptionSchema);

export default PushSubscription;
