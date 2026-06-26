# 📋 Especificación de Requerimientos de Software

> **Proyecto:** NextStep\
> **Versión del documento:** 2.0  
> **Fecha:** 2026-06-25  
> **Autor(es):** Melissa Kessler, Laura Eroles, Florencia Martinez, Nahuel Raimondi, Luis Povis  
> **Estado:** `Completo`  

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
| 1.0     | 2026-05-07 | - | Versión inicial.                                            |
| 2.0     | 2026-06-25 | - | Versión actualizada para entrega. |

---

## 2. Requerimientos Funcionales

> Los requerimientos funcionales describen **qué debe hacer** el sistema: comportamientos, funciones y servicios que el sistema debe proveer.

---

### RF-001 — Autenticación de Usuarios

| Campo         | Detalle        |
|---------------|----------------|
| **ID** | RF-001         |
| **Nombre** | Autenticación de Usuarios |
| **Tipo** | Funcional      |
| **Prioridad** | `Alta`         |
| **Estado** | `Implementado` |

#### Descripción
> El sistema debe permitir a los usuarios ingresar a la plataforma autenticándose con su correo electrónico y contraseña.

#### Criterios de Aceptación
- [x] El sistema valida el email y contraseña contra la base de datos.
- [x] El sistema permite el acceso y redirige al dashboard correspondiente según el rol del usuario.
- [x] El servidor retorna el código HTTP `401 Unauthorized` y el sistema muestra un mensaje de error claro si las credenciales son incorrectas.
- [x] Las contraseñas nunca se transmiten ni almacenan en texto plano; se usa hashing con `bcrypt` (mínimo 10 rondas).

#### Supuestos
- **SA-001:** El usuario ya se encuentra registrado previamente en el sistema.

#### Dependencias
| ID Dependencia | Tipo            | Descripción                                                                 |
|----------------|-----------------|-----------------------------------------------------------------------------|
| RNF-003        | Infraestructura | Servidor de base de datos PostgreSQL disponible.                            |

---

### RF-002 — Crear Vacante Laboral

| Campo         | Detalle        |
|---------------|----------------|
| **ID** | RF-002         |
| **Nombre** | Crear Job Description |
| **Tipo** | Funcional      |
| **Prioridad** | `Alta`         |
| **Estado** | `Implementado` |

#### Descripción
> El sistema debe permitir al usuario con rol `Recruiter` crear nuevas vacantes laborales especificando título, descripción y seniority.

#### Criterios de Aceptación
- [x] El formulario de creación incluye todos los campos obligatorios definidos.
- [x] El sistema guarda la oferta en la base de datos y la asocia al perfil del recruiter.

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
| **Estado** | `Implementado` |

#### Descripción
> El sistema debe permitir a los usuarios visualizar un listado con las búsquedas laborales publicadas.

#### Criterios de Aceptación
- [x] El sistema hace una distinción visual y funcional entre vacantes "Activas" e "Inactivas".
- [x] Cada vacante en la lista muestra al menos título, seniority y una descripción.

#### Dependencias
| ID Dependencia | Tipo           | Descripción                                         |
|----------------|----------------|-----------------------------------------------------|
| —              | —              | Este requerimiento no posee dependencias previas.   |

---

### RF-004 — Aplicar a Vacante

| Campo         | Detalle        |
|---------------|----------------|
| **ID** | RF-004         |
| **Nombre** | Aplicar a Vacante |
| **Tipo** | Funcional      |
| **Prioridad** | `Alta`         |
| **Estado** | `Implementado` |

#### Descripción
> El sistema debe permitir al `Applicant` postularse a una o más vacantes disponibles en la plataforma.

#### Criterios de Aceptación
- [x] El sistema registra la postulación en la base de datos vinculando al candidato con la oferta.
- [x] El estado inicial de la postulación se define automáticamente como "Aplicado".
- [x] El servidor retorna un código HTTP `400 Bad Request` si ya existe la postulación de un candidato a una misma vacante.

#### Dependencias
| ID Dependencia | Tipo           | Descripción                                              |
|----------------|----------------|----------------------------------------------------------|
| RF-001         | Requerimiento  | El applicant debe estar autenticado para postularse.     |
| RF-003         | Requerimiento  | La vacante debe estar listada y visible en el catálogo.  |

---

### RF-005 — Ver Postulantes

| Campo         | Detalle        |
|---------------|----------------|
| **ID** | RF-005         |
| **Nombre** | Ver Postulantes |
| **Tipo** | Funcional      |
| **Prioridad** | `Alta`         |
| **Estado** | `Implementado` |

#### Descripción
> El sistema debe permitir al `Recruiter` visualizar un listado de los candidatos que se han postulado a sus vacantes.

#### Criterios de Aceptación
- [x] La lista de postulantes muestra el estado actual del proceso para cada candidato.

