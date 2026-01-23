import React from 'react';
import { Link } from 'react-router-dom';
import { Zap, Shield, CheckCircle } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { useSettings } from '../context/SettingsContext';

export function LandingPage() {
  const { settings } = useSettings();
  const platformName = settings?.platform_name || 'Startup LaunchPad';

  return (
    <div className="bg-surface-light dark:bg-background-dark font-sans text-text-primary transition-colors duration-300">
      
      {/* SECTION 1 — HERO */}
      <section className="relative overflow-hidden px-6 pt-20 pb-24 lg:pt-32 lg:px-8">
        <div className="mx-auto max-w-7xl grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          {/* Hero Content */}
          <div className="flex flex-col gap-6 max-w-2xl">
            <h1 className="text-5xl sm:text-6xl font-bold tracking-tight text-text-primary dark:text-text-dark leading-[1.1]">
              Build, Manage, and Scale Your Startup—
              <span className="text-primary">All in One Platform.</span>
            </h1>
            <p className="text-lg text-text-secondary dark:text-gray-400 leading-relaxed">
              {platformName} gives founders a unified workspace to run projects, track finances, hire talent, and collaborate—without the friction.
            </p>
            <div className="flex flex-wrap items-center gap-4 mt-2">
              <Link to="/auth/signup">
                <Button size="lg" className="px-8 h-12 text-base shadow-lg shadow-primary/25">
                  Get Started <span className="ml-2">→</span>
                </Button>
              </Link>
              <Link to="/auth/login">
                <Button variant="secondary" size="lg" className="h-12 px-8">
                  Book Demo
                </Button>
              </Link>
            </div>
          </div>

          {/* Hero Image */}
          <div className="relative mx-auto w-full max-w-[600px] lg:max-w-none">
            <div className="relative rounded-2xl bg-surface-light/50 p-2 ring-1 ring-inset ring-border-light/10 lg:-m-4 lg:rounded-2xl lg:p-4">
              <img
                src="https://images.unsplash.com/photo-1460925895917-afdab827c52f?q=80&w=2426&auto=format&fit=crop"
                alt="App Dashboard"
                className="w-full rounded-xl shadow-2xl ring-1 ring-gray-900/10 dark:ring-white/10"
              />
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 2 — TRUST LOGOS */}
      <section className="border-y border-border-light bg-background-light/50 py-12 dark:bg-background-dark/50 dark:border-border-dark">
        <div className="mx-auto max-w-7xl px-6 text-center">
          <p className="text-sm font-semibold text-text-tertiary uppercase tracking-wider mb-8">
            Trusted by growing startups and innovative founders
          </p>
          <div className="flex flex-wrap justify-center items-center gap-12 opacity-60 grayscale transition-all duration-500 hover:grayscale-0">
            {/* Placeholder Logos - Replace with SVGs if available */}
            {['Stripe', 'Notion', 'Intercom', 'Slack', 'Airtable'].map((brand) => (
              <span key={brand} className="text-xl font-bold text-text-secondary dark:text-gray-400">{brand}</span>
            ))}
          </div>
        </div>
      </section>

      {/* SECTION 3 — FEATURE GRID */}
      <section className="py-24 px-6 bg-surface-light dark:bg-background-dark">
        <div className="mx-auto max-w-7xl text-center mb-16">
          <h2 className="text-4xl font-bold text-text-primary dark:text-text-dark">
            Everything your startup needs to grow from Day 1.
          </h2>
          <p className="mt-4 text-xl text-text-secondary dark:text-gray-400 max-w-3xl mx-auto">
            Powerful tools designed specifically for early-stage teams and fast-moving founders.
          </p>
        </div>

        <div className="mx-auto max-w-7xl grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            {
              icon: "business_center",
              color: "text-primary",
              title: "Project Management",
              desc: "Agile Kanban boards, milestones, and task dependency mapping ensure zero operational friction."
            },
            {
              icon: "monitoring",
              color: "text-success",
              title: "Financial Hub",
              desc: "Real-time burn rate, runway forecasting, and AI anomaly alerts secure your cash flow."
            },
            {
              icon: "groups",
              color: "text-warning",
              title: "Talent Marketplace",
              desc: "Find, hire, and onboard vetted freelancers/interns directly into your project tasks."
            }
          ].map((feature, idx) => (
            <div key={idx} className="group p-8 rounded-2xl border border-border-light bg-background-light hover:bg-white hover:shadow-card hover:-translate-y-1 transition-all duration-300 dark:bg-surface-dark dark:hover:bg-surface-dark/80 dark:border-border-dark">
              <div className={`mb-6 inline-flex h-14 w-14 items-center justify-center rounded-xl bg-white dark:bg-background-dark shadow-sm ring-1 ring-border-light ${feature.color}`}>
                <span className="material-symbols-outlined text-3xl">{feature.icon}</span>
              </div>
              <h3 className="text-xl font-bold text-text-primary dark:text-text-dark mb-3">{feature.title}</h3>
              <p className="text-text-secondary dark:text-gray-400 leading-relaxed">{feature.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* SECTION 4 — PRODUCT PREVIEW */}
      <section className="py-24 px-6 overflow-hidden">
        <div className="mx-auto max-w-7xl grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
          <div>
            <h2 className="text-3xl font-bold text-text-primary dark:text-text-dark mb-6">Your startup command center.</h2>
            <p className="text-lg text-text-secondary dark:text-gray-400 mb-8 leading-relaxed">
              Monitor team activity, track task progress, review real-time insights, and drive growth with an interface designed for clarity and precision.
            </p>
            <ul className="space-y-4">
              {[
                "Real-time collaboration",
                "Smart analytics",
                "Ultra-clean interface",
                "AI-powered insights"
              ].map((item) => (
                <li key={item} className="flex items-center gap-3 text-text-primary dark:text-text-dark font-medium">
                  <span className="material-symbols-outlined text-xl text-primary">check_circle</span>
                  {item}
                </li>
              ))}
            </ul>
          </div>
          <div className="relative">
            <div className="absolute -inset-4 bg-linear-to-r from-primary to-purple-600 rounded-2xl blur-2xl opacity-20"></div>
            <img 
              src="https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=2340&auto=format&fit=crop" 
              alt="Interface Preview" 
              className="relative rounded-2xl shadow-2xl border border-border-light"
            />
          </div>
        </div>
      </section>

      {/* SECTION 5 — BENEFITS */}
      <section className="py-24 bg-background-light dark:bg-surface-dark">
        <div className="mx-auto max-w-7xl space-y-32 px-6">
          {/* Benefit 1: Finance */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div className="order-2 lg:order-1 rounded-2xl overflow-hidden shadow-2xl border border-border-light">
               <img src="https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?q=80&w=2340&auto=format&fit=crop" alt="Finance" className="w-full h-auto" />
            </div>
            <div className="order-1 lg:order-2">
              <h2 className="text-3xl font-bold text-text-primary dark:text-text-dark mb-6">Track your finances with precision.</h2>
              <p className="text-lg text-text-secondary dark:text-gray-400 mb-8 leading-relaxed">
                Startups often run out of cash prematurely. Our Financial Hub eliminates poor cash flow planning by providing real-time visibility into burn rate, cash flow, and runway.
              </p>
              <div className="flex flex-col gap-4">
                {['Expense logging & categorization', 'Burn rate trends & runway estimation', 'AI anomaly detection for high-value expenses'].map(item => (
                  <div key={item} className="flex items-start gap-3">
                    <span className="flex items-center justify-center h-6 w-6 rounded-full bg-success/20 text-success shrink-0">
                      <span className="material-symbols-outlined text-sm font-bold">check</span>
                    </span>
                    <span className="text-text-primary dark:text-text-dark font-medium">{item}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Benefit 2: Talent */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="text-3xl font-bold text-text-primary dark:text-text-dark mb-6">Grow your team with top-tier talent.</h2>
              <p className="text-lg text-text-secondary dark:text-gray-400 mb-8 leading-relaxed">
                Leverage India's growing gig economy by integrating hiring and management directly into your project workflow, eliminating third-party platform friction.
              </p>
              <div className="flex flex-wrap gap-3">
                {['AI Talent Matching', 'Frictionless Gig Posting', 'Profile Vetting & Rating', 'Seamless Onboarding'].map(tag => (
                  <span key={tag} className="px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-semibold">
                    {tag}
                  </span>
                ))}
              </div>
            </div>
            <div className="rounded-2xl overflow-hidden shadow-2xl border border-border-light">
               <img src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?q=80&w=2340&auto=format&fit=crop" alt="Team" className="w-full h-auto" />
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 6 — TESTIMONIALS */}
      <section className="py-24 px-6">
        <div className="mx-auto max-w-7xl">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-text-primary dark:text-text-dark">Loved by founders worldwide</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { name: "Sarah L.", role: "Founder, Tech Innovate", text: `${platformName} has been a game-changer. The ability to manage everything from projects to finances in one place is invaluable.`, img: "https://i.pravatar.cc/150?u=1" },
              { name: "Mark C.", role: "CEO, Future Solutions", text: "The financial hub alone is worth it. We finally have a clear view of our runway without complicated spreadsheets.", img: "https://i.pravatar.cc/150?u=2" },
              { name: "Emily R.", role: "Product Lead, NextGen AI", text: "Hiring quality freelancers used to be a headache. The talent marketplace connected us with amazing designers in days.", img: "https://i.pravatar.cc/150?u=3" }
            ].map((testim, idx) => (
              <div key={idx} className="p-8 rounded-2xl bg-background-light dark:bg-surface-dark border border-border-light dark:border-border-dark">
                <div className="flex items-center gap-4 mb-6">
                  <img src={testim.img} alt={testim.name} className="w-12 h-12 rounded-full" />
                  <div>
                    <p className="font-bold text-text-primary dark:text-text-dark">{testim.name}</p>
                    <p className="text-xs text-text-tertiary">{testim.role}</p>
                  </div>
                </div>
                <p className="text-text-secondary dark:text-gray-400 italic leading-relaxed">"{testim.text}"</p>
                <div className="flex text-warning mt-4 gap-1">
                  {[1,2,3,4,5].map(i => <span key={i} className="material-symbols-outlined text-lg fill">star</span>)}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SECTION 7 — FINAL CTA */}
      <section className="py-24 px-6">
        <div className="mx-auto max-w-5xl rounded-3xl bg-linear-to-r from-primary to-blue-600 px-6 py-16 text-center text-white shadow-2xl">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">Ready to launch your next big idea?</h2>
          <p className="text-lg text-blue-100 mb-10 max-w-2xl mx-auto">
            Join thousands of founders using {platformName} to build, grow, and scale smarter.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link to="/auth/signup">
              <Button size="lg" className="bg-white text-primary hover:bg-gray-100 border-none w-full sm:w-auto">
                Get Started Now
              </Button>
            </Link>
            <Link to="/features">
              <Button variant="outline" size="lg" className="border-white text-white hover:bg-white/10 w-full sm:w-auto">
                Explore Features
              </Button>
            </Link>
          </div>
        </div>
      </section>

    </div>
  );
}