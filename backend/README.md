# Backend - ITCA PP System

API RESTful construida con NestJS y MongoDB.

## 🚀 Stack Tecnológico

- **Framework**: NestJS 11.0.1
- **Base de Datos**: MongoDB 8.0
- **Lenguaje**: TypeScript 5.7.3
- **ORM**: Mongoose

## 📦 Instalación

```bash
pnpm install
```

## 🗄️ Base de Datos

La base de datos se ejecuta mediante Docker Compose:

```bash
docker-compose up -d
```

**Nota**: El archivo `docker-compose.yml` está en `.gitignore`. Crea tu propio archivo según necesites.

## 🏃 Desarrollo

```bash
pnpm start:dev
```

La API estará disponible en `http://localhost:3000`.

## 📁 Estructura

```
src/
├── config/          # Configuraciones
├── modules/         # Módulos de la aplicación
└── main.ts         # Punto de entrada
```

## 🔧 Path Aliases

- `@/*` → `src/*`
- `@/config/*` → `src/config/*`
- `@/modules/*` → `src/modules/*`





