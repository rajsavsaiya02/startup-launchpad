import React from 'react';
import { Link } from 'react-router-dom';
import { Shield, FileText, Lock, ArrowRight } from 'lucide-react';
import { Card } from '../components/ui/Card';

import { useSettings } from '../context/SettingsContext';

export function LegalHubPage() {
  const { settings } = useSettings();
  const platformName = settings?.platform_name || 'Startup LaunchPad';

  const docs = [
    {
      id: 'privacy',
      title: 'Privacy Policy',
      desc: 'How we handle personal data, storage, and user rights.',
      icon: Shield,
      link: '/legal/privacy'
    },
    {
      id: 'terms',
      title: 'Terms & Conditions',
      desc: `Your rights and responsibilities when using ${platformName}.`,
      icon: FileText,
      link: '/legal/terms'
    },
    {
      id: 'security',
      title: 'Security Statement',
      desc: 'How we protect your data, encryption standards, and compliance.',
      icon: Lock,
      link: '/legal/security'
    }
  ];

  return (
    <div className="bg-background-light dark:bg-background-dark min-h-screen font-sans transition-colors duration-300">
      
      {/* Hero Section */}
      <section className="bg-surface-light dark:bg-surface-dark border-b border-border-light dark:border-border-dark py-24 text-center px-6">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl md:text-5xl font-bold text-text-primary dark:text-white mb-6">
            Legal & Compliance Center
          </h1>
          <p className="text-xl text-text-secondary dark:text-gray-400 max-w-2xl mx-auto leading-relaxed">
            Transparency is core to our values. Review our policies, terms, and security commitments to understand how we protect your startup.
          </p>
        </div>
      </section>

      {/* Documents Grid */}
      <section className="py-20 px-6 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {docs.map((doc) => (
            <Card key={doc.id} className="p-8 flex flex-col items-start hover:shadow-md transition-all duration-300 border-border-light dark:border-border-dark bg-white dark:bg-[#161121]">
              <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary mb-6">
                <doc.icon className="h-6 w-6" />
              </div>
              <h2 className="text-2xl font-bold text-text-primary dark:text-white mb-3">
                {doc.title}
              </h2>
              <p className="text-text-secondary dark:text-gray-400 mb-8 flex-1 leading-relaxed">
                {doc.desc}
              </p>
              <Link 
                to={doc.link}
                className="group flex items-center gap-2 text-primary font-semibold hover:gap-3 transition-all"
              >
                View Document <ArrowRight className="h-4 w-4" />
              </Link>
            </Card>
          ))}
        </div>
      </section>

    </div>
  );
}