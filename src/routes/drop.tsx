import { createFileRoute } from "@tanstack/react-router";

import { DropHome } from "@/components/drop-home";
import { getProducts } from "@/lib/shopify";

// Saved start page layout, always viewable here. Hidden from search engines.
export const Route = createFileRoute("/drop")({
  loader: () => getProducts(),
  head: () => ({ meta: [
    { title: "Léa Rivoli — New Drop Start Page" },
    { name: "description", content: "The New Drop layout of the Léa Rivoli start page." },
    { property: "og:title", content: "Léa Rivoli — New Drop Start Page" },
    { property: "og:description", content: "The New Drop layout of the Léa Rivoli start page." },
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary_large_image" },
    { name: "robots", content: "noindex" },
  ] }),
  component: Layout,
});

function Layout() {
  return <DropHome products={Route.useLoaderData()} />;
}
