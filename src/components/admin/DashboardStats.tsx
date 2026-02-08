import { useEffect, useState } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import { Users, ShoppingBag, DollarSign, Package } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { analytics } from '@/lib/api';
import { useSiteContent } from '@/context/SiteContentContext';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

interface OverviewPoint {
  name: string;
  sales?: number;
  revenue?: number;
}

export function DashboardStats() {
  const { products } = useSiteContent();
  const [stats, setStats] = useState({
    revenue: 0,
    activeOrders: 0,
    products: 0,
    activeUsers: 0,
  });
  const [overviewData, setOverviewData] = useState<OverviewPoint[]>([]);

  useEffect(() => {
    async function fetchStats() {
      try {
        const res = await analytics.stats();
        if (!res || typeof res !== 'object') return;
        const payload = (res as { data?: Record<string, unknown> }).data ?? res;
        const p = payload as Record<string, unknown>;
        setStats({
          revenue: Number(p.revenue) ?? 0,
          activeOrders: Number(p.activeOrders) ?? 0,
          products: Number(p.products) ?? 0,
          activeUsers: Number(p.activeUsers) ?? 0,
        });
      } catch (error) {
        console.error('Failed to fetch analytics:', error);
      }
    }
    fetchStats();
  }, []);

  useEffect(() => {
    async function fetchOverview() {
      try {
        const res = await analytics.timeStats();
        if (res && Array.isArray(res)) {
          const points = (res as OverviewPoint[]).map((item) => ({
            name: String(item.name ?? ''),
            sales: Number(item.sales ?? item.revenue ?? 0),
          }));
          setOverviewData(points);
        } else if (res && typeof res === 'object' && Array.isArray((res as { data?: unknown }).data)) {
          const data = (res as { data: OverviewPoint[] }).data;
          setOverviewData(data.map((item) => ({ name: String(item.name ?? ''), sales: Number(item.sales ?? item.revenue ?? 0) })));
        }
      } catch (error) {
        console.error('Failed to fetch overview:', error);
      }
    }
    fetchOverview();
  }, []);

  const categoryCount = products.reduce((acc, product) => {
    acc[product.category] = (acc[product.category] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const pieData = Object.entries(categoryCount).map(([name, value]) => ({ name, value }));
  const finalPieData = pieData.length > 0 ? pieData : [{ name: 'No Data', value: 1 }];

  const statCards = [
    { title: 'Total Revenue', value: `₹${stats.revenue.toLocaleString()}`, icon: DollarSign, color: 'text-green-500' },
    { title: 'Active Orders', value: String(stats.activeOrders), icon: ShoppingBag, color: 'text-blue-500' },
    { title: 'Products', value: String(stats.products), icon: Package, color: 'text-orange-500' },
    { title: 'Active Now', value: String(stats.activeUsers), icon: Users, color: 'text-pink-500' },
  ];

  return (
    <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {statCards.map((stat, i) => (
          <Card key={i} className="backdrop-blur-sm bg-white/50 dark:bg-slate-900/50 border-none shadow-sm hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
              <stat.icon className={`h-4 w-4 ${stat.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-xs text-muted-foreground">—</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4 backdrop-blur-sm bg-white/50 dark:bg-slate-900/50 border-none shadow-sm">
          <CardHeader>
            <CardTitle>Overview</CardTitle>
          </CardHeader>
          <CardContent className="pl-2">
            {overviewData.length > 0 ? (
              <ResponsiveContainer width="100%" height={350}>
                <LineChart data={overviewData}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis dataKey="name" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `₹${value}`} />
                  <Tooltip
                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                  />
                  <Line type="monotone" dataKey="sales" stroke="#8884d8" strokeWidth={2} dot={{ r: 4 }} activeDot={{ r: 8 }} />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[350px] flex items-center justify-center text-muted-foreground text-sm">No overview data. Configure /api/analytics/time-stats to show revenue over time.</div>
            )}
          </CardContent>
        </Card>

        <Card className="col-span-3 backdrop-blur-sm bg-white/50 dark:bg-slate-900/50 border-none shadow-sm">
          <CardHeader>
            <CardTitle>Inventory Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={350}>
                <PieChart>
                    <Pie
                        data={finalPieData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={80}
                        fill="#8884d8"
                        paddingAngle={5}
                        dataKey="value"
                    >
                        {finalPieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                    </Pie>
                    <Tooltip />
                </PieChart>
            </ResponsiveContainer>
             <div className="flex justify-center gap-4 text-xs text-muted-foreground mt-4 flex-wrap">
                {finalPieData.map((entry, index) => (
                    <div key={entry.name} className="flex items-center gap-1">
                        <div className="w-2 h-2 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }} />
                        {entry.name}
                    </div>
                ))}
             </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
