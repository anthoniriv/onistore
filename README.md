# 👹 ONISTORE — Ecommerce Otaku

Tienda online de figuras, manga, Blu-ray y merch de anime. Mobile-first, panel admin con base de datos, checkout por WhatsApp + Yape/Plin.

Stack: **Next.js 16** (App Router) · **React 19** · **Tailwind v4** · **Prisma 6** · **SQLite** (dev) → **Postgres** (prod) · **Zustand** (carrito) · **jose** (sesión admin).

---

## 🚀 Correr en local

Requiere **Node 24**.

```bash
npm install
npm run placeholders   # genera imágenes placeholder de marca
npm run db:push        # crea la base de datos SQLite
npm run db:seed        # carga categorías, productos demo, banners y admin
npm run dev            # http://localhost:3000
```

### Comandos útiles
| Comando | Qué hace |
|---|---|
| `npm run db:seed` | Carga datos de ejemplo |
| `npm run db:reset` | Borra y recarga la BD limpia |
| `npm run db:studio` | Explorador visual de la BD (Prisma Studio) |
| `npm run build` | Build de producción |

---

## 🔐 Panel admin

`http://localhost:3000/admin` · login en `/admin/login`

- **Usuario:** `admin@onistore.pe`
- **Clave:** `onistore123`  *(cambia `ADMIN_EMAIL` / `ADMIN_PASSWORD` en `.env` y vuelve a sembrar)*

Gestiona: **productos** (con subida de imágenes), **pedidos** (estados + comprobantes + contacto directo), **banners** del hero, y **mensajes** de contacto.

---

## ⚙️ Configuración (`.env`)

```
DATABASE_URL="postgresql://postgres.ifrfvffrxmcnjlmhectr:...@aws-0-us-east-1.pooler.supabase.com:6543/postgres?pgbouncer=true"
DIRECT_URL="postgresql://postgres:...@db.ifrfvffrxmcnjlmhectr.supabase.co:5432/postgres"
AUTH_SECRET="..."                   # secreto de sesión (cambiar en prod)
NEXT_PUBLIC_WHATSAPP="51993109998"  # WhatsApp del negocio (intl, sin +)
NEXT_PUBLIC_YAPE_NUMBER="993109998"
NEXT_PUBLIC_YAPE_NAME="ONISTORE"
ADMIN_EMAIL / ADMIN_PASSWORD
```

---

## 🛒 Funcionalidades

- Hero con **slider** (gestionable desde admin)
- Catálogo con **filtros**: categoría, condición, precio, anime, orden + **Zona Chancaditos** (outlet)
- Ficha de producto con galería, stock, condición, consulta directa por WhatsApp
- **Carrito** persistente + **checkout** (WhatsApp y Yape/Plin con subida de comprobante)
- **Botón flotante de WhatsApp** + barra inferior mobile
- 100% **mobile-first**, tema oni (negro/rojo/dorado)

---

## 🌐 Deploy a producción (Vercel + Supabase)

1. **Base de datos**: crea un proyecto Supabase.
2. En Vercel configura `DATABASE_URL` con el connection pooler y `DIRECT_URL` con la conexión directa.
3. Configura también `AUTH_SECRET`, `NEXT_PUBLIC_WHATSAPP`, `NEXT_PUBLIC_YAPE_NUMBER` y `NEXT_PUBLIC_YAPE_NAME`.
4. Ejecuta `npx prisma db push && npx prisma db seed` contra la BD nueva.
5. **Imágenes**: en Vercel el disco es de solo lectura. Cambia `src/app/api/upload/route.ts`
   para usar `@vercel/blob` (`put`) en vez de escribir en `/public/uploads`. El resto del flujo no cambia.

---

## 🎨 Recursos gráficos pendientes

Ver **`RECURSOS-GRAFICOS.md`** — lista de todas las imágenes reales que faltan
(hero, fotos de producto, QR de Yape, favicon, OG) con tamaños recomendados.
Mientras tanto el sitio usa placeholders generados con la marca.
