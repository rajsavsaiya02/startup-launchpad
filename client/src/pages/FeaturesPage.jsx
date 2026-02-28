import React from "react";
import { Link } from "react-router-dom";
import {
  LayoutDashboard,
  Wallet,
  Users,
  BrainCircuit,
  Zap,
  ShieldAlert,
  Search,
  TrendingUp,
  ChevronRight,
  Sparkles,
  ArrowRight,
} from "lucide-react";
import { motion as Motion } from "framer-motion";
import { Button } from "../components/ui/Button";
import { Badge } from "../components/ui/Badge";

export function FeaturesPage() {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        type: "spring",
        stiffness: 100,
        damping: 20,
      },
    },
  };

  const fadeInScale = {
    hidden: { opacity: 0, scale: 0.95 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: { duration: 0.6, ease: "easeOut" },
    },
  };

  return (
    <div className="bg-[#fcfdfe] dark:bg-background-dark font-sans text-[#1e293b] transition-colors duration-500 min-h-screen overflow-x-hidden">
      {/* HERO SECTION */}
      <section className="relative pt-32 pb-24 px-6 text-center border-b border-slate-100 dark:border-border-dark overflow-hidden">
        <div className="absolute inset-0 bg-linear-to-b from-primary/5 to-transparent -z-10"></div>
        <div className="absolute -top-24 -left-24 w-96 h-96 bg-primary/5 rounded-full blur-3xl opacity-50"></div>
        <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-blue-400/5 rounded-full blur-3xl opacity-50"></div>

        <Motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="max-w-4xl mx-auto relative z-10"
        >
          <Badge
            variant="primary"
            className="mb-8 px-5 py-1.5 bg-primary/10 text-primary border-primary/20 text-xs font-bold uppercase tracking-[0.2em] rounded-full"
          >
            The Unified Operating System
          </Badge>
          <h1 className="text-[44px] md:text-[68px] font-bold text-[#0f172a] dark:text-white tracking-tight mb-8 leading-[1.1]">
            Three Powerful Hubs. <br />
            <span className="bg-linear-to-r from-primary to-blue-600 bg-clip-text text-transparent">
              One Seamless Platform.
            </span>
          </h1>
          <p className="text-xl text-[#64748b] dark:text-gray-400 max-w-2xl mx-auto leading-relaxed font-medium mb-12">
            Eliminate the "Context Gap". We integrate Project Management,
            Financial Tracking, and Talent Acquisition into a single source of
            truth.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-5 items-center">
            <Link to="/auth/signup">
              <Button
                size="lg"
                className="h-14 px-10 rounded-2xl bg-[#0f172a] hover:bg-[#1e293b] text-white shadow-xl shadow-slate-200 dark:shadow-none transition-all hover:scale-[1.02] active:scale-[0.98]"
              >
                Start for Free
              </Button>
            </Link>
            <Link to="/contact">
              <Button
                variant="ghost"
                size="lg"
                className="h-14 px-8 rounded-2xl border-slate-200 dark:border-border-dark text-[#475569] dark:text-gray-300 hover:bg-slate-50 dark:hover:bg-surface-dark transition-all group"
              >
                Book Demo
                <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
          </div>
        </Motion.div>
      </section>

      {/* OPERATIONS HUB */}
      <section id="operations" className="py-32 px-6">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
          <Motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={fadeInScale}
            className="lg:order-1 relative"
          >
            <div className="absolute -inset-10 bg-blue-500/5 rounded-full blur-[100px] opacity-40"></div>
            <div className="relative group p-2">
              <div className="absolute inset-0 bg-linear-to-tr from-primary/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity rounded-3xl -z-10"></div>
              <img
                src="https://images.unsplash.com/photo-1498050108023-c5249f4df085?q=80&w=2344&auto=format&fit=crop"
                alt="Operations Dashboard"
                className="relative rounded-[32px] shadow-[0_32px_64px_-16px_rgba(0,0,0,0.1)] border border-slate-200 dark:border-border-dark transform group-hover:scale-[1.01] transition-transform duration-700"
              />
            </div>
          </Motion.div>

          <Motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={containerVariants}
            className="lg:order-2"
          >
            <Motion.div
              variants={itemVariants}
              className="flex items-center gap-3 mb-6"
            >
              <div className="h-12 w-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
                <LayoutDashboard className="h-6 w-6" />
              </div>
              <span className="text-sm font-bold text-primary tracking-widest uppercase">
                Operations Hub
              </span>
            </Motion.div>

            <Motion.h3
              variants={itemVariants}
              className="text-[40px] font-bold text-[#0f172a] dark:text-white mb-6 leading-tight"
            >
              Execute with <br />
              Agile Precision.
            </Motion.h3>

            <Motion.p
              variants={itemVariants}
              className="text-lg text-[#64748b] dark:text-gray-400 mb-10 leading-relaxed font-medium"
            >
              A visual and intuitive workspace designed for speed. Track
              progress from 'To Do' to 'Done' seamlessly without the complexity
              of enterprise tools.
            </Motion.p>

            <Motion.ul variants={containerVariants} className="space-y-5">
              {[
                "Interactive Kanban Boards & Gantt Charts",
                "Task Dependencies & Milestones",
                "Integrated Time Tracking per Task",
                "Resource & Workload Management",
              ].map((item, i) => (
                <Motion.li
                  key={i}
                  variants={itemVariants}
                  className="flex items-center gap-4 text-[#475569] dark:text-gray-200 font-bold text-sm"
                >
                  <div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center text-primary shrink-0 border border-primary/20">
                    <Zap className="h-3 w-3" />
                  </div>
                  {item}
                </Motion.li>
              ))}
            </Motion.ul>
          </Motion.div>
        </div>
      </section>

      {/* FINANCIAL HUB */}
      <section
        id="financials"
        className="py-32 px-6 bg-slate-50/50 dark:bg-surface-dark border-y border-slate-100 dark:border-border-dark"
      >
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
          <Motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={containerVariants}
            className="order-2 lg:order-1"
          >
            <Motion.div
              variants={itemVariants}
              className="flex items-center gap-3 mb-6"
            >
              <div className="h-12 w-12 rounded-2xl bg-emerald-100 dark:bg-emerald-900/20 flex items-center justify-center text-emerald-600">
                <Wallet className="h-6 w-6" />
              </div>
              <span className="text-sm font-bold text-emerald-600 tracking-widest uppercase">
                Financial Hub
              </span>
            </Motion.div>

            <Motion.h3
              variants={itemVariants}
              className="text-[40px] font-bold text-[#0f172a] dark:text-white mb-6 leading-tight"
            >
              Extend Your <br />
              Runway.
            </Motion.h3>

            <Motion.p
              variants={itemVariants}
              className="text-lg text-[#64748b] dark:text-gray-400 mb-10 leading-relaxed font-medium"
            >
              Stop flying blind. Get a real-time visualization of your burn rate
              and spending categories. Link expenses directly to projects for
              true cost analysis.
            </Motion.p>

            <Motion.ul variants={containerVariants} className="space-y-5">
              {[
                "Real-time Burn Rate Tracking",
                "Automated Runway Forecasting",
                "Expense Categorization & Logging",
                "Project-Based Costing Analysis",
              ].map((item, i) => (
                <Motion.li
                  key={i}
                  variants={itemVariants}
                  className="flex items-center gap-4 text-[#475569] dark:text-gray-200 font-bold text-sm"
                >
                  <div className="h-6 w-6 rounded-full bg-emerald-100 dark:bg-emerald-900/20 flex items-center justify-center text-emerald-600 shrink-0 border border-emerald-200">
                    <TrendingUp className="h-3 w-3" />
                  </div>
                  {item}
                </Motion.li>
              ))}
            </Motion.ul>
          </Motion.div>

          <Motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={fadeInScale}
            className="order-1 lg:order-2 relative"
          >
            <div className="absolute -inset-10 bg-emerald-500/5 rounded-full blur-[100px] opacity-40"></div>
            <div className="relative group p-2">
              <img
                src="https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=2340&auto=format&fit=crop"
                alt="Financial Analytics"
                className="relative rounded-[32px] shadow-[0_32px_64px_-16px_rgba(0,0,0,0.1)] border border-slate-200 dark:border-border-dark transform group-hover:scale-[1.01] transition-transform duration-700"
              />
            </div>
          </Motion.div>
        </div>
      </section>

      {/* TALENT MARKETPLACE */}
      <section id="talent" className="py-32 px-6">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
          <Motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={fadeInScale}
            className="lg:order-1 relative"
          >
            <div className="absolute -inset-10 bg-amber-500/5 rounded-full blur-[100px] opacity-40"></div>
            <div className="relative group p-2">
              <img
                src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?q=80&w=2340&auto=format&fit=crop"
                alt="Talent Collaboration"
                className="relative rounded-[32px] shadow-[0_32px_64px_-16px_rgba(0,0,0,0.1)] border border-slate-200 dark:border-border-dark transform group-hover:scale-[1.01] transition-transform duration-700"
              />
            </div>
          </Motion.div>

          <Motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={containerVariants}
            className="lg:order-2"
          >
            <Motion.div
              variants={itemVariants}
              className="flex items-center gap-3 mb-6"
            >
              <div className="h-12 w-12 rounded-2xl bg-amber-100 dark:bg-amber-900/20 flex items-center justify-center text-amber-600">
                <Users className="h-6 w-6" />
              </div>
              <span className="text-sm font-bold text-amber-600 tracking-widest uppercase">
                Talent Marketplace
              </span>
            </Motion.div>

            <Motion.h3
              variants={itemVariants}
              className="text-[40px] font-bold text-[#0f172a] dark:text-white mb-6 leading-tight"
            >
              Hire & Onboard <br />
              in Minutes.
            </Motion.h3>

            <Motion.p
              variants={itemVariants}
              className="text-lg text-[#64748b] dark:text-gray-400 mb-10 leading-relaxed font-medium"
            >
              Bridge the skills gap instantly. Post gigs and connect with a
              curated pool of affordable student and freelance talent,
              seamlessly integrated into your workflow.
            </Motion.p>

            <Motion.ul variants={containerVariants} className="space-y-5">
              {[
                "Frictionless Gig Posting",
                "Verified Student & Freelancer Profiles",
                "One-Click Application & Hiring",
                "Integrated Task Assignment for Guests",
              ].map((item, i) => (
                <Motion.li
                  key={i}
                  variants={itemVariants}
                  className="flex items-center gap-4 text-[#475569] dark:text-gray-200 font-bold text-sm"
                >
                  <div className="h-6 w-6 rounded-full bg-amber-100 dark:bg-amber-900/20 flex items-center justify-center text-amber-600 shrink-0 border border-amber-200">
                    <Search className="h-3 w-3" />
                  </div>
                  {item}
                </Motion.li>
              ))}
            </Motion.ul>
          </Motion.div>
        </div>
      </section>

      {/* ROADMAP — SMART LAYER */}
      <section
        id="ai"
        className="py-32 px-6 bg-[#0f172a] text-white relative overflow-hidden"
      >
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
        <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-primary/20 rounded-full blur-[120px] opacity-30"></div>

        <div className="max-w-7xl mx-auto relative z-10">
          <Motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-20"
          >
            <Badge
              variant="primary"
              className="mb-6 bg-primary/20 text-primary border-none text-[10px] font-black uppercase tracking-[0.3em]"
            >
              Coming Soon
            </Badge>
            <h2 className="text-[40px] md:text-[56px] font-bold mb-6 tracking-tight">
              On Our <span className="text-primary italic">Roadmap</span>
            </h2>
            <p className="text-xl text-slate-400 max-w-2xl mx-auto leading-relaxed font-medium">
              A sneak peek at the "Smart Layer" we're building. Soon, LaunchPad
              will provide automated guardrails and strategic foresight for your
              startup's health.
            </p>
          </Motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                icon: BrainCircuit,
                title: "Sentiment Analysis",
                desc: "Analyzes team comments to gauge morale and detect burnout risks early.",
              },
              {
                icon: ShieldAlert,
                title: "Anomaly Detection",
                desc: "Monitors spending patterns to flag unusual expenses or budget overruns instantly.",
              },
              {
                icon: Search,
                title: "Smart Matching",
                desc: "Uses NLP to match your gig requirements with the perfect freelancer profile.",
              },
              {
                icon: TrendingUp,
                title: "Project Health",
                desc: "Calculates a composite health score based on velocity, budget, and sentiment.",
              },
            ].map((feature, idx) => (
              <Motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
                viewport={{ once: true }}
                className="bg-white/5 backdrop-blur-sm p-8 rounded-[24px] border border-white/10 hover:border-primary/50 transition-all group relative overflow-hidden"
              >
                <div className="absolute top-0 right-0 p-3">
                  <div className="px-2 py-0.5 rounded-full bg-primary/10 text-[9px] font-black text-primary uppercase tracking-tighter">
                    Roadmap
                  </div>
                </div>
                <div className="h-14 w-14 rounded-2xl bg-white/5 flex items-center justify-center text-primary mb-6 group-hover:bg-primary group-hover:text-white transition-all duration-500 shadow-inner">
                  <feature.icon className="h-7 w-7" />
                </div>
                <h3 className="text-lg font-bold mb-3 tracking-tight">
                  {feature.title}
                </h3>
                <p className="text-sm text-slate-400 leading-relaxed font-medium">
                  {feature.desc}
                </p>
              </Motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA SECTION */}
      <section className="py-32 px-6 text-center relative overflow-hidden">
        {/* Decorative dynamic background */}
        <div className="absolute inset-0 bg-[#f8fafc] dark:bg-background-dark -z-20"></div>
        <div
          className="absolute inset-0 opacity-[0.03] dark:opacity-[0.05] -z-10"
          style={{
            backgroundImage: "radial-gradient(#0f172a 1px, transparent 1px)",
            backgroundSize: "32px 32px",
          }}
        ></div>

        <Motion.div
          animate={{
            scale: [1, 1.1, 1],
            opacity: [0.3, 0.5, 0.3],
          }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/10 rounded-full blur-[120px] -z-10"
        ></Motion.div>

        <Motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          whileInView={{ opacity: 1, scale: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="max-w-3xl mx-auto relative z-10"
        >
          <h2 className="text-[36px] md:text-[52px] font-bold text-[#0f172a] dark:text-white mb-8 leading-[1.1] tracking-tight">
            Stop managing tools. <br />
            <span className="text-primary italic relative inline-block">
              Start managing your startup.
              <Motion.div
                initial={{ width: 0 }}
                whileInView={{ width: "100%" }}
                transition={{ delay: 0.8, duration: 0.8 }}
                className="absolute bottom-1 left-0 h-1 bg-primary/20 -z-10 rounded-full"
              ></Motion.div>
            </span>
          </h2>

          <p className="text-lg text-[#64748b] dark:text-gray-400 mb-12 max-w-lg mx-auto font-medium">
            Join 500+ founders who have simplified their operations with
            LaunchPad.
          </p>

          <Motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.98 }}
            className="inline-block"
          >
            <Link to="/auth/signup">
              <Button
                size="lg"
                className="h-16 px-12 rounded-[24px] bg-primary hover:bg-primary/90 text-white font-bold text-lg shadow-[0_20px_40px_-10px_rgba(37,99,235,0.3)] dark:shadow-none transition-all"
              >
                Get Started for Free
              </Button>
            </Link>
          </Motion.div>

          <div className="mt-12 flex justify-center items-center gap-8 grayscale opacity-40">
            <div className="text-[10px] font-black uppercase tracking-[0.3em] dark:text-white">
              Built for Speed
            </div>
            <div className="w-1 h-1 bg-slate-400 rounded-full"></div>
            <div className="text-[10px] font-black uppercase tracking-[0.3em] dark:text-white">
              Founder First
            </div>
            <div className="w-1 h-1 bg-slate-400 rounded-full"></div>
            <div className="text-[10px] font-black uppercase tracking-[0.3em] dark:text-white">
              SECURE & SCALE
            </div>
          </div>
        </Motion.div>
      </section>
    </div>
  );
}
