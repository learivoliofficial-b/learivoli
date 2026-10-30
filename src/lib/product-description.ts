export type DescriptionSection = { title: string; lines: string[] };
export type ParsedDescription = { intro: string[]; sections: DescriptionSection[] };

const HEADINGS = ["details", "care instructions", "care instruction", "care"];

const decode = (text: string) =>
  text.replace(/&amp;/g, "&").replace(/&nbsp;/g, " ").replace(/&#39;|&rsquo;/g, "’").replace(/&quot;/g, '"').replace(/&lt;/g, "<").replace(/&gt;/g, ">");

/** Splits Shopify description HTML into intro text plus "Details" / "Care Instructions" sections. */
export function parseDescription(html: string): ParsedDescription {
  const blocks = html.match(/<(p|li|h[1-6])[^>]*>[\s\S]*?<\/\1>/gi) ?? [];
  const intro: string[] = [];
  const sections: DescriptionSection[] = [];
  let current: DescriptionSection | null = null;
  for (const block of blocks) {
    const text = decode(block.replace(/<[^>]+>/g, "")).replace(/\s+/g, " ").trim();
    if (!text) { current = null; continue; }
    if (HEADINGS.includes(text.toLowerCase().replace(/:$/, ""))) {
      current = { title: text.replace(/:$/, ""), lines: [] };
      sections.push(current);
      continue;
    }
    if (current) current.lines.push(text);
    else intro.push(text);
  }
  if (!blocks.length && html.trim()) intro.push(decode(html.replace(/<[^>]+>/g, "")).trim());
  return { intro, sections: sections.filter((s) => s.lines.length) };
}
