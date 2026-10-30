import { createFileRoute } from "@tanstack/react-router";

import { ClothingRail } from "@/components/clothing-rail";
import { ClassicHomeSections } from "@/components/home-sections";
import { StoreFooter, StoreHeader } from "@/components/storefront";
import { buildRailItems } from "@/lib/rail";
import { getProducts } from "@/lib/shopify";

export const Route = createFileRoute("/")({
  loader: () => getProducts(),
  head: ({ loaderData }) => {
    const lead = loaderData?.[0];
    const image = (lead?.images.edges[1]?.node ?? lead?.images.edges[0]?.node)?.url;
    return { meta: [
    { title: "Léa Rivoli — Official Store" },
    { name: "description", content: "Shop the latest Léa Rivoli collection." },
    { property: "og:title", content: "Léa Rivoli — Official Store" },
    { property: "og:description", content: "Shop the latest Léa Rivoli collection." },
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary_large_image" },
    ...(image?.startsWith("https://") ? [{ property: "og:image", content: image }, { name: "twitter:image", content: image }] : []),
  ] };
  },
  component: Index,
});

function Index() {
  const products = Route.useLoaderData();
  return <main className="min-h-screen bg-background text-foreground"><StoreHeader />
    <h1 className="sr-only">Léa Rivoli — Official Store</h1>
    <ClothingRail items={buildRailItems(products)} />
    <ClassicHomeSections products={products} headingLevel={2} />
    <StoreFooter />
  </main>;
}
