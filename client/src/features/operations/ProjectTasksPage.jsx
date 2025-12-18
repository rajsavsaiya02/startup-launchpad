import React, { useState } from 'react';
import { 
  Share2, Plus, MoreHorizontal, Search, Calendar, 
  Clock, Paperclip, MessageSquare, CheckSquare, 
  Filter, ArrowRight, ChevronDown, Users, X 
} from 'lucide-react';
import { Avatar } from '../../components/ui/Avatar';
import { Badge } from '../../components/ui/Badge';
import { cn } from '../../utils/cn';

// --- Mock Data ---
const COLUMNS = [
  {
    id: 'todo',
    title: 'To Do',
    color: 'border-yellow-400',
    count: 3,
    tasks: [
      { id: 1, title: 'Design Landing Page Mockups', desc: 'Create high-fidelity mockups for the new homepage.', priority: 'High', assignees: [1, 2] },
      { id: 2, title: 'Develop User Authentication Flow', desc: 'Implement sign-up, login, and password reset.', priority: 'Medium', assignees: [3] },
      { id: 3, title: 'Setup Staging Environment', desc: 'Configure the server and deployment pipeline.', priority: 'High', assignees: [1] },
    ]
  },
  {
    id: 'progress',
    title: 'In Progress',
    color: 'border-primary',
    count: 1,
    tasks: [
      { id: 4, title: 'Write Homepage Copy', desc: 'Draft compelling copy for the main sections.', priority: 'Low', assignees: [2], active: true },
    ]
  },
  {
    id: 'done',
    title: 'Done',
    color: 'border-green-500',
    count: 2,
    tasks: [
      { id: 5, title: 'Finalize Brand Style Guide', desc: 'Complete the documentation for colors and typography.', priority: 'Medium', assignees: [] },
      { id: 6, title: 'Project Kick-off Meeting', desc: 'Initial meeting with all stakeholders.', priority: 'Low', assignees: [] },
    ]
  }
];

