'use client';

import { AreaChart, Card, Legend } from '@tremor/react';
import type { JSX } from 'react';

interface RevenueTrendDatum {
  year: number;
  tuition: number;
  expenses: number;
  ebitdaMargin: number;
}

export interface RevenueTrendProps {
  data?: RevenueTrendDatum[];
  className?: string;
}

const defaultData: RevenueTrendDatum[] = [
  { year: 2028, tuition: 24.3, expenses: 18.1, ebitdaMargin: 0.26 },
  { year: 2029, tuition: 27.5, expenses: 20.4, ebitdaMargin: 0.25 },
  { year: 2030, tuition: 30.8, expenses: 22.6, ebitdaMargin: 0.27 },
  { year: 2031, tuition: 33.9, expenses: 24.1, ebitdaMargin: 0.29 },
  { year: 2032, tuition: 36.5, expenses: 25.3, ebitdaMargin: 0.31 },
];

const valueFormatter = (number: number): string =>
  `${Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 1,
  }).format(number)}M`;

export function RevenueTrend({
  data = defaultData,
  className,
}: RevenueTrendProps): JSX.Element {
  return (
    <Card className={className}>
      <div className="mb-4 flex items-center justify-between gap-4">
        <div>
          <h3 className="text-base font-semibold text-[--color-foreground]">
            Tuition vs. Operating Expenses
          </h3>
          <p className="text-sm text-[--color-muted-foreground]">
            Projected figures for near-term ramp (2028-2032)
          </p>
        </div>
        <Legend
          categories={['Tuition revenue', 'Operating expenses']}
          colors={['indigo', 'rose']}
        />
      </div>
      <AreaChart
        className="mt-4 h-72"
        data={data}
        index="year"
        categories={['tuition', 'expenses']}
        colors={['indigo', 'rose']}
        valueFormatter={valueFormatter}
        showLegend={false}
        yAxisWidth={72}
      />
    </Card>
  );
}


