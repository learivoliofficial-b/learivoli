import { describe, expect, it } from "vitest";

import { getSizeChart, TSHIRT_SIZE_CHART } from "@/lib/size-chart";

describe("size chart", () => {
  it("shows for the t-shirt", () => {
    expect(getSizeChart({ title: "L'Ange Gardien T-Shirt", handle: "l-ange-gardien-t-shirt" })).toBe(TSHIRT_SIZE_CHART);
  });
  it("does not show for hoodies", () => {
    expect(getSizeChart({ title: "Montmartre Hoodie", handle: "montmartre-hoodie" })).toBeNull();
  });
  it("uses the supplier's M measurements in cm", () => {
    const m = TSHIRT_SIZE_CHART.sizes.indexOf("M");
    expect(TSHIRT_SIZE_CHART.rows.map((r) => r.cm[m])).toEqual([69.5, 52.5, 52.5, 23]);
  });
});
