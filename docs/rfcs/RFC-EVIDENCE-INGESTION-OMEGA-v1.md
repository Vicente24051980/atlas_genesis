# RFC-EVIDENCE-INGESTION-OMEGA-v1

## Estado

ACEPTADO COMO CAPA DE INTEGRACION ATLAS OMEGA.

Fecha: 2026-08-09  
Ambito: ATLAS Omega Mobile + backend/API futura  
Objetivo: convertir fuentes publicas, documentos corporativos y contenido web permitido en evidencia estructurada para los motores ATLAS.

## Regla movil-first

El usuario opera desde movil y apps moviles. Toda integracion ATLAS debe funcionar primero como experiencia movil:

- entrada por captura, archivo subido, enlace, texto pegado o fuente sincronizada;
- salida en tarjetas compactas;
- evidencia trazable disponible offline cuando sea posible;
- sincronizacion diferida;
- cero dependencia obligatoria de escritorio para uso diario.

## Principio rector

La capa de ingesta no existe para saltarse restricciones, huellas anti-bot, muros de pago, logins privados ni terminos de servicio. Existe para transformar fuentes permitidas en evidencia verificable.

Regla canonica:

> No hay decision ATLAS sin fuente, timestamp, tipo de evidencia, nivel de confianza y trazabilidad al dato primario.

## Encaje en arquitectura ATLAS

```text
Fuente publica / documento / pagina permitida
  -> Ingestion Adapter
  -> Normalizacion
  -> Evidence Omega
  -> Epistemic Classification
  -> Motor ATLAS correspondiente
  -> Decision Log Omega
```

## Herramientas aprobadas

| Prioridad | Herramienta | Rol ATLAS | Estado |
|---:|---|---|---|
| 1 | Microsoft MarkItDown | Conversion de PDFs, Word, Excel, PowerPoint, HTML e imagenes a Markdown para IA | Core adapter |
| 2 | Firecrawl | Web/public pages a Markdown o JSON estructurado | Core adapter opcional |
| 3 | Crawl4AI | Web crawler orientado a RAG/agentes, alternativa autoalojada | Core adapter opcional |
| 4 | Scrapy | Crawler industrial para fuentes repetitivas y estables | Batch adapter |
| 5 | Playwright / Browser Use | Navegacion controlada en paginas dinamicas permitidas | Controlled adapter |
| 6 | Crawlee | Alternativa JS/TypeScript para scraping y browser automation | Candidate adapter |
| 7 | Scrapling | Scraping adaptativo; evaluar antes de core | Experimental |
| 8 | AutoScraper | Extraccion simple por ejemplos | Utility |
| 9 | scrcpy | Pruebas Android y QA de app movil | QA only |
| 10 | curl-impersonate | Cliente HTTP con huella de navegador | Restricted / not core |

## Restricciones de seguridad

Prohibido en ATLAS Core:

- Saltar CAPTCHAs, paywalls, logins privados o bloqueos tecnicos.
- Usar credenciales personales para extraer datos de terceros sin autorizacion.
- Ocultar identidad del cliente para eludir controles anti-abuso.
- Ingerir datos personales innecesarios.
- Mezclar contenido no verificado con hechos canonicos.

Permitido:

- SEC, EDGAR, investor relations, comunicados de prensa, transcripts publicos.
- PDFs corporativos publicados por la empresa.
- Paginas publicas con robots/terminos compatibles.
- Documentos subidos por el usuario.
- Fuentes macro, reguladores y organismos oficiales.

## Niveles de fuente

| Nivel | Fuente | Uso |
|---:|---|---|
| 1 | SEC, reguladores, investor relations, conference calls oficiales | Puede modificar conviction si valida falsificador o mejora tesis |
| 2 | Proveedores financieros, comunicados sindicados, bolsas, datos macro oficiales | Puede activar vigilancia |
| 3 | Medios financieros reputados, analistas, informes secundarios | Contexto, no cambio canonico sin confirmacion |
| 4 | Redes sociales, newsletters, capturas, rumores | Radar o hipotesis; nunca hecho canonico |

## Integracion en algoritmo

Evidence Ingestion Omega se ejecuta antes de cualquier motor que pueda producir decision:

```text
Input movil
  -> Evidence Ingestion Omega
  -> Validation Harness Omega
  -> Epistemic Classification
  -> GLOBAL DISCOVERY
  -> MARKET FILTERS
  -> BUSINESS QUALITY OMEGA
  -> GROWTH OMEGA
  -> CAPEX PRODUCTIVITY OMEGA
  -> VALUATION OMEGA
  -> RISK OMEGA
  -> CATALYSTS OMEGA
  -> FINAL SCORE OMEGA
  -> Decision Log Omega
```

## Casos de uso

- Vigilancia diaria.
- CAPEX Productivity Omega.
- Money Rotation Omega.
- Historical Dislocation Omega.
- Futuros Protectores Digitales.
- Conspiraciones Atlas.
- ATLAS Mobile Evidence Inbox.

## Criterios de aceptacion

- Toda evidencia tiene fuente, timestamp, adapter y hash.
- Ninguna salida canonica cambia desde fuente nivel 3 o 4 sin confirmacion primaria.
- Capturas y redes sociales entran como radar/hipotesis.
- Documentos subidos se convierten con MarkItDown o parser equivalente.
- El motor puede explicar de donde sale cada afirmacion.
- El Decision Log enlaza con evidencia concreta.
