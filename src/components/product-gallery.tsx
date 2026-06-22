"use client";

import { useState } from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";

export function ProductGallery({ images, name }: { images: { url: string; alt: string | null }[]; name: string }) {
  const list = images.length ? images : [{ url: "/placeholders/p1.svg", alt: name }];
  const [active, setActive] = useState(0);
  const isSvg = (u: string) => u.endsWith(".svg");

  return (
    <div>
      <div className="relative aspect-square overflow-hidden rounded-oni border border-oni-line bg-oni-surface">
        <Image
          src={list[active].url}
          alt={list[active].alt ?? name}
          fill
          priority
          unoptimized={isSvg(list[active].url)}
          sizes="(max-width: 768px) 100vw, 50vw"
          className="object-contain p-2"
        />
      </div>
      {list.length > 1 && (
        <div className="no-scrollbar mt-3 flex gap-2 overflow-x-auto">
          {list.map((im, i) => (
            <button
              key={i}
              onClick={() => setActive(i)}
              aria-label={`Ver imagen ${i + 1}`}
              className={cn(
                "relative h-16 w-16 shrink-0 overflow-hidden rounded-md border bg-oni-surface",
                i === active ? "border-oni-red" : "border-oni-line"
              )}
            >
              <Image src={im.url} alt="" fill unoptimized={isSvg(im.url)} sizes="64px" className="object-contain p-1" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
