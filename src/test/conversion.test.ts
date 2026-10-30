import { describe, expect, it } from "vitest";
import { freeShippingProgress } from "@/lib/shipping";
import { buildRecommendations } from "@/lib/recommendations";
import type { ShopifyProduct } from "@/lib/shopify";

describe("free shipping", () => {
  it("needs 2 items: 1 item leaves 1 to go", () => expect(freeShippingProgress(1)).toMatchObject({ remaining: 1, unlocked: false }));
  it("2 items unlock free shipping", () => expect(freeShippingProgress(2)).toMatchObject({ remaining: 0, unlocked: true, percent: 100 }));
});

const product = (handle: string) => ({ id: handle, handle, title: handle, images: { edges: [{ node: { url: `https://x/${handle}.jpg`, altText: null } }] }, priceRange: { minVariantPrice: { amount: "500", currencyCode: "SEK" } } }) as unknown as ShopifyProduct;

describe("recommendations", () => {
  it("never recommends the product being viewed and shows 4", () => {
    const recs = buildRecommendations([product("a"), product("b")], "a");
    expect(recs).toHaveLength(4);
    expect(recs.map((r) => r.handle)).not.toContain("a");
    expect(recs[0]!.handle).toBe("b");
  });
});
