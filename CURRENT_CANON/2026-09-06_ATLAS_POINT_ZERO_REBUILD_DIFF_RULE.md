# ATLAS Ω — REBUILD DIFF RULE

After a valid clean rebuild, compare `CLEAN_SELECTED_PORTFOLIO` with `CURRENT_OPERATIONAL_PORTFOLIO`.

Report differences as set/rank differences first. Do not infer an execution genealogy.

Only explicit documented transactions/rebalance instructions may be called replacements in historical execution sequence.

`REBUILD_DIFF ≠ EXECUTED_REPLACEMENT_HISTORY`
