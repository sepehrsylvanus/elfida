import mongoose, { Schema, models, model } from "mongoose"

export interface IMenuItem extends mongoose.Document {
  name: string
  available: boolean
  estimatedStock: number
  createdAt: Date
  updatedAt: Date
}

const MenuItemSchema = new Schema<IMenuItem>(
  {
    name: { type: String, required: true, trim: true },
    available: { type: Boolean, default: true },
    estimatedStock: { type: Number, default: 0 },
  },
  {
    timestamps: true,
  },
)

const MenuItem = (models.MenuItem as mongoose.Model<IMenuItem>) || model<IMenuItem>("MenuItem", MenuItemSchema)

export default MenuItem
