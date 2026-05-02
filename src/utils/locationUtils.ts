// Tabla de lookup simplificada para Costa Rica (expandir según necesidad)
const CR_REGIONS: Record<string, { canton: string; distrito: string }[]> = {
  'San José': [
    { canton: 'San José', distrito: 'Carmen' },
    { canton: 'San José', distrito: 'Merced' },
    { canton: 'Escazú', distrito: 'San Rafael' },
    { canton: 'Desamparados', distrito: 'San Miguel' },
    { canton: 'Puriscal', distrito: 'Santiago' },
    { canton: 'Tibás', distrito: 'San Juan' },
    { canton: 'Moravia', distrito: 'San Vicente' },
    { canton: 'Montes de Oca', distrito: 'San Pedro' },
    { canton: 'Turrialba', distrito: 'Turrialba' },
    { canton: 'Curridabat', distrito: 'Curridabat' },
    { canton: 'Curridabat', distrito: 'Granadilla' },
  ],
  Alajuela: [
    { canton: 'Alajuela', distrito: 'Alajuela' },
    { canton: 'San Ramón', distrito: 'San Ramón' },
    { canton: 'Grecia', distrito: 'Grecia' },
  ],
  Cartago: [
    { canton: 'Cartago', distrito: 'Oriental' },
    { canton: 'Paraíso', distrito: 'Paraíso' },
    { canton: 'La Unión', distrito: 'Tres Ríos' },
  ],
  Heredia: [
    { canton: 'Heredia', distrito: 'Heredia' },
    { canton: 'Barva', distrito: 'Barva' },
    { canton: 'Santa Bárbara', distrito: 'Santa Bárbara' },
  ],
  Guanacaste: [{ canton: 'Liberia', distrito: 'Liberia' }],
  Puntarenas: [{ canton: 'Puntarenas', distrito: 'Puntarenas' }],
  Limón: [{ canton: 'Limón', distrito: 'Limón' }],
};

/**
 * Convierte coordenadas GPS en Provincia/Cantón/Distrito (lógica simplificada por bounding boxes).
 * En producción, usar reverse geocoding de Google Maps o Nominatim.
 */
export const coordsToLocation = (
  lat: number,
  lng: number,
): { provincia: string; canton: string; distrito: string } => {
  // Bounding boxes aproximadas para provincias de Costa Rica
  if (lat >= 9.7 && lat <= 10.2 && lng >= -84.4 && lng <= -83.7) {
    const provincia = 'San José';
    const regions = CR_REGIONS[provincia];
    // Detectar cantón por sub-bounding box
    if (lat >= 9.89 && lat <= 9.95 && lng >= -84.15 && lng <= -84.05) {
      return { provincia, canton: 'Curridabat', distrito: 'Granadilla' };
    }
    if (lat >= 9.93 && lng >= -84.07 && lng <= -84.0) {
      return { provincia, canton: 'Montes de Oca', distrito: 'San Pedro' };
    }
    if (lat >= 9.87 && lat <= 9.91 && lng >= -84.12 && lng <= -84.0) {
      return { provincia, canton: 'Desamparados', distrito: 'San Miguel' };
    }
    // Fallback aleatorio dentro de SJ
    const r = regions[Math.floor(Math.random() * regions.length)];
    return { provincia, canton: r.canton, distrito: r.distrito };
  }
  if (lat >= 9.9 && lat <= 10.3 && lng >= -84.7 && lng <= -84.1) {
    const provincia = 'Alajuela';
    return { provincia, canton: 'Alajuela', distrito: 'Alajuela' };
  }
  if (lat >= 9.8 && lat <= 10.0 && lng >= -83.8 && lng <= -83.5) {
    return { provincia: 'Cartago', canton: 'Cartago', distrito: 'Oriental' };
  }
  if (lat >= 10.0 && lat <= 10.2 && lng >= -84.2 && lng <= -83.9) {
    return { provincia: 'Heredia', canton: 'Heredia', distrito: 'Heredia' };
  }
  // Default
  return { provincia: 'San José', canton: 'San José', distrito: 'Carmen' };
};

export const formatCurrency = (amount: number): string => {
  return `₡${amount.toLocaleString('es-CR')}`;
};

export const formatDate = (iso: string): string => {
  return new Date(iso).toLocaleDateString('es-CR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
};