import { Link } from "@tanstack/react-router";

import { StoreFooter, StoreHeader } from "@/components/storefront";
import tshirtCutout from "@/assets/tshirt-cutout.webp";
import homeHero from "@/assets/home-hero.webp";
import { formatMoney, type ShopifyProduct } from "@/lib/shopify";

/** Background-free product photos kept in the project until Shopify has cut-outs. */
const cutouts: Record<string, string> = { "l-ange-gardien-t-shirt": tshirtCutout };

/** Start page layout: full-screen hero, New Arrivals row, giant wordmark footer. */
export function DropHome({ products, heroImage }: { products: ShopifyProduct[]; heroImage?: string }) {
  const lead = products[0];
  const hero = heroImage ?? homeHero ?? lead?.images.edges[0]?.node.url;
  return <main className="min-h-screen bg-background text-foreground">
    <StoreHeader />
    <section className="relative -mt-[76px] h-svh min-h-[560px] overflow-hidden bg-ink">
      {hero && <img src={hero} alt="Léa Rivoli new drop" className="absolute inset-0 size-full object-cover" />}
      <div className="absolute inset-0 bg-image-shade" />
      <h1 className="absolute inset-x-0 top-1/2 -translate-y-1/2 px-4 text-center text-[13vw] font-bold uppercase leading-none tracking-tight text-image-foreground md:text-[9vw]">Léa Rivoli</h1>
      <div className="absolute bottom-8 left-6 text-image-foreground md:bottom-10 md:left-10">
        <p className="text-[11px] font-semibold uppercase">New drop out now</p>
        <a href="#new-arrivals" className="mt-3 inline-block border border-current px-4 py-2 text-[10px] font-semibold uppercase transition-colors hover:bg-image-foreground hover:text-foreground">Shop all</a>
      </div>
    </section>
    <section id="new-arrivals" className="px-4 py-12 md:px-10 md:py-16">
      <h2 className="text-sm font-semibold uppercase">New arrivals</h2>
      <p className="mt-1 text-[11px] text-muted-foreground">The latest pieces from Léa Rivoli.</p>
      <div className="mt-8 grid grid-cols-2 gap-x-4 gap-y-10 md:grid-cols-3 md:gap-x-8">
        {products.map((product) => {
          const image = product.images.edges[0]?.node;
          return <Link key={product.id} to="/product/$handle" params={{ handle: product.handle }} className="group">
            <div className="aspect-square overflow-hidden">{(cutouts[product.handle] ?? image) && <img src={cutouts[product.handle] ?? image?.url} alt={image?.altText ?? product.title} className="size-full object-contain p-6 mix-blend-multiply transition-transform duration-700 group-hover:scale-[1.03]" />}</div>
            <h3 className="mt-4 text-xs font-semibold uppercase md:text-sm">{product.title}</h3>
            <p className="mt-1.5 text-xs text-muted-foreground md:text-sm">{formatMoney(product.priceRange.minVariantPrice.amount, product.priceRange.minVariantPrice.currencyCode)}</p>
          </Link>;
        })}
      </div>
    </section>
    <StoreFooter />
    <p aria-hidden className="overflow-hidden whitespace-nowrap px-2 pb-2 text-center text-[16vw] font-bold uppercase leading-[0.85] tracking-tight">Léa Rivoli</p>
  </main>;
}
