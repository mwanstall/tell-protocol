# TELL Protocol Specification

**Version:** 0.2 (Pre-publication draft)
**Status:** Internal — validation in progress
**Date:** March 2026

---

## Abstract

TELL is an open protocol for encoding strategic intent in a machine-readable format. It defines a standard data model for representing an organisation's strategic portfolio — its bets, assumptions, evidence, connections between bets, scenarios, and contributors — in a way that any system can read from and write to.

The name comes from poker: a tell is the involuntary signal that reveals the truth behind the bluff. Every strategy has tells — evidence signals that reveal whether the thesis is actually holding. The protocol reads the tells.

TELL sits at a layer that does not currently exist in the technology stack. MCP defines how AI agents interface with tools. OAuth defines how systems authenticate. OpenAPI defines how services describe their APIs. TELL defines how agents, platforms, and humans interface with strategic intent.

The protocol is designed for a world where AI agents execute across organisations at machine speed and need a source of strategic truth to execute against. TELL provides that source of truth.

---

## 1. Design Principles

### 1.1 Strategy as Bets Under Uncertainty

The protocol embodies a specific ontological position: **strategy is a portfolio of falsifiable hypotheses, not a plan to execute.** This is a deliberate design choice. Every strategic commitment is modelled as a bet — a hypothesis about the future that the organisation is investing resources to test. The protocol does not attempt to accommodate every strategic framework. Systems that use OKRs, balanced scorecards, or other frameworks can map to TELL, but the protocol's native structure is bets, assumptions, and evidence.

### 1.2 Minimal Core, Extensible Surface

The core schema defines seven entities: Portfolio, Bet, Assumption, Evidence, Connection, Scenario, and Contributor. These are the minimum viable representation of strategic intent. Everything else — metadata, custom fields, scoring models, visualisation hints, resource tracking — is handled through a typed extension mechanism.

### 1.3 Evidence is Append-Only

Evidence records are never modified or deleted once written. New evidence supersedes old evidence by accumulation. A retraction is itself a new evidence record that references the original. This creates a complete, auditable history of every signal that informed every strategic decision.

### 1.4 Read-Optimised, Write-Append

Agents and human interfaces read strategic intent frequently ("what should I optimise for?") and write evidence less frequently ("here's what I observed"). The schema is optimised for fast reads of the current portfolio state. Writes are append operations that do not modify existing records.

### 1.5 Source-Agnostic Evidence

The protocol does not distinguish between human-submitted, AI-curated, and agent-generated evidence at a structural level. A Contributor can be a human or an agent. A signal is a signal regardless of source. This means the protocol supports the full spectrum from fully manual to fully automated evidence generation without schema changes.

### 1.6 Derived Status, Recorded Overrides

Assumption status and bet confidence are derivable from accumulated evidence. The protocol supports both computed and manually overridden values, with overrides recorded as audit events. Platforms implement their own scoring models while maintaining a portable, auditable record.

### 1.7 Graph Structure

The model is a directed graph, not a hierarchy. Assumptions can underpin multiple bets. Evidence can inform multiple assumptions. Bets relate to other bets through connections. This graph structure is what makes portfolio-level risk analysis possible — when a shared assumption fails, every bet that depends on it is affected.

---

## 2. Core Schema

### 2.1 Portfolio

The top-level container. Represents an organisation's complete strategic model.

```json
{
  "tell_version": "0.3",
  "portfolio": {
    "id": "string (required)",
    "name": "string (required)",
    "organisation": "string (required)",
    "description": "string (optional)",
    "version": "integer (required, auto-incremented on structural changes)",
    "created_at": "ISO 8601 (required)",
    "updated_at": "ISO 8601 (required)",
    "bets": "Bet[] (required)",
    "connections": "Connection[] (required, may be empty)",
    "contributors": "Contributor[] (required, min 1)",
    "scenarios": "Scenario[] (optional)",
    "extensions": "object (optional)"
  }
}
```

**Versioning:** The portfolio `version` field increments with every structural change. Structural changes include adding/removing/modifying bets, adding/removing assumptions, changing bet status, and adding/removing connections. Evidence writes do NOT increment the portfolio version (they are append operations on existing assumptions).

