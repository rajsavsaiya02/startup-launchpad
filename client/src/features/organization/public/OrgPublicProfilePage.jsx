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
  Phone,
  Mail,
  Tag,
  Cpu,
  TrendingUp,
  Crown,
  Star,
  Zap,
  ImageIcon,
  Info,
  Link2,
} from "lucide-react";
import { apiClient, SERVER_URL } from "../../../lib/axios";
import { Button } from "../../../components/ui/Button";
import { cn } from "../../../utils/cn";

const fadeUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.45 },
};

const ROLE_CONFIG = {
  FOUNDER: {
    label: "Founder & CEO",
    icon: Crown,
    color: "from-amber-500 to-orange-500",
    badge: "bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-800",
  },
  "CO-FOUNDER": {
    label: "Co‑Founder",
    icon: Star,
    color: "from-purple-500 to-indigo-600",
    badge: "bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-400 border-purple-200 dark:border-purple-800",
  },
  ADMIN: {
    label: "Admin",
    icon: Zap,
    color: "from-blue-500 to-cyan-500",
    badge: "bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-800",
  },
  MEMBER: {
    label: "Member",
    icon: Users,
    color: "from-green-500 to-emerald-500",
    badge: "bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 border-green-200 dark:border-green-800",
  },
  GUEST: {
    label: "Guest",
    icon: Users,
    color: "from-gray-400 to-gray-500",
    badge: "bg-gray-50 dark:bg-gray-800 text-gray-600 dark:text-gray-400 border-gray-200 dark:border-gray-700",
  },
};

// ─── Leadership Card ─────────────────────────────────────────
function LeaderCard({ member, index }) {
  const cfg = ROLE_CONFIG[member.org_role] || ROLE_CONFIG.MEMBER;
  const Icon = cfg.icon;

  const avatarUrl = member.avatar
    ? member.avatar.startsWith("http") || member.avatar.startsWith("/public")
      ? member.avatar
      : `${SERVER_URL}${member.avatar}`
    : `https://ui-avatars.com/api/?name=${encodeURIComponent(
        member.first_name + "+" + member.last_name,
      )}&background=random&size=200&bold=true&color=fff`;

  return (
    <Motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.08 }}
      className="relative group bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl overflow-hidden hover:shadow-xl hover:shadow-primary/5 transition-all duration-300 hover:-translate-y-0.5"
    >
      {/* Gradient Top Bar */}
      <div className={cn("h-1.5 w-full bg-gradient-to-r", cfg.color)} />

      <div className="p-5 flex items-start gap-4">
        {/* Avatar */}
        <div className="relative flex-shrink-0">
          <div className="h-14 w-14 rounded-xl overflow-hidden border-2 border-white dark:border-gray-800 shadow-md">
            <img
              src={avatarUrl}
              alt={`${member.first_name} ${member.last_name}`}
              className="h-full w-full object-cover"
            />
          </div>
          <div
            className={cn(
              "absolute -bottom-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center border-2 border-white dark:border-gray-900 bg-gradient-to-br",
              cfg.color,
            )}
          >
            <Icon className="h-2.5 w-2.5 text-white" />
          </div>
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <h4 className="font-bold text-text-primary dark:text-white text-base leading-tight truncate">
            {member.first_name} {member.last_name}
          </h4>
          <p className="text-xs text-text-secondary dark:text-gray-400 mt-0.5 leading-snug truncate">
            {member.designation_title || member.department || ""}
          </p>
          <div className="mt-2.5">
            <span
              className={cn(
                "inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider border rounded-full px-2.5 py-0.5",
                cfg.badge,
              )}
            >
              <Icon className="h-2.5 w-2.5" />
              {cfg.label}
            </span>
          </div>
        </div>
      </div>
    </Motion.div>
  );
}

