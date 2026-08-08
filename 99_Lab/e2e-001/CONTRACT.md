# E2E-001 Contract

## Input contract

Each parsed item is a mapping with:

- `id`: stable non-empty string
- `text`: non-empty source text
- `kind`: one of `fact`, `evidence`, `hypothesis`, `interpretation`
- `source`: optional source identifier
- `attributed_to`: optional person/author/entity
- `canonical_evidence`: boolean
- `truth_claim`: one of `established`, `supported`, `not_established`, `false`
- `attribution`: one of `preserved`, `none`

## Output contract

The harness returns:

```json
{
  "status": "PASS | QUARANTINED | REJECT",
  "route": "facts | evidence | hypotheses | interpretations | rejected",
  "reasons": ["..."],
  "item": {}
}
```

## Invariants

1. An `interpretation` can never be canonical evidence.
2. An `interpretation` can never carry `truth_claim = established`.
3. An attributable interpretation must preserve attribution.
4. A `fact` promoted to canonical evidence must have a source.
5. A `hypothesis` must never be canonical evidence.
6. Missing provenance for otherwise well-formed factual/evidentiary material yields `QUARANTINED`, not silent promotion.
7. Contract violations that would convert interpretation/hypothesis into objective truth yield `REJECT`.
8. Documentary attribution is allowed: the proposition "X argues Y" may be a sourced fact while Y remains unestablished.

## Routing

| kind | route |
|---|---|
| fact | facts |
| evidence | evidence |
| hypothesis | hypotheses |
| interpretation | interpretations |

Rejected inputs route to `rejected`.

## Certification boundary

This harness classifies and validates. It does not itself certify truth. Downstream Certified Output must retain the validation state and provenance trail.