<p align="center">
  <img src="./assets/icon.png" alt="Virtual Agent Logo" width="120" />
</p>

<h1 align="center">Virtual Agent</h1>
<h3 align="center">El Uber de Bienes Raíces</h3>

<p align="center">
  Aplicación móvil para la captura, gestión y seguimiento de propiedades inmobiliarias en Costa Rica, con sistema de recompensas para agentes de campo.
</p>

<p align="center">
  <img src="https://img.shields.io/badge/React%20Native-0.81.5-61DAFB?logo=react" alt="React Native" />
  <img src="https://img.shields.io/badge/Expo-54.0.33-000020?logo=expo" alt="Expo" />
  <img src="https://img.shields.io/badge/TypeScript-5.9.2-3178C6?logo=typescript" alt="TypeScript" />
  <img src="https://img.shields.io/badge/Zustand-5.0.12-orange" alt="Zustand" />
  <img src="https://img.shields.io/badge/Backend-Node.js%20%2F%20Express-green?logo=node.js" alt="Node.js" />
</p>

---

## Descripción general

**Virtual Agent** es una plataforma móvil que conecta a agentes de campo (scouts) con una empresa de bienes raíces, permitiéndoles registrar propiedades en venta directamente desde sus teléfonos y ganar comisiones por cada propiedad capturada, gestionada o vendida.

El scout recorre zonas residenciales o comerciales, fotografía rótulos de propiedades en venta, y la app se encarga de extraer automáticamente el número de teléfono del cartel mediante OCR, registrar la ubicación GPS y guardar la información en el sistema. Los administradores visualizan todas las propiedades en un mapa interactivo, gestionan el estado de cada una y controlan el pipeline de ventas.

---

## Objetivo de la aplicación

Facilitar la prospección masiva de propiedades inmobiliarias mediante una red distribuida de scouts, eliminando el proceso manual de prospección y permitiendo a la empresa recibir leads de propiedad en tiempo real, con trazabilidad completa del origen, el estado y las comisiones generadas.

---

## Cómo funciona Virtual Agent — Reglas de negocio

El sistema de recompensas opera bajo las siguientes reglas:

| Evento | Monto | Condición |
|--------|-------|-----------|
| Registro de propiedad nueva | **₡250** | La propiedad no debe existir ya en el sistema |
| El propietario acepta gestión | **₡2,000 adicionales** | El propietario firma acuerdo de correduría con Virtual Agent |
| Propiedad vendida exitosamente | **₡100,000** | La venta se realiza a través de Virtual Agent |
| Propiedad duplicada | **₡0** | No genera pago si el número de teléfono ya está registrado |

### Calendario de pagos

- **₡250** → Se pagan **semanalmente** por **Sinpe Móvil**, agrupando todas las propiedades nuevas válidas de la semana.
- **₡2,000** → Se pagan durante **la semana en que se firme el acuerdo de correduría**.
- **₡100,000** → Se pagan **una semana después** de que la empresa reciba la comisión de correduría por la venta.

### Reglas de validación

- Solo se aceptan **rótulos del propietario directo**. Los carteles de otras agencias inmobiliarias se marcan como inválidos y no generan pago.
- Las propiedades duplicadas (mismo número de teléfono ya registrado) no generan ningún ingreso.
- El estado de cada propiedad es controlado exclusivamente por el administrador.

---

## Tecnologías utilizadas

### Frontend (aplicación móvil)

| Tecnología | Versión | Uso |
|------------|---------|-----|
| React Native | 0.81.5 | Framework móvil principal |
| Expo | 54.0.33 | Plataforma de desarrollo y build |
| TypeScript | 5.9.2 | Tipado estático (modo estricto) |
| Zustand | 5.0.12 | Manejo de estado global |
| React Navigation | 7.x | Navegación (stack + bottom tabs) |
| Expo Camera | — | Captura de fotos de carteles |
| Expo Location | — | Obtención de coordenadas GPS |
| Expo Notifications | — | Notificaciones push |
| Expo Image Picker | — | Selección de foto de perfil |
| React Native Maps | 1.20.1 | Mapa interactivo para administradores |
| ML Kit Text Recognition | — | OCR para extraer números de teléfono |
| AsyncStorage | — | Persistencia local (token, tema, preferencias) |
| React Native QRCode SVG | — | Generación de QR para configuración 2FA |
| Lucide React Native | 1.14.0 | Íconos de la interfaz |

### Backend

| Tecnología | Uso |
|------------|-----|
| Node.js + Express | Servidor de API REST |
| MySQL (TiDB Cloud) | Base de datos relacional en la nube |
| JWT | Autenticación stateless |
| TOTP (RFC 6238) | Autenticación de dos factores |

