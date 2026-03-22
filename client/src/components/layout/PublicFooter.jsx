import React from 'react';
import { Link } from 'react-router-dom';
import { Rocket, Twitter, Linkedin, Github, Facebook, Mail } from 'lucide-react';
import { useSettings } from '../../context/SettingsContext';
import { cn } from '../../utils/cn';

// Custom dark gradient colors from the Stitch HTML: from-[#0A071B] to-[#120D2B]
const darkGradientClasses = "bg-gradient-to-b from-[#0A071B] to-[#120D2B]";

export function PublicFooter({ className }) {
  const { settings } = useSettings();
  const contactEmail = settings?.support_email || 'hello@startuplaunchpad.com';
  const linkClass = "text-sm text-gray-400 hover:text-white transition-colors duration-200";
  const iconClass = "h-6 w-6 text-gray-500 hover:text-white transition-colors duration-200";

  return (
    <footer className={cn("w-full text-white", "bg-linear-to-b from-[#0A071B] to-[#120D2B]", className)}>
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="py-16">
          <div className="grid grid-cols-1 gap-12 lg:grid-cols-12 lg:gap-8">
            
            {/* Column 1: Logo & Mission */}
            <div className="lg:col-span-4">
              <div className="flex items-center space-x-3 mb-4">
                <Rocket className="h-8 w-8" /> 
                <span className="text-xl font-semibold text-white">{settings?.platform_name || 'Startup LaunchPad'}</span>
              </div>
              <p className="mt-4 text-sm font-normal text-gray-400">
                Empowering startups to build, launch, and scale their vision.
              </p>
            </div>

            {/* Column 2, 3, 4: Navigation Links */}
            <div className="grid grid-cols-2 gap-8 lg:col-span-5 lg:grid-cols-3">
              {[
                { title: 'Product', links: ['Features', 'Integrations', 'Community'] },
                { title: 'Resources', links: ['Blog', 'Case Studies', 'Help Center'] },
                { title: 'Company', links: ['About Us', 'Contact', 'Legal'] }
              ].map((section, idx) => (
                <div key={idx}>
                  <h3 className="text-base font-semibold text-white">{section.title}</h3>
                  <ul className="mt-4 space-y-3">
                    {section.links.map(link => (
                      <li key={link}><Link to={`/${link.toLowerCase().replace(/\s/g, '-')}`} className={linkClass}>{link}</Link></li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>

            {/* Column 5: Contact & Social */}
            <div className="lg:col-span-3">
              <h3 className="text-base font-semibold text-white">Get in Touch</h3>
              <p className="mt-4 text-sm text-gray-400">
                <a className="hover:text-white transition-colors duration-200" href={`mailto:${contactEmail}`}>{contactEmail}</a>
              </p>
              <div className="mt-6 flex items-center space-x-4">
                <a aria-label="Twitter" href="#"><Twitter className={iconClass} /></a>
                <a aria-label="LinkedIn" href="#"><Linkedin className={iconClass} /></a>
                <a aria-label="Facebook" href="#"><Facebook className={iconClass} /></a>
              </div>
            </div>
          </div>
        </div>

        {/* Copyright and Legal Links */}
        <div className="mt-8 border-t border-white/10 py-8 flex flex-col items-center justify-between gap-4 md:flex-row">
          <p className="text-xs font-normal text-gray-500">© {new Date().getFullYear()} {settings?.platform_name || 'Startup LaunchPad'}. All rights reserved.</p>
          <div className="flex items-center gap-6">
            <Link to="/legal/terms" className="text-xs text-gray-500 hover:text-white transition-colors duration-200">Terms of Use</Link>
            <Link to="/legal/security" className="text-xs text-gray-500 hover:text-white transition-colors duration-200">Security</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}