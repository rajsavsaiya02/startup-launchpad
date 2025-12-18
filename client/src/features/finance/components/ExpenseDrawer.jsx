import React from "react";
import {
  X,
  Calendar,
  Building,
  Tag,
  Edit2,
  Copy,
  Trash2,
  Plus,
  FileText,
} from "lucide-react";
import { Button } from "../../../components/ui/Button";
import { Badge } from "../../../components/ui/Badge";

export function ExpenseDrawer({ expense, onClose, isOpen }) {
  if (!isOpen || !expense) return null;

  const isIncome = expense.type === "income";
  const amountColor = isIncome ? "text-success" : "text-error";

  return (
    <>
      <div
        className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 transition-opacity"
        onClick={onClose}
      />

      <aside className="fixed right-0 top-0 h-full w-[480px] bg-white dark:bg-background-dark shadow-2xl z-50 transform transition-transform duration-300 ease-out flex flex-col border-l border-border-light dark:border-border-dark">
        {/* Header */}
        <div className="p-6 border-b border-border-light dark:border-border-dark flex justify-between items-start">
          <h2 className="text-xl font-bold text-text-primary dark:text-white line-clamp-1">
            {expense.desc}
          </h2>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 text-text-tertiary"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-8">
          {/* Main Amount */}
          <div className="space-y-2">
            <p
              className={`text-4xl font-bold font-mono tracking-tight ${amountColor}`}
            >
              {expense.amount}
            </p>
            <div className="flex flex-col gap-1 text-sm">
              <div className="flex items-center gap-2">
                <Badge
                  variant="neutral"
                  className="bg-primary/10 text-primary border-primary/20"
                >
                  {expense.cat}
                </Badge>
              </div>
              <p className="text-text-secondary dark:text-gray-300 mt-1 flex items-center gap-2">
                <Building className="h-4 w-4 text-text-tertiary" /> Vendor:{" "}
                <span className="font-medium">{expense.vendor}</span>
              </p>
              <p className="text-text-tertiary flex items-center gap-2">
                <Calendar className="h-4 w-4" /> {expense.date}
              </p>
            </div>
          </div>

          {/* Notes & Receipt */}
          <div className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-text-secondary">
                Notes
              </label>
              <textarea
                className="w-full rounded-md border border-border-light dark:border-border-dark p-3 text-sm min-h-20 bg-background-light dark:bg-surface-dark focus:ring-2 focus:ring-primary/20"
                defaultValue="Monthly server costs for our main application and staging environment."
              />
            </div>

            <div className="space-y-1.5">
              <p className="text-sm font-medium text-text-secondary">Receipt</p>
              <div className="h-32 w-full bg-gray-100 dark:bg-gray-800 rounded-lg border border-dashed border-gray-300 dark:border-gray-700 flex items-center justify-center flex-col text-text-tertiary cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                <FileText className="h-8 w-8 mb-2" />
                <span className="text-xs">Click to view receipt</span>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4 border-t border-border-light dark:border-border-dark">
            <Button variant="secondary" className="flex-1 gap-2">
              <Edit2 className="h-4 w-4" /> Edit
            </Button>
            <Button variant="secondary" className="flex-1 gap-2">
              <Copy className="h-4 w-4" /> Duplicate
            </Button>
            <Button
              variant="ghost"
              className="flex-1 gap-2 text-error hover:bg-error/10"
            >
              <Trash2 className="h-4 w-4" /> Delete
            </Button>
          </div>

          {/* Activity Timeline */}
          <div className="pt-4">
            <h3 className="font-bold text-lg mb-4 text-text-primary dark:text-white">
              Activity
            </h3>
            <div className="space-y-6 relative pl-2">
              <div className="absolute left-[7px] top-2 bottom-2 w-px bg-border-light dark:border-border-dark"></div>

              <div className="relative pl-6">
                <div className="absolute left-0 top-1 h-4 w-4 rounded-full bg-primary/20 flex items-center justify-center">
                  <Plus className="h-3 w-3 text-primary" />
                </div>
                <p className="text-sm text-text-primary dark:text-white">
                  Expense created by{" "}
                  <span className="font-medium">Alex Johnson</span>
                </p>
                <p className="text-xs text-text-tertiary">
                  Dec 15, 2023, 09:30 AM
                </p>
              </div>

              <div className="relative pl-6">
                <div className="absolute left-0 top-1 h-4 w-4 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                  <Edit2 className="h-2.5 w-2.5 text-gray-500" />
                </div>
                <p className="text-sm text-text-primary dark:text-white">
                  Note was added
                </p>
                <p className="text-xs text-text-tertiary">
                  Dec 15, 2023, 09:32 AM
                </p>
              </div>
            </div>
          </div>
          <ExpenseDrawer
            expense={selectedExpense}
            isOpen={isDrawerOpen}
            onClose={() => setIsDrawerOpen(false)}
          />
        </div>
      </aside>
    </>
  );
}
