import { createFileRoute } from "@tanstack/react-router";

import { ClassicHomeSections } from "@/components/home-sections";
import { StoreFooter, StoreHeader } from "@/components/storefront";
import { getProducts } from "@/lib/shopify";

// Saved copy of the original start page (without the clothing rail). Hidden from search engines.
export const Route = createFileRoute("/klassisk")({
  loader: () => getProducts(),
  head: () => ({ meta: [
    { title: "Léa Rivoli — Classic Start Page" },
    { name: "description", content: "The classic Léa Rivoli start page." },
    { property: "og:title", content: "Léa Rivoli — Classic Start Page" },
    { property: "og:description", content: "The classic Léa Rivoli start page." },
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary_large_image" },
    { name: "robots", content: "noindex" },
  ] }),
  component: Classic,
});

function Classic() {
  const products = Route.useLoaderData();
  return <main className="min-h-screen bg-background text-foreground"><StoreHeader /><ClassicHomeSections products={products} /><StoreFooter /></main>;
}
