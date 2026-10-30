import { describe, expect, it } from "vitest";

import { formatParisClock } from "@/components/clothing-rail";

describe("formatParisClock", () => {
  it("shows the date and time in Paris time, not the visitor's time", () => {
    // 13:22 UTC on 30 Oct 2026 is 14:22 in Paris (winter time).
    expect(formatParisClock(new Date("2026-10-30T13:22:00Z"))).toEqual({ day: "FRIDAY, 30 OCTOBER 2026", time: "14:22" });
  });

  it("follows Paris summer time", () => {
    expect(formatParisClock(new Date("2026-07-01T22:30:00Z")).time).toBe("00:30");
  });
});
