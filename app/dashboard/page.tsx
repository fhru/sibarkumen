import {
  fetchLowStockItems,
  fetchRecentActivity,
  fetchDashboardStats,
  fetchFastMovingItems,
  fetchDeadStockItems,
  fetchCategoryDistribution,
} from "../../drizzle/actions/dashboard";
import { redirect } from "next/navigation";
import { DashboardChart } from "../../components/dashboard/dashboard-chart";
import { QuickActions } from "../../components/dashboard/quick-actions";
import { LowStockList } from "../../components/dashboard/low-stock-list";
import { RecentActivity } from "../../components/dashboard/recent-activity";
import { StatCards } from "../../components/dashboard/stat-cards";
import { FastMovingList } from "../../components/dashboard/fast-moving-list";
import { DeadStockList } from "../../components/dashboard/dead-stock-list";
import { CategoryPieChart } from "../../components/dashboard/category-distribution-chart";
import { getSession } from "@/lib/auth-utils";
import { Role } from "@/config/nav-items";

export const metadata = {
  title: "Dashboard | Sibarkumen",
  description: "Overview inventaris dan aktivitas terbaru.",
};

export default async function DashboardPage() {
  const session = await getSession();
  const userRole = (session?.user.role as Role) || "petugas";

  if (userRole === "petugas") {
    redirect("/dashboard/spb");
  }

  const [
    lowStockItems,
    recentActivity,
    stats,
    fastMovingItems,
    deadStockItems,
    categoryDistribution,
  ] = await Promise.all([
    fetchLowStockItems(),
    fetchRecentActivity(),
    fetchDashboardStats(),
    fetchFastMovingItems(),
    fetchDeadStockItems(),
    fetchCategoryDistribution(),
  ]);

  return (
    <div className="flex-1 space-y-6 p-2 lg:p-4">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h2 className="text-2xl font-bold tracking-tight">Overview</h2>
          <p className="text-sm text-muted-foreground">
            Selamat datang kembali, berikut ringkasan hari ini.
          </p>
        </div>
      </div>

      {/* Main Layout: 70/30 Split */}
      <div className="grid grid-cols-1 lg:grid-cols-10 gap-6">
        {/* Left Column (70%) */}
        <div className="lg:col-span-7 space-y-6">
          {/* 1. Stat Cards */}
          <section>
            <StatCards stats={stats} />
          </section>

          {/* 2. Quick Actions */}
          <section>
            <QuickActions role={userRole} />
          </section>

          {/* 3. Chart */}
          <section>
            <DashboardChart />
          </section>

          {/* 4. Recent Activity */}
          <section>
            <RecentActivity activities={recentActivity} />
          </section>
        </div>

        {/* Right Column (30%) */}
        <div className="lg:col-span-3 space-y-6">
          <LowStockList items={lowStockItems} />
          <CategoryPieChart data={categoryDistribution} />
          <FastMovingList items={fastMovingItems} />
          <DeadStockList items={deadStockItems} />
        </div>
      </div>
    </div>
  );
}
