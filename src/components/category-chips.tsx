import Link from "next/link";
import { Swords, BookOpen, Disc, Disc3, Sparkles, Bookmark, LayoutGrid, type LucideIcon } from "lucide-react";

const ICONS: Record<string, LucideIcon> = {
  Swords,
  BookOpen,
  Disc,
  Disc3,
  Sparkles,
  Bookmark,
};

type Cat = { slug: string; name: string; icon: string | null };

export function CategoryChips({ categories }: { categories: Cat[] }) {
  return (
    <div className="no-scrollbar -mx-4 flex gap-2.5 overflow-x-auto px-4 sm:mx-0 sm:flex-wrap sm:px-0">
      <Link
        href="/catalogo"
        className="flex shrink-0 items-center gap-2 rounded-full border border-oni-line bg-oni-ink px-4 py-2 text-sm font-medium text-oni-bone hover:border-oni-red"
      >
        <LayoutGrid className="h-4 w-4 text-oni-red" /> Todo
      </Link>
      {categories.map((c) => {
        const Icon = (c.icon && ICONS[c.icon]) || Sparkles;
        return (
          <Link
            key={c.slug}
            href={`/catalogo?category=${c.slug}`}
            className="flex shrink-0 items-center gap-2 rounded-full border border-oni-line bg-oni-ink px-4 py-2 text-sm font-medium text-oni-bone hover:border-oni-red"
          >
            <Icon className="h-4 w-4 text-oni-red" /> {c.name}
          </Link>
        );
      })}
    </div>
  );
}
