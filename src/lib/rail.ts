import railCrewneckGreySide from "@/assets/rail-crewneck-grey-side.webp";
import railCrewneckGrey from "@/assets/rail-crewneck-grey.webp";
import railHoodieBlackSide from "@/assets/rail-hoodie-black-side.webp";
import railHoodieBlack from "@/assets/rail-hoodie-black.webp";
import railHoodieCreamSide from "@/assets/rail-hoodie-cream-side.webp";
import railHoodieCream from "@/assets/rail-hoodie-cream.webp";
import railTshirtWhiteSide from "@/assets/rail-tshirt-white-side.webp";
import railTshirtWhite from "@/assets/rail-tshirt-white.webp";
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

/**
 * Hanger photos kept in the project for products whose Shopify images are not tagged yet.
 * Tagged Shopify images ("galge-fram" / "galge-sida") always win over these.
 */
const localHangerImages: Record<string, { front: string; side: string }> = {
  "l-ange-gardien-t-shirt": { front: railTshirtWhite, side: railTshirtWhiteSide },
};

export function pickRailImages(product: ShopifyProduct) {
  const images = product.images.edges.map(({ node }) => node);
  const tagged = (tag: string) => images.find((image) => image.altText?.toLowerCase().includes(tag)) ?? null;
  return { front: tagged(RAIL_FRONT_TAG) ?? images[0] ?? null, side: tagged(RAIL_SIDE_TAG) };
}

/** Real products first, then temporary placeholders until the rail has enough garments. */
export function buildRailItems(products: ShopifyProduct[], minimum = 4): RailItem[] {
  const real = products.flatMap<RailItem>((product) => {
    const images = product.images.edges.map(({ node }) => node);
    const tagged = (tag: string) => images.find((image) => image.altText?.toLowerCase().includes(tag))?.url ?? null;
    const local = localHangerImages[product.handle];
    const taggedFront = tagged(RAIL_FRONT_TAG);
    const front = taggedFront ?? local?.front ?? images[0]?.url ?? null;
    if (!front) return [];
    const side = tagged(RAIL_SIDE_TAG) ?? (taggedFront ? null : local?.side ?? null);
    const { amount, currencyCode } = product.priceRange.minVariantPrice;
    return [{ id: product.id, title: product.title, price: formatMoney(amount, currencyCode), front, side, handle: product.handle }];
  });
  void minimum; void placeholders;
  return real;
}
