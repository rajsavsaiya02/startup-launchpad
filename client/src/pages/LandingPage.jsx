import React from "react";
import { Link } from "react-router-dom";
import { Zap, Shield, CheckCircle, ArrowRight, Play } from "lucide-react";
import { Button } from "../components/ui/Button";
import { useSettings } from "../context/SettingsContext";
import { useCMSContent } from "../hooks/useCMSContent";
import { QuillEditor } from "../features/admin/content/QuillEditor";
import { motion as Motion } from "framer-motion";

export function LandingPage() {
  // CMS Integration
  const { settings } = useSettings();
  const platformName = settings?.platform_name || "Startup LaunchPad";
  const homepageSlug = settings?.homepage_slug || "home";
  const { content, SEO, loading } = useCMSContent(homepageSlug);

  // If loading, show skeleton or just fall through to default (avoids layout shift if cached, but for first load it might flash)
  // For 'home', we might prefer to wait if we suspect CMS content exists, or just show default until loaded.
  // Better: if loading, show loading spinner slightly?
  // Let's just block render on loading if we want "CMS First" experience, or flash default.
  // Given "Professional CMS", user expects CMS content to be primary.
  if (loading)
    return (
      <div className="min-h-screen bg-white dark:bg-background-dark"></div>
    );

  // If CMS content exists (published OR draft/preview), render it.
  if (content && Object.keys(content).length > 0) {
    return (
      <div className="min-h-screen bg-white dark:bg-background-dark pt-20">
        <SEO />
        <div className="container mx-auto px-4 max-w-5xl">
          <div className="prose dark:prose-invert max-w-none">
            <QuillEditor
              content={content}
              readOnly={true}
              onChange={() => {}}
            />
          </div>
        </div>
      </div>
    );
  }

  // Fallback to Hardcoded Layout
  return (
    <div className="bg-surface-light dark:bg-background-dark font-sans text-text-primary transition-colors duration-300">
      <SEO />{" "}
      {/* Inject SEO metadata even if using hardcoded layout, if 'home' page exists in CMS but has no content or is just for SEO tags */}
      {/* SECTION 1 — HERO */}
      <section className="relative overflow-hidden px-6 pt-20 pb-24 lg:pt-32 lg:px-8">
        {/* Abstract Background Decor */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full -z-10 pointer-events-none opacity-50">
          <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/10 rounded-full blur-[120px]"></div>
          <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-500/10 rounded-full blur-[120px]"></div>
        </div>

        <div className="mx-auto max-w-7xl grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          {/* Hero Content */}
          <Motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="flex flex-col gap-6 max-w-2xl"
          >
            <h1 className="text-5xl sm:text-7xl font-bold tracking-tight text-text-primary dark:text-text-dark leading-[1.05]">
              Build, Manage, and <br />
              <span className="text-transparent bg-clip-text bg-linear-to-r from-primary to-blue-600">
                Scale Your Startup.
              </span>
            </h1>
            <p className="text-lg text-text-secondary dark:text-gray-400 leading-relaxed max-w-lg">
              {platformName} gives founders a unified workspace to run projects,
              track finances, and collaborate—without the friction.
            </p>
            <div className="flex flex-wrap items-center gap-4 mt-4">
              <Link to="/auth/signup">
                <Button
                  size="lg"
                  className="px-8 h-12 text-base shadow-xl shadow-primary/20 group"
                >
                  Get Started{" "}
                  <ArrowRight className="ml-2 w-4 h-4 transition-transform group-hover:translate-x-1" />
                </Button>
              </Link>
              <Link to="/auth/login">
                <Button
                  variant="secondary"
                  size="lg"
                  className="h-12 px-8 group"
                >
                  <Play className="mr-2 w-4 h-4 fill-current" /> Book Demo
                </Button>
              </Link>
            </div>
          </Motion.div>

          {/* Hero Image */}
          <Motion.div
            initial={{ opacity: 0, scale: 0.9, y: 30, rotateY: 0, rotateX: 5 }}
            animate={{ opacity: 1, scale: 1, y: 0, rotateY: -12, rotateX: 8 }}
            whileHover={{
              rotateY: -5,
              rotateX: 5,
              scale: 1.02,
              transition: { duration: 0.4 },
            }}
            transition={{ duration: 1.2, ease: "easeOut", delay: 0.2 }}
            className="relative mx-auto w-full max-w-[700px] lg:max-w-none perspective-1000px transform-style-preserve-3d"
          >
            <img
              src="/assets/hero-dashboard.png"
              alt="App Dashboard"
              className="w-full h-auto object-contain drop-shadow-[0_20px_50px_rgba(0,0,0,0.2)] dark:drop-shadow-[0_20px_50px_rgba(59,130,246,0.1)]"
            />
          </Motion.div>
        </div>
      </section>
      {/* SECTION 2 — WHY CHOOSE US (Redesigned from Platform Stats) */}
      <section className="relative py-12 overflow-hidden border-y border-border-light dark:border-border-dark bg-background-light/30">
        <div className="mx-auto max-w-7xl px-6 relative z-10">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              {
                label: "Unified Workspace",
                icon: "grid_view",
                color: "bg-primary/10 text-primary",
              },
              {
                label: "Real-time Metrics",
                icon: "monitoring",
                color: "bg-success/10 text-success",
              },
              {
                label: "Hiring Marketplace",
                icon: "person_search",
                color: "bg-purple-500/10 text-purple-500",
              },
              {
                label: "Agile Management",
                icon: "rocket_launch",
                color: "bg-warning/10 text-warning",
              },
            ].map((reason, idx) => (
              <Motion.div
                key={reason.label}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
                className="flex items-center gap-4 group"
              >
                <div
                  className={`flex items-center justify-center h-12 w-12 rounded-xl shadow-sm ${reason.color} group-hover:scale-110 transition-transform`}
                >
                  <span className="material-symbols-outlined text-2xl">
                    {reason.icon}
                  </span>
                </div>
                <span className="text-base font-bold text-text-primary dark:text-text-dark tracking-tight">
                  {reason.label}
                </span>
              </Motion.div>
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
            Powerful tools designed specifically for early-stage teams and
            fast-moving founders.
          </p>
        </div>

        <Motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, staggerChildren: 0.1 }}
          className="mx-auto max-w-7xl grid grid-cols-1 md:grid-cols-3 gap-8"
        >
          {[
            {
              icon: "business_center",
              color: "text-primary",
              title: "Project Management",
              desc: "Agile Kanban boards, milestones, and task dependency mapping ensure zero operational friction.",
            },
            {
              icon: "monitoring",
              color: "text-success",
              title: "Financial Hub",
              desc: "Real-time burn rate, runway forecasting, and AI anomaly alerts secure your cash flow.",
            },
            {
              icon: "groups",
              color: "text-warning",
              title: "Talent Marketplace",
              desc: "Find, hire, and onboard vetted freelancers/interns directly into your project tasks.",
            },
          ].map((feature, idx) => (
            <Motion.div
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.1 }}
              className="group p-8 rounded-2xl border border-border-light bg-background-light hover:bg-white hover:shadow-card hover:-translate-y-1 transition-all duration-300 dark:bg-surface-dark dark:hover:bg-surface-dark/80 dark:border-border-dark"
            >
              <div
                className={`mb-6 inline-flex h-14 w-14 items-center justify-center rounded-xl bg-white dark:bg-background-dark shadow-sm ring-1 ring-border-light ${feature.color}`}
              >
                <span className="material-symbols-outlined text-3xl">
                  {feature.icon}
                </span>
              </div>
              <h3 className="text-xl font-bold text-text-primary dark:text-text-dark mb-3">
                {feature.title}
              </h3>
              <p className="text-text-secondary dark:text-gray-400 leading-relaxed">
                {feature.desc}
              </p>
            </Motion.div>
          ))}
        </Motion.div>
      </section>
      {/* SECTION 4 — PRODUCT PREVIEW */}
      <section className="py-24 px-6 overflow-hidden">
        <div className="mx-auto max-w-7xl grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
          <div>
            <h2 className="text-3xl font-bold text-text-primary dark:text-text-dark mb-6">
              Your startup command center.
            </h2>
            <p className="text-lg text-text-secondary dark:text-gray-400 mb-8 leading-relaxed">
              Monitor team activity, track task progress, review real-time
              insights, and drive growth with an interface designed for clarity
              and precision.
            </p>
            <ul className="space-y-4">
              {[
                "Real-time collaboration",
                "Smart analytics",
                "Ultra-clean interface",
                "AI-powered insights",
              ].map((item) => (
                <li
                  key={item}
                  className="flex items-center gap-3 text-text-primary dark:text-text-dark font-medium"
                >
                  <span className="material-symbols-outlined text-xl text-primary">
                    check_circle
                  </span>
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
              <img
                src="https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?q=80&w=2340&auto=format&fit=crop"
                alt="Finance"
                className="w-full h-auto"
              />
            </div>
            <div className="order-1 lg:order-2">
              <h2 className="text-3xl font-bold text-text-primary dark:text-text-dark mb-6">
                Track your finances with precision.
              </h2>
              <p className="text-lg text-text-secondary dark:text-gray-400 mb-8 leading-relaxed">
                Startups often run out of cash prematurely. Our Financial Hub
                eliminates poor cash flow planning by providing real-time
                visibility into burn rate, cash flow, and runway.
              </p>
              <div className="flex flex-col gap-4">
                {[
                  "Expense logging & categorization",
                  "Burn rate trends & runway estimation",
                  "AI anomaly detection for high-value expenses",
                ].map((item) => (
                  <div key={item} className="flex items-start gap-3">
                    <span className="flex items-center justify-center h-6 w-6 rounded-full bg-success/20 text-success shrink-0">
                      <span className="material-symbols-outlined text-sm font-bold">
                        check
                      </span>
                    </span>
                    <span className="text-text-primary dark:text-text-dark font-medium">
                      {item}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Benefit 2: Talent */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="text-3xl font-bold text-text-primary dark:text-text-dark mb-6">
                Grow your team with top-tier talent.
              </h2>
              <p className="text-lg text-text-secondary dark:text-gray-400 mb-8 leading-relaxed">
                Leverage India's growing gig economy by integrating hiring and
                management directly into your project workflow, eliminating
                third-party platform friction.
              </p>
              <div className="flex flex-wrap gap-3">
                {[
                  "AI Talent Matching",
                  "Frictionless Gig Posting",
                  "Profile Vetting & Rating",
                  "Seamless Onboarding",
                ].map((tag) => (
                  <span
                    key={tag}
                    className="px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-semibold"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
            <div className="rounded-2xl overflow-hidden shadow-2xl border border-border-light">
              <img
                src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?q=80&w=2340&auto=format&fit=crop"
                alt="Team"
                className="w-full h-auto"
              />
            </div>
          </div>
        </div>
      </section>
      {/* SECTION 6 — TESTIMONIALS */}
      <section className="py-24 px-6">
        <div className="mx-auto max-w-7xl">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-text-primary dark:text-text-dark">
              Loved by founders worldwide
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                name: "Sarah L.",
                role: "Founder, Tech Innovate",
                text: `${platformName} has been a game-changer. The ability to manage everything from projects to finances in one place is invaluable.`,
                img: "https://i.pravatar.cc/150?u=1",
              },
              {
                name: "Mark C.",
                role: "CEO, Future Solutions",
                text: "The financial hub alone is worth it. We finally have a clear view of our runway without complicated spreadsheets.",
                img: "https://i.pravatar.cc/150?u=2",
              },
              {
                name: "Emily R.",
                role: "Product Lead, NextGen AI",
                text: "Hiring quality freelancers used to be a headache. The talent marketplace connected us with amazing designers in days.",
                img: "https://i.pravatar.cc/150?u=3",
              },
            ].map((testim, idx) => (
              <div
                key={idx}
                className="p-8 rounded-2xl bg-background-light dark:bg-surface-dark border border-border-light dark:border-border-dark"
              >
                <div className="flex items-center gap-4 mb-6">
                  <img
                    src={testim.img}
                    alt={testim.name}
                    className="w-12 h-12 rounded-full"
                  />
                  <div>
                    <p className="font-bold text-text-primary dark:text-text-dark">
                      {testim.name}
                    </p>
                    <p className="text-xs text-text-tertiary">{testim.role}</p>
                  </div>
                </div>
                <p className="text-text-secondary dark:text-gray-400 italic leading-relaxed">
                  "{testim.text}"
                </p>
                <div className="flex text-warning mt-4 gap-1">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <span
                      key={i}
                      className="material-symbols-outlined text-lg fill"
                    >
                      star
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
      {/* SECTION 7 — FINAL CTA */}
      <section className="py-16 px-6">
        <Motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="mx-auto max-w-4xl relative overflow-hidden rounded-[2.5rem] bg-linear-to-br from-primary via-blue-600 to-indigo-700 px-8 py-12 text-center text-white shadow-3xl"
        >
          {/* Background Decor for CTA */}
          <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/2 w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 left-0 translate-y-1/2 -translate-x-1/2 w-64 h-64 bg-blue-400/20 rounded-full blur-3xl"></div>

          <div className="relative z-10">
            <h2 className="text-3xl md:text-5xl font-bold mb-4 tracking-tight">
              Ready to launch your next big idea?
            </h2>
            <p className="text-lg text-blue-100/90 mb-8 max-w-xl mx-auto font-medium">
              Join thousands of founders using {platformName} to build, grow,
              and scale smarter.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4 items-center">
              <Link to="/auth/signup" className="w-full sm:w-auto">
                <Button
                  size="lg"
                  className="bg-white text-primary hover:bg-white/90 border-none w-full sm:px-10 h-14 text-lg font-bold shadow-lg shadow-black/10"
                >
                  Get Started Now
                </Button>
              </Link>
              <Link to="/features" className="w-full sm:w-auto">
                <Button
                  variant="outline"
                  size="lg"
                  className="border-white/30 bg-white/10 text-white hover:bg-white/20 backdrop-blur-sm w-full sm:px-10 h-14 text-lg"
                >
                  Explore Features
                </Button>
              </Link>
            </div>
          </div>
        </Motion.div>
      </section>
    </div>
  );
}
