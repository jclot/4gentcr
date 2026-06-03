// Pure TypeScript TOTP implementation — RFC 6238 / RFC 4226.
// No external dependencies; runs on Hermes (React Native).

// ── Base32 ────────────────────────────────────────────────────────────────────

const B32 = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';

function base32Decode(input: string): Uint8Array {
  const s = input.toUpperCase().replace(/=+$/, '');
  const out = new Uint8Array(Math.floor((s.length * 5) / 8));
  let bits = 0, acc = 0, idx = 0;
  for (const ch of s) {
    const v = B32.indexOf(ch);
    if (v < 0) continue;
    acc = (acc << 5) | v;
    bits += 5;
    if (bits >= 8) {
      out[idx++] = (acc >>> (bits - 8)) & 0xff;
      bits -= 8;
    }
  }
  return out.slice(0, idx);
}

// ── SHA-1 ─────────────────────────────────────────────────────────────────────

function sha1(msg: Uint8Array): Uint8Array {
  const bytes = Array.from(msg);
  const bitLen = bytes.length * 8;
  bytes.push(0x80);
  while (bytes.length % 64 !== 56) bytes.push(0);
  const hi = Math.floor(bitLen / 0x100000000);
  const lo = bitLen >>> 0;
  bytes.push(
    (hi >>> 24) & 0xff, (hi >>> 16) & 0xff, (hi >>> 8) & 0xff, hi & 0xff,
    (lo >>> 24) & 0xff, (lo >>> 16) & 0xff, (lo >>> 8) & 0xff, lo & 0xff,
  );

  let h0 = 0x67452301, h1 = 0xefcdab89, h2 = 0x98badcfe,
    h3 = 0x10325476, h4 = 0xc3d2e1f0;

  for (let off = 0; off < bytes.length; off += 64) {
    const w = new Array<number>(80);
    for (let i = 0; i < 16; i++) {
      w[i] = (
        (bytes[off + i * 4] << 24) | (bytes[off + i * 4 + 1] << 16) |
        (bytes[off + i * 4 + 2] << 8) | bytes[off + i * 4 + 3]
      ) >>> 0;
    }
    for (let i = 16; i < 80; i++) {
      const n = w[i - 3] ^ w[i - 8] ^ w[i - 14] ^ w[i - 16];
      w[i] = ((n << 1) | (n >>> 31)) >>> 0;
    }

    let a = h0, b = h1, c = h2, d = h3, e = h4;
    for (let i = 0; i < 80; i++) {
      let f: number, k: number;
      if (i < 20) { f = (b & c) | (~b & d); k = 0x5a827999; }
      else if (i < 40) { f = b ^ c ^ d; k = 0x6ed9eba1; }
      else if (i < 60) { f = (b & c) | (b & d) | (c & d); k = 0x8f1bbcdc; }
      else { f = b ^ c ^ d; k = 0xca62c1d6; }
      const t = ((((a << 5) | (a >>> 27)) >>> 0) + f + e + k + w[i]) >>> 0;
      e = d; d = c; c = ((b << 30) | (b >>> 2)) >>> 0; b = a; a = t;
    }

    h0 = (h0 + a) >>> 0; h1 = (h1 + b) >>> 0; h2 = (h2 + c) >>> 0;
    h3 = (h3 + d) >>> 0; h4 = (h4 + e) >>> 0;
  }

  const out = new Uint8Array(20);
  const dv = new DataView(out.buffer);
  dv.setUint32(0, h0); dv.setUint32(4, h1); dv.setUint32(8, h2);
  dv.setUint32(12, h3); dv.setUint32(16, h4);
  return out;
}

// ── HMAC-SHA1 ─────────────────────────────────────────────────────────────────

function hmacSha1(key: Uint8Array, msg: Uint8Array): Uint8Array {
  const B = 64;
  const k = key.length > B ? sha1(key) : key;
  const kPad = new Uint8Array(B);
  kPad.set(k);
  const iKey = new Uint8Array(B + msg.length);
  const oKey = new Uint8Array(B + 20);
  for (let i = 0; i < B; i++) { iKey[i] = kPad[i] ^ 0x36; oKey[i] = kPad[i] ^ 0x5c; }
  iKey.set(msg, B);
  oKey.set(sha1(iKey), B);
  return sha1(oKey);
}

// ── HOTP ──────────────────────────────────────────────────────────────────────

function hotp(key: Uint8Array, counter: number): string {
  const msg = new Uint8Array(8);
  let c = counter;
  for (let i = 7; i >= 0; i--) { msg[i] = c & 0xff; c = Math.floor(c / 256); }
  const h = hmacSha1(key, msg);
  const off = h[19] & 0x0f;
  const code =
    ((h[off] & 0x7f) << 24) | ((h[off + 1] & 0xff) << 16) |
    ((h[off + 2] & 0xff) << 8) | (h[off + 3] & 0xff);
  return String(code % 1_000_000).padStart(6, '0');
}

// ── Public API ────────────────────────────────────────────────────────────────

/**
 * Verify a 6-digit TOTP code against a Base32 secret.
 * Accepts ±1 time-step (30 s window) to tolerate clock drift.
 */
export function verifyTOTP(secret: string, token: string): boolean {
  const key = base32Decode(secret);
  const step = Math.floor(Date.now() / 1000 / 30);
  for (let delta = -1; delta <= 1; delta++) {
    if (hotp(key, step + delta) === token) return true;
  }
  return false;
}

/** Generate the current TOTP code — useful in tests and debug screens. */
export function generateTOTP(secret: string): string {
  return hotp(base32Decode(secret), Math.floor(Date.now() / 1000 / 30));
}
