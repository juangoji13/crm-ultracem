# 🏗️ CRM Gamificado B2B — Ultracem S.A.S.

Sistema de Gestión Comercial y Gamificación B2B para la fuerza de ventas de **Ultracem S.A.S.** (Barranquilla, Colombia — Operación Costa Caribe).

---

## 📌 Documentación de Entrega Oficial

| Documento | Enlace | Descripción |
| :--- | :--- | :--- |
| **🎨 Guía Oficial de Marca & Catálogo de Pantallas** | [GUIA_DE_MARCA.md](./GUIA_DE_MARCA.md) | Sistema de diseño, paleta cromática, geometría rectangular y especificación técnica de las 8 pantallas. |
| **📋 Documento de Requisitos de Producto (PRD v2.0)** | [PRD.md](./PRD.md) | Matriz estricta de 2 roles, reglas de negocio, SLA de 48h, gamificación y arquitectura offline. |
| **🌐 Aplicación Web Interactiva** | `/guia-de-marca` | Catálogo interactivo de pantallas en mockups con filtros y visor lightbox. |

---

## 🎨 Identidad Visual y Paleta Cromática Institucional

| Muestra | Código HEX | Código RGB | Nombre del Color | Función en la Interfaz |
| :---: | :--- | :--- | :--- | :--- |
| ![#003E78](https://via.placeholder.com/20/003E78/003E78.png) | **`#003E78`** | `rgb(0, 62, 120)` | **Azul Ultracem (Primario)** | Cabeceras, tarjetas de honor, botones primarios, títulos H1/H2 y chips de filtro activos. |
| ![#002B54](https://via.placeholder.com/20/002B54/002B54.png) | **`#002B54`** | `rgb(0, 43, 84)` | **Azul Marino Profundo** | Bordes de cabecera, hover de botones primarios y contenedores de credencial. |
| ![#1E83EC](https://via.placeholder.com/20/1E83EC/1E83EC.png) | **`#1E83EC`** | `rgb(30, 131, 236)` | **Azul Eléctrico (Interactivo)** | Botones de acción rápida (+ Registrar Venta), barras de avance, enlaces y estados focus. |
| ![#FFCA00](https://via.placeholder.com/20/FFCA00/FFCA00.png) | **`#FFCA00`** | `rgb(255, 202, 0)` | **Amarillo Señalización (Acento)** | Badge de Puntos Ultra, coronas del podio comercial, banner offline y bonificaciones. |
| ![#F4F6F9](https://via.placeholder.com/20/F4F6F9/F4F6F9.png) | **`#F4F6F9`** | `rgb(244, 246, 249)` | **Gris Nieve (Superficie)** | Fondo general de la plataforma PWA, reduciendo el deslumbramiento en terreno. |
| ![#E0E6ED](https://via.placeholder.com/20/E0E6ED/E0E6ED.png) | **`#E0E6ED`** | `rgb(224, 230, 237)` | **Gris Contorno (Borde)** | Separadores, bordes de tarjetas, inputs de formulario y pistas de progreso. |

---

## 📱 Catálogo de Pantallas Oficiales en Producción

### 1. Dashboard Operativo del Asesor Comercial
> Vista principal del asesor comercial para seguimiento de cuota de toneladas, clientes en riesgo y registro rápido.
![01 - Advisor Dashboard](public/screenshots/01-advisor-dashboard.png)

---

### 2. Modal de Registro de Venta y Tiquete de Báscula
> Formulario en terreno con conmutación dinámica de unidad (Ton / m³) y dropzone de evidencia documental.
![02 - Registro de Venta](public/screenshots/02-sale-registration-modal.png)

---

### 3. Tabla de Posiciones y Podio Comercial (Semana 4 SLC)
> Ranking comercial en tiempo real con podio de honor (Oro, Plata, Bronce) e indicador de distancia a la siguiente posición.
![03 - Leaderboard y Ranking](public/screenshots/03-leaderboard-ranking.png)

---

### 4. Catálogo Oficial de Recompensas e Incentivos
> Canje simulado de Puntos Ultra por dotación industrial, herramientas y bienestar familiar con emisión de vouchers.
![04 - Rewards Catalog](public/screenshots/04-rewards-catalog.png)

---

### 5. Portal de Acceso Institucional (Credenciales Profesionales)
> Autenticación corporativa bajo jerarquía de 2 roles con protección estricta de contraseñas.
![05 - Login Credenciales](public/screenshots/05-login-credentials.png)

---

### 6. Dirección Comercial: Auditoría Split-Screen (40/60)
> Mesa de inspección documental cruzada con visor de tiquete de báscula, control de SLA de 48h y aprobación en 1 clic.
![06 - Auditoría Gerencial](public/screenshots/06-manager-audit.png)

---

### 7. Dirección Comercial: Tablero Ejecutivo de Analítica
> Métricas consolidadas a nivel nacional, volumen despachado, cumplimiento de zonas y exportación UTF-8 para Excel.
![07 - Métricas Gerenciales](public/screenshots/07-manager-metrics.png)

---

### 8. PWA Móvil en Terreno (Vista Smartphone)
> Experiencia táctil mobile-first para operación con una sola mano en visitas a pie de obra y modo offline.
![08 - Mobile PWA](public/screenshots/08-mobile-pwa-advisor.png)

---

## 👥 Matriz Estricta de 2 Roles de Acceso (RBAC)

1. **Asesor Comercial (`asesor`):**
   - Acceso a su cartera de clientes asignada en su zona.
   - Registro de despachos de cemento y concreto con fotografía de tiquete de báscula.
   - Consulta de cuota mensual y semáforo de recencia de cartera (<15d, 16-30d, >30d).
   - Acceso al Leaderboard y canje de Puntos Ultra en el catálogo.
   - *Restricción de seguridad*: No puede crear ni editar credenciales de otros usuarios.

2. **Dirección Comercial (`gerente`):**
   - Auditoría y validación documental de remisiones con SLA de 48 horas.
   - Aprobación de puntos y aplicación de causales de rechazo.
   - Tablero analítico ejecutivo con KPIs nacionales y exportación CSV en UTF-8 con BOM.
   - Administración exclusiva de credenciales profesionales (crear usuarios, revocar accesos y reasignar zonas).

---

## 🚀 Despliegue y Ejecución Local

```bash
# 1. Clonar el repositorio
git clone https://github.com/juangoji13/crm-ultracem.git
cd crm-ultracem

# 2. Instalar dependencias
npm install

# 3. Iniciar servidor de desarrollo
npm run dev

# 4. Abrir en el navegador:
# App Principal: http://localhost:3000
# Guía de Marca & Catálogo de Pantallas: http://localhost:3000/guia-de-marca
```

---

## 🛠️ Stack Tecnológico
- **Frontend:** Next.js 16 (App Router & Turbopack), React 19, TypeScript.
- **Estilos:** Tailwind CSS con tokens corporativos institucionales (`#003E78`, `#1E83EC`, `#FFCA00`, `rounded-[5px]`).
- **Iconografía:** `lucide-react` (iconos técnicos minimalistas B2B, cero emojis).
- **Backend / Persistencia:** PostgreSQL 17 + PostgREST desplegado en infraestructura cloud.