**Example:**

```json
{
  "tell_version": "0.3",
  "portfolio": {
    "id": "pf_chilli_finance_2026",
    "name": "Chilli Finance Strategic Portfolio",
    "organisation": "Chilli Finance",
    "description": "Strategic bets for market expansion and product differentiation",
    "version": 14,
    "created_at": "2026-03-15T09:00:00Z",
    "updated_at": "2026-06-22T14:30:00Z",
    "bets": [],
    "connections": [],
    "contributors": [],
    "scenarios": [],
    "extensions": {}
  }
}
```

---

### 2.2 Bet

The fundamental unit of strategic intent. A falsifiable hypothesis that the organisation is investing resources to test.

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `id` | string | Yes | Unique identifier. Recommended format: `bet_{slug}` |
| `thesis` | string | Yes | A falsifiable statement. Should include the investment, expected outcome, timeframe, and reasoning. |
| `status` | enum | Yes | `active` \| `paused` \| `killed` \| `succeeded` |
| `confidence` | integer (0-100) | No | Current confidence level. Derived from evidence weight or manually set. |
| `confidence_source` | enum | No | `computed` \| `manual` \| `override` |
| `time_horizon` | object | No | `{ "start": "ISO 8601", "target": "ISO 8601" }` |
| `owner` | string | No | Contributor ID of the bet owner. |
| `resource_allocations` | ResourceAllocation[] | No | Resources committed to this bet. |
| `assumptions` | Assumption[] | Yes | The assumptions that must hold for the thesis to be valid. Minimum 1. |
| `tags` | string[] | No | Freeform categorisation. |
| `created_at` | ISO 8601 | Yes | |
| `updated_at` | ISO 8601 | Yes | |
| `extensions` | object | No | Typed extension fields. |

**Bet Status Lifecycle:**

```
active ──→ paused ──→ active (resumption)
  │           │
  │           └──→ killed
  │
  ├──→ succeeded
  └──→ killed
```

- `active`: The organisation is investing in this bet. Evidence is actively monitored.
- `paused`: Investment halted temporarily. Evidence still accumulated but not actively sought.
- `killed`: The thesis has been falsified or the bet has been abandoned. Terminal state (but can be reopened via a new bet referencing this one).
- `succeeded`: The thesis has been validated within the time horizon. Terminal state.

**Thesis Requirements:**

A well-formed thesis MUST be falsifiable. It SHOULD include:
1. What the organisation is doing (the investment/action)
2. What outcome is expected (the hypothesis)
3. By when (the time horizon)
4. Why this should work (the reasoning)

**Example thesis:** *"Shifting mortgage origination toward prime full-doc lending captures market share from retreating major banks, driving 50%+ origination growth within 24 months while maintaining group NIM above 2.0%."*

This is falsifiable because it specifies a measurable outcome (50%+ growth, NIM above 2.0%) within a timeframe (24 months).

---

### 2.3 Assumption

A condition that must be true for a bet's thesis to hold. The most structurally important entity in the protocol because it is where evidence connects to strategy.

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `id` | string | Yes | Unique identifier. Format: `asm_{slug}` |
| `statement` | string | Yes | A clear, testable condition. Should be evaluable as true/false. |
| `status` | enum | Yes | `holding` \| `pressure` \| `failing` \| `unknown` |
| `status_source` | enum | No | `computed` \| `manual` \| `override` |
| `evidence_threshold` | string | No | What evidence would confirm or kill this assumption. |
| `bet_ids` | string[] | Yes | The bet(s) this assumption underpins. Supports many-to-many. |
| `owner` | string | No | Contributor ID responsible for monitoring. |
| `last_signal_at` | ISO 8601 | No | Timestamp of most recent evidence. Used for staleness detection. |
| `evidence` | Evidence[] | Yes | Accumulated evidence records. Append-only. May be empty. |
| `created_at` | ISO 8601 | Yes | |
| `extensions` | object | No | |

**Assumption Status Derivation:**

