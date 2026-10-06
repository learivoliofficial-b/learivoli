import { createFileRoute, notFound } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState } from "react";

import logo from "@/assets/biggerlog.png.asset.json";
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
  const [activeImage, setActiveImage] = useState(0);
  const mobileGalleryRef = useRef<HTMLDivElement>(null);
  const [notice, setNotice] = useState("");
  const inlineButtonRef = useRef<HTMLButtonElement>(null);
  const [showStickyBar, setShowStickyBar] = useState(false);
  const addItem = useCartStore((state) => state.addItem);
  const isLoading = useCartStore((state) => state.isLoading);

  useEffect(() => {
    const button = inlineButtonRef.current;
    if (!button || typeof IntersectionObserver === "undefined") return;
    const observer = new IntersectionObserver(([entry]) => setShowStickyBar(!entry.isIntersecting), { threshold: 0 });
    observer.observe(button);
    return () => observer.disconnect();
  }, []);
  const variant = useMemo(() => product.variants.edges.map(({ node }) => node).find((entry) => entry.selectedOptions.every((option) => selected[option.name] === option.value)), [product, selected]);
  const images = product.images.edges.map(({ node }) => node);

  const colorOptions = product.options.find((option) => option.name.toLowerCase() === "color");
  const sizeOptions = product.options.find((option) => option.name.toLowerCase() === "size");
  const otherOptions = product.options.filter((option) => !["color", "size"].includes(option.name.toLowerCase()));
  const colorImages = useMemo(() => Object.fromEntries((colorOptions?.values ?? []).map((color) => {
    const colorKey = color.toLowerCase();
    const matchingVariant = product.variants.edges.map(({ node }) => node).find((entry) => entry.selectedOptions.some((option) => option.name.toLowerCase() === "color" && option.value === color) && entry.image);
    const matchingProductImage = images.find((image) => `${image.altText ?? ""} ${image.url}`.toLowerCase().includes(colorKey === "grey" ? "gray" : colorKey));
    return [color, matchingProductImage ?? matchingVariant?.image ?? images[colorKey === "navy" ? 0 : 3] ?? images[0]];
  })), [colorOptions, images, product.variants.edges]);

  const scrollToImage = (index: number) => {
    const gallery = mobileGalleryRef.current;
    if (!gallery) return;
    gallery.scrollTo({ left: gallery.clientWidth * index, behavior: "smooth" });
  };

  const handleAdd = async () => {
    if (!variant) return;
    setNotice("");
    const added = await addItem({ product: { title: product.title, handle: product.handle, image: variant.image?.url ?? images[0]?.url ?? null }, variantId: variant.id, variantTitle: variant.title, price: variant.price, quantity: 1, selectedOptions: variant.selectedOptions });
    setNotice(added ? "Added to your cart." : "Could not add this item. Please try again.");
  };

  return <main className="min-h-screen bg-background pb-20 text-foreground lg:pb-0"><StoreHeader />
    <div className="grid lg:grid-cols-[minmax(0,1.55fr)_minmax(360px,0.75fr)]">
      <div>
        <div ref={mobileGalleryRef} className="flex snap-x snap-mandatory overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden lg:hidden" onScroll={(event) => { const width = event.currentTarget.clientWidth; if (width) setActiveImage(Math.round(event.currentTarget.scrollLeft / width)); }}>
          {images.map((image, index) => <div key={image.url} className="w-full shrink-0 snap-center bg-muted"><img src={image.url} alt={image.altText ?? `${product.title} view ${index + 1}`} className="aspect-[4/5] size-full object-cover" /></div>)}
        </div>
        <div className="flex h-10 items-center justify-center gap-2 lg:hidden" aria-label={`Image ${activeImage + 1} of ${images.length}`}>
          {images.map((image, index) => <Button key={image.url} type="button" variant="ghost" size="icon" aria-label={`View image ${index + 1}`} onClick={() => scrollToImage(index)} className="size-5 rounded-full p-0"><span className={`block size-1.5 rounded-full transition-transform ${activeImage === index ? "scale-125 bg-foreground" : "bg-border"}`} /></Button>)}
        </div>
        <div className="hidden bg-border lg:grid lg:grid-cols-1 lg:gap-px">{images.map((image, index) => <div key={image.url} className="bg-muted"><img src={image.url} alt={image.altText ?? `${product.title} view ${index + 1}`} className="aspect-[4/5] size-full object-cover" /></div>)}</div>
      </div>
      <section className="px-5 py-9 lg:sticky lg:top-[76px] lg:h-[calc(100svh-76px)] lg:overflow-y-auto lg:px-10 lg:py-12">
        <p className="text-[10px] font-semibold uppercase text-muted-foreground">{product.productType}</p><h1 className="mt-3 font-serif text-3xl uppercase md:text-4xl">{product.title}</h1><p className="mt-4 text-sm">{variant ? formatMoney(variant.price.amount, variant.price.currencyCode) : formatMoney(product.priceRange.minVariantPrice.amount, product.priceRange.minVariantPrice.currencyCode)}</p>
        <div className="mt-10 space-y-7">
          {colorOptions && <fieldset><legend className="mb-3 text-[10px] font-semibold uppercase">Color: <span className="font-normal text-muted-foreground">{selected[colorOptions.name]}</span></legend><div className="flex flex-wrap gap-3">{colorOptions.values.map((color) => { const image = colorImages[color]; const isSelected = selected[colorOptions.name] === color; return <Button key={color} type="button" variant="ghost" aria-label={`Select ${color}`} aria-pressed={isSelected} className={`h-auto w-20 flex-col gap-2 rounded-none p-0 text-[9px] uppercase hover:bg-transparent ${isSelected ? "text-foreground" : "text-muted-foreground"}`} onClick={() => setSelected((current) => ({ ...current, [colorOptions.name]: color }))}><span className={`block aspect-square w-full overflow-hidden border bg-muted ${isSelected ? "border-foreground ring-1 ring-foreground" : "border-border"}`}>{image && <img src={image.url} alt={`${color} ${product.title}`} className="size-full object-contain" />}</span><span>{color}</span></Button>; })}</div></fieldset>}
          {sizeOptions && <fieldset><legend className="mb-3 text-[10px] font-semibold uppercase">Size: <span className="font-normal text-muted-foreground">{selected[sizeOptions.name]}</span></legend><div className="flex flex-wrap gap-2">{sizeOptions.values.map((size) => { const isSelected = selected[sizeOptions.name] === size; return <Button key={size} type="button" variant="outline" aria-pressed={isSelected} className={`size-12 rounded-none border bg-background p-0 uppercase shadow-none ${isSelected ? "border-primary bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground" : "border-border hover:border-foreground hover:bg-background"}`} onClick={() => setSelected((current) => ({ ...current, [sizeOptions.name]: size }))}>{size}</Button>; })}</div></fieldset>}
          {otherOptions.map((option) => <fieldset key={option.name}><legend className="mb-3 text-[10px] font-semibold uppercase">{option.name}: <span className="font-normal text-muted-foreground">{selected[option.name]}</span></legend><div className="flex flex-wrap gap-2">{option.values.map((value) => <Button key={value} type="button" variant={selected[option.name] === value ? "default" : "outline"} className="min-w-14 rounded-none uppercase" onClick={() => setSelected((current) => ({ ...current, [option.name]: value }))}>{value}</Button>)}</div></fieldset>)}
        </div>
        <Button ref={inlineButtonRef} className="mt-9 h-13 w-full rounded-none uppercase" disabled={!variant?.availableForSale || isLoading} onClick={() => void handleAdd()}>{isLoading ? "Adding…" : variant?.availableForSale ? "Add to cart" : "Sold out"}</Button>{notice && <p className="mt-3 text-center text-xs" role="status">{notice}</p>}
        <Accordion type="single" collapsible className="mt-9 border-t border-border"><AccordionItem value="description"><AccordionTrigger className="text-[10px] uppercase">Description</AccordionTrigger><AccordionContent><div className="product-description space-y-3 text-xs leading-6 text-muted-foreground" dangerouslySetInnerHTML={{ __html: product.descriptionHtml }} /></AccordionContent></AccordionItem><AccordionItem value="shipping"><AccordionTrigger className="text-[10px] uppercase">Shipping & returns</AccordionTrigger><AccordionContent><p className="text-xs leading-6 text-muted-foreground">Shipping rates and delivery estimates are shown at checkout. Returns are accepted according to the store's current return policy.</p></AccordionContent></AccordionItem></Accordion>
      </section>
    </div>
    <section className="border-t border-border bg-background">
      {images.at(-1) && <div className="mx-auto max-w-3xl"><img src={images.at(-1)?.url} alt={images.at(-1)?.altText ?? "The Léa Rivoli story"} className="aspect-[4/5] w-full object-cover" /></div>}
      <div className="mx-auto max-w-2xl px-6 py-16 text-center md:py-24">
        <h2 className="text-4xl uppercase md:text-5xl">Our Story</h2>
        <p className="mx-auto mt-5 max-w-xl font-serif text-base italic leading-7 text-muted-foreground">Life is not measured by what we have, but by what we remember. The places we discover, the people we meet, the moments we never want to forget. Léa Rivoli was created as a reminder to slow down, look around, and appreciate the beauty of simply being here. Because perhaps the finest things in life are not things at all. L’ART DE VIVRE.</p>
        <img src={logo.url} alt="Léa Rivoli" className="mx-auto mt-14 w-52" />
        <p className="mt-2 text-xs font-bold uppercase">L’Art de vivre.</p>
      </div>
    </section>
    <StoreFooter />
  </main>;
}