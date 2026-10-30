import railCrewneckGreySide from "@/assets/rail-crewneck-grey-side.jpg";
import railCrewneckGrey from "@/assets/rail-crewneck-grey.jpg";
import railHoodieBlackSide from "@/assets/rail-hoodie-black-side.jpg";
import railHoodieBlack from "@/assets/rail-hoodie-black.jpg";
import railHoodieCreamSide from "@/assets/rail-hoodie-cream-side.jpg";
import railHoodieCream from "@/assets/rail-hoodie-cream.jpg";
import { formatMoney, type ShopifyProduct } from "@/lib/shopify";

/** Alt text tags a Shopify product image needs to be used on the clothing rail. */
export const RAIL_FRONT_TAG = "galge-fram";
export const RAIL_SIDE_TAG = "galge-sida";

export interface RailItem {
  id: string;
  title: string;
  price: string | null;
  /** Garment seen from the front, on a hanger, white background. */
  front: string;
  /** Garment seen from the side, on a hanger, white background. Null = fake it from the front image. */
  side: string | null;
  /** Shopify handle; null for temporary placeholder garments. */
  handle: string | null;
}

const placeholders: Omit<RailItem, "id">[] = [
  { title: "Hoodie — Cream", price: null, front: railHoodieCream, side: railHoodieCreamSide, handle: null },
  { title: "Zip Hoodie — Black", price: null, front: railHoodieBlack, side: railHoodieBlackSide, handle: null },
  { title: "Crewneck — Grey", price: null, front: railCrewneckGrey, side: railCrewneckGreySide, handle: null },
];

export function pickRailImages(product: ShopifyProduct) {
  const images = product.images.edges.map(({ node }) => node);
  const tagged = (tag: string) => images.find((image) => image.altText?.toLowerCase().includes(tag)) ?? null;
  return { front: tagged(RAIL_FRONT_TAG) ?? images[0] ?? null, side: tagged(RAIL_SIDE_TAG) };
}

/** Real products first, then temporary placeholders until the rail has enough garments. */
export function buildRailItems(products: ShopifyProduct[], minimum = 4): RailItem[] {
  const real = products.flatMap<RailItem>((product) => {
    const { front, side } = pickRailImages(product);
    if (!front) return [];
    const { amount, currencyCode } = product.priceRange.minVariantPrice;
    return [{ id: product.id, title: product.title, price: formatMoney(amount, currencyCode), front: front.url, side: side?.url ?? null, handle: product.handle }];
  });
  const missing = Math.max(0, minimum - real.length);
  const fill = Array.from({ length: missing }, (_, index): RailItem => ({ ...placeholders[index % placeholders.length]!, id: `placeholder-${index}` }));
  return [...real, ...fill];
}
