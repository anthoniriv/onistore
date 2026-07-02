"use client";

import { useActionState } from "react";
import { Lock, Loader2 } from "lucide-react";
import { OniMark } from "@/components/brand";
import { loginAction } from "../actions";

export default function AdminLogin() {
  const [error, action, pending] = useActionState(loginAction, null);

  return (
    <div className="grid min-h-screen place-items-center bg-oni-black px-4 oni-grain">
      <div className="w-full max-w-sm rounded-oni border border-oni-line bg-oni-ink p-6">
        <div className="flex flex-col items-center text-center">
          <OniMark className="h-14 w-14" />
          <h1 className="mt-3 font-display text-2xl text-oni-bone">Panel ONISTORE</h1>
          <p className="text-sm text-oni-ash">Acceso administrador</p>
        </div>

        <form action={action} className="mt-6 space-y-3">
          <input
            name="email"
            type="email"
            placeholder="correo@onistore.store"
            required
            className="h-11 w-full rounded-md border border-oni-line bg-oni-surface px-3 text-sm outline-none focus:border-oni-red"
          />
          <input
            name="password"
            type="password"
            placeholder="Contraseña"
            required
            className="h-11 w-full rounded-md border border-oni-line bg-oni-surface px-3 text-sm outline-none focus:border-oni-red"
          />
          {error && <p className="text-sm text-oni-red-soft">{error}</p>}
          <button
            type="submit"
            disabled={pending}
            className="flex h-11 w-full items-center justify-center gap-2 rounded-md bg-oni-red font-display tracking-wide text-white hover:bg-oni-red-dark disabled:opacity-60"
          >
            {pending ? <Loader2 className="h-5 w-5 animate-spin" /> : <><Lock className="h-4 w-4" /> Ingresar</>}
          </button>
        </form>
      </div>
    </div>
  );
}
