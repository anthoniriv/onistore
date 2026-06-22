"use client";

import Link from "next/link";
import { useState, useTransition } from "react";
import { Pencil, Trash2, Eye, EyeOff, Loader2 } from "lucide-react";
import { deleteProduct, toggleProductActive } from "@/app/admin/actions";

export function ProductRowActions({ id, active }: { id: string; active: boolean }) {
  const [pending, start] = useTransition();
  const [confirm, setConfirm] = useState(false);

  return (
    <div className="flex items-center justify-end gap-1">
      <button
        onClick={() => start(() => toggleProductActive(id, !active))}
        title={active ? "Ocultar" : "Mostrar"}
        className="grid h-8 w-8 place-items-center rounded text-oni-ash hover:text-oni-bone"
      >
        {active ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
      </button>
      <Link href={`/admin/productos/${id}`} title="Editar" className="grid h-8 w-8 place-items-center rounded text-oni-ash hover:text-oni-bone">
        <Pencil className="h-4 w-4" />
      </Link>
      {confirm ? (
        <button
          onClick={() => start(() => deleteProduct(id))}
          className="rounded bg-oni-red px-2 py-1 text-xs text-white"
        >
          {pending ? <Loader2 className="h-3 w-3 animate-spin" /> : "¿Borrar?"}
        </button>
      ) : (
        <button onClick={() => setConfirm(true)} title="Eliminar" className="grid h-8 w-8 place-items-center rounded text-oni-ash hover:text-oni-red">
          <Trash2 className="h-4 w-4" />
        </button>
      )}
    </div>
  );
}
