# ATLAS Ω v3.1 — Auditoría cola de órdenes Trading 212

**Fecha:** 16-ago-2026  
**Objeto:** reconciliar las órdenes visibles en capturas de Trading 212 con la cartera oficial congelada 35 + NVDA #36.

## Cartera oficial congelada
GOOGL, MSFT, AMZN, TSM, ASML, FTNT, PWR, SU.PA, GE, MP, CB, ALNY, ARGX, EXENS.PA, HWM, AEM, KKR, IOT, LNG, AXON, ADYEN, NU, HALO, VST, GEV, RDDT, TJX, CRDO, WISE, RBRK, NXT, WST, FTAI, PLMR, SE + NVDA #36.

## Hallazgos de integridad de órdenes
- Compras visibles: 32 órdenes, 29 tickers únicos.
- Duplicados de compra: IOT/Samsara, RBRK/Rubrik y ARGX/Argenx aparecen dos veces.
- Compras externas al basket congelado: RR.L, NVTS, MTSI, STM, UBER, FN y SK hynix.
- Ventas visibles: 30 órdenes.
- Ventas que afectan a tickers que SÍ pertenecen al basket oficial: NVDA, SU.PA, GOOGL, FTNT, MP, PWR, GE, ASML, AMZN y MSFT.
- Estas ventas son incompatibles con el freeze salvo que sean rebalanceos parciales cuyo valor posterior quede exactamente en 11 € por ticker.

## Compras oficiales visibles — mantener una sola orden
IOT, RBRK, ARGX, VST, PLMR, SE, HALO, WST, NXT, WISE, CRDO, RDDT, LNG, AXON, TJX, ADYEN, NU, ALNY, EXENS.PA, HWM, AEM, GEV.

## Compras externas — no ejecutar dentro de la prueba congelada
RR.L, NVTS, MTSI, STM, UBER, FN, SK hynix.

### Auditoría fundamental resumida de externos
- RR.L: candidato serio de máxima calidad; H1 2026 mostró mejora fuerte de beneficio operativo, FCF y guidance. Mantener en Watchlist/Challenger; no romper el freeze.
- MTSI: crecimiento y rentabilidad muy fuertes; candidato serio para comparación futura contra CRDO/FN en conectividad/semis. No introducir en la prueba actual.
- FN: crecimiento extraordinario, pero resultados FY/Q4 previstos para 17-ago-2026; no abrir antes del event gate dentro del freeze.
- UBER: plataforma de elevada calidad y FCF; Watchlist, no sustituye automáticamente un Successor del basket.
- SK hynix: economía HBM excepcional pero elevada ciclicidad y concentración en el mismo driver AI-CAPEX; no añadir a la prueba.
- STM: recuperación en marcha pero Q2 mostró rentabilidad/guía todavía menos convincentes que los semis ya elegidos; no añadir.
- NVTS: asimetría tecnológica alta pero revenue todavía pequeño, pérdidas operativas y Economic Proof Gate insuficiente; no añadir.

## Ventas no oficiales — coherentes con limpieza del basket
ICE, AMD, V, MA, LLY, ROP, SNPS, ABT, CAT, VRT, RWE, SAF.PA, META, SNOW, FIX, MEDP, IBKR, NOW, AAPL, COR.

Estas ventas no significan falsificador fundamental. Son salidas de construcción de cartera para respetar el basket congelado. V, ROP e ICE además estaban declaradas fuera definitivamente.

## Regla operativa
1. Eliminar duplicados IOT/RBRK/ARGX.
2. Cancelar o aplazar las 7 compras externas al basket durante la prueba.
3. No ejecutar ventas sobre los 10 tickers oficiales salvo que la venta sea únicamente el exceso sobre 11 € de valor posterior.
4. Mantener las ventas de los 20 nombres no oficiales si el objetivo sigue siendo ejecutar exactamente la cartera congelada.
5. Verificar que TSM, CB, KKR y FTAI —que no aparecen en la cola mostrada— ya estén en 11 €; si no, completar únicamente la diferencia.

## Challenger list post-prueba
- Aerospace: RR.L vs FTAI/EXENS/GE/HWM.
- AI connectivity: MTSI vs FN vs CRDO.
- Platform/consumer rails: UBER vs candidatos de plataforma existentes.

**Estado Ω:** ORDER_QUEUE_RECONCILIATION_REQUIRED_BEFORE_EXECUTION.
**Portfolio change:** NONE. Freeze preservado.
