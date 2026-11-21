import { MINUTES_PER_DAY, minutesToLabel } from "@/lib/availability";

export type ReasonCode =
  | "available"
  | "conflict"
  | "blocked"
  | "past"
  | "duration"
  | "invalid";

export interface ExplanationContext {
  roomLabel: string;
  start: number;
  end: number;
  isAvailable: boolean;
  reasonCode: ReasonCode;
  note?: string;
}

export interface ExplanationResult {
  ok: boolean;
  text: string;
}

export const FALLBACK_EXPLANATION =
  "The availability status shown above is the confirmed result. A generated explanation is temporarily unavailable.";

const REASON_CODES: ReasonCode[] = [
  "available",
  "conflict",
  "blocked",
  "past",
  "duration",
  "invalid",
];

const ROOM_LABEL_MAX = 80;
const NOTE_MAX = 200;
const TIMEOUT_MS = 1500;
const DEFAULT_MOCK_DELAY_MS = 100;

function isValidContext(ctx: unknown): ctx is ExplanationContext {
  if (typeof ctx !== "object" || ctx === null) return false;
  const c = ctx as Record<string, unknown>;
  if (
    typeof c.roomLabel !== "string" ||
    c.roomLabel.trim().length === 0 ||
    c.roomLabel.length > ROOM_LABEL_MAX
  ) {
    return false;
  }
  if (
    typeof c.start !== "number" ||
    typeof c.end !== "number" ||
    !Number.isInteger(c.start) ||
    !Number.isInteger(c.end) ||
    c.start < 0 ||
    c.end < 0 ||
    c.start > MINUTES_PER_DAY ||
    c.end > MINUTES_PER_DAY
  ) {
    return false;
  }
  if (typeof c.isAvailable !== "boolean") return false;
  if (typeof c.reasonCode !== "string" || !REASON_CODES.includes(c.reasonCode as ReasonCode)) {
    return false;
  }
  if (c.note !== undefined && (typeof c.note !== "string" || c.note.length > NOTE_MAX)) {
    return false;
  }
  return true;
}

function secondSentenceFor(reasonCode: ReasonCode): string {
  switch (reasonCode) {
    case "available":
      return "It meets the room's booking rules.";
    case "conflict":
      return "Try a time that does not overlap an existing booking.";
    case "blocked":
      return "Please try again once the room is unblocked.";
    case "past":
      return "Choose a start time after the current time.";
    case "duration":
      return "Shorten the request to 120 minutes or less.";
    default:
      return "Please enter valid HH:MM times.";
  }
}

// Deterministic template stand-in for a real LLM call: it may only restate
// fields from the confirmed check result, never add facts of its own.
function buildExplanation(ctx: ExplanationContext): string {
  // A reasonCode that contradicts the confirmed boolean means the caller's
  // context is inconsistent, so refuse to phrase anything.
  if (ctx.isAvailable !== (ctx.reasonCode === "available")) {
    return FALLBACK_EXPLANATION;
  }

  const room = ctx.roomLabel.trim();
  const range = `${minutesToLabel(ctx.start)}–${minutesToLabel(ctx.end)}`;
  let base: string;
  switch (ctx.reasonCode) {
    case "available":
      base = `${room} is free for ${range}.`;
      break;
    case "conflict":
      base = `${room} is unavailable for ${range} because it overlaps an existing booking.`;
      break;
    case "blocked":
      base = `${room} is unavailable for ${range} because the room is currently blocked.`;
      break;
    case "past":
      base = `${room} is unavailable for ${range} because the start time is not after the current time.`;
      break;
    case "duration":
      base = `${room} is unavailable for ${range} because the request exceeds the 120-minute limit.`;
      break;
    default:
      base = `${room} could not be checked for ${range} because the times are invalid.`;
  }

  const note = ctx.note?.trim();
  if (!note) {
    return `${base} ${secondSentenceFor(ctx.reasonCode)}`;
  }
  // Force the caller's note into a single sentence so the result stays <= 2 sentences.
  const singleSentence = note.replace(/[.!?]+/g, " ").replace(/\s+/g, " ").trim();
  return `${base} ${singleSentence}.`;
}

function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error("timeout")), ms);
    promise.then(
      (value) => {
        clearTimeout(timer);
        resolve(value);
      },
      (err) => {
        clearTimeout(timer);
        reject(err);
      },
    );
  });
}

function simulateModelCall(ctx: ExplanationContext, delayMs: number): Promise<string> {
  return new Promise((resolve) => {
    setTimeout(() => resolve(buildExplanation(ctx)), delayMs);
  });
}

export async function explainAvailability(
  ctx: ExplanationContext,
  options?: { delayMs?: number },
): Promise<ExplanationResult> {
  if (!isValidContext(ctx)) {
    return { ok: false, text: FALLBACK_EXPLANATION };
  }
  try {
    const text = await withTimeout(simulateModelCall(ctx, options?.delayMs ?? DEFAULT_MOCK_DELAY_MS), TIMEOUT_MS);
    return { ok: true, text };
  } catch {
    return { ok: false, text: FALLBACK_EXPLANATION };
  }
}
