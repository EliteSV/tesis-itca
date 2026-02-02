# Dependencias para Validación de Documentos

Este documento describe las dependencias necesarias para el sistema de validación de documentos de solvencia de horas sociales.

## Dependencias Requeridas

Las siguientes dependencias son necesarias para la funcionalidad de validación de documentos:

```bash
npm install openai pdf-poppler
```

### Descripción de Dependencias

- **`openai`**: SDK oficial de OpenAI para realizar validaciones con GPT-4 Vision API
- **`pdf-poppler`**: Librería para convertir archivos PDF a imágenes PNG usando poppler-utils

### Dependencias del Sistema

**`pdf-poppler`** requiere que `poppler-utils` esté instalado en el sistema:

- **macOS**: `brew install poppler`
- **Ubuntu/Debian**: `sudo apt-get install poppler-utils`
- **Windows**: Descargar desde https://github.com/oschwartz10612/poppler-windows/releases

## Variables de Entorno

Agrega la siguiente variable a tu archivo `.env`:

```env
OPENAI_API_KEY=tu_api_key_de_openai
```

### Cómo Obtener una API Key

1. Visita https://platform.openai.com/api-keys
2. Inicia sesión o crea una cuenta
3. Crea una nueva API key
4. Copia la key y agrégala a tu archivo `.env`

## Instalación

### 1. Instalar poppler-utils (requerido por pdf-poppler)

**macOS:**
```bash
brew install poppler
```

**Ubuntu/Debian:**
```bash
sudo apt-get update
sudo apt-get install poppler-utils
```

**Windows:**
Descarga e instala desde: https://github.com/oschwartz10612/poppler-windows/releases

### 2. Instalar dependencias de Node.js

Ejecuta en el directorio `backend`:

```bash
cd backend
npm install openai pdf-poppler
```

## Funcionamiento

El sistema de validación funciona de la siguiente manera:

1. **Conversión de PDF a Imágenes**: El documento PDF se convierte a imágenes PNG de alta resolución usando `pdf-poppler` (que utiliza `poppler-utils` del sistema)
2. **Análisis con OpenAI**: Las imágenes se envían a GPT-4 Vision API junto con:
   - El documento de referencia (`solvencia_horas_sociales.pdf`)
   - La imagen del sello oficial válido (`sello_aprobado.png`)
3. **Validación**: OpenAI analiza el documento y verifica:
   - Formato correcto (estructura y secciones principales)
   - Presencia de sello oficial válido (obligatorio)
4. **Resultado**: Se retorna un resultado con errores y advertencias si el documento no cumple con los requisitos

## Archivos de Referencia

Los siguientes archivos deben estar presentes en `backend/src/assets/`:

- `solvencia_horas_sociales.pdf`: Documento de referencia con el formato correcto
- `sello_aprobado.png`: Imagen del sello oficial válido que debe contener el documento

## Notas Importantes

- El sistema acepta documentos con información escrita a mano
- El sello oficial es **obligatorio** para que el documento sea válido
- Los documentos deben ser archivos PDF con un tamaño máximo de 10MB
- La validación puede tardar algunos segundos debido al procesamiento de imágenes y la llamada a OpenAI
