#!/usr/bin/env python3
import build_pre_consensus_pit_dataset as pit

# CI smoke certifies the mandatory financial PIT core only.
# Attention is optional evidence and is validated separately; a Wikimedia 429 must never
# turn into a false zero-attention observation or block fundamentals+price certification.
pit.pageviews_history = lambda title, first_snap, last_snap: {'rows': [], 'source': 'SKIPPED_IN_CORE_SMOKE'}
pit.main()
