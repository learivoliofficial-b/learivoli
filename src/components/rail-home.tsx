import { ClothingRail } from "@/components/clothing-rail";
import { StoreHeader } from "@/components/storefront";
import { buildRailItems } from "@/lib/rail";
import type { ShopifyProduct } from "@/lib/shopify";

/** Start page layout: the clothing rail with hangers, no scrolling. */
export function RailHome({ products, headingLevel = 1 }: { products: ShopifyProduct[]; headingLevel?: 1 | 2 }) {
  const Heading = headingLevel === 1 ? "h1" : "h2";
  return <main className="flex h-svh flex-col overflow-hidden bg-rail text-foreground"><StoreHeader />
    <Heading className="sr-only">Léa Rivoli — Official Store</Heading>
    <ClothingRail items={buildRailItems(products)} />
  </main>;
}