export function ProjectTasksPage() {
  const [activeTab, setActiveTab] = useState('Board');
  // Default to 'Write Homepage Copy' to match the screenshot
  const [selectedTask, setSelectedTask] = useState(COLUMNS[1].tasks[0]); 

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)] bg-white dark:bg-background-dark overflow-hidden">
      
      {/* 1. Project Header */}
      <div className="shrink-0 px-8 pt-8 pb-0">
        <div className="flex items-center justify-between border-b border-gray-200 dark:border-gray-700 pb-6">
          <div>
            <h1 className="text-[28px] font-semibold text-gray-900 dark:text-white">Task Magement</h1>
            <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">Track progress for the new marketing website launch.</p>
          </div>
          <div className="flex items-center gap-3">
            <button className="flex h-9 items-center gap-2 rounded-md border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
              <Share2 className="h-4 w-4" />
              <span>Share</span>
            </button>
            <button className="flex h-9 items-center gap-2 rounded-md bg-primary px-3 text-sm font-medium text-white hover:bg-primary/90 transition-colors shadow-sm">
              <Plus className="h-4 w-4" />
              <span>New Task</span>
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="mt-6 border-b border-gray-200 dark:border-gray-700">
          <nav className="-mb-px flex space-x-8">
            {['Overview', 'Board', 'Activity', 'Files', 'Members'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={cn(
                  "whitespace-nowrap border-b-2 py-4 text-sm font-medium transition-colors",
                  activeTab === tab
                    ? "border-primary text-primary"
                    : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
                )}
              >
                {tab}
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* 2. Main Board Area */}
      <div className="flex flex-1 overflow-hidden">
        
        {/* Kanban Columns (Scrollable) */}
        <div className="flex-1 overflow-x-auto p-8 pt-6 bg-white dark:bg-background-dark">
          <div className="flex h-full gap-6 min-w-max">
            {COLUMNS.map((col) => (
              <div key={col.id} className="w-[320px] flex flex-col shrink-0">
                
                {/* Column Header */}
                <div className={`flex items-center justify-between pb-3 border-b-2 ${col.color} mb-4`}>
                  <h3 className="font-semibold text-gray-900 dark:text-white">{col.title}</h3>
                  <span className="text-sm font-medium text-gray-500 tabular-nums">{col.count}</span>
                </div>

                {/* Task List */}
                <div className="flex flex-col gap-4 overflow-y-auto pb-4 pr-2 custom-scrollbar">
                  {col.tasks.map((task) => (
                    <div 
                      key={task.id}
                      onClick={() => setSelectedTask(task)}
                      className={cn(
                        "cursor-pointer rounded-lg border p-4 shadow-sm transition-all duration-200 bg-white dark:bg-gray-800",
                        selectedTask?.id === task.id 
                          ? "border-primary ring-1 ring-primary shadow-md bg-blue-50/10" 
                          : "border-gray-200 dark:border-gray-700 hover:shadow-md hover:border-gray-300 dark:hover:border-gray-600"
                      )}
                    >
                      <div className="flex flex-col gap-3">
                        <div className="flex flex-col gap-1">
                          <h3 className="text-sm font-medium text-gray-900 dark:text-white leading-snug">{task.title}</h3>
                          <p className="line-clamp-2 text-xs text-gray-500 dark:text-gray-400">{task.desc}</p>
                        </div>
                        
                        <div className="flex items-center justify-between pt-2">
                          <div className="flex items-center gap-2">
                             <div className={cn("h-2 w-2 rounded-full", {
                               'bg-red-500': task.priority === 'High',
                               'bg-yellow-500': task.priority === 'Medium',
                               'bg-green-500': task.priority === 'Low'
                             })}></div>
                             <span className="text-xs text-gray-600 dark:text-gray-300">{task.priority} Priority</span>
                          </div>
                          
                          {task.assignees.length > 0 && (
                            <div className="flex -space-x-2">
                              {task.assignees.map((id, i) => (
                                <Avatar key={i} size="xs" src={`https://i.pravatar.cc/40?u=${id}`} className="border-2 border-white dark:border-gray-800" />
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 3. Task Inspector Panel (Right) */}
        {selectedTask && (
          <aside className="w-[380px] shrink-0 border-l border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 flex flex-col h-full shadow-xl z-10">
            
            {/* Panel Header */}
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <div className="flex justify-between items-start mb-1">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white leading-snug">{selectedTask.title}</h2>
                <button onClick={() => setSelectedTask(null)} className="text-gray-400 hover:text-gray-600">
                  <X className="h-5 w-5" />
                </button>
              </div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Task details and collaboration.</p>
            </div>

            {/* Panel Body */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar">
              
              {/* Meta Details */}
              <div>
                <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">Details</h3>
                <div className="space-y-3 pt-3 border-t border-gray-100 dark:border-gray-800">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500 dark:text-gray-400">Assignee</span>
                    <span className="font-medium text-gray-900 dark:text-white">Alex</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500 dark:text-gray-400">Due Date</span>
                    <span className="font-medium text-gray-900 dark:text-white">Dec 15, 2023</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500 dark:text-gray-400">Priority</span>
                    <span className={`font-medium ${
                      selectedTask.priority === 'High' ? 'text-red-600' : 
                      selectedTask.priority === 'Medium' ? 'text-yellow-600' : 'text-green-600'
                    }`}>{selectedTask.priority}</span>
                  </div>
                </div>
              </div>

              {/* Subtasks */}
              <div>
                <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">Subtasks</h3>
                <div className="space-y-3 pt-3 border-t border-gray-100 dark:border-gray-800">
                  {['Draft hero section copy', 'Write feature descriptions'].map((st, i) => (
                    <label key={i} className="flex items-center gap-3 group cursor-pointer">
                      <input type="checkbox" className="rounded border-gray-300 text-primary focus:ring-primary/20" defaultChecked={i===0} />
                      <span className="text-sm text-gray-700 dark:text-gray-300 group-hover:text-primary transition-colors">{st}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Comments */}
              <div>
                <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">Comments</h3>
                <div className="pt-4 border-t border-gray-100 dark:border-gray-800">
                   <p className="text-sm text-gray-500 italic text-center py-4">No comments yet.</p>
                </div>
              </div>

              {/* Attachments */}
              <div>
                <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">Attachments</h3>
                <div className="pt-4 border-t border-gray-100 dark:border-gray-800 text-center py-4">
                   <p className="text-sm text-gray-500">No attachments.</p>
                </div>
              </div>

            </div>
          </aside>
        )}
      </div>
    </div>
  );
}