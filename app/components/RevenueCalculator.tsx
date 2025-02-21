import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ChartOptions,
} from 'chart.js';
import { Bar } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

interface ChartData {
  name: string;
  value: number;
  color?: string;
}

interface CostBreakdown {
  category: string;
  items: {
    name: string;
    amount: number;
  }[];
  total: number;
}

const StandardRateBreakdown = () => {
  const breakdown: CostBreakdown[] = [
    {
      category: 'Direct Costs',
      items: [
        { name: 'Technician Base Pay', amount: 35.00 },
        { name: 'Payroll Taxes & Workers Comp', amount: 8.75 },
        { name: 'Vehicle Costs', amount: 5.00 },
        { name: 'Equipment/Tool Wear', amount: 3.00 },
        { name: 'Insurance', amount: 4.00 },
      ],
      total: 55.75
    },
    {
      category: 'Overhead',
      items: [
        { name: 'Administrative', amount: 4.00 },
        { name: 'Marketing', amount: 3.50 },
        { name: 'Software/Systems', amount: 2.00 },
        { name: 'Insurance Deductible Fund', amount: 2.00 },
        { name: 'Training', amount: 1.50 },
        { name: 'Emergency Fund', amount: 2.50 },
      ],
      total: 15.50
    },
    {
      category: 'Profit Components',
      items: [
        { name: 'Operating Profit', amount: 11.75 },
        { name: 'Growth/Equipment Fund', amount: 7.00 },
      ],
      total: 18.75
    }
  ];

  return (
    <div className="space-y-4">
      <div className="text-lg font-semibold">Standard Rate Breakdown ($90/hour)</div>
      {breakdown.map((category, idx) => (
        <div key={idx} className="space-y-2">
          <div className="font-medium text-gray-700">{category.category} (${category.total.toFixed(2)}/hour)</div>
          <div className="grid grid-cols-2 gap-2 pl-4">
            {category.items.map((item, itemIdx) => (
              <div key={itemIdx} className="flex justify-between">
                <span className="text-gray-600">{item.name}:</span>
                <span className="font-medium">${item.amount.toFixed(2)}</span>
              </div>
            ))}
          </div>
        </div>
      ))}
      <div className="text-right font-semibold">
        Total Rate: $90.00/hour
      </div>
    </div>
  );
};