// ─── Member Row ───────────────────────────────────────────────
function MemberRow({ member }) {
  const avatarUrl = member.avatar
    ? member.avatar.startsWith("http") || member.avatar.startsWith("/public")
      ? member.avatar
      : `${SERVER_URL}${member.avatar}`
    : `https://ui-avatars.com/api/?name=${encodeURIComponent(
        member.first_name + "+" + member.last_name,
      )}&background=random&size=80&bold=true&color=fff`;

  const cfg = ROLE_CONFIG[member.org_role] || ROLE_CONFIG.MEMBER;

  return (
    <div className="flex items-center gap-3 p-3 rounded-xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 hover:shadow-sm transition-shadow">
      <img
        src={avatarUrl}
        alt={`${member.first_name} ${member.last_name}`}
        className="w-12 h-12 rounded-full object-cover border-2 border-primary/10"
      />
      <div className="flex-1 min-w-0">
        <h4 className="font-semibold text-sm text-text-primary dark:text-white leading-tight truncate">
          {member.first_name} {member.last_name}
        </h4>
        <p className="text-xs text-text-tertiary truncate">
          {member.designation_title || member.department || member.org_role}
        </p>
      </div>
      <span
        className={cn(
          "hidden sm:flex items-center gap-1 text-[9px] font-bold uppercase tracking-wider border rounded-full px-2 py-0.5 flex-shrink-0",
          cfg.badge,
        )}
      >
        {member.org_role}
      </span>
    </div>
  );
}

