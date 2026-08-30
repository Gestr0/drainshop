// Frontend-only access-key utilities.
// NOTE: This is a client-side simulation. Real on-chain payment
// verification requires a backend + wallet/RPC integration.

const STORAGE_KEY = 'drainshop_keys'
const ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'

/** Generate a unique 10-character alphabetic access key (A-Z). */
export function generateAccessKey(): string {
  let key = ''
  const bytes = new Uint32Array(10)
  crypto.getRandomValues(bytes)
  for (let i = 0; i < 10; i++) {
    key += ALPHABET[bytes[i] % ALPHABET.length]
  }
  return key
}

function readKeys(): string[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? (JSON.parse(raw) as string[]) : []
  } catch {
    return []
  }
}

function writeKeys(keys: string[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(keys))
  } catch {
    // ignore storage failures
  }
}

/** Issue and persist a brand new unique key. */
export function issueKey(): string {
  const existing = readKeys()
  let key = generateAccessKey()
  while (existing.includes(key)) {
    key = generateAccessKey()
  }
  const next = [...existing, key]
  writeKeys(next)
  return key
}

/** Validate the shape of a key: exactly 10 uppercase letters. */
export function isValidKeyFormat(key: string): boolean {
  return /^[A-Z]{10}$/.test(key)
}

/** Check whether a key was issued by this terminal. */
export function isKnownKey(key: string): boolean {
  return readKeys().includes(key.toUpperCase())
}

export const PAYMENT = {
  amount: '20',
  currency: 'USDT',
  network: 'ERC-20 / BEP-20',
  address: '0xE82F8F805351Ee9203DbdC6af62Ee09c6E03C7dC',
}
