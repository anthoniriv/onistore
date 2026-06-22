"use client";

import { useState } from "react";
import { Loader2, CheckCircle2 } from "lucide-react";

export function ContactForm() {
  const [form, setForm] = useState({ name: "", phone: "", email: "", subject: "", body: "" });
  const [state, setState] = useState<"idle" | "loading" | "done" | "error">("idle");
  const [error, setError] = useState("");

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setState("loading");
    const res = await fetch("/api/messages", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    if (res.ok) setState("done");
    else {
      const j = await res.json().catch(() => ({}));
      setError(j.error || "No se pudo enviar");
      setState("error");
    }
  }

  if (state === "done") {
    return (
      <div className="flex flex-col items-center gap-2 py-8 text-center">
        <CheckCircle2 className="h-12 w-12 text-emerald-500" />
        <p className="font-display text-xl">¡Mensaje enviado!</p>
        <p className="text-sm text-oni-ash">Te responderemos pronto por WhatsApp o correo.</p>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="space-y-3">
      <Input placeholder="Tu nombre *" value={form.name} onChange={set("name")} required />
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <Input placeholder="WhatsApp" value={form.phone} onChange={set("phone")} />
        <Input placeholder="Correo (opcional)" type="email" value={form.email} onChange={set("email")} />
      </div>
      <Input placeholder="Asunto" value={form.subject} onChange={set("subject")} />
      <textarea
        placeholder="¿Qué buscas? *"
        value={form.body}
        onChange={set("body")}
        required
        rows={4}
        className="w-full rounded-md border border-oni-line bg-oni-surface p-3 text-sm outline-none focus:border-oni-red"
      />
      {error && <p className="text-sm text-oni-red-soft">{error}</p>}
      <button
        type="submit"
        disabled={state === "loading"}
        className="flex h-12 w-full items-center justify-center gap-2 rounded-md bg-oni-red font-display text-lg tracking-wide text-white hover:bg-oni-red-dark disabled:opacity-60"
      >
        {state === "loading" ? <Loader2 className="h-5 w-5 animate-spin" /> : "Enviar mensaje"}
      </button>
    </form>
  );
}

function Input(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      className="h-11 w-full rounded-md border border-oni-line bg-oni-surface px-3 text-sm outline-none focus:border-oni-red"
    />
  );
}
