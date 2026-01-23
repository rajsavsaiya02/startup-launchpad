import React from 'react';
import { useParams, Link, Navigate } from 'react-router-dom';
import { ArrowLeft, Calendar } from 'lucide-react';
import { Button } from '../components/ui/Button';

import { useSettings } from '../context/SettingsContext';

export function PolicyViewerPage() {
  const { docId } = useParams();
  const { settings } = useSettings();
  const platformName = settings?.platform_name || 'Startup LaunchPad';
  const supportEmail = settings?.support_email || 'support@launchpad.com';

  // --- Legal Content Database ---
  const LEGAL_CONTENT = {
    privacy: {
      title: "Privacy Policy",
      lastUpdated: "October 26, 2023",
      sections: [
        {
          id: "collection",
          title: "Information We Collect",
          content: "We collect information that you voluntarily provide when creating an account, using our services, contacting support, or interacting with our platform. This includes your name, email address, billing details, usage data, device information, and actions taken within the app."
        },
        {
          id: "usage",
          title: "How We Use Your Information",
          content: `We use your data to:
          <ul class="list-disc pl-6 mt-2 space-y-2">
            <li>Provide, maintain, and improve our services</li>
            <li>Personalize your experience</li>
            <li>Offer customer support</li>
            <li>Deliver relevant product updates</li>
            <li>Detect, prevent, and respond to security incidents</li>
          </ul>`
        },
        {
          id: "security",
          title: "Data Protection & Security",
          content: "Your data is encrypted in transit and at rest. We follow modern SaaS security standards including access controls, monitoring, network protection, and regular audits."
        },
        {
          id: "cookies",
          title: "Cookies & Tracking",
          content: "We use cookies, analytics tools, and tracking technologies to improve product performance and understand usage patterns."
        },
        {
          id: "rights",
          title: "User Rights & Control",
          content: `You may request access, deletion, correction, or export of your personal data at any time by contacting us at <a href='mailto:${supportEmail}' class='text-primary hover:underline'>${supportEmail}</a>.`
        }
      ]
    },
    terms: {
      title: "Terms & Conditions",
      lastUpdated: "September 15, 2023",
      sections: [
        {
          id: "acceptance",
          title: "1. Acceptance of Terms",
          content: `By using ${platformName}, you agree to these Terms & Conditions and all applicable laws. If you do not agree, you may not use the service.`
        },
        {
          id: "accounts",
          title: "2. User Accounts",
          content: "You must provide accurate information when creating an account. You are responsible for safeguarding login credentials and for all activities that occur under your account."
        },
        {
          id: "usage",
          title: "3. Use of Service",
          content: "You agree not to misuse the platform, engage in unauthorized access, reverse engineer the software, or attempt to disrupt operations."
        },
        {
          id: "payment",
          title: "4. Payments & Billing",
          content: "Paid plans automatically renew unless cancelled. Refunds are handled on a case-by-case basis as per our Refund Policy."
        },
        {
          id: "termination",
          title: "5. Termination",
          content: "We may suspend or terminate your account for violating these terms or for harmful activities without prior notice."
        }
      ]
    },
    security: {
      title: "Security Statement",
      lastUpdated: "November 01, 2023",
      sections: [
        {
          id: "infrastructure",
          title: "Infrastructure Security",
          content: "Our services are hosted on AWS (Amazon Web Services), providing industry-leading physical and environmental security."
        },
        {
          id: "encryption",
          title: "Data Encryption",
          content: "All data is encrypted in transit using TLS 1.2+ and at rest using AES-256 encryption standards."
        },
        {
          id: "access",
          title: "Access Control",
          content: "We enforce strict Role-Based Access Control (RBAC) internally. Only authorized personnel have access to production data, and access is logged."
        }
      ]
    }
  };

  const doc = LEGAL_CONTENT[docId];

  // Handle 404
  if (!doc) {
    return <Navigate to="/legal" replace />;
  }

  return (
    <div className="bg-background-light dark:bg-background-dark min-h-screen font-sans text-text-primary transition-colors duration-300">
      
      {/* Top Nav Breadcrumb */}
      <div className="sticky top-16 z-40 bg-background-light/95 dark:bg-background-dark/95 border-b border-border-light dark:border-border-dark backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-6 h-14 flex items-center">
          <Link to="/legal" className="flex items-center gap-2 text-sm text-text-secondary hover:text-primary transition-colors">
            <ArrowLeft className="h-4 w-4" /> Back to Legal Center
          </Link>
        </div>
      </div>

      {/* Hero Header */}
      <section className="bg-surface-light dark:bg-surface-dark border-b border-border-light dark:border-border-dark py-16 px-6 text-center">
        <h1 className="text-4xl md:text-5xl font-bold text-text-primary dark:text-white mb-4">
          {doc.title}
        </h1>
        <div className="flex items-center justify-center gap-2 text-text-tertiary">
          <Calendar className="h-4 w-4" />
          <span className="text-sm">Last Updated: {doc.lastUpdated}</span>
        </div>
      </section>

      {/* Content Layout */}
      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="flex flex-col lg:flex-row gap-12">
          
          {/* Sidebar Navigation (Desktop) */}
          <aside className="hidden lg:block w-64 shrink-0">
            <div className="sticky top-40">
              <nav className="space-y-1 border-l border-border-light dark:border-border-dark pl-4">
                {doc.sections.map((section) => (
                  <a 
                    key={section.id} 
                    href={`#${section.id}`}
                    className="block text-sm py-2 text-text-secondary dark:text-gray-400 hover:text-primary hover:translate-x-1 transition-all"
                    onClick={(e) => {
                      e.preventDefault();
                      document.getElementById(section.id)?.scrollIntoView({ behavior: 'smooth' });
                    }}
                  >
                    {section.title}
                  </a>
                ))}
              </nav>
            </div>
          </aside>

          {/* Main Content */}
          <div className="flex-1 max-w-3xl">
            <div className="space-y-16">
              {doc.sections.map((section) => (
                <div key={section.id} id={section.id} className="scroll-mt-32">
                  <h2 className="text-2xl font-bold text-text-primary dark:text-white mb-6">
                    {section.title}
                  </h2>
                  <div 
                    className="prose prose-lg dark:prose-invert max-w-none text-text-secondary dark:text-gray-300 leading-relaxed"
                    dangerouslySetInnerHTML={{ __html: section.content }}
                  />
                </div>
              ))}
            </div>

            {/* Content Footer */}
            <div className="mt-20 pt-8 border-t border-border-light dark:border-border-dark">
              <p className="text-text-tertiary text-sm">
                Have questions about this policy? Contact us at <a href="mailto:legal@launchpad.com" className="text-primary hover:underline">legal@launchpad.com</a>
              </p>
            </div>
          </div>

        </div>
      </div>

    </div>
  );
}