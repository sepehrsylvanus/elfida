import { NextRequest, NextResponse } from "next/server"
import { connectToDatabase } from "@/lib/mongodb"
import Customer from "@/models/Customer"

function mapCustomer(doc: any) {
  return {
    id: doc._id.toString(),
    name: doc.name,
    phone: doc.phone,
    addresses: doc.addresses || [],
  }
}

export async function GET() {
  try {
    await connectToDatabase()
    const items = await Customer.find({}).sort({ name: 1 }).lean()
    return NextResponse.json(items.map(mapCustomer), { status: 200 })
  } catch (error) {
    console.error("[API] GET /api/customers error", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    await connectToDatabase()
    const body = await req.json()
    const { name, phone, address, addressLabel } = body

    if (!name || !phone || !address) {
      return NextResponse.json({ message: "İsim, telefon ve adres zorunludur" }, { status: 400 })
    }

    const nowId = Date.now().toString()

    const created = await Customer.create({
      name,
      phone,
      addresses: [
        {
          id: `a${nowId}`,
          label: addressLabel || "Ev",
          address,
        },
      ],
    })

    return NextResponse.json(mapCustomer(created), { status: 201 })
  } catch (error) {
    console.error("[API] POST /api/customers error", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}
