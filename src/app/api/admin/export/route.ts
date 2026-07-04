import ExcelJS from "exceljs";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { CONDITION_LABEL } from "@/lib/utils";

export const dynamic = "force-dynamic";

const NO_BRAND = "Sin editorial";
const soles = (cents: number) => Number((cents / 100).toFixed(2));
const calidad = (condition: string) => CONDITION_LABEL[condition] ?? condition;

// Paleta ONISTORE (ARGB para ExcelJS)
const INK = "FF1E1A30"; // Kage — fondo de header
const GOLD = "FFC4A84A"; // Inca Gold — texto de header
const ZEBRA = "FFF5F1EA"; // fila alterna muy clara
const LINE = "FFD9D2C4"; // borde suave

export async function GET(req: Request) {
  const session = await getSession();
  if (!session) return new Response("No autorizado", { status: 401 });

  const format = new URL(req.url).searchParams.get("format") === "json" ? "json" : "xlsx";

  const products = await prisma.product.findMany({
    orderBy: [{ brand: "asc" }, { name: "asc" }],
    select: { name: true, brand: true, condition: true, stock: true, priceCents: true, discountCents: true },
  });

  const groups = new Map<string, typeof products>();
  for (const p of products) {
    const key = p.brand?.trim() || NO_BRAND;
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key)!.push(p);
  }
  const editoriales = [...groups.keys()].sort((a, b) =>
    a === NO_BRAND ? 1 : b === NO_BRAND ? -1 : a.localeCompare(b)
  );

  const stamp = new Date().toISOString().slice(0, 10);

  // ---------- JSON ----------
  if (format === "json") {
    const out = editoriales.map((brand) => ({
      editorial: brand,
      productos: groups.get(brand)!.map((p) => ({
        producto: p.name,
        calidad: calidad(p.condition),
        stock: p.stock,
        precioSoles: soles(p.discountCents ?? p.priceCents),
      })),
    }));
    return new Response(JSON.stringify(out, null, 2), {
      headers: {
        "Content-Type": "application/json; charset=utf-8",
        "Content-Disposition": `attachment; filename="onistore-productos-${stamp}.json"`,
      },
    });
  }

  // ---------- XLSX estilizado ----------
  const wb = new ExcelJS.Workbook();
  wb.creator = "ONISTORE";
  wb.created = new Date();

  const thin = { style: "thin" as const, color: { argb: LINE } };
  const border = { top: thin, left: thin, bottom: thin, right: thin };

  const styleHeader = (row: ExcelJS.Row) => {
    row.height = 22;
    row.eachCell((cell) => {
      cell.font = { bold: true, color: { argb: GOLD }, size: 11 };
      cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: INK } };
      cell.alignment = { vertical: "middle" };
      cell.border = border;
    });
  };

  const autofitAndZebra = (ws: ExcelJS.Worksheet, numericCols: number[]) => {
    ws.columns.forEach((col) => {
      let max = 10;
      col.eachCell?.({ includeEmpty: false }, (cell) => {
        max = Math.max(max, String(cell.value ?? "").length + 2);
      });
      col.width = Math.min(max, 48);
    });
    ws.eachRow((row, i) => {
      if (i === 1) return;
      row.eachCell((cell, col) => {
        cell.border = border;
        cell.alignment = { vertical: "middle", horizontal: numericCols.includes(col) ? "right" : "left" };
        if (i % 2 === 0) cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: ZEBRA } };
      });
    });
    ws.views = [{ state: "frozen", ySplit: 1 }];
  };

  // Resumen
  const resumen = wb.addWorksheet("Resumen", { properties: { tabColor: { argb: GOLD } } });
  resumen.columns = [
    { header: "Editorial", key: "editorial" },
    { header: "Productos", key: "productos" },
    { header: "Stock total", key: "stock" },
    { header: "Valor stock (S/)", key: "valor" },
  ];
  for (const brand of editoriales) {
    const list = groups.get(brand)!;
    resumen.addRow({
      editorial: brand,
      productos: list.length,
      stock: list.reduce((n, p) => n + p.stock, 0),
      valor: Number(list.reduce((n, p) => n + p.stock * soles(p.discountCents ?? p.priceCents), 0).toFixed(2)),
    });
  }
  resumen.getColumn("valor").numFmt = '"S/ "#,##0.00';
  styleHeader(resumen.getRow(1));
  autofitAndZebra(resumen, [2, 3, 4]);

  // Una hoja por editorial
  const usedNames = new Set<string>(["Resumen"]);
  for (const brand of editoriales) {
    const base = brand.replace(/[\\/?*[\]:]/g, " ").trim().slice(0, 31) || "Editorial";
    let name = base;
    let i = 2;
    while (usedNames.has(name)) name = `${base.slice(0, 28)}~${i++}`;
    usedNames.add(name);

    const ws = wb.addWorksheet(name);
    ws.columns = [
      { header: "Producto", key: "producto" },
      { header: "Calidad", key: "calidad" },
      { header: "Stock", key: "stock" },
      { header: "Precio (S/)", key: "precio" },
    ];
    for (const p of groups.get(brand)!) {
      ws.addRow({
        producto: p.name,
        calidad: calidad(p.condition),
        stock: p.stock,
        precio: soles(p.discountCents ?? p.priceCents),
      });
    }
    ws.getColumn("precio").numFmt = '"S/ "#,##0.00';
    ws.autoFilter = "A1:D1";
    styleHeader(ws.getRow(1));
    autofitAndZebra(ws, [3, 4]);
  }

  const buf = await wb.xlsx.writeBuffer();
  return new Response(new Uint8Array(buf), {
    headers: {
      "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition": `attachment; filename="onistore-productos-${stamp}.xlsx"`,
    },
  });
}
