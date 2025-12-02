import { Suspense } from 'react';
import { auth } from '@/auth';
import { getDashboardStats, getRecentDocuments, getDashboardChartData } from '@/app/actions/dashboard';
import { 
  AlertTriangle, 
  ArrowDownCircle, 
  ArrowUpCircle, 
  Clock, 
  FileText 
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { QuickActions } from '@/components/dashboard/quick-actions';
import { ChartContainer } from '@/components/dashboard/chart-container';
import { 
  StatsCardSkeleton, 
  ChartSkeleton, 
  RecentActivitySkeleton, 
  QuickActionsSkeleton 
} from '@/components/dashboard/skeletons';

async function DashboardStats() {
  const stats = await getDashboardStats();

  if (stats.error) {
    return (
      <div className="col-span-4 p-4 text-red-500 bg-red-50 rounded-lg">
        {stats.message || 'Error loading stats'}
      </div>
    );
  }

  const statCards = [
    {
      title: 'Stok Kritis',
      value: stats.stokKritis,
      icon: AlertTriangle,
      color: 'text-red-500',
      desc: 'Barang di bawah stok minimum',
      bg: 'bg-red-500/10'
    },
    {
      title: 'BAST Masuk (Bulan Ini)',
      value: stats.bastMasukBulanIni,
      icon: ArrowDownCircle,
      color: 'text-green-500',
      desc: 'Dokumen penerimaan barang',
      bg: 'bg-green-500/10'
    },
    {
      title: 'Permintaan Baru',
      value: stats.permintaanBaru,
      icon: Clock,
      color: 'text-orange-500',
      desc: 'SPB perlu diproses',
      bg: 'bg-orange-500/10'
    },
    {
      title: 'Total Penyaluran',
      value: stats.totalSppb,
      icon: ArrowUpCircle,
      color: 'text-blue-500',
      desc: 'Dokumen SPPB diterbitkan',
      bg: 'bg-blue-500/10'
    },
  ];

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {statCards.map((stat, index) => (
        <Card key={index} className="shadow-sm hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {stat.title}
            </CardTitle>
            <div className={`p-2 rounded-full ${stat.bg}`}>
              <stat.icon className={`h-4 w-4 ${stat.color}`} />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stat.value}</div>
            <p className="text-xs text-muted-foreground">
              {stat.desc}
            </p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

async function ChartSection() {
  const result = await getDashboardChartData('6m');
  const chartData = result.data || result || [];
  
  return <ChartContainer initialData={chartData} />;
}

async function RecentActivity() {
  const recentDocs = await getRecentDocuments();

  if (recentDocs.error && !recentDocs.recentSpb) {
    return (
      <Card className="shadow-md h-full">
        <CardHeader>
          <CardTitle>Aktivitas Terbaru</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-red-500">{recentDocs.message}</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="shadow-md h-full">
      <CardHeader>
        <CardTitle>Aktivitas Terbaru</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {(!recentDocs.recentSpb || recentDocs.recentSpb.length === 0) ? (
            <p className="text-sm text-muted-foreground">Belum ada aktivitas.</p>
          ) : (
            recentDocs.recentSpb.map((item) => (
              <div key={item.id} className="flex items-center justify-between border-b pb-4 last:border-0 last:pb-0">
                <div className="flex items-center gap-4">
                  <div className="h-10 w-10 rounded-full bg-orange-100 flex items-center justify-center">
                    <FileText className="h-5 w-5 text-orange-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">{item.number}</p>
                    <p className="text-xs text-muted-foreground">{item.actor}</p>
                  </div>
                </div>
                <div className="text-xs font-medium text-muted-foreground">
                  {new Date(item.date).toLocaleDateString('id-ID')}
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
}

export default async function DashboardPage() {
  const session = await auth();

  return (
    <div className="flex flex-1 flex-col gap-6 p-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Dashboard</h2>
          <p className="text-muted-foreground">
            Selamat datang, {session?.user?.fullName} ({session?.user?.username})
          </p>
        </div>
      </div>

      {/* Stat Cards with Suspense */}
      <Suspense fallback={<StatsCardSkeleton />}>
        <DashboardStats />
      </Suspense>

      {/* Chart Section with Suspense */}
      <div className="w-full">
        <Suspense fallback={<ChartSkeleton />}>
          <ChartSection />
        </Suspense>
      </div>

      {/* Bottom Section: Quick Actions & Recent Activity */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <div className="col-span-3">
          <Suspense fallback={<QuickActionsSkeleton />}>
            <QuickActions />
          </Suspense>
        </div>

        <div className="col-span-4">
          <Suspense fallback={<RecentActivitySkeleton />}>
            <RecentActivity />
          </Suspense>
        </div>
      </div>
    </div>
  );
}
