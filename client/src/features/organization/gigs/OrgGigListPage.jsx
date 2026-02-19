import React from "react";
import { Link } from "react-router-dom";
import {
  Search,
  Filter,
  Briefcase,
  DollarSign,
  Clock,
  MapPin,
  ChevronDown,
} from "lucide-react";
import { Button } from "../../../components/ui/Button";
import { Badge } from "../../../components/ui/Badge";
import { Card } from "../../../components/ui/Card";
import { Avatar } from "../../../components/ui/Avatar";

const GIGS = [
  {
    id: 1,
    title: "UI/UX Designer for App Revamp",
    org: "Innovatech",
    budget: "$5k - $8k",
    type: "Fixed Price",
    posted: "2 days ago",
    skills: ["Figma", "Mobile"],
    applicants: 17,
    img: "https://i.pravatar.cc/150?u=innovatech",
  },
  {
    id: 2,
    title: "React Native Developer",
    org: "Appify",
    budget: "$60 - $80/hr",
    type: "Hourly",
    posted: "5 hours ago",
    skills: ["React Native", "iOS"],
    applicants: 4,
    img: "https://i.pravatar.cc/150?u=appify",
  },
  {
    id: 3,
    title: "Marketing Strategy Consultant",
    org: "GrowthHub",
    budget: "$2k Fixed",
    type: "One-time",
    posted: "1 day ago",
    skills: ["GTM Strategy", "SEO"],
    applicants: 12,
    img: "https://i.pravatar.cc/150?u=growthhub",
  },
];

export function OrgGigListPage() {
  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-20">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-end gap-4 border-b border-border-light dark:border-border-dark pb-6">
        <div>
          <h1 className="text-3xl font-bold text-text-primary dark:text-white">
            Organization Gigs
          </h1>
          <p className="text-text-secondary dark:text-gray-400 mt-1">
            Browse and apply for short-term contracts and organization projects.
          </p>
        </div>
        <div className="flex gap-3">
          <Link to="/organization/talent">
            <Button variant="secondary">Find Talent</Button>
          </Link>
          <Button>Post a Gig</Button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col lg:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-text-tertiary" />
          <input
            type="text"
            placeholder="Search gigs..."
            className="w-full h-11 pl-10 pr-4 rounded-lg border border-border-light bg-white dark:bg-surface-dark dark:border-border-dark focus:ring-2 focus:ring-primary/20 focus:border-primary"
          />
        </div>
        {["Category", "Budget", "Duration"].map((filter) => (
          <div key={filter} className="relative min-w-40">
            <select className="w-full h-11 pl-4 pr-10 rounded-lg border border-border-light bg-white dark:bg-surface-dark dark:border-border-dark text-sm appearance-none cursor-pointer focus:ring-2 focus:ring-primary/20">
              <option>{filter}</option>
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-tertiary pointer-events-none" />
          </div>
        ))}
      </div>

      {/* Gig Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {GIGS.map((gig) => (
          <Card
            key={gig.id}
            className="p-6 hover:shadow-md transition-all flex flex-col h-full bg-white dark:bg-surface-dark border-border-light dark:border-border-dark"
          >
            <div className="flex justify-between items-start mb-4">
              <div className="flex gap-3">
                <Avatar src={gig.img} size="md" />
                <div>
                  <h3 className="font-bold text-text-primary dark:text-white line-clamp-1">
                    {gig.title}
                  </h3>
                  <p className="text-sm text-text-secondary dark:text-gray-400">
                    {gig.org}
                  </p>
                </div>
              </div>
              <Badge variant="neutral" className="shrink-0">
                {gig.type}
              </Badge>
            </div>

            <div className="flex flex-wrap gap-2 mb-6">
              {gig.skills.map((s) => (
                <Badge
                  key={s}
                  variant="neutral"
                  className="bg-gray-100 dark:bg-gray-800 border-transparent"
                >
                  {s}
                </Badge>
              ))}
            </div>

            <div className="mt-auto space-y-4">
              <div className="flex justify-between text-sm text-text-secondary dark:text-gray-400">
                <span className="flex items-center gap-1">
                  <DollarSign className="h-4 w-4" /> {gig.budget}
                </span>
                <span className="flex items-center gap-1">
                  <Clock className="h-4 w-4" /> {gig.posted}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <Link to={`/organization/gigs/${gig.id}`} className="w-full">
                  <Button variant="secondary" className="w-full">
                    Details
                  </Button>
                </Link>
                {/* For Demo: Link to Applications page to show the flow */}
                <Link
                  to={`/organization/gigs/${gig.id}/applications`}
                  className="w-full"
                >
                  <Button className="w-full">Manage</Button>
                </Link>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
