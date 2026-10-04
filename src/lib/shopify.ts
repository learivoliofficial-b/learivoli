export const SHOPIFY_API_VERSION = "2025-07";
export const SHOPIFY_STORE_DOMAIN = "wr50u2-2y.myshopify.com";
export const SHOPIFY_STOREFRONT_TOKEN = "0d53dce6e1d226851d0c103135ce4836";

const STOREFRONT_URL = `https://${SHOPIFY_STORE_DOMAIN}/api/${SHOPIFY_API_VERSION}/graphql.json`;

export interface ShopifyImage {
  url: string;
  altText: string | null;
  width?: number;
  height?: number;
}

export interface ShopifyVariant {
  id: string;
  title: string;
  availableForSale: boolean;
  selectedOptions: Array<{ name: string; value: string }>;
  price: { amount: string; currencyCode: string };
  image: ShopifyImage | null;
}

export interface ShopifyProduct {
  id: string;
  title: string;
  description: string;
  descriptionHtml: string;
  handle: string;
  productType: string;
  images: { edges: Array<{ node: ShopifyImage }> };
  variants: { edges: Array<{ node: ShopifyVariant }> };
  options: Array<{ name: string; values: string[] }>;
  priceRange: { minVariantPrice: { amount: string; currencyCode: string } };
}

type StorefrontResponse<T> = { data?: T; errors?: Array<{ message: string }> };

export async function storefrontApiRequest<T>(query: string, variables: Record<string, unknown> = {}) {
  const response = await fetch(STOREFRONT_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Shopify-Storefront-Access-Token": SHOPIFY_STOREFRONT_TOKEN,
    },
    body: JSON.stringify({ query, variables }),
  });

  if (!response.ok) throw new Error(`Shopify request failed (${response.status})`);
  const result = (await response.json()) as StorefrontResponse<T>;
  if (result.errors?.length) throw new Error(result.errors.map((error) => error.message).join(", "));
  if (!result.data) throw new Error("Shopify returned no data");
  return result.data;
}

const PRODUCT_FIELDS = `
  id title description descriptionHtml handle productType
  priceRange { minVariantPrice { amount currencyCode } }
  images(first: 20) { edges { node { url altText width height } } }
  options { name values }
  variants(first: 100) { edges { node {
    id title availableForSale selectedOptions { name value }
    price { amount currencyCode }
    image { url altText width height }
  } } }
`;

export async function getProducts() {
  const data = await storefrontApiRequest<{ products: { edges: Array<{ node: ShopifyProduct }> } }>(
    `query StoreProducts { products(first: 50) { edges { node { ${PRODUCT_FIELDS} } } } }`,
  );
  return data.products.edges.map(({ node }) => node);
}

export async function getProductByHandle(handle: string) {
  const data = await storefrontApiRequest<{ product: ShopifyProduct | null }>(
    `query ProductByHandle($handle: String!) { product(handle: $handle) { ${PRODUCT_FIELDS} } }`,
    { handle },
  );
  return data.product;
}

export function formatMoney(amount: string, currencyCode: string) {
  return new Intl.NumberFormat("sv-SE", {
    style: "currency",
    currency: currencyCode,
    maximumFractionDigits: 0,
  }).format(Number(amount));
}

export function formatCheckoutUrl(checkoutUrl: string) {
  try {
    const url = new URL(checkoutUrl);
    url.searchParams.set("channel", "online_store");
    return url.toString();
  } catch {
    return checkoutUrl;
  }
}