# PRUEBA DE CAJA NEGRA N°1 — PARTICIÓN DE EQUIVALENCIAS
## Módulo: Login (Inicio de Sesión)
### Sistema: Vaper One Medellín — vaper-web

---

## 1. PLANIFICACIÓN

### 1.1 Objetivo
Verificar que el formulario de inicio de sesión acepte únicamente entradas válidas y rechace correctamente las entradas inválidas, agrupando los datos de entrada en clases de equivalencia (válidas e inválidas) sin necesidad de probar cada valor individual.

### 1.2 Alcance
El módulo evaluado es el formulario de **Inicio de Sesión** (`AuthForm.tsx`), específicamente los campos:
- **Campo "Documento o Email"** (`username`)
- **Campo "Contraseña"** (`password`)

### 1.3 Componente analizado
**Archivo:** `src/features/auth/components/AuthForm.tsx`

Comportamiento observado en el código:
- El campo `username` acepta tanto número de documento como correo electrónico.
- El campo `password` es requerido (atributo `required`).
- Ambos campos tienen el atributo HTML `required`.
- El sistema detecta automáticamente si el valor ingresado es email o documento mediante regex: `/^[^\s@]+@[^\s@]+\.[^\s@]+$/`
- Errores manejados:
  - `UserDeactivated` → "Tu cuenta ha sido desactivada."
  - `UserPendingApproval` → "Tu cuenta aún no ha sido aprobada."
  - `RoleDeactivated` → "Tu rol asignado ha sido desactivado."
  - Credenciales incorrectas → "Credenciales incorrectas o usuario no encontrado."

### 1.4 Técnica aplicada
**Partición de Equivalencias:** Se dividen los posibles valores de entrada en clases o particiones donde se asume que el sistema se comporta de manera idéntica para todos los valores dentro de una misma clase. Se selecciona un representante por clase.

### 1.5 Recursos necesarios
- Navegador web con la aplicación corriendo localmente.
- Usuario registrado y activo en la base de datos (para pruebas válidas).
- Usuario registrado pero inactivo (para prueba de cuenta desactivada).
- Usuario pendiente de aprobación (para prueba de cuenta pendiente).

### 1.6 Responsable
Equipo de QA / Estudiante de pruebas de software.

### 1.7 Fecha planificada
Mayo 2026

---

## 2. DISEÑO DE CASOS DE PRUEBA

### 2.1 Identificación de clases de equivalencia

#### Campo: Documento o Email (`username`)

| ID Clase | Tipo      | Descripción                                              | Ejemplo representativo     |
|----------|-----------|----------------------------------------------------------|----------------------------|
| CE-U-01  | Válida    | Número de documento numérico existente en el sistema     | `1000123456`               |
| CE-U-02  | Válida    | Correo electrónico con formato válido existente          | `usuario@gmail.com`        |
| CE-U-03  | Inválida  | Campo vacío (sin valor)                                  | ` ` (vacío)                |
| CE-U-04  | Inválida  | Correo con formato inválido (sin @)                      | `usuariogmail.com`         |
| CE-U-05  | Inválida  | Credencial correctamente formateada pero no registrada   | `9999999999`               |

#### Campo: Contraseña (`password`)

| ID Clase | Tipo      | Descripción                                              | Ejemplo representativo     |
|----------|-----------|----------------------------------------------------------|----------------------------|
| CE-P-01  | Válida    | Contraseña correcta del usuario registrado               | `Admin123`                 |
| CE-P-02  | Inválida  | Campo vacío (sin valor)                                  | ` ` (vacío)                |
| CE-P-03  | Inválida  | Contraseña incorrecta para un usuario existente          | `ClaveErronea99`           |

#### Clases de equivalencia para estados del usuario

| ID Clase | Tipo      | Descripción                                              |
|----------|-----------|----------------------------------------------------------|
| CE-S-01  | Válida    | Usuario activo con rol activo                            |
| CE-S-02  | Inválida  | Usuario desactivado por el administrador                 |
| CE-S-03  | Inválida  | Usuario pendiente de aprobación                          |
| CE-S-04  | Inválida  | Usuario con rol desactivado                              |

---

### 2.2 Tabla de casos de prueba

