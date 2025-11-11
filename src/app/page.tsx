import { ArrowUpRight, CalendarClock, TrendingUp } from "lucide-react";
import type { JSX } from "react";

import { RevenueTrend } from "@/components/charts/revenue-trend";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

const metricCards = [
  {
    label: "Projected Tuition (2032)",
    value: "SAR 36.5M",
    delta: "+8.1%",
    description: "Includes CPI and curriculum ramp assumptions",
  },
  {
    label: "Operating Margin",
    value: "31.0%",
    delta: "+2.0 pp",
    description: "Post-ramp steady-state estimate",
  },
  {
    label: "Capex Headroom",
    value: "SAR 12.0M",
    delta: "Updated this week",
    description: "Remaining vs. 2028 capex plan",
  },
];

export default function Home(): JSX.Element {
  return (
    <div className="space-y-10">
      <section className="flex flex-col gap-6 rounded-lg border border-[--color-border] bg-[--color-card] px-8 py-10 shadow-md">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="max-w-2xl space-y-3">
            <Badge variant="fluent" className="w-fit rounded-md px-3 py-1 text-xs">
              2028 Relocation Program
            </Badge>
            <h1 className="text-3xl font-semibold tracking-tight text-[--color-foreground] sm:text-4xl">
              Model the complete school relocation journey.
            </h1>
            <p className="text-base text-[--color-muted-foreground]">
              Generate tuition projections by curriculum, align staffing plans with ramp
              capacity, and confirm P&amp;L, Balance Sheet, and Cash Flow convergence in
              under a second.
            </p>
          </div>
          <div className="flex shrink-0 gap-3">
            <Button variant="secondary" size="md" rightIcon={<ArrowUpRight className="size-4" />}>
              View Latest Scenario
            </Button>
            <Button variant="primary" size="md" rightIcon={<TrendingUp className="size-4" />}>
              Compare Plans
            </Button>
          </div>
        </div>
        <div className="flex items-center gap-3 text-sm text-[--color-muted-foreground]">
          <CalendarClock className="size-4" aria-hidden />
          <span>Last synchronized: {new Date().toLocaleString()}</span>
        </div>
      </section>

      <section className="grid gap-6 md:grid-cols-3">
        {metricCards.map((card) => (
          <Card key={card.label}>
            <CardHeader>
              <CardDescription>{card.label}</CardDescription>
              <CardTitle className="text-2xl font-semibold text-[--color-foreground]">
                {card.value}
              </CardTitle>
            </CardHeader>
            <CardContent className="flex items-center justify-between pt-0">
              <span className="text-sm font-medium text-[--color-primary]">{card.delta}</span>
              <p className="max-w-[12rem] text-xs text-right text-[--color-muted-foreground]">
                {card.description}
              </p>
            </CardContent>
          </Card>
        ))}
      </section>

      <section className="grid gap-6 lg:grid-cols-[2fr_1fr]">
        <RevenueTrend />
        <Card>
          <CardHeader>
            <CardTitle>Next Steps</CardTitle>
            <CardDescription>Focus on curriculum-specific ramp adjustments.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="rounded-md border border-dashed border-[--color-border] bg-[--color-muted]/40 p-4">
              <p className="text-sm font-medium text-[--color-foreground]">
                Curriculum ramp audit
              </p>
              <p className="text-xs text-[--color-muted-foreground]">
                Confirm French curriculum stays at 100% post-2028 while IB follows the staged
                ramp.
              </p>
            </div>
            <div className="rounded-md border border-dashed border-[--color-border] bg-[--color-muted]/40 p-4">
              <p className="text-sm font-medium text-[--color-foreground]">
                Staffing salary review
              </p>
              <p className="text-xs text-[--color-muted-foreground]">
                Differentiate teacher vs. non-teacher escalation prior to Week 3 financial
                engine implementation.
              </p>
            </div>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
