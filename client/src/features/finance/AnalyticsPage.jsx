import React from 'react';
import { ArrowRight, Info, TrendingUp, TrendingDown, ChevronDown } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';

const FORECAST = [
  { month: 'Aug 2024', revenue: '$5,000', expenses: '($30,000)', net: '($25,000)', runway: '14 mo' },
  { month: 'Sep 2024', revenue: '$5,500', expenses: '($30,500)', net: '($25,000)', runway: '13 mo' },
  { month: 'Oct 2024', revenue: '$7,000', expenses: '($31,000)', net: '($24,000)', runway: '12 mo' },
  { month: 'Nov 2024', revenue: '$8,000', expenses: '($32,000)', net: '($24,000)', runway: '11 mo' },
  { month: 'Dec 2024', revenue: '$10,000', expenses: '($32,500)', net: '($22,500)', runway: '10 mo' },
];

export function AnalyticsPage() {
  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-20">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-border-light dark:border-border-dark pb-6">
        <div>
          <h1 className="text-3xl font-bold text-text-primary dark:text-white">Burn Rate Analytics</h1>
          <p className="text-text-secondary dark:text-gray-400 mt-1">Financial trends over time.</p>
        </div>
        <Button variant="secondary" className="gap-2">
          Adjust Assumptions <ArrowRight className="h-4 w-4" />
        </Button>
      </div>

      {/* Chart Placeholder */}
      <Card className="p-6 bg-white dark:bg-surface-dark">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-lg font-bold text-text-primary dark:text-white">Actual vs Forecast Burn</h2>
          <div className="relative">
            <select className="appearance-none pl-3 pr-8 py-1.5 text-sm bg-background-light dark:bg-background-dark border border-border-light dark:border-border-dark rounded-md focus:ring-2 focus:ring-primary/20 cursor-pointer">
              <option>Last 90 Days</option>
              <option>Last 30 Days</option>
              <option>YTD</option>
            </select>
            <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 h-4 w-4 text-text-tertiary pointer-events-none" />
          </div>
        </div>
        <div className="h-80 bg-linear-to-b from-primary/5 to-transparent rounded-lg border border-dashed border-border-light dark:border-border-dark flex items-center justify-center text-text-tertiary">
          [Chart Component Visualization]
        </div>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Scenarios */}
        <Card className="p-6 bg-white dark:bg-surface-dark h-full">
          <h2 className="text-lg font-bold text-text-primary dark:text-white mb-6">Runway Scenarios</h2>
          <div className="space-y-6">
            <div className="flex gap-3">
              <Info className="h-5 w-5 text-text-tertiary mt-1" />
              <div>
                <p className="text-2xl font-bold text-text-primary dark:text-white">14 months</p>
                <p className="text-sm text-text-tertiary">Base: Based on current rate</p>
              </div>
            </div>
            <div className="flex gap-3">
              <TrendingUp className="h-5 w-5 text-success mt-1" />
              <div>
                <p className="text-2xl font-bold text-text-primary dark:text-white">18 months</p>
                <p className="text-sm text-text-tertiary">Optimistic</p>
              </div>
            </div>
            <div className="flex gap-3">
              <TrendingDown className="h-5 w-5 text-error mt-1" />
              <div>
                <p className="text-2xl font-bold text-text-primary dark:text-white">9 months</p>
                <p className="text-sm text-text-tertiary">Worst-case</p>
              </div>
            </div>
          </div>
          <p className="text-xs text-text-tertiary mt-8 border-t border-border-light dark:border-border-dark pt-4">
            These scenarios are projections based on the current financial model and assumptions.
          </p>
        </Card>

        {/* Forecast Table */}
        <div className="lg:col-span-2">
          <Card className="p-6 bg-white dark:bg-surface-dark h-full">
            <h2 className="text-lg font-bold text-text-primary dark:text-white mb-6">Runway Forecast Details</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-right text-sm">
                <thead className="bg-gray-50 dark:bg-gray-900/50 border-b border-border-light dark:border-border-dark text-xs uppercase text-text-secondary">
                  <tr>
                    <th className="px-4 py-3 text-left">Month</th>
                    <th className="px-4 py-3">Revenue</th>
                    <th className="px-4 py-3">Expenses</th>
                    <th className="px-4 py-3">Net Flow</th>
                    <th className="px-4 py-3">Runway</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border-light dark:divide-border-dark">
                  {FORECAST.map((row, i) => (
                    <tr key={i} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                      <td className="px-4 py-4 text-left font-medium text-text-primary dark:text-white">{row.month}</td>
                      <td className="px-4 py-4 text-text-secondary dark:text-gray-300 font-mono">{row.revenue}</td>
                      <td className="px-4 py-4 text-text-secondary dark:text-gray-300 font-mono">{row.expenses}</td>
                      <td className="px-4 py-4 text-error font-mono font-medium">{row.net}</td>
                      <td className="px-4 py-4 text-text-primary dark:text-white font-mono">{row.runway}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </div>

      </div>
    </div>
  );
}