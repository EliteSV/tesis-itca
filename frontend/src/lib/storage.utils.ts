const ENCRYPTION_KEY =
  import.meta.env.VITE_STORAGE_ENCRYPTION_KEY ||
  'itca-pp-system-default-key-change-in-production-32';

// Verificar si crypto.subtle está disponible (solo en contextos seguros: HTTPS o localhost)
const isCryptoAvailable = (): boolean => {
  return typeof crypto !== 'undefined' && typeof crypto.subtle !== 'undefined';
};

async function getKey(): Promise<CryptoKey> {
  if (!isCryptoAvailable()) {
    throw new Error('crypto.subtle no está disponible. Se requiere HTTPS o localhost.');
  }

  let keyData: Uint8Array;

  if (ENCRYPTION_KEY.length === 64 && /^[0-9a-fA-F]+$/.test(ENCRYPTION_KEY)) {
    const bytes = ENCRYPTION_KEY.match(/.{1,2}/g)?.map((byte: string) => parseInt(byte, 16)) || [];
    keyData = new Uint8Array(bytes);
  } else if (ENCRYPTION_KEY.length === 44 && ENCRYPTION_KEY.endsWith('=')) {
    const binaryString = atob(ENCRYPTION_KEY);
    keyData = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
      keyData[i] = binaryString.charCodeAt(i);
    }
  } else {
    const encoder = new TextEncoder();
    const keyString = ENCRYPTION_KEY.padEnd(32, '0').slice(0, 32);
    keyData = encoder.encode(keyString);
  }

  const buffer = new ArrayBuffer(keyData.length);
  const view = new Uint8Array(buffer);
  view.set(keyData);

  return crypto.subtle.importKey(
    'raw',
    buffer,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt', 'decrypt'],
  );
}

async function encrypt(text: string): Promise<string> {
  const key = await getKey();
  const encoder = new TextEncoder();
  const data = encoder.encode(text);
  const iv = crypto.getRandomValues(new Uint8Array(12));

  const encrypted = await crypto.subtle.encrypt(
    { name: 'AES-GCM', iv },
    key,
    data,
  );

  const combined = new Uint8Array(iv.length + encrypted.byteLength);
  combined.set(iv);
  combined.set(new Uint8Array(encrypted), iv.length);

  const binary = Array.from(combined, (byte) =>
    String.fromCharCode(byte),
  ).join('');
  return btoa(binary);
}

async function decrypt(encryptedText: string): Promise<string> {
  try {
    const key = await getKey();
    const combined = Uint8Array.from(
      atob(encryptedText),
      (c) => c.charCodeAt(0),
    );

    const iv = combined.slice(0, 12);
    const data = combined.slice(12);

    const decrypted = await crypto.subtle.decrypt(
      { name: 'AES-GCM', iv },
      key,
      data,
    );

    const decoder = new TextDecoder();
    return decoder.decode(decrypted);
  } catch {
    return '';
  }
}

export const encryptedStorage = {
  setItem: async (key: string, value: string): Promise<void> => {
    // Si crypto.subtle no está disponible (HTTP sin HTTPS), usar localStorage sin cifrado
    if (!isCryptoAvailable()) {
      console.warn('crypto.subtle no disponible (HTTP sin HTTPS). Guardando sin cifrado.');
      localStorage.setItem(key, value);
      return;
    }

    try {
      const encrypted = await encrypt(value);
      localStorage.setItem(key, encrypted);
    } catch (error) {
      console.error(`Error al guardar ${key} en encryptedStorage:`, error);
      // Si falla el cifrado, usar fallback sin cifrado
      console.warn('Fallback: guardando sin cifrado debido a error en cifrado');
      localStorage.setItem(key, value);
    }
  },

  getItem: async (key: string): Promise<string | null> => {
    const stored = localStorage.getItem(key);
    if (!stored) return null;

    // Si crypto.subtle no está disponible, asumir que está sin cifrar
    if (!isCryptoAvailable()) {
      return stored;
    }

    try {
      return await decrypt(stored);
    } catch {
      // Si falla el descifrado, puede ser que esté sin cifrar (migración)
      return stored;
    }
  },

  removeItem: (key: string): void => {
    localStorage.removeItem(key);
  },

  clear: (): void => {
    localStorage.clear();
  },
};

