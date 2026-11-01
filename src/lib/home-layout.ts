/**
 * Which saved layout the start page ("/") shows.
 * - "rail": the clothing rail with hangers (also always at /galge)
 * - "drop": big hero image + New Arrivals (also always at /drop)
 * - "classic": the original start page (also always at /klassisk)
 */
export type HomeLayout = "rail" | "drop" | "classic";

export const HOME_LAYOUT: HomeLayout = "drop";
