import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Search, Filter, MoreHorizontal, Check, X, Star, MapPin } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Badge } from '../../components/ui/Badge';
import { Avatar } from '../../components/ui/Avatar';
import { Card } from '../../components/ui/Card';

const APPLICANTS = [
  { id: 1, name: 'Elena Rodriguez', role: 'Senior Product Designer', exp: '5 years', loc: 'Remote, USA', score: 9.2, status: 'New', img: 'https://i.pravatar.cc/150?u=elena' },
  { id: 2, name: 'Ben Carter', role: 'UX Designer', exp: '3 years', loc: 'Remote, USA', score: 8.8, status: 'Shortlisted', img: 'https://i.pravatar.cc/150?u=ben' },
  { id: 3, name: 'Aisha Khan', role: 'UI/UX Designer', exp: '6 years', loc: 'Remote, UK', score: 8.5, status: 'Interviewing', img: 'https://i.pravatar.cc/150?u=aisha' },
  { id: 4, name: 'Kenji Tanaka', role: 'Product Designer', exp: '4 years', loc: 'Remote, Japan', score: 8.1, status: 'New', img: 'https://i.pravatar.cc/150?u=kenji' },
];

export function GigApplicationsPage() {
  const { id } = useParams();

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-20">
      
      {/* Header */}
      <div className="flex flex-col gap-4 border-b border-border-light dark:border-border-dark pb-6">
        <Link to={`/gigs/${id}`} className="flex items-center gap-2 text-sm text-text-tertiary hover:text-primary transition-colors w-fit">
          <ArrowLeft className="h-4 w-4" /> Back to Gig Details
        </Link>
        <div className="flex flex-wrap justify-between items-end gap-4">
          <div>
            <h1 className="text-3xl font-bold text-text-primary dark:text-white mb-1">Applications for UI/UX Designer Role</h1>
            <p className="text-text-secondary dark:text-gray-400 text-sm">17 candidates applied</p>
          </div>
          <div className="flex gap-3">
            <Button variant="secondary">Filter Talent</Button>
            <Button>Post a Gig</Button>
          </div>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-col lg:flex-row gap-4">
        <div className="flex-1">
          <Input icon={Search} placeholder="Search by name or keyword" className="h-11" />
        </div>
        <div className="flex gap-4 overflow-x-auto pb-2 lg:pb-0">
          <select className="h-11 px-4 rounded-lg border border-border-light bg-white dark:bg-surface-dark text-sm focus:ring-2 focus:ring-primary/20 dark:border-border-dark dark:text-white min-w-40">
            <option>Status: New</option>
            <option>Shortlisted</option>
            <option>Interviewing</option>
            <option>Rejected</option>
          </select>
          <select className="h-11 px-4 rounded-lg border border-border-light bg-white dark:bg-surface-dark text-sm focus:ring-2 focus:ring-primary/20 dark:border-border-dark dark:text-white min-w-40">
            <option>Sort by: Score</option>
            <option>Experience</option>
            <option>Date Applied</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Applicants List */}
        <div className="lg:col-span-2 space-y-4">
          {APPLICANTS.map((app) => (
            <Card key={app.id} className="p-5 hover:shadow-md transition-shadow bg-white dark:bg-surface-dark border-border-light dark:border-border-dark">
              <div className="flex flex-col sm:flex-row gap-4">
                <Avatar src={app.img} size="lg" />
                <div className="flex-1">
                  <div className="flex justify-between items-start mb-1">
                    <div>
                      <h3 className="text-lg font-bold text-text-primary dark:text-white">{app.name}</h3>
                      <p className="text-sm text-text-secondary dark:text-gray-400">{app.role}</p>
                    </div>
                    <Badge 
                      variant={app.status === 'Shortlisted' ? 'primary' : app.status === 'Interviewing' ? 'warning' : 'neutral'}
                      className={app.status === 'New' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' : ''}
                    >
                      {app.status}
                    </Badge>
                  </div>
                  
                  <div className="flex flex-wrap items-center gap-3 text-sm text-text-secondary dark:text-gray-300 my-4">
                    <span className="flex items-center gap-1"><BriefcaseIcon className="h-3 w-3" /> {app.exp}</span>
                    <span className="text-border-light dark:text-border-dark">|</span>
                    <span className="flex items-center gap-1"><MapPin className="h-3 w-3" /> {app.loc}</span>
                    <span className="text-border-light dark:text-border-dark">|</span>
                    <span className="font-semibold text-primary">Score: {app.score}</span>
                  </div>

                  <div className="flex gap-3 mt-auto">
                    <Link to={`/talent/profile/${app.id}`} className="flex-1">
                      <Button className="w-full">View Profile</Button>
                    </Link>
                    <Button variant="secondary" className="flex-1">Shortlist</Button>
                    <Button variant="ghost" className="flex-1 text-error hover:text-error hover:bg-error/10">Reject</Button>
                  </div>
                </div>
              </div>
            </Card>
          ))}

          {/* Pagination */}
          <div className="flex justify-center gap-2 pt-6">
            <Button variant="outline" size="sm">Previous</Button>
            <Button variant="primary" size="sm" className="w-9 p-0">1</Button>
            <Button variant="outline" size="sm" className="w-9 p-0">2</Button>
            <Button variant="outline" size="sm">Next</Button>
          </div>
        </div>

        {/* Bulk Actions Sidebar */}
        <div className="lg:col-span-1">
          <div className="sticky top-24 space-y-6">
            <Card className="p-5 bg-white dark:bg-surface-dark">
              <h3 className="font-bold text-lg mb-4">Bulk Actions</h3>
              <div className="space-y-3">
                <Button variant="secondary" className="w-full">Shortlist All Selected</Button>
                <Button variant="ghost" className="w-full text-error hover:bg-error/10">Reject All Selected</Button>
              </div>
              <p className="text-center text-xs text-text-tertiary mt-4">0 candidates selected</p>
            </Card>
          </div>
        </div>

      </div>
    </div>
  );
}

function BriefcaseIcon({ className }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <rect width="20" height="14" x="2" y="7" rx="2" ry="2" />
      <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
    </svg>
  )
} 