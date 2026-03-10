import React from "react";
import { useParams, Link } from "react-router-dom";
import {
  ArrowLeft,
  Mail,
  Send,
  MapPin,
  Globe,
  Linkedin,
  Github,
  Briefcase,
  Clock,
  DollarSign,
} from "lucide-react";
import { Button } from "../../components/ui/Button";
import { Badge } from "../../components/ui/Badge";
import { Avatar } from "../../components/ui/Avatar";
import { Card } from "../../components/ui/Card";
import { usePublicProfile } from "../../hooks/useTalent";

export function PublicProfilePage() {
  const { username } = useParams();
  const { data, isLoading, isError } = usePublicProfile(username);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (isError || !data?.profile) {
    return (
      <div className="text-center text-red-500 py-20 bg-white dark:bg-surface-dark rounded-xl">
        <h2 className="text-xl font-bold mb-2">Profile Not Found</h2>
        <p>The user profile you are looking for does not exist.</p>
        <Link to="/dashboard/opportunities">
          <Button className="mt-6">Back to Board</Button>
        </Link>
      </div>
    );
  }

  const profile = data.profile;
  const publicData = profile.public_profile || {};

  const experience = publicData.experience || [];
  const education = publicData.education || [];
  const portfolio = publicData.portfolio || [];
  const availability = publicData.availability || "Not specified";
  const rate = publicData.rate || "Negotiable";

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-20">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-text-tertiary">
        <button
          onClick={() => window.history.back()}
          className="hover:text-primary flex items-center gap-1"
        >
          <ArrowLeft className="h-4 w-4" /> Back
        </button>
        <span>/</span>
        <span>Public Profile</span>
      </div>

      {/* Profile Header */}
      <div className="flex flex-col md:flex-row items-center md:items-start gap-6 pb-8 border-b border-border-light dark:border-border-dark">
        <Avatar
          src={
            profile.avatar ||
            `https://ui-avatars.com/api/?name=${encodeURIComponent(profile.name)}&background=random`
          }
          size="xl"
          className="h-24 w-24 ring-4 ring-white dark:ring-surface-dark shadow-lg"
        />
        <div className="text-center md:text-left flex-1">
          <h1 className="text-3xl font-bold text-text-primary dark:text-white">
            {profile.name}
          </h1>
          <p className="text-text-secondary dark:text-gray-400 text-lg">
            {profile.job_title || "Professional"}
          </p>
          <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 mt-3 text-sm text-text-tertiary">
            {profile.location && (
              <span className="flex items-center gap-1">
                <MapPin className="h-4 w-4" /> {profile.location}
              </span>
            )}
            {profile.department && (
              <span className="flex items-center gap-1">
                <Briefcase className="h-4 w-4" /> {profile.department}
              </span>
            )}
            <div className="flex items-center gap-3 ml-2">
              {profile.social_linkedin && (
                <a
                  href={profile.social_linkedin}
                  target="_blank"
                  rel="noreferrer"
                  className="hover:text-primary"
                >
                  <Linkedin className="h-4 w-4" />
                </a>
              )}
              {profile.social_github && (
                <a
                  href={profile.social_github}
                  target="_blank"
                  rel="noreferrer"
                  className="hover:text-primary"
                >
                  <Github className="h-4 w-4" />
                </a>
              )}
              {profile.social_website && (
                <a
                  href={profile.social_website}
                  target="_blank"
                  rel="noreferrer"
                  className="hover:text-primary"
                >
                  <Globe className="h-4 w-4" />
                </a>
              )}
            </div>
          </div>
        </div>
        <div className="flex gap-3 mt-4 md:mt-0">
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
          {profile.bio && (
            <Card className="p-6 space-y-4 bg-white dark:bg-surface-dark">
              <h2 className="text-xl font-bold text-text-primary dark:text-white">
                About
              </h2>
              <p className="text-text-secondary dark:text-gray-300 leading-relaxed whitespace-pre-wrap">
                {profile.bio}
              </p>
            </Card>
          )}

          {/* Experience */}
          {experience.length > 0 && (
            <Card className="p-6 space-y-6 bg-white dark:bg-surface-dark">
              <h2 className="text-xl font-bold text-text-primary dark:text-white">
                Experience
              </h2>
              <div className="space-y-6">
                {experience.map((job, i) => (
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
                    <p className="text-sm text-text-secondary mt-2">
                      {job.desc}
                    </p>
                  </div>
                ))}
              </div>
            </Card>
          )}

          {/* Education */}
          {education.length > 0 && (
            <Card className="p-6 space-y-6 bg-white dark:bg-surface-dark">
              <h2 className="text-xl font-bold text-text-primary dark:text-white">
                Education
              </h2>
              <div className="space-y-4">
                {education.map((edu, i) => (
                  <div key={i}>
                    <h3 className="font-semibold text-text-primary dark:text-white">
                      {edu.degree}
                    </h3>
                    <p className="text-sm text-text-tertiary">
                      {edu.school} • {edu.dates}
                    </p>
                  </div>
                ))}
              </div>
            </Card>
          )}
        </div>

        {/* Right Column (Sidebar) */}
        <div className="space-y-8">
          {/* Skills */}
          {profile.skills && profile.skills.length > 0 && (
            <Card className="p-6 space-y-4 bg-white dark:bg-surface-dark">
              <h2 className="text-lg font-bold text-text-primary dark:text-white">
                Skills
              </h2>
              <div className="flex flex-wrap gap-2">
                {profile.skills.map((skill) => (
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
          )}

          {/* Portfolio */}
          {portfolio.length > 0 && (
            <Card className="p-6 space-y-4 bg-white dark:bg-surface-dark">
              <h2 className="text-lg font-bold text-text-primary dark:text-white">
                Portfolio
              </h2>
              <div className="grid grid-cols-3 gap-2">
                {portfolio.map((img, i) => (
                  <a
                    key={i}
                    href={img.url || "#"}
                    target="_blank"
                    rel="noreferrer"
                    className="aspect-square rounded-lg overflow-hidden bg-gray-100 cursor-pointer hover:opacity-90 transition-opacity"
                  >
                    <img
                      src={img.image || img}
                      alt="Portfolio item"
                      className="w-full h-full object-cover"
                    />
                  </a>
                ))}
              </div>
            </Card>
          )}

          {/* Availability */}
          <Card className="p-6 space-y-4 bg-white dark:bg-surface-dark">
            <h2 className="text-lg font-bold text-text-primary dark:text-white">
              Availability
            </h2>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between items-center">
                <span className="text-text-tertiary flex items-center gap-2">
                  <Clock className="h-4 w-4" /> Hours
                </span>
                <span className="font-medium text-text-primary dark:text-white text-right">
                  {availability}
                </span>
              </div>
              <div className="flex justify-between items-center mt-2">
                <span className="text-text-tertiary flex items-center gap-2">
                  <DollarSign className="h-4 w-4" /> Rate
                </span>
                <span className="font-medium text-text-primary dark:text-white text-right">
                  {rate}
                </span>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
