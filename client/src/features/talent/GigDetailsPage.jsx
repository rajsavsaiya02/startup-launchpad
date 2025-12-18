import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Clock, DollarSign, Calendar, Users, Building2, MapPin, Globe, Share2, Bookmark } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Avatar } from '../../components/ui/Avatar';
import { Card } from '../../components/ui/Card';

export function GigDetailsPage() {
  const { id } = useParams();

  // Mock Data
  const gig = {
    title: "UI/UX Designer Needed for Mobile App Revamp",
    org: "Innovatech Solutions",
    posted: "3 days ago",
    applicants: 17,
    description: "We are looking for a creative and detail-oriented designer to lead the revamp of our core mobile application. The ideal candidate will have a strong portfolio showcasing mobile-first designs, proficiency in Figma, and experience with prototyping. You will work closely with our product and engineering teams to deliver a seamless user experience.",
    skills: ['Figma', 'Prototyping', 'Wireframing', 'User Research', 'Interaction Design'],
    budget: "$5,000 - $8,000",
    duration: "3 Months",
    start: "August 1, 2024",
    commitment: "Full-time (40 hrs/week)",
    deadline: "July 25, 2024",
    location: "Remote",
    orgImg: "https://i.pravatar.cc/150?u=innovatech"
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-20">
      
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-text-tertiary">
        <Link to="/gigs" className="hover:text-primary flex items-center gap-1">
  <ArrowLeft className="h-4 w-4" /> Back to Gigs
</Link>
        <span>/</span>
        <span>Gig Details</span>
      </div>

      {/* Header */}
      <div className="border-b border-border-light dark:border-border-dark pb-8">
        <div className="flex flex-col md:flex-row justify-between items-start gap-4">
          <div>
            <h1 className="text-3xl font-bold text-text-primary dark:text-white mb-2">{gig.title}</h1>
            <div className="flex flex-wrap items-center gap-4 text-sm text-text-secondary dark:text-gray-400">
              <span className="flex items-center gap-1"><Building2 className="h-4 w-4" /> {gig.org}</span>
              <span className="flex items-center gap-1"><Clock className="h-4 w-4" /> Posted {gig.posted}</span>
              <span className="flex items-center gap-1"><Users className="h-4 w-4" /> {gig.applicants} Applicants</span>
            </div>
          </div>
          <div className="flex gap-3">
             <Button variant="outline" size="icon"><Share2 className="h-5 w-5" /></Button>
             <Button variant="outline" size="icon"><Bookmark className="h-5 w-5" /></Button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* Description */}
          <Card className="p-6 space-y-4 bg-white dark:bg-surface-dark">
            <h2 className="text-xl font-bold text-text-primary dark:text-white">Gig Description</h2>
            <p className="text-text-secondary dark:text-gray-300 leading-relaxed">
              {gig.description}
            </p>
            <div className="pt-4">
              <h3 className="font-semibold text-sm text-text-primary dark:text-white mb-3">Key Responsibilities:</h3>
              <ul className="list-disc pl-5 space-y-2 text-sm text-text-secondary dark:text-gray-400">
                <li>Conduct user research and competitive analysis.</li>
                <li>Create low and high-fidelity wireframes.</li>
                <li>Develop interactive prototypes for user testing.</li>
                <li>Collaborate with developers to ensure design feasibility.</li>
              </ul>
            </div>
          </Card>

          {/* Skills */}
          <Card className="p-6 space-y-4 bg-white dark:bg-surface-dark">
            <h2 className="text-xl font-bold text-text-primary dark:text-white">Required Skills</h2>
            <div className="flex flex-wrap gap-2">
              {gig.skills.map((skill) => (
                <Badge key={skill} variant="neutral" className="bg-primary/5 text-primary border-primary/20 px-3 py-1">
                  {skill}
                </Badge>
              ))}
            </div>
          </Card>

          {/* Project Details (Grid) */}
          <Card className="p-6 space-y-4 bg-white dark:bg-surface-dark">
            <h2 className="text-xl font-bold text-text-primary dark:text-white">Project Details</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-gray-500">
                  <DollarSign className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-xs text-text-tertiary">Budget Range</p>
                  <p className="font-semibold text-text-primary dark:text-white">{gig.budget}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-gray-500">
                  <Clock className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-xs text-text-tertiary">Duration</p>
                  <p className="font-semibold text-text-primary dark:text-white">{gig.duration}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-gray-500">
                  <Calendar className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-xs text-text-tertiary">Start Date</p>
                  <p className="font-semibold text-text-primary dark:text-white">{gig.start}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-gray-500">
                  <MapPin className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-xs text-text-tertiary">Location</p>
                  <p className="font-semibold text-text-primary dark:text-white">{gig.location}</p>
                </div>
              </div>
            </div>
          </Card>

        </div>

        {/* Sidebar (Sticky) */}
        <div className="lg:col-span-1">
          <div className="sticky top-24 space-y-6">
            
            {/* Action Card */}
            <Card className="p-6 space-y-6 border-primary/20 shadow-md bg-white dark:bg-surface-dark">
              <div>
                <p className="text-lg font-bold text-text-primary dark:text-white">{gig.applicants} Applicants</p>
                <p className="text-xs text-text-tertiary">Don't wait! This gig is popular.</p>
              </div>
              <div className="space-y-3">
                <Button className="w-full font-bold text-base py-6">Apply Now</Button>
                <Button variant="outline" className="w-full font-semibold">Save for Later</Button>
              </div>
            </Card>

            {/* Company Card */}
            <Card className="p-6 bg-white dark:bg-surface-dark">
              <div className="flex items-center gap-4 mb-4">
                <Avatar src={gig.orgImg} size="lg" />
                <div>
                  <h3 className="font-bold text-text-primary dark:text-white">{gig.org}</h3>
                  <a href="#" className="text-sm text-primary hover:underline flex items-center gap-1">
                    Visit Website <Globe className="h-3 w-3" />
                  </a>
                </div>
              </div>
              <p className="text-sm text-text-secondary dark:text-gray-400 mb-4">
                Leading the future of mobile technology with innovative solutions.
              </p>
              <div className="border-t border-border-light dark:border-border-dark pt-4 flex justify-between text-sm">
                <span className="text-text-tertiary">Jobs Posted</span>
                <span className="font-medium text-text-primary dark:text-white">12</span>
              </div>
            </Card>

          </div>
        </div>

      </div>
    </div>
  );
}