| Status | Meaning | Evidence Pattern |
|--------|---------|-----------------|
| `holding` | Evidence supports this assumption. | Predominantly supporting signals, high confidence. |
| `pressure` | Mixed evidence. Assumption may be breaking. | Conflicting signals or recent weakening evidence. |
| `failing` | Evidence contradicts this assumption. | Predominantly weakening signals, high confidence. |
| `unknown` | Insufficient evidence to determine status. | No evidence, or only low-confidence signals. |

**The Many-to-Many Relationship:**

The relationship between assumptions and bets is many-to-many. A single assumption (e.g., "swap rates remain favourable") can underpin multiple bets simultaneously. This is where portfolio-level risk becomes visible — if a shared assumption fails, multiple bets collapse. Implementations MUST support this relationship.

**Staleness:**

An assumption is considered "stale" when its `last_signal_at` exceeds a platform-configurable threshold. The recommended default is 14 days. Stale assumptions represent a specific risk: the organisation is operating on assumptions that nobody is monitoring.

---

### 2.4 Evidence

A discrete signal that informs whether an assumption is holding or breaking. **Immutable once written.** The atomic unit of strategic learning.

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `id` | string | Yes | Unique identifier. Format: `ev_{uuid}` |
| `assumption_ids` | string[] | Yes | The assumption(s) this evidence relates to. |
| `source_type` | enum | Yes | `human` \| `ai_curated` \| `agent` |
| `contributor_id` | string | Yes | Who or what submitted this evidence. |
| `signal` | enum | Yes | `supports` \| `weakens` \| `neutral` |
| `confidence` | enum | No | `high` \| `medium` \| `low` — reliability assessment. |
| `summary` | string | Yes | Natural language narrative. Human-readable. |
| `data_ref` | string (URI) | No | Reference to underlying data source. |
| `timestamp` | ISO 8601 | Yes | When the signal was observed (not recorded). |
| `recorded_at` | ISO 8601 | Yes | When the evidence was written to the model. |
| `supersedes` | string | No | Evidence ID this record supersedes (for corrections/retractions). |
| `is_retracted` | boolean | No | Whether this evidence has been retracted by a subsequent record. Default: false. |
| `extensions` | object | No | |

**Immutability Rule:**

Evidence records MUST NOT be modified after creation. Corrections are achieved by writing new evidence that references the original via `supersedes`. Retractions are new evidence records with `signal: neutral` that reference the retracted record and set `is_retracted: true` on the original. This preserves the complete audit trail.

**Evidence Weighting (Recommended Algorithm):**

Platforms MAY implement their own scoring models. The recommended algorithm:

1. **Signal weight:** `supports` = +1, `weakens` = -1, `neutral` = 0
2. **Confidence multiplier:** `high` = 1.0, `medium` = 0.6, `low` = 0.3
3. **Recency decay:** evidence older than 30 days = 0.5x, older than 90 days = 0.25x
4. **Per-assumption score:** `clamp(50 + (sum_of_weighted_contributions * 10), 0, 100)`
5. **Bet confidence:** Average of all assumption blended scores, rounded to integer. Default 50 if no assumptions have evidence.

This algorithm is RECOMMENDED, not REQUIRED. The protocol is scoring-model agnostic. What matters is that the evidence is portable and the scoring is transparent.

---

### 2.5 Connection

A relationship between two bets. What makes the portfolio a system rather than a list.

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `id` | string | Yes | Unique identifier. |
| `type` | enum | Yes | `tension` \| `synergy` \| `dependency` \| `resource_conflict` |
| `bet_ids` | string[] (exactly 2) | Yes | The two bets in this relationship. |
| `description` | string | Yes | Natural language description of the relationship. |
| `severity` | enum | No | `critical` \| `moderate` \| `low` |
| `status` | enum | No | `active` \| `monitoring` \| `resolved` \| `escalated` |
| `identified_by` | enum | No | `human` \| `ai` |
| `created_at` | ISO 8601 | Yes | |
| `updated_at` | ISO 8601 | No | |
| `extensions` | object | No | |

**Connection Types:**

