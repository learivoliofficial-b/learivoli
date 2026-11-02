import { describe, expect, it } from "vitest";

import { getSizeChart, HOODIE_SIZE_CHART, PANTS_SIZE_CHART, TSHIRT_SIZE_CHART } from "@/lib/size-chart";

describe("size chart", () => {
  it("shows for the t-shirt", () => {
    expect(getSizeChart({ title: "L'Ange Gardien T-Shirt", handle: "l-ange-gardien-t-shirt" })).toBe(TSHIRT_SIZE_CHART);
  });
  it("uses the hoodie chart for hoodies", () => {
    expect(getSizeChart({ title: "Montmartre Hoodie", handle: "montmartre-hoodie" })).toBe(HOODIE_SIZE_CHART);
  });
  it("uses the pants chart for sweatpants", () => {
    expect(getSizeChart({ title: "Avenue Montaigne Sweatpants", handle: "x" })).toBe(PANTS_SIZE_CHART);
  });
  it("hoodie M is 66 cm long, pants M 104 cm", () => {
    expect(HOODIE_SIZE_CHART.rows[0]?.cm[1]).toBe(66);
    expect(PANTS_SIZE_CHART.rows[0]?.cm[1]).toBe(104);
  });
  it("uses the supplier's M measurements in cm", () => {
    const m = TSHIRT_SIZE_CHART.sizes.indexOf("M");
    expect(TSHIRT_SIZE_CHART.rows.map((r) => r.cm[m])).toEqual([69.5, 52.5, 52.5, 23]);
  });
});
