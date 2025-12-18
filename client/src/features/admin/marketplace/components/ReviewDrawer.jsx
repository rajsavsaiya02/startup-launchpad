import React from 'react';
import { X, CheckCircle, AlertTriangle, Trash2, MessageSquare } from 'lucide-react';
import { Button } from '../../../../components/ui/Button';
import { Badge } from '../../../../components/ui/Badge';

export function ReviewDrawer({ item, onClose, isOpen }) {
  if (!isOpen || !item) return null;

  return (
    <>
      <div className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 transition-opacity" onClick={onClose} />
      
      <aside className="fixed right-0 top-0 h-full w-[430px] bg-white dark:bg-background-dark shadow-2xl z-50 transform transition-transform duration-300 ease-out flex flex-col border-l border-border-light dark:border-border-dark">
        
        {/* Header */}
        <div className="p-6 border-b border-border-light dark:border-border-dark flex justify-between items-start">
          <div>
            <h2 className="text-2xl font-bold text-text-primary dark:text-white">Review Item</h2>
            <Badge variant="neutral" className="mt-2 text-lg">{item.type}</Badge>
          </div>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 text-text-tertiary">
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 p-6 space-y-8">
          <div className="bg-gray-50 dark:bg-gray-900 rounded-xl border border-border-light dark:border-border-dark p-6">
            <p className="text-text-secondary dark:text-gray-300 leading-relaxed">
              {item.description}
            </p>
          </div>

          <div className="space-y-3">
            <Button className="w-full gap-2 bg-success hover:bg-success/90 border-transparent text-white">
              <CheckCircle className="h-4 w-4" /> Approve & Resolve
            </Button>
            <Button variant="outline" className="w-full gap-2">
              <MessageSquare className="h-4 w-4" /> Request More Info
            </Button>
            <Button variant="destructive" className="w-full gap-2">
              <Trash2 className="h-4 w-4" /> Remove / Ban
            </Button>
          </div>
        </div>
      </aside>
    </>
  );
}