| Type | Meaning |
|------|---------|
| `tension` | The bets pull in opposite directions. Success of one may undermine the other. |
| `synergy` | The bets reinforce each other. Evidence for one strengthens the other. |
| `dependency` | One bet depends on the other. If the dependency fails, the dependent bet is at risk. |
| `resource_conflict` | Both bets compete for the same resource pool (budget, headcount, time). |

**Connection Lifecycle:**

```
active ──→ monitoring ──→ resolved
  │            │
  │            └──→ escalated ──→ resolved
  │
  └──→ escalated ──→ resolved
```

- `active`: The connection is current and relevant.
- `monitoring`: The connection has been acknowledged and is being watched.
- `resolved`: The tension/conflict has been addressed or is no longer relevant.
- `escalated`: The connection requires urgent attention (e.g., resource conflict is blocking progress).

---

### 2.6 Scenario

A hypothetical portfolio modification. The "branch" in the Git analogy. Scenarios capture proposed changes and their projected implications without modifying the live portfolio.

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `id` | string | Yes | Unique identifier. |
| `name` | string | Yes | Short descriptive name. |
| `description` | string | Yes | Natural language description of the scenario. |
| `status` | enum | Yes | `draft` \| `explored` \| `enacted` \| `rejected` |
| `modifications` | ScenarioBet[] | Yes | Proposed changes to bets within the scenario. |
| `implications` | string | No | AI-generated or human-written analysis of cascading effects. |
| `created_by` | string | Yes | Contributor ID. |
| `created_at` | ISO 8601 | Yes | |
| `updated_at` | ISO 8601 | No | |
| `extensions` | object | No | |

**ScenarioBet:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `bet_id` | string | Yes | The bet being modified in this scenario. |
| `inclusion` | enum | Yes | `included` \| `excluded` \| `modified` |
| `confidence_override` | integer (0-100) | No | Projected confidence under this scenario. |
| `status_override` | string | No | Projected status under this scenario. |
| `notes` | string | No | Reasoning for this modification. |

**Scenario Lifecycle:**

- `draft`: Scenario is being constructed. Not yet analysed.
- `explored`: Scenario has been analysed (implications generated, cascading effects identified). Can be compared against current portfolio state.
- `enacted`: Scenario modifications have been applied to the live portfolio. The portfolio version increments.
- `rejected`: Scenario was explored and rejected. Preserved for audit trail.

Enacting a scenario is a structural change. It increments the portfolio version and creates an audit event.

---

### 2.7 Contributor

An entity that reads from or writes to the model. The protocol deliberately does not distinguish between humans and agents at the structural level.

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `id` | string | Yes | Unique identifier. |
| `type` | enum | Yes | `human` \| `agent` |
| `name` | string | Yes | Display name (human) or agent identifier. |
| `role` | string | No | Organisational role or functional scope. |
| `permissions` | object | No | Read/write access per entity. Platform-specific. |
| `last_active_at` | ISO 8601 | No | Most recent interaction with the model. |
| `created_at` | ISO 8601 | Yes | |
| `extensions` | object | No | |

**Human vs. Agent Contributors:**

The protocol treats both identically at the data level. Evidence submitted by an agent has the same structure as evidence submitted by a human. The `source_type` field on Evidence records the origin, but the model treats both as valid signals. This is a deliberate design choice: in an AI-native organisation, the distinction between human and agent evidence should not require schema changes.

---

### 2.8 Resource Allocation

Resources committed to a bet. Tracked separately from the bet itself to support multiple resource types per bet and portfolio-level aggregation.

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `id` | string | Yes | Unique identifier. |
| `bet_id` | string | Yes | The bet this resource is allocated to. |
| `resource_type` | enum | Yes | `budget` \| `headcount` \| `time` \| `other` |
| `label` | string | Yes | Human-readable description. |
| `amount` | number | Yes | Quantity. |
| `unit` | string | Yes | Unit of measurement (e.g., "AUD", "FTE", "hours"). |
| `period` | enum | No | `one_time` \| `monthly` \| `quarterly` \| `annual` |
| `notes` | string | No | |
| `created_at` | ISO 8601 | Yes | |
| `updated_at` | ISO 8601 | No | |

Resource allocations enable portfolio-level investment analysis: total budget across all active bets, headcount concentration, and detection of resource conflicts between connected bets.

