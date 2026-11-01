import { useNavigate } from "@tanstack/react-router";
import { useEffect, useRef, useState, type CSSProperties } from "react";

import type { RailItem } from "@/lib/rail";

const EASE = "cubic-bezier(0.22,1,0.36,1)";
const NAVIGATE_AFTER_MS = 1000;

/**
 * Full-screen clothing rail. Garments hang sideways on one shared rail.
 * Computer: hover sways, click turns the garment to the front and opens the product.
 * Phone: tap turns it to the front, tap again opens the product.
 */
export function ClothingRail({ items }: { items: RailItem[] }) {
  const navigate = useNavigate();
  const trackRef = useRef<HTMLDivElement>(null);
  const lastPointer = useRef("mouse");
  const [turned, setTurned] = useState<string | null>(null);
  const [swaying, setSwaying] = useState<{ id: string; dir: 1 | -1; n: number } | null>(null);
  const [hovered, setHovered] = useState<string | null>(null);
  const [leaving, setLeaving] = useState<string | null>(null);
  const [page, setPage] = useState(0);

  /** Starts a damped pendulum swing; dir = which way the garment is pushed first. */
  const sway = (id: string, dir: 1 | -1 = 1) => setSwaying((current) => ({ id, dir, n: (current?.n ?? 0) + 1 }));

  const open = (item: RailItem) => {
    if (!item.handle) return;
    setLeaving(item.id);
    window.setTimeout(() => void navigate({ to: "/product/$handle", params: { handle: item.handle! } }), NAVIGATE_AFTER_MS);
  };

  const handleClick = (item: RailItem) => {
    if (leaving) return;
    const touch = lastPointer.current !== "mouse";
    if (touch && turned !== item.id) { setTurned(item.id); sway(item.id, -1); return; }
    setTurned(item.id);
    sway(item.id, -1);
    open(item);
  };

  const onScroll = () => {
    const track = trackRef.current;
    if (!track) return;
    const max = track.scrollWidth - track.clientWidth;
    setPage(max <= 0 ? 0 : Math.round((track.scrollLeft / max) * (items.length - 1)));
  };

  const current = items.find((item) => item.id === turned);
  const pushFrom = items.findIndex((item) => item.id === (hovered ?? turned));

  return (
    <section aria-label="Clothing rail" className="flex min-h-0 flex-1 flex-col bg-rail [--g-h:min(52svh,440px)] md:[--g-h:min(56svh,560px)]">
      <ParisClock />

      <div className="relative flex min-h-0 flex-1 flex-col justify-center">
        <div ref={trackRef} onScroll={onScroll} className="scrollbar-none snap-x snap-mandatory overflow-x-auto overflow-y-hidden md:snap-none">
          <div className="relative mx-auto w-max min-w-full px-4 md:px-16">
            {/* The shared rail */}
            <div aria-hidden className="pointer-events-none absolute inset-x-1 top-[calc(var(--g-h)*0.035)] z-20 md:inset-x-8">
              <div className="absolute -top-[5px] left-0 h-[14px] w-[6px] rounded-[1px] bg-rail-bracket" />
              <div className="absolute -top-[5px] right-0 h-[14px] w-[6px] rounded-[1px] bg-rail-bracket" />
              <div className="mx-[4px] h-[4px] rounded-full bg-[image:var(--rail-metal)] shadow-[0_1px_2px_var(--rail-shadow)]" />
            </div>

            <ul className="relative flex items-start justify-center gap-1 md:gap-3">
              {items.map((item, index) => {
                const front = turned === item.id;
                const fading = leaving !== null && leaving !== item.id;
                const swing = swaying?.id === item.id ? swaying : null;
                // Neighbouring hangers get nudged aside, like on a real rail.
                const offset = pushFrom < 0 || index === pushFrom ? 0 : index < pushFrom ? -1 : 1;
                const near = Math.abs(index - pushFrom) === 1;
                const push: CSSProperties = {
                  transform: offset && near ? `translateX(${offset * 10}px) rotate(${offset * 1.4}deg)` : offset ? `translateX(${offset * 4}px)` : "none",
                  transformOrigin: "50% 3.5%",
                  transition: `transform 900ms ${EASE}, opacity 500ms ease`,
                };
                const slot: CSSProperties = {
                  width: front ? "calc(var(--g-h) * 0.72)" : "calc(var(--g-h) * 0.3)",
                  transition: `width 800ms ${EASE}`,
                };
                const swingStyle = { transformOrigin: "50% 3.5%", "--dir": swing?.dir ?? 1 } as CSSProperties;
                return (
                  <li key={item.id} className={`relative shrink-0 snap-center ${fading ? "opacity-0" : "opacity-100"}`} style={push}>
                    <button
                      type="button"
                      aria-label={item.handle ? `${item.title}, ${item.price ?? ""}` : `${item.title}, coming soon`}
                      onPointerDown={(event) => { lastPointer.current = event.pointerType; }}
                      onPointerEnter={(event) => {
                        if (event.pointerType !== "mouse" || leaving) return;
                        setHovered(item.id);
                        const rect = event.currentTarget.getBoundingClientRect();
                        sway(item.id, event.clientX < rect.left + rect.width / 2 ? 1 : -1);
                      }}
                      onPointerLeave={(event) => {
                        if (event.pointerType !== "mouse" || leaving) return;
                        setHovered(null);
                        if (turned === item.id) setTurned(null);
                      }}
                      onClick={() => handleClick(item)}
                      className="relative block h-[var(--g-h)] outline-none focus-visible:ring-1 focus-visible:ring-ring"
                      style={slot}
                    >
                      <span className="garment-arrive pointer-events-none absolute inset-0 block" style={{ animationDelay: `${120 + index * 110}ms`, transformOrigin: "50% 3.5%" }}>
                        <span className="garment-idle absolute inset-0 block" style={{ animationDelay: `${-index * 1.7}s`, transformOrigin: "50% 3.5%" }}>
                          <span key={swing ? `swing-${swing.n}` : "still"} className={`absolute inset-0 block ${swing ? "garment-swing" : ""}`} style={swingStyle}>
                            <span className={`absolute inset-0 block ${swing ? "garment-cloth" : ""}`} style={{ transformOrigin: "50% 3.5%" }}>
                              <span className={`absolute inset-0 block overflow-hidden [perspective:1400px] ${leaving === item.id ? "scale-[1.04]" : ""}`} style={{ transition: `transform 900ms ${EASE}`, transformOrigin: "50% 3.5%" }}>
                                {/* Side view */}
                                <img
                                  src={item.side ?? item.front}
                                  alt=""
                                  draggable={false}
                                  className={`absolute left-1/2 top-0 h-full w-auto max-w-none select-none ${item.handle ? "brightness-[1.05]" : ""}`}
                                  style={{
                                    transform: `translateX(-50%) rotateY(${front ? 90 : 0}deg)${item.side ? "" : " scaleX(0.38)"}`,
                                    transition: `transform 380ms ${front ? "cubic-bezier(0.55,0,0.9,0.4)" : `${EASE} 360ms`}`,
                                    backfaceVisibility: "hidden",
                                  }}
                                />
                                {/* Front view */}
                                <img
                                  src={item.front}
                                  alt={item.title}
                                  draggable={false}
                                  className={`absolute left-1/2 top-0 h-full w-auto max-w-none select-none ${item.handle ? "brightness-[1.05]" : ""}`}
                                  style={{
                                    transform: `translateX(-50%) rotateY(${front ? 0 : -90}deg)`,
                                    transition: `transform 520ms ${front ? `cubic-bezier(0.2,1.25,0.4,1) 360ms` : "cubic-bezier(0.55,0,0.9,0.4)"}`,
                                    backfaceVisibility: "hidden",
                                  }}
                                />
                              </span>
                              {/* Price tag */}
                              <span className="garment-tag absolute left-1/2 top-[11%] z-10 rounded-[3px] bg-background px-1.5 py-1 text-[8px] font-semibold uppercase leading-none shadow-sm md:text-[9px]">
                                {item.price ?? "Soon"}
                              </span>
                            </span>
                          </span>
                        </span>
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>
        </div>

        <div className="mt-4 flex justify-center gap-1.5 md:hidden" aria-hidden>
          {items.map((item, index) => <span key={item.id} className={`h-1.5 rounded-full transition-all duration-300 ${index === page ? "w-6 bg-foreground" : "w-1.5 bg-border"}`} />)}
        </div>
      </div>

      <div className="grid shrink-0 justify-items-center gap-1.5 px-6 pb-6 text-center md:pb-10">
        <p className={`h-4 text-[11px] font-semibold uppercase transition-opacity duration-500 ${current ? "opacity-100" : "opacity-0"}`}>{current?.title}</p>
        <p className={`h-4 text-[10px] uppercase text-muted-foreground transition-opacity duration-500 ${current ? "opacity-100" : "opacity-0"}`}>{current ? current.price ?? "Coming soon" : ""}</p>
      </div>
    </section>
  );
}

/** "PARIS | FRIDAY, 30 OCTOBER 2026 | 14:22" in Paris time, kept live. */
export function formatParisClock(date: Date) {
  const part = (options: Intl.DateTimeFormatOptions) => new Intl.DateTimeFormat("en-GB", { timeZone: "Europe/Paris", ...options }).format(date);
  return {
    day: `${part({ weekday: "long" })}, ${part({ day: "numeric", month: "long", year: "numeric" })}`.toUpperCase(),
    time: part({ hour: "2-digit", minute: "2-digit", hour12: false }),
  };
}

export function ParisClock({ className = "border-b border-border text-muted-foreground" }: { className?: string }) {
  const [now, setNow] = useState<Date | null>(null);
  useEffect(() => {
    setNow(new Date());
    const id = window.setInterval(() => setNow(new Date()), 1000);
    return () => window.clearInterval(id);
  }, []);
  const clock = now ? formatParisClock(now) : null;
  return (
    <div className={`flex h-9 shrink-0 items-center justify-center gap-3 text-[10px] font-medium uppercase tracking-[0.14em] md:h-11 md:gap-5 md:text-[11px] ${className}`}>
      <span>Paris</span>
      <span aria-hidden className="h-3.5 w-px bg-current opacity-30" />
      <time dateTime={now?.toISOString()} className={`transition-opacity duration-500 ${clock ? "opacity-100" : "opacity-0"}`}>{clock?.day ?? "\u00a0"}</time>
      <span aria-hidden className="h-3.5 w-px bg-current opacity-30" />
      <span className={`tabular-nums transition-opacity duration-500 ${clock ? "opacity-100" : "opacity-0"}`}>{clock?.time ?? "00:00"}</span>
    </div>
  );
}
