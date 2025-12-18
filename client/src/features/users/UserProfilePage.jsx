import React from 'react';
import { useParams } from 'react-router-dom';
import { Mail, MapPin, Calendar, Briefcase, Github, Linkedin } from 'lucide-react';
import { Avatar } from '../../components/ui/Avatar';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';

export function UserProfilePage() {
  // In a real app, fetch user by ID. Using mock for now.
  const user = {
    name: "Alex Johnson",
    role: "Product Manager",
    org: "LaunchPad Inc.",
    location: "San Francisco, CA",
    joined: "March 2023",
    email: "alex@launchpad.inc",
    bio: "Building tools for the next generation of founders. Passionate about UX, clean code, and product strategy. Currently leading the Operations Hub initiative.",
    skills: ["Product Strategy", "Agile", "React", "User Research", "Figma"],
    projects: ["Website Redesign", "Mobile App MVP"],
    img: "https://i.pravatar.cc/150?u=alex"
  };

  return (
    <div className="max-w-5xl mx-auto py-12 px-6 animate-in fade-in duration-500">
      
      <Card className="overflow-hidden bg-white dark:bg-surface-dark border-border-light dark:border-border-dark">
        
        {/* Banner */}
        <div className="h-40 bg-linear-to-r from-blue-600 to-indigo-600"></div>
        
        <div className="px-8 pb-8">
          <div className="relative flex flex-col md:flex-row justify-between items-end -mt-16 mb-6 gap-4">
            <div className="flex items-end gap-6">
              <Avatar src={user.img} size="xl" className="h-32 w-32 ring-4 ring-white dark:ring-surface-dark shadow-lg" />
              <div className="mb-2 ">
                <h1 className="text-3xl font-bold text-text-primary dark:text-white">{user.name}</h1>
                <p className="text-lg text-text-secondary dark:text-gray-300">{user.role}</p>
              </div>
            </div>
            <div className="flex gap-3 mb-2">
              <Button variant="outline" size="sm">Message</Button>
              <Button size="sm">View Projects</Button>
            </div>
          </div>
          
          {/* Details Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 mt-8">
            
            {/* Sidebar Info */}
            <div className="space-y-6">
              <div className="space-y-3 text-sm text-text-secondary dark:text-gray-400">
                <div className="flex items-center gap-3">
                  <Briefcase className="h-4 w-4 text-text-tertiary" /> {user.org}
                </div>
                <div className="flex items-center gap-3">
                  <MapPin className="h-4 w-4 text-text-tertiary" /> {user.location}
                </div>
                <div className="flex items-center gap-3">
                  <Calendar className="h-4 w-4 text-text-tertiary" /> Joined {user.joined}
                </div>
                <div className="flex items-center gap-3">
                  <Mail className="h-4 w-4 text-text-tertiary" /> {user.email}
                </div>
              </div>
              
              <div className="flex gap-2">
                <button className="p-2 rounded-full bg-gray-100 dark:bg-gray-800 text-text-secondary hover:text-primary transition-colors">
                  <Github className="h-5 w-5" />
                </button>
                <button className="p-2 rounded-full bg-gray-100 dark:bg-gray-800 text-text-secondary hover:text-primary transition-colors">
                  <Linkedin className="h-5 w-5" />
                </button>
              </div>
            </div>

            {/* Main Content */}
            <div className="lg:col-span-2 space-y-8">
              <section>
                <h3 className="text-lg font-bold text-text-primary dark:text-white mb-3">About</h3>
                <p className="text-text-secondary dark:text-gray-400 leading-relaxed">
                  {user.bio}
                </p>
              </section>

              <section>
                <h3 className="text-lg font-bold text-text-primary dark:text-white mb-3">Skills</h3>
                <div className="flex flex-wrap gap-2">
                  {user.skills.map(skill => (
                    <Badge key={skill} variant="neutral" className="bg-gray-100 dark:bg-gray-800 text-text-secondary border-transparent">
                      {skill}
                    </Badge>
                  ))}
                </div>
              </section>

              <section>
                <h3 className="text-lg font-bold text-text-primary dark:text-white mb-3">Active Projects</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {user.projects.map(proj => (
                    <div key={proj} className="p-4 rounded-lg border border-border-light dark:border-border-dark flex items-center gap-3 hover:border-primary/50 transition-colors cursor-pointer">
                      <div className="h-10 w-10 bg-primary/10 rounded-lg flex items-center justify-center text-primary font-bold">
                        {proj.charAt(0)}
                      </div>
                      <div>
                        <p className="font-semibold text-text-primary dark:text-white">{proj}</p>
                        <p className="text-xs text-text-tertiary">Member</p>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}