---

### 2.9 Audit Event

An append-only record of every structural change to the model. Provides governance-grade traceability.

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `id` | string | Yes | Unique identifier. |
| `portfolio_id` | string | Yes | |
| `entity_type` | enum | Yes | `bet` \| `assumption` \| `connection` \| `evidence` \| `scenario` \| `portfolio` |
| `entity_id` | string | Yes | |
| `action` | enum | Yes | `status_change` \| `confidence_override` \| `retraction` \| `creation` \| `deletion` \| `modification` |
| `previous_value` | string | No | |
| `new_value` | string | No | |
| `performed_by` | string | No | Contributor ID. |
| `metadata` | object | No | Additional context. |
| `created_at` | ISO 8601 | Yes | |

Audit events are append-only. They are never modified or deleted. They provide a complete reconstruction of how the portfolio evolved over time — the "git log" for strategy.

---

## 3. Entity Relationship Graph

```
Portfolio
  ├── contains ──→ Bet[] (1:many)
  ├── contains ──→ Connection[] (1:many)
  ├── contains ──→ Contributor[] (1:many)
  ├── contains ──→ Scenario[] (1:many)
  └── contains ──→ AuditEvent[] (1:many, append-only)

Bet
  ├── contains ──→ Assumption[] (1:many, min 1)
  ├── has ──→ ResourceAllocation[] (1:many)
  ├── owned_by ──→ Contributor (many:1)
  └── relates_to ──→ Bet (many:many via Connection)

Assumption
  ├── belongs_to ──→ Bet[] (many:many)  ← CRITICAL RELATIONSHIP
  ├── accumulates ──→ Evidence[] (1:many, append-only)
  └── owned_by ──→ Contributor (many:1)

Evidence
  ├── informs ──→ Assumption[] (many:many)
  ├── submitted_by ──→ Contributor (many:1)
  └── supersedes ──→ Evidence (1:1, optional)

Connection
  ├── relates ──→ Bet, Bet (exactly 2)
  └── identified_by ──→ Contributor (many:1, optional)

Scenario
  ├── modifies ──→ Bet[] (via ScenarioBet)
  └── created_by ──→ Contributor (many:1)
```

**The Critical Relationship:** The many-to-many between Assumptions and Bets is the most structurally important feature. It enables portfolio-level risk analysis: when a shared assumption fails, every dependent bet is affected. This cross-bet visibility is what makes the protocol useful for portfolio management, not just individual bet tracking.

---

## 4. Extension Mechanism

Every entity has an optional `extensions` object. Extensions are typed and namespaced to avoid collisions:

```json
{
  "extensions": {
    "apophenic.ai_evaluation": {
      "last_evaluated_at": "2026-06-22T14:00:00Z",
      "ai_confidence": 68,
      "ai_narrative": "Evidence weight has shifted...",
      "evaluation_model": "claude-sonnet-4-20250514"
    },
    "client_custom.priority_tier": "P1",
    "client_custom.business_unit": "Mortgages"
  }
}
```

**Reserved namespaces:**
- `tell.*` — Reserved for future protocol extensions
- `apophenic.*` — Apophenic platform-specific extensions
- `client_custom.*` — Client-specific custom fields

Implementations MUST preserve unrecognised extension namespaces when reading and writing models. This ensures interoperability — a model can carry extensions from multiple platforms without loss.

---

## 5. API Surface

### 5.1 Read Operations

| Operation | Description | Primary Consumer |
|-----------|-------------|------------------|
| `GET /portfolio` | Current portfolio state: all bets, assumptions (latest status), connections, contributors. | Human interfaces, dashboards, governance. |
| `GET /portfolio/version/{n}` | Portfolio state at a specific version. | Audit, diff, historical analysis. |
| `GET /portfolio/diff/{a}/{b}` | Changes between two portfolio versions. | "Git diff" for strategy. |
| `GET /bets/{id}` | Single bet with assumptions and recent evidence. | Focused review, agent queries. |
| `GET /assumptions/{id}/evidence` | Evidence stream for a specific assumption. Ordered by timestamp. | Evidence audit, trend analysis. |
| `GET /portfolio/stale?threshold={days}` | Assumptions with no recent evidence within threshold. | Staleness detection, alerting. |
| `GET /portfolio/risk` | Shared assumptions, resource conflicts, escalated connections. | Portfolio risk assessment. |

