export type Product = {
  id: string;
  nombre: string;
  precio_m2: number;
  imagen: string;
  categoria: string;
  proveedor: string;
  descripcion: string;
  url: string;
  scrapedFrom?: string;
  sourceType?: 'live' | 'fallback';
};

export const fallbackProducts: Product[] = [
  {
    id: 'fallback-ceramica-velum-silver',
    nombre: 'Piso Cerámico Velum Silver 44.8x44.8 cm Caja 2 m2 Holztek',
    precio_m2: 26900,
    imagen: 'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=1200&q=80',
    categoria: 'ceramica',
    proveedor: 'Homecenter',
    descripcion: 'Referencia de respaldo inspirada en el catálogo de cerámicos de Homecenter.',
    url: 'https://www.homecenter.com.co/homecenter-co/category/cat1640001/paredes-y-pisos-ceramicos/',
    scrapedFrom: 'https://www.homecenter.com.co/homecenter-co/category/cat1640001/paredes-y-pisos-ceramicos/',
    sourceType: 'fallback'
  },
  {
    id: 'fallback-ceramica-novara-gris',
    nombre: 'Piso Cerámico Novara Gris 60x60 Cm Caja 1.80 m2 Ceramica Italia',
    precio_m2: 32900,
    imagen: 'https://images.unsplash.com/photo-1484154218962-a197022b5858?auto=format&fit=crop&w=1200&q=80',
    categoria: 'ceramica',
    proveedor: 'Homecenter',
    descripcion: 'Acabado gris moderno para proyectos residenciales y comerciales ligeros.',
    url: 'https://www.homecenter.com.co/homecenter-co/category/cat1640001/paredes-y-pisos-ceramicos/',
    scrapedFrom: 'https://www.homecenter.com.co/homecenter-co/category/cat1640001/paredes-y-pisos-ceramicos/',
    sourceType: 'fallback'
  },
  {
    id: 'fallback-porcelanato',
    nombre: 'Porcelánico tipo mármol premium Homecenter',
    precio_m2: 68900,
    imagen: 'https://images.unsplash.com/photo-1616594039964-3f3bfa4f497f?auto=format&fit=crop&w=1200&q=80',
    categoria: 'porcelanato',
    proveedor: 'Homecenter',
    descripcion: 'Respaldo temporal para cuando el scraping en vivo no responda.',
    url: 'https://www.homecenter.com.co/homecenter-co/category/cat1640011/paredes-y-pisos-porcelanicos/',
    scrapedFrom: 'https://www.homecenter.com.co/homecenter-co/category/cat1640011/paredes-y-pisos-porcelanicos/',
    sourceType: 'fallback'
  },
  {
    id: 'fallback-laminado',
    nombre: 'Piso laminado roble natural Homecenter',
    precio_m2: 59900,
    imagen: 'https://images.unsplash.com/photo-1502005097973-6a7082348e28?auto=format&fit=crop&w=1200&q=80',
    categoria: 'laminado',
    proveedor: 'Homecenter',
    descripcion: 'Opción visual para simulación cuando la consulta en vivo falle.',
    url: 'https://www.homecenter.com.co/homecenter-co/category/cat660015/pisos-laminados/',
    scrapedFrom: 'https://www.homecenter.com.co/homecenter-co/category/cat660015/pisos-laminados/',
    sourceType: 'fallback'
  },
  {
    id: 'fallback-vinilico',
    nombre: 'Piso vinílico madera clara Homecenter',
    precio_m2: 54900,
    imagen: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=1200&q=80',
    categoria: 'vinilico',
    proveedor: 'Homecenter',
    descripcion: 'Alternativa resistente a humedad con apariencia madera.',
    url: 'https://www.homecenter.com.co/homecenter-co/category/cat660016/pisos-vinilicos/',
    scrapedFrom: 'https://www.homecenter.com.co/homecenter-co/category/cat660016/pisos-vinilicos/',
    sourceType: 'fallback'
  },
  {
    id: 'fallback-madera',
    nombre: 'Piso de madera natural Homecenter',
    precio_m2: 109900,
    imagen: 'https://images.unsplash.com/photo-1448630360428-65456885c650?auto=format&fit=crop&w=1200&q=80',
    categoria: 'madera',
    proveedor: 'Homecenter',
    descripcion: 'Respaldo visual de línea madera premium.',
    url: 'https://www.homecenter.com.co/homecenter-co/category/cat940066/pisos-de-madera/',
    scrapedFrom: 'https://www.homecenter.com.co/homecenter-co/category/cat940066/pisos-de-madera/',
    sourceType: 'fallback'
  }
];

export const categoryDefinitions = [
  {
    category: 'ceramica',
    label: 'Cerámica',
    url: 'https://www.homecenter.com.co/homecenter-co/category/cat1640001/paredes-y-pisos-ceramicos/'
  },
  {
    category: 'porcelanato',
    label: 'Porcelanato',
    url: 'https://www.homecenter.com.co/homecenter-co/category/cat1640011/paredes-y-pisos-porcelanicos/'
  },
  {
    category: 'laminado',
    label: 'Laminado',
    url: 'https://www.homecenter.com.co/homecenter-co/category/cat660015/pisos-laminados/'
  },
  {
    category: 'vinilico',
    label: 'Vinílico',
    url: 'https://www.homecenter.com.co/homecenter-co/category/cat660016/pisos-vinilicos/'
  },
  {
    category: 'madera',
    label: 'Madera',
    url: 'https://www.homecenter.com.co/homecenter-co/category/cat940066/pisos-de-madera/'
  }
] as const;
