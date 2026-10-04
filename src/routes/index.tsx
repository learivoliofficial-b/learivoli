import { createFileRoute } from "@tanstack/react-router";
import { Menu, Search, ShoppingBag, UserRound, X } from "lucide-react";
import { useState } from "react";

import editorialHero from "../assets/editorial-hero.jpg";
import editorialLook from "../assets/editorial-look.jpg";
import cardigan from "../assets/product-cardigan.jpg";
import zip from "../assets/product-zip.jpg";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "NORTH/01 — Scandinavian Clothing" },
      { name: "description", content: "Independent Scandinavian clothing made for long days and colder nights." },
      { property: "og:title", content: "NORTH/01 — Scandinavian Clothing" },
      { property: "og:description", content: "Independent Scandinavian clothing made for long days and colder nights." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

const products = [
  { name: "BUCKLE CARDIGAN ECRU", price: "2 899 SEK", image: cardigan, tone: "Ecru" },
  { name: "MERINO ZIP CHARCOAL", price: "2 499 SEK", image: zip, tone: "Charcoal" },
  { name: "SIGNATURE ZIP NAVY", price: "2 199 SEK", image: editorialLook, tone: "Navy" },
  { name: "BUCKLE CARDIGAN STONE", price: "2 899 SEK", image: cardigan, tone: "Stone" },
  { name: "MERINO ZIP GRAPHITE", price: "2 499 SEK", image: zip, tone: "Graphite" },
  { name: "NORDIC ZIP NAVY", price: "2 199 SEK", image: editorialLook, tone: "Navy" },
];

function IconButton({ label, children, onClick }: { label: string; children: React.ReactNode; onClick?: () => void }) {
  return <button type="button" aria-label={label} title={label} onClick={onClick} className="grid size-9 place-items-center transition-opacity hover:opacity-50">{children}</button>;
}

function Index() {
  const [cartOpen, setCartOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [cart, setCart] = useState<string[]>([]);

  const addToCart = (name: string) => {
    setCart((items) => [...items, name]);
    setCartOpen(true);
  };

  return (
    <main className="min-h-screen bg-background text-foreground">
      <div className="bg-ink px-4 py-2 text-center text-[10px] font-semibold uppercase text-ink-foreground">Worldwide shipping</div>
      <header className="sticky top-0 z-30 grid h-[74px] grid-cols-[1fr_auto_1fr] items-center border-b border-border bg-background px-4 md:px-9">
        <nav className="hidden items-center gap-9 text-[11px] font-semibold uppercase md:flex" aria-label="Main navigation">
          <a href="#new" className="hover:opacity-50">New arrivals</a>
          <a href="#shop" className="hover:opacity-50">Shop</a>
          <a href="#story" className="hover:opacity-50">Info</a>
          <a href="#coming" className="hover:opacity-50">Coming soon</a>
        </nav>
        <div className="md:hidden"><IconButton label="Open menu" onClick={() => setMenuOpen(true)}><Menu size={19} strokeWidth={1.5} /></IconButton></div>
        <a href="#top" className="font-serif text-xl font-semibold tracking-[0.28em] text-brand md:text-2xl">NORTH/01</a>
        <div className="flex justify-end gap-1">
          <IconButton label="Search"><Search size={19} strokeWidth={1.5} /></IconButton>
          <span className="hidden md:block"><IconButton label="Account"><UserRound size={19} strokeWidth={1.5} /></IconButton></span>
          <div className="relative">
            <IconButton label="Open cart" onClick={() => setCartOpen(true)}><ShoppingBag size={19} strokeWidth={1.5} /></IconButton>
            {cart.length > 0 && <span className="absolute right-0 top-0 grid size-4 place-items-center rounded-full bg-brand text-[9px] text-brand-foreground">{cart.length}</span>}
          </div>
        </div>
      </header>

      <section id="top" className="relative min-h-[calc(100svh-106px)] overflow-hidden">
        <img src={editorialHero} alt="NORTH/01 knitwear campaign in the Scandinavian mountains" width={1920} height={1080} className="absolute inset-0 size-full object-cover" />
        <div className="absolute inset-0 bg-image-shade" />
        <p className="absolute bottom-10 left-6 max-w-xs text-[11px] font-semibold uppercase leading-relaxed text-image-foreground md:bottom-20 md:left-10">Inspired by the roads of Scandinavia</p>
      </section>

      <section id="coming" className="px-4 py-20 text-center md:py-28">
        <p className="text-xs font-semibold uppercase tracking-[0.18em]">Autumn / Winter 26</p>
        <h1 className="mt-4 font-serif text-4xl font-medium uppercase md:text-6xl">The mountain series</h1>
        <div className="mx-auto mt-10 grid max-w-md grid-cols-4 divide-x divide-border border-y border-border py-5">
          {[["06","Days"],["22","Hrs"],["12","Mins"],["38","Secs"]].map(([value,label]) => <div key={label}><p className="font-serif text-2xl md:text-3xl">{value}</p><p className="mt-1 text-[9px] uppercase text-muted-foreground">{label}</p></div>)}
        </div>
      </section>

      <section id="shop" className="border-t border-border">
        <div className="flex items-end justify-between px-4 py-7 md:px-9"><h2 className="text-sm font-semibold uppercase">Coming soon</h2><span className="text-[10px] uppercase text-muted-foreground">06 pieces</span></div>
        <div className="grid grid-cols-2 border-t border-border lg:grid-cols-3">
          {products.slice(0, 3).map((product) => <ProductCard key={product.name} product={product} onAdd={addToCart} />)}
        </div>
      </section>

      <section id="story" className="relative h-[78vh] min-h-[560px] overflow-hidden">
        <img src={editorialHero} alt="Scandinavian mountain road campaign" loading="lazy" width={1920} height={1080} className="size-full object-cover" />
        <div className="absolute inset-0 bg-image-shade" />
        <div className="absolute inset-x-0 bottom-0 p-6 text-image-foreground md:p-10">
          <p className="text-[10px] font-semibold uppercase">NORTH/01 Journal</p>
          <h2 className="mt-2 max-w-2xl font-serif text-4xl uppercase md:text-6xl">Made for weather. Worn everywhere.</h2>
        </div>
      </section>

      <section id="new" className="border-t border-border">
        <div className="flex items-end justify-between px-4 py-7 md:px-9"><h2 className="text-sm font-semibold uppercase">New in</h2><a href="#shop" className="text-[10px] uppercase underline underline-offset-4">View all</a></div>
        <div className="grid grid-cols-2 border-t border-border lg:grid-cols-3">
          {products.slice(3).map((product) => <ProductCard key={product.name} product={product} onAdd={addToCart} />)}
        </div>
      </section>

      <footer className="grid gap-12 border-t border-border px-6 py-14 text-[11px] uppercase md:grid-cols-3 md:px-10">
        <div><p className="font-serif text-2xl tracking-[0.22em] text-brand">NORTH/01</p><p className="mt-4 max-w-xs normal-case leading-5 text-muted-foreground">Independent clothing shaped by northern streets, open roads and changing seasons.</p></div>
        <div className="grid gap-3"><span>Customer service</span><a href="mailto:studio@example.com" className="text-muted-foreground">Contact</a><a href="#story" className="text-muted-foreground">Shipping & returns</a><a href="#story" className="text-muted-foreground">Size guide</a></div>
        <div><span>Newsletter</span><div className="mt-4 flex border-b border-foreground"><input aria-label="Email address" type="email" placeholder="EMAIL ADDRESS" className="h-10 min-w-0 flex-1 bg-transparent text-[10px] outline-none placeholder:text-muted-foreground"/><button type="button" className="px-2 text-[10px] font-semibold uppercase">Join</button></div></div>
      </footer>

      {(cartOpen || menuOpen) && <button aria-label="Close overlay" className="fixed inset-0 z-40 bg-overlay" onClick={() => { setCartOpen(false); setMenuOpen(false); }} />}
      <aside className={`fixed right-0 top-0 z-50 h-full w-full max-w-md bg-background p-6 transition-transform duration-300 ${cartOpen ? "translate-x-0" : "translate-x-full"}`} aria-hidden={!cartOpen}>
        <div className="flex items-center justify-between border-b border-border pb-5"><h2 className="text-sm font-semibold uppercase">Your cart ({cart.length})</h2><IconButton label="Close cart" onClick={() => setCartOpen(false)}><X size={20}/></IconButton></div>
        {cart.length === 0 ? <p className="pt-10 text-sm text-muted-foreground">Your cart is empty.</p> : <><ul className="divide-y divide-border">{cart.map((item, index) => <li className="flex justify-between py-5 text-xs uppercase" key={`${item}-${index}`}><span>{item}</span><span>1</span></li>)}</ul><button type="button" className="mt-8 w-full bg-ink px-5 py-4 text-xs font-semibold uppercase text-ink-foreground">Checkout</button></>}
      </aside>
      <aside className={`fixed left-0 top-0 z-50 h-full w-72 bg-background p-6 transition-transform duration-300 ${menuOpen ? "translate-x-0" : "-translate-x-full"}`} aria-hidden={!menuOpen}>
        <div className="flex justify-end"><IconButton label="Close menu" onClick={() => setMenuOpen(false)}><X size={20}/></IconButton></div>
        <nav className="mt-10 grid gap-6 text-sm font-semibold uppercase">{[["New arrivals","#new"],["Shop","#shop"],["Info","#story"],["Coming soon","#coming"]].map(([label,href]) => <a key={label} href={href} onClick={() => setMenuOpen(false)}>{label}</a>)}</nav>
      </aside>
    </main>
  );
}

function ProductCard({ product, onAdd }: { product: typeof products[number]; onAdd: (name: string) => void }) {
  return (
    <article className="group min-w-0 border-b border-r border-border">
      <div className="relative aspect-[4/5] overflow-hidden bg-muted">
        <img src={product.image} alt={product.name} loading="lazy" width={1200} height={1500} className="size-full object-cover transition-transform duration-700 group-hover:scale-[1.02]" />
        <span className="absolute left-3 top-3 bg-background px-2 py-1 text-[9px] font-semibold uppercase">New</span>
        <button type="button" onClick={() => onAdd(product.name)} className="absolute inset-x-3 bottom-3 translate-y-2 bg-background px-3 py-3 text-[10px] font-semibold uppercase opacity-0 transition-all group-hover:translate-y-0 group-hover:opacity-100 focus:translate-y-0 focus:opacity-100">Quick add</button>
      </div>
      <div className="min-h-24 p-3 md:p-4"><h3 className="text-[10px] font-semibold uppercase leading-4 md:text-xs">{product.name}</h3><div className="mt-2 flex items-center justify-between text-[10px] text-muted-foreground"><span>{product.price}</span><span>{product.tone}</span></div></div>
    </article>
  );
}