#### Dependencias
| ID Dependencia | Tipo           | Descripción                                                        |
|----------------|----------------|--------------------------------------------------------------------|
| RF-001         | Requerimiento  | El recruiter debe estar autenticado en el sistema.                 |
| RF-004         | Requerimiento  | Deben existir registros de aplicaciones previas de los candidatos. |

---

### RF-006 — Cargar Feedback

| Campo         | Detalle        |
|---------------|----------------|
| **ID** | RF-006         |
| **Nombre** | Cargar Feedback|
| **Tipo** | Funcional      |
| **Prioridad** | `Alta`         |
| **Estado** | `Implementado` |

#### Descripción
> El sistema debe permitir al `Recruiter` registrar feedback estructurado sobre un candidato por cada etapa del proceso, incluyendo una evaluación (scorecard) con puntaje técnico o de habilidades blandas, y un comentario general.

#### Criterios de Aceptación
- [x] El sistema provee campos de valoración para "Technical skills" y "Soft skills".
- [x] El sistema provee un campo de texto para un comentario general, pudiendo ser generado con IA.
- [x] Una vez guardado, el feedback queda asociado a la postulación del candidato.

#### Dependencias
| ID Dependencia | Tipo           | Descripción                                                         |
|----------------|----------------|---------------------------------------------------------------------|
| RF-005         | Requerimiento  | El reclutador debe poder visualizar la lista de postulantes activos. |

---

### RF-007 — Estado del Proceso

| Campo         | Detalle        |
|---------------|----------------|
| **ID** | RF-007         |
| **Nombre** | Estado del Proceso |
| **Tipo** | Funcional      |
| **Prioridad** | `Alta`         |
| **Estado** | `Implementado` |

#### Descripción
> El sistema debe permitir al `Recruiter` actualizar, y al `Applicant` visualizar, el estado actual de la postulación dentro del flujo predefinido (Postulado, Entrevista, Evaluación Técnica, Desestimado, Contratado).

#### Criterios de Aceptación
- [x] El reclutador puede transicionar el estado del candidato entre las opciones permitidas.
- [x] El candidato puede visualizar en tiempo real el último estado asignado a su postulación.

#### Dependencias
| ID Dependencia | Tipo           | Descripción                                                    |
|----------------|----------------|----------------------------------------------------------------|
| RF-004         | Requerimiento  | Requiere que exista una postulación activa sobre la vacante.   |

---

### RF-008 — Dashboard del Candidato

| Campo         | Detalle        |
|---------------|----------------|
| **ID** | RF-008         |
| **Nombre** | Dashboard del Candidato |
| **Tipo** | Funcional      |
| **Prioridad** | `Media`        |
| **Estado** | `Implementado` |

#### Descripción
> El sistema debe proveer al `Applicant` un panel centralizado (Dashboard) donde pueda visualizar sus postulaciones históricas y activas, los estados de cada proceso y el feedback recibido.

#### Criterios de Aceptación
- [x] El dashboard lista todas las ofertas a las que el candidato aplicó.
- [x] El candidato puede abrir el detalle de una postulación para leer el feedback cargado en caso de que el recruiter lo haya completado.

#### Dependencias
| ID Dependencia | Tipo           | Descripción                                                       |
|----------------|----------------|-------------------------------------------------------------------|
| RF-004         | Requerimiento  | Depende de las aplicaciones hechas por el candidato.              |
| RF-006         | Requerimiento  | Relacionado con la consulta de los feedbacks emitidos por la IA.  |

---

### RF-009 — Dashboard del Administrador

| Campo         | Detalle        |
|---------------|----------------|
| **ID** | RF-009         |
| **Nombre** | Dashboard del Administrador |
| **Tipo** | Funcional      |
| **Prioridad** | `Alta`         |
| **Estado** | `Implementado` |

#### Descripción
> El sistema debe proveer un panel de control exclusivo para usuarios con el rol `ADMIN` que unifique las métricas generales, la gobernanza de usuarios y vacantes, y la auditoría del sistema.

#### Criterios de Aceptación
- [x] El panel debe restringirse únicamente al rol `ADMIN` mediante middlewares en el frontend y guards en el backend.
- [x] Mostrar contadores globales de usuarios totales y ofertas laborales publicadas.
- [x] Permitir visualizar la lista de usuarios en una grilla paginada y activar/desactivar sus cuentas.
- [x] Listar los registros inmutables de operaciones críticas del sistema (`audit_logs`) con filtros de búsqueda por usuario y tipo de acción.

#### Dependencias
| ID Dependencia | Tipo           | Descripción                                                       |
|----------------|----------------|-------------------------------------------------------------------|
| RF-001         | Requerimiento  | Requiere que el administrador se autentique correctamente.        |

---

### RF-010 — Perfil de Usuario

