# Documento Funcional – NextStep (MVP)

---

## 1. Nombre del Proyecto

**NextStep**

---

## 2. Descripción Breve

NextStep es una plataforma simple que mejora la experiencia de candidatos en procesos de selección.

Permite que un recruiter publique una búsqueda laboral, reciba postulantes y cargue feedback estructurado para cada candidato.

El candidato puede visualizar el estado de su postulación y recibir devoluciones útiles para seguir mejorando.

---

## 3. Problema a Resolver

Muchas personas atraviesan procesos de selección sin respuesta o sin feedback.

Esto genera:

- Ghosting laboral  
- Frustración  
- Desmotivación  
- Falta de guía para mejorar profesionalmente  

---

## 4. Objetivo del MVP

Crear una plataforma básica donde:

- Recruiters crean Job Descriptions  
- Candidatos se postulan  
- Recruiters cargan feedback  
- Candidatos visualizan resultados  

---

## 5. Usuarios del Sistema

### Recruiter

Puede:

- Crear búsquedas laborales  
- Ver postulantes  
- Cargar feedback  
- Cambiar estado de candidatos  

### Applicant

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

## 6. Funcionalidades Principales

### RF01 - Login

Los usuarios ingresan con email y contraseña.

### RF02 - Crear Job Description

El recruiter crea vacantes con:

- Título  
- Descripción  
- Seniority  
- Skills requeridas  
- Estado activa / inactiva  

### RF03 - Ver Vacantes

Los candidatos visualizan búsquedas abiertas.

### RF04 - Aplicar a Vacante

Los candidatos pueden postularse a una o más vacantes.

### RF05 - Ver Postulantes

El recruiter visualiza candidatos postulados.

### RF06 - Cargar Feedback

El recruiter carga:

- Puntaje técnico  
- Puntaje soft skills  
- Comentario general  

### RF07 - Estado del Proceso

El candidato puede visualizar el estado actual:

- Postulado  
- En revisión  
- Entrevista  
- Desestimado  
- Aprobado  
- Propuesta  

### RF08 - Dashboard del Candidato

Visualiza:

- Postulaciones  
- Estado de procesos  
- Feedback recibido  

---

## 7. Pantallas Simples

### Recruiter

- Login  
- Perfil  
- Dashboard recruiter  
- Crear Job Offer  
- Lista de postulantes  
- Formulario feedback  

### Applicant

- Login  
- Perfil  
- Lista de vacantes  
- Mis postulaciones  
- Mi feedback  

---

## 8. Requerimientos Técnicos

### Frontend

- NextJS  
- TypeScript  
- TailwindCSS  

### Backend

- NestJS  
- TypeScript  
- Swagger  

### Base de Datos

- PostgreSQL  

---