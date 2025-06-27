import { NextResponse } from 'next/server';

// Mock data for development - in production, this would connect to your database
export async function GET() {
  const mockStats = {
    current: {
      activeVisitors: Math.floor(Math.random() * 10) + 1,
      dailyLeads: Math.floor(Math.random() * 50) + 20,
      weeklyLeads: Math.floor(Math.random() * 200) + 100,
      highValueLeads: Math.floor(Math.random() * 15) + 5
    },
    scoring: {
      averageScore: Math.floor(Math.random() * 30) + 50,
      scoreDistribution: {
        '0-20': Math.floor(Math.random() * 20),
        '21-40': Math.floor(Math.random() * 30),
        '41-60': Math.floor(Math.random() * 40),
        '61-80': Math.floor(Math.random() * 25),
        '81-100': Math.floor(Math.random() * 15)
      },
      topBehaviors: [
        { behavior: 'pageView', count: Math.floor(Math.random() * 200) + 100 },
        { behavior: 'serviceBrowse', count: Math.floor(Math.random() * 100) + 50 },
        { behavior: 'timeOnSite2Min', count: Math.floor(Math.random() * 80) + 30 },
        { behavior: 'phoneClick', count: Math.floor(Math.random() * 50) + 10 },
        { behavior: 'emergencyClick', count: Math.floor(Math.random() * 30) + 5 }
      ]
    },
    conversion: {
      emergencyRate: Math.floor(Math.random() * 20) + 5,
      contactRate: Math.floor(Math.random() * 30) + 10,
      phoneRate: Math.floor(Math.random() * 25) + 8
    },
    alerts: {
      today: Math.floor(Math.random() * 10) + 2,
      thisWeek: Math.floor(Math.random() * 40) + 10,
      byType: {
        immediate: Math.floor(Math.random() * 5),
        high_priority: Math.floor(Math.random() * 10),
        standard: Math.floor(Math.random() * 20),
        batch: Math.floor(Math.random() * 30)
      }
    },
    trends: {
      hourlyVisitors: Array.from({ length: 24 }, (_, i) => ({
        hour: `${i}:00`,
        visitors: Math.floor(Math.random() * 20) + (i >= 8 && i <= 18 ? 10 : 2)
      })),
      dailyVisitors: Array.from({ length: 7 }, (_, i) => {
        const date = new Date();
        date.setDate(date.getDate() - (6 - i));
        return {
          date: date.toLocaleDateString(),
          visitors: Math.floor(Math.random() * 100) + 50
        };
      }),
      topPages: [
        { page: 'Home', views: Math.floor(Math.random() * 200) + 150 },
        { page: 'Emergency Services', views: Math.floor(Math.random() * 150) + 80 },
        { page: 'Bathroom Renovation', views: Math.floor(Math.random() * 100) + 60 },
        { page: 'Contact', views: Math.floor(Math.random() * 80) + 40 },
        { page: 'Service Areas', views: Math.floor(Math.random() * 60) + 30 }
      ],
      topReferrers: [
        { source: 'Google', count: Math.floor(Math.random() * 100) + 60 },
        { source: 'Direct', count: Math.floor(Math.random() * 80) + 40 },
        { source: 'Facebook', count: Math.floor(Math.random() * 40) + 20 },
        { source: 'Bing', count: Math.floor(Math.random() * 30) + 10 },
        { source: 'Other', count: Math.floor(Math.random() * 20) + 5 }
      ]
    }
  };

  return NextResponse.json(mockStats);
}