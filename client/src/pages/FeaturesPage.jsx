import React from 'react';
import { Link } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Wallet, 
  Users, 
  BrainCircuit, 
  Zap, 
  ShieldAlert, 
  Search, 
  TrendingUp 
} from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';

export function FeaturesPage() {
  return (
    <div className="bg-background-light dark:bg-background-dark font-sans text-text-primary transition-colors duration-300">
      
      {/* SECTION 1 — HERO */}
      <section className="py-24 px-6 text-center bg-surface-light dark:bg-surface-dark border-b border-border-light dark:border-border-dark">
        <div className="max-w-4xl mx-auto">
          <Badge variant="primary" className="mb-6">The Unified Operating System</Badge>
          <h1 className="text-4xl md:text-6xl font-bold text-text-primary dark:text-white tracking-tight mb-6">
            Three Powerful Hubs. <br />
            <span className="text-primary">One Seamless Platform.</span>
          </h1>
          <p className="text-xl text-text-secondary dark:text-gray-400 max-w-2xl mx-auto leading-relaxed">
            Eliminate the "Context Gap". We integrate Project Management, Financial Tracking, and Talent Acquisition into a single source of truth.
          </p>
          <div className="mt-10 flex justify-center gap-4">
            <Link to="/auth/signup"><Button size="lg">Start for Free</Button></Link>
            <Link to="/contact"><Button variant="outline" size="lg">Book Demo</Button></Link>
          </div>
        </div>
      </section>

      {/* SECTION 2 — OPERATIONS HUB */}
      <section id="operations" className="py-24 px-6 overflow-hidden">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <div className="order-2 lg:order-1 relative">
             <div className="absolute -inset-4 bg-blue-500/20 rounded-full blur-3xl opacity-30"></div>
             <img 
               src="https://images.unsplash.com/photo-1498050108023-c5249f4df085?q=80&w=2344&auto=format&fit=crop" 
               alt="Operations Dashboard" 
               className="relative rounded-2xl shadow-2xl border border-border-light dark:border-border-dark"
             />
          </div>
          <div className="order-1 lg:order-2">
            <div className="flex items-center gap-3 mb-4 text-primary">
              <LayoutDashboard className="h-8 w-8" />
              <h2 className="text-2xl font-bold">Operations Hub</h2>
            </div>
            <h3 className="text-4xl font-bold text-text-primary dark:text-white mb-6">
              Execute with Agile Precision.
            </h3>
            <p className="text-lg text-text-secondary dark:text-gray-300 mb-8 leading-relaxed">
              A visual and intuitive workspace designed for speed. Track progress from 'To Do' to 'Done' seamlessly without the complexity of enterprise tools.
            </p>
            <ul className="space-y-4">
              {[
                "Interactive Kanban Boards & Gantt Charts",
                "Task Dependencies & Milestones",
                "Integrated Time Tracking per Task",
                "Resource & Workload Management"
              ].map((item, i) => (
                <li key={i} className="flex items-center gap-3 text-text-primary dark:text-gray-200 font-medium">
                  <div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center text-primary shrink-0">
                    <Zap className="h-4 w-4" />
                  </div>
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* SECTION 3 — FINANCIAL HUB */}
      <section id="financials" className="py-24 px-6 bg-surface-light dark:bg-surface-dark border-y border-border-light dark:border-border-dark">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <div>
            <div className="flex items-center gap-3 mb-4 text-success">
              <Wallet className="h-8 w-8" />
              <h2 className="text-2xl font-bold">Financial Hub</h2>
            </div>
            <h3 className="text-4xl font-bold text-text-primary dark:text-white mb-6">
              Extend Your Runway.
            </h3>
            <p className="text-lg text-text-secondary dark:text-gray-300 mb-8 leading-relaxed">
              Stop flying blind. Get a real-time visualization of your burn rate and spending categories. Link expenses directly to projects for true cost analysis.
            </p>
            <ul className="space-y-4">
              {[
                "Real-time Burn Rate Tracking",
                "Automated Runway Forecasting",
                "Expense Categorization & Logging",
                "Project-Based Costing Analysis"
              ].map((item, i) => (
                <li key={i} className="flex items-center gap-3 text-text-primary dark:text-gray-200 font-medium">
                  <div className="h-6 w-6 rounded-full bg-success/10 flex items-center justify-center text-success shrink-0">
                    <TrendingUp className="h-4 w-4" />
                  </div>
                  {item}
                </li>
              ))}
            </ul>
          </div>
          <div className="relative">
             <div className="absolute -inset-4 bg-success/20 rounded-full blur-3xl opacity-30"></div>
             <img 
               src="https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=2340&auto=format&fit=crop" 
               alt="Financial Analytics" 
               className="relative rounded-2xl shadow-2xl border border-border-light dark:border-border-dark"
             />
          </div>
        </div>
      </section>

      {/* SECTION 4 — TALENT MARKETPLACE */}
      <section id="talent" className="py-24 px-6">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <div className="order-2 lg:order-1 relative">
             <div className="absolute -inset-4 bg-warning/20 rounded-full blur-3xl opacity-30"></div>
             <img 
               src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?q=80&w=2340&auto=format&fit=crop" 
               alt="Talent Collaboration" 
               className="relative rounded-2xl shadow-2xl border border-border-light dark:border-border-dark"
             />
          </div>
          <div className="order-1 lg:order-2">
            <div className="flex items-center gap-3 mb-4 text-warning">
              <Users className="h-8 w-8" />
              <h2 className="text-2xl font-bold">Talent Marketplace</h2>
            </div>
            <h3 className="text-4xl font-bold text-text-primary dark:text-white mb-6">
              Hire & Onboard in Minutes.
            </h3>
            <p className="text-lg text-text-secondary dark:text-gray-300 mb-8 leading-relaxed">
              Bridge the skills gap instantly. Post gigs and connect with a curated pool of affordable student and freelance talent, seamlessly integrated into your workflow.
            </p>
            <ul className="space-y-4">
              {[
                "Frictionless Gig Posting",
                "Verified Student & Freelancer Profiles",
                "One-Click Application & Hiring",
                "Integrated Task Assignment for Guests"
              ].map((item, i) => (
                <li key={i} className="flex items-center gap-3 text-text-primary dark:text-gray-200 font-medium">
                  <div className="h-6 w-6 rounded-full bg-warning/10 flex items-center justify-center text-warning shrink-0">
                    <Search className="h-4 w-4" />
                  </div>
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* SECTION 5 — AI INTELLIGENCE LAYER */}
      <section className="py-24 px-6 bg-background-dark text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="text-center mb-16">
            <Badge variant="primary" className="mb-4 bg-primary/20 text-primary-light border-none">The "Smart" Layer</Badge>
            <h2 className="text-4xl font-bold mb-4">Your Proactive Co-Pilot</h2>
            <p className="text-xl text-gray-400 max-w-2xl mx-auto">
              LaunchPad doesn't just store data; it analyzes it. Our AI layer provides automated guardrails and strategic foresight.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                icon: BrainCircuit,
                title: "Sentiment Analysis",
                desc: "Analyzes team comments to gauge morale and detect burnout risks early."
              },
              {
                icon: ShieldAlert,
                title: "Anomaly Detection",
                desc: "Monitors spending patterns to flag unusual expenses or budget overruns instantly."
              },
              {
                icon: Search,
                title: "Smart Matching",
                desc: "Uses NLP to match your gig requirements with the perfect freelancer profile."
              },
              {
                icon: TrendingUp,
                title: "Project Health",
                desc: "Calculates a composite health score based on velocity, budget, and sentiment."
              }
            ].map((feature, idx) => (
              <div key={idx} className="bg-surface-dark p-6 rounded-xl border border-gray-800 hover:border-primary/50 transition-colors group">
                <div className="h-12 w-12 rounded-lg bg-gray-800 flex items-center justify-center text-primary mb-4 group-hover:bg-primary group-hover:text-white transition-colors">
                  <feature.icon className="h-6 w-6" />
                </div>
                <h3 className="text-lg font-bold mb-2">{feature.title}</h3>
                <p className="text-sm text-gray-400 leading-relaxed">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SECTION 6 — CTA */}
      <section className="py-24 px-6 text-center">
        <h2 className="text-3xl font-bold text-text-primary dark:text-white mb-6">
          Stop managing tools. Start managing your startup.
        </h2>
        <div className="flex justify-center gap-4">
          <Link to="/auth/signup"><Button size="lg">Get Started Now</Button></Link>
        </div>
      </section>

    </div>
  );
}