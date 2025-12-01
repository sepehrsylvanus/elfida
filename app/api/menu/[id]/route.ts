import { NextRequest, NextResponse } from "next/server"
import { connectToDatabase } from "@/lib/mongodb"
import MenuItem from "@/models/MenuItem"

function mapMenuItem(doc: any) {
  return {
    id: doc._id.toString(),
    name: doc.name,
    available: doc.available,
    estimatedStock: doc.estimatedStock,
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
    const { name, available, estimatedStock } = body

    const update: any = {}
    if (typeof name === "string") update.name = name
    if (typeof available === "boolean") update.available = available
    if (typeof estimatedStock === "number") update.estimatedStock = estimatedStock

    const updated = await MenuItem.findByIdAndUpdate(id, update, { new: true })
    if (!updated) {
      return NextResponse.json({ message: "Menu item not found" }, { status: 404 })
    }

    return NextResponse.json(mapMenuItem(updated), { status: 200 })
  } catch (error) {
    console.error(`[API] PUT /api/menu/${id} error`, error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}

export async function DELETE(_req: NextRequest, context: RouteContext) {
  const { id } = context.params

  try {
    await connectToDatabase()

    // First try deleting by Mongo _id (ObjectId string)
    let deleted = await MenuItem.findByIdAndDelete(id)

    // Fallback: in case some legacy documents used a custom `id` field
    if (!deleted) {
      deleted = await MenuItem.findOneAndDelete({ id })
    }

    if (!deleted) {
      return NextResponse.json({ message: "Menu item not found" }, { status: 404 })
    }

    return NextResponse.json({ success: true }, { status: 200 })
  } catch (error) {
    console.error(`[API] DELETE /api/menu/${id} error`, error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}
