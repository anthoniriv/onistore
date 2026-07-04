import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { getCategories, getGenres, getTags } from "@/lib/queries";
import { ProductForm } from "@/components/admin/product-form";

export default async function NuevoProducto() {
  const [categories, genres, tags] = await Promise.all([getCategories(), getGenres(), getTags()]);
  return (
    <div>
      <Link href="/admin/productos" className="mb-3 inline-flex items-center gap-1 text-sm text-oni-ash hover:text-oni-red">
        <ChevronLeft className="h-4 w-4" /> Volver
      </Link>
      <h1 className="mb-5 font-display text-3xl">Nuevo producto</h1>
      <ProductForm categories={categories} genres={genres} tags={tags} />
    </div>
  );
}
