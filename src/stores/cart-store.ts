import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

import { formatCheckoutUrl, storefrontApiRequest, type ShopifyVariant } from "@/lib/shopify";

export interface CartItem {
  lineId: string | null;
  product: { title: string; handle: string; image: string | null };
  variantId: string;
  variantTitle: string;
  price: ShopifyVariant["price"];
  quantity: number;
  selectedOptions: ShopifyVariant["selectedOptions"];
}

interface CartStore {
  items: CartItem[];
  cartId: string | null;
  checkoutUrl: string | null;
  isLoading: boolean;
  isSyncing: boolean;
  hydrated: boolean;
  setHydrated: () => void;
  addItem: (item: Omit<CartItem, "lineId">) => Promise<boolean>;
  updateQuantity: (variantId: string, quantity: number) => Promise<void>;
  removeItem: (variantId: string) => Promise<void>;
  clearCart: () => void;
  syncCart: () => Promise<void>;
}

const CART_QUERY = `query Cart($id: ID!) { cart(id: $id) { id totalQuantity checkoutUrl } }`;
const CART_CREATE = `mutation CartCreate($input: CartInput!) { cartCreate(input: $input) { cart { id checkoutUrl lines(first: 100) { edges { node { id merchandise { ... on ProductVariant { id } } } } } } userErrors { field message } } }`;
const CART_ADD = `mutation CartAdd($cartId: ID!, $lines: [CartLineInput!]!) { cartLinesAdd(cartId: $cartId, lines: $lines) { cart { id checkoutUrl lines(first: 100) { edges { node { id merchandise { ... on ProductVariant { id } } } } } } userErrors { field message } } }`;
const CART_UPDATE = `mutation CartUpdate($cartId: ID!, $lines: [CartLineUpdateInput!]!) { cartLinesUpdate(cartId: $cartId, lines: $lines) { cart { id checkoutUrl } userErrors { field message } } }`;
const CART_REMOVE = `mutation CartRemove($cartId: ID!, $lineIds: [ID!]!) { cartLinesRemove(cartId: $cartId, lineIds: $lineIds) { cart { id checkoutUrl } userErrors { field message } } }`;

type UserError = { field: string[] | null; message: string };
type CartLine = { node: { id: string; merchandise: { id: string } } };

function cartMissing(errors: UserError[]) {
  return errors.some(({ message }) => /cart not found|does not exist/i.test(message));
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [], cartId: null, checkoutUrl: null, isLoading: false, isSyncing: false, hydrated: false,
      setHydrated: () => set({ hydrated: true }),
      clearCart: () => set({ items: [], cartId: null, checkoutUrl: null }),
      addItem: async (item) => {
        set({ isLoading: true });
        try {
          const state = get();
          const existing = state.items.find((entry) => entry.variantId === item.variantId);
          if (!state.cartId) {
            const data = await storefrontApiRequest<{ cartCreate: { cart: { id: string; checkoutUrl: string; lines: { edges: CartLine[] } } | null; userErrors: UserError[] } }>(CART_CREATE, { input: { lines: [{ merchandiseId: item.variantId, quantity: item.quantity }] } });
            const cart = data.cartCreate.cart;
            const lineId = cart?.lines.edges[0]?.node.id;
            if (!cart || !lineId || data.cartCreate.userErrors.length) return false;
            set({ cartId: cart.id, checkoutUrl: formatCheckoutUrl(cart.checkoutUrl), items: [{ ...item, lineId }] });
            return true;
          }
          if (existing?.lineId) {
            const quantity = existing.quantity + item.quantity;
            const data = await storefrontApiRequest<{ cartLinesUpdate: { userErrors: UserError[] } }>(CART_UPDATE, { cartId: state.cartId, lines: [{ id: existing.lineId, quantity }] });
            if (cartMissing(data.cartLinesUpdate.userErrors)) get().clearCart();
            if (data.cartLinesUpdate.userErrors.length) return false;
            set({ items: get().items.map((entry) => entry.variantId === item.variantId ? { ...entry, quantity } : entry) });
            return true;
          }
          const data = await storefrontApiRequest<{ cartLinesAdd: { cart: { checkoutUrl: string; lines: { edges: CartLine[] } } | null; userErrors: UserError[] } }>(CART_ADD, { cartId: state.cartId, lines: [{ merchandiseId: item.variantId, quantity: item.quantity }] });
          if (cartMissing(data.cartLinesAdd.userErrors)) get().clearCart();
          if (data.cartLinesAdd.userErrors.length) return false;
          const lineId = data.cartLinesAdd.cart?.lines.edges.find(({ node }) => node.merchandise.id === item.variantId)?.node.id ?? null;
          set({ items: [...get().items, { ...item, lineId }], checkoutUrl: data.cartLinesAdd.cart ? formatCheckoutUrl(data.cartLinesAdd.cart.checkoutUrl) : state.checkoutUrl });
          return true;
        } catch (error) {
          console.error("Failed to add Shopify cart item", error);
          return false;
        } finally { set({ isLoading: false }); }
      },
      updateQuantity: async (variantId, quantity) => {
        if (quantity <= 0) return get().removeItem(variantId);
        const state = get();
        const item = state.items.find((entry) => entry.variantId === variantId);
        if (!item?.lineId || !state.cartId) return;
        set({ isLoading: true });
        try {
          const data = await storefrontApiRequest<{ cartLinesUpdate: { userErrors: UserError[] } }>(CART_UPDATE, { cartId: state.cartId, lines: [{ id: item.lineId, quantity }] });
          if (cartMissing(data.cartLinesUpdate.userErrors)) get().clearCart();
          else if (!data.cartLinesUpdate.userErrors.length) set({ items: get().items.map((entry) => entry.variantId === variantId ? { ...entry, quantity } : entry) });
        } finally { set({ isLoading: false }); }
      },
      removeItem: async (variantId) => {
        const state = get();
        const item = state.items.find((entry) => entry.variantId === variantId);
        if (!item?.lineId || !state.cartId) return;
        set({ isLoading: true });
        try {
          const data = await storefrontApiRequest<{ cartLinesRemove: { userErrors: UserError[] } }>(CART_REMOVE, { cartId: state.cartId, lineIds: [item.lineId] });
          if (cartMissing(data.cartLinesRemove.userErrors)) get().clearCart();
          else if (!data.cartLinesRemove.userErrors.length) {
            const items = get().items.filter((entry) => entry.variantId !== variantId);
            if (!items.length) get().clearCart(); else set({ items });
          }
        } finally { set({ isLoading: false }); }
      },
      syncCart: async () => {
        const { cartId, isSyncing } = get();
        if (!cartId || isSyncing) return;
        set({ isSyncing: true });
        try {
          const data = await storefrontApiRequest<{ cart: { totalQuantity: number; checkoutUrl: string } | null }>(CART_QUERY, { id: cartId });
          if (!data.cart || data.cart.totalQuantity === 0) get().clearCart();
          else set({ checkoutUrl: formatCheckoutUrl(data.cart.checkoutUrl) });
        } catch (error) { console.error("Failed to sync Shopify cart", error); }
        finally { set({ isSyncing: false }); }
      },
    }),
    {
      name: "lea-rivoli-shopify-cart",
      storage: createJSONStorage(() => localStorage),
      partialize: ({ items, cartId, checkoutUrl }) => ({ items, cartId, checkoutUrl }),
      onRehydrateStorage: () => (state) => state?.setHydrated(),
    },
  ),
);