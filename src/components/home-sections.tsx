import { ProductCard, SocialProofCarousel } from "@/components/storefront";
import type { ShopifyProduct } from "@/lib/shopify";

/** The original start page content, kept intact so it can be used on its own again. */
export function ClassicHomeSections({ products, headingLevel = 1 }: { products: ShopifyProduct[]; headingLevel?: 1 | 2 }) {
  const lead = products[0];
  const hero = lead?.images.edges[1]?.node ?? lead?.images.edges[0]?.node;
  const Heading = headingLevel === 1 ? "h1" : "h2";
  return <>
    {lead && hero ? <section className="relative min-h-[calc(100svh-108px)] overflow-hidden"><img src={hero.url} alt={hero.altText ?? lead.title} className="absolute inset-0 size-full object-cover" /><div className="absolute inset-0 bg-image-shade"/><div className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-6 p-6 text-image-foreground md:p-10"><div><p className="text-[10px] font-semibold uppercase">New release</p><Heading className="mt-2 max-w-3xl font-serif text-4xl uppercase md:text-7xl">{lead.title}</Heading></div><a href="#shop" className="hidden border-b border-current pb-1 text-[10px] font-semibold uppercase md:block">Shop now</a></div></section> : <section className="grid min-h-[70vh] place-items-center"><p className="text-sm uppercase text-muted-foreground">No products found</p></section>}
    <section id="shop" className="border-t border-border"><div className="flex items-end justify-between px-4 py-7 md:px-9"><h2 className="text-sm font-semibold uppercase">Latest collection</h2><span className="text-[10px] uppercase text-muted-foreground">{String(products.length).padStart(2,"0")} pieces</span></div><div className="grid grid-cols-2 border-t border-border lg:grid-cols-3">{products.map((product) => <ProductCard key={product.id} product={product} />)}</div></section>
    <SocialProofCarousel />
    {lead?.images.edges[2]?.node && <section className="relative h-[78vh] min-h-[560px] overflow-hidden"><img src={lead.images.edges[2].node.url} alt={lead.images.edges[2].node.altText ?? lead.title} className="size-full object-cover"/><div className="absolute inset-0 bg-image-shade"/><div className="absolute inset-x-0 bottom-0 p-6 text-image-foreground md:p-10"><p className="text-[10px] font-semibold uppercase">Léa Rivoli</p><h2 className="mt-2 max-w-2xl font-serif text-4xl uppercase md:text-6xl">Avenue Montaigne</h2></div></section>}
  </>;
}