### 5.2 Write Operations

| Operation | Description | Primary Consumer |
|-----------|-------------|------------------|
| `POST /evidence` | Append evidence to one or more assumptions. | Agents, human interfaces, AI curation. |
| `POST /bets` | Add a new bet. Increments portfolio version. | Human interfaces, structuring sessions. |
| `PATCH /bets/{id}` | Modify a bet. Increments portfolio version. | Human interfaces. |
| `POST /connections` | Add a connection between two bets. | Human interfaces, AI detection. |
| `PATCH /connections/{id}` | Update connection status. | Human interfaces. |
| `POST /scenarios` | Create a new scenario. | Human interfaces, AI reasoning. |
| `POST /scenarios/{id}/enact` | Apply scenario to the live portfolio. | Human interfaces (with confirmation). |

### 5.3 Event Stream

A real-time stream (WebSocket or SSE) of model changes:

```json
{
  "event_type": "evidence_added",
  "entity_id": "ev_a3f8c2d1",
  "assumption_id": "asm_origination_growth",
  "bet_id": "bet_prime_lending_pivot",
  "timestamp": "2026-06-22T14:30:00Z",
  "summary": "New evidence: supports (high confidence)"
}
```

Event types: `evidence_added`, `status_changed`, `connection_added`, `connection_escalated`, `scenario_enacted`, `bet_created`, `bet_killed`.

### 5.4 MCP Integration

TELL operations are exposed as MCP tools, enabling any MCP-compatible agent framework to interface with strategic intent:

```json
{
  "tools": [
    {
      "name": "tell_read_portfolio",
      "description": "Read the current strategic portfolio — all active bets, their assumptions, confidence levels, and connections."
    },
    {
      "name": "tell_read_assumption",
      "description": "Read a specific assumption and its evidence history."
    },
    {
      "name": "tell_write_evidence",
      "description": "Submit evidence against one or more assumptions. Requires: assumption_id(s), signal (supports/weakens/neutral), summary, confidence level."
    },
    {
      "name": "tell_read_stale",
      "description": "Find assumptions that lack recent evidence, indicating potential blind spots."
    },
    {
      "name": "tell_read_risk",
      "description": "Read portfolio-level risk: shared assumptions, resource conflicts, escalated connections."
    }
  ]
}
```

**The key insight:** MCP is how agents talk to tools. TELL is how agents talk to strategy. An agent with MCP can do things. An agent with both MCP and TELL can do the right things.

---

## 6. Versioning and Diffing

### 6.1 Portfolio Versioning

Every structural change increments the portfolio version. This creates a timeline of the portfolio's evolution:

```
Version 1:  Portfolio created. 3 bets, 12 assumptions.
Version 2:  Bet added: "AI Platform Investment"
Version 3:  Connection added: tension between Bet A and Bet B
Version 4:  Bet killed: "Legacy System Migration"
...
Version 14: Scenario enacted: "Without Legacy Investment"
```

### 6.2 Evidence is Not Versioned

Evidence writes are append operations. They do not increment the portfolio version because they don't change the portfolio's structure — they add signal to existing assumptions. This distinction is important: a portfolio at version 14 with 50 evidence records and one with 500 evidence records have the same structure but different intelligence.

### 6.3 Diffing

A diff between two versions shows structural changes:

```json
{
  "from_version": 12,
  "to_version": 14,
  "changes": [
    {
      "type": "bet_status_changed",
      "bet_id": "bet_legacy_migration",
      "from": "active",
      "to": "killed",
      "version": 13,
      "performed_by": "contributor_ceo"
    },
    {
      "type": "scenario_enacted",
      "scenario_id": "sc_without_legacy",
      "version": 14,
      "performed_by": "contributor_cso"
    }
  ]
}
```

This is the "git diff" for strategy. It answers: "What changed? When? Who decided?"

---

