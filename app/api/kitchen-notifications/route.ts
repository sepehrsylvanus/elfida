import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import KitchenNotification from "@/models/KitchenNotification";
import { notifyKitchenMessage } from "@/lib/notifyKitchenMessage";

export async function GET() {
  try {
    await connectToDatabase();
    const docs = await KitchenNotification.find({}).sort({ sentAt: -1 }).lean();

    const notifications = docs.map((doc: any) => ({
      id: doc._id.toString(),
      messageId: doc.messageId ?? undefined,
      text: doc.text,
      sentAt: doc.sentAt,
      read: !!doc.read,
    }));

    return NextResponse.json({ ok: true, notifications }, { status: 200 });
  } catch (err) {
    console.error("[API] GET /api/kitchen-notifications error", err);
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
    const messageId = body?.messageId as string | undefined;

    if (!text) {
      return NextResponse.json(
        { ok: false, message: "Bildirim metni gereklidir" },
        { status: 400 }
      );
    }

    // Önce DB'ye yaz
    const created = await KitchenNotification.create({
      messageId: messageId || undefined,
      text,
      read: false,
    });

    // ntfy.sh üzerinden mutfak ekibine gönder
    await notifyKitchenMessage(text);

    return NextResponse.json(
      {
        ok: true,
        notification: {
          id: created._id.toString(),
          messageId: created.messageId ?? undefined,
          text: created.text,
          sentAt: created.sentAt,
          read: created.read,
        },
      },
      { status: 201 }
    );
  } catch (err) {
    console.error("[API] POST /api/kitchen-notifications error", err);
    return NextResponse.json(
      { ok: false, message: "Sunucu hatası" },
      { status: 500 }
    );
  }
}

export async function DELETE() {
  try {
    await connectToDatabase();
    await KitchenNotification.deleteMany({});
    return NextResponse.json({ ok: true }, { status: 200 });
  } catch (err) {
    console.error("[API] DELETE /api/kitchen-notifications error", err);
    return NextResponse.json(
      { ok: false, message: "Sunucu hatası" },
      { status: 500 }
    );
  }
}
