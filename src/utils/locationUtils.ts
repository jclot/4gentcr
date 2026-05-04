// ─── Tipos ────────────────────────────────────────────────────────────────────
export interface LocationResult {
  provincia: string;
  canton: string;
  distrito: string;
}

/**
 * Convierte coordenadas GPS a Provincia / Cantón / Distrito usando
 * Nominatim (OpenStreetMap) — sin API key, gratis, exacto.
 *
 * Nominatim requiere User-Agent no vacío y max 1 req/seg.
 * En producción considerá cachear el resultado.
 */
export const reverseGeocodeLocation = async (
  lat: number,
  lng: number,
): Promise<LocationResult> => {
  try {
    const url =
      `https://nominatim.openstreetmap.org/reverse` +
      `?lat=${lat}&lon=${lng}&format=json&accept-language=es` +
      `&addressdetails=1&zoom=18`;

    const res = await fetch(url, {
      headers: {
        'User-Agent': 'VirtualAgentApp/1.0 (bienes.raices.cr)',
        'Accept-Language': 'es',
      },
    });

    if (!res.ok) throw new Error(`HTTP ${res.status}`);

    const data = await res.json();
    const addr = data.address ?? {};

    // ── Provincia ──────────────────────────────────────────────────────────
    // Nominatim devuelve: "Provincia de San José", "Provincia San José", "San José"
    const rawProvincia: string = addr.state ?? addr.province ?? '';
    const provincia = rawProvincia
      .replace(/^Provincia\s+(de\s+)?/i, '')
      .trim() || 'San José';

    // ── Cantón ─────────────────────────────────────────────────────────────
    // En CR, 'county' suele ser el cantón. Fallbacks en orden de precisión.
    const canton: string =
      addr.county ??
      addr.municipality ??
      addr.city ??
      addr.town ??
      addr.village ??
      'Desconocido';

    // ── Distrito ───────────────────────────────────────────────────────────
    // Nominatim puede devolver suburb, quarter, district, neighbourhood, hamlet
    const distrito: string =
      addr.suburb ??
      addr.quarter ??
      addr.district ??
      addr.neighbourhood ??
      addr.hamlet ??
      addr.residential ??
      canton; // fallback: mismo que cantón

    return { provincia, canton, distrito };
  } catch (err) {
    console.warn('[Nominatim] reverse geocoding falló, usando fallback:', err);
    // Fallback de bounding boxes básico (solo San José metropolitano)
    return fallbackLocation(lat, lng);
  }
};

/** Fallback offline si Nominatim no responde */
const fallbackLocation = (lat: number, lng: number): LocationResult => {
  if (lat >= 9.91 && lat <= 9.96 && lng >= -84.10 && lng <= -84.04) {
    return { provincia: 'San José', canton: 'Curridabat', distrito: 'Granadilla' };
  }
  if (lat >= 9.93 && lat <= 9.95 && lng >= -84.06 && lng <= -84.0) {
    return { provincia: 'San José', canton: 'Montes de Oca', distrito: 'San Pedro' };
  }
  if (lat >= 9.87 && lat <= 9.91 && lng >= -84.12 && lng <= -84.0) {
    return { provincia: 'San José', canton: 'Desamparados', distrito: 'San Miguel' };
  }
  return { provincia: 'San José', canton: 'San José', distrito: 'Carmen' };
};

// ─── Utilidades ───────────────────────────────────────────────────────────────
export const formatCurrency = (amount: number): string =>
  `₡${amount.toLocaleString('es-CR')}`;

export const formatDate = (iso: string): string =>
  new Date(iso).toLocaleDateString('es-CR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });

/** Regex de validación de correo electrónico */
export const isValidEmail = (email: string): boolean =>
  /^[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}$/.test(email.trim());