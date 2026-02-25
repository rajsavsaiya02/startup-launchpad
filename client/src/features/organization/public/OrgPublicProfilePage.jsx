import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { motion as Motion } from "framer-motion";
import {
  Globe,
  MapPin,
  Calendar,
  Layers,
  Award,
  Briefcase,
  Users,
  Building2,
  ExternalLink,
  ChevronLeft,
  Loader2,
} from "lucide-react";
import { apiClient } from "../../../lib/axios";
import { Button } from "../../../components/ui/Button";

export function OrgPublicProfilePage() {
  const { slug } = useParams();
  const [orgData, setOrgData] = useState(null);
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await apiClient.get(`/org/public/${slug}`);
        const { organization, members } = response.data;

        // Handle privacy: Check if public_profile.isPublic is explicitly false
        const publicProfile = organization.public_profile || {};
        if (publicProfile.isPublic === false) {
          setError("This organization profile is currently private.");
        } else {
          setOrgData(organization);
          setMembers(members);
        }
      } catch (err) {
        if (err.response?.status === 404) {
          setError("Organization not found.");
        } else {
          setError("Failed to load organization profile.");
        }
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [slug]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50/50 dark:bg-gray-900/50">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50/50 dark:bg-gray-900/50 p-6 text-center">
        <div>
          <Building2 className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-200 mb-2">
            Profile Unavailable
          </h2>
          <p className="text-gray-500 max-w-sm mx-auto">{error}</p>
          <Link to="/">
            <Button variant="outline" className="mt-6">
              Return Home
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  const { public_profile, name, logo_url, brief_description, created_at } =
    orgData;
  const {
    socialLinks = [],
    projects = [],
    achievements = [],
    milestones = [],
  } = public_profile || {};

  return (
    <div className="min-h-screen bg-gray-50/30 dark:bg-[#0a0f1c] pb-24">
      {/* Dynamic Cover Header */}
      <div className="relative h-[250px] md:h-[300px] w-full overflow-hidden bg-linear-to-br from-primary/80 to-indigo-600">
        {/* Subtle pattern overlay */}
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-20 mix-blend-overlay"></div>
        {/* Floating gradient orb */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-white/20 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2"></div>

        <div className="absolute top-6 left-6 z-10">
          <Link to="/">
            <Button
              variant="ghost"
              size="sm"
              className="text-white hover:bg-white/20 shadow-sm border border-white/10 backdrop-blur-md"
            >
              <ChevronLeft className="h-4 w-4 mr-1" /> Back to Hub
            </Button>
          </Link>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 -mt-24 sm:-mt-28 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* LEFT/MAIN COLUMN */}
          <div className="lg:col-span-8 space-y-8">
            {/* Identity Card */}
            <Motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="bg-white dark:bg-surface-dark border border-border-light dark:border-border-dark rounded-3xl shadow-xl shadow-primary/5 p-8 relative overflow-hidden"
            >
              <div className="flex flex-col sm:flex-row gap-6 items-start sm:items-center">
                <div className="h-32 w-32 rounded-2xl bg-white dark:bg-gray-800 shadow-xl shadow-black/5 ring-4 ring-white dark:ring-gray-900 flex items-center justify-center overflow-hidden shrink-0 mt-[-60px] sm:mt-0 relative z-10">
                  {logo_url ? (
                    <img
                      src={logo_url}
                      alt={name}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <span className="text-5xl font-black text-gray-300 dark:text-gray-600">
                      {name.charAt(0)}
                    </span>
                  )}
                </div>
                <div className="flex-1 mt-4 sm:mt-0">
                  <h1 className="text-3xl sm:text-4xl font-black text-text-primary dark:text-white tracking-tight">
                    {name}
                  </h1>
                  {brief_description && (
                    <p className="text-lg text-text-secondary dark:text-gray-300 mt-2 font-medium leading-relaxed">
                      {brief_description}
                    </p>
                  )}

                  <div className="flex flex-wrap items-center gap-4 mt-4 text-sm text-text-tertiary">
                    {created_at && (
                      <div className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 dark:bg-gray-800 rounded-lg">
                        <Calendar className="h-4 w-4" />
                        <span>
                          Founded {new Date(created_at).getFullYear()}
                        </span>
                      </div>
                    )}
                    <div className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 dark:bg-gray-800 rounded-lg">
                      <Users className="h-4 w-4" />
                      <span>{members.length} Members</span>
                    </div>
                  </div>
                </div>
              </div>

              {socialLinks.length > 0 && (
                <div className="mt-8 pt-6 border-t border-gray-100 dark:border-gray-800 flex flex-wrap gap-3">
                  {socialLinks.map((link, i) => (
                    <a
                      key={i}
                      href={link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 px-4 py-2 bg-gray-50 hover:bg-gray-100 dark:bg-gray-800/50 dark:hover:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:border-primary/50 text-text-secondary hover:text-primary transition-all rounded-xl text-sm font-medium"
                    >
                      <Globe className="h-4 w-4" />
                      {link.platform}
                      <ExternalLink className="h-3 w-3 inline opacity-50 ml-1" />
                    </a>
                  ))}
                </div>
              )}
            </Motion.div>

            {/* Featured Work / Projects */}
            {projects.length > 0 && (
              <Motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
                className="bg-white dark:bg-surface-dark border border-border-light dark:border-border-dark rounded-3xl p-8"
              >
                <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-100 dark:border-gray-800">
                  <div className="p-2 rounded-xl bg-orange-500/10">
                    <Layers className="h-6 w-6 text-orange-500" />
                  </div>
                  <h2 className="text-2xl font-bold text-text-primary dark:text-white tracking-tight">
                    Products & Ventures
                  </h2>
                </div>
                <div className="grid gap-6">
                  {projects.map((proj, i) => (
                    <div
                      key={i}
                      className="p-6 rounded-2xl bg-gray-50/50 dark:bg-gray-900/30 border border-gray-100 dark:border-gray-800 hover:border-orange-500/30 group transition-all"
                    >
                      <div className="flex justify-between items-start mb-3">
                        <h3 className="text-xl font-bold text-text-primary dark:text-white group-hover:text-orange-500 transition-colors">
                          {proj.name}
                        </h3>
                        {proj.link && (
                          <a
                            href={proj.link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-2 rounded-full hover:bg-black/5 dark:hover:bg-white/10 text-text-tertiary hover:text-text-primary transition-colors"
                          >
                            <ExternalLink className="h-4 w-4" />
                          </a>
                        )}
                      </div>
                      <p className="text-text-secondary dark:text-gray-400 text-sm leading-relaxed">
                        {proj.description}
                      </p>
                    </div>
                  ))}
                </div>
              </Motion.div>
            )}

            {/* Team Members List */}
            {members.length > 0 && (
              <Motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="bg-white dark:bg-surface-dark border border-border-light dark:border-border-dark rounded-3xl p-8"
              >
                <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-100 dark:border-gray-800">
                  <div className="p-2 rounded-xl bg-blue-500/10">
                    <Users className="h-6 w-6 text-blue-500" />
                  </div>
                  <h2 className="text-2xl font-bold text-text-primary dark:text-white tracking-tight">
                    The Team
                  </h2>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-2 gap-4">
                  {members.map((member, i) => (
                    <div
                      key={i}
                      className="flex items-center gap-4 p-4 rounded-2xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 hover:shadow-md transition-shadow"
                    >
                      <img
                        src={
                          member.avatar ||
                          `https://ui-avatars.com/api/?name=${member.first_name}+${member.last_name}&background=random`
                        }
                        alt={`${member.first_name} ${member.last_name}`}
                        className="w-14 h-14 rounded-full object-cover border-2 border-primary/10"
                      />
                      <div>
                        <h4 className="font-bold text-text-primary dark:text-white">
                          {member.first_name} {member.last_name}
                        </h4>
                        <p className="text-xs font-semibold text-primary/80 mt-0.5">
                          {member.designation_title || member.org_role}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </Motion.div>
            )}
          </div>

          {/* RIGHT/SIDE COLUMN */}
          <div className="lg:col-span-4 space-y-8">
            {/* Milestones / History Widget */}
            {milestones.length > 0 && (
              <Motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.3 }}
                className="bg-white dark:bg-surface-dark border border-border-light dark:border-border-dark rounded-3xl p-6"
              >
                <div className="flex items-center gap-2 mb-6">
                  <Briefcase className="h-5 w-5 text-indigo-500" />
                  <h2 className="text-xl font-bold text-text-primary dark:text-white tracking-tight">
                    History
                  </h2>
                </div>
                <div className="space-y-6 relative before:absolute before:inset-0 before:ml-2 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-linear-to-b before:from-transparent before:via-gray-300 dark:before:via-gray-700 before:to-transparent">
                  {milestones.map((m, i) => (
                    <div
                      key={i}
                      className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active"
                    >
                      <div className="flex items-center justify-center w-5 h-5 rounded-full border-4 border-white dark:border-surface-dark bg-indigo-500 shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10 scale-100 transition-transform"></div>
                      <div className="w-[calc(100%-2rem)] md:w-[calc(50%-1.5rem)] pl-4 md:pl-0 md:group-even:text-right">
                        <div className="flex flex-col md:group-even:items-end">
                          <span className="text-xs font-bold bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 px-2.5 py-1 rounded-md mb-2 w-fit">
                            {m.year}
                          </span>
                          <h4 className="font-bold text-text-primary dark:text-white mb-1">
                            {m.title}
                          </h4>
                          <p className="text-xs text-text-secondary dark:text-gray-400">
                            {m.description}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </Motion.div>
            )}

            {/* Achievements / Overview Widget */}
            <Motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="bg-linear-to-br from-gray-900 to-gray-800 dark:from-gray-800 dark:to-gray-950 rounded-3xl p-6 text-white shadow-xl shadow-gray-900/20"
            >
              <div className="flex items-center gap-2 mb-4">
                <Award className="h-5 w-5 text-yellow-400" />
                <h2 className="text-xl font-bold tracking-tight">Overview</h2>
              </div>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 rounded-xl bg-white/5 border border-white/10 backdrop-blur-sm">
                  <span className="text-gray-400 text-sm font-medium">
                    Headquarters
                  </span>
                  <span className="font-bold text-sm">Remote / Global</span>
                </div>
                <div className="flex items-center justify-between p-4 rounded-xl bg-white/5 border border-white/10 backdrop-blur-sm">
                  <span className="text-gray-400 text-sm font-medium">
                    Status
                  </span>
                  <span className="font-bold text-sm text-green-400 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></span>{" "}
                    Active
                  </span>
                </div>
              </div>
            </Motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}
