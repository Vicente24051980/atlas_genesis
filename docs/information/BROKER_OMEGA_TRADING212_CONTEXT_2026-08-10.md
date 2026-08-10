# BROKER Ω — Trading 212 / ATLAS Ω Mobile

Fecha de registro: 2026-08-10

## Contexto

Se evaluó si el proyecto ATLAS Ω Mobile podía evolucionar desde una app de análisis hacia una capa de ejecución conectada a Trading 212. La conclusión es sí: la app existente sirve como base y no es necesario reconstruirla desde cero.

## Decisión de arquitectura

ATLAS Ω mantiene separación estricta entre análisis/decisión y ejecución de broker.

Flujo objetivo:

`Trading 212 API -> datos de cuenta/posiciones/órdenes -> ATLAS Ω -> reglas deterministas -> controles de riesgo -> ejecución -> Decision Log Ω / Audit Log Ω -> app Android`

La IA generativa no debe actuar como ejecutor directo de cada operación. La lógica operativa debe ser reproducible, auditable y gobernada por reglas explícitas.

## Restricción principal de producto

Uso móvil como interfaz principal. La APK Android es el centro de control. Las credenciales sensibles viven en backend y nunca dentro de la APK.

## Implementación realizada

Se implementó y fusionó en `main` la capa `Broker Ω` con Trading 212.

PR: `#15 feat: Broker Ω with guarded Trading 212 execution`

Merge commit: `18fddf3573192f6217ed6610556d143c6b303b9b`

Funciones incorporadas:

- Adaptador Trading 212 demo/live en FastAPI.
- Autenticación de Trading 212 exclusivamente en backend.
- `ATLAS_BROKER_CONTROL_TOKEN` independiente para proteger endpoints privados.
- Consulta de resumen de cuenta.
- Consulta de posiciones.
- Consulta de órdenes pendientes.
- Búsqueda de instrumentos exactos de Trading 212.
- Envío de órdenes market.
- Cancelación de órdenes pendientes.
- Caché de instrumentos para reducir llamadas innecesarias.
- Tratamiento explícito de rate limits y errores upstream.
- Sin reintentos ciegos de órdenes POST.
- Pantalla Android `Broker Ω`.
- Ruta Broker Ω añadida al menú móvil.
- Registro local de intención, aceptación y fallo de órdenes en `Decision Log Ω` y `Audit Log Ω`.
- El control token no se guarda en los logs.

## Guardrails de seguridad

Configuración por defecto:

- `TRADING212_ENV=demo`
- `TRADING212_LIVE_TRADING_ENABLED=false`

Para una orden demo se exige confirmación `EXECUTE_DEMO`.

Para una orden real se exige simultáneamente:

1. `TRADING212_ENV=live`.
2. `TRADING212_LIVE_TRADING_ENABLED=true` en servidor.
3. Confirmación específica `EXECUTE_LIVE` por orden.
4. `ATLAS_BROKER_CONTROL_TOKEN` válido.
5. Credenciales Trading 212 válidas en backend.

Si cualquiera falla, LIVE queda bloqueado.

## Variables de entorno requeridas

- `FINNHUB_TOKEN`
- `TRADING212_ENV`
- `TRADING212_API_KEY`
- `TRADING212_API_SECRET`
- `ATLAS_BROKER_CONTROL_TOKEN`
- `TRADING212_LIVE_TRADING_ENABLED`

No se deben versionar secretos en GitHub.

## Estado de validación

Se añadió verificación CI específica para Broker Ω:

- Compilación/sintaxis API.
- Verificación de guardrails fail-closed.
- TypeScript mobile.
- Build APK Android.
- Gate funcional en emulador según el workflow móvil existente.

En la validación del cambio, la verificación de API/guardrails y TypeScript finalizaron correctamente antes de la fusión.

## Próxima activación operativa

El código está preparado, pero la conexión real depende de secretos que no pueden inventarse ni almacenarse en el repositorio.

Para activar demo/paper:

1. Crear/usar credenciales API de Trading 212 para entorno demo.
2. Configurar `TRADING212_API_KEY` y `TRADING212_API_SECRET` en Render.
3. Generar y configurar un `ATLAS_BROKER_CONTROL_TOKEN` privado.
4. Mantener `TRADING212_ENV=demo`.
5. Mantener `TRADING212_LIVE_TRADING_ENABLED=false`.
6. Sincronizar cuenta desde Broker Ω en Android.
7. Buscar el instrumento Trading 212 exacto.
8. Probar una orden mínima demo.
9. Revisar `Decision Log Ω` y `Audit Log Ω`.
10. Validar durante una ventana suficiente antes de considerar LIVE.

## Regla permanente

No activar ejecución real únicamente porque la infraestructura funcione. La validación de paper trading, controles de riesgo, identificación exacta del instrumento y trazabilidad completa son requisitos previos.

## Nota sobre el origen de la idea

La conversación partió de un ejemplo viral de un supuesto bot de arbitraje creado con Claude Code. Se concluyó que construir bots/scanners automáticos es técnicamente posible, pero que afirmaciones extremas de rentabilidad como multiplicar decenas de dólares hasta cientos de miles en días no deben aceptarse sin evidencia extraordinaria. Para Trading 212, el caso de uso adecuado es automatización disciplinada de análisis, señales y ejecución controlada, no arbitraje de latencia ultrarrápida.
