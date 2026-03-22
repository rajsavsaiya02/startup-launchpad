import React from "react";
import { useParams, Link } from "react-router-dom";
import { motion as Motion } from "framer-motion";
import {
  ArrowLeft,
  Mail,
  MapPin,
  Globe,
  Linkedin,
  Github,
  Briefcase,
  Clock,
  DollarSign,
  UserX,
  ChevronLeft,
  Loader2,
} from "lucide-react";
import { Button } from "../../components/ui/Button";
import { Badge } from "../../components/ui/Badge";
import { Avatar } from "../../components/ui/Avatar";
import { Card } from "../../components/ui/Card";
import { usePublicProfile } from "../../hooks/useTalent";
import { useAuth } from "../../context/AuthContext";
import { cn } from "../../utils/cn";

const fadeUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.45 },
};

export function PublicProfilePage({ overrideUsername }) {
  const { username: paramUsername } = useParams();
  const username = overrideUsername || paramUsername;
  const { data, isLoading, isError } = usePublicProfile(username);
  const { isAuthenticated } = useAuth();

  if (isLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
      </div>
    );
  }

  if (isError || !data?.profile) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center p-6 text-center">
        <div className="bg-white dark:bg-surface-dark border border-gray-100 dark:border-gray-800 rounded-3xl p-10 shadow-xl max-w-md">
          <UserX className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-200 mb-2">
            Profile Unavailable
          </h2>
          <p className="text-gray-500 mb-6">The user profile you are looking for does not exist.</p>
          <Link to="/community">
            <Button variant="primary" className="w-full">
              Return to Community
            </Button>
          </Link>
        </div>
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

  const handleContact = () => {
    if (profile.email) {
      window.location.href = `mailto:${profile.email}`;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50/30 dark:bg-[#0a0f1c] pb-24">
      {/* ── Hero Cover ─────────────────────────────────── */}
      <div className="relative h-[200px] md:h-[240px] w-full overflow-hidden bg-gradient-to-br from-primary/90 via-indigo-600 to-purple-700">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10 mix-blend-overlay" />
        <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/4" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-purple-400/20 rounded-full blur-[60px] translate-y-1/2 -translate-x-1/4" />

        <div className="absolute top-5 left-5 z-10">
          <button
            onClick={() => window.history.back()}
            className="flex items-center gap-1 text-white hover:bg-white/20 px-3 py-1.5 rounded-lg border border-white/10 backdrop-blur-md transition-all text-sm font-medium shadow-sm"
          >
            <ChevronLeft className="h-4 w-4" />
            Back
          </button>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 -mt-16 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* ── MAIN COLUMN ────────────────────────────── */}
          <div className="lg:col-span-8 space-y-8">
            {/* Identity Card */}
            <Motion.div {...fadeUp}>
              <div className="bg-white dark:bg-surface-dark border border-border-light dark:border-border-dark rounded-3xl shadow-xl shadow-primary/5 p-7">
                <div className="flex flex-col sm:flex-row gap-6 items-start">
                  {/* Avatar */}
                  <div className="relative mt-[-60px] cursor-default">
                    <Avatar
                      src={profile.avatar_url}
                      fallback={profile.name?.split(' ').map(n => n[0]).join('').toUpperCase()}
                      size="xl"
                      className="h-32 w-32 ring-4 ring-white dark:ring-surface-dark shadow-2xl"
                    />
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0 pt-2">
                    <div className="flex flex-wrap items-center justify-between gap-4">
                      <div>
                        <h1 className="text-3xl font-black text-text-primary dark:text-white tracking-tight">
                          {profile.name}
                        </h1>
                        <p className="text-lg font-medium text-primary/80 dark:text-primary mt-1">
                          {profile.job_title || "Professional"}
                        </p>
                      </div>
                      
                      {isAuthenticated && (
                        <Button 
                          onClick={handleContact}
                          className="gap-2 rounded-xl px-6 h-11 bg-primary hover:bg-primary-dark shadow-lg shadow-primary/20"
                        >
                          <Mail className="h-4 w-4" />
                          Contact Us
                        </Button>
                      )}
                    </div>

                    <div className="flex flex-wrap items-center gap-4 mt-6 text-sm text-text-tertiary">
                      {profile.location && (
                        <span className="flex items-center gap-1.5 bg-gray-50 dark:bg-gray-800/50 px-3 py-1.5 rounded-lg border border-gray-100 dark:border-gray-800">
                          <MapPin className="h-4 w-4 text-primary" /> {profile.location}
                        </span>
                      )}
                      {profile.department && (
                        <span className="flex items-center gap-1.5 bg-gray-50 dark:bg-gray-800/50 px-3 py-1.5 rounded-lg border border-gray-100 dark:border-gray-800">
                          <Briefcase className="h-4 w-4 text-primary" /> {profile.department}
                        </span>
                      )}
                      
                      <div className="flex items-center gap-2 ml-auto">
                        {profile.social_linkedin && (
                          <SocialLink href={profile.social_linkedin} icon={Linkedin} />
                        )}
                        {profile.social_github && (
                          <SocialLink href={profile.social_github} icon={Github} />
                        )}
                        {profile.social_website && (
                          <SocialLink href={profile.social_website} icon={Globe} />
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </Motion.div>

            {/* About Section */}
            {profile.bio && (
              <Motion.div {...fadeUp} transition={{ delay: 0.1 }}>
                <div className="bg-white dark:bg-surface-dark border border-border-light dark:border-border-dark rounded-3xl p-7 shadow-sm">
                  <h2 className="text-xl font-bold text-text-primary dark:text-white mb-4">
                    About
                  </h2>
                  <p className="text-text-secondary dark:text-gray-300 leading-relaxed whitespace-pre-wrap italic">
                    {profile.bio}
                  </p>
                </div>
              </Motion.div>
            )}

            {/* Experience Section */}
            {experience.length > 0 && (
              <Motion.div {...fadeUp} transition={{ delay: 0.2 }}>
                <div className="bg-white dark:bg-surface-dark border border-border-light dark:border-border-dark rounded-3xl p-7 shadow-sm">
                  <h2 className="text-xl font-bold text-text-primary dark:text-white mb-6">
                    Experience
                  </h2>
                  <div className="space-y-8">
                    {experience.map((job, i) => (
                      <div key={i} className="relative pl-6 before:absolute before:left-0 before:top-2 before:bottom-0 before:w-0.5 before:bg-primary/20">
                        <div className="absolute left-[-4px] top-2 w-2.5 h-2.5 rounded-full bg-primary" />
                        <h3 className="font-bold text-text-primary dark:text-white text-lg">
                          {job.role}
                        </h3>
                        <p className="text-sm font-semibold text-primary mt-0.5">
                          {job.company} • {job.dates}
                        </p>
                        <p className="text-sm text-text-secondary dark:text-gray-400 mt-3 leading-relaxed">
                          {job.desc}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              </Motion.div>
            )}

            {/* Education Section */}
            {education.length > 0 && (
              <Motion.div {...fadeUp} transition={{ delay: 0.3 }}>
                <div className="bg-white dark:bg-surface-dark border border-border-light dark:border-border-dark rounded-3xl p-7 shadow-sm">
                  <h2 className="text-xl font-bold text-text-primary dark:text-white mb-6">
                    Education
                  </h2>
                  <div className="grid gap-6">
                    {education.map((edu, i) => (
                      <div key={i} className="flex gap-4">
                        <div className="h-12 w-12 rounded-xl bg-primary/5 flex items-center justify-center flex-shrink-0">
                          <Briefcase className="h-6 w-6 text-primary" />
                        </div>
                        <div>
                          <h3 className="font-bold text-text-primary dark:text-white">
                            {edu.degree}
                          </h3>
                          <p className="text-sm text-text-tertiary">
                            {edu.school} • {edu.dates}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </Motion.div>
            )}
          </div>

          {/* ── SIDEBAR ────────────────────────────────── */}
          <div className="lg:col-span-4 space-y-8">
            {/* Skills Card */}
            {profile.skills && profile.skills.length > 0 && (
              <Motion.div {...fadeUp} transition={{ delay: 0.15 }}>
                <div className="bg-white dark:bg-surface-dark border border-border-light dark:border-border-dark rounded-3xl p-6 shadow-sm">
                  <h2 className="text-lg font-bold text-text-primary dark:text-white mb-4">
                    Skills
                  </h2>
                  <div className="flex flex-wrap gap-2">
                    {profile.skills.map((skill) => (
                      <Badge
                        key={skill}
                        variant="secondary"
                        className="rounded-lg px-3 py-1 bg-gray-50 dark:bg-gray-800 text-text-secondary border-gray-100 dark:border-gray-700 font-medium"
                      >
                        {skill}
                      </Badge>
                    ))}
                  </div>
                </div>
              </Motion.div>
            )}

            {/* Portfolio Card */}
            {portfolio.length > 0 && (
              <Motion.div {...fadeUp} transition={{ delay: 0.25 }}>
                <div className="bg-white dark:bg-surface-dark border border-border-light dark:border-border-dark rounded-3xl p-6 shadow-sm">
                  <h2 className="text-lg font-bold text-text-primary dark:text-white mb-4">
                    Portfolio
                  </h2>
                  <div className="grid grid-cols-2 gap-3">
                    {portfolio.map((img, i) => (
                      <a
                        key={i}
                        href={img.url || "#"}
                        target="_blank"
                        rel="noreferrer"
                        className="aspect-square rounded-2xl overflow-hidden bg-gray-50 dark:bg-gray-800 border border-border-light dark:border-border-dark group"
                      >
                        <img
                          src={img.image || img}
                          alt="Portfolio item"
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                        />
                      </a>
                    ))}
                  </div>
                </div>
              </Motion.div>
            )}

            {/* Availability Card */}
            <Motion.div {...fadeUp} transition={{ delay: 0.35 }}>
              <div className="bg-gradient-to-br from-gray-900 to-gray-800 dark:from-gray-800 dark:to-gray-950 rounded-3xl p-6 text-white shadow-xl shadow-gray-900/20">
                <h2 className="text-lg font-bold mb-5 flex items-center gap-2">
                  <Clock className="h-5 w-5 text-primary" />
                  Availability
                </h2>
                <div className="space-y-4">
                  <div className="flex justify-between items-center p-3 rounded-xl bg-white/5 border border-white/10">
                    <span className="text-gray-400 text-xs font-medium uppercase tracking-wider">Hours</span>
                    <span className="font-bold text-sm">{availability}</span>
                  </div>
                  <div className="flex justify-between items-center p-3 rounded-xl bg-white/5 border border-white/10">
                    <span className="text-gray-400 text-xs font-medium uppercase tracking-wider">Rate</span>
                    <span className="font-bold text-sm text-primary">{rate}</span>
                  </div>
                </div>
              </div>
            </Motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}

function SocialLink({ href, icon: Icon }) {
  if (!href) return null;
  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      className="p-2.5 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-100 dark:border-gray-700 text-text-tertiary hover:text-primary hover:border-primary/30 transition-all shadow-sm"
    >
      <Icon className="h-5 w-5" />
    </a>
  );
}
