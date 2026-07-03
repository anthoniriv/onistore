"use client";

import { useState } from "react";
import { Tag, X, Loader2, Check } from "lucide-react";
import { useCart } from "@/lib/cart-store";
import { formatPrice } from "@/lib/utils";

export function CouponInput() {
  const coupon = useCart((s) => s.coupon);
  const subtotal = useCart((s) => s.subtotalCents());
  const discount = useCart((s) => s.discountCents());
  const apply = useCart((s) => s.applyCoupon);
  const removeCoupon = useCart((s) => s.removeCoupon);

  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function applyCode() {
    if (!code.trim() || loading) return;
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/coupon", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code, subtotalCents: subtotal }),
      });
      const json = await res.json();
      if (json.ok) {
        apply(json.coupon);
        setCode("");
      } else {
        setError(json.error || "Cupón inválido");
      }
    } catch {
      setError("No se pudo validar el cupón");
    } finally {
      setLoading(false);
    }
  }

  if (coupon) {
    const active = discount > 0;
    return (
      <div className="rounded-md border border-oni-line bg-oni-surface p-3">
        <div className="flex items-center justify-between gap-2">
          <span className="flex items-center gap-2 text-sm">
            <span className={`grid h-5 w-5 place-items-center rounded-full ${active ? "bg-oni-red text-white" : "bg-oni-line text-oni-ash"}`}>
              {active ? <Check className="h-3 w-3" /> : <Tag className="h-3 w-3" />}
            </span>
            <span className="font-semibold text-oni-bone">{coupon.code}</span>
          </span>
          <button onClick={removeCoupon} aria-label="Quitar cupón" className="text-oni-ash hover:text-oni-red">
            <X className="h-4 w-4" />
          </button>
        </div>
        {active ? (
          <p className="mt-1 text-xs text-oni-success">Descuento aplicado: −{formatPrice(discount)}</p>
        ) : (
          <p className="mt-1 text-xs text-oni-ash">No aplica aún (compra mínima {formatPrice(coupon.minSubtotalCents)}).</p>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <div className="flex gap-2">
        <input
          value={code}
          onChange={(e) => setCode(e.target.value.toUpperCase())}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              applyCode();
            }
          }}
          placeholder="Código de cupón"
          className="h-11 flex-1 rounded-md border border-oni-line bg-oni-surface px-3 text-sm uppercase tracking-wide outline-none placeholder:normal-case placeholder:tracking-normal focus:border-oni-red"
        />
        <button
          type="button"
          onClick={applyCode}
          disabled={loading || !code.trim()}
          className="flex h-11 items-center justify-center rounded-md border border-oni-line px-4 text-sm font-semibold text-oni-bone hover:border-oni-red disabled:opacity-50"
        >
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Aplicar"}
        </button>
      </div>
      {error && <p className="text-xs text-oni-red-soft">{error}</p>}
    </div>
  );
}
