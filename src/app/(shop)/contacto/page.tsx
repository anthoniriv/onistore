import type { Metadata } from "next";
import { MapPin, Clock, Phone } from "lucide-react";
import { ContactForm } from "@/components/contact-form";
import { WhatsAppIcon, InstagramIcon, TikTokIcon } from "@/components/icons";
import { waLink } from "@/lib/whatsapp";

export const metadata: Metadata = { title: "Contacto" };

export default function ContactoPage() {
  const wa = waLink("¡Hola ONISTORE! 👹 Quiero hacer una consulta.");
  return (
    <div className="mx-auto max-w-5xl px-4 py-6 md:px-6">
      <h1 className="font-display text-3xl text-oni-bone sm:text-4xl">Contáctanos</h1>
      <p className="mt-1 text-sm text-oni-ash">¿Buscas algo en especial? Escríbenos y lo conseguimos para ti.</p>

      <div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-2">
        <div className="space-y-4">
          <a href={wa} target="_blank" rel="noopener noreferrer"
            className="flex items-center gap-3 rounded-oni border border-[#25D366]/40 bg-[#25D366]/10 p-4 hover:bg-[#25D366]/20">
            <WhatsAppIcon className="h-8 w-8 text-[#25D366]" />
            <div>
              <p className="font-semibold text-oni-bone">WhatsApp</p>
              <p className="text-sm text-oni-ash">993 109 998 · respuesta rápida</p>
            </div>
          </a>

          <div className="rounded-oni border border-oni-line bg-oni-ink p-4">
            <div className="flex items-start gap-3">
              <MapPin className="mt-0.5 h-5 w-5 text-oni-red" />
              <div>
                <p className="font-semibold text-oni-bone">Entregas presenciales</p>
                <p className="text-sm text-oni-ash">Fines de semana en Arenales y Centro Cívico.</p>
              </div>
            </div>
            <div className="mt-3 flex items-start gap-3">
              <Clock className="mt-0.5 h-5 w-5 text-oni-red" />
              <div>
                <p className="font-semibold text-oni-bone">LIVE ONISTORE</p>
                <p className="text-sm text-oni-ash">Viernes a Domingo · 7:00 – 9:00 PM</p>
              </div>
            </div>
            <div className="mt-3 flex items-start gap-3">
              <Phone className="mt-0.5 h-5 w-5 text-oni-red" />
              <div>
                <p className="font-semibold text-oni-bone">Síguenos</p>
                <div className="mt-2 flex gap-2">
                  <a href="https://instagram.com/onistore.jp" target="_blank" rel="noopener noreferrer" aria-label="Instagram @onistore.jp" className="grid h-10 w-10 place-items-center rounded-full border border-oni-line hover:bg-oni-red hover:text-white"><InstagramIcon className="h-5 w-5" /></a>
                  <a href="https://tiktok.com/@onistore.jp" target="_blank" rel="noopener noreferrer" aria-label="TikTok @onistore.jp" className="grid h-10 w-10 place-items-center rounded-full border border-oni-line hover:bg-oni-red hover:text-white"><TikTokIcon className="h-5 w-5" /></a>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="rounded-oni border border-oni-line bg-oni-ink p-4">
          <h2 className="mb-3 font-display text-lg">Envíanos un mensaje</h2>
          <ContactForm />
        </div>
      </div>
    </div>
  );
}
