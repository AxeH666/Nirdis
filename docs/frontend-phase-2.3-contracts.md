# Phase 2.3 — Frontend Structure & Data Contracts

**Structural. Deterministic. No visuals. No implementation.**

This document locks how the frontend thinks, not how it looks. Every page knows what data it consumes and what it never owns. No future UI decision should break backend or vice versa.

---

## Objective of Phase 2.3

- Every page knows **what data it consumes**
- Every page knows **what it never owns**
- Conversation knows **what context it silently receives**
- No future UI decision breaks backend or vice versa

Alignment only; no polish.

---

## 2.3.1 Global Frontend Principles (Locked)

### Ownership rules

- Frontend **never** calculates astrology
- Frontend **never** interprets logic
- Frontend **only** renders what backend resolves

**Astrology = backend · Reflection = backend · Tone = backend · Frontend = presentation + flow**

### Data flow rule

Every page follows:

```
Session → User → BirthProfile → Derived Data → UI
```

**Never:** UI guesses data; UI uses fake defaults (except skeleton/loading).

### Conversation rule (critical)

- Conversation is **one continuous thread**, shared across pages
- Conversation is **context-aware**, not context-announcing
- **No page** creates its own chat instance

---

## 2.3.2 Page-Level Data Contracts

### Landing

| | |
|---|---|
| **Role in one sentence** | Presents product narrative only; no user-specific data. |
| **Consumes** | Nothing user-specific. |
| **Knows** | Product narrative only. |
| **Never** | Session, User, Chat, Astrology. |

---

### Onboarding

| | |
|---|---|
| **Role in one sentence** | Collects birth data and produces BirthProfile; anonymous allowed. |
| **Consumes** | Optional session (anonymous allowed). No astrology. |
| **Produces** | BirthProfile. Once completed, never re-runs automatically; edits are always user-initiated later. |
| **Never** | Astrology, auto re-run. |

---

### Dashboard

| | |
|---|---|
| **Role in one sentence** | Orientation hub: one short insight, entry points, no content walls. |
| **Consumes** | User; light derived astrology summary (today); Conversation state (exists / last touched). |
| **Displays** | One current insight (1–2 lines max). Entry points, not content walls. |
| **Never** | Full horoscope, full chart, long text. **Dashboard = orientation, not reading.** |

---

### Chart

| | |
|---|---|
| **Role in one sentence** | Shows full natal chart and clean lists; provides chart scope to Conversation silently. |
| **Consumes** | Full natal chart (resolved backend object). |
| **Displays** | Chart visualization; clean lists (houses, planets); minimal interpretation. |
| **Provides to Conversation (silently)** | Natal placements; current chart view scope. |
| **Never** | Predictive language, urgency, popups. |

---

### Horoscope

| | |
|---|---|
| **Role in one sentence** | Shows one time-based forecast at a time; can provide period/context to Conversation. |
| **Consumes** | Time-based forecast object (daily / monthly / yearly — same route, different state). |
| **Displays** | Readable forecast; one period at a time. |
| **Provides to Conversation** | Selected period; relevant transits/dashas when applicable. |
| **Never** | Multiple periods at once; pushing into chat mid-reading. |

---

### Conversation

| | |
|---|---|
| **Role in one sentence** | Reflective thread owned by the app; consumes session, profile, and optional page context. |
| **Consumes** | Session user; BirthProfile; optional page context (from Dashboard, Chart, Horoscope). |
| **Owns** | Thread history; reflection flow. |
| **Never** | Forces replies; creates urgency; claims certainty. **Conversation is reflective, not transactional.** |

---

### Profile

| | |
|---|---|
| **Role in one sentence** | User and birth data management; no astrology interpretation. |
| **Consumes** | User; BirthProfile. |
| **Allows** | Editing birth data; managing additional profiles (later phase). |
| **Never** | Astrology interpretation. |

---

### Settings

| | |
|---|---|
| **Role in one sentence** | User preferences only; no astrology or Conversation. |
| **Consumes** | User preferences. |
| **Never** | Astrology, Conversation. |

---

## 2.3.3 Context Passing Rules

Context is **passed silently**, never announced unless useful.

| From | Passes |
|------|--------|
| **Dashboard** | Last conversation state. No astrology unless user already engaged. |
| **Chart** | Natal placements; focused house/planet (if clicked). |
| **Horoscope** | Period (today/month/year); last read section. |

**Rules:**

- No “I see you were looking at…”
- No surveillance tone
- Context only used to improve relevance

---

## 2.3.4 Loading, Empty, and Silence States

| State | Rule |
|-------|------|
| **Loading** | Soft shimmer / fade. No spinners screaming “wait”. |
| **Empty** | Calm copy. No guilt (“You haven’t asked anything yet” ❌). |
| **Silence** | No auto-prompts; no “anything else?”. User controls pacing. |

---

## 2.3.5 What Phase 2.3 Explicitly Does NOT Do

- ❌ No folder creation
- ❌ No component naming
- ❌ No CSS
- ❌ No animations
- ❌ No prompt text yet
- ❌ No chat behavior tuning

Those come after structure is locked.

---

## Exit Criteria for Phase 2.3

We move on only if all are true:

1. You can explain each page’s role in one sentence
2. You know what data each page consumes
3. No page feels overloaded
4. Conversation is clearly primary but never intrusive
