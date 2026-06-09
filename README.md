Integrantes:

Andres Ferney Buitrago 

Amalia Mercedes Villegas Guerra 

Jhakayra Cardona Montiel

---

# 🗺️ Rutas Turísticas — Sistema Fullstack

Aplicación web para gestión y geoposicionamiento de rutas turísticas.  
**Stack:** React + Vite (frontend) · Spring Boot 3 + JPA (backend) · PostgreSQL (base de datos)

---

## ✅ Requisitos previos

Instalar lo siguiente antes de continuar:

| Herramienta | Versión mínima | Descarga |
|-------------|---------------|----------|
| Java JDK | 17+ | https://adoptium.net |
| Maven | 3.8+ | https://maven.apache.org/download.cgi |
| Node.js | 18+ | https://nodejs.org |
| PostgreSQL | 14+ | https://www.postgresql.org/download |

> **Windows:** Descargar Maven, extraerlo (ej. `C:\tools\maven\`) y agregar la carpeta `bin\` al PATH del sistema.

---

## 🗄️ 1. Configurar la base de datos (PostgreSQL)

Abrir **pgAdmin** o `psql` y crear la base de datos con el nombre exacto:

```sql
CREATE DATABASE "RutasTuristicas";
```

> ℹ️ El proyecto ya usa el usuario `postgres` por defecto. Solo asegúrate de que PostgreSQL esté corriendo en el puerto `5432`.

---

## ⚙️ 2. Configurar el backend

El archivo ya está configurado para este proyecto:

**Ruta:** `springboot-angularjs/backend/src/main/resources/application.properties`

```properties
spring.datasource.url=jdbc:postgresql://localhost:5432/RutasTuristicas
spring.datasource.username=postgres
spring.datasource.password=<tu_contraseña_de_postgres>
spring.jpa.hibernate.ddl-auto=create
spring.jpa.show-sql=true
```

> ⚠️ Cambiar `<tu_contraseña_de_postgres>` por la contraseña real del usuario `postgres` en tu máquina.  
> `ddl-auto=create` recrea las tablas y siembra datos de prueba **en cada inicio**.  
> Cambiar a `update` si se quiere conservar los datos entre reinicios.

---

## 🚀 3. Ejecutar el backend (Spring Boot)

Abrir una terminal en la carpeta `springboot-angularjs/backend/` y ejecutar:

**Linux / macOS:**
```bash
cd springboot-angularjs/backend
./mvnw spring-boot:run
```

**Windows (PowerShell):**
```powershell
cd springboot-angularjs\backend
.\mvnw.cmd spring-boot:run
```

> El backend quedará disponible en **http://localhost:8080**  
> Endpoints principales: `/api/rutas`, `/api/ciudades`, `/api/paises`, `/api/paradas`, `/api/tipos`

---

## 🌐 4. Ejecutar el frontend (React + Vite)

Abrir **otra terminal** en la carpeta raíz del proyecto y ejecutar:

```bash
# Instalar dependencias (solo la primera vez)
npm install

# Iniciar Vite directamente (conectado al backend en :8080)
node ./node_modules/vite/bin/vite.js
```

> El frontend quedará disponible en **http://localhost:5173**  
> El proxy de Vite redirige automáticamente `/api/*` al backend Spring Boot.

---

## 🔁 Orden de inicio recomendado

```
1. Iniciar PostgreSQL
2. Iniciar el backend Spring Boot  →  puerto 8080
3. Iniciar el frontend Vite        →  puerto 5173
4. Abrir http://localhost:5173 en el navegador
```

---

## 📁 Estructura del proyecto

```
Web_RutasTuristicas/
├── src/                        # Frontend React (componentes, páginas)
│   ├── App.tsx                 # Componente principal
│   ├── components/             # RouteMap, AdminPanel, RouteForm, StopForm
│   └── types.ts                # Interfaces TypeScript
├── springboot-angularjs/
│   └── backend/                # Backend Spring Boot
│       ├── src/main/java/      # Controladores, modelos, repositorios
│       └── src/main/resources/ # application.properties
├── vite.config.ts              # Config Vite + proxy /api → :8080
└── package.json
```
