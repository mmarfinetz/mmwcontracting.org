'use client';

import { useState, useEffect } from 'react';
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface DashboardStats {
  current: {
    activeVisitors: number;
    dailyLeads: number;
    weeklyLeads: number;
    highValueLeads: number;
  };
  scoring: {
    averageScore: number;
    scoreDistribution: Record<string, number>;
    topBehaviors: Array<{ behavior: string; count: number }>;
  };
  conversion: {
    emergencyRate: number;
    contactRate: number;
    phoneRate: number;
  };
  alerts: {
    today: number;
    thisWeek: number;
    byType: Record<string, number>;
  };
  trends: {
    hourlyVisitors: Array<{ hour: string; visitors: number }>;
    dailyVisitors: Array<{ date: string; visitors: number }>;
    topPages: Array<{ page: string; views: number }>;
    topReferrers: Array<{ source: string; count: number }>;
  };
}

export default function LeadDashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [autoRefresh, setAutoRefresh] = useState(true);

  useEffect(() => {
    fetchDashboardData();
    
    if (autoRefresh) {
      const interval = setInterval(fetchDashboardData, 30000); // Refresh every 30 seconds
      return () => clearInterval(interval);
    }
  }, [autoRefresh]);

  const fetchDashboardData = async () => {
    try {
      const response = await fetch('/api/dashboard/stats');
      if (!response.ok) throw new Error('Failed to fetch dashboard data');
      const data = await response.json();
      setStats(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="flex items-center justify-center h-screen">Loading dashboard...</div>;
  if (error) return <div className="flex items-center justify-center h-screen text-red-500">Error: {error}</div>;
  if (!stats) return null;

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Lead Monitoring Dashboard</h1>
          <p className="text-gray-600 mt-2">Real-time visitor tracking and lead intelligence</p>
          <div className="mt-4">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={autoRefresh}
                onChange={(e) => setAutoRefresh(e.target.checked)}
                className="mr-2"
              />
              Auto-refresh every 30 seconds
            </label>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <MetricCard
            title="Active Visitors"
            value={stats.current.activeVisitors}
            subtitle="Currently on site"
            color="bg-blue-500"
          />
          <MetricCard
            title="Today's Leads"
            value={stats.current.dailyLeads}
            subtitle={`${stats.current.highValueLeads} high value`}
            color="bg-green-500"
          />
          <MetricCard
            title="Average Score"
            value={`${stats.scoring.averageScore}/100`}
            subtitle="Lead quality"
            color="bg-purple-500"
          />
          <MetricCard
            title="Alerts Today"
            value={stats.alerts.today}
            subtitle={`${stats.alerts.thisWeek} this week`}
            color="bg-red-500"
          />
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Hourly Trend */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-semibold mb-4">Visitor Activity (24h)</h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={stats.trends.hourlyVisitors}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="hour" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="visitors" stroke="#0088FE" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Score Distribution */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-semibold mb-4">Lead Score Distribution</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={Object.entries(stats.scoring.scoreDistribution).map(([range, count]) => ({ range, count }))}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="range" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="count" fill="#00C49F" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Conversion Rates */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <ConversionCard
            title="Emergency Clicks"
            rate={stats.conversion.emergencyRate}
            icon="🚨"
          />
          <ConversionCard
            title="Phone Clicks"
            rate={stats.conversion.phoneRate}
            icon="📞"
          />
          <ConversionCard
            title="Form Starts"
            rate={stats.conversion.contactRate}
            icon="📝"
          />
        </div>

        {/* Tables Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Top Behaviors */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-semibold mb-4">Top Visitor Behaviors</h3>
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-2">Behavior</th>
                  <th className="text-right py-2">Count</th>
                </tr>
              </thead>
              <tbody>
                {stats.scoring.topBehaviors.map((item, index) => (
                  <tr key={index} className="border-b">
                    <td className="py-2">{formatBehavior(item.behavior)}</td>
                    <td className="text-right py-2">{item.count}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Top Pages */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-semibold mb-4">Most Viewed Pages</h3>
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-2">Page</th>
                  <th className="text-right py-2">Views</th>
                </tr>
              </thead>
              <tbody>
                {stats.trends.topPages.slice(0, 5).map((item, index) => (
                  <tr key={index} className="border-b">
                    <td className="py-2 truncate max-w-xs">{item.page}</td>
                    <td className="text-right py-2">{item.views}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Recent Alerts Section */}
        <div className="mt-8 bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-4">Alert Summary</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {Object.entries(stats.alerts.byType).map(([type, count]) => (
              <div key={type} className="text-center">
                <div className="text-2xl font-bold">{count}</div>
                <div className="text-sm text-gray-600 capitalize">{type.replace('_', ' ')}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function MetricCard({ title, value, subtitle, color }: { title: string; value: string | number; subtitle: string; color: string }) {
  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-600">{title}</p>
          <p className="text-2xl font-bold mt-1">{value}</p>
          <p className="text-sm text-gray-500 mt-1">{subtitle}</p>
        </div>
        <div className={`w-12 h-12 ${color} rounded-full opacity-20`}></div>
      </div>
    </div>
  );
}

function ConversionCard({ title, rate, icon }: { title: string; rate: number; icon: string }) {
  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <div className="flex items-center justify-between mb-4">
        <h4 className="font-semibold">{title}</h4>
        <span className="text-2xl">{icon}</span>
      </div>
      <div className="text-3xl font-bold">{rate}%</div>
      <div className="mt-2">
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className="bg-blue-500 h-2 rounded-full"
            style={{ width: `${rate}%` }}
          ></div>
        </div>
      </div>
    </div>
  );
}

function formatBehavior(behavior: string): string {
  const formats: Record<string, string> = {
    emergencyClick: 'Emergency Button Click',
    phoneClick: 'Phone Number Click',
    contactFormStart: 'Started Contact Form',
    serviceBrowse: 'Browsed Services',
    pageView: 'Page View',
    timeOnSite2Min: 'Stayed 2+ Minutes',
    deepScroll: 'Scrolled Deep',
  };
  return formats[behavior] || behavior;
}