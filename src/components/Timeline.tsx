import { minutesToLabel, formatRange, type Booking } from "@/lib/availability";

interface TimelineProps {
  now: number;
  bookings: Booking[];
  candidate: { start: number; end: number } | null;
  candidateAvailable: boolean;
  blocked: boolean;
}

const HOUR_TICKS = Array.from({ length: 25 }, (_, i) => i * 60);

export default function Timeline({
  now,
  bookings,
  candidate,
  candidateAvailable,
  blocked,
}: TimelineProps) {
  const pct = (min: number) => `${(min / 1440) * 100}%`;

  return (
    <div className="w-full">
      <div className="relative h-28 w-full select-none">
        {/* base track */}
        <div className="absolute inset-x-0 top-10 h-12 rounded-xl bg-slate-100 ring-1 ring-slate-200 overflow-hidden">
          {/* hour gridlines */}
          {HOUR_TICKS.map((t) => (
            <div
              key={t}
              className="absolute top-0 bottom-0 w-px bg-slate-200/70"
              style={{ left: pct(t) }}
            />
          ))}

          {/* existing bookings */}
          {bookings.map((b, i) => (
            <div
              key={i}
              className="absolute top-0 bottom-0 bg-amber-400/90 ring-1 ring-amber-500/60 flex items-center justify-center"
              style={{ left: pct(b.start), width: pct(b.end - b.start) }}
              title={`Booked ${formatRange(b.start, b.end)}`}
            >
              <span className="text-[10px] font-semibold text-amber-950 truncate px-1 hidden sm:block">
                {formatRange(b.start, b.end)}
              </span>
            </div>
          ))}

          {/* candidate slot */}
          {candidate && (
            <div
              className={`absolute top-0 bottom-0 flex items-center justify-center transition-colors ${
                candidateAvailable
                  ? "bg-emerald-400/80 ring-1 ring-emerald-500"
                  : "bg-rose-400/80 ring-1 ring-rose-500"
              }`}
              style={{ left: pct(candidate.start), width: pct(candidate.end - candidate.start) }}
              title={`Request ${formatRange(candidate.start, candidate.end)}`}
            >
              <span className="text-[10px] font-bold text-white truncate px-1 hidden sm:block">
                {formatRange(candidate.start, candidate.end)}
              </span>
            </div>
          )}

          {/* blocked overlay */}
          {blocked && (
            <div className="absolute inset-0 bg-slate-900/40 backdrop-grayscale flex items-center justify-center">
              <span className="text-xs font-bold text-white tracking-wide">BLOCKED</span>
            </div>
          )}
        </div>

        {/* now marker */}
        <div
          className="absolute top-8 bottom-0 w-0.5 bg-teal-600"
          style={{ left: pct(now) }}
        >
          <span className="absolute -top-5 -translate-x-1/2 left-1/2 text-[10px] font-bold text-teal-700 whitespace-nowrap">
            Now {minutesToLabel(now)}
          </span>
          <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 rounded-full bg-teal-600" />
        </div>

        {/* hour labels */}
        <div className="absolute inset-x-0 top-24">
          {HOUR_TICKS.filter((t) => t % 180 === 0).map((t) => (
            <span
              key={t}
              className="absolute -translate-x-1/2 text-[10px] text-slate-400 font-medium"
              style={{ left: pct(t) }}
            >
              {minutesToLabel(t)}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