| ID Caso | Clase(s) Cubierta(s)    | Entrada: username        | Entrada: password   | Resultado Esperado                                                        | Tipo    |
|---------|-------------------------|--------------------------|---------------------|---------------------------------------------------------------------------|---------|
| CP-01   | CE-U-01, CE-P-01, CE-S-01 | `1000123456`           | `Admin123`          | Login exitoso. Redirige al panel principal.                               | Válido  |
| CP-02   | CE-U-02, CE-P-01, CE-S-01 | `usuario@gmail.com`    | `Admin123`          | Login exitoso. Redirige al panel principal.                               | Válido  |
| CP-03   | CE-U-03                 | *(vacío)*                | `Admin123`          | El formulario no se envía. El campo muestra validación HTML `required`.   | Inválido|
| CP-04   | CE-P-02                 | `1000123456`             | *(vacío)*           | El formulario no se envía. El campo muestra validación HTML `required`.   | Inválido|
| CP-05   | CE-U-04                 | `usuariogmail.com`       | `Admin123`          | Login falla. Mensaje: "Credenciales incorrectas o usuario no encontrado." | Inválido|
| CP-06   | CE-U-05, CE-P-01        | `9999999999`             | `Admin123`          | Login falla. Mensaje: "Credenciales incorrectas o usuario no encontrado." | Inválido|
| CP-07   | CE-U-01, CE-P-03        | `1000123456`             | `ClaveErronea99`    | Login falla. Mensaje: "Credenciales incorrectas o usuario no encontrado." | Inválido|
| CP-08   | CE-U-01, CE-P-01, CE-S-02 | `1000123456`           | `Admin123`          | Login falla. Mensaje: "Tu cuenta ha sido desactivada. Contacta al admin." | Inválido|
| CP-09   | CE-U-01, CE-P-01, CE-S-03 | `1000123456`           | `Admin123`          | Login falla. Mensaje: "Tu cuenta aún no ha sido aprobada."                | Inválido|
| CP-10   | CE-U-01, CE-P-01, CE-S-04 | `1000123456`           | `Admin123`          | Login falla. Mensaje: "Tu rol asignado ha sido desactivado."              | Inválido|

---

## 3. EJECUCIÓN DE LAS PRUEBAS

### Instrucciones de ejecución
1. Navegar a la pantalla de login de la aplicación.
2. Para cada caso de prueba, ingresar los valores indicados en los campos correspondientes.
3. Hacer clic en el botón **"Iniciar Sesión"**.
4. Registrar el resultado obtenido y compararlo con el resultado esperado.

---

### CP-01 — Login con documento válido

| Atributo         | Detalle                                      |
|------------------|----------------------------------------------|
| **Precondición** | Usuario con documento `1000123456` activo en BD |
| **Pasos**        | 1. Ingresar `1000123456` en "Documento o Email" <br> 2. Ingresar `Admin123` en "Contraseña" <br> 3. Clic en "Iniciar Sesión" |
| **Resultado esperado** | Redirección al panel principal del sistema |
| **Resultado obtenido** | _(completar al ejecutar)_ |
| **Estado**       | ☐ PASS  ☐ FAIL |

---

### CP-02 — Login con email válido

| Atributo         | Detalle                                      |
|------------------|----------------------------------------------|
| **Precondición** | Usuario con email `usuario@gmail.com` activo en BD |
| **Pasos**        | 1. Ingresar `usuario@gmail.com` en "Documento o Email" <br> 2. Ingresar `Admin123` en "Contraseña" <br> 3. Clic en "Iniciar Sesión" |
| **Resultado esperado** | Redirección al panel principal del sistema |
| **Resultado obtenido** | _(completar al ejecutar)_ |
| **Estado**       | ☐ PASS  ☐ FAIL |

---

### CP-03 — Campo username vacío

| Atributo         | Detalle                                      |
|------------------|----------------------------------------------|
| **Precondición** | Ninguna                                      |
| **Pasos**        | 1. Dejar vacío "Documento o Email" <br> 2. Ingresar `Admin123` en "Contraseña" <br> 3. Clic en "Iniciar Sesión" |
| **Resultado esperado** | El formulario no se envía. Validación nativa del navegador indica campo requerido |
| **Resultado obtenido** | _(completar al ejecutar)_ |
| **Estado**       | ☐ PASS  ☐ FAIL |

---

