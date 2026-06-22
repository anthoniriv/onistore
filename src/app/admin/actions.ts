"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { createSession, destroySession, getSession } from "@/lib/auth";
import { slugify } from "@/lib/utils";
import { normalizeCode } from "@/lib/coupon";

async function requireAdmin() {
  const s = await getSession();
  if (!s) redirect("/admin/login");
  return s;
}

// ----------------------------- Auth -----------------------------

export async function loginAction(_prev: string | null, formData: FormData): Promise<string | null> {
  const email = String(formData.get("email") || "").trim().toLowerCase();
  const password = String(formData.get("password") || "");
  const user = await prisma.adminUser.findUnique({ where: { email } });
  if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
    return "Credenciales incorrectas";
  }
  await createSession({ uid: user.id, email: user.email, name: user.name });
  redirect("/admin");
}

export async function logoutAction() {
  await destroySession();
  redirect("/admin/login");
}

// ----------------------------- Productos -----------------------------

type ProductInput = {
  id?: string;
  name: string;
  description: string;
  anime?: string;
  brand?: string;
  sku?: string;
  subcategory?: string;
  seoTitle?: string;
  seoDescription?: string;
  categoryId: string;
  priceSoles: number;
  discountSoles?: number | null;
  condition: string;
  stock: number;
  featured: boolean;
  isNew: boolean;
  isChancadito: boolean;
  chancaditoReason?: string;
  active: boolean;
  images: string[]; // urls
  genreIds: string[];
};

export async function saveProduct(input: ProductInput) {
  await requireAdmin();
  const data = {
    name: input.name,
    description: input.description,
    anime: input.anime || null,
    brand: input.brand || null,
    sku: input.sku || null,
    subcategory: input.subcategory || null,
    seoTitle: input.seoTitle || null,
    seoDescription: input.seoDescription || null,
    categoryId: input.categoryId,
    priceCents: Math.round(input.priceSoles * 100),
    discountCents: input.discountSoles ? Math.round(input.discountSoles * 100) : null,
    condition: input.condition,
    stock: input.stock,
    featured: input.featured,
    isNew: input.isNew,
    isChancadito: input.isChancadito,
    chancaditoReason: input.chancaditoReason || null,
    active: input.active,
  };

  if (input.id) {
    await prisma.product.update({ where: { id: input.id }, data });
    await prisma.productImage.deleteMany({ where: { productId: input.id } });
    if (input.images.length)
      await prisma.productImage.createMany({
        data: input.images.map((url, i) => ({ productId: input.id!, url, order: i })),
      });
    await prisma.productGenre.deleteMany({ where: { productId: input.id } });
    if (input.genreIds.length)
      await prisma.productGenre.createMany({
        data: input.genreIds.map((genreId) => ({ productId: input.id!, genreId })),
      });
  } else {
    const slug = `${slugify(input.name)}-${Date.now().toString(36)}`;
    await prisma.product.create({
      data: {
        ...data,
        slug,
        images: { create: input.images.map((url, i) => ({ url, order: i })) },
        genres: { create: input.genreIds.map((genreId) => ({ genreId })) },
      },
    });
  }
  revalidatePath("/admin/productos");
  revalidatePath("/catalogo");
  revalidatePath("/");
}

export async function deleteProduct(id: string) {
  await requireAdmin();
  await prisma.product.delete({ where: { id } });
  revalidatePath("/admin/productos");
  revalidatePath("/catalogo");
}

export async function toggleProductActive(id: string, active: boolean) {
  await requireAdmin();
  await prisma.product.update({ where: { id }, data: { active } });
  revalidatePath("/admin/productos");
}

// ----------------------------- Pedidos -----------------------------

export async function setOrderStatus(id: string, status: string) {
  await requireAdmin();
  await prisma.order.update({ where: { id }, data: { status } });
  revalidatePath("/admin/pedidos");
}

// ----------------------------- Banners -----------------------------

export async function saveBanner(input: {
  id?: string;
  title: string;
  subtitle?: string;
  imageUrl: string;
  ctaText?: string;
  ctaHref?: string;
  order: number;
  active: boolean;
}) {
  await requireAdmin();
  const data = {
    title: input.title,
    subtitle: input.subtitle || null,
    imageUrl: input.imageUrl,
    ctaText: input.ctaText || null,
    ctaHref: input.ctaHref || null,
    order: input.order,
    active: input.active,
  };
  if (input.id) await prisma.banner.update({ where: { id: input.id }, data });
  else await prisma.banner.create({ data });
  revalidatePath("/admin/banners");
  revalidatePath("/");
}

export async function deleteBanner(id: string) {
  await requireAdmin();
  await prisma.banner.delete({ where: { id } });
  revalidatePath("/admin/banners");
  revalidatePath("/");
}

// ----------------------------- Mensajes -----------------------------

export async function setMessageStatus(id: string, status: string) {
  await requireAdmin();
  await prisma.message.update({ where: { id }, data: { status } });
  revalidatePath("/admin/mensajes");
}

// ----------------------------- Cupones -----------------------------

export async function saveCoupon(input: {
  id?: string;
  code: string;
  type: "PERCENT" | "FIXED";
  value: number; // PERCENT: % · FIXED: soles
  minSubtotalSoles: number;
  maxUses: number | null;
  active: boolean;
  expiresAt: string | null; // yyyy-mm-dd o null
}): Promise<string | null> {
  await requireAdmin();
  const code = normalizeCode(input.code);
  if (!code) return "El código es obligatorio";
  const data = {
    code,
    type: input.type,
    value: input.type === "FIXED" ? Math.round(input.value * 100) : Math.round(input.value),
    minSubtotalCents: Math.round((input.minSubtotalSoles || 0) * 100),
    maxUses: input.maxUses && input.maxUses > 0 ? input.maxUses : null,
    active: input.active,
    expiresAt: input.expiresAt ? new Date(input.expiresAt) : null,
  };
  try {
    if (input.id) await prisma.coupon.update({ where: { id: input.id }, data });
    else await prisma.coupon.create({ data });
  } catch {
    return "Ya existe un cupón con ese código";
  }
  revalidatePath("/admin/cupones");
  return null;
}

export async function deleteCoupon(id: string) {
  await requireAdmin();
  await prisma.coupon.delete({ where: { id } });
  revalidatePath("/admin/cupones");
}

export async function toggleCouponActive(id: string, active: boolean) {
  await requireAdmin();
  await prisma.coupon.update({ where: { id }, data: { active } });
  revalidatePath("/admin/cupones");
}

export async function deleteMessage(id: string) {
  await requireAdmin();
  await prisma.message.delete({ where: { id } });
  revalidatePath("/admin/mensajes");
}
