## 1. Nombre del Proyecto

**NextStep**

---

## 2. Descripción Breve

NextStep es una plataforma digital orientada a mejorar la experiencia de candidatos en procesos de selección.

Permite que un reclutador publique una búsqueda laboral, reciba postulantes y cargue feedback estructurado para cada candidato.

El candidato puede visualizar el estado de su postulación y recibir devoluciones asociadas a su proceso de selección para poder tomar conciencia de los puntos de mejora en su proceso.

---

## 3. Problema a Resolver

Muchas personas atraviesan procesos de selección sin respuesta o sin feedback.

Esto genera:

- Ausencia de comunicación o falta de respuesta por parte de la organización durante el proceso de selección 
- Frustración  
- Desmotivación  
- Falta de guía para mejorar profesionalmente  

---

## 4. Objetivo del MVP

Crear una plataforma que permita:

- A los reclutadores crear Ofertas laborales  
- A candidatos se postulan  
- A reclutadores cargar feedbacks  
- Visualización de resultados del proceso por parte de los candidatos

---

## 5. Usuarios del Sistema

### Recruiter

Puede:

- Crear búsquedas laborales  
- Ver postulantes  
- Cargar feedback  
- Cambiar estado de candidatos  

### Candidato

Puede:

- Ver búsquedas disponibles  
- Postularse  
- Ver estado del proceso  
- Ver feedback recibido  

### Admin

Puede:

- Gestionar usuarios  
- Acceso a historial de logs  

---
## Guía de instalación y ejecución

- Plataforma de gestión de postulaciones laborales desarrollada para Programación III (UTN).
- Stack: Next.js 16 + TypeScript + Tailwind CSS (frontend) | NestJS + TypeORM + PostgreSQL/Supabase (backend)

### Repositorios

| Repositorio | URL |
| :--- | :--- |
| Backend (API) | https://github.com/LauEroles/NextStep |
| Frontend (App) | https://github.com/FloritoM/NextStep_TP |

Cada repositorio se instala y corre de forma independiente. Se necesitan dos terminales abiertas para correr el proyecto completo.

### Requisitos previos

- Node.js v18 o superior
- npm v9 o superior
- Git

### Backend

1.1 Clonar el repositorio

bashgit clone https://github.com/LauEroles/NextStep.git
cd NextStep/backend

1.2 Instalar dependencias

bashnpm install

1.3 Variables de entorno

Crear el archivo .env dentro de la carpeta backend/ con el siguiente contenido:

env# Base de datos (Supabase — usar Session Pooler, NO Direct Connection)
DATABASE_URL=postgresql://postgres.[PROJECT_REF]:[PASSWORD]@aws-0-[REGION].pooler.supabase.com:5432/postgres

# JWT
JWT_SECRET=tu_secreto_jwt_aqui
JWT_EXPIRES_IN=8h

# Puerto
PORT=3001


Importante: La URL de Supabase debe ser la del Session Pooler (no la Direct Connection). Algunas redes bloquean el puerto directo de Postgres.


1.4 Levantar el backend

bashnpm run start:dev

El servidor queda disponible en http://localhost:3001

1.5 Dependencias principales

| Paquete | Uso |
| :--- | :--- |
| @nestjs/core | Framework principal |
| @nestjs/jwt | Autenticación JWT |
| @nestjs/passport | Estrategias de autenticación |
| typeorm + @nestjs/typeorm | ORM para PostgreSQL |
| bcrypt | Hash de contraseñas |
| multer | Subida de archivos (CVs) |
| @nestjs/config | Variables de entorno |
| class-validator | Validación de DTOs |
| helmet| Seguridad HTTP headers |