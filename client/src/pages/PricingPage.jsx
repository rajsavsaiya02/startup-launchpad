import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Check, Phone, ChevronDown } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { cn } from '../utils/cn';
import { useSettings } from '../context/SettingsContext';

// --- Data Constants ---
const PLANS = [
  {
    name: 'Starter',
    price: { monthly: 0, yearly: 0 },
    desc: 'For solo founders just getting started.',
    features: ['Unlimited tasks', '1 project', 'Community support', 'Basic dashboards', 'Limited financial tools'],
    cta: 'Get Started Free',
    popular: false
  },
  {
    name: 'Growth',
    price: { monthly: 29, yearly: 24 },
    desc: 'For growing teams that need more power and clarity.',
    features: ['Unlimited projects', 'Unlimited tasks', 'Full Financial Hub', 'Team collaboration', 'Talent Marketplace access', 'AI productivity insights'],
    cta: 'Start Free Trial',
    popular: true
  },
  {
    name: 'Scale',
    price: { monthly: 79, yearly: 65 },
    desc: 'For scaling startups that need advanced operations.',
    features: ['Everything in Growth', 'Advanced analytics', 'Hiring pipeline tools', 'Budget forecasting', 'Priority support', 'Export & custom reporting'],
    cta: 'Contact Sales',
    popular: false
  }
];

const COMPARISON_ROWS = [
  { feature: 'Unlimited Tasks', starter: true, growth: true, scale: true },
  { feature: 'Projects', starter: '1', growth: 'Unlimited', scale: 'Unlimited' },
  { feature: 'Financial Hub', starter: false, growth: true, scale: true },
  { feature: 'Talent Marketplace', starter: false, growth: true, scale: true },
  { feature: 'AI Insights', starter: false, growth: true, scale: true },
  { feature: 'Advanced Reporting', starter: false, growth: false, scale: true },
  { feature: 'Priority Support', starter: false, growth: false, scale: true },
];

const FAQS = [
  { q: "Can I cancel anytime?", a: "Yes. You can downgrade or cancel at any time from your account settings." },
  { q: "Do you offer discounts for yearly plans?", a: "Yes — save 20% when switching to yearly billing." },
  { q: "Is there a free trial?", a: "Every paid plan includes a 14-day free trial, no credit card required." },
  { q: "Do you offer student or startup credits?", a: "Yes — early-stage startups may request discount credits." },
  { q: "What payment methods do you support?", a: "We support credit cards, international payments, and invoices for enterprise plans." }
];

