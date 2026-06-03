// Mock 2FA auth service — replace with real API calls before shipping to production.

import { verifyTOTP } from '../utils/totp';

// Single mock secret shared across all test accounts.
// When scanning the QR, the user's authenticator will be seeded with this secret.
export const MOCK_TOTP_SECRET = 'JBSWY3DPEHPK3PXP';

export interface TwoFASecretResult {
  secret: string;
  otpAuthUrl: string;
}

function _delay(ms: number) {
  return new Promise<void>((resolve) => setTimeout(resolve, ms));
}

function _assertFormat(pin: string): void {
  if (!/^\d{6}$/.test(pin)) throw new Error('Código inválido. Ingresa exactamente 6 dígitos.');
}

function _assertTOTP(pin: string): void {
  _assertFormat(pin);
  if (!verifyTOTP(MOCK_TOTP_SECRET, pin)) {
    throw new Error('Código incorrecto. Verifica la hora de tu dispositivo e intenta de nuevo.');
  }
}

// Simulates backend generating a new TOTP secret tied to the account.
export async function generate2FASecret(userId: string): Promise<TwoFASecretResult> {
  await _delay(500);
  const label = encodeURIComponent(`VirtualAgent:${userId}`);
  const otpAuthUrl = `otpauth://totp/${label}?secret=${MOCK_TOTP_SECRET}&issuer=VirtualAgent`;
  return { secret: MOCK_TOTP_SECRET, otpAuthUrl };
}

// Validates that the user's authenticator app was configured correctly.
export async function verify2FASetup(pin: string): Promise<void> {
  await _delay(300);
  _assertTOTP(pin);
}

// Confirms identity before removing 2FA protection.
export async function disable2FA(pin: string): Promise<void> {
  await _delay(300);
  _assertTOTP(pin);
}

// Full login with a 2FA challenge.
export async function loginWith2FA(
  _email: string,
  _password: string,
  pin: string,
): Promise<void> {
  await _delay(300);
  _assertTOTP(pin);
}
