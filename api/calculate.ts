import { fallbackProducts } from './_data';
import { scrapeHomecenterProducts } from './homecenter';

function laborRateByCategory(category: string) {
  switch (category) {
    case 'porcelanato':
      return 48000;
    case 'madera':
      return 52000;
    case 'laminado':
      return 39000;
    case 'vinilico':
      return 34000;
    default:
      return 32000;
  }
}

function adhesiveRateByCategory(category: string) {
  switch (category) {
    case 'madera':
    case 'laminado':
      return 11000;
    case 'vinilico':
      return 9000;
    default:
      return 18000;
  }
}

function transportByArea(area: number) {
  if (area <= 20) return 95000;
  if (area <= 50) return 145000;
  return 220000;
}

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const {
    area,
    productId,
    category,
    includeLabor = true,
    includeAdhesive = true,
    includeTransport = true,
    contingencyPct = 5
  } = req.body || {};

  const numericArea = Number(area || 0);
  if (!numericArea || numericArea <= 0) {
    return res.status(400).json({ error: 'El área debe ser mayor a 0.' });
  }

  const live = await scrapeHomecenterProducts(typeof category === 'string' ? category : undefined);
  const pool = live.products?.length ? live.products : fallbackProducts;
  const product = pool.find((item) => item.id === productId) || fallbackProducts.find((item) => item.id === productId);

  if (!product) {
    return res.status(400).json({ error: 'Producto inválido.' });
  }

  const laborRate = laborRateByCategory(product.categoria);
  const adhesiveRate = adhesiveRateByCategory(product.categoria);
  const transport = includeTransport ? transportByArea(numericArea) : 0;
  const materiales = numericArea * product.precio_m2;
  const manoObra = includeLabor ? numericArea * laborRate : 0;
  const adhesivos = includeAdhesive ? numericArea * adhesiveRate : 0;
  const subtotal = materiales + manoObra + adhesivos + transport;
  const imprevistos = subtotal * (Number(contingencyPct || 0) / 100);
  const total = subtotal + imprevistos;

  return res.status(200).json({
    area: numericArea,
    producto: product,
    materiales,
    manoObra,
    adhesivos,
    transporte: transport,
    imprevistos,
    total,
    precioFinalM2: total / numericArea,
    source: live.source,
    generatedAt: live.generatedAt,
    scrapeErrors: live.scrapeErrors
  });
}
