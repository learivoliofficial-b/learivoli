import { describe, expect, it } from "vitest";
import { parseDescription } from "@/lib/product-description";

const html = "<p>Intro text.</p><p></p><p><strong>Details</strong></p><p>250 GSM</p><p>Ribbed collar</p><p></p><p><strong>Care Instructions</strong></p><p>Machine wash cold</p><p></p><p>Closing line.</p>";

describe("parseDescription", () => {
  it("puts Details and Care Instructions lines in their own sections", () => {
    const { sections } = parseDescription(html);
    expect(sections).toEqual([
      { title: "Details", lines: ["250 GSM", "Ribbed collar"] },
      { title: "Care Instructions", lines: ["Machine wash cold"] },
    ]);
  });
  it("keeps text outside the sections as intro", () => {
    expect(parseDescription(html).intro).toEqual(["Intro text.", "Closing line."]);
  });
});