| Campo         | Detalle        |
|---------------|----------------|
| **ID** | RF-010         |
| **Nombre** | Perfil de Usuario |
| **Tipo** | Funcional      |
| **Prioridad** | `Alta`         |
| **Estado** | `Implementado` |

#### Descripción
> El sistema debe permitir a cualquier usuario autenticado acceder a una sección de perfil privada para visualizar y poder editar su información personal registrada en la plataforma.

#### Criterios de Aceptación
- [x] Al ingresar a la vista, el usuario debe ver sus datos actuales guardados en la base de datos (Nombre, Apellido, Email, Fecha de Creación y Rol asignado).
- [x] El backend debe resolver el usuario basándose estrictamente en el token JWT de la sesión activa, impidiendo que un usuario consulte los datos de perfil de otro.
- [x] El sistema debe poder permitir editar los datos personales del usuario y actualizarlos en la base de datos, haciendo las validaciones correspondientes.

#### Dependencias
| ID Dependencia | Tipo           | Descripción                                                       |
|----------------|----------------|-------------------------------------------------------------------|
| RF-001         | Requerimiento  | Requiere sesión activa y token JWT válido.                        |

---

## 3. Requerimientos No Funcionales

> Los requerimientos no funcionales describen **cómo debe comportarse** el sistema y sus restricciones técnicas.

---

### RNF-001 — Framework Frontend

| Campo         | Detalle        |
|---------------|----------------|
| **ID** | RNF-001        |
| **Nombre** | Framework y Tecnologías Frontend |
| **Tipo** | No Funcional   |
| **Categoría** | `Arquitectura` |
| **Prioridad** | `Alta`         |
| **Estado** | `Implementado` |

#### Descripción
> La interfaz de usuario del sistema debe ser desarrollada como una aplicación web utilizando NextJS, implementando tipado estricto con TypeScript y estilizado mediante TailwindCSS.

---

### RNF-002 — Arquitectura Backend y Documentación

| Campo         | Detalle        |
|---------------|----------------|
| **ID** | RNF-002        |
| **Nombre** | Arquitectura Backend y Documentación |
| **Tipo** | No Funcional   |
| **Categoría** | `Arquitectura` / `Mantenibilidad` |
| **Prioridad** | `Alta`         |
| **Estado** | `Implementado` |

#### Descripción
> Los servicios del servidor (API REST) deben construirse utilizando el framework NestJS con TypeScript. Todos los endpoints públicos de la API deben estar obligatoriamente documentados utilizando Swagger (OpenAPI).

---

### RNF-003 — Motor de Base de Datos

| Campo         | Detalle        |
|---------------|----------------|
| **ID** | RNF-003        |
| **Nombre** | Motor de Base de Datos Relacional |
| **Tipo** | No Funcional   |
| **Categoría** | `Almacenamiento`|
| **Prioridad** | `Alta`         |
| **Estado** | `Implementado` |

#### Descripción
> El sistema debe persistir toda la información transaccional (usuarios, ofertas, postulaciones, feedback) en una base de datos relacional PostgreSQL.

---

## 4. Matriz de Trazabilidad

| ID Requerimiento | Nombre                                | Tipo          | Depende de        | Relacionado con    | Prioridad | Estado       |
|------------------|---------------------------------------|---------------|-------------------|--------------------|-----------|--------------|
| RF-001           | Autenticación de Usuarios                     | Funcional     | RNF-003           | RF-002, RF-004     | Alta      | Implementado |
| RF-002           | Crear Vacante Laboral                 | Funcional     | RF-001            | RF-003             | Alta      | Implementado |
| RF-003           | Ver Vacantes                          | Funcional     | —                 | RF-004             | Alta      | Implementado |
| RF-004           | Aplicar a Vacante                     | Funcional     | RF-001, RF-003    | RF-005, RF-007     | Alta      | Implementado |
| RF-005           | Ver Postulantes                       | Funcional     | RF-001, RF-004    | RF-006             | Alta      | Implementado |
| RF-006           | Cargar Feedback                       | Funcional     | RF-005            | RF-008             | Alta      | Implementado |
| RF-007           | Estado del Proceso                    | Funcional     | RF-004            | RF-008             | Alta      | Implementado |
| RF-008           | Dashboard del Candidato               | Funcional     | RF-004, RF-006    | RF-007             | Media     | Implementado |
| RF-009           | Dashboard del Administrador    | Funcional     | RF-001            | —                  | Alta      | Implementado |
| RF-010           | Perfil de Usuario  | Funcional     | RF-001            | —                  | Alta      | Implementado |
| RNF-001          | Framework y Tecnologías Frontend      | No Funcional  | —                 | Todos los RF       | Alta      | Implementado |
| RNF-002          | Arquitectura Backend y Documentación  | No Funcional  | —                 | Todos los RF       | Alta      | Implementado |
| RNF-003          | Motor de Base de Datos Relacional     | No Funcional  | —                 | RF-001 a RF-010    | Alta      | Implementado |