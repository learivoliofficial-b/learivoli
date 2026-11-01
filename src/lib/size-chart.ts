export type SizeChart = {
  sizes: string[];
  rows: Array<{ label: string; cm: number[]; inches: number[]; howTo: string }>;
};

/** Regular Fit 250 GSM T-shirt measurements (garment laid flat). */
export const TSHIRT_SIZE_CHART: SizeChart = {
  sizes: ["S", "M", "L", "XL", "2XL", "3XL"],
  rows: [
    { label: "Length", cm: [67.5, 69.5, 72, 74.5, 76.5, 78], inches: [26.6, 27.4, 28.3, 29.3, 30.1, 30.7], howTo: "From the highest point of the shoulder, next to the collar, straight down to the bottom hem." },
    { label: "Chest", cm: [50, 52.5, 55, 57.5, 60, 62.5], inches: [19.7, 20.7, 21.7, 22.6, 23.6, 24.6], howTo: "Lay the shirt flat and measure straight across, 2 cm below the armholes, from side seam to side seam." },
    { label: "Shoulder", cm: [50, 52.5, 55, 57.5, 60, 62.5], inches: [19.7, 20.7, 21.7, 22.6, 23.6, 24.6], howTo: "Straight across the back, from one shoulder seam to the other." },
    { label: "Sleeve length", cm: [22, 23, 24, 25, 26, 27], inches: [8.7, 9.1, 9.4, 9.8, 10.2, 10.6], howTo: "From the shoulder seam along the top of the sleeve to the end of the sleeve." },
  ],
};

/** Returns the size chart for a product, or null when none applies. */
export function getSizeChart(product: { title: string; productType?: string; handle: string }): SizeChart | null {
  const text = `${product.title} ${product.productType ?? ""} ${product.handle}`.toLowerCase();
  return /t-?shirt|tee\b/.test(text) ? TSHIRT_SIZE_CHART : null;
}
