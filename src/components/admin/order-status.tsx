"use client";

import { useTransition } from "react";
import { ORDER_STATUS, STATUS_LABEL } from "@/lib/utils";
import { setOrderStatus } from "@/app/admin/actions";

const COLOR: Record<string, string> = {
  PENDIENTE: "border-oni-red text-oni-red",
  PAGADO: "border-emerald-500 text-emerald-400",
  PREPARANDO: "border-sky-500 text-sky-400",
  ENVIADO: "border-purple-500 text-purple-400",
  ENTREGADO: "border-oni-gold text-oni-gold",
  CANCELADO: "border-oni-line text-oni-ash",
};

export function OrderStatus({ id, status }: { id: string; status: string }) {
  const [pending, start] = useTransition();
  return (
    <select
      value={status}
      disabled={pending}
      onChange={(e) => start(() => setOrderStatus(id, e.target.value))}
      className={`rounded-md border bg-oni-surface px-2 py-1.5 text-xs font-semibold outline-none ${COLOR[status] ?? "border-oni-line"}`}
    >
      {ORDER_STATUS.map((s) => (
        <option key={s} value={s} className="bg-oni-ink text-oni-bone">{STATUS_LABEL[s]}</option>
      ))}
    </select>
  );
}
