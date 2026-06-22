import Link from "next/link";
import { Plus } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { formatPrice, CONDITION_LABEL } from "@/lib/utils";
import { ProductRowActions } from "@/components/admin/product-row-actions";

export const dynamic = "force-dynamic";

export default async function AdminProductos() {
  const products = await prisma.product.findMany({
    orderBy: { createdAt: "desc" },
    include: { category: true, images: { take: 1, orderBy: { order: "asc" } } },
  });

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="font-display text-3xl">Productos <span className="text-base text-oni-ash">({products.length})</span></h1>
        <Link href="/admin/productos/nuevo" className="flex items-center gap-2 rounded-md bg-oni-red px-4 py-2.5 font-semibold text-white hover:bg-oni-red-dark">
          <Plus className="h-4 w-4" /> Nuevo
        </Link>
      </div>

      <div className="mt-5 overflow-hidden rounded-oni border border-oni-line">
        <table className="w-full text-sm">
          <thead className="bg-oni-ink text-left text-xs uppercase tracking-wide text-oni-ash">
            <tr>
              <th className="p-3">Producto</th>
              <th className="hidden p-3 sm:table-cell">Categoría</th>
              <th className="hidden p-3 md:table-cell">Condición</th>
              <th className="p-3">Precio</th>
              <th className="p-3 text-center">Stock</th>
              <th className="p-3 text-right">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-oni-line bg-oni-black">
            {products.map((p) => (
              <tr key={p.id} className={p.active ? "" : "opacity-50"}>
                <td className="p-3">
                  <div className="flex items-center gap-3">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={p.images[0]?.url ?? "/placeholders/p1.svg"} alt="" className="h-12 w-12 shrink-0 rounded object-cover" />
                    <div>
                      <p className="line-clamp-1 font-medium text-oni-bone">{p.name}</p>
                      <p className="flex gap-1 text-xs text-oni-ash">
                        {p.featured && <span className="text-oni-gold">★ destacado</span>}
                        {p.isChancadito && <span className="text-oni-red">chancadito</span>}
                      </p>
                    </div>
                  </div>
                </td>
                <td className="hidden p-3 text-oni-ash sm:table-cell">{p.category.name}</td>
                <td className="hidden p-3 text-oni-ash md:table-cell">{CONDITION_LABEL[p.condition]}</td>
                <td className="p-3 font-medium text-oni-bone">
                  {formatPrice(p.discountCents ?? p.priceCents)}
                  {p.discountCents && <span className="ml-1 text-xs text-oni-ash line-through">{formatPrice(p.priceCents)}</span>}
                </td>
                <td className="p-3 text-center"><span className={p.stock === 0 ? "text-oni-red" : p.stock <= 2 ? "text-oni-gold" : "text-oni-bone"}>{p.stock}</span></td>
                <td className="p-3"><ProductRowActions id={p.id} active={p.active} /></td>
              </tr>
            ))}
          </tbody>
        </table>
        {products.length === 0 && <p className="p-8 text-center text-oni-ash">Sin productos. Crea el primero.</p>}
      </div>
    </div>
  );
}
