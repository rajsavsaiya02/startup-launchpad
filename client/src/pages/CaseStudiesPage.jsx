import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Search, Filter, ArrowRight, TrendingUp, Calendar, Zap, LayoutGrid, List } from 'lucide-react';
import { motion as Motion, AnimatePresence } from 'framer-motion';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Card } from '../components/ui/Card';
import { CASE_STUDIES } from '../data/caseStudiesData';

export function CaseStudiesPage() {
  const [filter, setFilter] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'list'

  const industries = useMemo(() => {
    const sets = new Set(CASE_STUDIES.map(s => s.industry));
    return ['All', ...Array.from(sets)];
  }, []);

  const filteredStudies = useMemo(() => {
    return CASE_STUDIES.filter(study => {
      const matchesFilter = filter === 'All' || study.industry === filter;
      const matchesSearch = study.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                           study.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           study.excerpt.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesFilter && matchesSearch;
    });
  }, [filter, searchQuery]);

  const featuredStudy = CASE_STUDIES[0]; // Take the first one as featured

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { duration: 0.5, ease: "easeOut" }
    }
  };

  return (
    <div className="bg-background-light dark:bg-[#0a0a0c] min-h-screen font-sans text-text-primary transition-colors duration-500">
      
      {/* Magazine Header */}
      <section className="relative overflow-hidden bg-surface-light dark:bg-[#111114] border-b border-border-light dark:border-white/5 py-24 px-6">
        <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
          <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary rounded-full blur-[120px]"></div>
          <div className="absolute bottom-[-10%] right-[-10%] w-[30%] h-[30%] bg-blue-500 rounded-full blur-[100px]"></div>
        </div>

        <div className="max-w-7xl mx-auto relative z-10 flex flex-col md:flex-row items-center md:items-end justify-between gap-12 text-center md:text-left">
          <Motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="max-w-3xl"
          >
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-bold tracking-widest uppercase mb-6">
              <Zap className="h-3 w-3 fill-primary" /> Startup Insider • Q1 2024
            </div>
            <h1 className="text-5xl md:text-7xl font-black text-text-primary dark:text-white leading-[1.1] tracking-tight">
              Blueprint for <br/>
              <span className="text-transparent bg-clip-text bg-linear-to-r from-primary via-blue-500 to-indigo-600">Exponential Growth.</span>
            </h1>
            <p className="mt-8 text-xl text-text-secondary dark:text-gray-400 max-w-2xl leading-relaxed font-medium">
              We deconstruct the operational DNA of the world's fastest-growing startups. Real data. Real strategies. Zero fluff.
            </p>
          </Motion.div>
          
          {/* Search/Filter Bar */}
          <Motion.div 
             initial={{ opacity: 0, y: 20 }}
             animate={{ opacity: 1, y: 0 }}
             transition={{ delay: 0.2 }}
             className="w-full md:w-auto flex flex-col gap-4 bg-white dark:bg-[#1c1c21] p-6 rounded-2xl shadow-xl border border-border-light dark:border-white/10"
          >
             <div className="relative group">
               <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-tertiary group-focus-within:text-primary transition-colors" />
               <input 
                 type="text" 
                 value={searchQuery}
                 onChange={(e) => setSearchQuery(e.target.value)}
                 placeholder="Search by company or tech..." 
                 className="h-12 w-full md:w-80 pl-10 pr-4 rounded-xl border border-border-light dark:border-white/10 bg-gray-50 dark:bg-[#0a0a0c] text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-hidden"
               />
             </div>
             <div className="flex flex-wrap gap-2">
               {industries.map(ind => (
                 <button 
                   key={ind}
                   onClick={() => setFilter(ind)}
                   className={`px-4 py-2 rounded-lg text-xs font-bold transition-all border ${filter === ind ? 'bg-primary text-white border-primary shadow-lg shadow-primary/20' : 'bg-transparent text-text-secondary border-border-light dark:border-white/10 hover:border-primary/50'}`}
                 >
                   {ind}
                 </button>
               ))}
             </div>
          </Motion.div>
        </div>
      </section>

      {/* Featured Case Study */}
      <section className="py-20 px-6">
        <div className="max-w-7xl mx-auto">
          <Motion.div 
            initial={{ opacity: 0, scale: 0.98 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="group relative rounded-[2.5rem] overflow-hidden bg-surface-dark text-white shadow-2xl h-[500px] md:h-[600px]"
          >
            <div className="absolute inset-0 bg-linear-to-t from-black via-black/40 to-transparent z-10 transition-opacity duration-700 group-hover:opacity-80"></div>
            <Motion.img 
              src={featuredStudy.img} 
              alt={featuredStudy.title} 
              className="absolute inset-0 w-full h-full object-cover grayscale-20 group-hover:grayscale-0 transition-all duration-1000 scale-105 group-hover:scale-100"
            />
            
            <div className="relative z-20 p-8 md:p-20 flex flex-col justify-end h-full max-w-4xl">
              <Motion.div
                initial={{ y: 20, opacity: 0 }}
                whileInView={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.3 }}
              >
                <Badge className="bg-primary text-white border-none px-4 py-1.5 mb-8 text-xs font-black uppercase tracking-widest">Featured Insight</Badge>
                <h2 className="text-4xl md:text-6xl font-black leading-[1.05] mb-8 group-hover:translate-x-2 transition-transform duration-500">
                  {featuredStudy.title}
                </h2>
                <p className="text-lg md:text-xl text-gray-300 mb-10 leading-relaxed font-medium max-w-2xl border-l-4 border-primary pl-6">
                  {featuredStudy.excerpt}
                </p>
                <div className="flex flex-wrap gap-8 items-center">
                  <Link to={`/case-studies/${featuredStudy.id}`}>
                    <Button size="lg" className="bg-white text-black hover:bg-primary hover:text-white border-none px-10 h-14 rounded-xl font-black text-base shadow-xl transition-all hover:-translate-y-1">
                      Explore Case Study
                    </Button>
                  </Link>
                  <div className="flex gap-8 text-sm font-bold text-gray-400">
                    <span className="flex items-center gap-2"><TrendingUp className="h-5 w-5 text-green-400" /> Operational Mastery</span>
                    <span className="flex items-center gap-2"><Calendar className="h-5 w-5 text-blue-400" /> {featuredStudy.date}</span>
                  </div>
                </div>
              </Motion.div>
            </div>
          </Motion.div>
        </div>
      </section>

      {/* Case Study Grid */}
      <section className="py-24 px-6 bg-gray-50 dark:bg-transparent">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-center mb-16 gap-4">
            <div>
              <h3 className="text-3xl font-black text-text-primary dark:text-white">Latest Intelligence</h3>
              <p className="text-text-secondary mt-2 font-medium">Filtered access to recent success stories</p>
            </div>
            <div className="flex items-center gap-4 bg-white dark:bg-white/5 p-1.5 rounded-xl border border-border-light dark:border-white/10">
               <button onClick={() => setViewMode('grid')} className={`p-2 rounded-lg transition-all ${viewMode === 'grid' ? 'bg-primary text-white shadow-md' : 'text-text-tertiary hover:bg-gray-100 dark:hover:bg-white/5'}`}><LayoutGrid className="h-5 w-5" /></button>
               <button onClick={() => setViewMode('list')} className={`p-2 rounded-lg transition-all ${viewMode === 'list' ? 'bg-primary text-white shadow-md' : 'text-text-tertiary hover:bg-gray-100 dark:hover:bg-white/5'}`}><List className="h-5 w-5" /></button>
            </div>
          </div>

          <Motion.div 
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className={viewMode === 'grid' ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10" : "flex flex-col gap-8"}
          >
            <AnimatePresence mode="popLayout">
              {filteredStudies.map((study) => (
                <Motion.div
                  key={study.id}
                  layout
                  variants={itemVariants}
                  initial="hidden"
                  animate="visible"
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.4 }}
                  className="h-full"
                >
                  <Card className={`group relative overflow-hidden border-border-light dark:border-white/5 dark:bg-[#111114] hover:shadow-2xl hover:border-primary/20 transition-all duration-500 rounded-4xl flex flex-col ${viewMode === 'list' ? 'md:flex-row gap-8 h-auto' : 'h-full min-h-[520px]'}`}>
                    {/* Absolute Link Overlay for the whole card */}
                    <Link to={`/case-studies/${study.id}`} className="absolute inset-0 z-20" aria-label={`Read ${study.title}`} />
                    
                    <div className={`${viewMode === 'list' ? 'md:w-1/3' : 'h-56'} overflow-hidden relative shrink-0`}>
                      <img 
                        src={study.img} 
                        alt={study.title} 
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                      />
                      <div className="absolute top-6 left-6 z-30">
                        <Badge className="bg-white/90 dark:bg-black/80 dark:text-white text-text-primary shadow-xl backdrop-blur-md px-3 py-1 font-bold rounded-lg border-none">{study.industry}</Badge>
                      </div>
                    </div>
                    
                    <div className={`p-8 flex flex-col grow relative z-10`}>
                      <div className="mb-6">
                        <div className="flex items-center gap-2 mb-3">
                          <span className="w-8 h-1 bg-primary rounded-full"></span>
                          <p className="text-xs font-black text-primary uppercase tracking-widest">{study.company}</p>
                        </div>
                        <h4 className="text-xl font-black text-text-primary dark:text-white leading-tight group-hover:text-primary transition-colors line-clamp-2">
                          {study.title}
                        </h4>
                        <p className="mt-4 text-sm text-text-secondary dark:text-gray-400 line-clamp-3 leading-relaxed font-medium">
                          {study.excerpt}
                        </p>
                      </div>
                      
                      <div className="mt-auto flex flex-wrap gap-4 mb-6">
                        {study.metrics.slice(0, 2).map((m, i) => (
                          <div key={i} className="flex flex-col">
                            <span className="text-[10px] font-black text-text-tertiary uppercase tracking-tighter">{m.label}</span>
                            <span className="text-lg font-black text-text-primary dark:text-white">{m.value}</span>
                          </div>
                        ))}
                      </div>

                      <div className="pt-6 border-t border-border-light dark:border-white/5 flex justify-between items-center mt-auto">
                        <span className="text-xs font-bold text-text-tertiary">{study.date}</span>
                        <div className="relative z-30">
                          {/* Button is now purely visual or redundant since the card has an overlay, 
                              but keeping it for UI consistency and making it non-interactive to clicks (the overlay handles it) */}
                          <div className="flex items-center gap-2 font-black text-primary p-0 group-hover:translate-x-1 transition-transform cursor-pointer text-sm">
                            Read Report <ArrowRight className="h-4 w-4" />
                          </div>
                        </div>
                      </div>
                    </div>
                  </Card>
                </Motion.div>
              ))}
            </AnimatePresence>
          </Motion.div>
          
          {filteredStudies.length === 0 && (
            <Motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="py-40 text-center"
            >
              <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gray-100 dark:bg-white/5 mb-6">
                <Search className="h-8 w-8 text-text-tertiary" />
              </div>
              <h4 className="text-2xl font-black text-text-primary dark:text-white">No reports match your criteria</h4>
              <p className="text-text-secondary mt-2 font-medium">Try adjusting your filters or search query</p>
              <Button onClick={() => {setFilter('All'); setSearchQuery('');}} variant="outline" className="mt-8 rounded-xl font-bold">Clear All Filters</Button>
            </Motion.div>
          )}
        </div>
      </section>

      {/* Magazine Footer */}
      <section className="py-20 px-6 border-t border-border-light dark:border-white/5">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-12 text-center md:text-left">
          <div className="max-w-xl">
            <h3 className="text-3xl font-black text-text-primary dark:text-white mb-4">Want your story featured?</h3>
            <p className="text-text-secondary font-medium">We're always looking for high-growth startups with disciplined operations to highlight.</p>
          </div>
          <Button size="lg" className="h-14 px-10 rounded-xl font-bold">Submit Your Growth Story</Button>
        </div>
      </section>

    </div>
  );
}