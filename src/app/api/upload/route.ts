import { NextResponse } from "next/server";
import { randomUUID } from "node:crypto";
import { put } from "@vercel/blob";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

const MAX = 6 * 1024 * 1024; // 6MB
const OK = ["image/jpeg", "image/png", "image/webp", "image/gif"];

// Almacenamiento en Vercel Blob (el filesystem de Vercel es de solo lectura).
// Requiere BLOB_READ_WRITE_TOKEN (se provisiona al crear el Blob store).
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
  const filename = `uploads/${randomUUID()}.${ext}`;

  let url: string;
  try {
    const blob = await put(filename, file, { access: "public", contentType: file.type });
    url = blob.url;
  } catch (e) {
    console.error("[upload] blob put failed", e);
    return NextResponse.json({ error: "No se pudo subir la imagen. Revisa la configuración de almacenamiento." }, { status: 500 });
  }

  if (typeof orderId === "string" && orderId) {
    await prisma.order.update({ where: { id: orderId }, data: { paymentProofUrl: url } }).catch(() => {});
  }

  return NextResponse.json({ url });
}
