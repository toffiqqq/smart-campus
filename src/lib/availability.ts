export interface Booking {
  start: number;
  end: number;
}

export interface CheckParams {
  start: number;
  end: number;
  now: number;
  blocked: boolean;
  bookings: Booking[];
}

export type FieldKey = "start" | "end" | "duration" | "blocked" | "conflict" | "format";

export interface CheckResult {
  available: boolean;
  errors: string[];
  fieldErrors: Partial<Record<FieldKey, string[]>>;
}

export const MINUTES_PER_DAY = 1440;
export const MAX_DURATION = 120;

export function minutesToLabel(min: number): string {
  const h = Math.floor(min / 60);
  const m = min % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}

export function labelToMinutes(label: string): number | null {
  const match = /^(\d{1,2}):(\d{2})$/.exec(label.trim());
  if (!match) return null;
  const h = Number(match[1]);
  const m = Number(match[2]);
  if (h === 24 && m === 0) return MINUTES_PER_DAY;
  if (h < 0 || h > 23 || m < 0 || m > 59) return null;
  return h * 60 + m;
}

export function formatRange(start: number, end: number): string {
  return `${minutesToLabel(start)} – ${minutesToLabel(end)}`;
}

export function overlaps(a: Booking, b: Booking): boolean {
  return a.start < b.end && b.start < a.end;
}

export function checkAvailability(params: CheckParams): CheckResult {
  const { start, end, now, blocked, bookings } = params;
  const errors: string[] = [];
  const fieldErrors: Partial<Record<FieldKey, string[]>> = {};
  const add = (field: FieldKey, msg: string) => {
    errors.push(msg);
    (fieldErrors[field] ??= []).push(msg);
  };

  if (!Number.isInteger(start) || !Number.isInteger(end)) {
    add("format", "Start and end times must be whole minutes in HH:MM format (e.g. 14:30).");
    return { available: false, errors, fieldErrors };
  }

  if (start < 0) {
    add("start", "Start time cannot be before 00:00.");
  }
  if (end > MINUTES_PER_DAY) {
    add("end", `End time cannot exceed 24:00 (1440 minutes).`);
  }

  if (start >= end) {
    add("end", "End time must be after the start time.");
  }

  if (start <= now) {
    add(
      "start",
      `Start time must be strictly after the current time (${minutesToLabel(now)}).`,
    );
  }

  const duration = end - start;
  if (duration > MAX_DURATION) {
    add(
      "duration",
      `Duration is ${duration} minutes, which exceeds the 120-minute limit. Please shorten your request.`,
    );
  }

  if (blocked) {
    add("blocked", "This room is currently marked as blocked and cannot be booked.");
  }

  for (const b of bookings) {
    if (overlaps({ start, end }, b)) {
      add(
        "conflict",
        `Overlaps with existing booking ${formatRange(b.start, b.end)}. Choose a non-overlapping time.`,
      );
    }
  }

  return { available: errors.length === 0, errors, fieldErrors };
}
