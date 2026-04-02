import React, { useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Download, Building, MapPin, Users, Target, TrendingUp, Share2, Bookmark, CheckCircle2, Quote } from 'lucide-react';
import { motion as Motion, AnimatePresence } from 'framer-motion';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Card } from '../components/ui/Card';
import { CASE_STUDIES } from '../data/caseStudiesData';

export function CaseStudyDetailPage() {
  const { id } = useParams();

  const study = useMemo(() => {
    return CASE_STUDIES.find(s => s.id === id);
  }, [id]);

  if (!study) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center bg-background-light dark:bg-[#0a0a0c]">
        <h2 className="text-3xl font-black text-text-primary dark:text-white mb-4">Report Not Found</h2>
        <p className="text-text-secondary mb-8">The case study you are looking for doesn't exist or has been moved.</p>
        <Link to="/case-studies">
          <Button className="rounded-xl font-bold">Back to Library</Button>
        </Link>
      </div>
    );
  }

  return (
    <Motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="bg-background-light dark:bg-[#0a0a0c] min-h-screen font-sans text-text-primary transition-colors duration-500"
    >
      
      {/* Premium Navigation Header */}
      <div className="sticky top-0 z-50 bg-white/80 dark:bg-[#0a0a0c]/80 backdrop-blur-xl border-b border-border-light dark:border-white/5">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link to="/case-studies" className="group flex items-center gap-2 text-sm font-bold text-text-secondary hover:text-primary transition-all">
            <ArrowLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" /> Back to Intelligence Library
          </Link>
          <div className="flex items-center gap-3">
             <Button variant="ghost" size="sm" className="hidden md:flex gap-2 text-text-secondary hover:text-primary font-bold">
               <Share2 className="h-4 w-4" /> Share
             </Button>
             <Button variant="ghost" size="sm" className="hidden md:flex gap-2 text-text-secondary hover:text-primary font-bold">
               <Bookmark className="h-4 w-4" /> Save
             </Button>
             <div className="w-px h-6 bg-border-light dark:bg-white/10 mx-2 hidden md:block"></div>
             <Button variant="outline" size="sm" className="gap-2 rounded-xl font-bold border-primary/20 text-primary hover:bg-primary hover:text-white">
               <Download className="h-4 w-4" /> PDF Report
             </Button>
          </div>
        </div>
      </div>

      {/* Hero Section */}
      <header className="relative py-24 px-6 overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full opacity-20 pointer-events-none">
          <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] bg-primary/30 rounded-full blur-[150px]"></div>
        </div>

        <div className="max-w-7xl mx-auto relative z-10">
          <div className="flex flex-col lg:flex-row gap-16 items-center">
            <div className="flex-1">
              <Motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.1 }}
              >
                <Badge variant="primary" className="mb-6 px-4 py-1.5 rounded-lg font-black uppercase tracking-widest bg-primary/10 text-primary border-primary/20">
                  {study.industry} Case Study
                </Badge>
                <h1 className="text-4xl md:text-6xl font-black text-text-primary dark:text-white leading-[1.1] mb-8">
                  {study.title}
                </h1>
                <p className="text-xl text-text-secondary dark:text-gray-400 leading-relaxed font-medium border-l-4 border-primary pl-8 py-2">
                  {study.excerpt}
                </p>
              </Motion.div>
            </div>
            
            <Motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="w-full lg:w-[450px]"
            >
              <div className="relative group">
                <div className="absolute -inset-4 bg-primary/20 rounded-[2.5rem] blur-2xl group-hover:bg-primary/30 transition-all duration-700"></div>
                <img 
                  src={study.img} 
                  alt={study.company} 
                  className="relative rounded-4xl shadow-2xl border-4 border-white dark:border-[#1c1c21] object-cover aspect-4/3 w-full"
                />
              </div>
            </Motion.div>
          </div>
        </div>
      </header>

      {/* Impact Ribbon */}
      <section className="bg-primary py-12 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 text-center md:text-left">
            {study.metrics.map((metric, i) => (
              <Motion.div 
                key={i}
                initial={{ y: 20, opacity: 0 }}
                whileInView={{ y: 0, opacity: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="flex flex-col md:flex-row items-center gap-6"
              >
                <div className="w-16 h-16 rounded-2xl bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/20">
                  <TrendingUp className="h-8 w-8 text-white" />
                </div>
                <div>
                  <p className="text-white/70 text-xs font-black uppercase tracking-widest mb-1">{metric.label}</p>
                  <p className="text-4xl font-black text-white">{metric.value}</p>
                </div>
              </Motion.div>
            ))}
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-6 py-24">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-20">
          
          {/* Main Article Content */}
          <main className="lg:col-span-8">
            <div className="space-y-16">
              {study.content.map((block, idx) => {
                if (block.type === 'section') {
                  return (
                    <Motion.div 
                      key={idx}
                      initial={{ y: 20, opacity: 0 }}
                      whileInView={{ y: 0, opacity: 1 }}
                      viewport={{ once: true }}
                    >
                      <h2 className="text-3xl font-black text-text-primary dark:text-white mb-6 flex items-center gap-3">
                        <span className="text-primary text-sm font-mono opacity-50">0{Math.floor(idx/2)+1}</span> 
                        {block.title}
                      </h2>
                      <p className="text-lg text-text-secondary dark:text-gray-300 leading-relaxed font-medium">
                        {block.body}
                      </p>
                    </Motion.div>
                  );
                }
                if (block.type === 'callout') {
                  return (
                    <Motion.div 
                      key={idx}
                      initial={{ scale: 0.95, opacity: 0 }}
                      whileInView={{ scale: 1, opacity: 1 }}
                      viewport={{ once: true }}
                      className="relative p-10 md:p-12 bg-gray-50 dark:bg-white/5 rounded-4xl border border-border-light dark:border-white/10 overflow-hidden"
                    >
                      <Quote className="absolute top-8 right-10 h-16 w-16 text-primary opacity-10" />
                      <div className="relative z-10">
                        <Badge className="mb-6 bg-primary text-white border-none py-1 px-3 rounded-lg font-bold">{block.title}</Badge>
                        <p className="text-2xl font-bold text-text-primary dark:text-white italic leading-snug">
                          {block.body}
                        </p>
                      </div>
                    </Motion.div>
                  );
                }
                return null;
              })}
            </div>

            {/* Implementation Checklist */}
            <div className="mt-24 p-10 rounded-4xl border-2 border-dashed border-primary/20 bg-primary/5">
               <h3 className="text-2xl font-black text-text-primary dark:text-white mb-8">Key Playbook Actions</h3>
               <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                 {[
                   "Centralized financial tracking in one dashboard",
                   "Implemented strict role-based data access",
                   "Automated milestone-to-budget links",
                   "Real-time burn rate monitoring"
                 ].map((item, i) => (
                   <div key={i} className="flex gap-4 items-start">
                     <CheckCircle2 className="h-6 w-6 text-primary shrink-0" />
                     <p className="font-bold text-text-secondary dark:text-gray-300">{item}</p>
                   </div>
                 ))}
               </div>
            </div>
          </main>

          {/* Sidebar */}
          <aside className="lg:col-span-4 space-y-10">
            
            {/* Company Profile */}
            <Motion.div
              initial={{ x: 20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.5 }}
            >
              <Card className="p-8 border-border-light dark:border-white/10 dark:bg-[#111114] rounded-4xl shadow-xl">
                <div className="flex items-center gap-5 mb-8">
                  <div className="h-20 w-20 rounded-2xl bg-linear-to-br from-primary to-blue-600 flex items-center justify-center text-3xl font-black text-white shadow-lg shadow-primary/30">
                    {study.profile.initials}
                  </div>
                  <div>
                    <h3 className="font-black text-2xl text-text-primary dark:text-white">{study.company}</h3>
                    <a href={`https://${study.profile.url}`} target="_blank" rel="noreferrer" className="text-primary font-bold hover:underline">
                      {study.profile.url}
                    </a>
                  </div>
                </div>
                
                <div className="space-y-6 text-sm">
                  <div className="flex items-center justify-between p-3 rounded-xl hover:bg-gray-50 dark:hover:bg-white/5 transition-colors">
                    <div className="flex items-center gap-3 text-text-secondary dark:text-gray-400 font-bold">
                       <Building className="h-4 w-4" /> Industry
                    </div>
                    <span className="font-black text-text-primary dark:text-white">{study.industry}</span>
                  </div>
                  <div className="flex items-center justify-between p-3 rounded-xl hover:bg-gray-50 dark:hover:bg-white/5 transition-colors">
                    <div className="flex items-center gap-3 text-text-secondary dark:text-gray-400 font-bold">
                       <MapPin className="h-4 w-4" /> Location
                    </div>
                    <span className="font-black text-text-primary dark:text-white">{study.profile.location}</span>
                  </div>
                  <div className="flex items-center justify-between p-3 rounded-xl hover:bg-gray-50 dark:hover:bg-white/5 transition-colors">
                    <div className="flex items-center gap-3 text-text-secondary dark:text-gray-400 font-bold">
                       <Users className="h-4 w-4" /> Scale
                    </div>
                    <span className="font-black text-text-primary dark:text-white">{study.profile.teamSize}</span>
                  </div>
                  <div className="flex items-center justify-between p-3 rounded-xl hover:bg-gray-50 dark:hover:bg-white/5 transition-colors">
                    <div className="flex items-center gap-3 text-text-secondary dark:text-gray-400 font-bold">
                       <Target className="h-4 w-4" /> Current Stage
                    </div>
                    <Badge variant="outline" className="font-black border-primary text-primary">{study.profile.stage}</Badge>
                  </div>
                </div>
              </Card>
            </Motion.div>

            {/* Newsletter CTA */}
            <div className="bg-[#111114] border border-white/5 rounded-4xl p-10 text-white text-center shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-full opacity-20 pointer-events-none">
                <div className="absolute top-[-20%] right-[-10%] w-[60%] h-[60%] bg-blue-500 rounded-full blur-[100px]"></div>
              </div>
              <h3 className="font-black text-2xl mb-4 relative z-10 text-white">Inspired?</h3>
              <p className="text-gray-400 font-medium mb-8 relative z-10 leading-relaxed">
                Join 5,000+ founders receiving our weekly deep dives into operational excellence.
              </p>
              <Link to="/auth/signup">
                <Button className="w-full h-14 bg-white text-black hover:bg-primary hover:text-white rounded-xl font-black text-base transition-all hover:scale-105 shadow-xl relative z-10">
                  Join the Network
                </Button>
              </Link>
            </div>

          </aside>
        </div>
      </div>

      {/* Recommended Reports */}
      <section className="py-24 bg-gray-50 dark:bg-white/5 px-6">
        <div className="max-w-7xl mx-auto text-center md:text-left">
           <h3 className="text-3xl font-black text-text-primary dark:text-white mb-12">Related Intelligence</h3>
           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
             {CASE_STUDIES.filter(s => s.id !== id).slice(0, 3).map(related => (
               <Link key={related.id} to={`/case-studies/${related.id}`}>
                 <Card className="p-6 h-full hover:border-primary/50 transition-all group dark:bg-[#111114] rounded-2xl">
                   <p className="text-[10px] font-black text-primary uppercase mb-2 tracking-widest">{related.industry}</p>
                   <h4 className="font-black text-lg text-text-primary dark:text-white group-hover:text-primary transition-colors">{related.title}</h4>
                 </Card>
               </Link>
             ))}
           </div>
        </div>
      </section>

    </Motion.div>
  );
}