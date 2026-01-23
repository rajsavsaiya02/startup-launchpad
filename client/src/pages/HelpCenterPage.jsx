import React, { useState } from 'react';
import { Search, HelpCircle, User, CreditCard, Settings, ChevronDown, Mail, MessageCircle } from 'lucide-react';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { Link } from 'react-router-dom';
import { useSettings } from '../context/SettingsContext';

const CATEGORIES = [
  { id: 'general', name: 'General', icon: HelpCircle },
  { id: 'account', name: 'Account', icon: User },
  { id: 'billing', name: 'Billing', icon: CreditCard },
  { id: 'features', name: 'Features', icon: Settings },
];

export function HelpCenterPage() {
  const { settings } = useSettings();
  const platformName = settings?.platform_name || 'Startup LaunchPad';

  const FAQS = {
    general: [
      { q: `What is ${platformName}?`, a: `${platformName} is a unified operating system designed to help early-stage startups manage Operations, Finance, and Talent in one place.` },
      { q: "Who is this platform for?", a: "It is built for early-stage founders, small teams, and accelerators who need to move fast without the chaos of using 10 different tools." },
    ],
    account: [
      { q: "How do I invite team members?", a: "Go to Settings > Team > Invite Member. Enter their email address and select their role (Admin, Member, Viewer)." },
      { q: "Can I change my email address?", a: "Yes, you can update your email in your Profile settings. You will need to verify the new address via email." },
    ],
    billing: [
      { q: "Do you offer a free trial?", a: "Yes, all paid plans come with a 14-day free trial. No credit card required to start." },
      { q: "What payment methods are accepted?", a: "We accept all major credit cards (Visa, Mastercard, Amex) and process payments securely via Stripe." },
    ],
    features: [
      { q: "How does the Talent Marketplace work?", a: "You can post short-term 'gigs' or tasks directly from your project board. Vetted freelancers can apply, and you can hire them with one click." },
      { q: "Is my financial data secure?", a: "Absolutely. We use bank-level 256-bit encryption and never sell your data. See our Security Statement for more details." },
    ]
  };

  const [activeCategory, setActiveCategory] = useState('general');
  const [searchQuery, setSearchQuery] = useState('');

  // Filter FAQs based on search or category
  const filteredFAQs = searchQuery 
    ? Object.values(FAQS).flat().filter(item => 
        item.q.toLowerCase().includes(searchQuery.toLowerCase()) || 
        item.a.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : FAQS[activeCategory];

  return (
    <div className="bg-background-light dark:bg-background-dark min-h-screen font-sans text-text-primary transition-colors duration-300">
      
      {/* Hero Search Section */}
      <section className="bg-surface-light dark:bg-surface-dark border-b border-border-light dark:border-border-dark py-20 px-6 text-center">
        <div className="max-w-3xl mx-auto space-y-6">
          <h1 className="text-4xl font-bold text-text-primary dark:text-white">
            How can we help you?
          </h1>
          <p className="text-lg text-text-secondary dark:text-gray-400">
            Search our knowledge base or browse by category below.
          </p>
          <div className="relative max-w-xl mx-auto">
            <Input 
              icon={Search} 
              placeholder="Search for answers (e.g., 'billing', 'api key')..." 
              className="h-14 pl-12 text-lg shadow-sm rounded-xl"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
      </section>

      {/* Main Content Area */}
      <div className="max-w-6xl mx-auto px-6 py-16">
        
        {/* Category Grid (Hidden if searching) */}
        {!searchQuery && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-16">
            {CATEGORIES.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`flex flex-col items-center justify-center p-6 rounded-xl border transition-all duration-200 ${
                  activeCategory === cat.id 
                    ? 'bg-primary/5 border-primary text-primary' 
                    : 'bg-white dark:bg-[#161121] border-border-light dark:border-border-dark text-text-secondary hover:border-primary/50'
                }`}
              >
                <cat.icon className="h-8 w-8 mb-3" />
                <span className="font-semibold">{cat.name}</span>
              </button>
            ))}
          </div>
        )}

        {/* FAQ List */}
        <div className="max-w-3xl mx-auto space-y-4">
          {searchQuery && filteredFAQs.length === 0 ? (
            <div className="text-center text-text-tertiary py-12">
              <p>No results found for "{searchQuery}". Try a different keyword.</p>
            </div>
          ) : (
            filteredFAQs.map((item, index) => (
              <details key={index} className="group bg-white dark:bg-[#161121] rounded-xl border border-border-light dark:border-border-dark shadow-sm open:ring-1 open:ring-primary/20 transition-all">
                <summary className="flex items-center justify-between p-6 cursor-pointer font-semibold text-text-primary dark:text-white list-none">
                  {item.q}
                  <ChevronDown className="h-5 w-5 text-text-tertiary transition-transform group-open:rotate-180" />
                </summary>
                <div className="px-6 pb-6 pt-0 text-text-secondary dark:text-gray-400 leading-relaxed border-t border-transparent group-open:border-border-light dark:group-open:border-border-dark group-open:pt-4">
                  {item.a}
                </div>
              </details>
            ))
          )}
        </div>

      </div>

      {/* Support CTA */}
      <section className="bg-surface-light dark:bg-surface-dark border-t border-border-light dark:border-border-dark py-20 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-2xl font-bold text-text-primary dark:text-white mb-8">
            Still can't find what you're looking for?
          </h2>
          <div className="flex flex-col sm:flex-row justify-center gap-6">
            <Card className="p-6 flex-1 flex flex-col items-center hover:shadow-md transition-shadow">
              <div className="h-12 w-12 bg-primary/10 rounded-full flex items-center justify-center text-primary mb-4">
                <MessageCircle className="h-6 w-6" />
              </div>
              <h3 className="font-bold text-lg mb-2">Chat with Support</h3>
              <p className="text-sm text-text-secondary mb-6">Real-time help from our team.</p>
              <Button variant="outline" className="w-full">Start Chat</Button>
            </Card>
            <Card className="p-6 flex-1 flex flex-col items-center hover:shadow-md transition-shadow">
              <div className="h-12 w-12 bg-primary/10 rounded-full flex items-center justify-center text-primary mb-4">
                <Mail className="h-6 w-6" />
              </div>
              <h3 className="font-bold text-lg mb-2">Email Us</h3>
              <p className="text-sm text-text-secondary mb-6">We'll get back to you within 24h.</p>
              <Link to="/contact" className="w-full">
                <Button className="w-full">Contact Support</Button>
              </Link>
            </Card>
          </div>
        </div>
      </section>

    </div>
  );
}