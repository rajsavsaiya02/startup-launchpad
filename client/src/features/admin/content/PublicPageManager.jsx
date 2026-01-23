import React from 'react';
import { Layout, FileText, Phone, Info } from 'lucide-react';
import { Card } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';

export function PublicPageManager() {
  const pages = [
    {
      id: 'home',
      title: 'Home Page',
      description: 'Manage hero section, features, and call-to-action blocks.',
      icon: Layout,
      path: '/admin/communication/cms/homepage/edit', // Placeholder
      status: 'Published'
    },
    {
      id: 'about',
      title: 'About Us',
      description: 'Update company history, mission, and team sections.',
      icon: Info,
      path: '/admin/communication/cms/about/edit', // Placeholder
      status: 'Published'
    },
    {
      id: 'contact',
      title: 'Contact Us',
      description: 'Edit contact details, form settings, and office locations.',
      icon: Phone,
      path: '/admin/communication/cms/contact/edit', // Placeholder
      status: 'Published'
    },
    {
      id: 'legal',
      title: 'Legal Pages',
      description: 'Manage Privacy Policy, Terms of Service, and other legal docs.',
      icon: FileText,
      path: '/admin/communication/cms/legal',
      status: 'Published'
    }
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div>
        <h1 className="text-3xl font-bold text-text-primary dark:text-white mb-2">Public Page Manager</h1>
        <p className="text-text-secondary dark:text-gray-400">Manage content for your public-facing pages.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {pages.map((page) => (
          <Card key={page.id} className="p-6 hover:shadow-md transition-shadow dark:bg-surface-dark border-border-light dark:border-border-dark">
            <div className="flex items-start justify-between mb-4">
              <div className="p-3 bg-primary/10 rounded-lg text-primary">
                <page.icon className="h-6 w-6" />
              </div>
              <span className="text-xs px-2 py-1 bg-green-100 text-green-700 rounded-full font-medium">
                {page.status}
              </span>
            </div>
            
            <h3 className="text-lg font-semibold text-text-primary dark:text-white mb-2">{page.title}</h3>
            <p className="text-sm text-text-tertiary mb-6">{page.description}</p>
            
            <Button variant="outline" className="w-full">
              Edit Content
            </Button>
          </Card>
        ))}
      </div>
    </div>
  );
}
