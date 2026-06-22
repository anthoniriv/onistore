# 🧾 Pendiente: Boleta / Factura electrónica real (SUNAT)

**Estado:** los datos ya se capturan y guardan, pero **no se emite el comprobante electrónico todavía**.

## Qué hace hoy el sistema
En el checkout el cliente elige **Boleta** (DNI opcional) o **Factura** (RUC + razón social + dirección fiscal).
Esos datos:
- se **validan** (DNI 8 díg., RUC 11 díg.),
- se **guardan** en el pedido (`Order.docType`, `docNumber`, `businessName`, `fiscalAddress`),
- se **incluyen** en el mensaje de WhatsApp y se ven en **Admin → Pedidos**.

Es decir: tienes toda la info para emitir el comprobante **manualmente** desde tu sistema actual.

## Qué falta para emisión automática
Emitir boleta/factura electrónica válida en Perú requiere un **OSE/PSE** (proveedor autorizado por SUNAT). No se puede generar el PDF/XML legal solo con código propio.

### Opción recomendada: **Nubefact** (API simple, popular en Perú)
1. Crear cuenta en Nubefact y obtener **token + URL de la API** (sandbox primero).
2. Variables de entorno:
   ```
   NUBEFACT_API_URL="https://api.nubefact.com/api/v1/<tu-id>"
   NUBEFACT_TOKEN="<token>"
   ```
3. Crear `src/lib/nubefact.ts` con una función `emitirComprobante(order)` que arme el JSON
   (tipo_de_comprobante: 1=Factura, 2=Boleta; serie/número correlativo; cliente; items; IGV 18%).
4. Disparar la emisión cuando el pedido pase a estado **PAGADO** (en `setOrderStatus`),
   o con un botón "Emitir comprobante" en Admin → Pedidos.
5. Guardar en el `Order` la respuesta: `cpeSerie`, `cpeNumero`, `cpePdfUrl`, `cpeXmlUrl`, `cpeHash`.
   (agregar esos campos al schema cuando se integre).
6. Mostrar al cliente el link del PDF y/o enviarlo por WhatsApp/email.

### Alternativas equivalentes
- **Facturactiva / Bsale / Apifact / Tata Consultoría** — todas exponen API REST similar.
- Requisito legal: estar afiliado a SUNAT como emisor electrónico y tener serie autorizada.

## Checklist cuando se integre
- [ ] Cuenta OSE/PSE + credenciales (sandbox y producción)
- [ ] Series y correlativos (Boleta B001, Factura F001…)
- [ ] Cálculo de **IGV 18%** (hoy los precios son finales; definir si incluyen IGV)
- [ ] Campos `cpe*` en `Order` + migración
- [ ] Botón/automatismo de emisión en admin
- [ ] Envío del PDF al cliente
- [ ] Manejo de **notas de crédito** (anulaciones)

> Nota fiscal: confirmar con tu contador si los precios mostrados **incluyen IGV** o se le suma.
> Eso define cómo se arma el comprobante.
