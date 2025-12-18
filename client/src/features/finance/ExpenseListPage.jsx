import React, { useState } from 'react';
import { Search, Filter, Download, Plus, MoreHorizontal, ChevronDown, Trash2, CheckCircle } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Badge } from '../../components/ui/Badge';
import { ExpenseDrawer } from './components/ExpenseDrawer'; // NEW

const EXPENSES = [
  { id: 1, date: 'Oct 26, 2023', desc: 'Monthly Subscription', cat: 'Software', vendor: 'Figma', amount: '-$144.00', status: 'Reviewed', type: 'expense' },
  { id: 2, date: 'Oct 25, 2023', desc: 'Cloud Hosting Services', cat: 'Infrastructure', vendor: 'AWS', amount: '-$850.25', status: 'Reviewed', type: 'expense' },
  { id: 3, date: 'Oct 24, 2023', desc: 'Sponsored Social Media', cat: 'Marketing', vendor: 'Meta', amount: '-$1,200.00', status: 'Pending', type: 'expense' },
  { id: 4, date: 'Oct 22, 2023', desc: 'Office Lunch', cat: 'Food & Beverage', vendor: 'DoorDash', amount: '-$210.50', status: 'Reviewed', type: 'expense' },
  { id: 5, date: 'Oct 21, 2023', desc: 'Client Reimbursement', cat: 'Income', vendor: 'Innovate Corp', amount: '+$500.00', status: 'Reviewed', type: 'income' },
];

export function ExpenseListPage() {
  const [selectedCount, setSelectedCount] = useState(0);
  const [selectedExpense, setSelectedExpense] = useState(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const handleRowClick = (tx) => {
    setSelectedExpense(tx);
    setIsDrawerOpen(true);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-20">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-end gap-4 border-b border-border-light dark:border-border-dark pb-6">
        <div>
          <h1 className="text-3xl font-bold text-text-primary dark:text-white">Expenses</h1>
          <p className="text-text-secondary dark:text-gray-400 mt-1">View and manage your financial transactions.</p>
        </div>
        
        <div className="flex gap-3">
          <Button variant="outline" className="gap-2">
            <Download className="h-4 w-4" /> Export
          </Button>
          <Button className="gap-2">
            <Plus className="h-4 w-4" /> Add Expense
          </Button>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-col lg:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-text-tertiary" />
          <input 
            type="text" 
            placeholder="Search expenses..." 
            className="w-full h-11 pl-10 pr-4 rounded-lg border border-border-light bg-white dark:bg-surface-dark dark:border-border-dark focus:ring-2 focus:ring-primary/20 focus:border-primary"
          />
        </div>
        <div className="flex gap-4 overflow-x-auto pb-2 lg:pb-0">
          {['Date Range', 'Category', 'Status'].map((filter) => (
            <div key={filter} className="relative min-w-[140px]">
              <select className="w-full h-11 pl-4 pr-10 rounded-lg border border-border-light bg-white dark:bg-surface-dark dark:border-border-dark text-sm appearance-none cursor-pointer focus:ring-2 focus:ring-primary/20">
                <option>{filter}</option>
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-tertiary pointer-events-none" />
            </div>
          ))}
        </div>
      </div>

      {/* Bulk Actions (Conditional Visual) */}
      <div className="flex items-center justify-between gap-4 bg-primary/5 border border-primary/10 p-3 rounded-lg">
        <p className="text-sm font-medium text-text-primary dark:text-white">3 items selected</p>
        <div className="flex gap-2">
          <Button size="sm" variant="ghost" className="text-error hover:bg-error/10 gap-2">
            <Trash2 className="h-4 w-4" /> Delete
          </Button>
          <Button size="sm" variant="outline" className="gap-2">
            <CheckCircle className="h-4 w-4" /> Mark Reviewed
          </Button>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white dark:bg-surface-dark rounded-xl border border-border-light dark:border-border-dark shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50 dark:bg-gray-900/50 border-b border-border-light dark:border-border-dark">
              <tr>
                <th className="p-4 w-12"><input type="checkbox" className="rounded border-gray-300 text-primary focus:ring-primary" /></th>
                {['Date', 'Description', 'Category', 'Vendor', 'Amount', 'Status', 'Actions'].map((h) => (
                  <th key={h} className="p-4 font-semibold text-text-primary dark:text-white whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border-light dark:divide-border-dark">
              {EXPENSES.map((tx) => (
                <tr 
        key={tx.id} 
        onClick={() => handleRowClick(tx)} 
        className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors group cursor-pointer"
      >
                  <td className="p-4"><input type="checkbox" className="rounded border-gray-300 text-primary focus:ring-primary" /></td>
                  <td className="p-4 text-text-secondary dark:text-gray-400 whitespace-nowrap">{tx.date}</td>
                  <td className="p-4 font-medium text-text-primary dark:text-white">{tx.desc}</td>
                  <td className="p-4 text-text-secondary dark:text-gray-400">{tx.cat}</td>
                  <td className="p-4 text-text-secondary dark:text-gray-400">{tx.vendor}</td>
                  <td className={`p-4 font-mono font-medium ${tx.type === 'income' ? 'text-success' : 'text-text-primary dark:text-white'}`}>
                    {tx.amount}
                  </td>
                  <td className="p-4">
                    <Badge variant={tx.status === 'Reviewed' ? 'success' : 'warning'}>{tx.status}</Badge>
                  </td>
                  <td className="p-4">
                    <button className="p-1 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 text-text-tertiary transition-colors">
                      <MoreHorizontal className="h-5 w-5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}