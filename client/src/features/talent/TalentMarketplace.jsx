import React from "react";
import { Search, Filter, MapPin, Star, ChevronDown } from "lucide-react";
import { Button } from "../../components/ui/Button";
import { Input } from "../../components/ui/Input";
import { Badge } from "../../components/ui/Badge";
import { Avatar } from "../../components/ui/Avatar";
import { Card } from "../../components/ui/Card";
import { Link } from "react-router-dom";

const FREELANCERS = [
  {
    id: 1,
    name: "Elena Rodriguez",
    role: "Senior Product Designer",
    skills: ["React", "UI/UX", "Figma"],
    exp: "4+ years",
    loc: "Remote, Spain",
    rating: 4.9,
    img: "https://i.pravatar.cc/150?u=elena",
  },
  {
    id: 2,
    name: "Ben Carter",
    role: "Lead Frontend Developer",
    skills: ["JavaScript", "Next.js", "GraphQL"],
    exp: "8+ years",
    loc: "Remote, USA",
    rating: 5.0,
    img: "https://i.pravatar.cc/150?u=ben",
  },
  {
    id: 3,
    name: "Aisha Khan",
    role: "Marketing Strategist",
    skills: ["SEO", "Content", "PPC"],
    exp: "6+ years",
    loc: "Remote, UK",
    rating: 4.8,
    img: "https://i.pravatar.cc/150?u=aisha",
  },
  {
    id: 4,
    name: "Kenji Tanaka",
    role: "Backend Engineer",
    skills: ["Python", "Django", "AWS"],
    exp: "5+ years",
    loc: "Remote, Japan",
    rating: 4.9,
    img: "https://i.pravatar.cc/150?u=kenji",
  },
  {
    id: 5,
    name: "Maria Garcia",
    role: "Data Scientist",
    skills: ["ML", "TensorFlow", "Pandas"],
    exp: "3+ years",
    loc: "Remote, Argentina",
    rating: 4.7,
    img: "https://i.pravatar.cc/150?u=maria",
  },
  {
    id: 6,
    name: "David Chen",
    role: "Operations Manager",
    skills: ["Notion", "Scrum", "Automation"],
    exp: "7+ years",
    loc: "Remote, Canada",
    rating: 5.0,
    img: "https://i.pravatar.cc/150?u=david",
  },
];

export function TalentMarketplace() {
  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-20">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-end gap-4 border-b border-border-light dark:border-border-dark pb-6">
        <div>
          <h1 className="text-3xl font-bold text-text-primary dark:text-white">
            Talent Marketplace
          </h1>
          <p className="text-text-secondary dark:text-gray-400 mt-1">
            Find skilled freelancers for your startup’s projects.
          </p>
        </div>
        <div className="flex gap-3">
          <Button variant="secondary">Filter Talent</Button>
          <Button>Post a Gig</Button>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="flex flex-col lg:flex-row gap-4">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-text-tertiary" />
            <input
              type="text"
              placeholder="Search by skill, role, or keyword"
              className="w-full h-11 pl-10 pr-4 rounded-lg border border-border-light bg-white dark:bg-surface-dark dark:border-border-dark focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
            />
          </div>
        </div>

        {["Experience", "Categories", "Availability"].map((filter) => (
          <div key={filter} className="relative min-w-40">
            <select className="w-full h-11 pl-4 pr-10 rounded-lg border border-border-light bg-white dark:bg-surface-dark dark:border-border-dark text-sm text-text-primary dark:text-white appearance-none cursor-pointer focus:ring-2 focus:ring-primary/20 focus:border-primary">
              <option>{filter}</option>
              <option>Option 1</option>
              <option>Option 2</option>
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-tertiary pointer-events-none" />
          </div>
        ))}
      </div>

      {/* Talent Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {FREELANCERS.map((person) => (
          <Card
            key={person.id}
            className="p-6 flex flex-col items-center text-center hover:shadow-md transition-shadow bg-white dark:bg-surface-dark border-border-light dark:border-border-dark"
          >
            <Avatar src={person.img} size="xl" className="mb-4 h-20 w-20" />

            <h3 className="font-bold text-lg text-text-primary dark:text-white">
              {person.name}
            </h3>
            <p className="text-sm text-text-secondary dark:text-gray-400 mb-4">
              {person.role}
            </p>

            <div className="flex flex-wrap justify-center gap-2 mb-5">
              {person.skills.map((skill) => (
                <Badge
                  key={skill}
                  variant="neutral"
                  className="bg-gray-100 dark:bg-gray-800 border-transparent text-text-secondary"
                >
                  {skill}
                </Badge>
              ))}
            </div>

            <div className="flex items-center gap-3 text-sm text-text-secondary dark:text-gray-400 mb-6">
              <span className="px-2 py-0.5 bg-primary/10 text-primary rounded font-semibold text-xs">
                {person.exp}
              </span>
              <span className="flex items-center gap-1">
                <MapPin className="h-3 w-3" /> {person.loc}
              </span>
              <span className="flex items-center gap-1 font-medium">
                <Star className="h-3 w-3 fill-current text-warning" />{" "}
                {person.rating}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3 w-full mt-auto">
              <Button variant="secondary" className="w-full">
                Shortlist
              </Button>
              <Link to={`/talent/profile/${person.id}`} className="w-full">
                <Button className="w-full">View Profile</Button>
              </Link>
            </div>
          </Card>
        ))}
      </div>

      {/* Pagination */}
      <div className="flex justify-center items-center gap-2 pt-8 border-t border-border-light dark:border-border-dark">
        <Button variant="outline" size="sm" disabled>
          Previous
        </Button>
        <Button variant="primary" size="sm" className="w-9 p-0">
          1
        </Button>
        <Button variant="outline" size="sm" className="w-9 p-0">
          2
        </Button>
        <Button variant="outline" size="sm" className="w-9 p-0">
          3
        </Button>
        <span className="text-text-tertiary text-sm px-2">...</span>
        <Button variant="outline" size="sm" className="w-9 p-0">
          10
        </Button>
        <Button variant="outline" size="sm">
          Next
        </Button>
      </div>
    </div>
  );
}
