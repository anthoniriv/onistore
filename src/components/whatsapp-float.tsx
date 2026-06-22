"use client";

import { usePathname } from "next/navigation";
import { waLink } from "@/lib/whatsapp";
import { WhatsAppIcon } from "./icons";

export function WhatsAppFloat() {
  const pathname = usePathname();
  if (pathname.startsWith("/admin")) return null;

  const href = waLink("¡Hola ONISTORE! 👹 Quiero hacer una consulta.");

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Escríbenos por WhatsApp"
      className="fixed bottom-24 right-4 z-40 flex items-center gap-2 rounded-full bg-[#25D366] px-4 py-3 font-semibold text-white shadow-lg shadow-black/40 transition-transform hover:scale-105 md:bottom-6"
    >
      <WhatsAppIcon className="h-6 w-6" />
      <span className="hidden text-sm sm:inline">WhatsApp</span>
    </a>
  );
}
