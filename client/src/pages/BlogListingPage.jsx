import React from 'react';
import { Link } from 'react-router-dom';
import { Search, ArrowRight } from 'lucide-react';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Card } from '../components/ui/Card';
import { Avatar } from '../components/ui/Avatar';

// Sample Data
const BLOG_POSTS = [
  {
    id: 1,
    title: "The Founder’s Guide to Burn Rate, Runway & Smart Budgeting",
    excerpt: "A simple explanation of critical financial concepts for startups.",
    category: "Finance",
    author: { name: "Sarah Lee", img: "https://i.pravatar.cc/150?u=sarah" },
    date: "Nov 4, 2023",
    img: "https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?q=80&w=2340&auto=format&fit=crop"
  },
  {
    id: 2,
    title: "UX Principles that Make SaaS Products Actually Usable",
    excerpt: "Key design principles that elevate the user experience of software products.",
    category: "Design",
    author: { name: "Chloe Davis", img: "https://i.pravatar.cc/150?u=chloe" },
    date: "Sept 21, 2023",
    img: "https://images.unsplash.com/photo-1581291518633-83b4ebd1d83e?q=80&w=2340&auto=format&fit=crop"
  },
  {
    id: 3,
    title: "How AI Is Transforming Early-Stage Startup Operations",
    excerpt: "Exploring the impact of artificial intelligence on startup efficiency and growth.",
    category: "Product",
    author: { name: "Mark Chen", img: "https://i.pravatar.cc/150?u=mark" },
    date: "Dec 1, 2023",
    img: "https://images.unsplash.com/photo-1677442136019-21780ecad995?q=80&w=2340&auto=format&fit=crop"
  },
  {
    id: 4,
    title: "Hiring Top-Tier Talent as a Small Startup",
    excerpt: "Strategies for attracting and retaining the best employees without a big budget.",
    category: "Hiring",
    author: { name: "Marcus Allen", img: "https://i.pravatar.cc/150?u=marcus" },
    date: "Aug 25, 2023",
    img: "https://images.unsplash.com/photo-1521737604893-d14cc237f11d?q=80&w=2348&auto=format&fit=crop"
  },
  {
    id: 5,
    title: "How to Build a Strong MVP Without Burning Cash",
    excerpt: "Practical tips for building an MVP with clarity and speed.",
    category: "Startups",
    author: { name: "Ben Adams", img: "https://i.pravatar.cc/150?u=ben" },
    date: "Oct 12, 2023",
    img: "https://images.unsplash.com/photo-1519389950473-47ba0277781c?q=80&w=2340&auto=format&fit=crop"
  }
];

export function BlogListingPage() {
  return (
    <div className="bg-background-light dark:bg-background-dark font-sans text-text-primary transition-colors duration-300 min-h-screen">
      
      {/* Header & Search */}
      <section className="py-20 px-6 text-center border-b border-border-light dark:border-border-dark bg-surface-light dark:bg-surface-dark">
        <div className="max-w-3xl mx-auto space-y-8">
          <div className="space-y-4">
            <h1 className="text-4xl md:text-5xl font-bold text-text-primary dark:text-white">
              Insights, Guides, and <span className="text-primary">Startup Resources</span>
            </h1>
            <p className="text-xl text-text-secondary dark:text-gray-400">
              Expert advice and product updates to help founders build and scale faster.
            </p>
          </div>
          
          <div className="max-w-xl mx-auto relative">
             <Input 
               icon={Search} 
               placeholder="Search articles..." 
               className="h-12 pl-12 text-base rounded-full shadow-sm"
             />
          </div>

          <div className="flex flex-wrap justify-center gap-2">
            {['All', 'Startups', 'Finance', 'Design', 'Product', 'Hiring'].map((tag) => (
              <button 
                key={tag}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${tag === 'All' ? 'bg-primary text-white' : 'bg-gray-100 dark:bg-gray-800 text-text-secondary dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'}`}
              >
                {tag}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Article */}
      <section className="py-16 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="group relative overflow-hidden rounded-2xl bg-surface-light dark:bg-surface-dark border border-border-light dark:border-border-dark shadow-sm hover:shadow-md transition-all duration-300 flex flex-col md:flex-row">
            <div className="w-full md:w-2/5 h-64 md:h-auto relative overflow-hidden">
               <img 
                 src={BLOG_POSTS[4].img} 
                 alt={BLOG_POSTS[4].title} 
                 className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
               />
            </div>
            <div className="flex-1 p-8 md:p-12 flex flex-col justify-center items-start gap-4">
               <Badge variant="primary">{BLOG_POSTS[4].category}</Badge>
               <h2 className="text-3xl font-bold text-text-primary dark:text-white group-hover:text-primary transition-colors">
                 {BLOG_POSTS[4].title}
               </h2>
               <p className="text-lg text-text-secondary dark:text-gray-400 line-clamp-2">
                 {BLOG_POSTS[4].excerpt}
               </p>
               <div className="flex items-center gap-3 mt-2">
                 <Avatar src={BLOG_POSTS[4].author.img} size="sm" />
                 <div className="text-sm">
                   <p className="font-semibold text-text-primary dark:text-white">{BLOG_POSTS[4].author.name}</p>
                   <p className="text-text-tertiary">{BLOG_POSTS[4].date}</p>
                 </div>
               </div>
               <Link to={`/blog/${BLOG_POSTS[4].id}`} className="mt-4 text-primary font-semibold flex items-center gap-2 hover:gap-3 transition-all">
                 Read Article <ArrowRight className="h-4 w-4" />
               </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Blog Grid */}
      <section className="pb-24 px-6">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {BLOG_POSTS.slice(0, 4).map((post) => (
            <Link key={post.id} to={`/blog/${post.id}`} className="group flex flex-col bg-surface-light dark:bg-surface-dark rounded-xl border border-border-light dark:border-border-dark overflow-hidden shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
              <div className="h-48 w-full overflow-hidden relative">
                <img 
                  src={post.img} 
                  alt={post.title} 
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                />
                <div className="absolute top-4 left-4">
                  <Badge className="bg-white/90 text-text-primary shadow-sm backdrop-blur-sm">{post.category}</Badge>
                </div>
              </div>
              
              <div className="flex-1 p-6 flex flex-col gap-3">
                <h3 className="text-xl font-bold text-text-primary dark:text-white group-hover:text-primary transition-colors line-clamp-2">
                  {post.title}
                </h3>
                <p className="text-text-secondary dark:text-gray-400 text-sm line-clamp-2 mb-2">
                  {post.excerpt}
                </p>
                
                <div className="mt-auto flex items-center gap-3 pt-4 border-t border-border-light dark:border-border-dark">
                  <Avatar src={post.author.img} size="sm" />
                  <div className="text-xs">
                    <p className="font-medium text-text-primary dark:text-white">{post.author.name}</p>
                    <p className="text-text-tertiary">{post.date}</p>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* Pagination */}
        <div className="mt-16 flex justify-center gap-2">
           {[1, 2, 3].map((page) => (
             <button 
               key={page} 
               className={`h-10 w-10 rounded-lg flex items-center justify-center text-sm font-medium transition-colors ${page === 1 ? 'bg-primary text-white' : 'text-text-secondary hover:bg-gray-100 dark:hover:bg-gray-800'}`}
             >
               {page}
             </button>
           ))}
           <button className="h-10 px-4 rounded-lg flex items-center justify-center text-sm font-medium text-text-secondary hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
             Next
           </button>
        </div>
      </section>

    </div>
  );
}