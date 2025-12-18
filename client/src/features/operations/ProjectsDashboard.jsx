import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  Plus, Search, Filter, MoreHorizontal, Calendar, 
  Clock, CheckCircle, AlertCircle, ArrowRight, 
  LayoutGrid, List as ListIcon
} from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Badge } from '../../components/ui/Badge';
import { Avatar } from '../../components/ui/Avatar';
import { Card } from '../../components/ui/Card';
import { CreateProjectModal } from './components/CreateProjectModal';

// Mock Data
const PROJECTS = [
  { 
    id: 1, 
    title: 'Website Redesign 2.0', 
    desc: 'Revamping the marketing site with new branding.', 
    status: 'Active', 
    priority: 'High',
    progress: 75, 
    dueDate: 'Dec 31, 2024', 
    members: [1, 2, 3],
    tasks: { completed: 45, total: 60 },
    health: 'On Track'
  },
  { 
    id: 2, 
    title: 'Mobile App MVP', 
    desc: 'Initial release of the iOS and Android application.', 
    status: 'Active', 
    priority: 'Critical',
    progress: 40, 
    dueDate: 'Jan 15, 2025', 
    members: [4, 5],
    tasks: { completed: 12, total: 48 },
    health: 'At Risk'
  },
  { 
    id: 3, 
    title: 'Q4 Marketing Campaign', 
    desc: 'Social media and email drip campaigns for holiday season.', 
    status: 'Planning', 
    priority: 'Medium',
    progress: 10, 
    dueDate: 'Nov 20, 2024', 
    members: [2, 6],
    tasks: { completed: 2, total: 15 },
    health: 'On Track'
  },
  { 
    id: 4, 
    title: 'Internal Audit System', 
    desc: 'Compliance and security audit tools integration.', 
    status: 'On Hold', 
    priority: 'Low',
    progress: 90, 
    dueDate: 'Oct 30, 2024', 
    members: [1],
    tasks: { completed: 18, total: 20 },
    health: 'Delayed'
  }
];

