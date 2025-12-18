import React from 'react';
import { X, Calendar, UploadCloud, DollarSign } from 'lucide-react';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';

export function AddExpenseModal({ isOpen, onClose }) {
  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 transition-opacity" onClick={onClose} />
      
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
        <div className="bg-white dark:bg-surface-dark w-full max-w-lg rounded-xl shadow-2xl pointer-events-auto flex flex-col max-h-[90vh]">
          
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-border-light dark:border-border-dark">
            <h2 className="text-xl font-bold text-text-primary dark:text-white">Add New Expense</h2>
            <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 text-text-tertiary">
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Form Content */}
          <div className="p-6 overflow-y-auto space-y-6">
            
            {/* Description */}
            <Input label="Description" placeholder="e.g., Cloud hosting for Q1" required />

            {/* Amount */}
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-text-secondary">Amount</label>
              <div className="relative">
                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-text-tertiary">
                  <DollarSign className="h-4 w-4" />
                </div>
                <input 
                  type="number" 
                  placeholder="0.00" 
                  className="w-full h-11 pl-9 pr-3 rounded-md border border-border-light bg-white dark:bg-background-dark dark:border-border-dark focus:ring-2 focus:ring-primary/20 focus:border-primary"
                />
              </div>
            </div>

            {/* Category & Vendor */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-text-secondary">Category</label>
                <select className="w-full h-11 rounded-md border border-border-light bg-white px-3 text-sm focus:ring-2 focus:ring-primary/20 dark:bg-background-dark dark:border-border-dark dark:text-white">
                  <option disabled selected>Select...</option>
                  <option>Infrastructure</option>
                  <option>Software</option>
                  <option>Marketing</option>
                  <option>Salaries</option>
                </select>
              </div>
              <Input label="Vendor" placeholder="e.g., AWS" />
            </div>

            {/* Date */}
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-text-secondary">Date</label>
              <div className="relative">
                <input 
                  type="date" 
                  className="w-full h-11 pl-3 pr-10 rounded-md border border-border-light bg-white dark:bg-background-dark dark:border-border-dark text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary"
                />
                <div className="absolute right-3 top-1/2 -translate-y-1/2 text-text-tertiary pointer-events-none">
                  <Calendar className="h-4 w-4" />
                </div>
              </div>
            </div>

            {/* Receipt Upload */}
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-text-secondary">Receipt (Optional)</label>
              <div className="border-2 border-dashed border-border-light dark:border-border-dark rounded-lg p-6 flex flex-col items-center justify-center text-center hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors cursor-pointer">
                <div className="h-10 w-10 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mb-2">
                  <UploadCloud className="h-5 w-5 text-text-tertiary" />
                </div>
                <p className="text-sm font-medium text-text-primary dark:text-white">Click to upload</p>
                <p className="text-xs text-text-tertiary">SVG, PNG, JPG or PDF (max. 10MB)</p>
              </div>
            </div>

            {/* Notes */}
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-text-secondary">Notes</label>
              <textarea 
                className="w-full rounded-md border border-border-light dark:border-border-dark p-3 text-sm min-h-20 bg-white dark:bg-background-dark focus:ring-2 focus:ring-primary/20"
                placeholder="Add any additional details..."
              />
            </div>

          </div>

          {/* Footer */}
          <div className="p-6 border-t border-border-light dark:border-border-dark flex justify-end gap-3 bg-gray-50 dark:bg-gray-900/50 rounded-b-xl">
            <Button variant="secondary" onClick={onClose}>Cancel</Button>
            <Button>Add Expense</Button>
          </div>

        </div>
      </div>
    </>
  );
}