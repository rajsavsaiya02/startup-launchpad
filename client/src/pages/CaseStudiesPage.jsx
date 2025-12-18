import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Search, Filter, ArrowRight, TrendingUp, Calendar } from 'lucide-react';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Card } from '../components/ui/Card';

const STUDIES = [
  {
    id: 'nextgen-ai',
    title: "Scaling from Garage to Series A in 9 Months",
    company: "NextGen AI",
    industry: "SaaS / AI",
    outcome: "raised-series-a",
    date: "Oct 2023",
    metrics: { growth: "300%", runway_saved: "4 Months" },
    img: "https://images.unsplash.com/photo-1556761175-5973dc0f32e7?q=80&w=2664&auto=format&fit=crop",
    excerpt: "How a small team used LaunchPad's Financial Hub to extend their runway and secure funding during a market downturn."
  },
  {
    id: 'green-earth',
    title: "The Pivot: From B2C App to Enterprise Platform",
    company: "Green Earth Tech",
    industry: "Cleantech",
    outcome: "successful-pivot",
    date: "Sept 2023",
    metrics: { growth: "150%", runway_saved: "6 Months" },
    img: "https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?q=80&w=2626&auto=format&fit=crop",
    excerpt: "Recognizing a failing B2C model early using LaunchPad's Operational Metrics allowed Green Earth to pivot before cash ran out."
  },
  {
    id: 'urban-logistics',
    title: "Managing a 50-Person Gig Workforce Remotely",
    company: "Urban Logistics",
    industry: "Logistics",
    outcome: "operational-efficiency",
    date: "Aug 2023",
    metrics: { growth: "500%", runway_saved: "N/A" },
    img: "https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?q=80&w=2340&auto=format&fit=crop",
    excerpt: "How Urban Logistics used the Talent Marketplace to scale their delivery fleet without bloating their full-time headcount."
  }
];

export function CaseStudiesPage() {
  const [filter, setFilter] = useState('All');

  return (
    <div className="bg-background-light dark:bg-background-dark min-h-screen font-sans text-text-primary transition-colors duration-300">
      
      {/* Magazine Header */}
      <section className="bg-surface-light dark:bg-surface-dark border-b border-border-light dark:border-border-dark py-20 px-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-end justify-between gap-8">
          <div className="max-w-3xl">
            <p className="text-primary font-bold tracking-wider uppercase text-sm mb-2">Startup Insider • Monthly Report</p>
            <h1 className="text-4xl md:text-5xl font-bold text-text-primary dark:text-white leading-tight">
              Real Stories. <span className="text-text-secondary dark:text-gray-400">Real Data.</span> <br/>
              Real Growth.
            </h1>
            <p className="mt-6 text-xl text-text-secondary dark:text-gray-400 max-w-2xl leading-relaxed">
              Deep dives into how high-growth startups use operational discipline to win. Not just inspiration—blueprints for your own success.
            </p>
          </div>
          
          {/* Search/Filter Bar */}
          <div className="w-full md:w-auto flex flex-col gap-3">
             <div className="relative">
               <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-tertiary" />
               <input 
                 type="text" 
                 placeholder="Search case studies..." 
                 className="h-10 w-full md:w-64 pl-9 pr-4 rounded-lg border border-border-light dark:border-border-dark bg-white dark:bg-[#161121] text-sm focus:ring-2 focus:ring-primary/20"
               />
             </div>
             <div className="flex gap-2">
               {['All', 'SaaS', 'Fintech', 'Cleantech'].map(f => (
                 <button 
                   key={f}
                   onClick={() => setFilter(f)}
                   className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors border ${filter === f ? 'bg-primary text-white border-primary' : 'bg-transparent text-text-secondary border-border-light hover:border-text-secondary'}`}
                 >
                   {f}
                 </button>
               ))}
             </div>
          </div>
        </div>
      </section>

      {/* Featured Case Study (Magazine Cover Style) */}
      <section className="py-16 px-6 border-b border-border-light dark:border-border-dark">
        <div className="max-w-7xl mx-auto">
          <div className="relative rounded-2xl overflow-hidden bg-surface-dark text-white shadow-2xl">
            <div className="absolute inset-0 bg-linear-to-r from-black/80 via-black/50 to-transparent z-10"></div>
            <img 
              src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?q=80&w=2340&auto=format&fit=crop" 
              alt="Featured Case Study" 
              className="absolute inset-0 w-full h-full object-cover"
            />
            
            <div className="relative z-20 p-8 md:p-16 max-w-2xl">
              <Badge className="bg-white/20 text-white border-none backdrop-blur-md mb-6">Editor's Pick</Badge>
              <h2 className="text-3xl md:text-5xl font-bold leading-tight mb-6">
                The "Zero-to-One" Playbook: How Stealth Co. Validated in 30 Days
              </h2>
              <p className="text-lg text-gray-200 mb-8 leading-relaxed">
                A granular look at the exact tasks, budget allocation, and hiring roadmap used by Stealth Co. to launch their MVP ahead of schedule and under budget.
              </p>
              <div className="flex flex-wrap gap-6 items-center">
                <Link to="/case-studies/stealth-co">
                  <Button size="lg" className="bg-white text-primary hover:bg-gray-100 border-none">
                    Read Full Report
                  </Button>
                </Link>
                <div className="flex gap-4 text-sm font-medium text-gray-300">
                  <span className="flex items-center gap-1"><TrendingUp className="h-4 w-4" /> Growth Strategy</span>
                  <span className="flex items-center gap-1"><Calendar className="h-4 w-4" /> Nov 2023</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Case Study Grid */}
      <section className="py-20 px-6 bg-gray-50 dark:bg-background-dark/50">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-between items-center mb-10">
            <h3 className="text-2xl font-bold text-text-primary dark:text-white">Latest Reports</h3>
            <Link to="/case-studies/archive" className="text-primary font-medium hover:underline text-sm">View Archive →</Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {STUDIES.map((study) => (
              <Card key={study.id} className="group overflow-hidden border-border-light dark:border-border-dark hover:shadow-lg transition-all duration-300">
                <div className="h-48 overflow-hidden relative">
                  <img 
                    src={study.img} 
                    alt={study.title} 
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <div className="absolute top-4 left-4">
                    <Badge className="bg-white/90 text-text-primary shadow-sm backdrop-blur-sm">{study.industry}</Badge>
                  </div>
                </div>
                
                <div className="p-6 flex flex-col h-[280px]">
                  <div className="mb-4">
                    <h4 className="text-lg font-bold text-text-primary dark:text-white leading-snug group-hover:text-primary transition-colors">
                      {study.title}
                    </h4>
                    <p className="mt-2 text-sm text-text-secondary dark:text-gray-400 line-clamp-3">
                      {study.excerpt}
                    </p>
                  </div>
                  
                  <div className="mt-auto pt-4 border-t border-border-light dark:border-border-dark flex justify-between items-center">
                    <div className="text-xs">
                      <p className="font-semibold text-text-primary dark:text-white">{study.company}</p>
                      <p className="text-text-tertiary">{study.date}</p>
                    </div>
                    <Link to={`/case-studies/${study.id}`}>
                      <Button variant="ghost" size="sm" className="gap-1 pr-0 hover:bg-transparent hover:text-primary">
                        Read <ArrowRight className="h-4 w-4" />
                      </Button>
                    </Link>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

    </div>
  );
}