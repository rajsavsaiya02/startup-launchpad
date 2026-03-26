import React from "react";
import { useParams, Link } from "react-router-dom";
import {
  ArrowLeft,
  Mail,
  Send,
  MapPin,
  Star,
  Clock,
  IndianRupee,
  Briefcase,
} from "lucide-react";
import { Button } from "../../components/ui/Button";
import { Badge } from "../../components/ui/Badge";
import { Avatar } from "../../components/ui/Avatar";
import { Card } from "../../components/ui/Card";

export function FreelancerProfilePage() {
  useParams();

  // Mock Data
  const freelancer = {
    name: "Elena Rodriguez",
    role: "Senior Product Designer",
    location: "Remote, Spain",
    rating: 4.9,
    rate: "₹80 - ₹100 / hour",
    availability: "20-30 hours/week",
    img: "https://i.pravatar.cc/150?u=elena",
    about:
      "As a Senior Product Designer with over 8 years of experience, I specialize in creating intuitive and engaging user experiences for complex SaaS applications. My passion lies in translating user needs into beautiful and functional designs that drive business goals.",
    skills: [
      "UI/UX Design",
      "Figma",
      "Prototyping",
      "User Research",
      "Design Systems",
      "Interaction Design",
    ],
    experience: [
      {
        role: "Senior Product Designer",
        company: "Acme Inc.",
        dates: "Jan 2020 - Present",
        desc: "Led the design of a new enterprise dashboard, improving user task completion rates by 25%.",
      },
      {
        role: "UX/UI Designer",
        company: "Innovate Solutions",
        dates: "Jun 2017 - Dec 2019",
        desc: "Designed and launched a mobile application for a fintech startup, acquiring 100k users.",
      },
    ],
    portfolio: [
      "https://images.unsplash.com/photo-1611162617474-5b21e879e113?q=80&w=1000&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1545235617-9465d2a55698?q=80&w=1000&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1586717791821-3f44a5638d48?q=80&w=1000&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1581291518633-83b4ebd1d83e?q=80&w=1000&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1509395062549-057d3fc8ae47?q=80&w=1000&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1611162616475-46b635cb6868?q=80&w=1000&auto=format&fit=crop",
    ],
    reviews: [
      {
        name: "John Doe",
        company: "CEO at Innovate",
        rating: 4.9,
        text: "Elena is an exceptional designer. Her attention to detail and ability to understand complex user needs is second to none.",
      },
      {
        name: "Jane Smith",
        company: "PM at Acme",
        rating: 5.0,
        text: "Working with Elena is a pleasure. She is a true professional, always delivering high-quality work on time.",
      },
    ],
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-20">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-text-tertiary">
        <Link
          to="/talent"
          className="hover:text-primary flex items-center gap-1"
        >
          <ArrowLeft className="h-4 w-4" /> Back to Marketplace
        </Link>
        <span>/</span>
        <span>Profile</span>
      </div>

      {/* Profile Header */}
      <div className="flex flex-col md:flex-row items-center gap-6 pb-8 border-b border-border-light dark:border-border-dark">
        <Avatar
          src={freelancer.img}
          size="xl"
          className="h-24 w-24 ring-4 ring-white dark:ring-surface-dark shadow-lg"
        />
        <div className="text-center md:text-left flex-1">
          <h1 className="text-3xl font-bold text-text-primary dark:text-white">
            {freelancer.name}
          </h1>
          <p className="text-text-secondary dark:text-gray-400 text-lg">
            {freelancer.role}
          </p>
          <div className="flex items-center justify-center md:justify-start gap-4 mt-2 text-sm text-text-tertiary">
            <span className="flex items-center gap-1">
              <MapPin className="h-4 w-4" /> {freelancer.location}
            </span>
            <span className="flex items-center gap-1 text-warning font-medium">
              <Star className="h-4 w-4 fill-current" /> {freelancer.rating}
            </span>
          </div>
        </div>
        <div className="flex gap-3">
          <Button className="gap-2">
            <Send className="h-4 w-4" /> Invite to Apply
          </Button>
          <Button variant="outline" className="gap-2">
            <Mail className="h-4 w-4" /> Message
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column (Details) */}
        <div className="lg:col-span-2 space-y-8">
          {/* About */}
          <Card className="p-6 space-y-4 bg-white dark:bg-surface-dark">
            <h2 className="text-xl font-bold text-text-primary dark:text-white">
              About
            </h2>
            <p className="text-text-secondary dark:text-gray-300 leading-relaxed">
              {freelancer.about}
            </p>
          </Card>

          {/* Experience */}
          <Card className="p-6 space-y-6 bg-white dark:bg-surface-dark">
            <h2 className="text-xl font-bold text-text-primary dark:text-white">
              Experience
            </h2>
            <div className="space-y-6">
              {freelancer.experience.map((job, i) => (
                <div
                  key={i}
                  className="border-l-2 border-border-light dark:border-border-dark pl-4"
                >
                  <h3 className="font-semibold text-text-primary dark:text-white">
                    {job.role}
                  </h3>
                  <p className="text-sm text-text-tertiary">
                    {job.company} • {job.dates}
                  </p>
                  <p className="text-sm text-text-secondary mt-2">{job.desc}</p>
                </div>
              ))}
            </div>
          </Card>

          {/* Education (Static for now based on HTML) */}
          <Card className="p-6 space-y-6 bg-white dark:bg-surface-dark">
            <h2 className="text-xl font-bold text-text-primary dark:text-white">
              Education
            </h2>
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold text-text-primary dark:text-white">
                  Master of Science in HCI
                </h3>
                <p className="text-sm text-text-tertiary">
                  University of Design • 2015 - 2017
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-text-primary dark:text-white">
                  Bachelor of Arts in Graphic Design
                </h3>
                <p className="text-sm text-text-tertiary">
                  State College of Art • 2011 - 2015
                </p>
              </div>
            </div>
          </Card>
        </div>

        {/* Right Column (Sidebar) */}
        <div className="space-y-8">
          {/* Skills */}
          <Card className="p-6 space-y-4 bg-white dark:bg-surface-dark">
            <h2 className="text-lg font-bold text-text-primary dark:text-white">
              Skills
            </h2>
            <div className="flex flex-wrap gap-2">
              {freelancer.skills.map((skill) => (
                <Badge
                  key={skill}
                  variant="neutral"
                  className="bg-gray-100 dark:bg-gray-800 text-text-secondary border-transparent"
                >
                  {skill}
                </Badge>
              ))}
            </div>
          </Card>

          {/* Portfolio */}
          <Card className="p-6 space-y-4 bg-white dark:bg-surface-dark">
            <h2 className="text-lg font-bold text-text-primary dark:text-white">
              Portfolio
            </h2>
            <div className="grid grid-cols-3 gap-2">
              {freelancer.portfolio.map((img, i) => (
                <div
                  key={i}
                  className="aspect-square rounded-lg overflow-hidden bg-gray-100 cursor-pointer hover:opacity-90 transition-opacity"
                >
                  <img
                    src={img}
                    alt="Portfolio"
                    className="w-full h-full object-cover"
                  />
                </div>
              ))}
            </div>
          </Card>

          {/* Availability */}
          <Card className="p-6 space-y-4 bg-white dark:bg-surface-dark">
            <h2 className="text-lg font-bold text-text-primary dark:text-white">
              Availability
            </h2>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-text-tertiary flex items-center gap-2">
                  <Clock className="h-4 w-4" /> Hours
                </span>
                <span className="font-medium text-text-primary dark:text-white">
                  {freelancer.availability}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-text-tertiary flex items-center gap-2">
                  <Briefcase className="h-4 w-4" /> Style
                </span>
                <span className="font-medium text-text-primary dark:text-white">
                  Remote, Flexible
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-text-tertiary flex items-center gap-2">
                  <IndianRupee className="h-4 w-4" /> Rate
                </span>
                <span className="font-medium text-text-primary dark:text-white">
                  {freelancer.rate}
                </span>
              </div>
            </div>
          </Card>

          {/* Reviews */}
          <Card className="p-6 space-y-4 bg-white dark:bg-surface-dark">
            <h2 className="text-lg font-bold text-text-primary dark:text-white">
              Reviews
            </h2>
            <div className="space-y-4">
              {freelancer.reviews.map((review, i) => (
                <div key={i} className="space-y-1">
                  <div className="flex justify-between items-center">
                    <p className="font-semibold text-sm text-text-primary dark:text-white">
                      {review.name}
                    </p>
                    <span className="flex items-center text-xs font-bold text-warning">
                      <Star className="h-3 w-3 fill-current" /> {review.rating}
                    </span>
                  </div>
                  <p className="text-xs text-text-tertiary">{review.company}</p>
                  <p className="text-xs text-text-secondary italic mt-1">
                    "{review.text}"
                  </p>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
