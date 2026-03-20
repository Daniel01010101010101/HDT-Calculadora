# HDT Cotizador Vercel - Scraping Homecenter

Proyecto listo para desplegar en Vercel.

## Qué hace
- Frontend React + Vite
- API serverless en `/api/products` y `/api/calculate`
- Scraping directo de categorías públicas de Homecenter
- Fallback automático cuando el sitio externo no responde o cambia su HTML
- Cotización con PDF

## Categorías configuradas
- Cerámica
- Porcelanato
- Laminado
- Vinílico
- Madera

## Despliegue en Vercel
1. Sube esta carpeta a GitHub.
2. Importa el repositorio en Vercel.
3. Framework Preset: Vite.
4. Build Command: `vite build`
5. Output Directory: `dist`
6. No necesita variables de entorno.

## Importante
Este proyecto intenta consultar el catálogo público de Homecenter en vivo. Como depende de un sitio externo, pueden ocurrir cambios en estructura, bloqueos o tiempos de espera. Por eso incluye fallback.
