import { useMemo, useState } from "react";
import {
  CheckCircle2,
  XCircle,
  AlertCircle,
  Clock,
  Building2,
  Lock,
  Unlock,
  CalendarClock,
  Timer,
} from "lucide-react";
import {
  checkAvailability,
  labelToMinutes,
  minutesToLabel,
  formatRange,
  MAX_DURATION,
  type Booking,
  type FieldKey,
} from "@/lib/availability";
import { DEFAULT_NOW, DEFAULT_BOOKINGS } from "@/lib/fixtures";
import {
  durationOf,
  activePresetOf,
  startFieldError,
  endFieldError,
  hasError,
  firstError,
  formatValidationError,
  type FormState,
} from "@/lib/formState";
import Timeline from "@/components/Timeline";
import TimeField from "@/components/TimeField";
import FieldError from "@/components/FieldError";
import LegendDot from "@/components/LegendDot";

type DurationPreset = 30 | 60 | 90 | 120;

export default function App() {
  const [startLabel, setStartLabel] = useState("11:00");
  const [endLabel, setEndLabel] = useState("12:00");
  const [blocked, setBlocked] = useState(false);
  const [now] = useState(DEFAULT_NOW);
  const [bookings] = useState<Booking[]>(DEFAULT_BOOKINGS);

  const [result, setResult] = useState<ReturnType<typeof checkAvailability> | null>(null);

  const startMin = useMemo(() => labelToMinutes(startLabel), [startLabel]);
  const endMin = useMemo(() => labelToMinutes(endLabel), [endLabel]);

  const candidate =
    startMin !== null && endMin !== null ? { start: startMin, end: endMin } : null;

  const duration = durationOf(startMin, endMin);
  const activePreset = activePresetOf(startMin, endMin);

  const fieldErrors = result?.fieldErrors ?? {};
  const formState: FormState = { startLabel, endLabel, startMin, endMin, fieldErrors };
  const startErr = startFieldError(formState);
  const endErr = endFieldError(formState);

  function setDuration(preset: DurationPreset) {
    if (startMin === null) return;
    const newEnd = Math.min(startMin + preset, 1440);
    setEndLabel(minutesToLabel(newEnd));
    setResult(null);
  }

  function handleCheck() {
    if (startMin === null || endMin === null) {
      const msg = formatValidationError(startMin, endMin);
      setResult({
        available: false,
        errors: [msg],
        fieldErrors: { format: [msg] },
      });
      return;
    }
    setResult(
      checkAvailability({
        start: startMin,
        end: endMin,
        now,
        blocked,
        bookings,
      }),
    );
  }

  const shownBookings = bookings; // never mutated

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-sky-50 to-slate-100 text-slate-800">
      <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 sm:py-12">
        {/* Header */}
        <header className="mb-8 text-center sm:text-left">
          <div className="inline-flex items-center gap-2 text-teal-700 mb-2">
            <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-teal-600 text-white shadow-sm">
              <Building2 size={20} />
            </div>
            <span className="text-sm font-semibold uppercase tracking-wider">
              Smart Campus
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 leading-tight">
            Room Availability Checker
          </h1>
          <p className="mt-1 text-sm text-slate-500 max-w-lg">
            Check whether a campus room is free for your requested time slot. This tool
            checks availability only — it does not create or confirm bookings.
          </p>
        </header>

        {/* Room card */}
        <div className="rounded-2xl bg-white shadow-sm ring-1 ring-slate-200 overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                Selected Room
              </p>
              <p className="text-lg font-bold text-slate-900">Room LIB-204 · Library Wing</p>
            </div>
            <div className="text-right">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                Current time
              </p>
              <p className="text-lg font-bold text-teal-700 font-mono">{minutesToLabel(now)}</p>
            </div>
          </div>

          {/* Timeline */}
          <div className="px-5 pt-6 pb-10">
            <div className="flex items-center gap-2 mb-3">
              <CalendarClock size={16} className="text-slate-500" />
              <h2 className="text-sm font-semibold text-slate-700">Today's Schedule</h2>
            </div>
            <Timeline
              now={now}
              bookings={shownBookings}
              candidate={candidate}
              candidateAvailable={result?.available ?? false}
              blocked={blocked}
            />

            {/* Legend */}
            <div className="mt-6 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-slate-500">
              <LegendDot className="bg-amber-400 ring-amber-500/60" label="Existing booking" />
              <LegendDot
                className={
                  result?.available
                    ? "bg-emerald-400 ring-emerald-500"
                    : result
                      ? "bg-rose-400 ring-rose-500"
                      : "bg-slate-300 ring-slate-400"
                }
                label="Your request"
              />
              <LegendDot className="bg-teal-600" label="Now" />
            </div>
          </div>
        </div>

        {/* Form + result grid */}
        <div className="mt-6 grid gap-6 md:grid-cols-2">
          {/* Form */}
          <section className="rounded-2xl bg-white shadow-sm ring-1 ring-slate-200 p-5 sm:p-6">
            <h2 className="text-sm font-semibold text-slate-700 mb-4 flex items-center gap-2">
              <Clock size={16} className="text-slate-500" />
              Request Details
            </h2>

            {/* Blocked toggle */}
            <button
              type="button"
              onClick={() => {
                setBlocked((v) => !v);
                setResult(null);
              }}
              className={`w-full flex items-center justify-between rounded-xl px-4 py-3 mb-5 ring-1 transition-colors ${
                blocked
                  ? "bg-rose-50 ring-rose-200 text-rose-800"
                  : "bg-slate-50 ring-slate-200 text-slate-600"
              }`}
              aria-pressed={blocked}
            >
              <span className="flex items-center gap-2 text-sm font-medium">
                {blocked ? <Lock size={16} /> : <Unlock size={16} />}
                Room blocked status
              </span>
              <span
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  blocked ? "bg-rose-500" : "bg-slate-300"
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    blocked ? "translate-x-6" : "translate-x-1"
                  }`}
                />
              </span>
            </button>

            {/* Time inputs */}
            <div className="grid grid-cols-2 gap-4">
              <TimeField
                label="Start time"
                value={startLabel}
                onChange={(v) => {
                  setStartLabel(v);
                  setResult(null);
                }}
                placeholder="14:30"
                error={startErr}
                invalid={Boolean(startErr)}
              />
              <TimeField
                label="End time"
                value={endLabel}
                onChange={(v) => {
                  setEndLabel(v);
                  setResult(null);
                }}
                placeholder="15:30"
                error={endErr}
                invalid={Boolean(endErr)}
              />
            </div>

            {/* Duration readout */}
            <div className="mt-3">
              <div
                className={`flex items-center justify-between rounded-lg px-3 py-2 text-xs ${
                  hasError(fieldErrors, "duration") ? "bg-rose-50 ring-1 ring-rose-200" : "bg-slate-50"
                }`}
              >
                <span className="text-slate-500 flex items-center gap-1.5">
                  <Timer size={13} /> Duration
                </span>
                <span
                  className={`font-mono font-semibold ${
                    duration > 0 && duration <= MAX_DURATION
                      ? "text-slate-700"
                      : duration > MAX_DURATION
                        ? "text-rose-600"
                        : "text-slate-400"
                  }`}
                >
                  {duration > 0 ? `${duration} min` : "—"}
                </span>
              </div>
              {hasError(fieldErrors, "duration") && (
                <div className="mt-1.5">
                  <FieldError message={firstError(fieldErrors, "duration")} />
                </div>
              )}
            </div>

            {/* Quick duration presets */}
            <div className="mt-3 grid grid-cols-4 gap-2">
              {([30, 60, 90, 120] as DurationPreset[]).map((d) => {
                const isActive = activePreset === d;
                return (
                  <button
                    key={d}
                    type="button"
                    onClick={() => setDuration(d)}
                    aria-pressed={isActive}
                    className={`rounded-lg text-xs font-medium py-2 transition-colors ring-1 ${
                      isActive
                        ? "bg-teal-600 text-white ring-teal-600"
                        : "bg-slate-100 text-slate-600 ring-transparent hover:bg-teal-50 hover:text-teal-700 hover:ring-teal-200"
                    }`}
                  >
                    {d} min
                  </button>
                );
              })}
            </div>

            {/* Blocked inline error */}
            {hasError(fieldErrors, "blocked") && (
              <div className="mt-3">
                <FieldError message={firstError(fieldErrors, "blocked")} />
              </div>
            )}

            {/* Conflict inline error (shown above the button) */}
            {hasError(fieldErrors, "conflict") && (
              <div className="mt-3">
                <FieldError message={firstError(fieldErrors, "conflict")} />
              </div>
            )}

            {/* Check button */}
            <button
              type="button"
              onClick={handleCheck}
              className="mt-5 w-full rounded-xl bg-teal-600 hover:bg-teal-700 active:scale-[0.99] text-white font-semibold py-3 transition-colors shadow-sm flex items-center justify-center gap-2"
            >
              <CheckCircle2 size={18} />
              Check Availability
            </button>
          </section>

          {/* Status card */}
          <section className="rounded-2xl bg-white shadow-sm ring-1 ring-slate-200 p-5 sm:p-6 flex flex-col">
            <h2 className="text-sm font-semibold text-slate-700 mb-4">Availability Result</h2>

            {!result ? (
              <div className="flex-1 flex flex-col items-center justify-center text-center text-slate-400 py-8">
                <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mb-3">
                  <Clock size={22} />
                </div>
                <p className="text-sm">Enter a time range and press "Check Availability".</p>
              </div>
            ) : result.available ? (
              <div className="flex-1 flex flex-col">
                <div className="rounded-xl bg-emerald-50 ring-1 ring-emerald-200 p-5 text-center">
                  <CheckCircle2 className="mx-auto text-emerald-600 mb-2" size={40} />
                  <p className="text-2xl font-bold text-emerald-700">Available</p>
                  <p className="mt-1 text-sm text-emerald-600">
                    {candidate && formatRange(candidate.start, candidate.end)} is free.
                  </p>
                </div>
                <p className="mt-4 text-xs text-slate-400 text-center">
                  This is an availability check only — no booking has been created.
                </p>
              </div>
            ) : (
              <div className="flex-1 flex flex-col">
                <div className="rounded-xl bg-rose-50 ring-1 ring-rose-200 p-5 text-center">
                  <XCircle className="mx-auto text-rose-600 mb-2" size={40} />
                  <p className="text-2xl font-bold text-rose-700">Unavailable</p>
                  <p className="mt-1 text-sm text-rose-600">
                    This time slot cannot be booked.
                  </p>
                </div>
                <ul className="mt-4 space-y-2">
                  {result.errors.map((err, i) => (
                    <li
                      key={i}
                      className="flex items-start gap-2 text-sm text-rose-700 bg-rose-50/60 rounded-lg px-3 py-2 ring-1 ring-rose-100"
                    >
                      <AlertCircle size={16} className="mt-0.5 shrink-0" />
                      <span>{err}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </section>
        </div>

        {/* Existing bookings summary */}
        <div className="mt-6 rounded-2xl bg-white shadow-sm ring-1 ring-slate-200 p-5">
          <h2 className="text-sm font-semibold text-slate-700 mb-3">Existing Bookings</h2>
          <ul className="flex flex-wrap gap-2">
            {shownBookings.map((b, i) => (
              <li
                key={i}
                className="inline-flex items-center gap-2 rounded-lg bg-amber-50 ring-1 ring-amber-200 px-3 py-1.5 text-sm text-amber-800"
              >
                <span className="w-2 h-2 rounded-full bg-amber-400" />
                <span className="font-mono font-medium">{formatRange(b.start, b.end)}</span>
              </li>
            ))}
            {shownBookings.length === 0 && (
              <li className="text-sm text-slate-400">No existing bookings.</li>
            )}
          </ul>
        </div>

        <footer className="mt-8 text-center text-xs text-slate-400">
          Prototype · Client-side availability check only · No bookings are created or stored.
        </footer>
      </div>
    </div>
  );
}
