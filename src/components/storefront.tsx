import { Link } from "@tanstack/react-router";
import { ChevronLeft, ChevronRight, Menu, Minus, Plus, Search, ShoppingBag, Trash2, X } from "lucide-react";
import { useEffect, useRef, useState, type ReactNode } from "react";

import ugcChalet from "@/assets/ugc-chalet.webp";
import ugcStreet from "@/assets/ugc-street.png";
import ugcSubway from "@/assets/ugc-subway.png";
import logo from "@/assets/biggerlog.png";
import { Button } from "@/components/ui/button";
import { formatMoney, type ShopifyProduct } from "@/lib/shopify";
import { useCartStore } from "@/stores/cart-store";

const socialImages = [
  { src: ugcStreet, alt: "Léa Rivoli Avenue Montaigne hoodie worn on the street in Paris" },
  { src: ugcSubway, alt: "Léa Rivoli Avenue Montaigne hoodie worn in the subway" },
  { src: ugcChalet, alt: "Léa Rivoli Avenue Montaigne hoodie worn in the mountains" },
];

export function SocialProofCarousel() {
  const trackRef = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(0);

  const updateActive = () => {
    const track = trackRef.current;
    if (!track) return;
    const max = track.scrollWidth - track.clientWidth;
    setActive(max <= 0 ? 0 : Math.round((track.scrollLeft / max) * (socialImages.length - 1)));
  };

  const scrollBy = (direction: 1 | -1) => {
    const track = trackRef.current;
    if (!track) return;
    track.scrollBy({ left: direction * track.clientWidth * 0.8, behavior: "smooth" });
  };

  return (
    <section className="border-t border-border">
      <div className="flex items-end justify-between px-4 py-7 md:px-9">
        <h2 className="text-sm font-semibold uppercase">Worn by you</h2>
        <span className="text-[10px] uppercase text-muted-foreground">@lea.rivoli</span>
      </div>
      <div className="relative">
        <div ref={trackRef} onScroll={updateActive} className="scrollbar-none flex snap-x snap-mandatory overflow-x-auto">
          {socialImages.map((image) => (
            <figure key={image.src} className="w-[82%] shrink-0 snap-center px-1 sm:w-[46%] lg:w-[31%]">
              <div className="aspect-[3/4] overflow-hidden bg-muted">
                <img src={image.src} alt={image.alt} loading="lazy" className="size-full object-cover" />
              </div>
            </figure>
          ))}
        </div>
        <div className="pointer-events-none absolute inset-y-0 left-0 hidden items-center pl-2 lg:flex">
          <Button variant="ghost" size="icon" aria-label="Previous image" className="pointer-events-auto bg-background/80 hover:bg-background" onClick={() => scrollBy(-1)}><ChevronLeft /></Button>
        </div>
        <div className="pointer-events-none absolute inset-y-0 right-0 hidden items-center pr-2 lg:flex">
          <Button variant="ghost" size="icon" aria-label="Next image" className="pointer-events-auto bg-background/80 hover:bg-background" onClick={() => scrollBy(1)}><ChevronRight /></Button>
        </div>
      </div>
      <div className="flex items-center justify-center gap-2 py-6">
        {socialImages.map((image, index) => (
          <button key={image.src} type="button" aria-label={`Go to image ${index + 1}`} onClick={() => { const track = trackRef.current; if (track) track.scrollTo({ left: (index * track.scrollWidth) / socialImages.length, behavior: "smooth" }); }} className={`size-1.5 rounded-full transition-colors ${index === active ? "bg-foreground" : "bg-border"}`} />
        ))}
      </div>
    </section>
  );
}

function IconButton({ label, children, onClick }: { label: string; children: ReactNode; onClick?: () => void }) {
  return <Button type="button" variant="ghost" size="icon" aria-label={label} title={label} onClick={onClick}>{children}</Button>;
}

