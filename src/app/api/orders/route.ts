import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { validateCoupon, normalizeCode } from "@/lib/coupon";

const schema = z
  .object({
    customerName: z.string().min(2).max(80),
    phone: z.string().min(6).max(20),
    email: z.string().email().optional().or(z.literal("")),
    district: z.string().max(80).optional(),
    address: z.string().max(200).optional(),
    note: z.string().max(500).optional(),
    channel: z.enum(["WHATSAPP", "YAPE", "PLIN"]),
    deliveryMethod: z.enum(["PICKUP", "DELIVERY"]).default("PICKUP"),
    docType: z.enum(["BOLETA", "FACTURA"]).default("BOLETA"),
    docNumber: z.string().max(11).optional().or(z.literal("")),
    businessName: z.string().max(120).optional().or(z.literal("")),
    fiscalAddress: z.string().max(200).optional().or(z.literal("")),
    couponCode: z.string().max(40).optional().or(z.literal("")),
    items: z.array(z.object({ id: z.string(), qty: z.number().int().min(1).max(99) })).min(1),
  })
  .refine((d) => d.deliveryMethod !== "DELIVERY" || (d.district && d.address), {
    message: "Para envío necesitas distrito y dirección",
  })
  .refine((d) => d.docType !== "FACTURA" || (/^\d{11}$/.test(d.docNumber || "") && d.businessName), {
    message: "Para factura necesitas RUC (11 dígitos) y razón social",
  })
  .refine((d) => d.docType !== "BOLETA" || !d.docNumber || /^\d{8}$/.test(d.docNumber), {
    message: "El DNI debe tener 8 dígitos",
  });

async function nextCode() {
  const count = await prisma.order.count();
  return `ONI-${String(count + 1).padStart(4, "0")}`;
}

export async function POST(req: Request) {
  let data;
  try {
    data = schema.parse(await req.json());
  } catch (e) {
    const msg = e instanceof z.ZodError ? e.issues[0]?.message : "Datos inválidos";
    return NextResponse.json({ error: msg || "Datos inválidos" }, { status: 400 });
  }

  // Recalcular precios desde la BD (no confiar en el cliente)
  const products = await prisma.product.findMany({
    where: { id: { in: data.items.map((i) => i.id) }, active: true },
  });

  const lines = data.items
    .map((i) => {
      const p = products.find((x) => x.id === i.id);
      if (!p) return null;
      const priceCents = p.discountCents ?? p.priceCents;
      return { productId: p.id, name: p.name, priceCents, qty: i.qty };
    })
    .filter(Boolean) as { productId: string; name: string; priceCents: number; qty: number }[];

  if (lines.length === 0) {
    return NextResponse.json({ error: "Sin productos válidos" }, { status: 400 });
  }

  const subtotalCents = lines.reduce((n, l) => n + l.priceCents * l.qty, 0);

  // Cupón: revalidar en el servidor (no confiar en el cliente)
  let discountCents = 0;
  let couponCode: string | null = null;
  let couponId: string | null = null;
  if (data.couponCode) {
    const code = normalizeCode(data.couponCode);
    const coupon = await prisma.coupon.findUnique({ where: { code } });
    const result = validateCoupon(coupon, subtotalCents);
    if (!result.ok) {
      return NextResponse.json({ error: `Cupón: ${result.error}. Quítalo e intenta de nuevo.` }, { status: 400 });
    }
    discountCents = result.discountCents;
    couponCode = coupon!.code;
    couponId = coupon!.id;
  }

  const totalCents = Math.max(0, subtotalCents - discountCents);
  const code = await nextCode();

  const order = await prisma.order.create({
    data: {
      code,
      customerName: data.customerName,
      phone: data.phone,
      email: data.email || null,
      district: data.deliveryMethod === "DELIVERY" ? data.district || null : null,
      address: data.deliveryMethod === "DELIVERY" ? data.address || null : null,
      deliveryMethod: data.deliveryMethod,
      docType: data.docType,
      docNumber: data.docNumber || null,
      businessName: data.docType === "FACTURA" ? data.businessName || null : null,
      fiscalAddress: data.docType === "FACTURA" ? data.fiscalAddress || null : null,
      note: data.note || null,
      channel: data.channel,
      status: "PENDIENTE",
      subtotalCents,
      shippingCents: 0,
      couponCode,
      discountCents,
      totalCents,
      items: { create: lines },
    },
    include: { items: true },
  });

  if (couponId) {
    await prisma.coupon.update({ where: { id: couponId }, data: { usedCount: { increment: 1 } } }).catch(() => {});
  }

  return NextResponse.json({ code: order.code, id: order.id, totalCents: order.totalCents });
}
