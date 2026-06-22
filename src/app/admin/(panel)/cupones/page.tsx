import { prisma } from "@/lib/prisma";
import { CouponManager } from "@/components/admin/coupon-manager";

export const dynamic = "force-dynamic";

export default async function AdminCupones() {
  const rows = await prisma.coupon.findMany({ orderBy: { createdAt: "desc" } });
  const coupons = rows.map((c) => ({
    id: c.id,
    code: c.code,
    type: c.type,
    value: c.value,
    minSubtotalCents: c.minSubtotalCents,
    maxUses: c.maxUses,
    usedCount: c.usedCount,
    active: c.active,
    expiresAt: c.expiresAt ? c.expiresAt.toISOString() : null,
  }));
  return <CouponManager coupons={coupons} />;
}
