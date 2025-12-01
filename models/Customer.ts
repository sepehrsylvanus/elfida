import mongoose, { Schema, models, model } from "mongoose"

export interface ICustomerAddress {
  id: string
  label: string
  address: string
  location?: {
    lat: number
    lng: number
  }
}

export interface ICustomer extends mongoose.Document {
  name: string
  phone: string
  addresses: ICustomerAddress[]
  createdAt: Date
  updatedAt: Date
}

const CustomerAddressSchema = new Schema<ICustomerAddress>(
  {
    id: { type: String, required: true },
    label: { type: String, required: true },
    address: { type: String, required: true },
    location: {
      lat: { type: Number },
      lng: { type: Number },
    },
  },
  { _id: false },
)

const CustomerSchema = new Schema<ICustomer>(
  {
    name: { type: String, required: true, trim: true },
    phone: { type: String, required: true, trim: true },
    addresses: { type: [CustomerAddressSchema], default: [] },
  },
  {
    timestamps: true,
  },
)

const Customer = (models.Customer as mongoose.Model<ICustomer>) || model<ICustomer>("Customer", CustomerSchema)

export default Customer
