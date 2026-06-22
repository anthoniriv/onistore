import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";

const schema = z.object({
  name: z.string().min(2).max(80),
  phone: z.string().max(20).optional(),
  email: z.string().email().optional().or(z.literal("")),
  subject: z.string().max(120).optional(),
  body: z.string().min(3).max(1000),
});

export async function POST(req: Request) {
  let data;
  try {
    data = schema.parse(await req.json());
  } catch {
    return NextResponse.json({ error: "Datos inválidos" }, { status: 400 });
  }
  await prisma.message.create({
    data: {
      name: data.name,
      phone: data.phone || null,
      email: data.email || null,
      subject: data.subject || null,
      body: data.body,
    },
  });
  return NextResponse.json({ ok: true });
}
