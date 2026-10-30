import { useNavigate } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";

import type { RailItem } from "@/lib/rail";

const TURN_MS = 700;

export function ClothingRail({ items }: { items: RailItem[] }) {
  const navigate = useNavigate();
  const [active, setActive] = useState<string | null>(null);
  const [leaving, setLeaving] = useState<string | null>(null);
  const [touch, setTouch] = useState(false);
  const lastPointer = useRef<string>("mouse");

  useEffect(() => {
    const query = window.matchMedia("(hover: none)");
    const update = () => setTouch(query.matches);
    update();
    query.addEventListener("change", update);
    return () => query.removeEventListener("change", update);
  }, []);

  const open = (item: RailItem) => {
    if (!item.handle || leaving) return;
    setActive(item.id);
    setLeaving(item.id);
    window.setTimeout(() => void navigate({ to: "/product/$handle", params: { handle: item.handle! } }), TURN_MS);
  };

  const handleClick = (item: RailItem) => {
    const isTouch = lastPointer.current === "touch" || lastPointer.current === "pen";
    if (isTouch && active !== item.id) { setActive(item.id); return; }
    open(item);
  };

  const current = items.find((item) => item.id === active);

  return (
    <section className="bg-rail" aria-label="Clothing rail">
      <div className="flex items-center justify-center gap-3 pt-10 text-[9px] font-semibold uppercase md:pt-14">
        <span>New collection</span><span className="h-3 w-px bg-border" /><span className="text-muted-foreground">Léa Rivoli Paris</span>
      </div>
      <div className="scrollbar-none overflow-x-auto overflow-y-hidden">
        <div className="relative mx-auto w-max min-w-full px-6 pb-4 pt-8 md:px-12">
          <div className="pointer-events-none absolute inset-x-6 top-[38px] z-10 h-[3px] rounded-full bg-rail-bar md:inset-x-12" />
          <ul className="relative flex justify-center pt-0">
            {items.map((item) => {
              const isActive = active === item.id;
              const fading = leaving && leaving !== item.id;
              return (
                <li key={item.id} className={`relative shrink-0 transition-[width,opacity] duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] ${isActive ? "w-[210px] md:w-[280px]" : "w-[64px] md:w-[86px]"} ${fading ? "opacity-0" : "opacity-100"}`}>
                  <button
                    type="button"
                    aria-label={item.handle ? `${item.title}${touch ? ", tap twice to open" : ""}` : `${item.title}, coming soon`}
                    onPointerDown={(event) => { lastPointer.current = event.pointerType; if (event.pointerType !== "mouse") setTouch(true); }}
                    onPointerEnter={(event) => { if (event.pointerType === "mouse" && !leaving) setActive(item.id); }}
                    onPointerLeave={(event) => { if (event.pointerType === "mouse" && !leaving) setActive(null); }}
                    onFocus={(event) => { if (!leaving && event.currentTarget.matches(":focus-visible")) setActive(item.id); }}
                    onClick={() => handleClick(item)}
                    className="relative block h-[300px] w-full outline-none [perspective:1100px] md:h-[400px]"
                  >
                    <span key={isActive ? "on" : "off"} className={`pointer-events-none absolute left-1/2 top-0 block w-[210px] -translate-x-1/2 md:w-[280px] ${isActive ? "garment-sway" : ""}`} style={{ transformOrigin: "50% 0%" }}>
                      <img
                        src={item.image}
                        alt={item.title}
                        width={768}
                        height={1024}
                        draggable={false}
                        className={`block h-auto w-full select-none transition-transform duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] ${leaving === item.id ? "scale-[1.06]" : ""}`}
                        style={{ transform: `rotateY(${isActive ? 0 : -72}deg)`, transformOrigin: "50% 0%" }}
                      />
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      </div>
      <div className="grid min-h-28 place-items-center content-start gap-2 px-6 pb-12 text-center">
        <p className={`text-[11px] font-semibold uppercase transition-opacity duration-500 ${current ? "opacity-100" : "opacity-0"}`}>{current?.title ?? "\u00a0"}</p>
        <p className={`text-[10px] uppercase text-muted-foreground transition-opacity duration-500 ${current ? "opacity-100" : "opacity-0"}`}>{current ? current.price ?? "Coming soon" : "\u00a0"}</p>
        <p className="mt-3 font-mono text-[10px] text-muted-foreground">{touch ? "Tap to turn. Tap again to shop." : "Hover to turn. Click to shop."}</p>
      </div>
    </section>
  );
}
