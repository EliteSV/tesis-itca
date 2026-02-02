# ITCA PP System

Monorepo que contiene el backend y frontend del sistema ITCA PP.

## 🏗️ Arquitectura

Este proyecto utiliza una arquitectura de monorepo con dos aplicaciones principales:

- **Backend**: API RESTful construida con NestJS
- **Frontend**: Aplicación web construida con React y Vite

## 🚀 Stack Tecnológico

### Backend

- **Framework**: NestJS 11.0.1
- **Base de Datos**: MongoDB 8.0
- **Lenguaje**: TypeScript 5.7.3
- **Gestor de Paquetes**: pnpm
- **Node.js**: v25.2.1

**Características**:
- Path aliases configurados (`@/common`, `@/config`, `@/modules`)
- Integración con MongoDB mediante Mongoose
- Docker Compose para entorno de desarrollo

### Frontend

- **Framework**: React 19.2.0
- **Build Tool**: Vite 7.2.4
- **Lenguaje**: TypeScript 5.9.3
- **UI Library**: shadcn/ui
- **Estilos**: Tailwind CSS 4.1.18
- **Gestor de Paquetes**: pnpm

**Características**:
- Path aliases configurados (`@/components`, `@/hooks`, `@/lib`, `@/utils`, `@/types`)
- Componentes UI con shadcn/ui (estilo New York)
- Configuración de tema claro/oscuro

## 📁 Estructura del Proyecto

```
itca-pp-system/
├── backend/          # API NestJS
└── frontend/         # Aplicación React
```



