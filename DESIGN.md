---
name: ONISTORE
description: Tienda otaku peruana — figuras, manga y merch de anime en una vitrina nocturna curada.
colors:
  oni-black: "#12101e"
  oni-ink: "#1e1a30"
  oni-surface: "#2a2440"
  oni-line: "#3a3352"
  oni-red: "#7b5ea7"
  oni-red-dark: "#5f4783"
  oni-red-soft: "#9b7fc4"
  oni-gold: "#c4a84a"
  oni-bone: "#f2ebe0"
  oni-ash: "#a79fb5"
  whatsapp: "#25d366"
typography:
  display:
    fontFamily: "Bebas Neue, Arial Narrow, sans-serif"
    fontSize: "clamp(1.75rem, 5vw, 3.5rem)"
    fontWeight: 400
    lineHeight: 1
    letterSpacing: "0.02em"
  body:
    fontFamily: "DM Sans, system-ui, sans-serif"
    fontSize: "0.875rem"
    fontWeight: 400
    lineHeight: 1.5
    letterSpacing: "normal"
  label:
    fontFamily: "DM Sans, system-ui, sans-serif"
    fontSize: "0.6875rem"
    fontWeight: 600
    lineHeight: 1.2
    letterSpacing: "0.08em"
  jp:
    fontFamily: "Noto Serif JP, serif"
    fontSize: "1rem"
    fontWeight: 400
    lineHeight: 1.5
    letterSpacing: "normal"
rounded:
  sm: "0.375rem"
  md: "0.5rem"
  full: "9999px"
spacing:
  xs: "0.5rem"
  sm: "0.75rem"
  md: "1rem"
  lg: "1.5rem"
components:
  button-primary:
    backgroundColor: "{colors.oni-red}"
    textColor: "{colors.oni-bone}"
    rounded: "{rounded.md}"
    padding: "0 1.5rem"
    height: "3rem"
  button-primary-hover:
    backgroundColor: "{colors.oni-red-dark}"
    textColor: "{colors.oni-bone}"
  button-ghost:
    backgroundColor: "transparent"
    textColor: "{colors.oni-red}"
    rounded: "{rounded.md}"
    padding: "0 1rem"
  button-ghost-hover:
    backgroundColor: "{colors.oni-red}"
    textColor: "{colors.oni-bone}"
  card-product:
    backgroundColor: "{colors.oni-ink}"
    textColor: "{colors.oni-bone}"
    rounded: "{rounded.md}"
    padding: "0.75rem"
  input-text:
    backgroundColor: "{colors.oni-surface}"
    textColor: "{colors.oni-bone}"
    rounded: "{rounded.md}"
    padding: "0 0.75rem"
    height: "2.75rem"
---

# Design System: ONISTORE

## 1. Overview

**Creative North Star: "The Midnight Collector's Vault"**

