import { NextRequest, NextResponse } from "next/server";
import Order from "@/models/Order";
import { connectToDatabase } from "@/lib/mongodb";

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

    if (typeof body.driverId === "string") {
      update.driverId = body.driverId;
    }

    if (body.status === "delivered") {
      update.status = "delivered";
      update.deliveredAt = new Date();
    } else if (body.status === "ready") {
      update.status = "ready";
      update.readyAt = new Date();
    }

    if (Object.keys(update).length === 0) {
      return NextResponse.json(
        { ok: false, message: "Geçersiz güncelleme isteği" },
        { status: 400 }
      );
    }

    let order = await Order.findByIdAndUpdate(id, update, { new: true });

    // Eğer _id ile sipariş bulunamazsa, fallback olarak orderNumber ile dene
    if (!order && typeof body.orderNumber === "number") {
      order = await Order.findOneAndUpdate(
        { orderNumber: body.orderNumber },
        update,
        { new: true }
      );
    }

    if (!order) {
      return NextResponse.json(
        { ok: false, message: "Sipariş bulunamadı" },
        { status: 404 }
      );
    }

    return NextResponse.json({ ok: true, order }, { status: 200 });
  } catch (err) {
    console.error("update order error:", err);
    return NextResponse.json(
      { ok: false, message: "Sunucu hatası" },
      { status: 500 }
    );
  }
}
