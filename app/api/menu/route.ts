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

export async function GET() {
  try {
    await connectToDatabase()
    const items = await MenuItem.find({}).sort({ name: 1 }).lean()
    return NextResponse.json(items.map(mapMenuItem), { status: 200 })
  } catch (error) {
    console.error("[API] GET /api/menu error", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    await connectToDatabase()
    const body = await req.json()
    const { name, available = true, estimatedStock = 0 } = body

    if (!name || typeof name !== "string") {
      return NextResponse.json({ message: "Name is required" }, { status: 400 })
    }

    const created = await MenuItem.create({ name, available, estimatedStock })
    return NextResponse.json(mapMenuItem(created), { status: 201 })
  } catch (error) {
    console.error("[API] POST /api/menu error", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}
