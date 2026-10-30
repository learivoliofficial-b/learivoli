/** Number of items in the cart that unlocks free shipping. Keep in sync with the announcement bar and Shopify shipping settings. */
export const FREE_SHIPPING_ITEMS = 2;

export function freeShippingProgress(itemCount: number) {
  const remaining = Math.max(0, FREE_SHIPPING_ITEMS - itemCount);
  return { remaining, unlocked: remaining === 0, percent: Math.min(100, Math.round((itemCount / FREE_SHIPPING_ITEMS) * 100)) };
}