export function ProjectsDashboard() {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'list'

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-20">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-end gap-4 border-b border-border-light dark:border-border-dark pb-6">
        <div>
          <h1 className="text-3xl font-bold text-text-primary dark:text-white">Projects</h1>
          <p className="text-text-secondary dark:text-gray-400 mt-1">Manage your initiatives, track progress, and collaborate.</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="hidden sm:flex items-center bg-white dark:bg-surface-dark border border-border-light dark:border-border-dark rounded-lg p-1">
            <button 
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded-md transition-all ${viewMode === 'grid' ? 'bg-gray-100 dark:bg-gray-800 text-primary' : 'text-text-tertiary hover:text-text-primary'}`}
            >
              <LayoutGrid className="h-4 w-4" />
            </button>
            <button 
              onClick={() => setViewMode('list')}
              className={`p-2 rounded-md transition-all ${viewMode === 'list' ? 'bg-gray-100 dark:bg-gray-800 text-primary' : 'text-text-tertiary hover:text-text-primary'}`}
            >
              <ListIcon className="h-4 w-4" />
            </button>
          </div>
          <Button className="gap-2" onClick={() => setIsCreateModalOpen(true)}>
            <Plus className="h-5 w-5" /> New Project
          </Button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-text-tertiary" />
          <input 
            type="text" 
            placeholder="Search projects..." 
            className="w-full h-11 pl-10 pr-4 rounded-lg border border-border-light bg-white dark:bg-surface-dark dark:border-border-dark focus:ring-2 focus:ring-primary/20 focus:border-primary"
          />
        </div>
        <div className="flex gap-2 overflow-x-auto pb-2 sm:pb-0">
          {['All', 'Active', 'Planning', 'Completed'].map((filter) => (
            <button 
              key={filter}
              className={`px-4 py-2.5 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${
                filter === 'All' 
                  ? 'bg-white dark:bg-surface-dark border border-border-light dark:border-border-dark text-text-primary dark:text-white shadow-sm' 
                  : 'text-text-secondary hover:bg-gray-100 dark:hover:bg-gray-800'
              }`}
            >
              {filter}
            </button>
          ))}
        </div>
      </div>

      {/* Projects Grid */}
      <div className={`grid gap-6 ${viewMode === 'grid' ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3' : 'grid-cols-1'}`}>
        {PROJECTS.map((project) => (
          <Link key={project.id} to={`/projects/${project.id}`} className="group">
            <Card className="h-full p-6 hover:shadow-lg transition-all duration-300 border-border-light dark:border-border-dark bg-white dark:bg-surface-dark group-hover:border-primary/50">
              
              <div className="flex justify-between items-start mb-4">
                <div className="flex gap-2">
                  <Badge 
                    variant={
                      project.health === 'On Track' ? 'success' : 
                      project.health === 'At Risk' ? 'error' : 'warning'
                    }
                  >
                    {project.health}
                  </Badge>
                  {project.priority === 'High' || project.priority === 'Critical' ? (
                    <Badge variant="error" className="bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 border-transparent">
                      {project.priority}
                    </Badge>
                  ) : null}
                </div>
                <button className="text-text-tertiary hover:text-text-primary">
                  <MoreHorizontal className="h-5 w-5" />
                </button>
              </div>

              <h3 className="text-xl font-bold text-text-primary dark:text-white mb-2 group-hover:text-primary transition-colors">
                {project.title}
              </h3>
              <p className="text-sm text-text-secondary dark:text-gray-400 line-clamp-2 mb-6 min-h-10">
                {project.desc}
              </p>

              {/* Progress Bar */}
              <div className="mb-6">
                <div className="flex justify-between text-xs mb-2">
                  <span className="text-text-secondary font-medium">Progress</span>
                  <span className="text-text-primary dark:text-white font-bold">{project.progress}%</span>
                </div>
                <div className="h-2 w-full bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                  <div 
                    className={`h-full rounded-full transition-all duration-500 ${
                      project.progress >= 100 ? 'bg-success' : 'bg-primary'
                    }`} 
                    style={{ width: `${project.progress}%` }}
                  />
                </div>
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-border-light dark:border-border-dark">
                <div className="flex -space-x-2">
                  {project.members.map((m, i) => (
                    <Avatar key={i} size="sm" src={`https://i.pravatar.cc/150?u=${m}`} className="border-2 border-white dark:border-surface-dark ring-0" />
                  ))}
                  {project.members.length > 3 && (
                     <div className="h-8 w-8 rounded-full bg-gray-100 dark:bg-gray-800 border-2 border-white dark:border-surface-dark flex items-center justify-center text-[10px] font-bold text-text-secondary">
                       +2
                     </div>
                  )}
                </div>
                
                <div className="flex items-center gap-1 text-xs text-text-tertiary">
                  <Calendar className="h-3.5 w-3.5" />
                  <span>{project.dueDate}</span>
                </div>
              </div>

            </Card>
          </Link>
        ))}
        
        {/* Add New Project Card (Grid Only) */}
        {viewMode === 'grid' && (
          <button 
            onClick={() => setIsCreateModalOpen(true)}
            className="h-full min-h-[300px] rounded-xl border-2 border-dashed border-border-light dark:border-gray-800 flex flex-col items-center justify-center text-text-tertiary hover:text-primary hover:border-primary/50 hover:bg-primary/5 transition-all group"
          >
            <div className="h-14 w-14 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center mb-4 group-hover:bg-white dark:group-hover:bg-surface-dark group-hover:shadow-md transition-all">
              <Plus className="h-8 w-8" />
            </div>
            <p className="font-bold">Create New Project</p>
          </button>
        )}
      </div>

      {/* Create Modal Integration */}
      <CreateProjectModal 
        isOpen={isCreateModalOpen} 
        onClose={() => setIsCreateModalOpen(false)} 
      />

    </div>
  );
}