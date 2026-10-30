import railCrewneckGrey from "@/assets/rail-crewneck-grey.jpg";
import railHoodieBlack from "@/assets/rail-hoodie-black.jpg";
import railHoodieCream from "@/assets/rail-hoodie-cream.jpg";
import { formatMoney, type ShopifyProduct } from "@/lib/shopify";

/** Alt text a Shopify product image needs to be used on the clothing rail. */
export const RAIL_IMAGE_TAG = "galge-fram";

export interface RailItem {
  id: string;
  title: string;
  price: string | null;
  image: string;
  /** Shopify handle; null for temporary placeholder garments. */
  handle: string | null;
}

const placeholders: RailItem[] = [
  { id: "placeholder-cream", title: "Hoodie — Cream", price: null, image: railHoodieCream, handle: null },
  { id: "placeholder-black", title: "Zip Hoodie — Black", price: null, image: railHoodieBlack, handle: null },
  { id: "placeholder-grey", title: "Crewneck — Grey", price: null, image: railCrewneckGrey, handle: null },
];

export function pickRailImage(product: ShopifyProduct) {
  const images = product.images.edges.map(({ node }) => node);
  return images.find((image) => image.altText?.toLowerCase().includes(RAIL_IMAGE_TAG)) ?? images[0] ?? null;
}

/** Real products first, then temporary placeholders until the rail has enough garments. */
export function buildRailItems(products: ShopifyProduct[], minimum = 4): RailItem[] {
  const real = products.flatMap<RailItem>((product) => {
    const image = pickRailImage(product);
    if (!image) return [];
    const { amount, currencyCode } = product.priceRange.minVariantPrice;
    return [{ id: product.id, title: product.title, price: formatMoney(amount, currencyCode), image: image.url, handle: product.handle }];
  });
  const fill = placeholders.slice(0, Math.max(0, minimum - real.length));
  return [...real, ...fill];
}
