import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { 
    Calendar, User, Clock, ChevronLeft, Share2, 
    MessageSquare, Tag, Bookmark, Twitter, Linkedin, Facebook
} from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Avatar } from '../components/ui/Avatar';
import { Badge } from '../components/ui/Badge';
import { cmsService } from '../services/cmsService';
import { CMS_PLACEHOLDERS } from '../constants/placeholders';
import { SERVER_URL } from '../lib/axios';
import { useSettings } from '../context/SettingsContext';

export default function BlogArticlePage() {
    const { slug } = useParams();
    const { settings } = useSettings();
    const [article, setArticle] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchArticle = async () => {
            try {
                setLoading(true);
                const data = await cmsService.getPagePublic(slug);
                setArticle(data);
            } catch (err) {
                console.error('Error fetching article:', err);
            } finally {
                setLoading(false);
            }
        };
        fetchArticle();
    }, [slug]);

    if (loading) return (
        <div className="min-h-screen flex items-center justify-center bg-background-light dark:bg-background-dark">
            <div className="animate-pulse flex flex-col items-center gap-4">
               <div className="w-12 h-12 bg-primary/20 rounded-full" />
               <p className="text-text-tertiary">Reading article...</p>
            </div>
        </div>
    );

    if (!article) return (
        <div className="min-h-screen flex flex-col items-center justify-center p-8 text-center bg-background-light dark:bg-background-dark">
            <h1 className="text-4xl font-bold mb-4">Article Not Found</h1>
            <p className="mb-8 text-text-secondary">The article you're looking for might have been moved or deleted.</p>
            <Link to="/blog" className="text-primary font-bold flex items-center gap-2">
                <ChevronLeft className="w-4 h-4" /> Back to Blog
            </Link>
        </div>
    );

    const getImageUrl = (url, placeholder) => {
        if (!url) return placeholder;
        if (url.startsWith('http') || url.startsWith('blob:') || url.startsWith('data:')) {
            return url;
        }
        return `${SERVER_URL}${url}`;
    };

    const rawDate = article.last_published_at || article.updated_at;
    const publishDate = rawDate && !isNaN(new Date(rawDate))
        ? new Date(rawDate).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
        : 'Recently Published';

  return (
    <div className="bg-background-light dark:bg-background-dark min-h-screen font-sans text-text-primary transition-colors duration-300">
      
      {/* Progress Bar (Optional: Add scroll progress bar at top later) */}
      
      {/* Navigation Breadcrumb */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        <Link to="/blog" className="inline-flex items-center gap-2 text-text-secondary hover:text-primary transition-colors group">
          <ChevronLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" /> 
          <span className="font-medium">Back to Blog</span>
        </Link>
      </div>

      {/* Article Header */}
      <header className="max-w-4xl mx-auto px-6 mb-12 text-center">
        <div className="flex flex-wrap justify-center gap-3 mb-6 min-h-[40px] items-center">
          {article.category && (
            <Badge variant="primary" className="text-sm px-4 py-1.5 font-bold shadow-sm bg-primary text-white border-none">
              {article.category}
            </Badge>
          )}
          <span className="flex items-center gap-1.5 text-sm font-medium text-text-tertiary px-4 py-1.5 bg-white dark:bg-surface-dark rounded-full border border-border-light dark:border-border-dark shadow-sm">
            <Clock className="h-3.5 w-3.5 text-primary" /> {article.read_time || '5 min read'}
          </span>
          <span className="flex items-center gap-1.5 text-sm font-medium text-text-tertiary px-4 py-1.5 bg-white dark:bg-surface-dark rounded-full border border-border-light dark:border-border-dark shadow-sm">
            <Calendar className="h-3.5 w-3.5 text-primary" /> {publishDate}
          </span>
        </div>
        
        <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-text-primary dark:text-white tracking-tight leading-[1.15] mb-6">
          {article.title}
        </h1>
        
        <p className="text-xl text-text-secondary dark:text-gray-300 leading-relaxed max-w-2xl mx-auto">
          {article.subtitle}
        </p>
      </header>

      {/* Feature Image */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
                <div className="aspect-[21/9] rounded-3xl overflow-hidden mb-12 shadow-2xl relative">
                    <img 
                        src={getImageUrl(article.og_image_url, CMS_PLACEHOLDERS.ARTICLE_HERO)} 
                        alt={article.title} 
                        className="w-full h-full object-cover"
                    />
                    {article.category && (
                        <div className="absolute top-6 left-6 z-10">
                            <Badge variant="primary" className="px-4 py-1.5 text-sm backdrop-blur-md bg-primary/90 text-white border-none shadow-lg">
                                {article.category}
                            </Badge>
                        </div>
                    )}
                </div>
      </div>

      {/* Main Layout: Content + Sidebar */}
      <div className="max-w-7xl mx-auto px-6 pb-24">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          
          {/* Sidebar (Desktop Only) */}
          <aside className="hidden lg:block lg:col-span-3">
             <div className="sticky top-28 space-y-8">
                {/* <TableOfContents headings={tocHeadings} /> */}
                
                <div className="border-t border-border-light dark:border-border-dark pt-6">
                  <p className="text-xs font-bold text-text-tertiary uppercase tracking-wider mb-4">Share</p>
                  <div className="flex gap-2">
                    <Button variant="ghost" size="icon" className="rounded-full bg-surface-light border border-border-light hover:text-[#1DA1F2]"><Twitter className="h-4 w-4" /></Button>
                    <Button variant="ghost" size="icon" className="rounded-full bg-surface-light border border-border-light hover:text-[#0A66C2]"><Linkedin className="h-4 w-4" /></Button>
                    <Button variant="ghost" size="icon" className="rounded-full bg-surface-light border border-border-light hover:text-[#1877F2]"><Facebook className="h-4 w-4" /></Button>
                  </div>
                </div>
             </div>
          </aside>

          {/* Article Content */}
          <div className="lg:col-span-7">
             <div className="prose prose-lg dark:prose-invert max-w-none prose-headings:text-text-primary dark:prose-headings:text-white prose-p:text-text-secondary dark:prose-p:text-gray-300 prose-img:rounded-2xl prose-a:text-primary">
                            {(() => {
                                const content = article.published_content;
                                if (!content) return <p className="text-text-tertiary italic">No content available.</p>;

                                // Handle TipTap "doc" format
                                if (content.type === 'doc' && Array.isArray(content.content)) {
                                    return content.content.map((block, idx) => {
                                        if (block.type === 'heading') {
                                            const Level = `h${block.attrs?.level || 2}`;
                                            return <Level key={idx}>{block.content?.[0]?.text}</Level>;
                                        }
                                        if (block.type === 'paragraph') {
                                            return <p key={idx}>{block.content?.map(c => c.text).join('')}</p>;
                                        }
                                        return null;
                                    });
                                }

                                // Handle plain string (HTML)
                                if (typeof content === 'string') {
                                    return <div dangerouslySetInnerHTML={{ __html: content }} />;
                                }

                                // Handle array of blocks (legacy)
                                if (Array.isArray(content)) {
                                    return content.map((block, idx) => {
                                        if (block.type === 'heading') {
                                            const Level = `h${block.attrs?.level || 2}`;
                                            return <Level key={idx}>{block.content?.[0]?.text}</Level>;
                                        }
                                        if (block.type === 'paragraph') {
                                            return <p key={idx}>{block.content?.map(c => c.text).join('')}</p>;
                                        }
                                        return null;
                                    });
                                }

                                return <p className="text-text-tertiary italic">No content available.</p>;
                            })()}
                        </div>

                        {/* Article Tags */}
                        {article.tags && article.tags.length > 0 && (
                            <div className="mt-16 pt-8 border-t border-border-light dark:border-border-dark">
                                <p className="text-xs font-bold text-text-tertiary uppercase tracking-wider mb-4">Related Topics</p>
                                <div className="flex flex-wrap gap-2">
                                    {article.tags.map(tag => (
                                        <span key={tag} className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 dark:bg-gray-800/50 rounded-lg text-sm font-medium text-text-secondary dark:text-gray-400 border border-transparent hover:border-primary/20 hover:text-primary transition-all cursor-default">
                                            <Tag className="w-3.5 h-3.5 text-primary/50" />
                                            {tag}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        )}
          </div>

          {/* Author Sidebar (Right) */}
          <div className="lg:col-span-2 space-y-8">
             <div className="sticky top-28">
               <p className="text-xs font-bold text-text-tertiary uppercase tracking-wider mb-4">Author</p>
                <div className="bg-surface-light dark:bg-surface-dark rounded-2xl p-6 border border-border-light dark:border-border-dark text-center shadow-sm">
                  <Avatar 
                    src={getImageUrl(article.author_image, CMS_PLACEHOLDERS.AUTHOR)} 
                    size="xl" 
                    className="mx-auto mb-4 ring-4 ring-white dark:ring-background-dark shadow-md" 
                  />
                  <h3 className="font-bold text-lg text-text-primary dark:text-white mb-1">
                    {article.author_name || 'Anonymous Author'}
                  </h3>
                  <p className="text-xs text-primary font-bold uppercase tracking-widest mb-4">Article Author</p>
                  
                  {article.author_bio ? (
                    <p className="text-sm text-text-secondary dark:text-gray-400 leading-relaxed mb-6 italic">
                      "{article.author_bio}"
                    </p>
                  ) : (
                    <p className="text-sm text-text-tertiary leading-relaxed mb-6">
                      Contributing expert at {settings?.platform_name || 'Startup LaunchPad'}.
                    </p>
                  )}
                  
                  <Button variant="outline" size="sm" className="w-full font-bold hover:bg-primary hover:text-white transition-all">
                    Follow
                  </Button>
                </div>
             </div>
          </div>

        </div>
      </div>

    </div>
  );
}