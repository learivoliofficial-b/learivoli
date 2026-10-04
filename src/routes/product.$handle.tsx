import { createFileRoute, notFound } from "@tanstack/react-router";
import { useMemo, useState } from "react";

import { StoreFooter, StoreHeader } from "@/components/storefront";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { formatMoney, getProductByHandle } from "@/lib/shopify";
import { useCartStore } from "@/stores/cart-store";

export const Route = createFileRoute("/product/$handle")({
  loader: async ({ params }) => {
    const product = await getProductByHandle(params.handle);
    if (!product) throw notFound();
    return product;
  },
  head: ({ loaderData }) => {
    const title = loaderData ? `${loaderData.title} — Léa Rivoli` : "Product unavailable — Léa Rivoli";
    const description = loaderData?.description.slice(0, 160) ?? "This Léa Rivoli product is unavailable.";
    const image = loaderData?.images.edges[0]?.node.url;
    return { meta: [
      { title }, { name: "description", content: description },
      { property: "og:title", content: title }, { property: "og:description", content: description },
      { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary_large_image" },
      ...(image ? [{ property: "og:image", content: image }, { name: "twitter:image", content: image }] : []),
    ] };
  },
  component: ProductPage,
});

function ProductPage() {
  const product = Route.useLoaderData();
  const [selected, setSelected] = useState<Record<string,string>>(() => Object.fromEntries(product.options.map((option) => [option.name, option.values[0] ?? ""])));
  const [notice, setNotice] = useState("");
  const addItem = useCartStore((state) => state.addItem);
  const isLoading = useCartStore((state) => state.isLoading);
  const variant = useMemo(() => product.variants.edges.map(({ node }) => node).find((entry) => entry.selectedOptions.every((option) => selected[option.name] === option.value)), [product, selected]);
  const images = product.images.edges.map(({ node }) => node);

  const handleAdd = async () => {
    if (!variant) return;
    setNotice("");
    const added = await addItem({ product: { title: product.title, handle: product.handle, image: variant.image?.url ?? images[0]?.url ?? null }, variantId: variant.id, variantTitle: variant.title, price: variant.price, quantity: 1, selectedOptions: variant.selectedOptions });
    setNotice(added ? "Added to your cart." : "Could not add this item. Please try again.");
  };

  return <main className="min-h-screen bg-background text-foreground"><StoreHeader />
    <div className="grid lg:grid-cols-[minmax(0,1.55fr)_minmax(360px,0.75fr)]">
      <div className="grid grid-cols-2 gap-px bg-border">{images.map((image, index) => <div key={image.url} className={`bg-muted ${index === 0 ? "col-span-2 lg:col-span-1" : ""}`}><img src={image.url} alt={image.altText ?? `${product.title} view ${index + 1}`} className="aspect-[3/4] size-full object-cover" /></div>)}</div>
      <section className="px-5 py-9 lg:sticky lg:top-[76px] lg:h-[calc(100svh-76px)] lg:overflow-y-auto lg:px-10 lg:py-12">
        <p className="text-[10px] font-semibold uppercase text-muted-foreground">{product.productType}</p><h1 className="mt-3 font-serif text-3xl uppercase md:text-4xl">{product.title}</h1><p className="mt-4 text-sm">{variant ? formatMoney(variant.price.amount, variant.price.currencyCode) : formatMoney(product.priceRange.minVariantPrice.amount, product.priceRange.minVariantPrice.currencyCode)}</p>
        <div className="mt-10 space-y-7">{product.options.map((option) => <fieldset key={option.name}><legend className="mb-3 text-[10px] font-semibold uppercase">{option.name}: <span className="font-normal text-muted-foreground">{selected[option.name]}</span></legend><div className="flex flex-wrap gap-2">{option.values.map((value) => <Button key={value} type="button" variant={selected[option.name] === value ? "default" : "outline"} className="min-w-14 rounded-none uppercase" onClick={() => setSelected((current) => ({ ...current, [option.name]: value }))}>{value}</Button>)}</div></fieldset>)}</div>
        <Button className="mt-9 h-13 w-full rounded-none uppercase" disabled={!variant?.availableForSale || isLoading} onClick={() => void handleAdd()}>{isLoading ? "Adding…" : variant?.availableForSale ? "Add to cart" : "Sold out"}</Button>{notice && <p className="mt-3 text-center text-xs" role="status">{notice}</p>}
        <Accordion type="single" collapsible className="mt-9 border-t border-border"><AccordionItem value="description"><AccordionTrigger className="text-[10px] uppercase">Description</AccordionTrigger><AccordionContent><div className="product-description space-y-3 text-xs leading-6 text-muted-foreground" dangerouslySetInnerHTML={{ __html: product.descriptionHtml }} /></AccordionContent></AccordionItem><AccordionItem value="shipping"><AccordionTrigger className="text-[10px] uppercase">Shipping & returns</AccordionTrigger><AccordionContent><p className="text-xs leading-6 text-muted-foreground">Shipping rates and delivery estimates are shown at checkout. Returns are accepted according to the store's current return policy.</p></AccordionContent></AccordionItem></Accordion>
      </section>
    </div><StoreFooter />
  </main>;
}