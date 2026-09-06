# ATLAS Ω — PRE-SELECTION INFORMATION LEAK AUDIT

Before a blind rebuild, verify that the selection context does not reveal:

- current operational ticker list;
- current operational N;
- current ranks;
- invested amounts/weights;
- personal P/L/cost basis;
- labels such as “must keep”, “cannot sell”, “incumbent”, “core current holding”;
- prior selected/challenger boundary presented as a starting shortlist.

Historical evidence files may still contain these facts. Retrieval/orchestration must avoid surfacing them into Phase 1 unless technically necessary and explicitly masked from membership reasoning.
