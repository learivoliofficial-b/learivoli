import { Link } from "@tanstack/react-router";

import privacy from "@/content/policies/privacy.txt?raw";
import refund from "@/content/policies/refund.txt?raw";
import shipping from "@/content/policies/shipping.txt?raw";
import terms from "@/content/policies/terms.txt?raw";

export const POLICIES = {
  shipping: { title: "Shipping Policy", text: shipping },
  refund: { title: "Return and Refund Policy", text: refund },
  privacy: { title: "Privacy Policy", text: privacy },
  terms: { title: "Terms of Service", text: terms },
} as const;
export type PolicySlug = keyof typeof POLICIES;

const clean = (t: string) => t.replace(/&nbsp;/g, " ").replace(/\*\*/g, "").replace(/^#+\s*/gm, "");
const isHeading = (l: string) => l.length < 70 && !/[.:,;]$/.test(l) && !l.includes("@");

export function PolicyText({ text }: { text: string }) {
  const lines = clean(text).split(/\n+/).map((l) => l.trim()).filter(Boolean).slice(1);
  return <div className="space-y-3">{lines.map((l, i) => isHeading(l)
    ? <h2 key={i} className="pt-5 font-hand text-3xl font-semibold leading-tight">{l}</h2>
    : <p key={i} className="font-hand text-xl leading-7 text-muted-foreground">{l}</p>)}</div>;
}

function PLink({ slug, children }: { slug: PolicySlug; children: React.ReactNode }) {
  return <Link to="/policies/$slug" params={{ slug }} className="underline decoration-1 underline-offset-4 hover:text-foreground">{children}</Link>;
}

export function PolicyContact() {
  const h = "font-hand text-3xl font-semibold leading-tight text-foreground";
  return <section aria-labelledby="contact-info" className="border-t border-border bg-background px-6 py-16 md:py-20">
    <div className="mx-auto grid max-w-4xl gap-10 font-hand text-xl leading-7 text-muted-foreground md:grid-cols-2 md:gap-x-16">
      <div className="md:col-span-2 text-center">
        <h2 id="contact-info" className="font-hand text-5xl font-semibold text-foreground">Contact Information</h2>
        <p className="mx-auto mt-3 max-w-xl">If you have questions about our products, your order, delivery, returns or refunds, please contact us using the details below.</p>
      </div>
      <div><h3 className={h}>Customer Support</h3><p className="mt-2">Brand: LéaRivoli<br />Email: <a href="mailto:learivoliofficial@gmail.com" className="underline underline-offset-4">learivoliofficial@gmail.com</a></p><p className="mt-2">Please include your order number when contacting us about an existing order. We aim to respond to enquiries as soon as reasonably possible.</p></div>
      <div><h3 className={h}>Business Details</h3><p className="mt-2">Business address: Stubbvägen 2, 231 68 Trelleborg, Sweden<br />Company registration number: 080331-xxxx</p></div>
      <div><h3 className={h}>Returns and Refunds</h3><p className="mt-2">Please contact learivoliofficial@gmail.com before sending a return. We will confirm the correct return address and instructions.</p><p className="mt-2">For details about your right to withdraw, return shipping costs and refunds, please read our <PLink slug="refund">Return and Refund Policy</PLink>.</p></div>
      <div><h3 className={h}>Shipping</h3><p className="mt-2">For information about delivery estimates, shipping costs, tracking and delivery destinations, please read our <PLink slug="shipping">Shipping Policy</PLink>.</p></div>
      <div><h3 className={h}>Privacy</h3><p className="mt-2">For questions about personal data or to exercise your data protection rights, email learivoliofficial@gmail.com. Read our <PLink slug="privacy">Privacy Policy</PLink>.</p></div>
      <div><h3 className={h}>Terms</h3><p className="mt-2">The rules for using our store and placing orders are in our <PLink slug="terms">Terms of Service</PLink>.</p></div>
    </div>
  </section>;
}
