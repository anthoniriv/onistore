import { Mail, Phone } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { MessageActions } from "@/components/admin/message-actions";

export const dynamic = "force-dynamic";

export default async function AdminMensajes() {
  const messages = await prisma.message.findMany({ orderBy: { createdAt: "desc" } });

  return (
    <div>
      <h1 className="font-display text-3xl">Mensajes <span className="text-base text-oni-ash">({messages.length})</span></h1>

      {messages.length === 0 ? (
        <p className="mt-8 rounded-oni border border-oni-line bg-oni-ink py-16 text-center text-oni-ash">Sin mensajes por ahora.</p>
      ) : (
        <div className="mt-5 space-y-3">
          {messages.map((m) => (
            <div key={m.id} className={`rounded-oni border bg-oni-ink p-4 ${m.status === "NUEVO" ? "border-oni-red/50" : "border-oni-line"}`}>
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="font-semibold text-oni-bone">
                    {m.name}
                    {m.status === "NUEVO" && <span className="ml-2 rounded bg-oni-red px-1.5 py-0.5 text-[10px] font-bold text-white">NUEVO</span>}
                  </p>
                  <div className="mt-0.5 flex flex-wrap gap-3 text-xs text-oni-ash">
                    {m.phone && <span className="flex items-center gap-1"><Phone className="h-3 w-3" /> {m.phone}</span>}
                    {m.email && <span className="flex items-center gap-1"><Mail className="h-3 w-3" /> {m.email}</span>}
                    <span>{new Date(m.createdAt).toLocaleString("es-PE", { dateStyle: "medium", timeStyle: "short" })}</span>
                  </div>
                </div>
                <MessageActions id={m.id} status={m.status} />
              </div>
              {m.subject && <p className="mt-2 text-sm font-medium text-oni-bone">{m.subject}</p>}
              <p className="mt-1 whitespace-pre-line text-sm text-oni-ash">{m.body}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
