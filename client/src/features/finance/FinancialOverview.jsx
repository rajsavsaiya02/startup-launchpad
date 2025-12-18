import React from 'react';
import { ArrowUpRight, ArrowDownRight, TrendingUp, TrendingDown, Plane, PieChart, Download, Plus } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { AddExpenseModal } from './components/AddExpenseModal';
const TRANSACTIONS = [
  { id: 1, name: 'AWS Services', category: 'Infrastructure', amount: '-$2,500.00', date: '2h ago', type: 'expense', icon: 'cloud' },
  { id: 2, name: 'Figma Subscription', category: 'Software', amount: '-$450.00', date: 'Yesterday', type: 'expense', icon: 'monitor' },
  { id: 3, name: 'Stripe Payout', category: 'Income', amount: '+$12,800.00', date: 'Oct 28', type: 'income', icon: 'dollar-sign' },
  { id: 4, name: 'October Payroll', category: 'HR & Payroll', amount: '-$9,975.00', date: 'Oct 27', type: 'expense', icon: 'users' },
];

export function FinancialOverview() {
  const [isAddModalOpen, setIsAddModalOpen] = React.useState(false);
  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-20">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-border-light dark:border-border-dark pb-6">
        <div>
          <h1 className="text-3xl font-bold text-text-primary dark:text-white">Financial Hub</h1>
          <p className="text-text-secondary dark:text-gray-400 mt-1">Track expenses, monitor burn, and manage budgets.</p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" className="gap-2">
            <Download className="h-4 w-4" /> Export CSV
          </Button>
          <Button className="gap-2" onClick={() => setIsAddModalOpen(true)}>
          <Plus className="h-4 w-4" /> Add Expense
        </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Main Metrics (Left Column) */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Burn Rate */}
          <Card className="p-6 bg-white dark:bg-surface-dark">
            <div className="flex justify-between items-start mb-2">
              <h3 className="text-lg font-semibold text-text-primary dark:text-white">Monthly Burn Rate</h3>
              <span className="text-sm text-primary font-medium hover:underline cursor-pointer">View Trend →</span>
            </div>
            <p className="text-4xl font-bold text-text-primary dark:text-white tabular-nums mb-4">$28,500</p>
            <div className="flex items-center gap-2 text-sm text-text-secondary">
              <span className="flex items-center text-error font-medium bg-error/10 px-2 py-0.5 rounded">
                <ArrowUpRight className="h-4 w-4 mr-1" /> +5.2%
              </span>
              <span>vs last month</span>
            </div>
            {/* Placeholder Chart Visual */}
            <div className="mt-6 h-32 bg-linear-to-b from-primary/5 to-transparent rounded-lg border border-primary/10 flex items-end justify-around p-2">
              {[40, 60, 45, 70, 55, 80, 65].map((h, i) => (
                <div key={i} className="w-8 bg-primary/20 rounded-t-sm hover:bg-primary/40 transition-colors" style={{ height: `${h}%` }}></div>
              ))}
            </div>
          </Card>

          {/* Runway & Budget */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="p-6 bg-white dark:bg-surface-dark">
              <div className="flex justify-between items-start mb-4">
                <h3 className="font-semibold text-text-primary dark:text-white">Runway Forecast</h3>
                <Plane className="h-5 w-5 text-text-tertiary" />
              </div>
              <p className="text-3xl font-bold text-text-primary dark:text-white mb-2">14 Months</p>
              <p className="text-xs text-text-tertiary">Based on current average burn rate.</p>
              <div className="w-full bg-gray-100 dark:bg-gray-800 h-2 rounded-full mt-4 overflow-hidden">
                <div className="bg-success h-full w-[65%] rounded-full"></div>
              </div>
            </Card>

            <Card className="p-6 bg-white dark:bg-surface-dark">
              <div className="flex justify-between items-start mb-4">
                <h3 className="font-semibold text-text-primary dark:text-white">Budget (Q4)</h3>
                <PieChart className="h-5 w-5 text-text-tertiary" />
              </div>
              <p className="text-3xl font-bold text-text-primary dark:text-white mb-2">$38,475</p>
              <p className="text-xs text-text-tertiary">Remaining of $85,500 total budget.</p>
               <div className="flex items-center gap-1 text-sm text-success mt-4">
                 <ArrowDownRight className="h-4 w-4" /> <span className="font-medium">-12% vs last quarter</span>
               </div>
            </Card>
          </div>

          {/* Category Breakdown */}
          <Card className="p-6 bg-white dark:bg-surface-dark">
            <h3 className="font-semibold text-text-primary dark:text-white mb-6">Spending by Category</h3>
            <div className="space-y-4">
              {[
                { label: 'HR & Payroll', val: '$9,975', pct: '35%', color: 'bg-emerald-500' },
                { label: 'Infrastructure', val: '$7,125', pct: '25%', color: 'bg-blue-500' },
                { label: 'Software', val: '$4,275', pct: '15%', color: 'bg-amber-500' },
                { label: 'Marketing', val: '$2,850', pct: '10%', color: 'bg-orange-500' },
              ].map((cat, i) => (
                <div key={i} className="space-y-1">
                  <div className="flex justify-between text-sm">
                    <span className="text-text-secondary dark:text-gray-300">{cat.label}</span>
                    <span className="font-medium text-text-primary dark:text-white">{cat.val}</span>
                  </div>
                  <div className="w-full bg-gray-100 dark:bg-gray-800 h-2 rounded-full overflow-hidden">
                    <div className={`h-full ${cat.color}`} style={{ width: cat.pct }}></div>
                  </div>
                </div>
              ))}
            </div>
          </Card>

        </div>

        {/* Right Column (Transactions) */}
        <div className="lg:col-span-1">
          <Card className="p-6 bg-white dark:bg-surface-dark h-full">
            <h3 className="font-bold text-lg text-text-primary dark:text-white mb-6">Recent Transactions</h3>
            <div className="space-y-6">
              {TRANSACTIONS.map((tx) => (
                <div key={tx.id} className="flex items-center justify-between group">
                  <div className="flex items-center gap-3">
                    <div className={`h-10 w-10 rounded-full flex items-center justify-center ${tx.type === 'income' ? 'bg-success/10 text-success' : 'bg-gray-100 dark:bg-gray-800 text-text-secondary'}`}>
                      {tx.type === 'income' ? <TrendingUp className="h-5 w-5" /> : <TrendingDown className="h-5 w-5" />}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-text-primary dark:text-white">{tx.name}</p>
                      <p className="text-xs text-text-tertiary">{tx.category}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`text-sm font-bold ${tx.type === 'income' ? 'text-success' : 'text-text-primary dark:text-white'}`}>
                      {tx.amount}
                    </p>
                    <p className="text-xs text-text-tertiary">{tx.date}</p>
                  </div>
                </div>
              ))}
            </div>
            <Button variant="ghost" className="w-full mt-8 text-text-secondary">View All Transactions</Button>
          </Card>
        </div>

<AddExpenseModal 
        isOpen={isAddModalOpen} 
        onClose={() => setIsAddModalOpen(false)} 
      />
      </div>
    </div>
  );
}