export function StoreHeader() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const updateScroll = () => setScrolled(window.scrollY > 32);
    updateScroll();
    window.addEventListener("scroll", updateScroll, { passive: true });
    return () => window.removeEventListener("scroll", updateScroll);
  }, []);
  const count = useCartStore((state) => state.hydrated ? state.items.reduce((sum, item) => sum + item.quantity, 0) : 0);
  return (
    <>
      <div className="bg-ink px-4 py-2 text-center text-[10px] font-semibold uppercase text-ink-foreground">Avenue Montaigne Hoodie — available now</div>
      <header className={`sticky top-0 z-30 grid h-[76px] grid-cols-[1fr_auto_1fr] items-center border-b px-4 transition-[background-color,border-color] duration-500 ease-out md:px-9 ${scrolled ? "border-transparent bg-transparent" : "border-border bg-background/95"}`}>
        <nav className="hidden items-center gap-8 text-[11px] font-semibold uppercase md:flex" aria-label="Main navigation">
          <Link to="/">Shop</Link><Link to="/product/$handle" params={{ handle: "avenue-montaigne-hoodie" }}>New arrival</Link>
        </nav>
        <div className="md:hidden"><IconButton label="Open menu" onClick={() => setMenuOpen(true)}><Menu strokeWidth={1.5} /></IconButton></div>
        <Link to="/" aria-label="Léa Rivoli home" className={`block w-32 origin-center transition-transform duration-500 ease-out md:w-40 ${scrolled ? "scale-90" : "scale-100"}`}><img src={logo} alt="Léa Rivoli" className="h-auto w-full" /></Link>
        <div className="flex justify-end gap-1"><IconButton label="Search"><Search strokeWidth={1.5} /></IconButton><div className="relative"><IconButton label="Open cart" onClick={() => setCartOpen(true)}><ShoppingBag strokeWidth={1.5} /></IconButton>{count > 0 && <span className="absolute right-0 top-0 grid size-4 place-items-center rounded-full bg-brand text-[9px] text-brand-foreground">{count}</span>}</div></div>
      </header>
      {(menuOpen || cartOpen) && <Button variant="ghost" aria-label="Close overlay" className="fixed inset-0 z-40 h-auto w-auto rounded-none bg-overlay hover:bg-overlay" onClick={() => { setMenuOpen(false); setCartOpen(false); }} />}
      <aside className={`fixed left-0 top-0 z-50 h-full w-72 bg-background p-6 transition-transform duration-300 ${menuOpen ? "translate-x-0" : "-translate-x-full"}`} aria-hidden={!menuOpen}>
        <div className="flex justify-end"><IconButton label="Close menu" onClick={() => setMenuOpen(false)}><X /></IconButton></div>
        <nav className="mt-10 grid gap-6 text-sm font-semibold uppercase"><Link to="/" onClick={() => setMenuOpen(false)}>Shop</Link><Link to="/product/$handle" params={{ handle: "avenue-montaigne-hoodie" }} onClick={() => setMenuOpen(false)}>New arrival</Link></nav>
      </aside>
      <CartDrawer open={cartOpen} onClose={() => setCartOpen(false)} />
    </>
  );
}

