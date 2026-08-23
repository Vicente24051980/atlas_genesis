from __future__ import annotations

import pytest
from fastapi import HTTPException
from pydantic import ValidationError

from api.firecrawl_ingestion import (
    AgentRequest,
    CrawlRequest,
    ExtractRequest,
    ScrapeRequest,
    _change_tracking_format,
    _validate_job_id,
)


def test_basic_change_tracking_without_tag_uses_simple_format() -> None:
    assert _change_tracking_format("basic", None) == "changeTracking"


def test_basic_change_tracking_tag_is_nested_in_format_object() -> None:
    assert _change_tracking_format("basic", None, "hourly") == {
        "type": "changeTracking",
        "tag": "hourly",
    }


def test_git_diff_change_tracking_keeps_mode_and_tag() -> None:
    assert _change_tracking_format("git-diff", None, "ir-guidance") == {
        "type": "changeTracking",
        "modes": ["git-diff"],
        "tag": "ir-guidance",
    }


def test_json_change_tracking_keeps_schema_and_tag() -> None:
    schema = {
        "type": "object",
        "properties": {"revenue": {"type": "number"}},
    }
    assert _change_tracking_format("json", schema, "earnings") == {
        "type": "changeTracking",
        "modes": ["json"],
        "schema": schema,
        "tag": "earnings",
    }


def test_change_tracking_tag_without_mode_fails_closed() -> None:
    with pytest.raises(ValidationError):
        ScrapeRequest(url="https://example.com", tag="orphan-tag")


def test_json_change_tracking_requires_schema() -> None:
    with pytest.raises(ValidationError):
        CrawlRequest(url="https://example.com", change_tracking_mode="json")


def test_crawl_cost_guard_rejects_more_than_250_pages() -> None:
    with pytest.raises(ValidationError):
        CrawlRequest(url="https://example.com", limit=251)


def test_extract_requires_prompt_or_schema() -> None:
    with pytest.raises(ValidationError):
        ExtractRequest(urls=["https://example.com"])


def test_agent_credit_guard_rejects_more_than_100_credits() -> None:
    with pytest.raises(ValidationError):
        AgentRequest(prompt="research", max_credits=101)


def test_job_id_validation_rejects_path_injection() -> None:
    with pytest.raises(HTTPException):
        _validate_job_id("../../crawl")


def test_job_id_validation_accepts_provider_style_id() -> None:
    assert _validate_job_id("fc-job_123456") == "fc-job_123456"
