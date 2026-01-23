import React from 'react';
import { Search, Plus, MoreVertical, Edit3, FileText } from 'lucide-react';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';
import { Badge } from '../../../components/ui/Badge';
import { Card } from '../../../components/ui/Card';

const BLOG_POSTS = [
  { id: 1, title: 'How to Build a Strong MVP', category: 'Startups', status: 'Published', date: 'Oct 12, 2023' },
  { id: 2, title: 'The Founder’s Guide to Burn Rate', category: 'Finance', status: 'Published', date: 'Nov 4, 2023' },
  { id: 3, title: 'UX Principles for SaaS', category: 'Design', status: 'Draft', date: 'Sept 21, 2023' },
  { id: 4, title: 'AI in Early-Stage Ops', category: 'Product', status: 'Published', date: 'Dec 1, 2023' },
];

export function ContentManagementPage() {
  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-20">
      
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-text-primary dark:text-white mb-2">Blog Posts Manager</h1>
        <p className="text-lg text-text-secondary dark:text-gray-400">Create, edit, and publish content articles.</p>
      </div>

      <div className="bg-white dark:bg-surface-dark rounded-xl border border-border-light dark:border-border-dark shadow-sm p-6">
        
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold text-text-primary dark:text-white">All Posts</h2>
            <Badge variant="primary" className="rounded-full">4</Badge>
          </div>
          <Button className="gap-2">
            <Plus className="h-4 w-4" /> New Blog Post
          </Button>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Input icon={Search} placeholder="Search by title or category..." />
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
                  <td className="px-6 py-4 font-medium text-text-primary dark:text-white flex items-center gap-3">
                    <div className="p-2 bg-primary/10 rounded-lg text-primary">
                        <FileText className="h-4 w-4" />
                    </div>
                    {post.title}
                  </td>
                  <td className="px-6 py-4 text-text-secondary dark:text-gray-400">{post.category}</td>
                  <td className="px-6 py-4">
                    <Badge variant={post.status === 'Published' ? 'success' : 'neutral'}>{post.status}</Badge>
                  </td>
                  <td className="px-6 py-4 text-text-tertiary">{post.date}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <button className="p-1.5 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 text-text-tertiary hover:text-primary transition-colors" title="Edit">
                        <Edit3 className="h-4 w-4" />
                      </button>
                      <button className="p-1.5 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 text-text-tertiary hover:text-primary transition-colors" title="More">
                        <MoreVertical className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination Placeholder */}
        <div className="mt-6 flex justify-between items-center text-xs text-text-tertiary border-t border-border-light dark:border-border-dark pt-4">
           <span>Showing 1-4 of 4 results</span>
           <div className="flex gap-1">
             <Button variant="outline" size="sm" disabled>Prev</Button>
             <Button variant="outline" size="sm" disabled>Next</Button>
           </div>
        </div>

      </div>
    </div>
  );
}