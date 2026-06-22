import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { getProductSuggestions } from "@/lib/queries";

export async function GET(req: Request) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const url = new URL(req.url);
  const q = url.searchParams.get("q") ?? "";
  const exclude = url.searchParams.get("exclude") ?? undefined;
  if (q.trim().length < 3) return NextResponse.json({ results: [] });

  const results = await getProductSuggestions(q, exclude);
  return NextResponse.json({ results });
}
