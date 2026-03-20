import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, ArrowRight, Calendar, User, Clock, ChevronRight, Share2, Tag, Filter } from 'lucide-react';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Avatar } from '../components/ui/Avatar';
import { CMS_PLACEHOLDERS } from '../constants/placeholders';
import { cmsService } from '../services/cmsService';
import { SERVER_URL } from '../lib/axios';

export default function BlogListingPage() {
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedCategory, setSelectedCategory] = useState("All");
    const [currentPage, setCurrentPage] = useState(1);
    const navigate = useNavigate();

    const postsPerPage = 10;

    useEffect(() => {
        setCurrentPage(1);
    }, [searchTerm, selectedCategory]);

    useEffect(() => {
        const fetchPosts = async () => {
            try {
                setLoading(true);
                const data = await cmsService.getPublicIndex();
                // We only want blog posts (slugs like home, about, contact should be filtered out if needed, but getPublicIndex gets published ones)
                // Let's filter by category or excerpt presence to ensure they are blogs
                setPosts(data);
            } catch (err) {
                console.error('Error fetching blogs:', err);
            } finally {
                setLoading(false);
            }
        };
        fetchPosts();
    }, []);

    const allCategories = ["All", ...new Set(posts.map(p => p.category).filter(Boolean))];

    const filteredPosts = posts.filter(post => {
        const matchesSearch = post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                             (post.excerpt && post.excerpt.toLowerCase().includes(searchTerm.toLowerCase()));
        const matchesCategory = selectedCategory === "All" || post.category === selectedCategory;
        return matchesSearch && matchesCategory;
    });

    const totalPages = Math.ceil(filteredPosts.length / postsPerPage);
    const currentPosts = filteredPosts.slice((currentPage - 1) * postsPerPage, currentPage * postsPerPage);
    const featuredPost = currentPosts[0];
    const postsForGrid = currentPosts.slice(1);

    const getImageUrl = (url, placeholder) => {
        if (!url) return placeholder;
        if (url.startsWith('http') || url.startsWith('blob:') || url.startsWith('data:')) {
            return url;
        }
        return `${SERVER_URL}${url}`;
    };

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
               value={searchTerm}
               onChange={(e) => setSearchTerm(e.target.value)}
             />
          </div>

                <div className="flex flex-wrap justify-center gap-2">
                    {allCategories.map((category) => (
                        <button
                            key={category}
                            onClick={() => setSelectedCategory(category)}
                            className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                                selectedCategory === category
                                    ? "bg-primary text-white shadow-lg shadow-primary/25"
                                    : "bg-gray-100 dark:bg-gray-800 text-text-secondary dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700"
                            }`}
                        >
                            {category}
                        </button>
                    ))}
                </div>
        </div>
      </section>

      {/* Featured Article */}
      <section className="py-12 px-6 bg-gray-50/50 dark:bg-gray-900/20">
        <div className="max-w-7xl mx-auto">
            {loading ? (
                <div className="animate-pulse grid grid-cols-1 lg:grid-cols-2 gap-12 items-center bg-white dark:bg-surface-dark p-8 md:p-12 rounded-[2.5rem] border border-border-light dark:border-border-dark">
                    <div className="aspect-[16/10] bg-gray-200 dark:bg-gray-800 rounded-3xl" />
                    <div className="space-y-6">
                        <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded w-1/3" />
                        <div className="h-12 bg-gray-200 dark:bg-gray-800 rounded w-full" />
                        <div className="h-6 bg-gray-200 dark:bg-gray-800 rounded w-full" />
                        <div className="h-6 bg-gray-200 dark:bg-gray-800 rounded w-2/3" />
                        <div className="h-14 bg-gray-200 dark:bg-gray-800 rounded w-1/4" />
                    </div>
                </div>
            ) : featuredPost && (
                <div 
                    className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center cursor-pointer group/featured bg-white dark:bg-surface-dark p-8 md:p-12 rounded-[2.5rem] border border-border-light dark:border-border-dark shadow-xl hover:shadow-2xl transition-all duration-500"
                    onClick={() => navigate(`/blog/${featuredPost.slug}`)}
                >
                            <div className="relative overflow-hidden rounded-3xl aspect-[16/10] shadow-lg">
                                <img
                                    src={getImageUrl(featuredPost.og_image_url, CMS_PLACEHOLDERS.BLOG_FEATURED)}
                                    alt={featuredPost.title}
                                    className="w-full h-full object-cover transition-transform duration-1000 group-hover/featured:scale-105"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-0 group-hover/featured:opacity-100 transition-opacity" />
                                <div className="absolute top-6 left-6">
                                     <Badge variant="primary" className="bg-primary text-white px-4 py-1.5 text-sm backdrop-blur-md border-none shadow-lg">{featuredPost.category}</Badge>
                                </div>
                            </div>
                            <div className="space-y-8">
                                <div className="flex flex-wrap items-center gap-6 text-sm text-text-tertiary">
                                    <span className="flex items-center gap-2 font-semibold">
                                        <Calendar className="w-4 h-4 text-primary" />
                                        {new Date(featuredPost.published_at || featuredPost.updated_at || Date.now()).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                                    </span>
                                    <span className="flex items-center gap-2 font-semibold">
                                        <Clock className="w-4 h-4 text-primary" />
                                        {featuredPost.read_time || '5 min read'}
                                    </span>
                                </div>
                                <h2 className="text-4xl lg:text-6xl font-black text-text-primary dark:text-white leading-[1] tracking-tight transition-colors group-hover/featured:text-primary">
                                    {featuredPost.title}
                                </h2>
                                <p className="text-xl text-text-secondary dark:text-gray-300 leading-relaxed max-w-xl">
                                    {featuredPost.excerpt}
                                </p>
                                <div className="flex items-center justify-between pt-8 border-t border-border-light dark:border-border-dark">
                                    <div className="flex items-center gap-4">
                                        <Avatar src={featuredPost.author_image} fallback={featuredPost.author_name?.[0]} size="lg" className="ring-4 ring-primary/5" />
                                        <div>
                                            <p className="font-extrabold text-lg text-text-primary dark:text-white leading-none mb-1">{featuredPost.author_name}</p>
                                            <p className="text-xs text-text-tertiary font-bold uppercase tracking-wider">Author</p>
                                        </div>
                                    </div>
                                    <div className="hidden sm:flex items-center gap-3 text-primary font-black text-lg transition-all group-hover/featured:gap-5">
                                        Read Article <ArrowRight className="w-6 h-6 animate-pulse-slow" />
                                    </div>
                                </div>
                            </div>
                        </div>
            )}
            {!loading && filteredPosts.length === 0 && (
                <div className="text-center py-20 bg-white dark:bg-surface-dark rounded-3xl border border-dashed border-border-light dark:border-border-dark space-y-4">
                    <div className="mx-auto w-16 h-16 flex items-center justify-center bg-gray-50 dark:bg-gray-800 rounded-2xl text-text-tertiary">
                         <Filter className="w-8 h-8" />
                    </div>
                    <div className="space-y-1">
                        <h3 className="text-xl font-bold text-text-primary dark:text-white">No articles found</h3>
                        <p className="text-text-tertiary max-w-xs mx-auto">We couldn't find any articles matching your search or filters.</p>
                    </div>
                    <Button variant="ghost" onClick={() => { setSearchTerm(""); setSelectedCategory("All"); }}>
                        Clear all filters
                    </Button>
                </div>
            )}
        </div>
      </section>

      {/* Blog Grid */}
      <section className="pb-24 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {loading ? (
              Array.from({ length: 9 }).map((_, i) => (
                <div key={i} className="animate-pulse flex flex-col gap-4">
                  <div className="aspect-[16/10] bg-gray-200 dark:bg-gray-800 rounded-xl" />
                  <div className="h-6 bg-gray-200 dark:bg-gray-800 rounded w-3/4" />
                  <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded w-full" />
                </div>
              ))
            ) : (
              postsForGrid.map((post) => (
                <div 
                    key={post.slug} 
                    className="group flex flex-col bg-white dark:bg-surface-dark rounded-2xl overflow-hidden border border-border-light dark:border-border-dark hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 cursor-pointer"
                    onClick={() => navigate(`/blog/${post.slug}`)}
                >
                  <div className="relative aspect-[16/9] overflow-hidden">
                    <img
                      src={getImageUrl(post.og_image_url, CMS_PLACEHOLDERS.BLOG_FEATURED)}
                      alt={post.title}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                    <div className="absolute top-4 left-4 flex flex-wrap gap-2">
                      <Badge variant="primary" className="bg-primary backdrop-blur-md text-white border-none text-[10px] py-0 px-2 h-6 font-bold shadow-lg">
                        {post.category}
                      </Badge>
                    </div>
                  </div>
                  <div className="p-6 flex-1 flex flex-col">
                    <div className="flex items-center gap-4 text-xs text-text-tertiary mb-3">
                      <span className="flex items-center gap-1.5 font-medium">
                        <Calendar className="w-3.5 h-3.5 text-primary" />
                        {new Date(post.published_at || post.updated_at || Date.now()).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5 text-primary" />
                        {post.read_time || '5 min read'}
                      </span>
                    </div>
                    <h3 className="text-xl font-bold text-text-primary dark:text-white mb-3 line-clamp-2 group-hover:text-primary transition-colors">
                      {post.title}
                    </h3>
                    <p className="text-sm text-text-secondary dark:text-gray-400 mb-6 line-clamp-2 leading-relaxed">
                      {post.excerpt}
                    </p>
                    
                    {/* Tags row */}
                    {post.tags && post.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 mb-6">
                            {post.tags.slice(0, 3).map(tag => (
                                <span key={tag} className="flex items-center gap-1 text-[10px] uppercase tracking-wider font-bold text-text-tertiary bg-gray-100 dark:bg-gray-800/50 px-2 py-0.5 rounded">
                                    <Tag className="w-3 h-3 text-primary" />
                                    {tag}
                                </span>
                            ))}
                            {post.tags.length > 3 && (
                                <span className="text-[10px] text-text-tertiary">+{post.tags.length - 3}</span>
                            )}
                        </div>
                    )}

                    <div className="mt-auto pt-4 border-t border-border-light dark:border-border-dark flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <img 
                          src={getImageUrl(post.author_image, CMS_PLACEHOLDERS.AUTHOR)} 
                          className="w-8 h-8 rounded-full border border-primary/20 object-cover" 
                          alt={post.author_name} 
                        />
                        <span className="text-xs font-semibold text-text-primary dark:text-white">
                          {post.author_name}
                        </span>
                      </div>
                      <Link
                        to={`/blog/${post.slug}`}
                        className="p-2 bg-primary/5 text-primary rounded-full hover:bg-primary hover:text-white transition-all transform hover:rotate-12"
                      >
                        <ArrowRight className="w-4 h-4" />
                      </Link>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="mt-16 flex justify-center gap-2">
              <button 
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="h-10 px-4 rounded-lg flex items-center justify-center text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-text-secondary hover:bg-gray-100 dark:hover:bg-gray-800"
              >
                Previous
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <button 
                  key={page} 
                  onClick={() => setCurrentPage(page)}
                  className={`h-10 w-10 rounded-lg flex items-center justify-center text-sm font-medium transition-colors ${page === currentPage ? 'bg-primary text-white' : 'text-text-secondary hover:bg-gray-100 dark:hover:bg-gray-800'}`}
                >
                  {page}
                </button>
              ))}
              <button 
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="h-10 px-4 rounded-lg flex items-center justify-center text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-text-secondary hover:bg-gray-100 dark:hover:bg-gray-800"
              >
                Next
              </button>
            </div>
          )}
        </div>
      </section>

    </div>
  );
}