## 7. Conformance Levels

Implementations of TELL can conform at three levels:

### Level 1: Reader

The implementation can read a TELL model. It understands the schema, can parse all entity types, and preserves extensions it does not recognise.

**Requirements:**
- Parse all seven core entities
- Preserve unrecognised extensions on round-trip
- Handle the many-to-many assumption-bet relationship

**Use case:** BI tools, reporting systems, governance dashboards.

### Level 2: Writer

The implementation can read and write to a TELL model. It can submit evidence, create bets, and modify status.

**Requirements:**
- All Level 1 requirements
- Append evidence records (immutability preserved)
- Increment portfolio version on structural changes
- Record audit events for all writes

**Use case:** Agent frameworks, AI curation systems, collaboration platforms.

### Level 3: Platform

The implementation provides the full TELL experience: read, write, real-time events, versioning, scenario reasoning, and scoring.

**Requirements:**
- All Level 2 requirements
- Real-time event stream
- Portfolio versioning and diffing
- Scenario creation and enactment
- Evidence-weighted confidence scoring (algorithm may vary)

**Use case:** Strategic intelligence platforms. Apophenic is the canonical Level 3 implementation.

---

## 8. Security and Governance

### 8.1 Access Control

The protocol defines a permission model at the entity level:

- **Portfolio-level:** Read access to the entire portfolio, or write access.
- **Bet-level:** Read/write access to specific bets and their assumptions.
- **Evidence-level:** Write access to submit evidence (typically broad — the more sources, the better).

Implementations SHOULD enforce least-privilege: agents should be able to read the portfolio and write evidence to their relevant assumptions, but not modify bet status or enact scenarios.

### 8.2 Audit Trail

Every structural change and every evidence submission creates an audit event. The audit trail MUST be:
- **Complete:** Every change is recorded.
- **Immutable:** Audit events are never modified or deleted.
- **Attributable:** Every event identifies the contributor.

This satisfies governance requirements for board-level strategic audit.

### 8.3 Evidence Provenance

Every evidence record carries provenance information:
- `source_type`: human, ai_curated, or agent
- `contributor_id`: who submitted it
- `data_ref`: URI to the source data
- `confidence`: reliability assessment

This enables trust assessment: a board can evaluate not just what the evidence says, but where it came from and how reliable it is.

---

## 9. Implementation Guidance

### 9.1 Storage

The protocol is storage-agnostic. A TELL model can be stored as:
- A single JSON document (suitable for small portfolios, file-based storage)
- A relational database (PostgreSQL recommended for medium-scale)
- A graph database (for large portfolios with complex connection analysis)

For the "narrow model" (4-20 bets, 50-200 assumptions, thousands of evidence records), a relational database with JSONB columns handles the schema efficiently.

### 9.2 Real-time

The real-time event stream can be implemented via:
- WebSocket connections
- Server-Sent Events (SSE)
- Database change notifications (e.g., Supabase Realtime via Postgres)

The protocol defines the event format; the transport mechanism is implementation-specific.

### 9.3 Serialisation

The canonical serialisation format is JSON. The file extension for TELL documents is `.tell.json`.

A complete portfolio export:

