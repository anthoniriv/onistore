import Link from "next/link";
import { Plus } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { ProductsManager } from "@/components/admin/products-manager";

export const dynamic = "force-dynamic";

export default async function AdminProductos() {
  const [products, categories] = await Promise.all([
    prisma.product.findMany({
      orderBy: { createdAt: "desc" },
      include: { category: true, images: { take: 1, orderBy: { order: "asc" } } },
    }),
    prisma.category.findMany({ orderBy: { order: "asc" } }),
  ]);

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="font-display text-3xl">Productos <span className="text-base text-oni-ash">({products.length})</span></h1>
        <Link href="/admin/productos/nuevo" className="flex items-center gap-2 rounded-md bg-oni-red px-4 py-2.5 font-semibold text-white hover:bg-oni-red-dark">
          <Plus className="h-4 w-4" /> Nuevo
        </Link>
      </div>

      <ProductsManager products={products} categories={categories} />
    </div>
  );
}
