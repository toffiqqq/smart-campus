import { describe, it, expect } from "vitest";
import {
  checkAvailability,
  overlaps,
  labelToMinutes,
  minutesToLabel,
  MAX_DURATION,
  MINUTES_PER_DAY,
} from "@/lib/availability";
import { DEFAULT_BOOKINGS, DEFAULT_NOW } from "@/lib/fixtures";

const base = { start: 660, end: 720, now: DEFAULT_NOW, blocked: false, bookings: DEFAULT_BOOKINGS };

describe("checkAvailability — AC1 valid integer times", () => {
  it("accepts a slot strictly after now within the day", () => {
    expect(checkAvailability(base)).toEqual({ available: true, errors: [], fieldErrors: {} });
  });

  it("rejects start not strictly after now (start <= now)", () => {
    const r = checkAvailability({ ...base, start: DEFAULT_NOW, end: DEFAULT_NOW + 30 });
    expect(r.available).toBe(false);
    expect(r.fieldErrors.start?.some((m) => m.includes("strictly after"))).toBe(true);
  });

  it("rejects end beyond 1440", () => {
    const r = checkAvailability({ ...base, start: 1430, end: MINUTES_PER_DAY + 10 });
    expect(r.available).toBe(false);
    expect(r.fieldErrors.end).toBeDefined();
  });

  it("rejects start >= end", () => {
    const r = checkAvailability({ ...base, start: 700, end: 700 });
    expect(r.available).toBe(false);
    expect(r.fieldErrors.end?.some((m) => m.includes("after"))).toBe(true);
  });
});

describe("checkAvailability — AC2 duration limit", () => {
  it("permits exactly 120 minutes", () => {
    const r = checkAvailability({ ...base, start: 700, end: 820 });
    expect(r.available).toBe(true);
  });

  it("rejects duration > 120 minutes", () => {
    const r = checkAvailability({ ...base, start: 700, end: 821 });
    expect(r.available).toBe(false);
    expect(r.fieldErrors.duration).toBeDefined();
  });

  it("applies the exported MAX_DURATION constant", () => {
    expect(MAX_DURATION).toBe(120);
  });
});

describe("checkAvailability — AC3 blocked room", () => {
  it("rejects every request when blocked", () => {
    const r = checkAvailability({ ...base, blocked: true });
    expect(r.available).toBe(false);
    expect(r.fieldErrors.blocked).toBeDefined();
  });
});

describe("checkAvailability — AC4 overlap (endpoint-touching allowed)", () => {
  it("allows a slot that ends exactly when a booking starts", () => {
    const r = checkAvailability({ ...base, start: 540, end: 600, now: 539 });
    expect(r.available).toBe(true);
  });

  it("allows a slot that starts exactly when a booking ends (660-720)", () => {
    const r = checkAvailability(base); // 660..720 vs booking 600..660
    expect(r.available).toBe(true);
  });

  it("rejects a slot overlapping a booking", () => {
    const r = checkAvailability({ ...base, start: 630, end: 690 });
    expect(r.available).toBe(false);
    expect(r.fieldErrors.conflict).toBeDefined();
  });

  it("overlaps helper treats touching endpoints as non-overlapping", () => {
    expect(overlaps({ start: 600, end: 660 }, { start: 660, end: 720 })).toBe(false);
    expect(overlaps({ start: 630, end: 690 }, { start: 600, end: 660 })).toBe(true);
  });
});

describe("checkAvailability — AC5 status + no mutation", () => {
  it("returns an unambiguous available boolean", () => {
    expect(checkAvailability(base).available).toBe(true);
    expect(checkAvailability({ ...base, blocked: true }).available).toBe(false);
  });

  it("does not mutate the bookings array passed in", () => {
    const bookings = [{ start: 600, end: 660 }];
    const snapshot = JSON.stringify(bookings);
    checkAvailability({ ...base, bookings });
    expect(JSON.stringify(bookings)).toBe(snapshot);
  });
});

describe("labelToMinutes / minutesToLabel", () => {
  it("round-trips common times", () => {
    expect(labelToMinutes("09:00")).toBe(540);
    expect(labelToMinutes("10:00")).toBe(600);
    expect(minutesToLabel(540)).toBe("09:00");
  });

  it("rejects malformed input with null", () => {
    expect(labelToMinutes("25:00")).toBeNull();
    expect(labelToMinutes("abc")).toBeNull();
    expect(labelToMinutes("9:5")).toBeNull();
  });
});
