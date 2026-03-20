import React, { useState, useEffect } from 'react';
import { cmsService } from '../../../services/cmsService';
import { useToast } from '../../../components/ui/Toast';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { Button } from '../../../components/ui/Button';
import { Badge } from '../../../components/ui/Badge';
import { Input } from '../../../components/ui/Input';
import { Plus, Search, FileText, Edit3 } from 'lucide-react';
import { CreatePageModal } from './CreatePageModal';

export function ContentManagementPage() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const { addToast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    fetchPosts();
  }, [statusFilter, categoryFilter]);

  const fetchPosts = async () => {
    try {
      setLoading(true);
      const query = { page_type: 'blog' };
      if (statusFilter !== 'All') query.status = statusFilter.toLowerCase();
      if (categoryFilter !== 'All') query.category = categoryFilter;
      
      const data = await cmsService.getPages(query);
      setPosts(data);
    } catch (err) {
      console.error(err);
      addToast('Error fetching posts', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this post?')) return;
    try {
      await cmsService.deletePage(id);
      addToast('Post deleted successfully', 'success');
      fetchPosts();
    } catch (err) {
      console.error(err);
      addToast('Error deleting post', 'error');
    }
  };

  const handleCreate = async (values) => {
    try {
      const created = await cmsService.createPage({ ...values, page_type: 'blog' });
      addToast('Blog post created!', 'success');
      setIsCreateOpen(false);
      navigate(`/admin/communication/cms/pages/${created.slug}`);
    } catch (err) {
      console.error(err);
      addToast(err.response?.data?.message || 'Failed to create blog post', 'error');
    }
  };

  const filteredPosts = posts.filter(post => 
    post.title.toLowerCase().includes(search.toLowerCase()) ||
    (post.category && post.category.toLowerCase().includes(search.toLowerCase()))
  );

  const categories = ['All', ...new Set(posts.map(p => p.category).filter(Boolean))];
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
            <Badge variant="primary" className="rounded-full">{filteredPosts.length}</Badge>
          </div>
          <Button className="gap-2" onClick={() => setIsCreateOpen(true)}>
            <Plus className="h-4 w-4" /> New Blog Post
          </Button>
        </div>

        <div className="flex flex-col lg:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Input 
              icon={Search} 
              placeholder="Search by title or category..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="flex gap-2 w-full lg:w-auto">
            <select 
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="h-11 rounded-lg border border-border-light bg-background-light px-3 text-sm focus:ring-2 focus:ring-primary/20 dark:bg-background-dark dark:border-border-dark dark:text-white flex-1 lg:w-40"
            >
              <option>All Status</option>
              <option>Published</option>
              <option>Draft</option>
            </select>
            <select 
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="h-11 rounded-lg border border-border-light bg-background-light px-3 text-sm focus:ring-2 focus:ring-primary/20 dark:bg-background-dark dark:border-border-dark dark:text-white flex-1 lg:w-40"
            >
              {categories.map(cat => <option key={cat}>{cat}</option>)}
            </select>
          </div>
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
              {loading ? (
                <tr>
                  <td colSpan="5" className="px-6 py-12 text-center text-text-tertiary">Loading posts...</td>
                </tr>
              ) : filteredPosts.length === 0 ? (
                <tr>
                  <td colSpan="5" className="px-6 py-12 text-center text-text-tertiary">No posts found matching your criteria.</td>
                </tr>
              ) : filteredPosts.map((post) => (
                <tr key={post.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                  <td className="px-6 py-4 font-medium text-text-primary dark:text-white">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-primary/10 rounded-lg text-primary flex-shrink-0">
                          <FileText className="h-4 w-4" />
                      </div>
                      <div className="flex flex-col min-w-0">
                        <span className="truncate block font-semibold">{post.title}</span>
                        <span className="text-xs text-text-tertiary truncate block">/{post.slug}</span>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {post.category ? (
                      <Badge variant="neutral" className="bg-gray-100 dark:bg-gray-800">{post.category}</Badge>
                    ) : (
                      <span className="text-text-tertiary">—</span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <Badge variant={post.status === 'published' ? 'success' : 'neutral'}>
                      {post.status.charAt(0).toUpperCase() + post.status.slice(1)}
                    </Badge>
                  </td>
                  <td className="px-6 py-4 text-text-tertiary whitespace-nowrap text-xs">
                    {format(new Date(post.updated_at), 'MMM d, yyyy')}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <button 
                        onClick={() => navigate(`/admin/communication/cms/pages/${post.slug}`)}
                        className="p-1.5 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 text-text-tertiary hover:text-primary transition-colors" 
                        title="Edit"
                      >
                        <Edit3 className="h-4 w-4" />
                      </button>
                      <button 
                         onClick={() => handleDelete(post.id)}
                         className="p-1.5 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 text-text-tertiary hover:text-error transition-colors" 
                         title="Delete"
                      >
                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                           <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
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
           <span>Showing {filteredPosts.length} results</span>
        </div>

      </div>

      <CreatePageModal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        onSubmit={handleCreate}
      />
    </div>
  );
}