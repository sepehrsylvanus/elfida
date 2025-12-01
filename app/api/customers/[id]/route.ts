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

interface RouteContext {
  params: {
    id: string
  }
}

export async function PUT(req: NextRequest, context: RouteContext) {
  const { id } = context.params

  try {
    await connectToDatabase()
    const body = await req.json()
    const { name, phone } = body

    const update: any = {}
    if (typeof name === "string") update.name = name
    if (typeof phone === "string") update.phone = phone

    const updated = await Customer.findByIdAndUpdate(id, update, { new: true })

    if (!updated) {
      return NextResponse.json({ message: "Customer not found" }, { status: 404 })
    }

    return NextResponse.json(mapCustomer(updated), { status: 200 })
  } catch (error) {
    console.error(`[API] PUT /api/customers/${id} error`, error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}

export async function DELETE(_req: NextRequest, context: RouteContext) {
  const { id } = context.params

  try {
    await connectToDatabase()

    let deleted = await Customer.findByIdAndDelete(id)
    if (!deleted) {
      deleted = await Customer.findOneAndDelete({ id })
    }

    if (!deleted) {
      return NextResponse.json({ message: "Customer not found" }, { status: 404 })
    }

    return NextResponse.json({ success: true }, { status: 200 })
  } catch (error) {
    console.error(`[API] DELETE /api/customers/${id} error`, error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}
