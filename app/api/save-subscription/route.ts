// app/api/save-subscription/route.ts
import { NextRequest, NextResponse } from "next/server";
import PushSubscription from "@/models/PushSubscription";
import { connectToDatabase } from "@/lib/mongodb";

export async function POST(req: NextRequest) {
  try {
    await connectToDatabase();

    const body = await req.json();
    const { subscription, courierId } = body;

    if (!subscription || !subscription.endpoint || !subscription.keys) {
      return NextResponse.json(
        { ok: false, message: "Geçersiz subscription verisi" },
        { status: 400 }
      );
    }

    // destructure
    const { endpoint, keys } = subscription;

    // Aynı endpoint varsa upsert yapalım (update or create)
    const result = await PushSubscription.findOneAndUpdate(
      { endpoint },
      {
        endpoint,
        keys: {
          p256dh: keys.p256dh,
          auth: keys.auth,
        },
        courierId: courierId || null,
      },
      {
        upsert: true,
        new: true,
        setDefaultsOnInsert: true,
      }
    );

    return NextResponse.json({ ok: true, subscriptionId: result._id });
  } catch (err) {
    console.error("save-subscription error:", err);
    return NextResponse.json(
      { ok: false, message: "Sunucu hatası" },
      { status: 500 }
    );
  }
}
