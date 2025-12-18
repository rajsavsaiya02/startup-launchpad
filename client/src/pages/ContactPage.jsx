import React from 'react';
import { Mail, Phone, MapPin, MessageSquare, Twitter, Facebook, Linkedin, Github } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { cn } from '../utils/cn';

export function ContactPage() {
  return (
    <div className="bg-background-light dark:bg-background-dark font-sans text-text-primary transition-colors duration-300">
      
      {/* Header Section */}
      <section className="py-20 text-center px-4">
        <h1 className="text-4xl sm:text-5xl font-bold tracking-tight text-text-primary dark:text-white">
          Contact Us
        </h1>
        <p className="mt-4 text-lg text-text-secondary dark:text-gray-300 max-w-2xl mx-auto">
          We'd love to hear from you. Whether you have a question about features, trials, pricing, or anything else, our team is ready to answer all your questions.
        </p>
      </section>

      {/* Main Content Grid */}
      <div className="max-w-[1200px] mx-auto px-4 pb-24">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-16">
          
          {/* Left Column: Contact Form */}
          <div className="lg:col-span-8">
            <div className="bg-surface-light dark:bg-surface-dark rounded-xl p-8 shadow-sm border border-border-light dark:border-border-dark">
              <h2 className="text-xl font-semibold text-text-primary dark:text-white mb-2">Send us a message</h2>
              <p className="text-sm text-text-tertiary mb-8">We try to respond within 24 hours. For urgent issues, use live chat or call.</p>
              
              <form className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <Input label="Full Name" placeholder="Jane Doe" />
                  <Input label="Company" placeholder="Acme, Inc." />
                </div>
                
                <Input label="Email" type="email" placeholder="jane@company.com" />
                
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-text-secondary">Contact reason</label>
                  <select className="flex h-11 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary dark:bg-background-dark dark:border-border-dark dark:text-white">
                    <option>General inquiry</option>
                    <option>Sales & Pricing</option>
                    <option>Support</option>
                    <option>Partnerships</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-text-secondary">Message</label>
                  <textarea 
                    className="flex min-h-40 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary dark:bg-background-dark dark:border-border-dark dark:text-white resize-y"
                    placeholder="Tell us how we can help..."
                  />
                </div>

                <div className="flex items-start gap-3">
                  <input type="checkbox" id="consent" className="mt-1 h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary" />
                  <label htmlFor="consent" className="text-sm text-text-tertiary">
                    I consent to receive replies from Startup LaunchPad and agree to the <a href="#" className="text-primary hover:underline">Privacy Policy</a>.
                  </label>
                </div>

                <div className="pt-2 flex gap-4">
                  <Button size="lg" className="px-8">Send Message</Button>
                  <Button variant="ghost" type="reset">Clear</Button>
                </div>
              </form>
            </div>
          </div>

          {/* Right Column: Contact Info & Map */}
          <div className="lg:col-span-4 space-y-8">
            {/* Quick Contact Card */}
            <div className="bg-surface-light dark:bg-surface-dark rounded-xl p-6 shadow-sm border border-border-light dark:border-border-dark">
              <h3 className="text-lg font-semibold text-text-primary dark:text-white mb-6">Quick ways to reach us</h3>
              
              <div className="space-y-6">
                <div className="flex flex-col gap-1">
                  <button className="self-start rounded-full bg-primary/10 px-4 py-1.5 text-sm font-medium text-primary hover:bg-primary/20 transition-colors">
                    Start Chat
                  </button>
                  <p className="text-xs text-text-tertiary mt-1">Available Mon–Fri 8am–6pm PT.</p>
                </div>

                <div>
                  <a href="tel:+18005550123" className="flex items-center gap-2 text-primary font-medium hover:underline">
                    <Phone className="h-4 w-4" /> +1 (800) 555-0123
                  </a>
                  <p className="text-xs text-text-tertiary mt-1">Sales: M–F, 9am–5pm PT.</p>
                </div>

                <div>
                  <p className="text-sm font-medium text-text-secondary">Email Us</p>
                  <a href="mailto:support@launchpad.com" className="text-primary hover:underline flex items-center gap-2">
                    <Mail className="h-4 w-4" /> support@launchpad.com
                  </a>
                </div>
              </div>

              {/* Social Icons */}
              <div className="mt-8 flex gap-4 border-t border-border-light dark:border-border-dark pt-6">
                <a href="#" className="text-text-tertiary hover:text-primary"><Linkedin className="h-5 w-5" /></a>
                <a href="#" className="text-text-tertiary hover:text-primary"><Twitter className="h-5 w-5" /></a>
                <a href="#" className="text-text-tertiary hover:text-primary"><Facebook className="h-5 w-5" /></a>
                <a href="#" className="text-text-tertiary hover:text-primary"><Github className="h-5 w-5" /></a>
              </div>
            </div>

            {/* Map Placeholder */}
            <div className="relative h-48 w-full overflow-hidden rounded-xl bg-gray-200 dark:bg-gray-800">
               <img 
                 src="https://images.unsplash.com/photo-1524661135-423995f22d0b?q=80&w=2348&auto=format&fit=crop" 
                 alt="Map Location" 
                 className="absolute inset-0 h-full w-full object-cover opacity-80"
               />
               <div className="absolute bottom-3 left-3 bg-white/90 px-3 py-1 rounded text-xs font-medium backdrop-blur-sm">
                 San Francisco HQ
               </div>
            </div>
          </div>

        </div>

        {/* Office Locations Grid */}
        <div className="mt-20">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-semibold text-text-primary dark:text-white">Our Offices</h2>
            <p className="mt-3 text-text-secondary dark:text-gray-400">Visit or reach our regional teams during local business hours.</p>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { city: 'San Francisco (HQ)', address: '123 Market Street, Suite 456', phone: '+1 (415) 555-0199', hours: 'Mon-Fri, 9am - 5pm PT' },
              { city: 'London (EMEA)', address: '789 High Holborn, Suite 101', phone: '+44 20 7946 0958', hours: 'Mon-Fri, 9am - 5pm GMT' },
              { city: 'Bengaluru (APAC)', address: '456 Mahatma Gandhi Road', phone: '+91 80 4123 4567', hours: 'Mon-Fri, 10am - 6pm IST' },
            ].map((office) => (
              <div key={office.city} className="bg-surface-light dark:bg-surface-dark rounded-xl p-6 shadow-sm border border-border-light dark:border-border-dark flex items-start gap-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                  <MapPin className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-semibold text-text-primary dark:text-white">{office.city}</h3>
                  <div className="mt-2 space-y-1 text-sm text-text-tertiary">
                    <p>{office.address}</p>
                    <p className="text-text-secondary font-medium">{office.phone}</p>
                    <p className="text-xs">{office.hours}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

    </div>
  );
}