'use client';

import React, { useState, useEffect, ReactNode } from 'react';

// Define interfaces for component props
interface ComponentProps {
  className?: string;
  children?: ReactNode;
}

// Check if we're in standalone or Next.js environment
const isStandalone = typeof window !== 'undefined' && 
                     process.env.STANDALONE_CALCULATOR === 'true';

// Conditionally import components based on environment
let Card, CardContent, CardHeader, CardTitle;
try {
  if (!isStandalone) {
    // Next.js app imports
    const ui = require('@/components/ui/card');
    Card = ui.Card;
    CardContent = ui.CardContent;
    CardHeader = ui.CardHeader;
    CardTitle = ui.CardTitle;
  } else {
    // Create simple stub components for standalone mode
    Card = ({ className, children }: ComponentProps) => <div className={`win95-card ${className || ''}`}>{children}</div>;
    CardContent = ({ className, children }: ComponentProps) => <div className={`win95-card-content ${className || ''}`}>{children}</div>;
    CardHeader = ({ className, children }: ComponentProps) => <div className={`win95-card-header ${className || ''}`}>{children}</div>;
    CardTitle = ({ className, children }: ComponentProps) => <div className={`win95-card-title ${className || ''}`}>{children}</div>;
  }
} catch (error) {
  console.error('Error loading UI components:', error);
  // Fallback components
  Card = ({ className, children }: ComponentProps) => <div className={`win95-card ${className || ''}`}>{children}</div>;
  CardContent = ({ className, children }: ComponentProps) => <div className={`win95-card-content ${className || ''}`}>{children}</div>;
  CardHeader = ({ className, children }: ComponentProps) => <div className={`win95-card-header ${className || ''}`}>{children}</div>;
  CardTitle = ({ className, children }: ComponentProps) => <div className={`win95-card-title ${className || ''}`}>{children}</div>;
}

// Import chart components
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, 
  Tooltip, Legend, ResponsiveContainer, BarChart, Bar, Cell 
} from 'recharts';

// Import CSS
import '@/css/win95.css';

interface ChartData {
  name: string;
  value: number;
  color?: string;
  breakdown?: { label: string; value: number }[];
}