const RevenueCalculator = () => {
  const [inputs, setInputs] = useState({
    hoursPerWeek: 40,
    weeksPerYear: 52,
    billablePercent: 45,
    emergencyPercent: 20,
    standardRate: 90,
    emergencyRate: 200,
    materialMarkupPercent: 33.3,
    baseLabor: 35,
    marketingBudget: 10000,
  });

  const [calculations, setCalculations] = useState({
    totalHours: 0,
    billableHours: 0,
    standardHours: 0,
    emergencyHours: 0,
    standardRevenue: 0,
    emergencyRevenue: 0,
    materialsSales: 0,
    materialsCost: 0,
    materialsProfit: 0,
    totalRevenue: 0,
    totalCosts: 0,
    netProfit: 0,
  });

  const calculateRevenue = () => {
    // Total hours calculation
    const totalHours = inputs.hoursPerWeek * inputs.weeksPerYear;
    const billableHours = totalHours * (inputs.billablePercent / 100);
    
    // Hours breakdown
    const standardHours = billableHours * (1 - inputs.emergencyPercent / 100);
    const emergencyHours = billableHours * (inputs.emergencyPercent / 100);
    
    // Revenue calculations
    const standardRevenue = standardHours * inputs.standardRate;
    const emergencyRevenue = emergencyHours * inputs.emergencyRate;
    
    // Materials calculations
    const materialsSales = billableHours * 60; // Average $60 per billable hour
    const materialsCost = materialsSales / (1 + inputs.materialMarkupPercent / 100);
    const materialsProfit = materialsSales - materialsCost;
    
    // Cost calculations
    const laborCost = billableHours * inputs.baseLabor;
    const overhead = {
      marketing: inputs.marketingBudget,
      insurance: 5000,
      vehicleMaintenance: 3000,
      tools: 2000,
      software: 2500,
      emergencyFund: 5000,
    };
    
    const totalCosts = laborCost + Object.values(overhead).reduce((a, b) => a + b, 0) + materialsCost;
    const totalRevenue = standardRevenue + emergencyRevenue + materialsSales;
    const netProfit = totalRevenue - totalCosts;

    setCalculations({
      totalHours,
      billableHours,
      standardHours,
      emergencyHours,
      standardRevenue,
      emergencyRevenue,
      materialsSales,
      materialsCost,
      materialsProfit,
      totalRevenue,
      totalCosts,
      netProfit,
    });
  };

  useEffect(() => {
    calculateRevenue();
  }, [inputs]);

  const handleInputChange = (name: keyof typeof inputs, value: string) => {
    setInputs(prev => ({
      ...prev,
      [name]: parseFloat(value),
    }));
  };

  const formatCurrency = (value: number): string => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const chartOptions: ChartOptions<'bar'> = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      y: {
        ticks: {
          callback: function(value) {
            if (typeof value === 'number') {
              return new Intl.NumberFormat('en-US', {
                style: 'currency',
                currency: 'USD',
                minimumFractionDigits: 0,
                maximumFractionDigits: 0,
              }).format(value);
            }
            return value;
          }
        }
      }
    },
    plugins: {
      tooltip: {
        callbacks: {
          label: function(context) {
            let value = context.raw;
            if (typeof value === 'number') {
              return formatCurrency(value);
            }
            return '';
          }
        }
      }
    }
  };

  const revenueChartData = {
    labels: ['Standard Hours', 'Emergency Hours', 'Materials Profit'],
    datasets: [
      {
        label: 'Revenue',
        data: [
          calculations.standardRevenue,
          calculations.emergencyRevenue,
          calculations.materialsProfit,
        ],
        backgroundColor: '#4f46e5',
      },
    ],
  };

  const profitChartData = {
    labels: ['Revenue', 'Costs', 'Net Profit'],
    datasets: [
      {
        label: 'Amount',
        data: [
          calculations.totalRevenue,
          -calculations.totalCosts,
          calculations.netProfit,
        ],
        backgroundColor: '#22c55e',
      },
    ],
  };

  return (
    <div className="p-4 space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Plumbing Business Revenue Calculator</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium">Hours per Week</label>
                <input
                  type="number"
                  className="mt-1 w-full rounded border p-2"
                  value={inputs.hoursPerWeek}
                  onChange={(e) => handleInputChange('hoursPerWeek', e.target.value)}
                />
              </div>
              <div>
                <label className="block text-sm font-medium">Billable %</label>
                <input
                  type="number"
                  className="mt-1 w-full rounded border p-2"
                  value={inputs.billablePercent}
                  onChange={(e) => handleInputChange('billablePercent', e.target.value)}
                />
              </div>
              <div>
                <label className="block text-sm font-medium">Emergency %</label>
                <input
                  type="number"
                  className="mt-1 w-full rounded border p-2"
                  value={inputs.emergencyPercent}
                  onChange={(e) => handleInputChange('emergencyPercent', e.target.value)}
                />
              </div>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium">Standard Rate</label>
                <input
                  type="number"
                  className="mt-1 w-full rounded border p-2"
                  value={inputs.standardRate}
                  onChange={(e) => handleInputChange('standardRate', e.target.value)}
                />
              </div>
              <div>
                <label className="block text-sm font-medium">Emergency Rate</label>
                <input
                  type="number"
                  className="mt-1 w-full rounded border p-2"
                  value={inputs.emergencyRate}
                  onChange={(e) => handleInputChange('emergencyRate', e.target.value)}
                />
              </div>
              <div>
                <label className="block text-sm font-medium">Marketing Budget</label>
                <input
                  type="number"
                  className="mt-1 w-full rounded border p-2"
                  value={inputs.marketingBudget}
                  onChange={(e) => handleInputChange('marketingBudget', e.target.value)}
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Standard Rate Breakdown</CardTitle>
          </CardHeader>
          <CardContent>
            <StandardRateBreakdown />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Revenue Breakdown</CardTitle>
          </CardHeader>
          <CardContent className="h-64">
            <Bar data={revenueChartData} options={chartOptions} />
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Profit Analysis</CardTitle>
        </CardHeader>
        <CardContent className="h-64">
          <Bar data={profitChartData} options={chartOptions} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <h3 className="font-medium">Total Hours</h3>
              <p>{Math.round(calculations.totalHours)}</p>
            </div>
            <div>
              <h3 className="font-medium">Billable Hours</h3>
              <p>{Math.round(calculations.billableHours)}</p>
            </div>
            <div>
              <h3 className="font-medium">Total Revenue</h3>
              <p className="text-green-600">{formatCurrency(calculations.totalRevenue)}</p>
            </div>
            <div>
              <h3 className="font-medium">Net Profit</h3>
              <p className={calculations.netProfit >= 0 ? 'text-green-600' : 'text-red-600'}>
                {formatCurrency(calculations.netProfit)}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default RevenueCalculator; 