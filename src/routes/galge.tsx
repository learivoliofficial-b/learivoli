import { createFileRoute } from "@tanstack/react-router";

import { RailHome } from "@/components/rail-home";
import { getProducts } from "@/lib/shopify";

// Saved start page layout, always viewable here. Hidden from search engines.
export const Route = createFileRoute("/galge")({
  loader: () => getProducts(),
  head: () => ({ meta: [
    { title: "Léa Rivoli — Clothing Rail Start Page" },
    { name: "description", content: "The Clothing Rail layout of the Léa Rivoli start page." },
    { property: "og:title", content: "Léa Rivoli — Clothing Rail Start Page" },
    { property: "og:description", content: "The Clothing Rail layout of the Léa Rivoli start page." },
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary_large_image" },
    { name: "robots", content: "noindex" },
  ] }),
  component: Layout,
});

function Layout() {
  return <RailHome products={Route.useLoaderData()} />;
}
