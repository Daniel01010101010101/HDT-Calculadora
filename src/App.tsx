import { useEffect, useMemo, useState } from 'react';
import { jsPDF } from 'jspdf';

type Product = {
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

type ProductsResponse = {
  products: Product[];
  source: 'live' | 'fallback';
  count: number;
  generatedAt: string;
  scrapeErrors: string[];
};

type Breakdown = {
  area: number;
  producto: Product;
  materiales: number;
  manoObra: number;
  adhesivos: number;
  transporte: number;
  imprevistos: number;
  total: number;
  precioFinalM2: number;
  source: 'live' | 'fallback';
  generatedAt: string;
  scrapeErrors: string[];
};

const categories = [
  { value: 'ceramica', label: 'Cerámica' },
  { value: 'porcelanato', label: 'Porcelanato' },
  { value: 'laminado', label: 'Laminado' },
  { value: 'vinilico', label: 'Vinílico' },
  { value: 'madera', label: 'Madera' }
];

const currency = (value: number) =>
  new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(value);

export default function App() {
  const [category, setCategory] = useState('ceramica');
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedId, setSelectedId] = useState('');
  const [area, setArea] = useState(20);
  const [includeLabor, setIncludeLabor] = useState(true);
  const [includeAdhesive, setIncludeAdhesive] = useState(true);
  const [includeTransport, setIncludeTransport] = useState(true);
  const [contingencyPct, setContingencyPct] = useState(5);
  const [quote, setQuote] = useState<Breakdown | null>(null);
  const [source, setSource] = useState<'live' | 'fallback'>('fallback');
  const [generatedAt, setGeneratedAt] = useState('');
  const [scrapeErrors, setScrapeErrors] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [calculating, setCalculating] = useState(false);

  useEffect(() => {
    let ignore = false;
    setLoading(true);
    fetch(`/api/products?category=${encodeURIComponent(category)}`)
      .then((res) => res.json())
      .then((data: ProductsResponse) => {
        if (ignore) return;
        setProducts(data.products || []);
        setSelectedId(data.products?.[0]?.id || '');
        setSource(data.source || 'fallback');
        setGeneratedAt(data.generatedAt || '');
        setScrapeErrors(data.scrapeErrors || []);
      })
      .catch(() => {
        if (ignore) return;
        setProducts([]);
        setSelectedId('');
        setSource('fallback');
        setGeneratedAt('');
        setScrapeErrors(['No fue posible consultar el catálogo en este momento.']);
      })
      .finally(() => {
        if (!ignore) setLoading(false);
      });

    return () => {
      ignore = true;
    };
  }, [category]);

  const selectedProduct = useMemo(() => products.find((item) => item.id === selectedId) || null, [products, selectedId]);

  useEffect(() => {
    if (!selectedProduct || !area || area <= 0) {
      setQuote(null);
      return;
    }

    setCalculating(true);
    fetch('/api/calculate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        area,
        productId: selectedProduct.id,
        category,
        includeLabor,
        includeAdhesive,
        includeTransport,
        contingencyPct
      })
    })
      .then((res) => res.json())
      .then((data) => setQuote(data))
      .finally(() => setCalculating(false));
  }, [selectedProduct, area, includeLabor, includeAdhesive, includeTransport, contingencyPct, category]);

  const downloadPDF = () => {
    if (!quote) return;

    const doc = new jsPDF();
    doc.setFillColor(225, 6, 0);
    doc.rect(0, 0, 210, 22, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(18);
    doc.text('HDT Proyectos y Servicios', 14, 14);

    doc.setTextColor(20, 20, 20);
    doc.setFontSize(11);
    doc.text(`Fecha: ${new Date().toLocaleDateString('es-CO')}`, 14, 32);
    doc.text(`Fuente de precios: ${quote.source === 'live' ? 'Scraping en vivo Homecenter' : 'Respaldo temporal'}`, 14, 38);
    doc.text(`Producto: ${quote.producto.nombre}`, 14, 44, { maxWidth: 180 });
    doc.text(`Área: ${quote.area} m²`, 14, 54);

    const rows = [
      ['Materiales', currency(quote.materiales)],
      ['Mano de obra', currency(quote.manoObra)],
      ['Adhesivos', currency(quote.adhesivos)],
      ['Transporte', currency(quote.transporte)],
      ['Imprevistos', currency(quote.imprevistos)],
      ['TOTAL', currency(quote.total)],
      ['Precio final por m²', currency(quote.precioFinalM2)]
    ];

    let y = 70;
    rows.forEach(([label, value], index) => {
      if (index === rows.length - 2) {
        doc.setFillColor(245, 245, 245);
        doc.rect(12, y - 6, 186, 10, 'F');
      }
      doc.text(label, 16, y);
      doc.text(String(value), 138, y);
      y += 12;
    });

    doc.setTextColor(80, 80, 80);
    doc.text('Cotización válida por 15 días.', 14, y + 8);
    doc.text('Los precios dependen de disponibilidad y cambios del catálogo externo.', 14, y + 16, { maxWidth: 180 });
    doc.save('cotizacion-hdt-homecenter.pdf');
  };

  return (
    <div className="app-shell">
      <div className="hero-backdrop" />
      <header className="hero">
        <div className="hero-copy">
          <span className="eyebrow">Cotizador con scraping en vivo</span>
          <h1>HDT Proyectos y Servicios</h1>
          <p>
            Cotiza pisos con una interfaz comercial en rojo, blanco y negro, consultando categorías de Homecenter y
            mostrando el desglose completo de materiales, mano de obra y costos adicionales.
          </p>
          <div className="hero-badges">
            <span>{source === 'live' ? 'Precios en vivo' : 'Modo respaldo'}</span>
            <span>{generatedAt ? new Date(generatedAt).toLocaleString('es-CO') : 'Sin fecha'}</span>
          </div>
        </div>
      </header>

      <main className="layout-grid">
        <section className="panel primary-panel">
          <div className="section-head">
            <div>
              <h2>Elige tu piso</h2>
              <p>Selecciona la categoría y luego el producto que quieres cotizar.</p>
            </div>
            <div className="selector-wrap">
              <label htmlFor="category">Tipo de piso</label>
              <select id="category" value={category} onChange={(e) => setCategory(e.target.value)}>
                {categories.map((item) => (
                  <option key={item.value} value={item.value}>
                    {item.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {loading ? (
            <div className="loading-card">Consultando Homecenter...</div>
          ) : products.length ? (
            <div className="products-grid">
              {products.map((product) => (
                <button
                  key={product.id}
                  className={`product-card ${selectedId === product.id ? 'active' : ''}`}
                  onClick={() => setSelectedId(product.id)}
                >
                  <div className="image-wrap">
                    <img src={product.imagen} alt={product.nombre} />
                    <span className="supplier-pill">{product.sourceType === 'live' ? 'Homecenter live' : 'Respaldo'}</span>
                  </div>
                  <div className="product-body">
                    <span className="product-category">{categories.find((c) => c.value === product.categoria)?.label || product.categoria}</span>
                    <h3>{product.nombre}</h3>
                    <p>{product.descripcion}</p>
                    <div className="price-row">
                      <strong>{currency(product.precio_m2)}</strong>
                      <span>por m²</span>
                    </div>
                    <a
                      className="product-link"
                      href={product.url}
                      target="_blank"
                      rel="noreferrer"
                      onClick={(e) => e.stopPropagation()}
                    >
                      Ver en Homecenter
                    </a>
                  </div>
                </button>
              ))}
            </div>
          ) : (
            <div className="loading-card">No se encontraron productos para esta categoría.</div>
          )}

          {!!scrapeErrors.length && (
            <div className="warning-box">
              <strong>Observación técnica:</strong>
              <span>algunas consultas al sitio externo fallaron y la app puede usar datos de respaldo.</span>
            </div>
          )}
        </section>

        <section className="panel side-panel">
          <h2>Configura la cotización</h2>
          <div className="field-grid">
            <label>
              Área a cubrir (m²)
              <input type="number" min="1" value={area} onChange={(e) => setArea(Number(e.target.value) || 0)} />
            </label>
            <label>
              Imprevistos (%)
              <input
                type="number"
                min="0"
                max="20"
                value={contingencyPct}
                onChange={(e) => setContingencyPct(Number(e.target.value) || 0)}
              />
            </label>
          </div>

          <div className="checks">
            <label><input type="checkbox" checked={includeLabor} onChange={() => setIncludeLabor((v) => !v)} /> Incluir mano de obra</label>
            <label><input type="checkbox" checked={includeAdhesive} onChange={() => setIncludeAdhesive((v) => !v)} /> Incluir adhesivos</label>
            <label><input type="checkbox" checked={includeTransport} onChange={() => setIncludeTransport((v) => !v)} /> Incluir transporte</label>
          </div>

          <div className="selected-summary">
            <span>Producto elegido</span>
            <strong>{selectedProduct?.nombre || 'Selecciona un producto'}</strong>
            <small>{selectedProduct ? `${currency(selectedProduct.precio_m2)} / m²` : 'Sin selección'}</small>
          </div>

          {quote ? (
            <div className="quote-box">
              <div className="quote-row"><span>Materiales</span><strong>{currency(quote.materiales)}</strong></div>
              <div className="quote-row"><span>Mano de obra</span><strong>{currency(quote.manoObra)}</strong></div>
              <div className="quote-row"><span>Adhesivos</span><strong>{currency(quote.adhesivos)}</strong></div>
              <div className="quote-row"><span>Transporte</span><strong>{currency(quote.transporte)}</strong></div>
              <div className="quote-row"><span>Imprevistos</span><strong>{currency(quote.imprevistos)}</strong></div>
              <div className="quote-row total"><span>Total</span><strong>{currency(quote.total)}</strong></div>
              <div className="quote-row"><span>Precio final por m²</span><strong>{currency(quote.precioFinalM2)}</strong></div>
            </div>
          ) : (
            <div className="loading-card compact">Completa la selección para ver la cotización.</div>
          )}

          <button className="cta" onClick={downloadPDF} disabled={!quote || calculating}>
            {calculating ? 'Recalculando...' : 'Descargar cotización PDF'}
          </button>
        </section>
      </main>
    </div>
  );
}
