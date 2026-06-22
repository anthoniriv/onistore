import { prisma } from "@/lib/prisma";
import { BannerManager } from "@/components/admin/banner-manager";

export const dynamic = "force-dynamic";

export default async function AdminBanners() {
  const banners = await prisma.banner.findMany({ orderBy: { order: "asc" } });
  return <BannerManager banners={banners} />;
}
