const statusColors = {
  nueva: '#00C48C',
  en_negociacion: '#FFB800',
  contrato_cerrado: '#FF647C',
  invalida: '#8A8A9A',
} as Record<string, string>;

export const darkTheme = {
  bg: '#0A0A0F',
  bgCard: '#14141F',
  bgInput: '#1E1E2E',
  accent: '#6C63FF',
  accentLight: 'rgba(108,99,255,0.15)',
  success: '#00C48C',
  successLight: 'rgba(0,196,140,0.15)',
  warning: '#FFB800',
  warningLight: 'rgba(255,184,0,0.15)',
  danger: '#FF647C',
  error: '#FF647C',
  dangerLight: 'rgba(255,100,124,0.15)',
  textPrimary: '#F0F0F5',
  textSecondary: '#8A8A9A',
  border: '#2A2A3E',
  white: '#FFFFFF',
  statusColors,
};

export const lightTheme: typeof darkTheme = {
  bg: '#F2F2F7',
  bgCard: '#FFFFFF',
  bgInput: '#EBEBF0',
  accent: '#6C63FF',
  accentLight: 'rgba(108,99,255,0.12)',
  success: '#00C48C',
  successLight: 'rgba(0,196,140,0.12)',
  warning: '#E6A700',
  warningLight: 'rgba(230,167,0,0.12)',
  danger: '#E8455A',
  error: '#E8455A',
  dangerLight: 'rgba(232,69,90,0.12)',
  textPrimary: '#1A1A2E',
  textSecondary: '#6B6B80',
  border: '#D8D8E8',
  white: '#FFFFFF',
  statusColors,
};

export type ThemeColors = typeof darkTheme;