function CartDrawer({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { items, checkoutUrl, isLoading, isSyncing, updateQuantity, removeItem, syncCart } = useCartStore();
  useEffect(() => { if (open) void syncCart(); }, [open, syncCart]);
  const total = items.reduce((sum, item) => sum + Number(item.price.amount) * item.quantity, 0);
  const currency = items[0]?.price.currencyCode ?? "SEK";
  return (
    <aside className={`fixed right-0 top-0 z-50 flex h-full w-full max-w-md flex-col bg-background p-6 transition-transform duration-300 ${open ? "translate-x-0" : "translate-x-full"}`} aria-hidden={!open}>
      <div className="flex items-center justify-between border-b border-border pb-5"><h2 className="text-sm font-semibold uppercase">Your cart ({items.reduce((sum, item) => sum + item.quantity, 0)})</h2><IconButton label="Close cart" onClick={onClose}><X /></IconButton></div>
      {!items.length ? <p className="pt-10 text-sm text-muted-foreground">Your cart is empty.</p> : <>
        <ul className="min-h-0 flex-1 divide-y divide-border overflow-y-auto">{items.map((item) => <li key={item.variantId} className="flex gap-4 py-5"><div className="aspect-[3/4] w-20 shrink-0 overflow-hidden bg-muted">{item.product.image && <img src={item.product.image} alt={item.product.title} className="size-full object-cover" />}</div><div className="min-w-0 flex-1"><Link to="/product/$handle" params={{ handle: item.product.handle }} onClick={onClose} className="text-xs font-semibold uppercase">{item.product.title}</Link><p className="mt-1 text-[10px] text-muted-foreground">{item.selectedOptions.map(({ value }) => value).join(" / ")}</p><p className="mt-2 text-xs">{formatMoney(item.price.amount, item.price.currencyCode)}</p><div className="mt-4 flex items-center gap-2"><IconButton label="Decrease quantity" onClick={() => void updateQuantity(item.variantId, item.quantity - 1)}><Minus /></IconButton><span className="w-5 text-center text-xs">{item.quantity}</span><IconButton label="Increase quantity" onClick={() => void updateQuantity(item.variantId, item.quantity + 1)}><Plus /></IconButton></div></div><IconButton label="Remove item" onClick={() => void removeItem(item.variantId)}><Trash2 /></IconButton></li>)}</ul>
        <div className="border-t border-border pt-5"><div className="mb-5 flex justify-between text-sm font-semibold uppercase"><span>Total</span><span>{formatMoney(String(total), currency)}</span></div><Button className="h-12 w-full rounded-none uppercase" disabled={!checkoutUrl || isLoading || isSyncing} onClick={() => { if (checkoutUrl) { window.open(checkoutUrl, "_blank", "noopener,noreferrer"); onClose(); } }}>{isLoading || isSyncing ? "Updating…" : "Checkout"}</Button></div>
      </>}
    </aside>
  );
}

export function ProductCard({ product }: { product: ShopifyProduct }) {
  const image = product.images.edges[0]?.node;
  return <article className="group min-w-0 border-b border-r border-border"><Link to="/product/$handle" params={{ handle: product.handle }}><div className="relative aspect-[3/4] overflow-hidden bg-muted">{image && <img src={image.url} alt={image.altText ?? product.title} className="size-full object-cover transition-transform duration-700 group-hover:scale-[1.02]" />}<span className="absolute left-3 top-3 bg-background px-2 py-1 text-[9px] font-semibold uppercase">New</span></div><div className="min-h-24 p-3 md:p-4"><h3 className="text-[10px] font-semibold uppercase leading-4 md:text-xs">{product.title}</h3><p className="mt-2 text-[10px] text-muted-foreground">{formatMoney(product.priceRange.minVariantPrice.amount, product.priceRange.minVariantPrice.currencyCode)}</p></div></Link></article>;
}

export function StoreFooter() {
  return <footer className="grid gap-12 border-t border-border px-6 py-14 text-[11px] uppercase md:grid-cols-3 md:px-10"><div><p className="max-w-xs normal-case leading-5 text-muted-foreground">Avenue Montaigne, Paris.</p></div><div className="grid content-start gap-3"><span>Customer care</span><span className="text-muted-foreground">Contact</span><span className="text-muted-foreground">Shipping & returns</span><span className="text-muted-foreground">Size guide</span></div><div><span>Newsletter</span><div className="mt-4 flex border-b border-foreground"><input aria-label="Email address" type="email" placeholder="EMAIL ADDRESS" className="h-10 min-w-0 flex-1 bg-transparent text-[10px] outline-none placeholder:text-muted-foreground"/><Button variant="ghost" className="rounded-none px-2 text-[10px] font-semibold uppercase">Join</Button></div></div></footer>;
}