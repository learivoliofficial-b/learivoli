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
  const [swaying, setSwaying] = useState<string | null>(null);
  const [leaving, setLeaving] = useState<string | null>(null);
  const [isTouch, setIsTouch] = useState(false);
  const [page, setPage] = useState(0);

  useEffect(() => { if (window.matchMedia("(pointer: coarse)").matches) setIsTouch(true); }, []);

  const sway = (id: string) => { setSwaying(null); requestAnimationFrame(() => setSwaying(id)); };

  const open = (item: RailItem) => {
    if (!item.handle) return;
    setLeaving(item.id);
    window.setTimeout(() => void navigate({ to: "/product/$handle", params: { handle: item.handle! } }), NAVIGATE_AFTER_MS);
  };

  const handleClick = (item: RailItem) => {
    if (leaving) return;
    const touch = lastPointer.current !== "mouse";
    if (touch && turned !== item.id) { setTurned(item.id); sway(item.id); return; }
    setTurned(item.id);
    sway(item.id);
    open(item);
  };

  const onScroll = () => {
    const track = trackRef.current;
    if (!track) return;
    const max = track.scrollWidth - track.clientWidth;
    setPage(max <= 0 ? 0 : Math.round((track.scrollLeft / max) * (items.length - 1)));
  };

  const current = items.find((item) => item.id === turned);

  return (
    <section aria-label="Clothing rail" className="flex min-h-0 flex-1 flex-col bg-rail [--g-h:min(52svh,440px)] md:[--g-h:min(56svh,560px)]">
      <div className="flex shrink-0 items-center justify-center gap-3 pt-6 text-[9px] font-semibold uppercase tracking-[0.18em] md:pt-10 md:text-[10px]">
        <span>New collection</span><span className="h-3 w-px bg-border" /><span className="text-muted-foreground">Léa Rivoli Paris</span>
      </div>

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
              {items.map((item) => {
                const front = turned === item.id;
                const fading = leaving !== null && leaving !== item.id;
                const slot: CSSProperties = {
                  width: front ? "calc(var(--g-h) * 0.72)" : "calc(var(--g-h) * 0.3)",
                  transition: `width 800ms ${EASE}, opacity 500ms ease`,
                };
                return (
                  <li key={item.id} className={`relative shrink-0 snap-center ${fading ? "opacity-0" : "opacity-100"}`} style={{ transition: "opacity 500ms ease" }}>
                    <button
                      type="button"
                      aria-label={item.handle ? `${item.title}, ${item.price ?? ""}` : `${item.title}, coming soon`}
                      onPointerDown={(event) => { lastPointer.current = event.pointerType; if (event.pointerType !== "mouse") setIsTouch(true); }}
                      onPointerEnter={(event) => { if (event.pointerType === "mouse" && !leaving) sway(item.id); }}
                      onPointerLeave={(event) => { if (event.pointerType === "mouse" && !leaving && turned === item.id) setTurned(null); }}
                      onClick={() => handleClick(item)}
                      className="relative block h-[var(--g-h)] outline-none focus-visible:ring-1 focus-visible:ring-ring"
                      style={slot}
                    >
                      <span
                        key={swaying === item.id ? "sway" : "still"}
                        className={`pointer-events-none absolute inset-0 block ${swaying === item.id ? "garment-sway" : ""}`}
                        style={{ transformOrigin: "50% 3.5%" }}
                      >
                        <span className={`absolute inset-0 block overflow-hidden [perspective:1200px] ${leaving === item.id ? "scale-[1.04]" : ""}`} style={{ transition: `transform 900ms ${EASE}`, transformOrigin: "50% 3.5%" }}>
                          {/* Side view */}
                          <img
                            src={item.side ?? item.front}
                            alt=""
                            draggable={false}
                            className={`absolute left-1/2 top-0 h-full w-auto max-w-none select-none ${item.handle ? "brightness-[1.05]" : ""}`}
                            style={{
                              transform: `translateX(-50%) rotateY(${front ? 90 : 0}deg)${item.side ? "" : " scaleX(0.38)"}`,
                              transition: `transform 400ms ${front ? "ease-in" : `${EASE} 400ms`}`,
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
                              transition: `transform 450ms ${front ? `${EASE} 380ms` : "ease-in"}`,
                              backfaceVisibility: "hidden",
                            }}
                          />
                        </span>
                        {/* Price tag */}
                        <span className="absolute left-1/2 top-[11%] z-10 -translate-x-[115%] -rotate-6 rounded-[3px] bg-background px-1.5 py-1 text-[8px] font-semibold uppercase leading-none shadow-sm md:text-[9px]">
                          {item.price ?? "Soon"}
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
        <p className="mt-1 font-mono text-[10px] text-muted-foreground">{isTouch ? "Tap to turn. Tap again to shop." : "Click to turn and shop."}</p>
      </div>
    </section>
  );
}
