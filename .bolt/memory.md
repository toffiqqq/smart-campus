# Project memory

## Product intent & audience

- Single-room meeting/room availability checker ("Room LIB-204 · Library Wing").
- Client-side only tool that shows whether a time slot is free against fictional bookings.
- Explicitly does **not** create or confirm real bookings (stated in header copy).
- Audience: internal/library staff or demo users; no auth, no persistence.

## Brand personality & voice

- Utilitarian, informational tone; header copy is direct and disclaimer-style.
- No marketing language; framed as a utility tool.

## Visual design & UX direction

- Single hardcoded room card UI in `src/App.tsx`; no room selector or multi-room layout.
- React state-driven form for checking availability (form state has its own test module).
- Built with Vite + React; static SPA deployment (Netlify-style `dist/_redirects` with `/* /index.html 200`).

## Decisions, constraints & rationale

- **One room only**: hardcoded in `App.tsx`, no list/selector/props for multiple rooms.
- **Fictional data**: `src/lib/fixtures.ts` holds one booking (10:00–11:00) and a fixed "now" of 09:00; nothing fetched or persisted.
- **No login**: no auth/session/user state anywhere in `src/`.
- **No database**: `checkAvailability` is a pure function; all computation client-side. `@supabase/supabase-js` is listed in `package.json` but unused in `src/` — dead dependency, not a live backend.
- **AGENTS.md** is the only documentation (no README); references acceptance criteria AC1–AC6, but **AC6 is undefined** anywhere in the repo.
- **Known lint issue (as of last inspection)**: unused `FieldKey` import in `src/App.tsx` line 20 causes `npm run lint` to fail; tests and build pass. Fix is trivial but was left unapplied in read-only mode.

## Open questions & assumptions

- What is AC6? Referenced in AGENTS.md but never defined — needs clarification from project owner.
- Should `@supabase/supabase-js` be removed from dependencies, or is a backend integration planned?
- Is multi-room support intended for future, or is single-room a permanent constraint?
- README is absent; is AGENTS.md intended as the sole doc, or should a README be added?