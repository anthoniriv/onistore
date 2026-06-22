import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronLeft } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { getCategories, getGenres } from "@/lib/queries";
import { ProductForm } from "@/components/admin/product-form";

export default async function EditarProducto({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [product, categories, genres] = await Promise.all([
    prisma.product.findUnique({ where: { id }, include: { images: { orderBy: { order: "asc" } }, genres: true } }),
    getCategories(),
    getGenres(),
  ]);
  if (!product) notFound();

  return (
    <div>
      <Link href="/admin/productos" className="mb-3 inline-flex items-center gap-1 text-sm text-oni-ash hover:text-oni-red">
        <ChevronLeft className="h-4 w-4" /> Volver
      </Link>
      <h1 className="mb-5 font-display text-3xl">Editar producto</h1>
      <ProductForm categories={categories} genres={genres} initial={product} />
    </div>
  );
}
