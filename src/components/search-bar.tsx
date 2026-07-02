"use client";

import { Search, X, Loader2 } from "lucide-react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { formatPrice } from "@/lib/utils";
import { useIsClient } from "@/lib/use-is-client";

type Result = { slug: string; name: string; anime: string | null; priceCents: number; image: string };

function useSearch() {
  const [q, setQ] = useState("");
  const [results, setResults] = useState<Result[]>([]);
  const [loading, setLoading] = useState(false);
  const pathname = usePathname();

  // Se limpia al cambiar de página
  useEffect(() => {
    queueMicrotask(() => {
      setQ("");
      setResults([]);
    });
  }, [pathname]);

  // Preview en vivo (debounced)
  useEffect(() => {
    const term = q.trim();
    if (term.length < 2) {
      const t = setTimeout(() => {
        setResults([]);
        setLoading(false);
      }, 0);
      return () => clearTimeout(t);
    }
    const ctrl = new AbortController();
    const t = setTimeout(async () => {
      try {
        setLoading(true);
        const res = await fetch(`/api/search?q=${encodeURIComponent(term)}`, { signal: ctrl.signal });
        const json = await res.json();
        setResults(json.results ?? []);
      } catch {
        /* abortado */
      } finally {
        setLoading(false);
      }
    }, 220);
    return () => {
      clearTimeout(t);
      ctrl.abort();
    };
  }, [q]);

  return { q, setQ, results, loading };
}

function Results({ results, loading, q, onPick }: { results: Result[]; loading: boolean; q: string; onPick: () => void }) {
  if (q.trim().length < 2) return null;
  return (
    <div className="overflow-hidden rounded-md border border-oni-line bg-oni-ink shadow-xl">
      {loading && results.length === 0 ? (
        <div className="flex items-center gap-2 p-4 text-sm text-oni-ash">
          <Loader2 className="h-4 w-4 animate-spin" /> Buscando...
        </div>
      ) : results.length === 0 ? (
        <div className="p-4 text-sm text-oni-ash">Sin resultados para “{q}”.</div>
      ) : (
        <>
          <ul className="max-h-80 overflow-y-auto">
            {results.map((r) => (
              <li key={r.slug}>
                <Link href={`/producto/${r.slug}`} onClick={onPick} className="flex items-center gap-3 px-3 py-2 hover:bg-oni-surface">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={r.image} alt="" className="h-11 w-11 shrink-0 rounded object-cover" />
                  <span className="min-w-0 flex-1">
                    {r.anime && <span className="block text-[11px] uppercase tracking-wide text-oni-gold">{r.anime}</span>}
                    <span className="line-clamp-1 text-sm text-oni-bone">{r.name}</span>
                  </span>
                  <span className="shrink-0 text-sm font-semibold text-oni-bone">{formatPrice(r.priceCents)}</span>
                </Link>
              </li>
            ))}
          </ul>
          <Link href={`/catalogo?q=${encodeURIComponent(q.trim())}`} onClick={onPick} className="block border-t border-oni-line px-3 py-2.5 text-center text-sm font-semibold text-oni-red hover:bg-oni-surface">
            Ver todos los resultados
          </Link>
        </>
      )}
    </div>
  );
}

export function SearchBar({ variant = "inline" }: { variant?: "inline" | "icon" }) {
  const router = useRouter();
  const { q, setQ, results, loading } = useSearch();
  const [open, setOpen] = useState(false); // overlay mobile
  const [focused, setFocused] = useState(false); // dropdown desktop
  const mounted = useIsClient();
  const boxRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (boxRef.current && !boxRef.current.contains(e.target as Node)) setFocused(false);
    }
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const term = q.trim();
    if (term) router.push(`/catalogo?q=${encodeURIComponent(term)}`);
    setOpen(false);
    setFocused(false);
  }

  // ---- Mobile: ícono + overlay ----
  if (variant === "icon") {
    return (
      <>
        <button aria-label="Buscar" onClick={() => setOpen(true)} className="grid h-10 w-10 place-items-center rounded-md text-oni-bone hover:text-oni-red">
          <Search className="h-5 w-5" />
        </button>
        {open && mounted && createPortal(
          <div className="fixed inset-0 z-[100] bg-oni-black/95 p-4 backdrop-blur">
            <form onSubmit={submit} className="mx-auto flex max-w-lg items-center gap-2">
              <input
                autoFocus
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Buscar figuras, manga, anime..."
                className="h-12 flex-1 rounded-md border border-oni-line bg-oni-ink px-4 text-oni-bone outline-none placeholder:text-oni-ash focus:border-oni-red"
              />
              <button type="button" onClick={() => setOpen(false)} aria-label="Cerrar" className="grid h-12 w-12 place-items-center text-oni-ash">
                <X className="h-6 w-6" />
              </button>
            </form>
            <div className="mx-auto mt-3 max-w-lg">
              <Results results={results} loading={loading} q={q} onPick={() => setTimeout(() => setOpen(false), 0)} />
            </div>
          </div>,
          document.body
        )}
      </>
    );
  }

  // ---- Desktop: input con dropdown ----
  return (
    <div ref={boxRef} className="relative w-full">
      <form onSubmit={submit} className="relative w-full">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-oni-ash" />
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          onFocus={() => setFocused(true)}
          placeholder="Buscar figuras, manga, anime..."
          className="h-10 w-full rounded-md border border-oni-line bg-oni-ink pl-9 pr-8 text-sm text-oni-bone outline-none placeholder:text-oni-ash focus:border-oni-red"
        />
        {q && (
          <button type="button" onClick={() => setQ("")} aria-label="Limpiar" className="absolute right-2 top-1/2 -translate-y-1/2 text-oni-ash hover:text-oni-bone">
            <X className="h-4 w-4" />
          </button>
        )}
      </form>
      {focused && (
        <div className="absolute left-0 right-0 top-12 z-[60]">
          <Results results={results} loading={loading} q={q} onPick={() => setTimeout(() => setFocused(false), 0)} />
        </div>
      )}
    </div>
  );
}
