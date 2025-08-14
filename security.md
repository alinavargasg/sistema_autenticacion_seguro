# 📄 Documento de Seguridad – Sistema de Inicio de Sesión, Registro y Bienvenida

## 1. Riesgos Identificados y Medidas de Mitigación

| Riesgo | Descripción | Medidas de Mitigación |
|--------|-------------|-----------------------|
| **Fuerza bruta** | Intentos repetidos de adivinanza de credenciales. | - Límite de intentos de inicio de sesión.<br>- Bloqueo temporal de la cuenta.<br>- Registro de intentos fallidos para auditoría. |
| **XSS (Cross-Site Scripting)** | Inyección de scripts maliciosos en campos de texto. | - Sanitización y validación del input en frontend y backend.<br>- Uso de `Content-Security-Policy`.<br>- Escapado de salida en vistas. |
| **Robo de sesiones** | Secuestro del token de autenticación. | - Tokens JWT con expiración corta.<br>- Almacenamiento seguro en `HttpOnly Cookies` o `localStorage` cifrado.<br>- Regeneración de token tras login. |
| **SQL Injection** | Manipulación de consultas SQL. | - Uso de consultas preparadas.<br>- Validación estricta de datos.<br>- ORM seguro (ej. Sequelize, Eloquent). |
| **Transmisión insegura de datos** | Robo de credenciales en tránsito. | - Uso obligatorio de HTTPS.<br>- Cifrado TLS 1.2+.<br>- No enviar contraseñas en texto plano. |
| **Contraseñas débiles** | Uso de contraseñas fáciles de adivinar. | - Validación de fortaleza.<br>- Hash seguro con `bcrypt`.<br>- Recomendaciones de complejidad al usuario. |

---

## 2. Decisiones de Diseño de Seguridad

- **Cifrado de contraseñas:** Se utiliza `bcrypt` con factor de costo configurable para proteger contraseñas en la base de datos.
- **Tokens de autenticación:** JWT con firma HS256 y expiración corta (ej. 15 minutos) + Refresh Tokens.
- **Gestión de sesiones:** Se controla el estado con guardas (`guards`) en Angular y middleware de autenticación en el backend.
- **Validación y sanitización:** Implementada tanto en el cliente como en el servidor para prevenir inyecciones.
- **Protección contra XSS:** Uso de sanitización de Angular + encabezados `Content-Security-Policy` y `X-Content-Type-Options`.
- **Bloqueo de fuerza bruta:** Límite de intentos de inicio de sesión y bloqueo temporal con retroalimentación al usuario.
- **Arquitectura separada:** Backend y frontend separados, comunicándose únicamente por API segura.
- **Manejo adecuado de errores:** El sistema implementa un control estricto de errores para evitar fugas de información que puedan ser 
explotadas por un atacante.
 **Separación de mensajes**
  - **Frontend (Angular):** Mensajes amigables y comprensibles para el usuario final, por ejemplo:  
    > "Ha ocurrido un error al procesar su solicitud. Por favor, inténtelo más tarde."
  - **Backend:** Registro detallado con timestamp, endpoint, parámetros relevantes y stack trace (solo en entorno de desarrollo).

---

## 3. Límites Conocidos y Trabajo Futuro

| Límite | Descripción | Plan Futuro |
|--------|-------------|-------------|
| **Ausencia de MFA** | Actualmente no se usa autenticación multifactor. | Implementar MFA (SMS, correo o app autenticadora). |
| **No hay detección de IP sospechosa** | No se revisa la geolocalización o cambios drásticos de IP. | Integrar análisis de comportamiento y alertas. |
| **Sesiones prolongadas** | Algunos usuarios mantienen sesiones activas mucho tiempo. | Implementar cierre automático por inactividad. |
| **Falta de logs avanzados** | Los registros no se centralizan ni tienen análisis automático. | Usar un sistema SIEM para análisis de eventos. |
| **Gestión básica de contraseñas** | No se notifica si una contraseña fue filtrada. | Integrar verificación contra bases de datos de contraseñas comprometidas (ej. HaveIBeenPwned API). |

---

## 4. Resumen

Este sistema de inicio de sesión, registro y bienvenida se diseñó con **principios de seguridad desde el inicio** (“Security by Design”).  
Las medidas actuales mitigan los riesgos más críticos, pero el equipo mantiene un plan de mejora continua para reforzar la seguridad frente a amenazas emergentes.
