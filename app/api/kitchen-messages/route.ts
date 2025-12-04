import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import KitchenMessage from "@/models/KitchenMessage";

export async function GET() {
  try {
    await connectToDatabase();
    const docs = await KitchenMessage.find({}).sort({ createdAt: -1 }).lean();

    const messages = docs.map((doc: any) => ({
      id: doc._id.toString(),
      text: doc.text,
      createdAt: doc.createdAt,
    }));

    return NextResponse.json({ ok: true, messages }, { status: 200 });
  } catch (err) {
    console.error("[API] GET /api/kitchen-messages error", err);
    return NextResponse.json(
      { ok: false, message: "Sunucu hatası" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    await connectToDatabase();
    const body = await req.json();
    const text = (body?.text as string | undefined)?.trim();

    if (!text) {
      return NextResponse.json(
        { ok: false, message: "Mesaj metni gereklidir" },
        { status: 400 }
      );
    }

    const created = await KitchenMessage.create({ text });

    return NextResponse.json(
      {
        ok: true,
        message: {
          id: created._id.toString(),
          text: created.text,
          createdAt: created.createdAt,
        },
      },
      { status: 201 }
    );
  } catch (err) {
    console.error("[API] POST /api/kitchen-messages error", err);
    return NextResponse.json(
      { ok: false, message: "Sunucu hatası" },
      { status: 500 }
    );
  }
}