### Servicios externos

| Servicio | Uso |
|----------|-----|
| Nominatim (OpenStreetMap) | Geocodificación inversa (lat/lng → Provincia, Cantón, Distrito) |
| Gravatar API | Avatar automático en registro |
| Render.com | Hosting del servidor backend |

---

## Estructura del proyecto

```
virtual-agent/
├── App.tsx                        # Punto de entrada raíz de la app
├── index.ts                       # Entry point de Expo
├── app.json                       # Configuración de Expo (permisos, íconos, splash)
├── package.json                   # Dependencias y scripts
├── tsconfig.json                  # Configuración TypeScript (modo estricto)
├── babel.config.js                # Configuración Babel
├── .env                           # Variables de entorno (no versionado)
│
├── assets/
│   ├── icon.png                   # Ícono principal de la app
│   ├── adaptive-icon.png          # Ícono adaptativo Android
│   ├── splash-icon.png            # Pantalla de splash
│   └── favicon.png                # Favicon web
│
└── src/
    ├── components/                # Componentes UI reutilizables
    │   ├── Input.tsx              # Campo de texto con label y error
    │   ├── Button.tsx             # Botón (primary / ghost / danger)
    │   ├── Card.tsx               # Contenedor con borde y padding
    │   ├── GlobalModal.tsx        # Diálogo de confirmación global
    │   └── AuthOverlay.tsx        # Overlay de autenticación
    │
    ├── config/
    │   └── walkthrough.ts         # Configuración de las slides de onboarding
    │
    ├── data/
    │   ├── mockData.ts            # Tipos TypeScript y datos de desarrollo
    │   └── types.ts               # Interfaces principales (User, Property, Post)
    │
    ├── hooks/
    │   └── useNotifications.ts    # Hook para permisos y notificaciones push
    │
    ├── navigation/
    │   ├── AppNavigator.tsx       # Navegador raíz (splash, walkthrough, routing)
    │   ├── AuthNavigator.tsx      # Stack de autenticación (Login / Register)
    │   ├── UserNavigator.tsx      # Tabs de scout (Dashboard, Capture, Community, Profile)
    │   └── AdminNavigator.tsx     # Tabs de administrador (Map, Management, Profile)
    │
    ├── screens/
    │   ├── SplashScreen.tsx       # Pantalla de carga inicial animada
    │   ├── WalkthroughScreen.tsx  # Onboarding de 3 slides
    │   ├── auth/
    │   │   ├── LoginScreen.tsx             # Inicio de sesión
    │   │   ├── RegisterScreen.tsx          # Registro de nuevo scout
    │   │   └── TwoFAChallengeScreen.tsx    # Verificación de código 2FA al iniciar sesión
    │   ├── user/
    │   │   ├── DashboardScreen.tsx         # Resumen de ingresos y propiedades del scout
    │   │   ├── CapturePropertyScreen.tsx   # Flujo completo de captura de propiedad
    │   │   ├── CommunityScreen.tsx         # Tablero de publicaciones de la comunidad
    │   │   └── ProfileScreen.tsx           # Perfil y estadísticas del usuario
    │   ├── admin/
    │   │   ├── AdminMapScreen.tsx          # Mapa con marcadores de propiedades
    │   │   └── PropertyManagementScreen.tsx# Listado y gestión de propiedades
    │   └── profile/
    │       ├── PersonalDataScreen.tsx      # Edición de datos personales
    │       ├── CustomizationScreen.tsx     # Tema, tamaño de texto, hápticos
    │       ├── NotificationsScreen.tsx     # Preferencias de notificaciones
    │       ├── PasswordScreen.tsx          # Cambio de contraseña
    │       ├── TwoFAScreen.tsx             # Activación/desactivación de 2FA
    │       ├── HelpCenterScreen.tsx        # Centro de ayuda y preguntas frecuentes
    │       └── RulesScreen.tsx             # Reglas y términos de la plataforma
    │
    ├── services/
    │   └── authService.ts         # Llamadas HTTP de autenticación
    │
    ├── store/
    │   ├── useAppStore.ts         # Estado global principal (auth, propiedades, comunidad)
    │   ├── useThemeStore.ts       # Estado del tema visual
    │   ├── useModalStore.ts       # Estado del modal de confirmación global
    │   └── useNotificationStore.ts# Estado de preferencias de notificaciones
    │
    ├── theme/
    │   ├── ThemeContext.tsx        # Provider y hook useTheme()
    │   └── themes.ts              # Paleta de colores dark / light
    │
    └── utils/
        ├── locationUtils.ts       # Geocodificación inversa, formatCurrency, formatDate
        ├── totp.ts                # Implementación TOTP pura en TypeScript (RFC 6238)
        └── storageUtils.ts        # Helpers de AsyncStorage
```

