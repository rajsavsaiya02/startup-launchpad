import React from 'react';
import { X, Calendar, UploadCloud, Plus, ChevronDown } from 'lucide-react';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';
import { Avatar } from '../../../components/ui/Avatar';

export function CreateProjectModal({ isOpen, onClose }) {
  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop - z-[100] to ensure it covers fixed sidebars/headers */}
      <div 
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-100 transition-opacity animate-in fade-in duration-200" 
        onClick={onClose}
      />
      
      {/* Modal Container - z-[101] */}
      <div className="fixed inset-0 z-101 flex items-center justify-center p-4 pointer-events-none">
        <div className="bg-white dark:bg-[#1E293B] w-full max-w-xl rounded-xl shadow-2xl pointer-events-auto flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-200 border border-border-light dark:border-border-dark">
          
          {/* Header */}
          <div className="flex items-start justify-between p-6 pb-4 border-b border-border-light dark:border-border-dark">
            <div>
              <h2 className="text-xl font-bold text-text-primary dark:text-white">Create New Project</h2>
              <p className="text-sm text-text-secondary dark:text-gray-400">Fill in the details below to get started.</p>
            </div>
            <button 
              onClick={onClose} 
              className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 text-text-tertiary transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Form Content */}
          <div className="p-6 overflow-y-auto space-y-6 custom-scrollbar">
            
            {/* Project Name */}
            <Input 
              label="Project Name" 
              placeholder="e.g., Q4 Marketing Campaign" 
              className="bg-white dark:bg-gray-800/50"
            />
            
            {/* Description */}
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-text-secondary dark:text-gray-300">Description</label>
              <textarea 
                className="w-full rounded-lg border border-gray-300 dark:border-gray-700 p-3 text-sm min-h-[100px] bg-white dark:bg-gray-800/50 text-text-primary dark:text-white focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all resize-none"
                placeholder="Add a short description..."
              />
            </div>

            {/* Dates Row */}
            <div className="grid grid-cols-2 gap-5">
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-text-secondary dark:text-gray-300">Start Date</label>
                <div className="relative">
                  <input 
                    type="date" 
                    className="w-full h-11 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800/50 text-text-primary dark:text-white text-sm px-3 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                  />
                  <Calendar className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-tertiary pointer-events-none" />
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-text-secondary dark:text-gray-300">Due Date</label>
                <div className="relative">
                  <input 
                    type="date" 
                    className="w-full h-11 rounded-lg border border-red-300 dark:border-red-900/50 bg-white dark:bg-gray-800/50 text-text-primary dark:text-white text-sm px-3 focus:ring-2 focus:ring-error/20 focus:border-error outline-none" 
                  />
                  <p className="text-xs text-error mt-1">Due date cannot be earlier than start date.</p>
                </div>
              </div>
            </div>

            {/* Priority Dropdown (Fixed Visuals) */}
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-text-secondary dark:text-gray-300">Priority</label>
              <div className="relative">
                <select className="w-full h-11 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800/50 text-text-primary dark:text-white text-sm pl-3 pr-10 appearance-none focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none cursor-pointer">
                  <option>Medium</option>
                  <option>High</option>
                  <option>Low</option>
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-tertiary pointer-events-none" />
              </div>
            </div>

            {/* Team Members */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-text-secondary dark:text-gray-300">Team Members</label>
              <div className="flex flex-wrap gap-2 p-3 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800/50 min-h-[52px]">
                {[
                  { name: 'Alina', img: 'https://i.pravatar.cc/50?u=alina' },
                  { name: 'Maya', img: 'https://i.pravatar.cc/50?u=maya' }
                ].map(member => (
                  <div key={member.name} className="flex items-center gap-2 bg-primary/10 text-primary dark:bg-primary/20 dark:text-blue-300 pl-1 pr-2 py-1 rounded-full text-sm font-medium animate-in fade-in zoom-in">
                    <Avatar src={member.img} size="xs" />
                    <span>{member.name}</span>
                    <button className="hover:text-primary-hover rounded-full hover:bg-black/5 p-0.5 transition-colors">
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ))}
                <button className="h-7 w-7 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center text-text-tertiary hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors">
                  <Plus className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* File Upload */}
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-text-secondary dark:text-gray-300">Attachments</label>
              <div className="border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-lg p-8 flex flex-col items-center justify-center text-center bg-gray-50 dark:bg-gray-800/30 hover:bg-gray-100 dark:hover:bg-gray-800/50 hover:border-primary/50 transition-all cursor-pointer group">
                <div className="h-12 w-12 bg-white dark:bg-gray-800 rounded-full shadow-sm flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                   <UploadCloud className="h-6 w-6 text-primary" />
                </div>
                <p className="text-sm text-text-primary dark:text-white">
                  <span className="font-semibold text-primary hover:underline">Click to upload</span> or drag and drop
                </p>
                <p className="text-xs text-text-tertiary mt-1">PNG, JPG, PDF up to 10MB</p>
              </div>
            </div>

          </div>

          {/* Footer */}
          <div className="p-6 border-t border-border-light dark:border-border-dark flex justify-end gap-3 bg-gray-50 dark:bg-gray-900/50 rounded-b-xl">
            <Button variant="secondary" onClick={onClose} className="dark:bg-gray-800 dark:hover:bg-gray-700 dark:text-white dark:border-gray-700">
              Cancel
            </Button>
            <Button className="shadow-lg shadow-primary/25">
              Create Project
            </Button>
          </div>

        </div>
      </div>
    </>
  );
}