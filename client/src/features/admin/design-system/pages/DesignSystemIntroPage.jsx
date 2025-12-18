import React from 'react';
import { Link } from 'react-router-dom';
import { Palette, Box, Layout, ArrowRight } from 'lucide-react';
import { Card } from '../../../../components/ui/Card';

export function DesignSystemIntroPage() {
  return (
    <div className="space-y-12 animate-in fade-in duration-500 pb-20">
      
      {/* Hero Banner */}
      <div className="relative rounded-2xl overflow-hidden bg-linear-to-br from-gray-900 to-gray-800 text-white p-8 md:p-12 shadow-xl">
        <div className="relative z-10 max-w-2xl">
          <h1 className="text-4xl font-bold mb-4">Startup LaunchPad Design System</h1>
          <p className="text-lg text-gray-300 leading-relaxed">
            This document contains the full design guidelines, tokens, components, layout rules, accessibility standards, and implementation details required to develop the Startup LaunchPad frontend.
          </p>
        </div>
        {/* Abstract Pattern Background */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-primary/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>
      </div>

      <hr className="border-border-light dark:border-border-dark" />

      {/* Quick Access Grid */}
      <section>
        <h2 className="text-2xl font-bold text-text-primary dark:text-white mb-6">Quick Access</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          <Link to="foundations" className="group">
            <Card className="p-6 h-full hover:border-primary/50 transition-colors">
              <div className="h-12 w-12 bg-primary/10 rounded-xl flex items-center justify-center text-primary mb-4 group-hover:scale-110 transition-transform">
                <Palette className="h-6 w-6" />
              </div>
              <h3 className="font-bold text-lg mb-2">Foundations</h3>
              <p className="text-sm text-text-secondary">Colors, Typography, Shadows, and Spacing scales.</p>
              <div className="mt-4 flex items-center text-sm font-medium text-primary">
                View Tokens <ArrowRight className="ml-1 h-4 w-4" />
              </div>
            </Card>
          </Link>

          <Link to="components" className="group">
            <Card className="p-6 h-full hover:border-primary/50 transition-colors">
              <div className="h-12 w-12 bg-purple-100 dark:bg-purple-900/30 rounded-xl flex items-center justify-center text-purple-600 dark:text-purple-400 mb-4 group-hover:scale-110 transition-transform">
                <Box className="h-6 w-6" />
              </div>
              <h3 className="font-bold text-lg mb-2">Components</h3>
              <p className="text-sm text-text-secondary">Buttons, Inputs, Cards, and other reusable UI elements.</p>
              <div className="mt-4 flex items-center text-sm font-medium text-purple-600 dark:text-purple-400">
                View Library <ArrowRight className="ml-1 h-4 w-4" />
              </div>
            </Card>
          </Link>

          <Link to="layout" className="group">
            <Card className="p-6 h-full hover:border-primary/50 transition-colors">
              <div className="h-12 w-12 bg-green-100 dark:bg-green-900/30 rounded-xl flex items-center justify-center text-green-600 dark:text-green-400 mb-4 group-hover:scale-110 transition-transform">
                <Layout className="h-6 w-6" />
              </div>
              <h3 className="font-bold text-lg mb-2">Layout & Grid</h3>
              <p className="text-sm text-text-secondary">Responsive rules, grid systems, and spacing rhythm.</p>
              <div className="mt-4 flex items-center text-sm font-medium text-green-600 dark:text-green-400">
                View Guidelines <ArrowRight className="ml-1 h-4 w-4" />
              </div>
            </Card>
          </Link>

        </div>
      </section>

      {/* Implementation Note */}
      <section className="bg-blue-50 dark:bg-primary/5 border border-blue-100 dark:border-primary/10 rounded-xl p-6">
        <h3 className="font-bold text-primary mb-2">Developer Note</h3>
        <p className="text-sm text-text-secondary dark:text-gray-300">
          All components shown here are available in <code>src/components/ui/</code>. Use the <code>cn()</code> utility for merging classes when overriding styles.
        </p>
      </section>

    </div>
  );
}