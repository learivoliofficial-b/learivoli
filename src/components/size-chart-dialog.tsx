import { Ruler } from "lucide-react";
import { useState } from "react";

import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import type { SizeChart } from "@/lib/size-chart";

export function SizeChartDialog({ chart, selectedSize }: { chart: SizeChart; selectedSize?: string | undefined }) {
  const [unit, setUnit] = useState<"cm" | "inches">("cm");
  return <Dialog>
    <DialogTrigger className="inline-flex items-center gap-1 text-[9px] font-normal uppercase underline underline-offset-2 text-muted-foreground hover:text-foreground">
      <Ruler className="size-3" />Size chart
    </DialogTrigger>
    <DialogContent className="max-h-[90svh] w-[calc(100%-1.5rem)] max-w-lg grid-cols-[minmax(0,1fr)] overflow-y-auto rounded-none p-5 sm:p-8">
      <DialogHeader className="text-left">
        <DialogTitle className="text-sm font-semibold uppercase tracking-[0.12em]">Size chart</DialogTitle>
        <DialogDescription className="text-[11px]">Measured on the garment laid flat. Allow ±1–2 cm.</DialogDescription>
      </DialogHeader>

      <div className="flex gap-1" role="group" aria-label="Unit">
        {(["cm", "inches"] as const).map((u) => <button key={u} type="button" aria-pressed={unit === u} onClick={() => setUnit(u)} className={`h-8 border px-3 text-[10px] uppercase ${unit === u ? "border-primary bg-primary text-primary-foreground" : "border-border bg-background hover:border-foreground"}`}>{u}</button>)}
      </div>

      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-[10px] sm:text-[11px]">
          <thead><tr className="border-b border-foreground">
            <th className="py-2 pr-2 text-left font-semibold uppercase">({unit === "cm" ? "cm" : "in"})</th>
            {chart.sizes.map((s) => <th key={s} className={`px-1 py-2 text-center font-semibold uppercase ${s === selectedSize ? "bg-muted" : ""}`}>{s}</th>)}
          </tr></thead>
          <tbody>{chart.rows.map((row) => <tr key={row.label} className="border-b border-border">
            <td className="py-2.5 pr-2 font-medium">{row.label}</td>
            {(unit === "cm" ? row.cm : row.inches).map((v, i) => <td key={chart.sizes[i]} className={`px-1 py-2.5 text-center tabular-nums ${chart.sizes[i] === selectedSize ? "bg-muted font-semibold" : ""}`}>{v}</td>)}
          </tr>)}</tbody>
        </table>
      </div>

      <div>
        <h3 className="mb-3 text-[10px] font-semibold uppercase tracking-[0.12em]">How to measure</h3>
        <ol className="space-y-3">
          {chart.rows.map((row, i) => <li key={row.label} className="flex gap-3 text-[11px] leading-5">
            <span className="grid size-5 shrink-0 place-items-center rounded-full bg-primary text-[10px] text-primary-foreground">{i + 1}</span>
            <span><span className="font-semibold">{row.label}: </span><span className="text-muted-foreground">{row.howTo}</span></span>
          </li>)}
        </ol>
        <p className="mt-4 text-[11px] leading-5 text-muted-foreground">Tip: measure a T-shirt you already love and compare it with the chart.</p>
      </div>
    </DialogContent>
  </Dialog>;
}
