import { cutouts } from "@/lib/cutouts";
import { formatMoney, type ShopifyProduct } from "@/lib/shopify";

export interface Recommendation { id: string; title: string; price: string; image: string; handle: string | null }

/** Other real products first (never the one being viewed). */
export function buildRecommendations(products: ShopifyProduct[], currentHandle: string, count = 4): Recommendation[] {
  const real = products.filter((p) => p.handle !== currentHandle).flatMap<Recommendation>((p) => {
    const image = cutouts[p.handle] ?? p.images.edges[0]?.node.url;
    if (!image) return [];
    const { amount, currencyCode } = p.priceRange.minVariantPrice;
    return [{ id: p.id, title: p.title, price: formatMoney(amount, currencyCode), image, handle: p.handle }];
  });
  return real.slice(0, count);
}
