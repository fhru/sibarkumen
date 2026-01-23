import { fetchStockOpnameById } from '@/drizzle/actions/stock-opname';
import { StockOpnameDetailClient } from '@/app/dashboard/stock-opname/components/stock-opname-detail-client';
import { notFound } from 'next/navigation';

export default async function StockOpnameDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const result = await fetchStockOpnameById(parseInt(id));

  if (!result.success || !result.data) {
    notFound();
  }

  return <StockOpnameDetailClient data={result.data} />;
}
