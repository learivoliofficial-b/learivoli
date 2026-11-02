import railCrewneckGrey from "@/assets/rail-crewneck-grey.webp";
import railHoodieBlack from "@/assets/rail-hoodie-black.webp";
import { formatMoney, type ShopifyProduct } from "@/lib/shopify";

export interface Recommendation { id: string; title: string; price: string; image: string; handle: string | null }

/** Temporary made-up products shown until the Shopify store has enough real ones. */
const demoProducts: Omit<Recommendation, "id">[] = [
  { title: "Rive Gauche Zip Hoodie — Black", price: "999 kr", image: railHoodieBlack, handle: null },
  { title: "Saint-Germain Crewneck — Grey", price: "799 kr", image: railCrewneckGrey, handle: null },
];

/** Other real products first (never the one being viewed), topped up with demo products. */
export function buildRecommendations(products: ShopifyProduct[], currentHandle: string, count = 4): Recommendation[] {
  const real = products.filter((p) => p.handle !== currentHandle).flatMap<Recommendation>((p) => {
    const image = p.images.edges[0]?.node.url;
    if (!image) return [];
    const { amount, currencyCode } = p.priceRange.minVariantPrice;
    return [{ id: p.id, title: p.title, price: formatMoney(amount, currencyCode), image, handle: p.handle }];
  });
  const fill = demoProducts.slice(0, Math.max(0, count - real.length)).map((d, i) => ({ ...d, id: `demo-${i}` }));
  return [...real, ...fill].slice(0, count);
}
