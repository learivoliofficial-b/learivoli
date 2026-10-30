import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { ChevronLeft, ShoppingBag } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";

import brandLogo from "@/assets/logowithslogo-2.png";
import { SocialProofCarousel, StoreFooter, StoreHeader } from "@/components/storefront";
import { Button } from "@/components/ui/button";
import { pickRailImages, RAIL_SIDE_TAG } from "@/lib/rail";
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

  const colorPicker = colorOptions && <fieldset><legend className="mb-2 text-[9px] font-semibold uppercase">Color: <span className="font-normal text-muted-foreground">{selected[colorOptions.name]}</span></legend><div className="flex flex-wrap gap-2 lg:justify-end">{colorOptions.values.map((color) => { const image = colorImages[color]; const isSelected = selected[colorOptions.name] === color; return <Button key={color} type="button" variant="ghost" aria-label={`Select ${color}`} aria-pressed={isSelected} className="h-auto w-12 rounded-none p-0 hover:bg-transparent" onClick={() => setSelected((current) => ({ ...current, [colorOptions.name]: color }))}><span className={`block aspect-square w-full overflow-hidden border bg-muted ${isSelected ? "border-foreground ring-1 ring-foreground" : "border-border"}`}>{image && <img src={image.url} alt={`${color} ${product.title}`} className="size-full object-contain" />}</span></Button>; })}</div></fieldset>;
  const sizePicker = sizeOptions && <fieldset><legend className="mb-2 flex w-full justify-between text-[9px] font-semibold uppercase"><span>Size</span><span className="font-normal text-muted-foreground">{selected[sizeOptions.name]}</span></legend><div className="flex flex-wrap gap-1.5 lg:justify-end">{sizeOptions.values.map((size) => { const isSelected = selected[sizeOptions.name] === size; return <Button key={size} type="button" variant="outline" aria-pressed={isSelected} className={`size-10 rounded-none border bg-background p-0 text-[10px] uppercase shadow-none ${isSelected ? "border-primary bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground" : "border-border hover:border-foreground hover:bg-background"}`} onClick={() => setSelected((current) => ({ ...current, [sizeOptions.name]: size }))}>{size}</Button>; })}</div></fieldset>;
  const otherPickers = otherOptions.map((option) => <fieldset key={option.name}><legend className="mb-2 text-[9px] font-semibold uppercase">{option.name}</legend><div className="flex flex-wrap gap-1.5 lg:justify-end">{option.values.map((value) => <Button key={value} type="button" variant={selected[option.name] === value ? "default" : "outline"} className="h-10 min-w-10 rounded-none text-[10px] uppercase" onClick={() => setSelected((current) => ({ ...current, [option.name]: value }))}>{value}</Button>)}</div></fieldset>);
  const addButton = <Button ref={inlineButtonRef} className="h-11 w-full rounded-none text-[10px] uppercase" disabled={!variant?.availableForSale || isLoading} onClick={() => void handleAdd()}><ShoppingBag className="size-3.5" />{isLoading ? "Adding…" : variant?.availableForSale ? "Add to cart" : "Sold out"}</Button>;

  return <main className="min-h-screen bg-rail pb-20 text-foreground lg:pb-0"><StoreHeader />
    <section className="relative lg:grid lg:grid-cols-[minmax(0,1fr)_minmax(0,1.4fr)_minmax(0,1fr)] lg:gap-8 lg:px-12">
      {/* Left: back, title, description — stays put while the images scroll */}
      <div className="hidden lg:sticky lg:top-[107px] lg:flex lg:h-[calc(100svh-107px)] lg:min-w-0 lg:flex-col lg:justify-center">
        <Link to="/" className="inline-flex items-center gap-1 text-[10px] uppercase text-muted-foreground hover:text-foreground"><ChevronLeft className="size-3" />Back</Link>
        <h1 className="mt-4 max-w-xs text-xl font-semibold uppercase leading-tight">{product.title}</h1>
        <p className="mt-4 line-clamp-[12] max-w-xs overflow-hidden whitespace-pre-line break-words text-[11px] leading-5 text-muted-foreground">{product.description}</p>
      </div>

      {/* Center: images stacked, scroll down to see more */}
      <div className="hidden min-w-0 lg:block">
        {showcase.map((image, index) => <div key={image.url} className="flex h-[calc(100svh-107px)] items-center justify-center"><img src={image.url} alt={image.altText ?? `${product.title} view ${index + 1}`} loading={index === 0 ? "eager" : "lazy"} className={`max-h-[78%] w-auto max-w-full object-contain brightness-[1.05] ${index === 0 ? "garment-drop" : ""}`} /></div>)}
      </div>

      {/* Mobile: swipe sideways between full-square photos */}
      <div className="relative lg:hidden">
        <Link to="/" aria-label="Back to the rail" className="absolute left-3 top-3 z-10 grid size-9 place-items-center rounded-full bg-background/80"><ChevronLeft className="size-4" /></Link>
        <div ref={galleryRef} onScroll={onGalleryScroll} className="scrollbar-none flex snap-x snap-mandatory overflow-x-auto overscroll-x-contain">
          {showcase.map((image, index) => <div key={image.url} className="aspect-square w-full shrink-0 snap-center snap-always overflow-hidden"><img src={image.url} alt={image.altText ?? `${product.title} view ${index + 1}`} loading={index === 0 ? "eager" : "lazy"} draggable={false} className={`size-full object-cover ${index === 0 ? "scale-[1.18]" : ""}`} /></div>)}
        </div>
        {showcase.length > 1 && <div className="absolute bottom-3 left-1/2 flex -translate-x-1/2 justify-center gap-1.5 rounded-full bg-background/80 px-2 py-1.5" aria-hidden>{showcase.map((image, index) => <span key={image.url} className={`h-1.5 rounded-full transition-all duration-300 ${index === slide ? "w-6 bg-foreground" : "w-1.5 bg-foreground/30"}`} />)}</div>}
      </div>

      {/* Right: price, options, add to cart — stays put on desktop */}
      <div className="space-y-5 px-5 pt-6 lg:sticky lg:top-[107px] lg:ml-auto lg:flex lg:h-[calc(100svh-107px)] lg:w-full lg:max-w-[280px] lg:flex-col lg:justify-center lg:space-y-5 lg:px-0 lg:pt-0 lg:text-right">
        <div className="lg:hidden"><h1 className="text-lg font-semibold uppercase leading-tight">{product.title}</h1><p className="mt-1 text-sm">{price}</p></div>
        <p className="hidden text-sm lg:block">{price}</p>
        {colorPicker}
        {sizePicker}
        {otherPickers}
        {addButton}
        {notice && <p className="text-center text-xs lg:text-right" role="status">{notice}</p>}
        <div className="product-description space-y-1 break-words text-[11px] leading-5 text-muted-foreground lg:hidden" dangerouslySetInnerHTML={{ __html: product.descriptionHtml }} />
      </div>

    </section>
    <SocialProofCarousel />
    <section className="border-t border-border bg-background">
      {images.at(-1) && <div className="mx-auto max-w-3xl"><img src={images.at(-1)?.url} alt={images.at(-1)?.altText ?? "The Léa Rivoli story"} className="aspect-[4/5] w-full object-cover" /></div>}
      <div className="mx-auto max-w-2xl px-6 py-16 text-center md:py-24">
        <h2 className="text-4xl uppercase md:text-5xl">Our Story</h2>
        <p className="mx-auto mt-5 max-w-xl font-serif text-base italic leading-7 text-muted-foreground">Life is not measured by what we have, but by what we remember. The places we discover, the people we meet, the moments we never want to forget. Léa Rivoli was created as a reminder to slow down, look around, and appreciate the beauty of simply being here. Because perhaps the finest things in life are not things at all. L’ART DE VIVRE.</p>
        <img src={brandLogo} alt="Léa Rivoli — L’Art de vivre." className="mx-auto mt-12 w-72 md:w-96" />
      </div>
    </section>
    <div className={`fixed inset-x-0 bottom-0 z-40 border-t border-border bg-background/95 pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-3 backdrop-blur transition-transform duration-300 lg:hidden ${showStickyBar ? "translate-y-0" : "translate-y-full"}`} aria-hidden={!showStickyBar}>
      <div className="px-4">
        <Button className="h-13 w-full rounded-none uppercase" disabled={!variant?.availableForSale || isLoading} tabIndex={showStickyBar ? 0 : -1} onClick={() => void handleAdd()}>{isLoading ? "Adding…" : variant?.availableForSale ? <>Add to cart — {formatMoney(variant.price.amount, variant.price.currencyCode)}</> : "Sold out"}</Button>
      </div>
    </div>
    <StoreFooter />
  </main>;
}