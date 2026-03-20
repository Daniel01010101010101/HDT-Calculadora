import { categoryDefinitions, fallbackProducts, Product } from './_data';

const DEFAULT_HEADERS = {
  'user-agent':
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
  accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
  'accept-language': 'es-CO,es;q=0.9,en;q=0.8',
  referer: 'https://www.homecenter.com.co/homecenter-co/',
  'cache-control': 'no-cache',
  pragma: 'no-cache'
};

function normalizeText(value: string) {
  return value
    .replace(/&nbsp;/gi, ' ')
    .replace(/&amp;/gi, '&')
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'")
    .replace(/\s+/g, ' ')
    .trim();
}

function decodeEntities(value: string) {
  return normalizeText(
    value
      .replace(/&aacute;/gi, 'á')
      .replace(/&eacute;/gi, 'é')
      .replace(/&iacute;/gi, 'í')
      .replace(/&oacute;/gi, 'ó')
      .replace(/&uacute;/gi, 'ú')
      .replace(/&ntilde;/gi, 'ñ')
      .replace(/&uuml;/gi, 'ü')
      .replace(/&Aacute;/gi, 'Á')
      .replace(/&Eacute;/gi, 'É')
      .replace(/&Iacute;/gi, 'Í')
      .replace(/&Oacute;/gi, 'Ó')
      .replace(/&Uacute;/gi, 'Ú')
      .replace(/&Ntilde;/gi, 'Ñ')
      .replace(/&ldquo;|&rdquo;/gi, '"')
      .replace(/&rsquo;|&lsquo;/gi, "'")
  );
}

function slugify(value: string) {
  return value
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80);
}

function inferDescription(name: string, category: string) {
  const categoryMap: Record<string, string> = {
    ceramica: 'Piso cerámico ideal para remodelación interior.',
    porcelanato: 'Porcelanato de apariencia premium para zonas sociales y acabados modernos.',
    laminado: 'Laminado con apariencia madera para ambientes cálidos.',
    vinilico: 'Piso vinílico versátil y de mantenimiento simple.',
    madera: 'Piso de madera para acabados de alto valor visual.'
  };
  return `${categoryMap[category] || 'Acabado para remodelación.'} Precio capturado desde Homecenter.`;
}

function asAbsoluteUrl(url: string, base: string) {
  try {
    return new URL(url, base).toString();
  } catch {
    return base;
  }
}

function priceToNumber(value: string) {
  const parsed = Number((value || '').replace(/\./g, '').replace(/,/g, '.'));
  return Number.isFinite(parsed) && parsed > 0 ? parsed : null;
}

function uniqueProducts(products: Product[]) {
  const map = new Map<string, Product>();
  for (const product of products) {
    if (!product.nombre || !product.precio_m2) continue;
    const key = `${product.categoria}-${product.nombre.toLowerCase()}`;
    if (!map.has(key)) map.set(key, product);
  }
  return Array.from(map.values());
}

function extractProductsByPattern(html: string, category: string, pageUrl: string): Product[] {
  const products: Product[] = [];
  const pattern = /<img[^>]+alt="([^"]*(?:Piso|Pared)[^"]*)"[^>]+src="([^"]+)"[\s\S]{0,1800}?\$\s*([\d\.]+)\s*m(?:\^\{?2\}?|2|²)/gi;
  let match: RegExpExecArray | null;

  while ((match = pattern.exec(html)) !== null) {
    const rawName = decodeEntities(match[1] || '');
    const rawImage = match[2] || '';
    const price = priceToNumber(match[3] || '');
    if (!rawName || !price) continue;
    if (/BANK_PROMOTION/i.test(rawName) || /data:image/i.test(rawImage)) continue;

    products.push({
      id: slugify(`${category}-${rawName}`),
      nombre: rawName,
      precio_m2: price,
      imagen: asAbsoluteUrl(rawImage, pageUrl),
      categoria: category,
      proveedor: 'Homecenter',
      descripcion: inferDescription(rawName, category),
      url: pageUrl,
      scrapedFrom: pageUrl,
      sourceType: 'live'
    });
  }

  return products;
}

function extractProductsFromText(html: string, category: string, pageUrl: string): Product[] {
  const stripped = html
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<[^>]+>/g, '
');

  const text = decodeEntities(stripped);
  const lines = text
    .split(/
+/)
    .map((line) => normalizeText(line))
    .filter(Boolean);

  const products: Product[] = [];
  const nameRegex = /^(Piso|Pared)\s.+/i;
  const priceRegex = /^\$\s*([\d\.]+)\s*m(?:\^\{?2\}?|2|²)$/i;

  for (let i = 0; i < lines.length; i += 1) {
    const line = lines[i];
    if (!nameRegex.test(line) || /BANK_PROMOTION/i.test(line)) continue;

    let price: number | null = null;
    for (let j = i + 1; j < Math.min(i + 8, lines.length); j += 1) {
      const priceMatch = lines[j].match(priceRegex);
      if (priceMatch) {
        price = priceToNumber(priceMatch[1]);
        break;
      }
    }

    if (!price) continue;

    products.push({
      id: slugify(`${category}-${line}`),
      nombre: line,
      precio_m2: price,
      imagen: fallbackProducts.find((item) => item.categoria === category)?.imagen || '',
      categoria: category,
      proveedor: 'Homecenter',
      descripcion: inferDescription(line, category),
      url: pageUrl,
      scrapedFrom: pageUrl,
      sourceType: 'live'
    });
  }

  return products;
}

async function fetchWithTimeout(url: string, timeoutMs = 12000) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);
  try {
    return await fetch(url, {
      headers: DEFAULT_HEADERS,
      redirect: 'follow',
      signal: controller.signal,
      cache: 'no-store'
    });
  } finally {
    clearTimeout(timeout);
  }
}

export async function scrapeHomecenterProducts(categoryFilter?: string) {
  const selectedCategories = categoryFilter
    ? categoryDefinitions.filter((item) => item.category === categoryFilter)
    : [...categoryDefinitions];

  const liveProducts: Product[] = [];
  const scrapeErrors: string[] = [];

  for (const definition of selectedCategories) {
    try {
      const response = await fetchWithTimeout(definition.url);
      if (!response.ok) {
        scrapeErrors.push(`${definition.category}: HTTP ${response.status}`);
        continue;
      }

      const html = await response.text();
      const parsed = uniqueProducts([
        ...extractProductsByPattern(html, definition.category, definition.url),
        ...extractProductsFromText(html, definition.category, definition.url)
      ]).slice(0, 12);

      if (!parsed.length) {
        scrapeErrors.push(`${definition.category}: no se detectaron productos`);
        continue;
      }

      liveProducts.push(...parsed);
    } catch (error: any) {
      scrapeErrors.push(`${definition.category}: ${error?.message || 'error desconocido'}`);
    }
  }

  const uniqueLive = uniqueProducts(liveProducts);
  const fallbackPool = categoryFilter
    ? fallbackProducts.filter((item) => item.categoria === categoryFilter)
    : fallbackProducts;

  const products = uniqueLive.length ? uniqueLive : fallbackPool;

  return {
    products,
    source: uniqueLive.length ? 'live' : 'fallback',
    count: products.length,
    categoryFilter: categoryFilter || 'all',
    generatedAt: new Date().toISOString(),
    scrapeErrors,
    categories: selectedCategories
  };
}
