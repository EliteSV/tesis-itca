/**
 * Utilidades para validación y normalización de números de teléfono de El Salvador
 * Formato E.164: +503XXXXXXXX
 */

/**
 * Normaliza un número de teléfono al formato E.164 (+503XXXXXXXX)
 * @param phone - Número de teléfono a normalizar
 * @returns Número normalizado en formato E.164 o null si es inválido
 */
export function normalizePhoneToE164(
  phone: string | undefined | null,
): string | null {
  if (!phone || typeof phone !== "string") {
    return null;
  }

  // Eliminar espacios, guiones y otros caracteres especiales
  let digits = phone.replace(/[\s\-().]/g, "");

  // Si empieza con +503, removerlo para procesar solo los dígitos
  if (digits.startsWith("+503")) {
    digits = digits.slice(4);
  } else if (digits.startsWith("503")) {
    digits = digits.slice(3);
  }

  // Validar que solo contenga dígitos y tenga exactamente 8 dígitos
  if (!/^\d{8}$/.test(digits)) {
    return null;
  }

  // Validar que el primer dígito sea 2, 6 o 7
  const firstDigit = digits[0];
  if (!["2", "6", "7"].includes(firstDigit)) {
    return null;
  }

  return `+503${digits}`;
}

/**
 * Valida si un número de teléfono es válido según las reglas de El Salvador
 * @param phone - Número de teléfono a validar
 * @returns true si es válido, false en caso contrario
 */
export function isValidPhone(phone: string | undefined | null): boolean {
  return normalizePhoneToE164(phone) !== null;
}

/**
 * Formatea un número de teléfono para visualización (####-####)
 * @param phone - Número de teléfono a formatear
 * @returns Número formateado o string vacío si es inválido
 */
export function formatPhoneForDisplay(
  phone: string | undefined | null,
): string {
  if (!phone || typeof phone !== "string") {
    return "";
  }

  // Eliminar espacios, guiones y otros caracteres especiales
  let digits = phone.replace(/[\s\-().]/g, "");

  // Si empieza con +503, removerlo
  if (digits.startsWith("+503")) {
    digits = digits.slice(4);
  } else if (digits.startsWith("503")) {
    digits = digits.slice(3);
  }

  // Solo dígitos, máximo 8
  digits = digits.replace(/\D/g, "").slice(0, 8);

  // Formatear como ####-####
  if (digits.length <= 4) {
    return digits;
  } else {
    return `${digits.slice(0, 4)}-${digits.slice(4, 8)}`;
  }
}

/**
 * Obtiene el mensaje de error apropiado para un número de teléfono inválido
 * @param phone - Número de teléfono a validar
 * @returns Mensaje de error o null si es válido
 */
export function getPhoneErrorMessage(
  phone: string | undefined | null,
): string | null {
  if (!phone || typeof phone !== "string" || phone.trim() === "") {
    return null; // Campo opcional, no hay error si está vacío
  }

  // Eliminar espacios, guiones y otros caracteres especiales
  let digits = phone.replace(/[\s\-().]/g, "");

  // Si empieza con +503, removerlo
  if (digits.startsWith("+503")) {
    digits = digits.slice(4);
  } else if (digits.startsWith("503")) {
    digits = digits.slice(3);
  }

  // Solo dígitos
  digits = digits.replace(/\D/g, "");

  if (digits.length === 0) {
    return "El teléfono solo puede contener números";
  }

  if (digits.length < 8) {
    return "El teléfono debe tener 8 dígitos";
  }

  if (digits.length > 8) {
    return "El teléfono no puede tener más de 8 dígitos";
  }

  if (digits.length > 0) {
    const firstDigit = digits[0];
    if (!["2", "6", "7"].includes(firstDigit)) {
      return "El teléfono debe comenzar con 2 (fijo), 6 o 7 (móvil)";
    }
  }

  return null;
}
