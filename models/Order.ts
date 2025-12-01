// models/Order.ts
import mongoose, { Schema, Model, models } from "mongoose";

interface IOrderItem {
  menuItemId: string;
  quantity: number;
}

const orderItemSchema = new Schema<IOrderItem>(
  {
    menuItemId: { type: String, required: true },
    quantity: { type: Number, required: true, min: 1 },
  },
  { _id: false }
);

interface ILocation {
  lat: number;
  lng: number;
}

const locationSchema = new Schema<ILocation>(
  {
    lat: Number,
    lng: Number,
  },
  { _id: false }
);

export interface IOrder extends mongoose.Document {
  orderNumber: number;
  type: "delivery" | "pickup";
  source: "in-house" | "yemeksepeti" | "getir";
  status: "pending" | "ready" | "delivered";
  items: IOrderItem[];
  customerName: string;
  customerPhone: string;
  customerAddress: string;
  addressLocation?: ILocation;
  totalAmount: number;
  createdAt: Date;
  updatedAt: Date;
}

const orderSchema = new Schema<IOrder>(
  {
    orderNumber: { type: Number, required: true },
    type: { type: String, enum: ["delivery", "pickup"], required: true },
    source: {
      type: String,
      enum: ["in-house", "yemeksepeti", "getir"],
      required: true,
    },
    status: {
      type: String,
      enum: ["pending", "ready", "delivered"],
      default: "pending",
    },
    items: { type: [orderItemSchema], required: true },
    customerName: { type: String, required: true },
    customerPhone: { type: String, required: true },
    customerAddress: { type: String, required: true },
    addressLocation: { type: locationSchema, required: false },
    totalAmount: { type: Number, required: true },
  },
  { timestamps: true } // createdAt / updatedAt اتوماتیک
);

const Order: Model<IOrder> =
  models.Order || mongoose.model<IOrder>("Order", orderSchema);

export default Order;
