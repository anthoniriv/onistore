# ✅ QA Checklist — ONISTORE

Marca cada ítem al probar. `[x]` hecho · `[ ]` pendiente · `[!]` falla.

## Búsqueda
- [ ] Buscar término existente devuelve resultados (preview en vivo + página)
- [ ] Buscar término inexistente muestra "sin resultados"
- [ ] El input se limpia al cambiar de página
- [ ] Buscador accesible en mobile (ícono) y desktop (input)

## Filtros y categorías
- [ ] Filtrar por categoría, condición, precio, anime y **género/demografía**
- [ ] Combinar filtros funciona y se reflejan en la URL
- [ ] "Limpiar filtros" resetea
- [ ] Links de categoría del header/footer llegan al catálogo correcto
- [ ] Paginación funciona

## Cards de producto (probar 1 de cada estado)
- [ ] Nuevo (badge "Nuevo")
- [ ] Seminuevo / Usado (badge condición)
- [ ] Oferta (precio tachado + -X%)
- [ ] Chancadito (badge stone + va a WhatsApp chancadito)
- [ ] Preventa (badge + CTA "Reservar preventa" por WhatsApp)
- [ ] Agotado (overlay + botón "Avísame" por WhatsApp)
- [ ] Sin imagen (muestra ícono oni + "Foto pronto")
- [ ] Stock bajo muestra "¡Últimas N unidades!"
- [ ] Máx 2 badges visibles, sin encimarse, en card angosta (360px)

## Ficha de producto (PDP)
- [ ] Galería: imagen completa (no recortada), miniaturas cambian
- [ ] CTA correcto según estado (carrito / preventa / avísame)
- [ ] "Consultar por WhatsApp" abre mensaje con nombre, precio, categoría, SKU y link
- [ ] Géneros clickeables → catálogo filtrado
- [ ] Breadcrumb correcto
- [ ] Relacionados cargan

## Carrito y checkout
- [ ] Agregar/quitar/cambiar cantidad
- [ ] Carrito persiste al recargar
- [ ] Checkout: recojo Arenales vs envío (pide dirección)
- [ ] Boleta (DNI) / Factura (RUC + razón social) validan
- [ ] WhatsApp arma mensaje de pedido completo
- [ ] Yape muestra número + subir comprobante

## WhatsApp (mensajes por intención)
- [ ] Consulta de stock
- [ ] Chancadito
- [ ] Preventa
- [ ] Agotado (avísame)
- [ ] Encargo / bajo pedido
- [ ] Todos incluyen nombre, precio, categoría, SKU (si hay) y link

## Mobile / responsive (DevTools)
- [ ] 360px — lectura clara, botones ≥44px, cards 2 col ok
- [ ] 390px / 430px — hero no aplasta el título, CTA visible
- [ ] Tablet — grid 3 col
- [ ] Desktop — grid 4–5 col, no roto
- [ ] WhatsApp flotante no tapa contenido ni el tab bar inferior

## SEO
- [ ] `/robots.txt` y `/sitemap.xml` responden
- [ ] `<title>` y meta description únicos por página/categoría/producto
- [ ] JSON-LD: Organization (home), Product + Breadcrumb (PDP) → Rich Results Test
- [ ] Open Graph con título/descripción (preview al compartir)
- [ ] Alt text en imágenes de producto

## Performance
- [ ] Lighthouse mobile: LCP < 2.5s, CLS < 0.1
- [ ] Hero carga con priority (sin parpadeo de layout)
- [ ] Imágenes en AVIF/WebP (Network tab)
- [ ] Sin fuentes innecesarias (JP removido)

## Navegación / general
- [ ] Header sticky, logo lleva al home
- [ ] Footer: todos los links funcionan
- [ ] Sin enlaces rotos (404)
- [ ] Admin protegido (redirige a login sin sesión)

## Importador de catálogo
- [ ] `npm run import:catalog archivo.csv` (dry-run) reporta errores/avisos
- [ ] `--commit` importa sin errores y los productos aparecen en la tienda
