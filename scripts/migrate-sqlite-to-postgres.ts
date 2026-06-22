import { execFileSync } from "node:child_process";
import path from "node:path";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
const dbPath = path.resolve("prisma/dev.db");

type Row = Record<string, unknown>;

function readTable(table: string): Row[] {
  const output = execFileSync("sqlite3", [dbPath, "-json", `select * from "${table}"`], {
    encoding: "utf8",
  }).trim();
  return output ? JSON.parse(output) : [];
}

function bool(value: unknown) {
  return value === true || value === 1 || value === "1";
}

function date(value: unknown) {
  if (!value) return undefined;
  if (typeof value === "number") return new Date(value);
  const numeric = Number(value);
  return Number.isFinite(numeric) ? new Date(numeric) : new Date(String(value));
}

function withDates<T extends Row>(row: T, fields: string[]) {
  const next = { ...row };
  for (const field of fields) {
    if (field in next) next[field] = date(next[field]);
  }
  return next;
}

function withBools<T extends Row>(row: T, fields: string[]) {
  const next = { ...row };
  for (const field of fields) {
    if (field in next) next[field] = bool(next[field]);
  }
  return next;
}

async function main() {
  const category = readTable("Category").map((r) => withDates(r, ["createdAt"]));
  const tag = readTable("Tag");
  const genre = readTable("Genre");
  const product = readTable("Product").map((r) =>
    withBools(withDates(r, ["createdAt", "updatedAt"]), ["featured", "isNew", "isChancadito", "active"])
  );
  const productImage = readTable("ProductImage");
  const productTag = readTable("ProductTag");
  const productGenre = readTable("ProductGenre");
  const banner = readTable("Banner").map((r) => withBools(withDates(r, ["createdAt"]), ["active"]));
  const coupon = readTable("Coupon").map((r) => withBools(withDates(r, ["expiresAt", "createdAt"]), ["active"]));
  const adminUser = readTable("AdminUser").map((r) => withDates(r, ["createdAt"]));
  const message = readTable("Message").map((r) => withDates(r, ["createdAt"]));
  const order = readTable("Order").map((r) => withDates(r, ["createdAt", "updatedAt"]));
  const orderItem = readTable("OrderItem");

  await prisma.$transaction(
    async (tx) => {
      await tx.orderItem.deleteMany();
      await tx.order.deleteMany();
      await tx.productTag.deleteMany();
      await tx.productGenre.deleteMany();
      await tx.productImage.deleteMany();
      await tx.product.deleteMany();
      await tx.tag.deleteMany();
      await tx.genre.deleteMany();
      await tx.category.deleteMany();
      await tx.banner.deleteMany();
      await tx.message.deleteMany();
      await tx.coupon.deleteMany();
      await tx.adminUser.deleteMany();

      if (category.length) await tx.category.createMany({ data: category });
      if (tag.length) await tx.tag.createMany({ data: tag });
      if (genre.length) await tx.genre.createMany({ data: genre });
      if (product.length) await tx.product.createMany({ data: product });
      if (productImage.length) await tx.productImage.createMany({ data: productImage });
      if (productTag.length) await tx.productTag.createMany({ data: productTag });
      if (productGenre.length) await tx.productGenre.createMany({ data: productGenre });
      if (banner.length) await tx.banner.createMany({ data: banner });
      if (coupon.length) await tx.coupon.createMany({ data: coupon });
      if (adminUser.length) await tx.adminUser.createMany({ data: adminUser });
      if (message.length) await tx.message.createMany({ data: message });
      if (order.length) await tx.order.createMany({ data: order });
      if (orderItem.length) await tx.orderItem.createMany({ data: orderItem });
    },
    { timeout: 60_000 }
  );

  console.log(
    JSON.stringify({
      categories: category.length,
      products: product.length,
      images: productImage.length,
      banners: banner.length,
      coupons: coupon.length,
      orders: order.length,
      messages: message.length,
      admins: adminUser.length,
    })
  );
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
