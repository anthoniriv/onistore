"use client";

import { useTransition } from "react";
import { Trash2, Loader2 } from "lucide-react";
import { setMessageStatus, deleteMessage } from "@/app/admin/actions";

export function MessageActions({ id, status }: { id: string; status: string }) {
  const [pending, start] = useTransition();
  return (
    <div className="flex items-center gap-2">
      <select
        value={status}
        disabled={pending}
        onChange={(e) => start(() => setMessageStatus(id, e.target.value))}
        className="rounded-md border border-oni-line bg-oni-surface px-2 py-1 text-xs outline-none"
      >
        <option value="NUEVO">Nuevo</option>
        <option value="LEIDO">Leído</option>
        <option value="RESPONDIDO">Respondido</option>
      </select>
      <button onClick={() => start(() => deleteMessage(id))} className="grid h-7 w-7 place-items-center text-oni-ash hover:text-oni-red">
        {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
      </button>
    </div>
  );
}