export function PricingPage() {
  const [billingCycle, setBillingCycle] = useState('monthly');
  const { settings } = useSettings();
  const platformName = settings?.platform_name || 'Startup LaunchPad';

  return (
    <div className="font-sans text-gray-900 dark:text-white">
      
      {/* SECTION 1 — HERO */}
      <section className="py-20 sm:py-24 text-center px-4">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl sm:text-5xl font-bold tracking-tight mb-6">
            Simple, transparent pricing for startups of every size
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-400 mb-10">
            Choose a plan that fits your stage. Upgrade anytime. No hidden fees.
          </p>
          
          {/* Custom Toggle Switch */}
          <div className="mt-10 flex justify-center">
            <div className="relative inline-flex bg-gray-100 dark:bg-gray-800 p-1 rounded-full cursor-pointer shadow-inner">
               
               {/* The Sliding Pill */}
               <div 
                 className={cn(
                   "absolute top-1 bottom-1 w-[calc(50%-4px)] bg-white dark:bg-surface-dark rounded-full shadow-sm transition-all duration-300 ease-out",
                   billingCycle === 'monthly' ? "left-1" : "left-[calc(50%+4px)] translate-x-0"
                 )} 
               />
               
               {/* Monthly Button */}
               <button 
                 onClick={() => setBillingCycle('monthly')}
                 className={cn(
                   "relative z-10 w-32 py-2.5 text-sm font-semibold rounded-full transition-colors duration-300 focus:outline-none",
                   billingCycle === 'monthly' ? "text-text-primary dark:text-white" : "text-text-tertiary hover:text-text-secondary"
                 )}
               >
                 Monthly
               </button>

               {/* Yearly Button */}
               <button 
                 onClick={() => setBillingCycle('yearly')}
                 className={cn(
                   "relative z-10 w-32 py-2.5 text-sm font-semibold rounded-full transition-colors duration-300 focus:outline-none flex items-center justify-center gap-1.5",
                   billingCycle === 'yearly' ? "text-text-primary dark:text-white" : "text-text-tertiary hover:text-text-secondary"
                 )}
               >
                 Yearly
                 <span className="text-[10px] font-bold text-success bg-success/10 px-2 py-0.5 rounded-full border border-success/20">
                   -20%
                 </span>
               </button>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 2 — PRICING CARDS */}
      <section className="pb-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">
          {PLANS.map((plan) => (
            <div 
              key={plan.name} 
              className={cn(
                "relative flex flex-col rounded-2xl p-8 transition-all duration-300",
                plan.popular 
                  ? "bg-white dark:bg-[#161121] border-2 border-primary shadow-2xl z-10 scale-105" 
                  : "bg-white dark:bg-[#161121] border border-gray-200 dark:border-gray-800 shadow-sm hover:shadow-lg"
              )}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-primary text-white px-4 py-1 rounded-full text-xs font-bold uppercase tracking-wider shadow-md">
                  Most Popular
                </div>
              )}

              <h3 className="text-2xl font-bold">{plan.name}</h3>
              <div className="mt-4 flex items-baseline gap-1">
                <span className="text-4xl font-extrabold tracking-tight">
                  ${plan.price[billingCycle]}
                </span>
                <span className="text-gray-500 font-medium">/ month</span>
              </div>
              <p className="mt-4 text-gray-500 dark:text-gray-400 text-sm">{plan.desc}</p>

              <Button 
                variant={plan.popular ? 'primary' : 'outline'} 
                className={cn("mt-8 w-full py-6 text-base", !plan.popular && "bg-white dark:bg-transparent dark:text-white border-gray-200 dark:border-gray-700")}
              >
                {plan.cta}
              </Button>

              <ul className="mt-8 space-y-4 flex-1">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-3 text-sm text-gray-600 dark:text-gray-300">
                    <Check className="h-5 w-5 text-primary shrink-0" />
                    {feature}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      {/* SECTION 3 — ENTERPRISE BLOCK */}
      <section className="pb-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto rounded-xl bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-800 p-8 md:p-12">
          <div className="flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="text-center md:text-left">
              <h3 className="text-2xl font-bold mb-2">Need enterprise features?</h3>
              <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl">
                Advanced permissions, dedicated support, SLAs, and custom integrations designed for large-scale operations.
              </p>
            </div>
            <Button size="lg" className="shrink-0 gap-2 px-8 py-6 text-base">
              <Phone className="h-5 w-5" /> Talk to Sales
            </Button>
          </div>
        </div>
      </section>

      {/* SECTION 4 — COMPARISON TABLE */}
      <section className="pb-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold">Compare Plans</h2>
            <p className="mt-3 text-lg text-gray-600 dark:text-gray-400">Find the right plan for your startup's needs.</p>
          </div>

          <div className="overflow-x-auto rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-[#161121] shadow-sm">
            <table className="w-full min-w-[700px] text-left border-collapse">
              <thead>
                <tr className="border-b border-gray-200 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-900/20">
                  <th className="p-6 font-bold text-gray-900 dark:text-white w-1/3">Features</th>
                  <th className="p-6 font-bold text-center w-1/5">Starter</th>
                  <th className="p-6 font-bold text-center text-primary w-1/5">Growth</th>
                  <th className="p-6 font-bold text-center w-1/5">Scale</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
                {COMPARISON_ROWS.map((row, i) => (
                  <tr key={i} className="hover:bg-gray-50/50 dark:hover:bg-gray-900/20 transition-colors">
                    <td className="p-6 font-medium text-gray-700 dark:text-gray-300">{row.feature}</td>
                    {['starter', 'growth', 'scale'].map((planKey) => (
                      <td key={planKey} className="p-6 text-center">
                        {row[planKey] === true ? (
                          <div className="flex justify-center"><Check className="h-5 w-5 text-primary" /></div>
                        ) : row[planKey] === false ? (
                          <span className="text-gray-300 dark:text-gray-600">—</span>
                        ) : (
                          <span className="font-medium text-gray-900 dark:text-white">{row[planKey]}</span>
                        )}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* SECTION 5 — FAQ */}
      <section className="pb-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">Frequently Asked Questions</h2>
          <div className="space-y-4">
            {FAQS.map((faq, i) => (
              <details key={i} className="group rounded-xl bg-gray-50 dark:bg-gray-900/50 p-6 [&_summary::-webkit-details-marker]:hidden cursor-pointer transition-all duration-300 open:bg-white dark:open:bg-[#161121] open:shadow-md border border-transparent open:border-gray-200 dark:open:border-gray-800">
                <summary className="flex items-center justify-between font-semibold text-gray-900 dark:text-white list-none">
                  {faq.q}
                  <ChevronDown className="h-5 w-5 text-gray-500 transition-transform duration-300 group-open:rotate-180" />
                </summary>
                <div className="mt-4 text-gray-600 dark:text-gray-400 leading-relaxed animate-in slide-in-from-top-2 fade-in duration-200">
                  {faq.a}
                </div>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* SECTION 6 — FINAL CTA */}
      <section className="pb-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto rounded-2xl bg-linear-to-r from-primary to-blue-700 px-6 py-20 text-center relative overflow-hidden shadow-2xl">
          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
          <div className="relative z-10">
             <h2 className="text-3xl sm:text-4xl font-bold text-white mb-6">Ready to build your startup faster?</h2>
             <p className="text-lg text-blue-100 mb-10 max-w-2xl mx-auto">
               Join thousands of founders using {platformName} to execute with clarity.
             </p>
             <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
               <Link to="/auth/signup" className="w-full sm:w-auto">
                 <Button className="w-full h-12 px-8 bg-white text-primary hover:bg-gray-50 border-none text-base font-bold">
                   Get Started
                 </Button>
               </Link>
               <Link to="/contact" className="w-full sm:w-auto">
                 <Button variant="outline" className="w-full h-12 px-8 border-white/40 text-white hover:bg-white/10 text-base font-semibold">
                   Book a Demo
                 </Button>
               </Link>
             </div>
          </div>
        </div>
      </section>

    </div>
  );
}