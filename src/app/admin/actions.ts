"use server";

import { redirect } from "next/navigation";
import { revalidatePath, revalidateTag } from "next/cache";
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
  tagIds: string[];
};

/** Crea (o reutiliza) un tag por nombre y lo devuelve. Para asignar al vuelo desde el form. */
export async function createTag(name: string) {
  await requireAdmin();
  const clean = name.trim();
  if (clean.length < 2) throw new Error("Nombre de tag muy corto");
  const slug = slugify(clean);
  const tag = await prisma.tag.upsert({
    where: { slug },
    update: {},
    create: { slug, name: clean },
    select: { id: true, name: true },
  });
  revalidateTag("tags", "max");
  return tag;
}

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
    await prisma.productTag.deleteMany({ where: { productId: input.id } });
    if (input.tagIds.length)
      await prisma.productTag.createMany({
        data: input.tagIds.map((tagId) => ({ productId: input.id!, tagId })),
      });
  } else {
    const slug = `${slugify(input.name)}-${Date.now().toString(36)}`;
    await prisma.product.create({
      data: {
        ...data,
        slug,
        images: { create: input.images.map((url, i) => ({ url, order: i })) },
        genres: { create: input.genreIds.map((genreId) => ({ genreId })) },
        tags: { create: input.tagIds.map((tagId) => ({ tagId })) },
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

// --- Acciones masivas de productos ---

function revalidateCatalog() {
  revalidatePath("/admin/productos");
  revalidatePath("/catalogo");
  revalidatePath("/");
}

export async function deleteProducts(ids: string[]) {
  await requireAdmin();
  if (!ids.length) return;
  await prisma.product.deleteMany({ where: { id: { in: ids } } });
  revalidateCatalog();
}

export async function setProductsActive(ids: string[], active: boolean) {
  await requireAdmin();
  if (!ids.length) return;
  await prisma.product.updateMany({ where: { id: { in: ids } }, data: { active } });
  revalidateCatalog();
}

export async function setProductsCategory(ids: string[], categoryId: string) {
  await requireAdmin();
  if (!ids.length || !categoryId) return;
  await prisma.product.updateMany({ where: { id: { in: ids } }, data: { categoryId } });
  revalidateCatalog();
}

export async function setProductsCondition(ids: string[], condition: string) {
  await requireAdmin();
  if (!ids.length || !condition) return;
  await prisma.product.updateMany({ where: { id: { in: ids } }, data: { condition } });
  revalidateCatalog();
}

export async function setProductsChancadito(ids: string[], isChancadito: boolean) {
  await requireAdmin();
  if (!ids.length) return;
  await prisma.product.updateMany({ where: { id: { in: ids } }, data: { isChancadito } });
  revalidateCatalog();
}

// ----------------------------- Pedidos -----------------------------

export async function setOrderStatus(id: string, status: string) {
  await requireAdmin();
  await prisma.order.update({ where: { id }, data: { status } });
  revalidatePath("/admin/pedidos");
}

export async function deleteOrder(id: string) {
  await requireAdmin();
  await prisma.order.delete({ where: { id } }); // OrderItem se borra en cascada
  revalidatePath("/admin/pedidos");
  revalidatePath("/admin");
}

export async function deleteOrders(ids: string[]) {
  await requireAdmin();
  if (!ids.length) return;
  await prisma.order.deleteMany({ where: { id: { in: ids } } });
  revalidatePath("/admin/pedidos");
  revalidatePath("/admin");
}

export async function setOrdersStatus(ids: string[], status: string) {
  await requireAdmin();
  if (!ids.length) return;
  await prisma.order.updateMany({ where: { id: { in: ids } }, data: { status } });
  revalidatePath("/admin/pedidos");
  revalidatePath("/admin");
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
  showText: boolean;
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
    showText: input.showText,
  };
  if (input.id) await prisma.banner.update({ where: { id: input.id }, data });
  else await prisma.banner.create({ data });
  revalidateTag("banners", "max");
  revalidatePath("/admin/banners");
  revalidatePath("/");
}

export async function deleteBanner(id: string) {
  await requireAdmin();
  await prisma.banner.delete({ where: { id } });
  revalidateTag("banners", "max");
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
