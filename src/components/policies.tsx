import contact from "@/content/policies/contact.txt?raw";
import privacy from "@/content/policies/privacy.txt?raw";
import refund from "@/content/policies/refund.txt?raw";
import shipping from "@/content/policies/shipping.txt?raw";
import terms from "@/content/policies/terms.txt?raw";

export const POLICIES = {
  contact: { title: "Contact Information", text: contact },
  shipping: { title: "Shipping Policy", text: shipping },
  refund: { title: "Return and Refund Policy", text: refund },
  privacy: { title: "Privacy Policy", text: privacy },
  terms: { title: "Terms of Service", text: terms },
} as const;
export type PolicySlug = keyof typeof POLICIES;

const clean = (t: string) => t.replace(/&nbsp;/g, " ").replace(/\*\*/g, "").replace(/^#+\s*/gm, "");
const isHeading = (l: string) => l.length < 40 && !/[.:,;]$/.test(l) && !l.includes("@");

export function PolicyText({ text }: { text: string }) {
  const lines = clean(text).split(/\n+/).map((l) => l.trim()).filter(Boolean).slice(1);
  return <div className="space-y-3">{lines.map((l, i) => isHeading(l)
    ? <h2 key={i} className="pt-5 font-hand text-3xl font-semibold leading-tight">{l}</h2>
    : <p key={i} className="font-hand text-xl leading-7">{l}</p>)}</div>;
}

