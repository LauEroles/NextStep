# 📋 Especificación de Requerimientos de Software

> **Proyecto:** NextStep
> **Versión del documento:** 1.0  
> **Fecha:** 2026-05-07  
> **Autor(es):** Melissa Kessler, Laura Eroles, Florencia Martinez, Nahuel Raimondi, Luis Povis  
> **Estado:** `Borrador`  

---

## Índice

1. [Control de Versiones del Documento](#control-de-versiones-del-documento)
2. [Requerimientos Funcionales](#requerimientos-funcionales)
3. [Requerimientos No Funcionales](#requerimientos-no-funcionales)
4. [Matriz de Trazabilidad](#matriz-de-trazabilidad)

---

## 1. Control de Versiones del Documento

| Versión | Fecha      | Autor             | Descripción del Cambio                                      |
|---------|------------|-------------------|-------------------------------------------------------------|
| 1.0     | 2026-05-07 | -   | Versión inicial.   |

---

## 2. Requerimientos Funcionales

> Los requerimientos funcionales describen **qué debe hacer** el sistema: comportamientos, funciones y servicios que el sistema debe proveer.

---

### RF-001 — Login de Usuarios

| Campo         | Detalle        |
|---------------|----------------|
| **ID** | RF-001         |
| **Nombre** | Login de Usuarios |
| **Tipo** | Funcional      |
| **Prioridad** | `Alta`         |
| **Estado** | `Pendiente`    |

#### Descripción
> El sistema debe permitir a los usuarios (Recruiter, Applicant y Admin) ingresar a la plataforma autenticándose con su correo electrónico y contraseña.

#### Criterios de Aceptación
- [ ] El sistema valida el email y contraseña contra la base de datos.
- [ ] El sistema permite el acceso y redirige al dashboard correspondiente según el rol del usuario.
- [ ] El sistema muestra un mensaje de error claro si las credenciales son incorrectas.

#### Supuestos
- **SA-001:** El usuario ya se encuentra registrado previamente en el sistema.

#### Dependencias
| ID Dependencia | Tipo            | Descripción                                                                 |
|----------------|-----------------|-----------------------------------------------------------------------------|
| RNF-003        | Infraestructura | Servidor de base de datos PostgreSQL disponible.                            |

---

### RF-002 — Crear Job Description

| Campo         | Detalle        |
|---------------|----------------|
| **ID** | RF-002         |
| **Nombre** | Crear Job Description |
| **Tipo** | Funcional      |
| **Prioridad** | `Alta`         |
| **Estado** | `Pendiente`    |

#### Descripción
> El sistema debe permitir al usuario con rol `Recruiter` crear nuevas vacantes laborales especificando título, descripción, seniority, skills requeridas y el estado (activa/inactiva).

#### Criterios de Aceptación
- [ ] El formulario de creación incluye todos los campos obligatorios definidos.
- [ ] El sistema guarda la oferta en la base de datos y la asocia al perfil del recruiter.
- [ ] El recruiter puede marcar la oferta como "Activa" o "Inactiva" al momento de crearla.

#### Dependencias
| ID Dependencia | Tipo           | Descripción                                         |
|----------------|----------------|-----------------------------------------------------|
| RF-001         | Requerimiento  | El recruiter debe estar autenticado en el sistema.  |

---

### RF-003 — Ver Vacantes

| Campo         | Detalle        |
|---------------|----------------|
| **ID** | RF-003         |
| **Nombre** | Ver Vacantes   |
| **Tipo** | Funcional      |
| **Prioridad** | `Alta`         |
| **Estado** | `Pendiente`    |

#### Descripción
> El sistema debe permitir al usuario con rol `Applicant` visualizar un listado con las búsquedas laborales que se encuentran en estado "Activa".

#### Criterios de Aceptación
- [ ] El sistema muestra únicamente las vacantes con estado "Activa".
- [ ] Cada vacante en la lista muestra al menos título, seniority y un resumen de skills.

---

### RF-004 — Aplicar a Vacante

| Campo         | Detalle        |
|---------------|----------------|
| **ID** | RF-004         |
| **Nombre** | Aplicar a Vacante |
| **Tipo** | Funcional      |
| **Prioridad** | `Alta`         |
| **Estado** | `Pendiente`    |

#### Descripción
> El sistema debe permitir al `Applicant` postularse a una o más vacantes disponibles en la plataforma.

#### Criterios de Aceptación
- [ ] El sistema registra la postulación en la base de datos vinculando al candidato con la oferta.
- [ ] El estado inicial de la postulación se define automáticamente como "Postulado".

#### Dependencias
| ID Dependencia | Tipo           | Descripción                                              |
|----------------|----------------|----------------------------------------------------------|
| RF-001         | Requerimiento  | El applicant debe estar autenticado para postularse.     |
| RF-003         | Requerimiento  | La vacante debe estar listada y visible.                 |

---

### RF-005 — Ver Postulantes

| Campo         | Detalle        |
|---------------|----------------|
| **ID** | RF-005         |
| **Nombre** | Ver Postulantes |
| **Tipo** | Funcional      |
| **Prioridad** | `Alta`         |
| **Estado** | `Pendiente`    |

#### Descripción
> El sistema debe permitir al `Recruiter` visualizar un listado de los candidatos que se han postulado a sus vacantes.

#### Criterios de Aceptación
- [ ] El recruiter solo puede ver los postulantes de las vacantes que él mismo creó (o que pertenecen a su empresa/equipo).
- [ ] La lista de postulantes muestra el estado actual del proceso para cada candidato.

---

### RF-006 — Cargar Feedback

| Campo         | Detalle        |
|---------------|----------------|
| **ID** | RF-006         |
| **Nombre** | Cargar Feedback|
| **Tipo** | Funcional      |
| **Prioridad** | `Alta`         |
| **Estado** | `Pendiente`    |

#### Descripción
> El sistema debe permitir al `Recruiter` registrar feedback estructurado sobre un candidato, incluyendo puntaje técnico, puntaje de soft skills y un comentario general.

#### Criterios de Aceptación
- [ ] El sistema provee campos numéricos o de valoración para "Puntaje técnico" y "Soft skills".
- [ ] El sistema provee un campo de texto para "Comentario general".
- [ ] Una vez guardado, el feedback queda asociado de forma inmutable (o auditable) a la postulación del candidato.

#### Dependencias
| ID Dependencia | Tipo           | Descripción                                              |
|----------------|----------------|----------------------------------------------------------|
| RF-005         | Requerimiento  | Debe haber postulantes visibles para cargar el feedback. |

---

### RF-007 — Estado del Proceso

| Campo         | Detalle        |
|---------------|----------------|
| **ID** | RF-007         |
| **Nombre** | Estado del Proceso |
| **Tipo** | Funcional      |
| **Prioridad** | `Alta`         |
| **Estado** | `Pendiente`    |

#### Descripción
> El sistema debe permitir al `Recruiter` actualizar, y al `Applicant` visualizar, el estado actual de la postulación dentro del flujo predefinido (Postulado, En revisión, Entrevista, Desestimado, Aprobado, Propuesta).

#### Criterios de Aceptación
- [ ] El Recruiter puede transicionar el estado del candidato entre las opciones permitidas.
- [ ] El Applicant visualiza en tiempo real el último estado asignado a su postulación.

---

### RF-008 — Dashboard del Candidato

| Campo         | Detalle        |
|---------------|----------------|
| **ID** | RF-008         |
| **Nombre** | Dashboard del Candidato |
| **Tipo** | Funcional      |
| **Prioridad** | `Media`        |
| **Estado** | `Pendiente`    |

#### Descripción
> El sistema debe proveer al `Applicant` un panel centralizado (Dashboard) donde pueda visualizar sus postulaciones históricas y activas, los estados de cada proceso y el feedback recibido.

#### Criterios de Aceptación
- [ ] El dashboard lista todas las ofertas a las que el candidato aplicó.
- [ ] El candidato puede abrir el detalle de una postulación para leer el feedback cargado (RF-006) en caso de que el recruiter lo haya completado.

---

## 3. Requerimientos No Funcionales

> Los requerimientos no funcionales describen **cómo debe comportarse** el sistema y sus restricciones técnicas.

---

### RNF-001 — Framework Frontend

| Campo          | Detalle         |
|----------------|-----------------|
| **ID** | RNF-001         |
| **Nombre** | Framework y Tecnologías Frontend |
| **Tipo** | No Funcional    |
| **Categoría** | `Arquitectura`  |
| **Prioridad** | `Alta`          |
| **Estado** | `Pendiente`     |

#### Descripción
> La interfaz de usuario del sistema debe ser desarrollada como una aplicación web utilizando NextJS, implementando tipado estricto con TypeScript y estilizado mediante TailwindCSS.

---

### RNF-002 — Arquitectura Backend y Documentación

| Campo          | Detalle         |
|----------------|-----------------|
| **ID** | RNF-002         |
| **Nombre** | Arquitectura Backend y Documentación |
| **Tipo** | No Funcional    |
| **Categoría** | `Arquitectura` / `Mantenibilidad` |
| **Prioridad** | `Alta`          |
| **Estado** | `Pendiente`     |

#### Descripción
> Los servicios del servidor (API REST) deben construirse utilizando el framework NestJS con TypeScript. Todos los endpoints públicos de la API deben estar obligatoriamente documentados utilizando Swagger (OpenAPI).

---

### RNF-003 — Motor de Base de Datos

| Campo          | Detalle         |
|----------------|-----------------|
| **ID** | RNF-003         |
| **Nombre** | Motor de Base de Datos Relacional |
| **Tipo** | No Funcional    |
| **Categoría** | `Almacenamiento`|
| **Prioridad** | `Alta`          |
| **Estado** | `Pendiente`     |

#### Descripción
> El sistema debe persistir toda la información transaccional (usuarios, ofertas, postulaciones, feedback) en una base de datos relacional PostgreSQL.

---

## 4. Matriz de Trazabilidad

| ID Requerimiento | Nombre                                | Tipo          | Depende de      | Relacionado con  | Prioridad | Estado     |
|------------------|---------------------------------------|---------------|-----------------|------------------|-----------|------------|
| RF-001           | Login de Usuarios                     | Funcional     | RNF-003         | RF-002, RF-004   | Alta      | Pendiente  |
| RF-002           | Crear Job Description                 | Funcional     | RF-001          | RF-003           | Alta      | Pendiente  |
| RF-003           | Ver Vacantes                          | Funcional     | —               | RF-004           | Alta      | Pendiente  |
| RF-004           | Aplicar a Vacante                     | Funcional     | RF-001, RF-003  | RF-005, RF-007   | Alta      | Pendiente  |
| RF-005           | Ver Postulantes                       | Funcional     | RF-001, RF-004  | RF-006           | Alta      | Pendiente  |
| RF-006           | Cargar Feedback                       | Funcional     | RF-005          | RF-008           | Alta      | Pendiente  |
| RF-007           | Estado del Proceso                    | Funcional     | RF-004          | RF-008           | Alta      | Pendiente  |
| RF-008           | Dashboard del Candidato               | Funcional     | RF-004, RF-006  | RF-007           | Media     | Pendiente  |
| RNF-001          | Framework y Tecnologías Frontend      | No Funcional  | —               | Todos los RF     | Alta      | Pendiente  |
| RNF-002          | Arquitectura Backend y Documentación  | No Funcional  | —               | Todos los RF     | Alta      | Pendiente  |
| RNF-003          | Motor de Base de Datos Relacional     | No Funcional  | —               | RF-001 a RF-008  | Alta      | Pendiente  |