### CP-04 — Campo contraseña vacío

| Atributo         | Detalle                                      |
|------------------|----------------------------------------------|
| **Precondición** | Ninguna                                      |
| **Pasos**        | 1. Ingresar `1000123456` en "Documento o Email" <br> 2. Dejar vacío "Contraseña" <br> 3. Clic en "Iniciar Sesión" |
| **Resultado esperado** | El formulario no se envía. Validación nativa del navegador indica campo requerido |
| **Resultado obtenido** | _(completar al ejecutar)_ |
| **Estado**       | ☐ PASS  ☐ FAIL |

---

### CP-05 — Email con formato inválido

| Atributo         | Detalle                                      |
|------------------|----------------------------------------------|
| **Precondición** | Ninguna                                      |
| **Pasos**        | 1. Ingresar `usuariogmail.com` en "Documento o Email" <br> 2. Ingresar `Admin123` en "Contraseña" <br> 3. Clic en "Iniciar Sesión" |
| **Resultado esperado** | Mensaje de error: "Credenciales incorrectas o usuario no encontrado." |
| **Resultado obtenido** | _(completar al ejecutar)_ |
| **Estado**       | ☐ PASS  ☐ FAIL |

---

### CP-06 — Documento no registrado

| Atributo         | Detalle                                      |
|------------------|----------------------------------------------|
| **Precondición** | El documento `9999999999` no existe en la BD |
| **Pasos**        | 1. Ingresar `9999999999` en "Documento o Email" <br> 2. Ingresar `Admin123` en "Contraseña" <br> 3. Clic en "Iniciar Sesión" |
| **Resultado esperado** | Mensaje de error: "Credenciales incorrectas o usuario no encontrado." |
| **Resultado obtenido** | _(completar al ejecutar)_ |
| **Estado**       | ☐ PASS  ☐ FAIL |

---

### CP-07 — Contraseña incorrecta

| Atributo         | Detalle                                      |
|------------------|----------------------------------------------|
| **Precondición** | Usuario `1000123456` existe en BD            |
| **Pasos**        | 1. Ingresar `1000123456` en "Documento o Email" <br> 2. Ingresar `ClaveErronea99` en "Contraseña" <br> 3. Clic en "Iniciar Sesión" |
| **Resultado esperado** | Mensaje de error: "Credenciales incorrectas o usuario no encontrado." |
| **Resultado obtenido** | _(completar al ejecutar)_ |
| **Estado**       | ☐ PASS  ☐ FAIL |

---

### CP-08 — Usuario desactivado

| Atributo         | Detalle                                      |
|------------------|----------------------------------------------|
| **Precondición** | Usuario `1000123456` existe pero está desactivado en BD |
| **Pasos**        | 1. Ingresar `1000123456` en "Documento o Email" <br> 2. Ingresar `Admin123` en "Contraseña" <br> 3. Clic en "Iniciar Sesión" |
| **Resultado esperado** | Mensaje: "Tu cuenta ha sido desactivada. Por favor, contacta al administrador." |
| **Resultado obtenido** | _(completar al ejecutar)_ |
| **Estado**       | ☐ PASS  ☐ FAIL |

---

### CP-09 — Usuario pendiente de aprobación

| Atributo         | Detalle                                      |
|------------------|----------------------------------------------|
| **Precondición** | Usuario `1000123456` existe pero está pendiente de aprobación |
| **Pasos**        | 1. Ingresar `1000123456` en "Documento o Email" <br> 2. Ingresar `Admin123` en "Contraseña" <br> 3. Clic en "Iniciar Sesión" |
| **Resultado esperado** | Mensaje: "Tu cuenta aún no ha sido aprobada. Estamos verificando tu documento." |
| **Resultado obtenido** | _(completar al ejecutar)_ |
| **Estado**       | ☐ PASS  ☐ FAIL |

---

### CP-10 — Rol del usuario desactivado

| Atributo         | Detalle                                      |
|------------------|----------------------------------------------|
| **Precondición** | Usuario `1000123456` existe pero su rol está desactivado |
| **Pasos**        | 1. Ingresar `1000123456` en "Documento o Email" <br> 2. Ingresar `Admin123` en "Contraseña" <br> 3. Clic en "Iniciar Sesión" |
| **Resultado esperado** | Mensaje: "Tu rol asignado ha sido desactivado. Por favor, contacta al administrador." |
| **Resultado obtenido** | _(completar al ejecutar)_ |
| **Estado**       | ☐ PASS  ☐ FAIL |

