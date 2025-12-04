import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import KitchenMessage from "@/models/KitchenMessage";

interface RouteContext {
  params: {
    id: string;
  };
}

export async function DELETE(_req: NextRequest, context: RouteContext) {
  const { id } = context.params;

  try {
    await connectToDatabase();

    // Önce _id ile silmeyi dene
    let deleted = await KitchenMessage.findByIdAndDelete(id);

    // Eski dokümanlarda özel bir id alanı varsa ona göre de dene (geriye dönük uyum)
    if (!deleted) {
      deleted = await KitchenMessage.findOneAndDelete({ id });
    }

    // Burada deleted olmasa bile, zaten DB'de yok demektir → 200 dönmek güvenli
    return NextResponse.json({ ok: true }, { status: 200 });
  } catch (err) {
    console.error("[API] DELETE /api/kitchen-messages/[id] error", err);
    return NextResponse.json(
      { ok: false, message: "Sunucu hatası" },
      { status: 500 }
    );
  }
}
