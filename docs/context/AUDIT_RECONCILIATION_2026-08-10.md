# ATLAS Ω Enterprise — Reconciliación de auditoría histórica

Fecha de reconciliación: 2026-08-10

## Alcance

Este documento conserva como información la auditoría del 2026-08-04 aportada por el usuario y la contrasta con el estado real observado en `main` el 2026-08-10. No es código ejecutable y no modifica lógica de inversión, Broker Ω ni decisiones BUY/SELL.

## Hallazgos verificados hoy

### EAS / versión móvil

- `mobile/app.json` sigue declarando `version: 0.9.0` y no contiene `extra.eas.projectId`.
- `mobile/package.json` sigue declarando `version: 0.1.0`.
- Por tanto, la discrepancia de versión sigue existiendo.
- No debe aplicarse literalmente el diff histórico de variable de entorno porque el repo actual usa `EXPO_PUBLIC_ATLAS_API_BASE_URL`, no `EXPO_PUBLIC_API_URL`.

### EAS environments

- `mobile/eas.json` mantiene `development` contra `http://localhost:8000`.
- `preview` y `production` apuntan a `https://atlas-genesis-api.onrender.com`.
- La clave configurada es `EXPO_PUBLIC_ATLAS_API_BASE_URL`.

### Backend / Render

- `render.yaml` usa `uvicorn api.app:app --host 0.0.0.0 --port $PORT`.
- `api/app.py` importa `app` desde `api.main` e incluye de forma aditiva los routers `market`, `atlas_core` y `evidence`.
- La separación `api.main` como base y `api.app` como agregador es real; no debe sustituirse por `api.main:app` en despliegue.

### Trading 212

- `TRADING212_LIVE_TRADING_ENABLED` sigue siendo `false` por defecto en Render.
- `api/main.py` exige control token para endpoints de broker y exige confirmación explícita `EXECUTE_DEMO` o `EXECUTE_LIVE` según entorno.
- En entorno live, las órdenes se bloquean si `TRADING212_LIVE_TRADING_ENABLED` no está habilitado servidor-side.

### Mocks

- La búsqueda de `MOCK_` en el índice de código no devolvió resultados.
- Por tanto, la afirmación histórica «pantallas probablemente consumen mocks» no debe tratarse como hecho sin inspección de cada pantalla concreta.

## Elementos de la auditoría del 04/08 que siguen vigentes

- Mobile-first Android.
- Expo / React Native modernos; no hay motivo verificado para un downgrade.
- `api.app:app` es el entrypoint correcto de despliegue.
- La discrepancia `0.1.0` vs `0.9.0` sigue presente.
- El dev build con localhost no sirve directamente para un teléfono físico fuera del host, salvo túnel o red accesible.
- Los guardrails de Trading 212 deben conservarse.

## Elementos que no deben aplicarse literalmente

- Cambiar `EXPO_PUBLIC_API_URL`: la variable real actual es `EXPO_PUBLIC_ATLAS_API_BASE_URL`.
- Asumir que añadir `extra.eas.projectId` garantiza por sí solo que CI pase: debe verificarse el workflow y la resolución real del proyecto EAS.
- Afirmar que Drizzle RC rompe con RN 0.86: requiere evidencia reproducible; es riesgo hipotético, no hecho.
- Afirmar que Portfolio, Watchlist o Business Quality muestran mocks sin inspección de sus implementaciones actuales.
- Crear endpoints nuevos de CAPEX, Rotation o Evidence solo porque se mencionaron en la auditoría histórica; primero debe comprobarse qué endpoints existen hoy y qué contratos consume la UI.

## Regla operativa

Antes de ejecutar cambios derivados de una auditoría antigua:

1. Leer el archivo actual en `main` o en el PR objetivo.
2. Separar HECHO, INFERENCIA y SOSPECHA.
3. No introducir nombres de variables, rutas o endpoints que no coincidan con el código actual.
4. Validar CI sobre el head real antes de declarar un APK listo.
5. Mantener la separación entre scanner/discovery, scoring ATLAS, portfolio/watchlist y Broker Ω.

## Estado

Este registro queda archivado como contexto técnico e histórico. Los cambios de código deben ir en PRs separados y basados en evidencia actual del repositorio, no en la fotografía del 2026-08-04.
