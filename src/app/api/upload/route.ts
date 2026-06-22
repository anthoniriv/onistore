import { NextResponse } from "next/server";
import { writeFile, mkdir } from "node:fs/promises";
import path from "node:path";
import { randomUUID } from "node:crypto";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

const MAX = 6 * 1024 * 1024; // 6MB
const OK = ["image/jpeg", "image/png", "image/webp", "image/gif"];

// NOTA PROD: en Vercel el filesystem es de solo lectura. Para producción,
// reemplazar este guardado local por @vercel/blob (put). El resto del flujo
// (guardar la URL devuelta) no cambia.
export async function POST(req: Request) {
  const form = await req.formData();
  const file = form.get("file");
  const orderId = form.get("orderId");

  if (!(file instanceof File)) {
    return NextResponse.json({ error: "Falta el archivo" }, { status: 400 });
  }
  if (!OK.includes(file.type)) {
    return NextResponse.json({ error: "Formato no permitido (usa JPG, PNG o WEBP)" }, { status: 400 });
  }
  if (file.size > MAX) {
    return NextResponse.json({ error: "Imagen muy pesada (máx 6MB)" }, { status: 400 });
  }

  const ext = file.name.split(".").pop()?.toLowerCase().replace(/[^a-z0-9]/g, "") || "jpg";
  const filename = `${randomUUID()}.${ext}`;
  const dir = path.join(process.cwd(), "public", "uploads");
  await mkdir(dir, { recursive: true });
  await writeFile(path.join(dir, filename), Buffer.from(await file.arrayBuffer()));
  const url = `/uploads/${filename}`;

  if (typeof orderId === "string" && orderId) {
    await prisma.order.update({ where: { id: orderId }, data: { paymentProofUrl: url } }).catch(() => {});
  }

  return NextResponse.json({ url });
}
