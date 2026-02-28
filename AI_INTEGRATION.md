# CTrack Mobile — AI Integration Guide

## Overview

This document outlines AI feature integration possibilities for CTrack, from low-effort quick wins to more advanced capabilities. All AI calls should go through the backend (ctrack_v0) to keep API keys secure.

---

## Phase 1 — Quick Wins (Low Effort)

### 1.1 Copy Yesterday
**What:** One-tap copy previous day's timesheet entries to today.
**Implementation:** Client-only; duplicate time_logs with new work_date. No AI.
**Status:** Ready to implement.

### 1.2 Smart Task Summary
**What:** "You logged 4.5h on SH_220 this week" on shot detail.
**Implementation:** Aggregate time_logs by shot_id for current week. No AI.
**Status:** Ready to implement.

### 1.3 Chat Quick Replies (Rule-based)
**What:** Suggest "On it", "Done", "ETA 30min" based on context.
**Implementation:** Rule-based keyword detection; tap to insert.
**Status:** Ready to implement.

---

## Phase 2 — API Integration (Medium)

### 2.1 Timesheet Autofill from Notes
**Endpoint:** `POST /api/v1/mobile/ai/suggest-timesheet` — parse notes → project/shot/task suggestion.

### 2.2 Leave Impact Preview
**Endpoint:** `GET /api/v1/mobile/ai/leave-impact` — overlap check (can be DB-only).

### 2.3 Chat Thread Summary
**Endpoint:** `POST /api/v1/mobile/ai/chat-summary` — LLM summarizes thread.

---

## Phase 3 — Advanced

- Voice-to-timesheet
- Natural language queries
- Anomaly detection

---

**Next steps:** Implement Phase 1 (no API keys). Add Phase 2 when OpenAI/Anthropic key available.