---

## 4. EVALUACIÓN DE LAS PRUEBAS

### 4.1 Tabla de resultados

| ID Caso | Descripción                          | Resultado Esperado                              | Resultado Obtenido | Estado |
|---------|--------------------------------------|-------------------------------------------------|--------------------|--------|
| CP-01   | Login con documento válido           | Acceso exitoso                                  |                    |        |
| CP-02   | Login con email válido               | Acceso exitoso                                  |                    |        |
| CP-03   | Username vacío                       | Formulario bloqueado por validación `required`  |                    |        |
| CP-04   | Contraseña vacía                     | Formulario bloqueado por validación `required`  |                    |        |
| CP-05   | Email con formato inválido           | Error: credenciales incorrectas                 |                    |        |
| CP-06   | Documento no registrado              | Error: credenciales incorrectas                 |                    |        |
| CP-07   | Contraseña incorrecta                | Error: credenciales incorrectas                 |                    |        |
| CP-08   | Usuario desactivado                  | Error: cuenta desactivada                       |                    |        |
| CP-09   | Usuario pendiente de aprobación      | Error: cuenta pendiente                         |                    |        |
| CP-10   | Rol desactivado                      | Error: rol desactivado                          |                    |        |

### 4.2 Métricas

| Métrica                        | Valor |
|--------------------------------|-------|
| Total de casos diseñados       | 10    |
| Casos ejecutados               |       |
| Casos PASS                     |       |
| Casos FAIL                     |       |
| Porcentaje de éxito            |       |
| Defectos encontrados           |       |

### 4.3 Criterios de aceptación
- El módulo se considera **aprobado** si el 100% de los casos válidos (CP-01, CP-02) pasan correctamente.
- El módulo se considera **aprobado** si el 100% de los casos inválidos muestran el mensaje de error correspondiente.
- Cualquier caso FAIL implica la apertura de un reporte de defecto.

---

## 5. INFORME FINAL

### 5.1 Resumen ejecutivo

**Módulo evaluado:** Inicio de Sesión — `AuthForm.tsx`
**Técnica aplicada:** Partición de Equivalencias (Caja Negra)
**Total de clases de equivalencia identificadas:** 9 (5 para username, 3 para password, 4 para estado del usuario — algunas se solapan)
**Total de casos de prueba diseñados:** 10

### 5.2 Hallazgos

#### Comportamiento correcto identificado en el código:
- ✅ El sistema diferencia correctamente entre entrada tipo email y tipo documento mediante regex.
- ✅ Se manejan 4 tipos distintos de error de autenticación con mensajes específicos al usuario.
- ✅ Ambos campos tienen el atributo `required`, previniendo envíos con campos vacíos.
- ✅ El botón "Iniciar Sesión" se deshabilita durante la carga (`disabled={isLoading}`), evitando doble envío.

#### Observaciones / Posibles mejoras:
- ⚠️ El campo `username` no tiene validación de longitud mínima en el frontend; un documento de 1 dígito pasaría la validación HTML y llegaría al servidor.
- ⚠️ No existe límite de intentos fallidos visible en el frontend (protección contra fuerza bruta debería estar en el backend).
- ⚠️ El campo `password` no tiene restricción de longitud mínima en el formulario de login (solo en el de registro).

### 5.3 Conclusión

La técnica de partición de equivalencias permitió cubrir los escenarios más representativos del módulo de login con solo 10 casos de prueba, evitando la redundancia de probar cada valor posible. El módulo demuestra un manejo adecuado de los estados de error del servidor y una validación básica de campos requeridos. Se recomienda agregar validación de longitud mínima en el campo `username` del formulario de login para mayor robustez en el frontend.

### 5.4 Recomendaciones
1. Agregar validación de longitud mínima al campo `username` en el login (mínimo 6 caracteres).
2. Implementar bloqueo temporal tras N intentos fallidos (visible en UI).
3. Considerar mostrar un indicador de "¿Ingresaste email o documento?" para mejorar la UX.

---
*Documento generado para actividad académica de pruebas de software — Mayo 2026*
