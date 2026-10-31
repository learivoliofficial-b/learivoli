import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { ChevronLeft } from "lucide-react";

import { POLICIES, PolicyText, type PolicySlug } from "@/components/policies";
import { StoreFooter, StoreHeader } from "@/components/storefront";

export const Route = createFileRoute("/policies/$slug")({
  loader: ({ params }) => {
    if (!(params.slug in POLICIES)) throw notFound();
    return { slug: params.slug as PolicySlug };
  },
  head: ({ loaderData }) => {
    const title = loaderData ? `${POLICIES[loaderData.slug].title} — Léa Rivoli` : "Policy — Léa Rivoli";
    const description = loaderData ? `Read the Léa Rivoli ${POLICIES[loaderData.slug].title.toLowerCase()}.` : "Léa Rivoli store policies.";
    return { meta: [
      { title }, { name: "description", content: description },
      { property: "og:title", content: title }, { property: "og:description", content: description },
      { property: "og:type", content: "article" }, { name: "twitter:card", content: "summary" },
    ] };
  },
  component: PolicyPage,
});

function PolicyPage() {
  const { slug } = Route.useLoaderData();
  const policy = POLICIES[slug];
  return <main className="min-h-screen bg-background text-foreground"><StoreHeader />
    <article className="mx-auto max-w-2xl px-6 py-14 md:py-20">
      <Link to="/" className="inline-flex items-center gap-1 text-[10px] uppercase text-muted-foreground hover:text-foreground"><ChevronLeft className="size-3" />Back</Link>
      <h1 className="mt-6 font-hand text-5xl font-semibold md:text-6xl">{policy.title}</h1>
      <div className="mt-6"><PolicyText text={policy.text} /></div>
    </article>
    <StoreFooter />
  </main>;
}