```json
{
  "tell_version": "0.3",
  "exported_at": "2026-06-22T15:00:00Z",
  "portfolio": {
    "id": "pf_example",
    "name": "Example Portfolio",
    "organisation": "Example Corp",
    "version": 7,
    "created_at": "2026-01-15T09:00:00Z",
    "updated_at": "2026-06-22T14:30:00Z",
    "bets": [
      {
        "id": "bet_ai_platform",
        "thesis": "Deploying an enterprise AI platform will reduce operational costs by 30% within 18 months by automating high-volume, low-complexity processes across three divisions.",
        "status": "active",
        "confidence": 62,
        "confidence_source": "computed",
        "time_horizon": {
          "start": "2026-01-01",
          "target": "2027-06-30"
        },
        "owner": "contributor_cto",
        "assumptions": [
          {
            "id": "asm_adoption_rate",
            "statement": "Staff adoption exceeds 70% within 6 months of deployment in each division.",
            "status": "pressure",
            "status_source": "computed",
            "bet_ids": ["bet_ai_platform"],
            "last_signal_at": "2026-06-15T10:00:00Z",
            "evidence": [
              {
                "id": "ev_001",
                "assumption_ids": ["asm_adoption_rate"],
                "source_type": "agent",
                "contributor_id": "agent_usage_monitor",
                "signal": "weakens",
                "confidence": "high",
                "summary": "Division 1 adoption at 45% after 4 months. Below trajectory for 70% target.",
                "data_ref": "internal://dashboards/ai-adoption",
                "timestamp": "2026-06-15T10:00:00Z",
                "recorded_at": "2026-06-15T10:02:00Z"
              }
            ]
          }
        ],
        "resource_allocations": [
          {
            "id": "ra_001",
            "bet_id": "bet_ai_platform",
            "resource_type": "budget",
            "label": "Platform licensing and implementation",
            "amount": 2400000,
            "unit": "AUD",
            "period": "annual"
          }
        ],
        "tags": ["technology", "efficiency", "AI"],
        "created_at": "2026-01-15T09:00:00Z",
        "updated_at": "2026-06-22T14:30:00Z"
      }
    ],
    "connections": [],
    "contributors": [
      {
        "id": "contributor_cto",
        "type": "human",
        "name": "Jane Smith",
        "role": "Chief Technology Officer",
        "created_at": "2026-01-15T09:00:00Z"
      },
      {
        "id": "agent_usage_monitor",
        "type": "agent",
        "name": "AI Usage Monitor",
        "role": "Tracks platform adoption metrics across divisions",
        "created_at": "2026-03-01T09:00:00Z"
      }
    ],
    "scenarios": [],
    "extensions": {}
  }
}
```

---

## 10. Path to v1.0

| Stage | Timeline | Status |
|-------|----------|--------|
| v0.1 — Conceptual model | March 2026 | Complete |
| v0.2 — Expanded spec with full entity definitions | March 2026 | This document |
| v0.3 — JSON Schema definitions | After 2-3 client deployments | Pending |
| v0.4 — Schema refinement from deployment feedback | Months 6-9 | Pending |
| v1.0 — Formal specification (RFC-style, MUST/SHOULD/MAY) | Months 9-12 | Pending |
| Community feedback + implementor iteration | Month 12+ | Pending |
| Open standard with governance model | Month 12-18 | Pending |

The critical principle: **validate before you publish.** A protocol that does not work in practice damages authority more than not having a protocol at all. Build on it first. Prove it works. Then give it to the world.

---

## Appendix A: Glossary

| Term | Definition |
|------|------------|
| **Bet** | A falsifiable hypothesis about the future that the organisation is investing resources to test. |
| **Assumption** | A condition that must be true for a bet's thesis to hold. The point of testability. |
| **Evidence** | A discrete signal that informs whether an assumption is holding or breaking. Immutable. |
| **Connection** | A relationship between two bets: tension, synergy, dependency, or resource conflict. |
| **Scenario** | A hypothetical portfolio modification with projected implications. |
| **Contributor** | A human or agent that reads from or writes to the model. |
| **Portfolio** | The complete strategic model. The source of truth. |
| **Thesis** | The falsifiable statement at the heart of every bet. |
| **Staleness** | An assumption that has not received evidence within the configured threshold. |
| **Structural change** | Any modification that changes what bets exist, what they contain, or how they relate. Increments portfolio version. |

## Appendix B: Relationship to Existing Standards

| Standard | Relationship |
|----------|-------------|
| **MCP** (Model Context Protocol) | Complementary. MCP defines how agents interface with tools. TELL defines how agents interface with strategy. TELL operations are exposed as MCP tools. |
| **OpenAPI** | TELL APIs can be described using OpenAPI. The TELL spec defines semantics; OpenAPI describes the HTTP surface. |
| **JSON Schema** | TELL entities will be formally defined as JSON Schema (v0.3). |
| **OAuth 2.0** | TELL implementations use standard auth. The spec does not define its own auth mechanism. |
| **ActivityPub / AT Protocol** | Potential future integration for federated strategic models across organisations. Not in scope for v1.0. |