---

## Instalación y ejecución local

### Prerrequisitos

- **Node.js** 18+ y **npm** 9+
- **Expo CLI:** `npm install -g expo-cli`
- **Expo Go** instalado en tu dispositivo móvil (iOS / Android), o un emulador configurado
- Cuenta en [Expo](https://expo.dev) (opcional, para builds en la nube)

### Pasos de instalación

```bash
# 1. Clonar el repositorio
git clone https://github.com/tu-usuario/virtual-agent.git
cd virtual-agent

# 2. Instalar dependencias del frontend
npm install

# 3. Configurar variables de entorno
cp .env.example .env
# Editar .env con tus valores reales
```

### Ejecutar la aplicación

```bash
# Modo desarrollo (abre el menú de Expo)
npx expo start

# Directamente en Android
npx expo start --android

# Directamente en iOS
npx expo start --ios

# En navegador web (funcionalidad limitada)
npx expo start --web
```

Escanea el código QR con **Expo Go** en tu dispositivo o presiona `a` para Android / `i` para iOS en el terminal.

---

## Variables de entorno

Crea un archivo `.env` en la raíz del proyecto con el siguiente contenido:

```env
# URL base del servidor backend
EXPO_PUBLIC_API_URL=https://fourgentcr.onrender.com
```

> Las variables con prefijo `EXPO_PUBLIC_` quedan disponibles en el cliente. No incluyas secretos sensibles con este prefijo.

Para desarrollo local con el backend corriendo en tu máquina:

```env
EXPO_PUBLIC_API_URL=http://192.168.X.X:3001
```

---

## Scripts principales

| Comando | Descripción |
|---------|-------------|
| `npx expo start` | Inicia el servidor de desarrollo de Expo |
| `npx expo start --android` | Abre directamente en emulador/dispositivo Android |
| `npx expo start --ios` | Abre directamente en simulador/dispositivo iOS |
| `npx expo build` | Genera build de producción (EAS Build recomendado) |
| `npx expo install` | Instala dependencias compatibles con la versión de Expo |

---

## Flujo general de la aplicación

```
Inicio
  └── SplashScreen (animación de carga)
        └── WalkthroughScreen (onboarding, 1 sola vez)
              └── ¿Usuario autenticado?
                    ├── No → AuthNavigator
                    │         ├── LoginScreen
                    │         │     └── ¿2FA activo? → TwoFAChallengeScreen
                    │         └── RegisterScreen
                    │
                    └── Sí → ¿Rol?
                              ├── scout → UserNavigator
                              │           ├── DashboardScreen
                              │           ├── CapturePropertyScreen
                              │           ├── CommunityScreen
                              │           └── ProfileScreen → Settings Stack
                              │
                              └── admin → AdminNavigator
                                          ├── AdminMapScreen
                                          ├── PropertyManagementScreen
                                          └── ProfileScreen → Settings Stack
```

---

## Funcionalidades más importantes

### Para scouts

**Captura de propiedad (flujo completo):**
1. El scout fotografía el rótulo del cartel con la cámara integrada.
2. El OCR (ML Kit) analiza la imagen y extrae automáticamente el número de teléfono del propietario, mostrando un indicador de confianza (alta / baja).
3. Si el OCR falla, el scout puede ingresar el número manualmente.
4. La app captura automáticamente la ubicación GPS y realiza geocodificación inversa para obtener Provincia, Cantón y Distrito.
5. El scout completa el formulario con el tipo de propiedad, descripción, precio aproximado y si acepta exclusividad.
6. La propiedad se registra en el servidor y queda pendiente de validación por el administrador.

**Dashboard personal:**
- Resumen de ingresos totales acumulados.
- Contador de propiedades por estado (nueva, en negociación, contrato cerrado, inválida).
- Historial de las 5 propiedades más recientes.

**Comunidad:**
- Tablero compartido de publicaciones entre todos los scouts.
- Sistema de likes y publicaciones de hasta 300 caracteres.

### Para administradores

**Mapa interactivo:**
- Visualización de todas las propiedades capturadas como marcadores en el mapa.
- Filtrado por estado (nueva / en negociación / contrato cerrado / inválida).
- Búsqueda por nombre de scout, ubicación o teléfono.
- Panel deslizante con detalle completo al tocar un marcador.
- Cambio de estado directamente desde el panel del mapa.

**Gestión de propiedades:**
- Listado completo con filtros y búsqueda.
- Cambio de estado con confirmación y notas opcionales.
- Exportación de datos en formato JSON.
- Eliminación de propiedades con confirmación.

### Autenticación y seguridad

- **JWT:** Tokens almacenados localmente en AsyncStorage, inyectados automáticamente en cada petición.
- **2FA (TOTP):** Implementación pura en TypeScript compatible con Google Authenticator y cualquier app TOTP estándar (RFC 6238). El QR se genera directamente en el dispositivo.
- **Logout automático:** Si el servidor retorna 401, la sesión se limpia y el usuario es redirigido al login.

### Personalización

- **Tema oscuro / claro / sistema:** Persistido en AsyncStorage.
- **Tamaño de texto:** Pequeño (0.85×), Normal (1.0×), Grande (1.18×).
- **Hápticos:** Vibración tactil activable/desactivable.
- **Animaciones:** Animaciones de interfaz activables/desactivables.
- **Color de acento:** Personalizable (morado por defecto: `#6C63FF`).

---

## Almacenamiento local

La aplicación persiste los siguientes datos en `AsyncStorage` del dispositivo:

| Clave | Contenido |
|-------|-----------|
| `@virtualagent_token` | JWT de sesión activa |
| `@virtualagent_theme` | Preferencias de tema (modo, acento, tamaño de texto, hápticos, animaciones) |
| `@virtualagent_2fa` | Mapa `{ [userId]: boolean }` indicando si 2FA está habilitado por cuenta |
| `@virtualagent_notifications` | Preferencias de notificaciones push (nuevas props, cambios de estado, pagos, marketing) |
| `@virtualagent_walkthrough_seen` | `'1'` si el onboarding ya fue mostrado |

---

## Consideraciones importantes

- **Carteles de agencias:** La app incluye un campo para marcar si la propiedad pertenece a una agencia. Estas se clasifican como inválidas y no generan pago al scout.
- **Propiedades duplicadas:** Si el número de teléfono ya existe en el sistema, el registro se marca como duplicado y no genera comisión.
- **Permisos requeridos:** Cámara, ubicación, galería de medios. La app solicita estos permisos en el momento en que se necesitan, con mensajes explicativos en español.
- **Geocodificación:** Se utiliza la API gratuita de Nominatim (OpenStreetMap). Para uso intensivo en producción, se recomienda migrar a una API con cuotas más altas (Google Maps Platform, Mapbox).
- **OCR:** El reconocimiento de texto es local (ML Kit, sin servidor), por lo que funciona sin conexión a internet durante la captura.
- **Backend en Render.com (free tier):** El servidor puede tener latencia inicial de ~30 segundos si está inactivo (cold start). En producción, se recomienda un plan de servidor activo permanente.

---

## Posibles mejoras futuras

- **Verificación de duplicados en tiempo real:** Consultar al servidor mientras se escribe el número de teléfono antes de enviar el formulario, para alertar al scout sobre duplicados antes de capturar.
- **Modo offline completo:** Encolar capturas cuando no hay internet y sincronizarlas al recuperar conexión.
- **Dashboard de pagos:** Pantalla dedicada con el historial de pagos recibidos, fechas y montos desglosados por semana.
- **Sistema de notificaciones push real:** Integrar un servicio como Firebase Cloud Messaging (FCM) para notificar al scout cuando una propiedad cambia de estado.
- **Panel de estadísticas para admin:** Gráficas de capturas por zona, scout, mes y tipo de propiedad.
- **Firma digital del acuerdo de correduría:** Flujo de firma digital directamente en la app para acelerar el proceso de activar los ₡2,000.
- **Reconocimiento de imágenes múltiples:** Permitir al scout capturar varias fotos del rótulo para mejorar la precisión del OCR en condiciones de poca luz.
- **Exportación a PDF/Excel** desde el panel de administración.

---

## Credenciales de prueba

> Solo para entornos de desarrollo. No usar en producción.

| Rol | Correo | Contraseña |
|-----|--------|------------|
| Scout | `carlos@virtualagent.cr` | `123456` |
| Admin | `admin@virtualagent.cr` | `admin123` |

**Código 2FA de prueba:** Usa el secreto `JBSWY3DPEHPK3PXP` en cualquier app TOTP (Google Authenticator, Authy).

---

## Licencia

Este proyecto es de uso privado y pertenece a **Virtual Agent / 4gentcr**. Todos los derechos reservados.

Para consultas sobre el proyecto, contactar al equipo de desarrollo.

---

<p align="center">
  Desarrollado con ❤️ en Costa Rica · Virtual Agent © 2025
</p>
