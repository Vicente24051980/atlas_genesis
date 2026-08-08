from __future__ import annotations

from typing import Any


class ReferenceEngine:
    """Validate derivation lineage as a directed acyclic graph (UO 1.1 RC1)."""

    @classmethod
    def validate_references(cls, uo_data: dict[str, Any]) -> dict[str, Any]:
        violations: list[dict[str, Any]] = []
        derived_claims = uo_data.get("derived_claims", [])

        if not isinstance(derived_claims, list) or not derived_claims:
            return cls._build_result(True, [])

        graph: dict[str, list[str]] = {}
        all_nodes: set[str] = set()

        for claim in derived_claims:
            if not isinstance(claim, dict):
                continue
            claim_id = claim.get("claim_id")
            if not isinstance(claim_id, str) or not claim_id:
                continue

            all_nodes.add(claim_id)
            derived_from = claim.get("derived_from", [])
            if isinstance(derived_from, list):
                deps = [dep for dep in derived_from if isinstance(dep, str)]
            else:
                deps = []
            graph[claim_id] = deps
            all_nodes.update(deps)

        visited = {node: 0 for node in all_nodes}  # 0 unvisited, 1 visiting, 2 visited
        cycle_path: list[str] = []

        def dfs(node: str, current_path: list[str]) -> bool:
            visited[node] = 1
            current_path.append(node)

            for neighbor in graph.get(node, []):
                state = visited.get(neighbor, 0)
                if state == 1:
                    start = current_path.index(neighbor)
                    cycle_path.extend(current_path[start:])
                    cycle_path.append(neighbor)
                    return True
                if state == 0 and dfs(neighbor, current_path):
                    return True

            visited[node] = 2
            current_path.pop()
            return False

        has_cycle = False
        for node in sorted(all_nodes):
            if visited[node] == 0 and dfs(node, []):
                has_cycle = True
                break

        if has_cycle:
            cycle_str = " -> ".join(cycle_path)
            violations.append(
                {
                    "code": "REFERENCE.CIRCULAR_DEPENDENCY_DETECTED",
                    "severity": "fatal",
                    "blocking": True,
                    "message": (
                        "Cyclic reference loop detected in derived_claims graph: "
                        f"{cycle_str}. Lineage must form a Directed Acyclic Graph (DAG)."
                    ),
                    "location": "derived_claims",
                }
            )

        return cls._build_result(not has_cycle, violations)

    @staticmethod
    def _build_result(passed: bool, violations: list[dict[str, Any]]) -> dict[str, Any]:
        return {
            "engine": "ReferenceEngine",
            "executed": True,
            "passed": passed,
            "execution_status": "COMPLETED" if passed else "FATAL_REJECT",
            "violationCount": len(violations),
            "violations": violations,
            "status": "COMPLETED" if passed else "HALTED",
        }
