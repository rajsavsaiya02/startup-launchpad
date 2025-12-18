import React from 'react';
import { Search, Plus, MoreVertical, Edit3, FileText, Globe, MessageSquare, Folder, Megaphone } from 'lucide-react';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';
import { Badge } from '../../../components/ui/Badge';

const BLOG_POSTS = [
  { id: 1, title: 'How to Build a Strong MVP', category: 'Startups', status: 'Published', date: 'Oct 12, 2023' },
  { id: 2, title: 'The Founder’s Guide to Burn Rate', category: 'Finance', status: 'Published', date: 'Nov 4, 2023' },
  { id: 3, title: 'UX Principles for SaaS', category: 'Design', status: 'Draft', date: 'Sept 21, 2023' },
  { id: 4, title: 'AI in Early-Stage Ops', category: 'Product', status: 'Published', date: 'Dec 1, 2023' },
];

const CMS_NAV = [
  { name: 'Blog Posts', icon: FileText, active: true },
  { name: 'Homepage Sections', icon: Globe, active: false },
  { name: 'Testimonials', icon: MessageSquare, active: false },
  { name: 'Resource Center', icon: Folder, active: false },
  { name: 'Banners & Highlights', icon: Megaphone, active: false },
];

export function ContentManagementPage() {
  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-20">
      
      {/* Header */}
      <div>
        <h1 className="text-4xl font-bold text-text-primary dark:text-white mb-2">Content Management</h1>
        <p className="text-lg text-text-secondary dark:text-gray-400">Manage blog posts, homepage content, testimonials, and resources.</p>
      </div>

      <div className="flex flex-col lg:flex-row gap-8 items-start">
        
        {/* CMS Sidebar */}
        <aside className="w-full lg:w-64 bg-white dark:bg-surface-dark rounded-xl border border-border-light dark:border-border-dark p-4 shrink-0 sticky top-24">
          <nav className="space-y-1">
            {CMS_NAV.map((item) => (
              <button 
                key={item.name}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  item.active 
                    ? 'bg-primary/10 text-primary border-l-4 border-primary' 
                    : 'text-text-secondary hover:bg-gray-100 dark:hover:bg-gray-800'
                }`}
              >
                <item.icon className="h-5 w-5" />
                {item.name}
              </button>
            ))}
          </nav>
        </aside>

        {/* Main Content Area */}
        <div className="flex-1 w-full bg-white dark:bg-surface-dark rounded-xl border border-border-light dark:border-border-dark shadow-sm p-6">
          
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
            <h2 className="text-2xl font-bold text-text-primary dark:text-white">Blog Posts</h2>
            <Button className="gap-2">
              <Plus className="h-4 w-4" /> New Blog Post
            </Button>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Input icon={Search} placeholder="Search blog posts..." />
            </div>
            <select className="h-11 rounded-lg border border-border-light bg-background-light px-3 text-sm focus:ring-2 focus:ring-primary/20 dark:bg-background-dark dark:border-border-dark dark:text-white w-full sm:w-40">
              <option>All Status</option>
              <option>Published</option>
              <option>Draft</option>
              <option>Archived</option>
            </select>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-gray-50 dark:bg-gray-900/50 border-b border-border-light dark:border-border-dark">
                <tr>
                  {['Title', 'Category', 'Status', 'Updated On', 'Actions'].map((h) => (
                    <th key={h} className="px-6 py-4 font-semibold text-text-primary dark:text-white whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-border-light dark:divide-border-dark">
                {BLOG_POSTS.map((post) => (
                  <tr key={post.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                    <td className="px-6 py-4 font-medium text-text-primary dark:text-white">{post.title}</td>
                    <td className="px-6 py-4 text-text-secondary dark:text-gray-400">{post.category}</td>
                    <td className="px-6 py-4">
                      <Badge variant={post.status === 'Published' ? 'success' : 'neutral'}>{post.status}</Badge>
                    </td>
                    <td className="px-6 py-4 text-text-tertiary">{post.date}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <button className="p-1.5 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 text-text-tertiary hover:text-primary transition-colors">
                          <Edit3 className="h-4 w-4" />
                        </button>
                        <button className="p-1.5 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 text-text-tertiary hover:text-primary transition-colors">
                          <MoreVertical className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="mt-8 flex justify-center gap-2">
            <Button variant="outline" size="sm" disabled>Previous</Button>
            <Button variant="primary" size="sm" className="w-8 p-0">1</Button>
            <Button variant="outline" size="sm" className="w-8 p-0">2</Button>
            <Button variant="outline" size="sm" className="w-8 p-0">3</Button>
            <Button variant="outline" size="sm">Next</Button>
          </div>

        </div>
      </div>

    </div>
  );
}