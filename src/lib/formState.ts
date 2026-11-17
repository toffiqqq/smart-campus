import { MAX_DURATION, type FieldKey } from "@/lib/availability";

export interface FormState {
  startLabel: string;
  endLabel: string;
  startMin: number | null;
  endMin: number | null;
  fieldErrors: Partial<Record<FieldKey, string[]>>;
}

export function durationOf(start: number | null, end: number | null): number {
  if (start === null || end === null) return 0;
  return end - start;
}

export function activePresetOf(start: number | null, end: number | null): number | null {
  if (start === null || end === null) return null;
  const d = end - start;
  if (d > MAX_DURATION || d <= 0) return null;
  return d;
}

export function firstError(
  fieldErrors: Partial<Record<FieldKey, string[]>>,
  key: FieldKey,
): string {
  return fieldErrors[key]?.[0] ?? "";
}

export function hasError(
  fieldErrors: Partial<Record<FieldKey, string[]>>,
  key: FieldKey,
): boolean {
  return Boolean(fieldErrors[key]);
}

export function startFieldError(state: FormState): string {
  const fmt = firstError(state.fieldErrors, "format");
  return firstError(state.fieldErrors, "start") || (state.startMin === null ? fmt : "");
}

export function endFieldError(state: FormState): string {
  const fmt = firstError(state.fieldErrors, "format");
  return (
    firstError(state.fieldErrors, "end") ||
    (state.endMin === null && state.startMin !== null ? fmt : "")
  );
}

export function formatValidationError(startMin: number | null, endMin: number | null): string {
  if (startMin === null) return "Start time is not a valid HH:MM time (e.g. 14:30).";
  if (endMin === null) return "End time is not a valid HH:MM time (e.g. 14:30).";
  return "";
}