ONISTORE es una vitrina de coleccionista abierta a medianoche. El fondo Yoru (#12101e) no es "modo oscuro por moda": es el terciopelo negro sobre el que descansan las piezas. El morado Oni (#7b5ea7) y el dorado Inca (#c4a84a) son la luz dirigida que cae sobre cada figura — se usan con parquedad para crear jerarquía y momento, nunca como decoración constante. La tipografía display Bebas da la energía de póster de anime; el cuerpo DM Sans mantiene la lectura limpia y el catálogo respirando. El sistema es oscuro, otaku y premium: curaduría por encima de volumen.

La densidad es media-baja a propósito. Las piezas se presentan sobre imagen a contorno (`object-contain`) con aire, no apretadas en una grilla infinita de descuentos. La profundidad se construye por capas tonales (Yoru → Kage → surface) y bordes de tinte morado, no por sombras. El público es mayoritariamente móvil, así que el sistema se decide primero en el teléfono.

Lo que este sistema **rechaza explícitamente**: el dropshipping genérico — plantilla Shopify sosa, grillas de cards idénticas, stock photos, badges de descuento por todas partes, cero identidad. También rechaza el caos gritón tipo AliExpress/Temu y la frialdad SaaS azul-gris sin alma otaku. La energía de anime se resuelve con tipografía, contraste y composición; nunca con ruido ni saturación.

**Key Characteristics:**
- Lienzo nocturno profundo (Yoru), no gris genérico ni cream AI
- Morado + dorado como luz dirigida, escasos y con intención
- Profundidad por capas tonales y bordes de tinte, cero sombras
- Display Bebas tipo cartel + cuerpo DM Sans limpio
- Curaduría sobre volumen; el producto respira
- Mobile-first; el pago cruza a WhatsApp con fricción mínima

## 2. Colors

Una paleta nocturna de morado espiritual y oro real sobre negro-violáceo, con washi crudo como único claro.

### Primary
- **Oni Morado** (#7b5ea7): el acento primario. CTAs sólidos, enlaces activos, badge del carrito, borde de card en hover, foco de inputs. Es la voz de la marca; su rareza es lo que le da peso.
- **Oni Morado Oscuro** (#5f4783): estado hover de todo botón primario.
- **Oni Morado Suave** (#9b7fc4): texto morado sobre superficies muy oscuras (ej. avisos en `oni-red/15`) donde el morado base no alcanzaría contraste.

### Secondary
- **Inca Gold** (#c4a84a): dorado real reservado para momentos de prestigio — sellos, detalles editoriales, acentos de lujo. Nunca compite con el morado por los CTAs; es joya, no botón.

### Neutral
- **Yoru** (#12101e): fondo base de toda la app. El terciopelo negro de la vitrina.
- **Kage** (#1e1a30): superficie de cards y contenedores, un escalón sobre el fondo.
- **Surface** (#2a2440): capa secundaria — fondos de imagen de producto, inputs, celdas.
- **Line** (#3a3352): separadores y bordes, con tinte morado en vez de gris neutro.
- **Washi** (#f2ebe0): el único claro. Texto principal (`oni-bone`) sobre fondos oscuros.
- **Ash** (#a79fb5): morado-gris apagado para texto secundario, metadatos, labels.

### Functional
- **WhatsApp Green** (#25d366): exclusivo del botón/acción de compra por WhatsApp. Color de sistema, no de marca; nunca reutilizar para otra cosa.

### Named Rules
**The Directed-Light Rule.** Morado y dorado juntos ocupan ≤15% de cualquier pantalla. Son la luz que cae sobre las piezas, no el ambiente. Si una pantalla se ve "morada", hay demasiado — devuélvelo al Yoru.

**The Washi-Only-Light Rule.** El único tono claro permitido sobre superficies oscuras es Washi (#f2ebe0) y su versión apagada Ash. Prohibido introducir blancos puros (#fff) para texto de cuerpo — rompen la calidez nocturna. (El blanco puro se tolera solo dentro del botón WhatsApp.)

## 3. Typography

**Display Font:** Bebas Neue (con Arial Narrow, sans-serif)
**Body Font:** DM Sans (con system-ui, sans-serif)
**Accent Font:** Noto Serif JP (para toques japoneses puntuales)

**Character:** Pareja de alto contraste — un condensed display de cartel contra un humanist sans neutro. Bebas grita en mayúsculas con tracking abierto (energía póster de anime); DM Sans mantiene la calma y la legibilidad del catálogo. El contraste es el punto; nunca sustituir uno por el otro fuera de rol.

### Hierarchy
- **Display** (Bebas 400, `clamp(1.75rem, 5vw, 3.5rem)`, lh 1, tracking 0.02em, UPPERCASE): títulos de sección, hero, CTAs de peso. Aplicado vía `.font-display`.
- **Body** (DM Sans 400, 0.875rem, lh 1.5): texto de producto, descripciones, párrafos. Máx. 65–75ch en prosa.
- **Label** (DM Sans 600, 0.6875rem/11px, tracking 0.08em, a menudo UPPERCASE): categorías, metadatos, tags, precios pequeños.
- **JP Accent** (Noto Serif JP 400): decoración japonesa ocasional, no para texto funcional.

### Named Rules
**The Bebas-Is-For-Impact Rule.** Bebas Neue solo en display y CTAs de peso. Prohibido usarlo para texto corrido o labels largos — en tamaños chicos el condensed se vuelve ilegible. Bajo ~1.25rem, siempre DM Sans.

## 4. Elevation

Sistema **plano por capas tonales**. No hay sombras. La profundidad se construye apilando neutros: Yoru (fondo) → Kage (card) → Surface (capa interna), cada escalón un poco más claro. Los bordes usan `oni-line` con tinte morado, no gris. La única "elevación" real es el header sticky, que se separa con `backdrop-blur` y un borde inferior de línea, más un stroke inset (`box-shadow: inset 0 0 0 1px oni-line`) que dibuja el contorno sin proyectar sombra.

### Named Rules
**The No-Shadow Rule.** Prohibidas las `box-shadow` proyectadas (drop shadows). Si algo necesita destacarse, sube un escalón tonal o añade un borde de línea. La única sombra permitida es el stroke inset de `.oni-stroke`. El glow de foco morado es la excepción interactiva, no un recurso decorativo.

## 5. Components

### Buttons
- **Shape:** esquinas suaves (radius 0.5rem / `rounded-md`; badges y micro-acciones bajan a 0.375rem / `rounded-sm`).
- **Primary:** fondo `oni-red` (#7b5ea7), texto Washi/blanco, altura 2.75–3rem, padding horizontal 1.5rem. Los CTAs de peso usan `.font-display` con tracking. 
- **Hover / Focus:** hover → `oni-red-dark` (#5f4783); micro-CTAs añaden `hover:scale-105`. Foco visible obligatorio (anillo/borde morado).
- **Ghost / Secondary:** borde `oni-red/50` + texto `oni-red` sobre transparente; hover invierte a relleno morado con texto claro. Para acciones secundarias.
- **WhatsApp:** cuadrado `rounded-md`, fondo #25d366, ícono blanco, `hover:scale-105`. Reservado a la acción de compra.

### Cards / Containers
- **Corner Style:** `rounded-oni` / `rounded-md` (0.5rem).
- **Background:** `oni-ink` (#1e1a30) sobre el fondo Yoru; imagen de producto sobre `oni-surface`.
- **Border:** `border-oni-line`, en hover → `border-oni-red/60`. Este cambio de borde es la interacción principal de la card — nada de sombras.
- **Image:** `aspect-square`, `object-contain` con padding (la figura respira, no se recorta); `group-hover:scale-105` en la imagen.
- **Internal Padding:** 0.75rem (`p-3`).
- **Agotado:** overlay `oni-black/65` con sello rotado `-8deg`, borde Washi, texto display.

### Inputs / Fields
- **Style:** altura 2.75rem (`h-11`), fondo `oni-surface`, borde `oni-line`, `rounded-md`, `outline-none`.
- **Focus:** `focus:border-oni-red` (el borde morado es la señal de foco). Nunca dejar el input sin indicador de foco visible.
- **Placeholder:** legible (≥4.5:1); no bajar a gris tenue.

### Navigation
- **Header:** sticky top, `z-50`, `bg-oni-black/90` + `backdrop-blur`, borde inferior `oni-line`. Marquesina superior en `bg-oni-red` con texto blanco (`animate-marquee`, 22s).
- **Links:** DM Sans 500; hover → `text-oni-red`. Search embebido en desktop; menú móvil dedicado con CTA display.
- **Mobile:** el header colapsa a logo + carrito + botón de menú; navegación completa en panel móvil.

## 6. Do's and Don'ts

### Do:
- **Do** usar Yoru (#12101e) como fondo base de todo — el negro-violáceo es el lienzo de la vitrina.
- **Do** construir profundidad subiendo escalones tonales (Yoru → Kage → Surface) y con bordes `oni-line` de tinte morado.
- **Do** reservar morado y dorado juntos a ≤15% de la pantalla (The Directed-Light Rule).
- **Do** usar Washi (#f2ebe0) / Ash (#a79fb5) como únicos tonos claros; verificar contraste ≥4.5:1, con cuidado extra en Ash sobre superficies oscuras y dorado sobre morado.
- **Do** reservar Bebas para display y CTAs de peso; DM Sans para todo lo demás bajo ~1.25rem.
- **Do** presentar el producto con aire y `object-contain` — curaduría, no compresión.
- **Do** dar `prefers-reduced-motion` a marquesina, fades y sliders del hero.

### Don't:
- **Don't** parecer dropshipping genérico: plantilla Shopify sosa, grillas de cards idénticas, stock photos, badges de descuento por todas partes, cero identidad.
- **Don't** caer en caos gritón tipo AliExpress/Temu (sobrecarga de descuentos y badges) ni en frialdad SaaS azul-gris sin alma otaku.
- **Don't** usar `box-shadow` proyectadas (The No-Shadow Rule) — profundidad por tono y borde, no por sombra.
- **Don't** introducir blancos puros (#fff) para texto de cuerpo; rompen la calidez nocturna (excepción: dentro del botón WhatsApp).
- **Don't** usar Inca Gold para CTAs — es joya, no botón; el morado manda las acciones.
- **Don't** usar Bebas en texto corrido ni labels largos — ilegible en condensed a tamaño chico.
- **Don't** apretar el catálogo en grillas infinitas; el volumen no es el valor, la curaduría sí.
- **Don't** dejar inputs sin foco visible ni placeholders en gris tenue.
