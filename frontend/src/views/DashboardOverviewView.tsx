'use client';

import { useEffect, useState } from 'react';
import { getSalesSummary, getTopProducts, downloadSalesCsv } from '@/controllers/sales.controller';
import { SalesSummary, TopProduct } from '@/models/types';
import { formatCurrency } from '@/lib/format';
import { StatTile, Card } from '@/components/Card';
import { Button } from '@/components/Button';
import { RoleGuard } from '@/components/RoleGuard';

function OverviewInner() {
  const [summary, setSummary] = useState<SalesSummary | null>(null);
  const [topProducts, setTopProducts] = useState<TopProduct[]>([]);
  const [exporting, setExporting] = useState(false);

  useEffect(() => {
    getSalesSummary().then(setSummary);
    getTopProducts(5).then(setTopProducts);
  }, []);

  async function handleExport() {
    setExporting(true);
    try {
      await downloadSalesCsv();
    } finally {
      setExporting(false);
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-3xl text-ink">Overview &amp; sales</h1>
          <p className="mt-1 text-sm text-pine-700/60">A snapshot of how the shop is performing.</p>
        </div>
        <Button variant="ghost" onClick={handleExport} disabled={exporting}>
          {exporting ? 'Exporting…' : 'Export report CSV'}
        </Button>
      </div>

      {summary && (
        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
          <StatTile label="Total revenue" value={formatCurrency(summary.totalRevenue)} />
          <StatTile label="Total orders" value={String(summary.totalOrders)} />
          <StatTile
            label="Average order value"
            value={formatCurrency(summary.averageOrderValue)}
          />
        </div>
      )}

      <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card>
          <h2 className="font-display text-lg text-ink">Orders by status</h2>
          <ul className="mt-3 flex flex-col gap-2 text-sm">
            {summary?.byStatus.map((row) => (
              <li key={row.status} className="flex items-center justify-between">
                <span className="capitalize text-pine-700/80">{row.status}</span>
                <span className="font-medium text-ink">{row.count}</span>
              </li>
            ))}
          </ul>
        </Card>

        <Card>
          <h2 className="font-display text-lg text-ink">Top products</h2>
          <ul className="mt-3 flex flex-col gap-2 text-sm">
            {topProducts.map((p) => (
              <li key={p.productId} className="flex items-center justify-between">
                <span className="text-pine-700/80">{p.name}</span>
                <span className="font-medium text-ink">
                  {p.unitsSold} sold · {formatCurrency(p.revenue)}
                </span>
              </li>
            ))}
            {topProducts.length === 0 && (
              <li className="text-pine-700/50">No sales recorded yet.</li>
            )}
          </ul>
        </Card>
      </div>
    </div>
  );
}

export function DashboardOverviewView() {
  return (
    <RoleGuard roles={['admin', 'manager']}>
      <OverviewInner />
    </RoleGuard>
  );
}
