import { fallbackProducts } from './_data';
import { scrapeHomecenterProducts } from './homecenter';

export default async function handler(req: any, res: any) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const category = typeof req.query?.category === 'string' ? req.query.category : undefined;

  try {
    const result = await scrapeHomecenterProducts(category);
    return res.status(200).json(result);
  } catch (error: any) {
    const backup = category ? fallbackProducts.filter((item) => item.categoria === category) : fallbackProducts;
    return res.status(200).json({
      products: backup,
      source: 'fallback',
      count: backup.length,
      generatedAt: new Date().toISOString(),
      scrapeErrors: [error?.message || 'Fallo interno controlado, se usa respaldo.']
    });
  }
}
