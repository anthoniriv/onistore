// Configuración central del sitio. Cambiar el dominio aquí se propaga a
// metadata, sitemap, JSON-LD y links de WhatsApp.
export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || "https://www.onistore.store").replace(/\/$/, "");
export const SITE_NAME = process.env.NEXT_PUBLIC_STORE_NAME || "ONISTORE";
export const SITE_DESCRIPTION =
  "Tienda otaku de anime y manga en Perú: figuras, manga, Blu-ray, anime goods y bookarts. Envíos a todo el país y recojo en Arenales.";

export const productUrl = (slug: string) => `${SITE_URL}/producto/${slug}`;
export const categoryUrl = (slug: string) => `${SITE_URL}/catalogo?category=${slug}`;
