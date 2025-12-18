import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Download, Building, MapPin, Users, Target, TrendingUp } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Card } from '../components/ui/Card';

export function CaseStudyDetailPage() {
  const { id } = useParams();

  // Mock Data - In production, fetch based on 'id'
  const study = {
    title: "Scaling from Garage to Series A in 9 Months",
    subtitle: "How NextGen AI utilized Startup LaunchPad's Operational & Financial hubs to demonstrate operational maturity to investors.",
    company: "NextGen AI",
    industry: "Artificial Intelligence",
    location: "Bengaluru, India",
    stage: "Series A",
    teamSize: "12 - 50",
    metrics: [
      { label: "Runway Extended", value: "4 Months" },
      { label: "OpEx Reduction", value: "18%" },
      { label: "Investor Audit Time", value: "-70%" }
    ]
  };

  return (
    <div className="bg-background-light dark:bg-background-dark min-h-screen font-sans text-text-primary transition-colors duration-300">
      
      {/* Report Navigation */}
      <div className="sticky bg-linear-to-br z-30 bg-background-light/95 dark:bg-background-dark/95 backdrop-blur-sm border-b border-border-light dark:border-border-dark">
        <div className="max-w-7xl mx-auto px-6 h-14 flex items-center justify-between">
          <Link to="/case-studies" className="flex items-center gap-2 text-sm text-text-secondary hover:text-primary transition-colors">
            <ArrowLeft className="h-4 w-4" /> Back to Case Studies
          </Link>
          <Button variant="outline" size="sm" className="gap-2">
            <Download className="h-4 w-4" /> Download PDF Report
          </Button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          
          {/* Main Report Content */}
          <div className="lg:col-span-8">
            <header className="mb-12">
              <Badge variant="primary" className="mb-4">Case Study: {study.industry}</Badge>
              <h1 className="text-4xl md:text-5xl font-bold text-text-primary dark:text-white leading-tight mb-6">
                {study.title}
              </h1>
              <p className="text-xl text-text-secondary dark:text-gray-400 leading-relaxed border-l-4 border-primary pl-6">
                {study.subtitle}
              </p>
            </header>

            <div className="prose prose-lg dark:prose-invert max-w-none text-text-secondary dark:text-gray-300">
              
              <h2 className="text-2xl font-bold text-text-primary dark:text-white mt-12 mb-4">1. The Executive Summary</h2>
              <p>
                NextGen AI faced a common dilemma: they had a groundbreaking product but chaotic internal operations. Investors were hesitant due to a high, unexplained burn rate. By adopting Startup LaunchPad, they centralized their financial tracking and project management, resulting in a <strong>clear, auditable paper trail</strong> that ultimately secured their Series A funding.
              </p>

              <h2 className="text-2xl font-bold text-text-primary dark:text-white mt-12 mb-4">2. The Challenge: "The Context Gap"</h2>
              <p>
                Before LaunchPad, the team managed tasks in Trello, finances in Excel, and hiring in email threads. This fragmentation caused:
              </p>
              <ul className="list-disc pl-5 space-y-2">
                <li><strong>Invisible Burn:</strong> Subscription costs were going unnoticed.</li>
                <li><strong>Siloed Information:</strong> Developers didn't know the hiring budget for new tools.</li>
                <li><strong>Investor Skepticism:</strong> Due diligence took weeks instead of days.</li>
              </ul>

              <h2 className="text-2xl font-bold text-text-primary dark:text-white mt-12 mb-4">3. The Solution: Unified Operations</h2>
              <p>
                NextGen AI implemented the <strong>Financial Hub</strong> first. They categorized 100% of expenses and set up automated alerts for budget deviations. Simultaneously, they moved their product roadmap to the <strong>Operations Hub</strong>, linking specific development tasks to their associated costs.
              </p>
              
              <div className="my-8 p-6 bg-surface-light dark:bg-surface-dark rounded-xl border border-border-light dark:border-border-dark">
                <h4 className="font-bold text-text-primary dark:text-white mb-2">Key Strategy Implemented</h4>
                <p className="text-sm">"We mandated that every new project card in the Kanban board must have an attached budget estimate from the Financial Hub. This simple rule cut our experimental waste by 30% in the first month." — <em>CTO, NextGen AI</em></p>
              </div>

              <h2 className="text-2xl font-bold text-text-primary dark:text-white mt-12 mb-4">4. The Results</h2>
              <p>
                Within 9 months, the company not only extended their runway by optimizing spend but also presented a comprehensive "Operational Health Report" generated by LaunchPad to investors. This transparency was cited as a key factor in their term sheet.
              </p>
            </div>
          </div>

          {/* Sidebar: Company Profile & Metrics */}
          <div className="lg:col-span-4 space-y-8">
            
            {/* Company Card */}
            <Card className="p-6 border-border-light dark:border-border-dark bg-surface-light dark:bg-surface-dark">
              <div className="flex items-center gap-4 mb-6">
                <div className="h-16 w-16 rounded-lg bg-gray-200 dark:bg-gray-700 flex items-center justify-center text-2xl font-bold text-gray-500">
                  NG
                </div>
                <div>
                  <h3 className="font-bold text-lg text-text-primary dark:text-white">{study.company}</h3>
                  <a href="#" className="text-sm text-primary hover:underline">nextgen.ai</a>
                </div>
              </div>
              
              <div className="space-y-4 text-sm">
                <div className="flex items-center gap-3 text-text-secondary dark:text-gray-400">
                  <Building className="h-4 w-4" /> {study.industry}
                </div>
                <div className="flex items-center gap-3 text-text-secondary dark:text-gray-400">
                  <MapPin className="h-4 w-4" /> {study.location}
                </div>
                <div className="flex items-center gap-3 text-text-secondary dark:text-gray-400">
                  <Users className="h-4 w-4" /> {study.teamSize} Employees
                </div>
                <div className="flex items-center gap-3 text-text-secondary dark:text-gray-400">
                  <Target className="h-4 w-4" /> {study.stage}
                </div>
              </div>
            </Card>

            {/* Impact Metrics */}
            <Card className="p-6 border-primary bg-primary/5">
              <h3 className="font-bold text-lg text-primary mb-6 flex items-center gap-2">
                <TrendingUp className="h-5 w-5" /> Impact Highlights
              </h3>
              <div className="space-y-6">
                {study.metrics.map((metric, i) => (
                  <div key={i}>
                    <p className="text-sm text-text-tertiary uppercase tracking-wider font-semibold">{metric.label}</p>
                    <p className="text-3xl font-bold text-text-primary dark:text-white mt-1">{metric.value}</p>
                  </div>
                ))}
              </div>
            </Card>

            {/* Call to Action */}
            <div className="bg-linear-to-br from-primary to-blue-600 rounded-xl p-6 text-white text-center">
              <h3 className="font-bold text-lg mb-2">Inspired?</h3>
              <p className="text-sm text-blue-100 mb-6">Start building your success story with Startup LaunchPad today.</p>
              <Link to="/auth/signup">
                <Button className="w-full bg-white text-primary hover:bg-gray-100 border-none font-bold">
                  Start Free Trial
                </Button>
              </Link>
            </div>

          </div>

        </div>
      </div>

    </div>
  );
}