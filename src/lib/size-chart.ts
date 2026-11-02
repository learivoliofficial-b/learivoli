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

/** Hoodie measurements (garment laid flat). */
export const HOODIE_SIZE_CHART: SizeChart = {
  sizes: ["S", "M", "L", "XL", "2XL"],
  rows: [
    { label: "Length", cm: [64, 66, 68, 70, 72], inches: [25.2, 26.0, 26.8, 27.6, 28.3], howTo: "From the highest point of the shoulder straight down to the bottom hem." },
    { label: "Chest width", cm: [67, 69, 71, 73, 75], inches: [26.4, 27.2, 28.0, 28.7, 29.5], howTo: "Lay flat and measure straight across, just below the armholes." },
    { label: "Waist width", cm: [43, 45, 47, 49, 51], inches: [16.9, 17.7, 18.5, 19.3, 20.1], howTo: "Straight across the bottom hem, side to side." },
    { label: "Sleeve length", cm: [59, 60.5, 62, 63.5, 65], inches: [23.2, 23.8, 24.4, 25.0, 25.6], howTo: "From the shoulder seam along the sleeve to the end of the cuff." },
    { label: "Hood height", cm: [34, 34.5, 35, 35.5, 36], inches: [13.4, 13.6, 13.8, 14.0, 14.2], howTo: "From the neckline seam to the top of the hood." },
  ],
};

/** Pants measurements (garment laid flat). */
export const PANTS_SIZE_CHART: SizeChart = {
  sizes: ["S", "M", "L", "XL", "2XL"],
  rows: [
    { label: "Length", cm: [102, 104, 106, 108, 110], inches: [40.2, 40.9, 41.7, 42.5, 43.3], howTo: "From the top of the waistband straight down the side to the bottom hem." },
    { label: "Waist width", cm: [36, 38, 40, 42, 44], inches: [14.2, 15.0, 15.7, 16.5, 17.3], howTo: "Lay flat and measure straight across the top of the waistband." },
    { label: "Hip width", cm: [54.5, 56.5, 58.5, 60.5, 62.5], inches: [21.5, 22.2, 23.0, 23.8, 24.6], howTo: "Straight across the widest part of the hips, side to side." },
  ],
};

/** Returns the size chart for a product, or null when none applies. */
export function getSizeChart(product: { title: string; productType?: string; handle: string }): SizeChart | null {
  const text = `${product.title} ${product.productType ?? ""} ${product.handle}`.toLowerCase();
  if (/t-?shirt|tee\b/.test(text)) return TSHIRT_SIZE_CHART;
  if (/hoodie|sweatshirt/.test(text)) return HOODIE_SIZE_CHART;
  if (/pant|trouser|jogger|sweatpant/.test(text)) return PANTS_SIZE_CHART;
  return null;
}
