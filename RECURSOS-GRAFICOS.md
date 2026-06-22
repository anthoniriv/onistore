# 🎨 Recursos gráficos que necesito de ti

El sitio ya funciona con **placeholders generados con la marca** (carpeta `public/placeholders/`).
Para reemplazarlos por material real, pásame estos archivos. Te indico **tamaño**, **formato** y **dónde va**.

## 1. Logo (prioridad alta)
| Archivo | Tamaño | Formato | Uso |
|---|---|---|---|
| `logo.png` | ~1024×1024 | PNG **fondo transparente** | El que ya tienes (máscara oni circular "ONISTORE"). Guárdalo en `public/brand/logo.png`. |
| `logo-horizontal.png` | ~1200×400 | PNG transparente | Versión horizontal para header (opcional). |
| `favicon` | 512×512 | PNG | Para generar el favicon/ícono de pestaña. |

> Nota: ahora el logo del header es un **SVG vectorial** que dibujé (componente `OniMark`). Si prefieres tu PNG real, lo cambio en 1 línea.

## 2. Hero / Slider (3 imágenes — prioridad alta)
Formato horizontal, **1600×700 px** (o 16:7), JPG/WEBP. Reemplazan `public/placeholders/hero1-3.svg`.
Se gestionan desde **Admin → Banners**, así que también puedes subirlas tú desde el panel.

1. **Slide principal** — figuras/personajes destacados + lema "Despierta tu lado Oni".
2. **Zona Chancaditos** — estética outlet/ofertas.
3. **LIVE ONISTORE** — promo de los lives (Vie–Dom 7–9pm).

Ideas de composición: personaje a la derecha, espacio oscuro a la izquierda para el texto (el diseño pone un degradado negro a la izquierda).

## 3. Fotos de producto (continuo)
- **1200×1200 px**, fondo limpio (negro, blanco o liso), JPG/WEBP.
- 1 a 5 fotos por producto. La **primera = principal**.
- Se suben desde **Admin → Productos → Nuevo/Editar**.

## 4. Pago Yape / Plin (prioridad media)
| Archivo | Tamaño | Uso |
|---|---|---|
| `yape-qr.png` | ~800×800 | QR de tu Yape para mostrar en el checkout (ahora muestro número + nombre; con el QR queda mejor). |

## 5. Redes / Marca (opcional)
| Archivo | Tamaño | Uso |
|---|---|---|
| `og-image.jpg` | 1200×630 | Imagen al compartir el link en WhatsApp/IG/FB. |
| Banner "categorías" | 800×800 c/u | Íconos/portadas por categoría (Figuras, Manga, Blu-ray, Goods, Bookarts). Opcional, hoy uso íconos. |

## 6. Textos / datos que me faltan confirmar
- Usuario/links reales de **Instagram** y **TikTok** (hoy apuntan a `instagram.com` / `tiktok.com`).
- ¿Cobras **envío fijo** o variable? (hoy "se coordina por WhatsApp").
- Distritos/puntos de entrega exactos (hoy: "Arenales y Centro Cívico").

---

### Dónde dejar los archivos
Crea la carpeta `public/brand/` y déjalos ahí, o simplemente **súbelos desde el panel admin**
(productos y banners). Para logo/favicon/QR pásamelos y los integro yo.
