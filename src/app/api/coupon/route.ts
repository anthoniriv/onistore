import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { validateCoupon, normalizeCode } from "@/lib/coupon";

const schema = z.object({
  code: z.string().min(2).max(40),
  subtotalCents: z.number().int().min(0),
});

export async function POST(req: Request) {
  let data;
  try {
    data = schema.parse(await req.json());
  } catch {
    return NextResponse.json({ ok: false, error: "Datos inválidos" }, { status: 400 });
  }

  const code = normalizeCode(data.code);
  const coupon = await prisma.coupon.findUnique({ where: { code } });
  const result = validateCoupon(coupon, data.subtotalCents);

  if (!result.ok) return NextResponse.json({ ok: false, error: result.error }, { status: 200 });

  return NextResponse.json({
    ok: true,
    coupon: { code: coupon!.code, type: coupon!.type, value: coupon!.value, minSubtotalCents: coupon!.minSubtotalCents },
    discountCents: result.discountCents,
  });
}
