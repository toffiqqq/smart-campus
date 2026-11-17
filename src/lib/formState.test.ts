import { describe, it, expect } from "vitest";
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

const emptyState = (over: Partial<FormState>): FormState => ({
  startLabel: "11:00",
  endLabel: "12:00",
  startMin: 660,
  endMin: 720,
  fieldErrors: {},
  ...over,
});

describe("durationOf", () => {
  it("returns the difference when both present", () => {
    expect(durationOf(660, 720)).toBe(60);
  });
  it("returns 0 when either is null", () => {
    expect(durationOf(null, 720)).toBe(0);
    expect(durationOf(660, null)).toBe(0);
  });
});

describe("activePresetOf", () => {
  it("returns the duration when within the limit", () => {
    expect(activePresetOf(660, 720)).toBe(60);
    expect(activePresetOf(660, 780)).toBe(120);
  });
  it("returns null when over the 120 limit or invalid", () => {
    expect(activePresetOf(660, 800)).toBeNull();
    expect(activePresetOf(null, 720)).toBeNull();
    expect(activePresetOf(660, 660)).toBeNull();
  });
});

describe("startFieldError / endFieldError", () => {
  it("surfaces a start-specific error", () => {
    const s = emptyState({ fieldErrors: { start: ["Start time must be strictly after 09:00."] } });
    expect(startFieldError(s)).toBe("Start time must be strictly after 09:00.");
  });
  it("falls back to the format error when start label is unparseable", () => {
    const s = emptyState({ startMin: null, fieldErrors: { format: ["bad start"] } });
    expect(startFieldError(s)).toBe("bad start");
  });
  it("surfaces an end-specific error", () => {
    const s = emptyState({ fieldErrors: { end: ["End time must be after start."] } });
    expect(endFieldError(s)).toBe("End time must be after start.");
  });
  it("falls back to the format error for end only when start parsed but end did not", () => {
    const s = emptyState({ startMin: 660, endMin: null, fieldErrors: { format: ["bad end"] } });
    expect(endFieldError(s)).toBe("bad end");
  });
});

describe("hasError / firstError", () => {
  const fe = { duration: ["too long"] };
  it("hasError reports presence", () => {
    expect(hasError(fe, "duration")).toBe(true);
    expect(hasError(fe, "blocked")).toBe(false);
  });
  it("firstError returns the first message or empty", () => {
    expect(firstError(fe, "duration")).toBe("too long");
    expect(firstError(fe, "blocked")).toBe("");
  });
});

describe("formatValidationError", () => {
  it("names the start field when start is null", () => {
    expect(formatValidationError(null, 720)).toContain("Start time");
  });
  it("names the end field when end is null but start is valid", () => {
    expect(formatValidationError(660, null)).toContain("End time");
  });
  it("returns empty when both are valid", () => {
    expect(formatValidationError(660, 720)).toBe("");
  });
});