// ─── Main Component ──────────────────────────────────────────
export function OrgPublicProfilePage({ overrideSlug }) {
  const { slug: paramSlug } = useParams();
  const slug = overrideSlug || paramSlug;
  const [orgData, setOrgData] = useState(null);
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await apiClient.get(`/org/public/${slug}`);
        const { organization, members } = response.data;
        const publicProfile = organization.public_profile || {};
        if (publicProfile.isPublic === false) {
          setError("This organization profile is currently private.");
        } else {
          setOrgData(organization);
          setMembers(members);
        }
      } catch (err) {
        setError(
          err.response?.status === 404
            ? "Organization not found."
            : "Failed to load organization profile.",
        );
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [slug]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center p-6 text-center">
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

  const {
    public_profile,
    name,
    logo_url,
    brief_description,
    created_at,
  } = orgData;
  const pp = public_profile || {};
  const {
    tagline = "",
    detailed_description = "",
    socialLinks = [],
    projects = [],
    achievements = [],
    milestones = [],
    industry = "",
    stage = "",
    team_size = "",
    website_url = "",
    contact_email = "",
    contact_phone = "",
    hq_location = "",
    hq_address = "",
    gallery = [],
  } = pp;

  // Split members by role
  const leaders = members.filter(
    (m) => m.org_role === "FOUNDER" || m.org_role === "CO-FOUNDER",
  );
  const regularMembers = members.filter(
    (m) => m.org_role !== "FOUNDER" && m.org_role !== "CO-FOUNDER",
  );

  const displayLogoUrl = logo_url
    ? logo_url.startsWith("http")
      ? logo_url
      : `${SERVER_URL}${logo_url}`
    : null;

  return (
    <div className="min-h-screen bg-gray-50/30 dark:bg-[#0a0f1c] pb-24">
      {/* ── Hero Cover ─────────────────────────────────── */}
      <div className="relative h-[220px] md:h-[280px] w-full overflow-hidden bg-gradient-to-br from-primary/90 via-indigo-600 to-purple-700">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10 mix-blend-overlay" />
        <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/4" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-purple-400/20 rounded-full blur-[60px] translate-y-1/2 -translate-x-1/4" />

        <div className="absolute top-5 left-5 z-10">
          <Link to="/">
            <Button
              variant="ghost"
              size="sm"
              className="text-white hover:bg-white/20 shadow-sm border border-white/10 backdrop-blur-md"
            >
              <ChevronLeft className="h-4 w-4 mr-1" />
              Back
            </Button>
          </Link>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 -mt-20 sm:-mt-24 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* ── MAIN COLUMN ────────────────────────────── */}
          <div className="lg:col-span-8 space-y-8">
            {/* Identity Card */}
            <Motion.div {...fadeUp} transition={{ duration: 0.5 }}>
              <div className="bg-white dark:bg-surface-dark border border-border-light dark:border-border-dark rounded-3xl shadow-xl shadow-primary/5 p-7 relative overflow-hidden">
                <div className="flex flex-col sm:flex-row gap-6 items-start">
                  {/* Logo */}
                  <div className="h-28 w-28 rounded-2xl bg-white dark:bg-gray-800 shadow-xl ring-4 ring-white dark:ring-gray-900 flex items-center justify-center overflow-hidden flex-shrink-0 mt-[-52px] sm:mt-0 relative z-10 border border-gray-100 dark:border-gray-700">
                    {displayLogoUrl ? (
                      <img
                        src={displayLogoUrl}
                        alt={name}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <span className="text-5xl font-black text-gray-300 dark:text-gray-600">
                        {name?.charAt(0)}
                      </span>
                    )}
                  </div>

                  {/* Info */}
                  <div className="flex-1 mt-4 sm:mt-0">
                    <div className="flex flex-wrap items-start gap-3 mb-2">
                      <h1 className="text-3xl sm:text-4xl font-black text-text-primary dark:text-white tracking-tight leading-tight">
                        {name}
                      </h1>
                    </div>

                    {tagline && (
                      <p className="text-base font-medium text-primary/80 dark:text-primary italic mb-2">
                        "{tagline}"
                      </p>
                    )}

                    {brief_description && (
                      <p className="text-text-secondary dark:text-gray-300 font-medium leading-relaxed text-sm">
                        {brief_description}
                      </p>
                    )}

                    {/* Chips */}
                    <div className="flex flex-wrap items-center gap-2 mt-4">
                      {created_at && (
                        <Chip icon={Calendar}>
                          Est. {new Date(created_at).getFullYear()}
                        </Chip>
                      )}
                      {hq_location && (
                        <Chip icon={MapPin}>{hq_location}</Chip>
                      )}
                      {industry && (
                        <Chip icon={Cpu}>{industry}</Chip>
                      )}
                      {stage && (
                        <Chip icon={TrendingUp}>{stage}</Chip>
                      )}
                      {team_size && (
                        <Chip icon={Users}>{team_size} people</Chip>
                      )}
                      <Chip icon={Users}>{members.length} members</Chip>
                    </div>
                  </div>
                </div>

                {/* Social Links */}
                {socialLinks.length > 0 && (
                  <div className="mt-6 pt-5 border-t border-gray-100 dark:border-gray-800 flex flex-wrap gap-2">
                    {website_url && (
                      <SocialLink href={website_url} label="Website" />
                    )}
                    {socialLinks.map((link, i) => (
                      <SocialLink key={i} href={link.url} label={link.platform} />
                    ))}
                  </div>
                )}
                {!socialLinks.length && website_url && (
                  <div className="mt-6 pt-5 border-t border-gray-100 dark:border-gray-800">
                    <SocialLink href={website_url} label="Website" />
                  </div>
                )}
              </div>
            </Motion.div>

            {/* ── Leadership Section ──────────────────── */}
            {leaders.length > 0 && (
              <Motion.div {...fadeUp} transition={{ duration: 0.45, delay: 0.08 }}>
                <div className="bg-white dark:bg-surface-dark border border-border-light dark:border-border-dark rounded-3xl p-7">
                  <SectionHead icon={Crown} color="text-amber-500" bg="bg-amber-500/10">
                    Leadership Team
                  </SectionHead>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {leaders.map((m, i) => (
                      <LeaderCard key={i} member={m} index={i} />
                    ))}
                  </div>
                </div>
              </Motion.div>
            )}

            {/* ── About ───────────────────────────────── */}
            {detailed_description && (
              <Motion.div {...fadeUp} transition={{ duration: 0.45, delay: 0.12 }}>
                <div className="bg-white dark:bg-surface-dark border border-border-light dark:border-border-dark rounded-3xl p-7">
                  <SectionHead icon={Info} color="text-primary" bg="bg-primary/10">
                    About {name}
                  </SectionHead>
                  <p className="text-text-secondary dark:text-gray-300 leading-relaxed text-sm whitespace-pre-wrap">
                    {detailed_description}
                  </p>
                </div>
              </Motion.div>
            )}

            {/* ── Gallery ─────────────────────────────── */}
            {gallery.length > 0 && (
              <Motion.div {...fadeUp} transition={{ duration: 0.45, delay: 0.15 }}>
                <div className="bg-white dark:bg-surface-dark border border-border-light dark:border-border-dark rounded-3xl p-7">
                  <SectionHead icon={ImageIcon} color="text-pink-500" bg="bg-pink-500/10">
                    Gallery
                  </SectionHead>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {gallery.map((photo, i) => {
                      const src = photo.url
                        ? photo.url.startsWith("http")
                          ? photo.url
                          : `${SERVER_URL}${photo.url}`
                        : null;
                      if (!src) return null;
                      return (
                        <Motion.div
                          key={i}
                          initial={{ opacity: 0, scale: 0.95 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ delay: i * 0.05 }}
                          className="relative group rounded-xl overflow-hidden aspect-video bg-gray-100 dark:bg-gray-800"
                        >
                          <img
                            src={src}
                            alt={photo.caption || `Gallery ${i + 1}`}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          />
                          {photo.caption && (
                            <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/60 to-transparent p-2 opacity-0 group-hover:opacity-100 transition-opacity">
                              <p className="text-white text-xs font-medium truncate">
                                {photo.caption}
                              </p>
                            </div>
                          )}
                        </Motion.div>
                      );
                    })}
                  </div>
                </div>
              </Motion.div>
            )}

            {/* ── Products & Ventures ─────────────────── */}
            {projects.length > 0 && (
              <Motion.div {...fadeUp} transition={{ duration: 0.45, delay: 0.18 }}>
                <div className="bg-white dark:bg-surface-dark border border-border-light dark:border-border-dark rounded-3xl p-7">
                  <SectionHead icon={Layers} color="text-orange-500" bg="bg-orange-500/10">
                    Products & Ventures
                  </SectionHead>
                  <div className="grid gap-4">
                    {projects.map((proj, i) => (
                      <div
                        key={i}
                        className="p-5 rounded-2xl bg-gray-50/50 dark:bg-gray-900/30 border border-gray-100 dark:border-gray-800 hover:border-orange-400/30 group transition-all"
                      >
                        <div className="flex justify-between items-start mb-2">
                          <h3 className="text-lg font-bold text-text-primary dark:text-white group-hover:text-orange-500 transition-colors">
                            {proj.name}
                          </h3>
                          {proj.link && (
                            <a
                              href={proj.link}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="p-2 rounded-full hover:bg-black/5 dark:hover:bg-white/10 text-text-tertiary hover:text-text-primary transition-colors flex-shrink-0"
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
                </div>
              </Motion.div>
            )}

            {/* ── Team Members ────────────────────────── */}
            {regularMembers.length > 0 && (
              <Motion.div {...fadeUp} transition={{ duration: 0.45, delay: 0.22 }}>
                <div className="bg-white dark:bg-surface-dark border border-border-light dark:border-border-dark rounded-3xl p-7">
                  <SectionHead icon={Users} color="text-blue-500" bg="bg-blue-500/10">
                    The Team ({regularMembers.length})
                  </SectionHead>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {regularMembers.slice(0, 24).map((m, i) => (
                      <MemberRow key={i} member={m} />
                    ))}
                  </div>
                  {regularMembers.length > 24 && (
                    <p className="text-center text-xs text-text-tertiary mt-4">
                      +{regularMembers.length - 24} more team members
                    </p>
                  )}
                </div>
              </Motion.div>
            )}
          </div>

          {/* ── SIDEBAR ────────────────────────────────── */}
          <div className="lg:col-span-4 space-y-6">
            {/* Overview Card */}
            <Motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.45, delay: 0.1 }}
            >
              <div className="bg-gradient-to-br from-gray-900 to-gray-800 dark:from-gray-800 dark:to-gray-950 rounded-3xl p-6 text-white shadow-xl shadow-gray-900/20">
                <div className="flex items-center gap-2 mb-5">
                  <Award className="h-5 w-5 text-yellow-400" />
                  <h2 className="text-lg font-bold tracking-tight">
                    At a Glance
                  </h2>
                </div>

                <div className="space-y-3">
                  <OverviewRow label="Status">
                    <span className="flex items-center gap-1.5 font-bold text-green-400 text-sm">
                      <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
                      Active
                    </span>
                  </OverviewRow>

                  {industry && (
                    <OverviewRow label="Industry">
                      <span className="text-sm font-semibold">{industry}</span>
                    </OverviewRow>
                  )}

                  {stage && (
                    <OverviewRow label="Stage">
                      <span className="text-sm font-semibold">{stage}</span>
                    </OverviewRow>
                  )}

                  {team_size && (
                    <OverviewRow label="Team Size">
                      <span className="text-sm font-semibold">{team_size}</span>
                    </OverviewRow>
                  )}

                  {hq_location && (
                    <OverviewRow label="Headquarters">
                      <span className="text-sm font-semibold">{hq_location}</span>
                    </OverviewRow>
                  )}

                  {created_at && (
                    <OverviewRow label="Founded">
                      <span className="text-sm font-semibold">
                        {new Date(created_at).getFullYear()}
                      </span>
                    </OverviewRow>
                  )}

                  <OverviewRow label="Members">
                    <span className="text-sm font-semibold">
                      {members.length} people
                    </span>
                  </OverviewRow>
                </div>
              </div>
            </Motion.div>

            {/* Contact Card */}
            {(contact_email || contact_phone || website_url || hq_address) && (
              <Motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.45, delay: 0.18 }}
              >
                <div className="bg-white dark:bg-surface-dark border border-border-light dark:border-border-dark rounded-3xl p-6">
                  <div className="flex items-center gap-2 mb-5">
                    <div className="p-2 rounded-xl bg-primary/10">
                      <Mail className="h-4 w-4 text-primary" />
                    </div>
                    <h2 className="text-base font-bold text-text-primary dark:text-white">
                      Contact
                    </h2>
                  </div>

                  <div className="space-y-3">
                    {website_url && (
                      <ContactItem icon={Globe}>
                        <a
                          href={website_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-primary hover:underline text-sm font-medium truncate"
                        >
                          {website_url.replace(/^https?:\/\//, "")}
                        </a>
                      </ContactItem>
                    )}
                    {contact_email && (
                      <ContactItem icon={Mail}>
                        <a
                          href={`mailto:${contact_email}`}
                          className="text-text-secondary dark:text-gray-300 hover:text-primary text-sm truncate"
                        >
                          {contact_email}
                        </a>
                      </ContactItem>
                    )}
                    {contact_phone && (
                      <ContactItem icon={Phone}>
                        <a
                          href={`tel:${contact_phone}`}
                          className="text-text-secondary dark:text-gray-300 hover:text-primary text-sm"
                        >
                          {contact_phone}
                        </a>
                      </ContactItem>
                    )}
                    {hq_address && (
                      <ContactItem icon={MapPin}>
                        <span className="text-text-secondary dark:text-gray-300 text-sm">
                          {hq_address}
                        </span>
                      </ContactItem>
                    )}
                  </div>
                </div>
              </Motion.div>
            )}

            {/* Achievements */}
            {achievements.length > 0 && (
              <Motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.45, delay: 0.25 }}
              >
                <div className="bg-white dark:bg-surface-dark border border-border-light dark:border-border-dark rounded-3xl p-6">
                  <div className="flex items-center gap-2 mb-5">
                    <div className="p-2 rounded-xl bg-yellow-500/10">
                      <Award className="h-4 w-4 text-yellow-500" />
                    </div>
                    <h2 className="text-base font-bold text-text-primary dark:text-white">
                      Awards & Recognition
                    </h2>
                  </div>
                  <div className="space-y-3">
                    {achievements.map((ach, i) => (
                      <div key={i} className="flex gap-3 items-start">
                        <div className="w-6 h-6 rounded-full bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 flex items-center justify-center flex-shrink-0 mt-0.5">
                          <Award className="h-3 w-3 text-yellow-500" />
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-bold text-text-primary dark:text-white leading-tight">
                            {ach.title}
                          </p>
                          {ach.year && (
                            <span className="text-[10px] font-bold text-yellow-600 dark:text-yellow-500">
                              {ach.year}
                            </span>
                          )}
                          {ach.description && (
                            <p className="text-xs text-text-tertiary mt-0.5">
                              {ach.description}
                            </p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </Motion.div>
            )}

            {/* Milestones / History */}
            {milestones.length > 0 && (
              <Motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.45, delay: 0.3 }}
              >
                <div className="bg-white dark:bg-surface-dark border border-border-light dark:border-border-dark rounded-3xl p-6">
                  <div className="flex items-center gap-2 mb-5">
                    <div className="p-2 rounded-xl bg-indigo-500/10">
                      <Briefcase className="h-4 w-4 text-indigo-500" />
                    </div>
                    <h2 className="text-base font-bold text-text-primary dark:text-white">
                      Milestones
                    </h2>
                  </div>

                  <div className="space-y-4 relative before:absolute before:left-[9px] before:top-2 before:bottom-2 before:w-0.5 before:bg-gradient-to-b before:from-indigo-500 before:via-indigo-200 before:to-transparent dark:before:via-indigo-900">
                    {milestones.map((m, i) => (
                      <div key={i} className="flex gap-4 items-start pl-6 relative">
                        <div className="absolute left-0 top-1 w-[18px] h-[18px] rounded-full border-4 border-white dark:border-surface-dark bg-indigo-500 shadow z-10" />
                        <div className="flex-1 min-w-0">
                          <span className="text-[10px] font-bold bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 px-2 py-0.5 rounded-md">
                            {m.year}
                          </span>
                          <h4 className="font-bold text-text-primary dark:text-white text-sm mt-1">
                            {m.title}
                          </h4>
                          {m.description && (
                            <p className="text-xs text-text-secondary dark:text-gray-400 mt-0.5 leading-relaxed">
                              {m.description}
                            </p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </Motion.div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Micro components ────────────────────────────────────────
function Chip({ icon: Icon, children }) {
  return (
    <div className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 dark:bg-gray-800 rounded-lg text-sm text-text-tertiary">
      <Icon className="h-3.5 w-3.5" />
      <span className="text-xs font-medium">{children}</span>
    </div>
  );
}

function SocialLink({ href, label }) {
  if (!href) return null;
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="flex items-center gap-2 px-3 py-1.5 bg-gray-50 hover:bg-gray-100 dark:bg-gray-800/50 dark:hover:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:border-primary/40 text-text-secondary hover:text-primary transition-all rounded-xl text-xs font-semibold"
    >
      <Globe className="h-3.5 w-3.5" />
      {label}
      <ExternalLink className="h-2.5 w-2.5 opacity-50" />
    </a>
  );
}

function SectionHead({ icon: Icon, color, bg, children }) {
  return (
    <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-100 dark:border-gray-800">
      <div className={cn("p-2 rounded-xl", bg)}>
        <Icon className={cn("h-5 w-5", color)} />
      </div>
      <h2 className="text-xl font-bold text-text-primary dark:text-white tracking-tight">
        {children}
      </h2>
    </div>
  );
}

function OverviewRow({ label, children }) {
  return (
    <div className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/10">
      <span className="text-gray-400 text-xs font-medium">{label}</span>
      {children}
    </div>
  );
}

function ContactItem({ icon: Icon, children }) {
  return (
    <div className="flex items-start gap-3">
      <div className="w-7 h-7 rounded-lg bg-primary/5 dark:bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
        <Icon className="h-3.5 w-3.5 text-primary" />
      </div>
      <div className="flex-1 min-w-0">{children}</div>
    </div>
  );
}
