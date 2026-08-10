# Global Momentum Screener — definición y notas de investigación

Fecha de registro: 2026-08-10
Estado: información / research note. No constituye por sí sola una decisión de inversión.

## Objetivo

Construir un screener global de acciones, sin sesgo sectorial ni filtro ATLAS previo, que identifique compañías con fortaleza de mercado simultánea en tres horizontes temporales.

## Regla dura de entrada

Una compañía solo pasa el screener si cumple simultáneamente:

- Última sesión cotizada > 0%
- Rentabilidad 3 meses > 0%
- Rentabilidad 1 año > 0%

Cualquier valor rojo en uno de los tres horizontes implica FAIL.

No sustituir:

- 1 año por YTD
- 3 meses por 1 mes, 6 meses u otra ventana
- última sesión por premarket o aftermarket

Si Wall Street está cerrado, se usa el último cierre regular disponible.

## Cobertura

Barrido global y multiseccional, incluyendo los 11 sectores GICS cuando haya compañías líquidas y datos verificables:

- Tecnología
- Comunicación
- Consumo discrecional
- Consumo básico
- Salud
- Financieras
- Industriales
- Energía
- Materiales
- Utilities
- Inmobiliario

No forzar un número fijo por sector. Si un sector tiene pocas compañías que cumplen, se conserva esa señal en lugar de rellenar artificialmente la lista.

## Principio de discovery

Secuencia obligatoria:

1. Universo global amplio.
2. Descubrir tickers sin aplicar narrativa, cartera, sector favorito ni filtros ATLAS.
3. Aplicar Día > 0%, 3M > 0%, 1A > 0%.
4. Solo después ordenar supervivientes y estudiar calidad operativa/fundamental si interesa.

Objetivo: evitar sesgo de cobertura y sesgo de confirmación.

## Ejemplo canónico visual — Palo Alto Networks (PANW)

Capturas aportadas por el usuario muestran:

- Precio: 363,86 USD
- Última sesión: +1,22%
- Semana: +9,65%
- 1 mes: +13,50%
- 3 meses: +75,03%
- 1 año: +110,47%
- Desde inicio: +4.403,22%

Para este screener, los campos decisivos son:

PANW | Día +1,22% | 3M +75,03% | 1A +110,47% | PASS

Este ejemplo define exactamente qué significa “en verde” para futuras búsquedas.

## Universo candidato preliminar mencionado durante el barrido

Estos nombres fueron considerados como universo de trabajo, NO como lista final validada:

### Tecnología
PANW, NVDA, AVGO, MU, ASML, TSM, COHR, LITE, DELL, KLAC, LRCX, AMAT, CDNS

### Industriales
KRX, CAT, GE, PWR, FIX, HEI, ETN, VRT, CLS, PH

### Salud
GMAB, LLY, HALO, RMD, BSX, ZTS, ISRG

### Financieras
JPM, BAC, MS, GS, V, MA, SPGI, MCO

### Comunicación
META, GOOGL/GOOG, NFLX

### Consumo discrecional
TSLA, AMZN, UBER, BKNG, RL

### Consumo básico
PM, MO, UL, COST

### Materiales
FCX, NUE, FRES, AEM

### Energía
XOM, FANG, SHEL, TTE, CVX

### Utilities
CEG, VST, NRG

### Inmobiliario
WELL, VTR

## Casos mencionados como FAIL en snapshots previos

Se documentaron ejemplos de compañías que parecían fuertes pero que no cumplían simultáneamente los tres filtros en el snapshot revisado:

- PWR: sesión negativa en el snapshot citado, pese a 3M/1A positivos.
- NEM: 3M negativo en el snapshot citado.
- CEG: 3M y 1A negativos en el snapshot citado.
- VRT: 3M y sesión negativos en el snapshot citado.
- ETN: 3M negativo en snapshots recientes citados.
- ISRG: 3M y 1A negativos en el snapshot citado.
- GS: 3M y 1A positivos, pero sesión negativa en el snapshot citado.
- SpaceX/SPCX: no puede cumplir el requisito de 1 año si aún no dispone de historial cotizado de 12 meses.

Estos ejemplos son notas de investigación y deben revalidarse con el mismo corte temporal antes de usarse operativamente.

## Formato final deseado

Ticker | Empresa | País | Sector | Último cierre | Día % | 3M % | 1A % | PASS/FAIL

Solo declarar PASS cuando los tres porcentajes estén verificados para el mismo corte de mercado.

## Filosofía operativa

El screener mide persistencia de fuerza de mercado; no garantiza que una acción vaya a seguir subiendo. La idea es encontrar compañías que el mercado está premiando simultáneamente a corto, medio y largo plazo y, después, investigar cuáles están además bien gestionadas, bien implementadas y operativamente sólidas.

La selección fundamental o cualquier algoritmo ATLAS se aplica únicamente después del discovery y del filtro de momentum, no antes.
