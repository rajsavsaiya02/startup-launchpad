import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Share2, Clock, Calendar, Tag, Twitter, Linkedin, Facebook } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Avatar } from '../components/ui/Avatar';
import { Badge } from '../components/ui/Badge';
import { TableOfContents } from '../components/ui/TableOfContents';

export function BlogArticlePage() {
  // Mock Data (In real app, this comes from an API/CMS based on ID)
  const article = {
    id: 'financial-guide',
    title: "The Founder’s Guide to Burn Rate, Runway & Smart Budgeting",
    subtitle: "Mastering the financial lifelines of your startup before it's too late.",
    category: "Finance",
    date: "Nov 4, 2023",
    readTime: "8 min read",
    author: { 
      name: "Sarah Lee", 
      role: "Financial Advisor", 
      img: "https://i.pravatar.cc/150?u=sarah",
      bio: "Sarah is a former CFO for two unicorns and now advises early-stage startups on financial health and sustainable growth."
    },
    img: "https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?q=80&w=2340&auto=format&fit=crop",
    // Content with IDs for TOC linking
    content: `
      <p class="lead text-xl text-text-secondary dark:text-gray-300 leading-relaxed mb-8">
        Managing cash flow is the single most critical skill for an early-stage founder. Yet, many startups fail because they confuse revenue with runway. This guide breaks down the essentials without the jargon.
      </p>
      
      <h2 id="Understanding-Burn-Rate" class="scroll-mt-24 text-2xl font-bold text-text-primary dark:text-white mt-12 mb-4">Understanding Burn Rate</h2>
      <p class="text-text-secondary dark:text-gray-400 leading-relaxed mb-6">
        Burn rate is simply the rate at which your company spends money in excess of income. It's the speed at which you are "burning" through your capital. There are two types you need to track religiously:
      </p>
      <ul class="list-disc pl-6 space-y-2 text-text-secondary dark:text-gray-400 mb-8">
        <li><strong class="text-text-primary dark:text-white">Gross Burn:</strong> Your total monthly operating expenses (Salaries, Rent, Server costs).</li>
        <li><strong class="text-text-primary dark:text-white">Net Burn:</strong> Your total expenses minus your total revenue. This is the truest measure of cash loss.</li>
      </ul>

      <div class="bg-primary/5 border-l-4 border-primary p-6 rounded-r-lg my-8">
        <p class="text-lg italic text-text-primary dark:text-white font-medium">
          "Revenue is vanity, profit is sanity, but cash is king." — Unknown
        </p>
      </div>

      <h2 id="Why-Runway-Matters" class="scroll-mt-24 text-2xl font-bold text-text-primary dark:text-white mt-12 mb-4">Why Runway Matters</h2>
      <p class="text-text-secondary dark:text-gray-400 leading-relaxed mb-6">
        Runway is the amount of time you have until you run out of cash. It is calculated by dividing your current cash balance by your net burn rate.
      </p>
      <p class="text-text-secondary dark:text-gray-400 leading-relaxed mb-6">
        If you have <span class="font-mono text-primary bg-primary/10 px-1 rounded">$100,000</span> in the bank and your burn rate is <span class="font-mono text-error bg-error/10 px-1 rounded">$10,000/month</span>, you have exactly <strong>10 months of runway</strong> to either become profitable or raise more funds.
      </p>

      <h2 id="Smart-Budgeting-Tips" class="scroll-mt-24 text-2xl font-bold text-text-primary dark:text-white mt-12 mb-4">Smart Budgeting Tips</h2>
      <p class="text-text-secondary dark:text-gray-400 leading-relaxed mb-6">
        To extend your runway, focus on the "unsexy" parts of the business. Negotiate long-term contracts for software, use credits (like AWS Activate), and hire contractors before full-time employees.
      </p>
      
      <h2 id="Conclusion" class="scroll-mt-24 text-2xl font-bold text-text-primary dark:text-white mt-12 mb-4">Conclusion</h2>
      <p class="text-text-secondary dark:text-gray-400 leading-relaxed mb-6">
        Don't wait until you have 2 months of cash left to panic. Build a financial model today and update it weekly.
      </p>
    `
  };

  // IDs must match the HTML content IDs above
  const tocHeadings = ['Understanding-Burn-Rate', 'Why-Runway-Matters', 'Smart-Budgeting-Tips', 'Conclusion'];

  return (
    <div className="bg-background-light dark:bg-background-dark min-h-screen font-sans text-text-primary transition-colors duration-300">
      
      {/* Progress Bar (Optional: Add scroll progress bar at top later) */}
      
      {/* Navigation Breadcrumb */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        <Link to="/blog" className="inline-flex items-center gap-2 text-text-secondary hover:text-primary transition-colors group">
          <ArrowLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" /> 
          <span className="font-medium">Back to Blog</span>
        </Link>
      </div>

      {/* Article Header */}
      <header className="max-w-4xl mx-auto px-6 mb-12 text-center">
        <div className="flex flex-wrap justify-center gap-3 mb-6">
          <Badge variant="primary" className="text-sm px-3 py-1">{article.category}</Badge>
          <span className="flex items-center gap-1.5 text-sm text-text-tertiary px-3 py-1 bg-surface-light dark:bg-surface-dark rounded-full border border-border-light dark:border-border-dark">
            <Clock className="h-3.5 w-3.5" /> {article.readTime}
          </span>
          <span className="flex items-center gap-1.5 text-sm text-text-tertiary px-3 py-1 bg-surface-light dark:bg-surface-dark rounded-full border border-border-light dark:border-border-dark">
            <Calendar className="h-3.5 w-3.5" /> {article.date}
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
      <div className="max-w-6xl mx-auto px-4 sm:px-6 mb-16">
        <div className="aspect-21/9 rounded-2xl overflow-hidden shadow-2xl ring-1 ring-border-light/50 dark:ring-white/10">
          <img src={article.img} alt={article.title} className="w-full h-full object-cover" />
        </div>
      </div>

      {/* Main Layout: Content + Sidebar */}
      <div className="max-w-7xl mx-auto px-6 pb-24">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          
          {/* Sidebar (Desktop Only) */}
          <aside className="hidden lg:block lg:col-span-3">
             <div className="sticky top-28 space-y-8">
                <TableOfContents headings={tocHeadings} />
                
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
             <div 
               className="prose prose-lg dark:prose-invert prose-blue max-w-none"
               dangerouslySetInnerHTML={{ __html: article.content }} 
             />
             
             {/* Article Footer Tags */}
             <div className="mt-12 pt-8 border-t border-border-light dark:border-border-dark flex flex-wrap gap-2">
               {['Finance', 'Startups', 'Management', 'Growth'].map(tag => (
                 <span key={tag} className="flex items-center gap-1 text-sm font-medium px-3 py-1 rounded-md bg-surface-light dark:bg-surface-dark border border-border-light dark:border-border-dark text-text-secondary dark:text-gray-300 hover:border-primary hover:text-primary cursor-pointer transition-colors">
                   <Tag className="h-3 w-3" /> {tag}
                 </span>
               ))}
             </div>
          </div>

          {/* Author Sidebar (Right) */}
          <div className="lg:col-span-2 space-y-8">
             <div className="sticky top-28">
               <p className="text-xs font-bold text-text-tertiary uppercase tracking-wider mb-4">Author</p>
               <div className="bg-surface-light dark:bg-surface-dark rounded-xl p-6 border border-border-light dark:border-border-dark text-center">
                 <Avatar src={article.author.img} size="xl" className="mx-auto mb-4 ring-4 ring-background-light dark:ring-background-dark" />
                 <h3 className="font-bold text-text-primary dark:text-white">{article.author.name}</h3>
                 <p className="text-sm text-primary font-medium mb-4">{article.author.role}</p>
                 <p className="text-sm text-text-tertiary leading-relaxed mb-6">
                   {article.author.bio}
                 </p>
                 <Button variant="outline" size="sm" className="w-full">Follow</Button>
               </div>
             </div>
          </div>

        </div>
      </div>

    </div>
  );
}