# 🚀 NextStep

Plataforma digital orientada a revolucionar la experiencia de los candidatos en los procesos de selección, garantizando transparencia, seguimiento en tiempo real y devoluciones constructivas impulsadas por IA.

---

## 📖 1. Descripción Breve
**NextStep** es un sistema integral de reclutamiento enfocado en el candidato. Permite a los reclutadores publicar búsquedas laborales, gestionar postulantes mediante *scorecards* y generar feedback estructurado (apoyado por Inteligencia Artificial). A su vez, el candidato cuenta con un *Dashboard* interactivo donde puede visualizar una línea de tiempo del estado exacto de sus postulaciones y recibir devoluciones detalladas que fomentan su crecimiento profesional, mitigando el problema del "ghosting" corporativo.

---

## 🛑 2. Problema a Resolver
El ecosistema actual de reclutamiento suele dejar a los candidatos en la incertidumbre. Atraviesan largas fases de entrevistas sin obtener respuestas claras sobre su desempeño.
Esto genera:
- ❌ **Ghosting corporativo**: Ausencia de comunicación al descartar un perfil.
- 📉 Frustración y desmotivación en el talento.
- 🧭 Falta de guía, áreas de oportunidad o puntos de mejora para futuros procesos.

---

## 🎯 3. Objetivo del MVP
Crear una plataforma end-to-end que permita:
- **Reclutadores**: Publicar ofertas, gestionar postulantes por etapas y evaluar perfiles mediante *Scorecards* estructurados, apoyándose en IA para redactar feedbacks precisos.
- **Candidatos**: Centralizar la carga de su CV en su perfil, postularse a vacantes y tener trazabilidad visual de la etapa exacta en la que se encuentran, recibiendo feedback real y medible.
- **Administradores**: Gestionar accesos, contenido publicado y usuarios, roles del sistema, y auditar acciones clave.

---

## 👥 4. Usuarios del Sistema

### 🏢 Recruiter (Reclutador)
- Crear y administrar ofertas laborales.
- Visualizar candidatos postulados y descargar sus CVs.
- Cargar *Scorecards* (evaluaciones técnicas y blandas).
- Cambiar a los candidatos de etapa (Ej: *Aplicado → Entrevista RRHH → Contratado*).
- Generar y enviar feedback (Asistido por IA Claude).

### 🧑‍💻 Applicant (Candidato)
- Ver catálogo de búsquedas disponibles (con buscador reactivo paginado).
- Administrar su perfil y subir su CV.
- Postularse a vacantes.
- Acceder a su panel de control para ver la línea de tiempo de cada postulación y leer el feedback recibido.

### 👑 Admin (Administrador)
- Gestión de usuarios y asignación de roles.
- Acceso a historial de movimientos (`audit_logs`).

---

## 🛠️ 5. Stack Tecnológico

**Frontend:**
- **Next.js 16** (App Router) + React
- **TypeScript**
- **Tailwind CSS**
- **NextAuth.js** (Gestión de sesiones) + **Zod** (Validaciones de esquema)

**Backend:**
- **NestJS** + **TypeScript**
- **PostgreSQL** alojado en Supabase (Session Pooler)
- **TypeORM** (Mapeo relacional de objetos)
- **Swagger** (Documentación OpenAPI)
- **Jest** (Testing unitario con +80% de cobertura)
- **Helmet / bcrypt / JWT** (Capa de seguridad)
- **Multer** (Gestión y subida de archivos físicos)

**Integraciones Externas:**
- **Anthropic API (Claude)** para síntesis y generación automática de feedback.

---

## ⚙️ 6. Guía de Instalación y Ejecución

El sistema está dividido en dos repositorios independientes. Se requieren dos terminales para correr el proyecto completo.

| Entorno | Repositorio |
| :--- | :--- |
| **Backend (API)** | [https://github.com/LauEroles/NextStep](https://github.com/LauEroles/NextStep) |
| **Frontend (App)** | [https://github.com/FloritoM/NextStep_TP](https://github.com/FloritoM/NextStep_TP) |

### Requisitos previos
- Node.js v18 o superior
- npm v9 o superior
- Git

---

### 💻 Levantando el Backend (API)

**1. Clonar el repositorio e instalar dependencias:**
```bash
git clone https://github.com/LauEroles/NextStep.git
cd NextStep/backend
npm install
```

**2. Variables de Entorno (`.env`):**\
Cree un archivo `.env` en la raíz de la carpeta backend basándose en el `.env.example`.

**Entorno y Puerto**\
`PORT=3001`\
`NODE_ENV=development`

**Base de datos (Supabase — usar Session Pooler, NO Direct Connection)**\
`DATABASE_URL=postgresql://postgres.[PROJECT_REF]:[PASSWORD]@aws-0-[REGION].pooler.supabase.com:5432/postgres`

**Seguridad y JWT**\
`JWT_SECRET=tu_secreto_super_seguro_aqui`\
`JWT_EXPIRES_IN=8h`

**Integración con IA**\
`CLAUDE_API_KEY=tu_api_key_de_anthropic`

**Datos de Seed (Inicialización de Base de Datos)**\
`DEFAULT_ADMIN_EMAIL=admin@nextstep.com`\
`DEFAULT_ADMIN_PASSWORD=Admin123`

Importante: La variable `NODE_ENV=development` es fundamental para que la documentación interactiva de Swagger esté habilitada localmente. Al pasar a producción, se desactiva automáticamente.

**3. Inicialización de la Base de Datos (Seed):**\
El sistema requiere tablas maestras (Roles, Seniorities, Etapas) y un usuario inicial para funcionar. Ejecute el siguiente comando por única vez:
```bash
npm run seed
```

NOTA: Para facilitar la corrección del TP, el seed crea automáticamente un usuario Administrador leyendo las variables `DEFAULT_ADMIN_EMAIL` y `DEFAULT_ADMIN_PASSWORD` del `.env`. En un entorno de producción real, este proceso de inyección de credenciales se maneja de forma segura a través de variables de entorno del servidor.

**4. Iniciar el Servidor:**
- En modo desarrollo:
```bash
npm run start:dev
```
- O compilar y ejecutar:
```bash
npm run build
npm run start
```

El servidor backend quedará disponible en `http://localhost:3001`

---

## 📚 7. Documentación de la API (Swagger)
Con el backend corriendo en modo desarrollo, la documentación completa y detallada de todos los endpoints, DTOs y esquemas de respuesta está disponible de forma interactiva en:
👉 `http://localhost:3001/api-docs`

Nota: Requiere autenticación Bearer JWT para probar endpoints protegidos.

---

## 🧪 8. Testing
El proyecto cuenta con una suite de pruebas unitarias implementada con Jest y jest-mock-extended para garantizar la estabilidad de la lógica de negocio (como el borrado seguro de entidades y dependencias).

Para correr los tests:

```bash
npm run test
```