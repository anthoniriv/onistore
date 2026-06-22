import { NextResponse } from "next/server";
import { searchProducts } from "@/lib/queries";

export async function GET(req: Request) {
  const q = new URL(req.url).searchParams.get("q") ?? "";
  if (q.trim().length < 2) return NextResponse.json({ results: [] });

  const products = await searchProducts(q, 6);
  const results = products.map((p) => ({
    slug: p.slug,
    name: p.name,
    anime: p.anime,
    priceCents: p.discountCents ?? p.priceCents,
    image: p.images[0]?.url ?? "/placeholders/p1.svg",
  }));
  return NextResponse.json({ results });
}
