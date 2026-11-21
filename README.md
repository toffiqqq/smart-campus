# Smart Campus Room Availability Checker

A client-side prototype for checking whether a single campus room is free for a
requested time slot. It shows availability only — it does **not** create,
confirm, or store bookings.

## Project overview and scope

- **One room**: "Room LIB-204 · Library Wing", hardcoded in the UI. There is no
  room list or selector.
- **Fictional fixture data**: existing bookings and the current time come from
  `src/lib/fixtures.ts` (one booking, 10:00–11:00; a fixed "now" of 09:00).
- **No login**: no authentication, sessions, or user state anywhere in the app.
- **No database**: all computation is client-side React state;
  `checkAvailability` is a pure function over its inputs. Nothing is fetched or
  persisted.
- **Check only**: the header, result card, and footer all state that no booking
  is created or confirmed.

## Tech stack and project structure

Built with Vite, React 18, TypeScript, Tailwind CSS, and Vitest. Deployed as a
static SPA (`dist/_redirects` provides the SPA fallback rule).

```
AGENTS.md                     Agent/engineering guidelines and constraints
src/
  App.tsx                     Main UI: room card, form, result card, timeline
  main.tsx                    Entry point
  lib/
    availability.ts           Core logic: checkAvailability and time helpers
    availability.test.ts      Unit tests for the availability rules (AC1–AC5)
    formState.ts              Derived form state and validation helpers
    formState.test.ts         Unit tests for form state helpers
    fixtures.ts               Hardcoded fictional bookings and current time
  components/
    Timeline.tsx              Day timeline with bookings, candidate slot, now marker
    TimeField.tsx             HH:MM text input with inline errors
    FieldError.tsx            Inline error message
    LegendDot.tsx             Timeline legend swatch
```

## Setup and verification

```bash
npm install          # install dependencies
npm run dev          # start the dev server
npm test             # run the unit test suite (vitest)
npm run lint         # lint with eslint
npm run typecheck    # TypeScript check (tsc --noEmit)
npm run build        # production build to dist/
```

## Acceptance criteria summary

- **AC1 — Valid time input**: times are whole minutes in HH:MM format; start
  must be strictly after the current time and within the day (00:00–24:00).
- **AC2 — Duration limit**: requests may last at most 120 minutes
  (`MAX_DURATION`).
- **AC3 — Blocked room**: when the room is marked blocked, every request is
  rejected.
- **AC4 — Overlap rule**: a request may not overlap an existing booking;
  endpoint-touching slots (e.g. ending exactly when a booking starts) are
  allowed.
- **AC5 — Clear status, no mutation**: the check returns an unambiguous
  available/unavailable result and never mutates the bookings data.
- **AC6 — Usability**: responsive layout for desktop and mobile, and clear,
  field-level validation feedback for invalid or conflicting requests.

## Security and trust boundaries

- **No secrets in the client**: the app ships no API keys, tokens, or
  credentials, and performs no network calls.
- **No personal data**: nothing entered in the form is stored, transmitted, or
  persisted; a reload discards everything.
- **Trust boundary is the browser only**: all data is hardcoded fiction, so
  there is no server, no database, and no user data to protect. Availability
  results are advisory and must not be treated as authoritative bookings.

See `AGENTS.md` for engineering constraints and verification requirements.
