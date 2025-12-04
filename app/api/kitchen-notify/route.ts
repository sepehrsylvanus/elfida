import { NextRequest, NextResponse } from "next/server";
import { notifyKitchenMessage } from "@/lib/notifyKitchenMessage";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const text = body?.text as string | undefined;

    if (!text || typeof text !== "string" || !text.trim()) {
      return NextResponse.json(
        { ok: false, message: "Geçersiz mesaj" },
        { status: 400 }
      );
    }

    await notifyKitchenMessage(text.trim());

    return NextResponse.json({ ok: true }, { status: 200 });
  } catch (err) {
    console.error("[API] POST /api/kitchen-notify error", err);
    return NextResponse.json(
      { ok: false, message: "Sunucu hatası" },
      { status: 500 }
    );
  }
}
