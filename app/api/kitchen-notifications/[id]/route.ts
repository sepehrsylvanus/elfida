import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import KitchenNotification from "@/models/KitchenNotification";

interface RouteContext {
  params: {
    id: string;
  };
}

export async function PATCH(req: NextRequest, context: RouteContext) {
  const { id } = context.params;

  try {
    await connectToDatabase();
    const body = await req.json();
    const update: any = {};

    if (typeof body.read === "boolean") {
      update.read = body.read;
    }

    if (Object.keys(update).length === 0) {
      return NextResponse.json(
        { ok: false, message: "Geçersiz güncelleme isteği" },
        { status: 400 }
      );
    }

    const doc = await KitchenNotification.findByIdAndUpdate(id, update, {
      new: true,
    });

    if (!doc) {
      return NextResponse.json(
        { ok: false, message: "Bildirim bulunamadı" },
        { status: 404 }
      );
    }

    return NextResponse.json({ ok: true }, { status: 200 });
  } catch (err) {
    console.error("[API] PATCH /api/kitchen-notifications/[id] error", err);
    return NextResponse.json(
      { ok: false, message: "Sunucu hatası" },
      { status: 500 }
    );
  }
}
