import { auth } from '@/auth';
import { getDashboardStats, getRecentDocuments } from '@/app/actions/dashboard';
import { 
  AlertTriangle, 
  ArrowDownCircle, 
  ArrowUpCircle, 
  Clock, 
  Package, 
  FileText 
} from 'lucide-react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default async function DashboardPage() {
  const session = await auth();
  const stats = await getDashboardStats();
  const recentDocs = await getRecentDocuments();

  if (stats.error) {
    return <div className="p-4 text-red-500">Error loading stats</div>;
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
    <div className="flex flex-1 flex-col gap-6 p-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Dashboard</h2>
          <p className="text-muted-foreground">
            Selamat datang, {session?.user?.fullName} ({session?.user?.username})
          </p>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {statCards.map((stat, index) => (
          <Card key={index}>
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

      {/* Recent Activity */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        {/* Recent SPB */}
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle>Permintaan Barang Terbaru</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-8">
              {recentDocs.recentSpb.length === 0 ? (
                <p className="text-sm text-muted-foreground">Belum ada data SPB.</p>
              ) : (
                recentDocs.recentSpb.map((item) => (
                  <div key={item.id} className="flex items-center">
                    <div className="h-9 w-9 rounded-full bg-orange-100 flex items-center justify-center mr-4">
                        <FileText className="h-5 w-5 text-orange-600" />
                    </div>
                    <div className="ml-4 space-y-1">
                      <p className="text-sm font-medium leading-none">{item.number}</p>
                      <p className="text-sm text-muted-foreground">
                        {item.actor}
                      </p>
                    </div>
                    <div className="ml-auto font-medium text-sm">
                        {new Date(item.date).toLocaleDateString('id-ID')}
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        {/* Recent SPPB */}
        <Card className="col-span-3">
          <CardHeader>
            <CardTitle>Penyaluran Terakhir</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-8">
              {recentDocs.recentSppb.length === 0 ? (
                <p className="text-sm text-muted-foreground">Belum ada data SPPB.</p>
              ) : (
                 recentDocs.recentSppb.map((item) => (
                  <div key={item.id} className="flex items-center">
                     <div className="h-9 w-9 rounded-full bg-blue-100 flex items-center justify-center mr-4">
                        <Package className="h-5 w-5 text-blue-600" />
                    </div>
                    <div className="ml-4 space-y-1">
                      <p className="text-sm font-medium leading-none">{item.number}</p>
                      <p className="text-sm text-muted-foreground">
                        {item.actor}
                      </p>
                    </div>
                     <div className="ml-auto font-medium text-sm">
                        {new Date(item.date).toLocaleDateString('id-ID')}
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