const RevenueCalculator = () => {
  const [inputs, setInputs] = useState({
    hoursPerWeek: 40,
    weeksPerYear: 52,
    billablePercent: 45,
    emergencyPercent: 20,
    standardRate: 85,
    emergencyRate: 200,
    materialMarkupPercent: 33.3,
    baseLabor: 30,
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

  const handleInputChange = (name: string, value: string) => {
    setInputs(prev => ({
      ...prev,
      [name]: parseFloat(value),
    }));
  };

  const revenueBreakdown: ChartData[] = [
    { 
      name: 'Standard Hours', 
      value: calculations.standardRevenue, 
      color: '#4f46e5',
      breakdown: [
        { label: 'Hours', value: calculations.standardHours },
        { label: 'Rate', value: inputs.standardRate },
        { label: 'Revenue', value: calculations.standardRevenue }
      ]
    },
    { 
      name: 'Emergency Hours', 
      value: calculations.emergencyRevenue, 
      color: '#4f46e5',
      breakdown: [
        { label: 'Hours', value: calculations.emergencyHours },
        { label: 'Rate', value: inputs.emergencyRate },
        { label: 'Revenue', value: calculations.emergencyRevenue }
      ]
    },
    { 
      name: 'Materials Profit', 
      value: calculations.materialsProfit, 
      color: '#4f46e5',
      breakdown: [
        { label: 'Sales', value: calculations.materialsSales },
        { label: 'Cost', value: calculations.materialsCost },
        { label: 'Profit', value: calculations.materialsProfit }
      ]
    },
  ];

  const profitBreakdown: ChartData[] = [
    { 
      name: 'Revenue', 
      value: calculations.totalRevenue, 
      color: '#22c55e',
      breakdown: [
        { label: 'Standard Hours', value: calculations.standardRevenue },
        { label: 'Emergency Hours', value: calculations.emergencyRevenue },
        { label: 'Materials Sales', value: calculations.materialsSales }
      ]
    },
    { 
      name: 'Costs', 
      value: -calculations.totalCosts, 
      color: '#ef4444',
      breakdown: [
        { label: 'Labor', value: -calculations.billableHours * inputs.baseLabor },
        { label: 'Marketing', value: -inputs.marketingBudget },
        { label: 'Insurance', value: -5000 },
        { label: 'Vehicle Maintenance', value: -3000 },
        { label: 'Tools', value: -2000 },
        { label: 'Software', value: -2500 },
        { label: 'Emergency Fund', value: -5000 },
        { label: 'Materials Cost', value: -calculations.materialsCost }
      ]
    },
    { 
      name: 'Net Profit', 
      value: calculations.netProfit, 
      color: calculations.netProfit >= 0 ? '#22c55e' : '#ef4444',
      breakdown: [
        { label: 'Total Revenue', value: calculations.totalRevenue },
        { label: 'Total Costs', value: -calculations.totalCosts },
        { label: 'Net Profit', value: calculations.netProfit }
      ]
    },
  ];

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const getBarColor = (value: number) => {
    return value >= 0 ? '#22c55e' : '#ef4444';
  };

  interface TooltipProps {
    active?: boolean;
    payload?: Array<{
      payload: {
        breakdown?: Array<{
          label: string;
          value: number;
        }>;
      };
    }>;
    label?: string;
  }

  const CustomTooltip = ({ active, payload, label }: TooltipProps) => {
    if (!active || !payload || !payload[0]) return null;
    
    const data = payload[0].payload;
    return (
      <div className="win95-tooltip">
        <p className="font-bold mb-1">{label}</p>
        <div className="space-y-1">
          {data.breakdown?.map((item: { label: string; value: number }, index: number) => (
            <div key={index} className="flex justify-between gap-4">
              <span>{item.label}:</span>
              <span className="font-bold">{formatCurrency(item.value)}</span>
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="win95-container p-4 space-y-4">
      <div className="win95-window">
        <div className="win95-title-bar">
          <div className="win95-title-bar-text">
            <span role="img" aria-label="calculator">🧮</span> Plumbing Business Revenue Calculator
          </div>
          <div className="win95-title-bar-controls">
            <button className="win95-button px-2 py-0">_</button>
            <button className="win95-button px-2 py-0">□</button>
            <button className="win95-button px-2 py-0">×</button>
          </div>
        </div>
        <div className="p-4">
          <div className="win95-grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
            <div className="space-y-4">
              <div>
                <label className="win95-label">Hours per Week</label>
                <input
                  type="number"
                  className="win95-input w-full"
                  value={inputs.hoursPerWeek}
                  onChange={(e) => handleInputChange('hoursPerWeek', e.target.value)}
                />
              </div>
              <div>
                <label className="win95-label">Billable %</label>
                <input
                  type="number"
                  className="win95-input w-full"
                  value={inputs.billablePercent}
                  onChange={(e) => handleInputChange('billablePercent', e.target.value)}
                />
              </div>
              <div>
                <label className="win95-label">Emergency %</label>
                <input
                  type="number"
                  className="win95-input w-full"
                  value={inputs.emergencyPercent}
                  onChange={(e) => handleInputChange('emergencyPercent', e.target.value)}
                />
              </div>
            </div>
            <div className="space-y-4">
              <div>
                <label className="win95-label">Standard Rate</label>
                <input
                  type="number"
                  className="win95-input w-full"
                  value={inputs.standardRate}
                  onChange={(e) => handleInputChange('standardRate', e.target.value)}
                />
              </div>
              <div>
                <label className="win95-label">Emergency Rate</label>
                <input
                  type="number"
                  className="win95-input w-full"
                  value={inputs.emergencyRate}
                  onChange={(e) => handleInputChange('emergencyRate', e.target.value)}
                />
              </div>
              <div>
                <label className="win95-label">Marketing Budget</label>
                <input
                  type="number"
                  className="win95-input w-full"
                  value={inputs.marketingBudget}
                  onChange={(e) => handleInputChange('marketingBudget', e.target.value)}
                />
              </div>
            </div>
          </div>

          <div className="win95-divider" />

          <div className="win95-grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="win95-panel">
              <div className="win95-title-bar mb-2">
                <div className="win95-title-bar-text">Revenue Breakdown</div>
              </div>
              <div className="win95-chart h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={revenueBreakdown}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#808080" />
                    <XAxis 
                      dataKey="name" 
                      tick={{ fill: '#000000' }}
                      axisLine={{ stroke: '#808080' }}
                    />
                    <YAxis 
                      tick={{ fill: '#000000' }}
                      axisLine={{ stroke: '#808080' }}
                      tickFormatter={(value) => formatCurrency(value)}
                    />
                    <Tooltip 
                      content={<CustomTooltip />}
                    />
                    <Bar 
                      dataKey="value" 
                      radius={[0, 0, 0, 0]}
                    >
                      {revenueBreakdown.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill="#000080" />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="win95-panel">
              <div className="win95-title-bar mb-2">
                <div className="win95-title-bar-text">Profit Analysis</div>
              </div>
              <div className="win95-chart h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={profitBreakdown}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#808080" />
                    <XAxis 
                      dataKey="name" 
                      tick={{ fill: '#000000' }}
                      axisLine={{ stroke: '#808080' }}
                    />
                    <YAxis 
                      tick={{ fill: '#000000' }}
                      axisLine={{ stroke: '#808080' }}
                      tickFormatter={(value) => formatCurrency(value)}
                    />
                    <Tooltip 
                      content={<CustomTooltip />}
                    />
                    <Bar 
                      dataKey="value" 
                      radius={[0, 0, 0, 0]}
                    >
                      {profitBreakdown.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.value >= 0 ? '#008000' : '#800000'} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          <div className="win95-divider" />

          <div className="win95-panel">
            <div className="win95-title-bar mb-2">
              <div className="win95-title-bar-text">Summary</div>
            </div>
            <div className="win95-grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <div className="win95-label">Total Hours</div>
                <div className="win95-input">{Math.round(calculations.totalHours)}</div>
              </div>
              <div>
                <div className="win95-label">Billable Hours</div>
                <div className="win95-input">{Math.round(calculations.billableHours)}</div>
              </div>
              <div>
                <div className="win95-label">Total Revenue</div>
                <div className="win95-input text-green-800">{formatCurrency(calculations.totalRevenue)}</div>
              </div>
              <div>
                <div className="win95-label">Net Profit</div>
                <div className={`win95-input ${calculations.netProfit >= 0 ? 'text-green-800' : 'text-red-800'}`}>
                  {formatCurrency(calculations.netProfit)}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RevenueCalculator; 