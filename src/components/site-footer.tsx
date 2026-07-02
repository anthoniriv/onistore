import Link from "next/link";
import { MapPin, Truck, Clock } from "lucide-react";
import { getCategories } from "@/lib/queries";
import { OniLogo } from "./brand";
import { WhatsAppIcon, InstagramIcon, TikTokIcon } from "./icons";
import { waLink } from "@/lib/whatsapp";

export async function SiteFooter() {
  const categories = await getCategories();
  const wa = waLink("¡Hola ONISTORE! 👹");

  return (
    <footer className="mt-10 border-t border-oni-line bg-oni-ink pb-20 md:mt-12 md:pb-0">
      {/* Tira de beneficios */}
      <div className="mx-auto grid max-w-7xl grid-cols-1 gap-3 px-4 py-6 sm:grid-cols-3 md:px-6">
        {[
          { icon: Truck, t: "Envío a todo el Perú", s: "Coordinamos por WhatsApp" },
          { icon: MapPin, t: "Entregas presenciales", s: "Arenales y Centro Cívico" },
          { icon: Clock, t: "LIVE Viernes a Domingo 7–9PM", s: "Sorteos y drops" },
        ].map((b) => (
          <div key={b.t} className="flex items-center gap-3 rounded-md border border-oni-line bg-oni-surface px-4 py-3">
            <b.icon className="h-6 w-6 text-oni-red" />
            <div>
              <p className="text-sm font-semibold text-oni-bone">{b.t}</p>
              <p className="text-xs text-oni-ash">{b.s}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="mx-auto grid max-w-7xl grid-cols-2 gap-8 px-4 py-8 md:grid-cols-4 md:px-6">
        <div className="col-span-2 md:col-span-1">
          <OniLogo />
          <p className="mt-3 max-w-xs text-sm text-oni-ash">
            Tu tienda otaku de confianza. Figuras, manga, Blu-ray y merch con calidad, variedad y buen precio.
          </p>
          <div className="mt-4 flex gap-3">
            <a href={wa} target="_blank" rel="noopener noreferrer" aria-label="WhatsApp" className="grid h-10 w-10 place-items-center rounded-full border border-oni-line text-oni-bone hover:bg-oni-red hover:text-white">
              <WhatsAppIcon className="h-5 w-5" />
            </a>
            <a href="https://instagram.com/onistore.jp" target="_blank" rel="noopener noreferrer" aria-label="Instagram @onistore.jp" className="grid h-10 w-10 place-items-center rounded-full border border-oni-line text-oni-bone hover:bg-oni-red hover:text-white">
              <InstagramIcon className="h-5 w-5" />
            </a>
            <a href="https://tiktok.com/@onistore.jp" target="_blank" rel="noopener noreferrer" aria-label="TikTok @onistore.jp" className="grid h-10 w-10 place-items-center rounded-full border border-oni-line text-oni-bone hover:bg-oni-red hover:text-white">
              <TikTokIcon className="h-5 w-5" />
            </a>
          </div>
        </div>

        <div>
          <h4 className="mb-3 font-display text-sm tracking-wide text-oni-bone">Categorías</h4>
          <ul className="space-y-2 text-sm text-oni-ash">
            {categories.map((c) => (
              <li key={c.slug}>
                <Link href={`/catalogo?category=${c.slug}`} className="hover:text-oni-red">
                  {c.name}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h4 className="mb-3 font-display text-sm tracking-wide text-oni-bone">Tienda</h4>
          <ul className="space-y-2 text-sm text-oni-ash">
            <li><Link href="/catalogo" className="hover:text-oni-red">Catálogo</Link></li>
            <li><Link href="/chancaditos" className="hover:text-oni-red">Zona Chancaditos</Link></li>
            <li><Link href="/nosotros" className="hover:text-oni-red">Nosotros</Link></li>
            <li><Link href="/contacto" className="hover:text-oni-red">Contacto</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="mb-3 font-display text-sm tracking-wide text-oni-bone">Pagos</h4>
          <ul className="space-y-2 text-sm text-oni-ash">
            <li>Yape / Plin</li>
            <li>Transferencia</li>
            <li>Efectivo (entrega)</li>
            <li>Tarjeta (próximamente)</li>
          </ul>
        </div>
      </div>

      <div className="border-t border-oni-line py-4 text-center text-xs text-oni-ash">
        © {new Date().getFullYear()} ONISTORE · 本物の魂 · Hecho con 👹 en Perú
      </div>
    </footer>
  );
}
