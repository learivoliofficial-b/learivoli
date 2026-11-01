import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { ChevronLeft, ShoppingBag } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";

import brandLogo from "@/assets/logowithslogo-2.png";
import ourStoryImage from "@/assets/our-story.jpg";
import { SocialProofCarousel, StoreFooter, StoreHeader } from "@/components/storefront";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { SizeChartDialog } from "@/components/size-chart-dialog";
import { parseDescription } from "@/lib/product-description";
import { getSizeChart } from "@/lib/size-chart";
import { pickRailImages, RAIL_SIDE_TAG } from "@/lib/rail";
import { buildRecommendations, type Recommendation } from "@/lib/recommendations";
import { formatMoney, getProductByHandle, getProducts } from "@/lib/shopify";
import { useCartStore } from "@/stores/cart-store";

export const Route = createFileRoute("/product/$handle")({
  loader: async ({ params }) => {
    const [product, products] = await Promise.all([getProductByHandle(params.handle), getProducts()]);
    if (!product) throw notFound();
    return { ...product, recommendations: buildRecommendations(products, product.handle) };
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
  const [selected, setSelected] = useState<Record<string,string>>(() => Object.fromEntries(product.options.map((option) => [option.name, option.values.length === 1 ? option.values[0] ?? "" : ""])));
  const [notice, setNotice] = useState("");
  const inlineButtonRef = useRef<HTMLButtonElement>(null);
  const [showStickyBar, setShowStickyBar] = useState(false);
  const galleryRef = useRef<HTMLDivElement>(null);
  const [slide, setSlide] = useState(0);
  const onGalleryScroll = () => { const el = galleryRef.current; if (el) setSlide(Math.round(el.scrollLeft / Math.max(1, el.clientWidth))); };
  const addItem = useCartStore((state) => state.addItem);
  const isLoading = useCartStore((state) => state.isLoading);

  useEffect(() => {
    const button = inlineButtonRef.current;
    if (!button || typeof IntersectionObserver === "undefined") return;
    const observer = new IntersectionObserver((entries) => setShowStickyBar(!entries[0]?.isIntersecting), { threshold: 0 });
    observer.observe(button);
    return () => observer.disconnect();
  }, []);
  const variant = useMemo(() => product.variants.edges.map(({ node }) => node).find((entry) => entry.selectedOptions.every((option) => selected[option.name] === option.value)), [product, selected]);
  const images = product.images.edges.map(({ node }) => node);
  const frontImage = pickRailImages(product).front;

  const colorOptions = product.options.find((option) => option.name.toLowerCase() === "color");
  const sizeOptions = product.options.find((option) => option.name.toLowerCase() === "size");
  const otherOptions = product.options.filter((option) => !["color", "size"].includes(option.name.toLowerCase()));
  const colorImages = useMemo(() => Object.fromEntries((colorOptions?.values ?? []).map((color) => {
    const colorKey = color.toLowerCase();
    const matchingVariant = product.variants.edges.map(({ node }) => node).find((entry) => entry.selectedOptions.some((option) => option.name.toLowerCase() === "color" && option.value === color) && entry.image);
    const matchingProductImage = images.find((image) => `${image.altText ?? ""} ${image.url}`.toLowerCase().includes(colorKey === "grey" ? "gray" : colorKey));
    return [color, matchingProductImage ?? matchingVariant?.image ?? images[colorKey === "navy" ? 0 : 3] ?? images[0]];
  })), [colorOptions, images, product.variants.edges]);

  const handleAdd = async () => {
    if (!variant) return;
    setNotice("");
    const added = await addItem({ product: { title: product.title, handle: product.handle, image: variant.image?.url ?? images[0]?.url ?? null }, variantId: variant.id, variantTitle: variant.title, price: variant.price, quantity: 1, selectedOptions: variant.selectedOptions });
    setNotice(added ? "Added to your cart." : "Could not add this item. Please try again.");
  };

  const showcase = [frontImage, ...images.filter((image) => image !== frontImage && !image.altText?.toLowerCase().includes(RAIL_SIDE_TAG))].filter((image): image is NonNullable<typeof image> => Boolean(image));
  const price = variant ? formatMoney(variant.price.amount, variant.price.currencyCode) : formatMoney(product.priceRange.minVariantPrice.amount, product.priceRange.minVariantPrice.currencyCode);

  const dropdown = (option: { name: string; values: string[] }) => <Select key={option.name} value={selected[option.name] || undefined} onValueChange={(value) => setSelected((current) => ({ ...current, [option.name]: value }))}>
    <SelectTrigger aria-label={`Select ${option.name}`} className="h-12 w-full rounded-none border-border bg-background px-4 text-xs shadow-none focus:ring-1 focus:ring-foreground"><SelectValue placeholder={`Select ${option.name}`} /></SelectTrigger>
    <SelectContent className="rounded-none">{option.values.map((value) => <SelectItem key={value} value={value} className="rounded-none text-xs">{value}</SelectItem>)}</SelectContent>
  </Select>;
  const sizeChart = getSizeChart(product);
  const pickers = <div className="space-y-2.5">{sizeChart && <div className="flex justify-end"><SizeChartDialog chart={sizeChart} selectedSize={sizeOptions ? selected[sizeOptions.name] : undefined} /></div>}{colorOptions && dropdown(colorOptions)}{sizeOptions && dropdown(sizeOptions)}{otherOptions.map(dropdown)}</div>;
  const missing = product.options.find((option) => !selected[option.name]);
  const addButton = <Button ref={inlineButtonRef} className="h-12 w-full rounded-none text-[11px] font-semibold uppercase tracking-[0.12em]" disabled={Boolean(missing) || !variant?.availableForSale || isLoading} onClick={() => void handleAdd()}>{isLoading ? "Adding…" : missing ? `Select ${missing.name.toLowerCase()}` : variant?.availableForSale ? "Add to bag" : "Sold out"}</Button>;

  const parsed = parseDescription(product.descriptionHtml || product.description);
  const descriptionBlock = <div className="text-left">
    {parsed.intro.length > 0 && <div className="space-y-3 break-words text-[11px] leading-5 text-muted-foreground">{parsed.intro.map((line) => <p key={line}>{line}</p>)}</div>}
    {parsed.sections.length > 0 && <Accordion type="single" collapsible className="mt-5 border-t border-border">
      {parsed.sections.map((section) => <AccordionItem key={section.title} value={section.title} className="border-border">
        <AccordionTrigger className="py-3 text-[10px] font-semibold uppercase tracking-[0.12em] hover:no-underline [&>svg]:size-3.5">{section.title}</AccordionTrigger>
        <AccordionContent><ul className="space-y-1 pb-1 text-[11px] leading-5 text-muted-foreground">{section.lines.map((line) => <li key={line}>{line}</li>)}</ul></AccordionContent>
      </AccordionItem>)}
    </Accordion>}
  </div>;

  return <main className="min-h-screen bg-rail pb-20 text-foreground lg:pb-0"><StoreHeader />
    <section className="relative lg:grid lg:grid-cols-[minmax(0,1fr)_minmax(0,1.8fr)_minmax(0,1fr)] lg:gap-8 lg:px-12">
      {/* Left: back, title, description — stays put while the images scroll */}
      <div className="hidden lg:sticky lg:top-[107px] lg:flex lg:h-[calc(100svh-107px)] lg:min-w-0 lg:flex-col lg:justify-center">
        <Link to="/" className="inline-flex items-center gap-1 text-[10px] uppercase text-muted-foreground hover:text-foreground"><ChevronLeft className="size-3" />Back</Link>
        <h1 className="mt-4 max-w-xs text-xl font-semibold uppercase leading-tight">{product.title}</h1>
        <div className="mt-4 max-w-xs">{descriptionBlock}</div>
      </div>

      {/* Center: images stacked, scroll down to see more */}
      <div className="hidden min-w-0 lg:block">
        {showcase.map((image, index) => <div key={image.url} className="flex h-[calc(100svh-107px)] items-center justify-center"><img src={image.url} alt={image.altText ?? `${product.title} view ${index + 1}`} loading={index === 0 ? "eager" : "lazy"} className={`max-h-[92%] w-auto max-w-full object-contain brightness-[1.05] ${index === 0 ? "garment-drop" : ""}`} /></div>)}
      </div>

      {/* Mobile: swipe sideways between full-square photos */}
      <div className="relative lg:hidden">
        <Link to="/" aria-label="Back to the rail" className="absolute left-3 top-3 z-10 grid size-9 place-items-center rounded-full bg-background/80"><ChevronLeft className="size-4" /></Link>
        <div ref={galleryRef} onScroll={onGalleryScroll} className="scrollbar-none flex snap-x snap-mandatory overflow-x-auto overscroll-x-contain">
          {showcase.map((image, index) => <div key={image.url} className="aspect-[4/5] w-full shrink-0 snap-center snap-always overflow-hidden"><img src={image.url} alt={image.altText ?? `${product.title} view ${index + 1}`} loading={index === 0 ? "eager" : "lazy"} draggable={false} className="size-full object-cover" /></div>)}
        </div>
        {showcase.length > 1 && <div className="absolute bottom-3 left-1/2 flex -translate-x-1/2 justify-center gap-1.5 rounded-full bg-background/80 px-2 py-1.5" aria-hidden>{showcase.map((image, index) => <span key={image.url} className={`h-1.5 rounded-full transition-all duration-300 ${index === slide ? "w-6 bg-foreground" : "w-1.5 bg-foreground/30"}`} />)}</div>}
      </div>

      {/* Right: price, options, add to cart — stays put on desktop */}
      <div className="space-y-5 px-5 pt-6 lg:sticky lg:top-[107px] lg:ml-auto lg:flex lg:h-[calc(100svh-107px)] lg:w-full lg:max-w-[280px] lg:flex-col lg:justify-center lg:space-y-5 lg:px-0 lg:pt-0 lg:text-right">
        <div className="lg:hidden"><h1 className="text-lg font-semibold uppercase leading-tight">{product.title}</h1><p className="mt-1 text-sm">{price}</p></div>
        <p className="hidden text-sm lg:block">{price}</p>
        {pickers}
        <div className="space-y-2">{addButton}<p className="text-center text-[10px] text-muted-foreground">14-day returns</p></div>
        {notice && <p className="text-center text-xs lg:text-right" role="status">{notice}</p>}
        <div className="pt-2 lg:hidden">{descriptionBlock}</div>
      </div>

    </section>
    <YouMayAlsoLike items={product.recommendations} />
    <SocialProofCarousel />
    <section className="border-t border-border bg-background">
      <div className="mx-auto max-w-3xl"><img src={ourStoryImage} alt="The Léa Rivoli story" loading="lazy" className="aspect-[3/4] w-full object-cover" /></div>
      <div className="mx-auto max-w-2xl px-6 py-16 text-center md:py-24">
        <h2 className="text-4xl uppercase md:text-5xl">Our Story</h2>
        <p className="mx-auto mt-5 max-w-xl font-serif text-base italic leading-7 text-muted-foreground">Life is not measured by what we have, but by what we remember. The places we discover, the people we meet, the moments we never want to forget. Léa Rivoli was created as a reminder to slow down, look around, and appreciate the beauty of simply being here. Because perhaps the finest things in life are not things at all. L’ART DE VIVRE.</p>
        <img src={brandLogo} alt="Léa Rivoli — L’Art de vivre." className="mx-auto mt-12 w-72 md:w-96" />
      </div>
    </section>
    <div className={`fixed inset-x-0 bottom-0 z-40 border-t border-border bg-background/95 pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-3 backdrop-blur transition-transform duration-300 lg:hidden ${showStickyBar ? "translate-y-0" : "translate-y-full"}`} aria-hidden={!showStickyBar}>
      <div className="px-4">
        <Button className="h-13 w-full rounded-none uppercase" disabled={!variant?.availableForSale || isLoading} tabIndex={showStickyBar ? 0 : -1} onClick={() => void handleAdd()}>{isLoading ? "Adding…" : missing ? `Select ${missing.name.toLowerCase()}` : variant?.availableForSale ? <>Add to bag — {formatMoney(variant.price.amount, variant.price.currencyCode)}</> : "Sold out"}</Button>
      </div>
    </div>
    <StoreFooter />
  </main>;
}
function YouMayAlsoLike({ items }: { items: Recommendation[] }) {
  if (!items.length) return null;
  return <section aria-labelledby="also-like" className="border-t border-border px-4 py-12 md:px-12 md:py-16">
    <h2 id="also-like" className="mb-6 text-sm font-semibold uppercase md:mb-8">You may also like</h2>
    <ul className="scrollbar-none -mx-4 flex scroll-px-4 snap-x snap-mandatory gap-3 overflow-x-auto px-4 md:mx-0 md:grid md:grid-cols-4 md:gap-6 md:overflow-visible md:px-0">
      {items.map((item) => {
        const card = <>
          <div className="aspect-[4/5] overflow-hidden bg-background"><img src={item.image} alt={item.title} loading="lazy" className="size-full object-contain p-4 transition-transform duration-700 ease-out group-hover:scale-[1.04]" /></div>
          <p className="mt-3 truncate text-[10px] font-semibold uppercase">{item.title}</p>
          <p className="mt-1 text-[10px] uppercase text-muted-foreground">{item.price}</p>
        </>;
        return <li key={item.id} className="w-[44%] shrink-0 snap-start md:w-auto">
          {item.handle ? <Link to="/product/$handle" params={{ handle: item.handle }} className="group block">{card}</Link> : <div className="group block">{card}</div>}
        </li>;
      })}
    </ul>
  </section>;
}
