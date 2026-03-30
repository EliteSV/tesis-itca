import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Construye la URL completa de una imagen desde una ruta relativa
 * @param imagePath - Ruta relativa de la imagen (ej: '/uploads/logos/company-123.jpg')
 * @returns URL completa de la imagen
 */
export function getImageUrl(imagePath?: string | null): string {
  if (!imagePath) return '';
  const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000';
  // Si la ruta ya es una URL completa, retornarla tal cual
  if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
    return imagePath;
  }
  // Construir la URL completa
  return `${baseUrl}${imagePath}`;
}
