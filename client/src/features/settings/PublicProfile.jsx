import React, { useState, useEffect } from "react";
import { motion as Motion } from "framer-motion";
import {
  User,
  Briefcase,
  GraduationCap,
  MapPin,
  Link as LinkIcon,
  Github,
  Linkedin,
  Twitter,
  Globe,
  Plus,
  Trash2,
  Eye,
  EyeOff,
  Edit3,
  Save,
  Check,
  X,
  Share2,
  Award,
  Calendar,
  Building,
  Mail,
  Phone,
  Loader2,
  Layers,
  Lock,
  Unlock,
  ExternalLink,
} from "lucide-react";
import { Button } from "../../components/ui/Button";
import { Input } from "../../components/ui/Input";
import { Avatar } from "../../components/ui/Avatar";
import { ImageUpload } from "../../components/ui/ImageUpload";
import { Card } from "../../components/ui/Card";
import { Badge } from "../../components/ui/Badge";
import { cn } from "../../utils/cn";
import { apiClient } from "../../lib/axios";
import { useAuth } from "../../context/AuthContext";
import { toast } from "react-toastify";

export function PublicProfile() {
  const { updateUser } = useAuth();
  const [mode, setMode] = useState("edit"); // 'edit' | 'preview'

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [publicAvatarFile, setPublicAvatarFile] = useState(null);

  // Initial Form State
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    headline: "",
    occupation: "",
    bio: "",
    location: "",
    website: "",
    avatar_url: "", // The public profile avatar override (column: public_profile_avatar)
    main_avatar_url: "", // Store main account avatar for fallback (column: avatar)
    isPublic: true,
    social_github: "",
    social_linkedin: "",
    social_website: "",
    // Dynamic Sections (stored in public_profile JSONB)
    experiences: [],
    education: [],
    projects: [],
    achievements: [],
    socialLinks: [],
    skills: [],
  });

  // Fetch User Data on Mount
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await apiClient.get("/users/me");
        const userData = response.data;

        // Sync with backend structure: 
        // 1. userData.public_profile_avatar (The override)
        // 2. userData.avatar_url / userData.avatar (The main account avatar)
        const publicProfile = userData.public_profile || {};
        const publicAvatar = userData.public_profile_avatar || "";
        const mainAvatar = userData.avatar_url || userData.avatar || "";

        // ── Normalise helpers ─────────────────────────────────────────────
        // Each item must have a stable unique `id` for React list keys.
        // The seeder may use different field names (dates, desc, url, title)
        // than the form (duration, description, link, name).
        let _uid = 0;
        const ensureId = (item) =>
          item && item.id
            ? item
            : { ...item, id: `pp-${Date.now()}-${++_uid}` };

        const normaliseExp = (exp) => ({
          ...ensureId(exp),
          duration: exp.duration ?? exp.dates ?? "",
          description: exp.description ?? exp.desc ?? "",
        });

        const normaliseEdu = (edu) => ({
          ...ensureId(edu),
          // year: take last part of a "YYYY - YYYY" dates string, or edu.year
          year:
            edu.year ??
            (edu.dates ? String(edu.dates).split("-").at(-1).trim() : ""),
        });

        // achievements may be plain strings ("Forbes 30...") or objects
        const normaliseAch = (ach) => {
          if (typeof ach === "string") {
            return {
              id: `pp-${Date.now()}-${++_uid}`,
              title: ach,
              date: "",
              description: "",
            };
          }
          return { description: "", date: "", ...ensureId(ach) };
        };

        // portfolio / projects: seeded as { title, url } → form uses { name, link }
        const normaliseProject = (proj) => ({
          description: "",
          ...ensureId(proj),
          name: proj.name ?? proj.title ?? "",
          link: proj.link ?? proj.url ?? "",
        });

        setFormData({
          firstName: userData.first_name || "",
          lastName: userData.last_name || "",
          headline: publicProfile.headline || userData.job_title || "",
          occupation:
            userData.role === "founder"
              ? "Founder"
              : publicProfile.occupation || userData.job_title || "",
          bio: userData.bio || "",
          location: userData.location || "",
          website: userData.social_website || publicProfile.website || "",
          avatar_url: publicAvatar, // Specifically the override
          main_avatar_url: mainAvatar, // Specifically the main account photo
          isPublic:
            publicProfile.isPublic !== undefined
              ? publicProfile.isPublic
              : true,

          // Normalise every dynamic section (handle both seeded & user-entered data)
          experiences: (
            publicProfile.experiences ||
            publicProfile.experience ||
            []
          ).map(normaliseExp),
          education: (publicProfile.education || []).map(normaliseEdu),
          projects: (
            publicProfile.projects ||
            publicProfile.portfolio ||
            []
          ).map(normaliseProject),
          achievements: (publicProfile.achievements || []).map(normaliseAch),
          socialLinks: (publicProfile.socialLinks || []).map(ensureId),
          skills: userData.skills || [],
        });
      } catch (error) {
        console.error("Error fetching profile:", error);
        toast.error("Failed to load profile data");
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  const handleInputChange = (field, value) => {
    setFormData({ ...formData, [field]: value });
  };

  // Helper for Dynamic Lists
  const updateItem = (section, id, field, value) => {
    setFormData({
      ...formData,
      [section]: formData[section].map((item) =>
        item.id === id ? { ...item, [field]: value } : item,
      ),
    });
  };

  const addItem = (section, template) => {
    setFormData({
      ...formData,
      [section]: [
        ...formData[section],
        { ...template, id: Date.now().toString() },
      ],
    });
  };

  const removeItem = (section, id) => {
    setFormData({
      ...formData,
      [section]: formData[section].filter((item) => item.id !== id),
    });
  };

  // Skill Helpers
  const handleSkillAdd = (e) => {
    if (e.key === "Enter" && e.target.value) {
      if (!formData.skills.includes(e.target.value)) {
        setFormData({
          ...formData,
          skills: [...formData.skills, e.target.value],
        });
      }
      e.target.value = "";
    }
  };

  const handleSkillRemove = (skillToRemove) => {
    setFormData({
      ...formData,
      skills: formData.skills.filter((skill) => skill !== skillToRemove),
    });
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      let finalAvatarUrl = formData.avatar_url;

      // Upload new avatar if selected
      if (publicAvatarFile) {
        const uploadFormData = new FormData();
        uploadFormData.append("file", publicAvatarFile);
        uploadFormData.append("visibility", "public");

        const uploadRes = await apiClient.post(
          "/files/upload",
          uploadFormData,
          {
            headers: { "Content-Type": "multipart/form-data" },
          },
        );
        finalAvatarUrl = uploadRes.data.file.url;
      }

      // Construct the payload matching the backend expectation
      // We accept flat fields for the main user table AND a public_profile object for the dynamic stuff
      const payload = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        bio: formData.bio,
        location: formData.location,
        social_website: formData.website,
        job_title: formData.headline, // sync headline to job_title
        skills: formData.skills,
        public_profile_avatar: finalAvatarUrl, // TOP LEVEL COLUMN

        // This object goes into the JSONB column
        public_profile: {
          occupation: formData.occupation,
          experiences: formData.experiences,
          education: formData.education,
          projects: formData.projects,
          achievements: formData.achievements,
          socialLinks: formData.socialLinks,
          isPublic: formData.isPublic,
          // avatar_url is NO LONGER inside the JSONB, it's a top level column
        },
      };

      const response = await apiClient.put("/users/profile", payload);

      // Update local user context if needed
      if (updateUser) {
        updateUser(response.data.user);
      }

      // Update state to reflect saved changes
      setPublicAvatarFile(null); // Clear file after upload
      setFormData((prev) => ({
        ...prev,
        avatar_url: finalAvatarUrl, // Ensure View reflects what was saved
      }));

      toast.success("Profile updated successfully");
      setMode("preview");
    } catch (error) {
      console.error("Error saving profile:", error);
      toast.error("Failed to save changes");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // --- RENDER HELPERS ---

  const renderEditForm = () => (
    <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 animate-in fade-in duration-500 w-full relative z-10">
      {/* LEFT COLUMN: Basic Info (Sticky on Large Screens) */}
      <div className="xl:col-span-4 space-y-6">
        <Motion.div
          className="sticky top-24 space-y-6"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
        >
          <Card className="p-8 border-primary/5 dark:border-border-dark shadow-2xl shadow-primary/5 rounded-4xl bg-white/80 dark:bg-surface-dark/80 backdrop-blur-xl group overflow-hidden relative">
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 blur-3xl rounded-full -translate-y-1/2 translate-x-1/2 group-hover:bg-primary/10 transition-colors duration-500" />
            <div className="flex justify-between items-center mb-6 border-b border-gray-100/50 dark:border-gray-800/50 pb-4">
              <h3 className="text-xl font-bold text-text-primary dark:text-white tracking-tight flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-primary" /> Identity
              </h3>

              {/* Premium Visibility Toggle */}
              <div
                className={cn(
                  "relative flex items-center justify-between p-1 rounded-full cursor-pointer transition-all duration-500 w-32",
                  formData.isPublic
                    ? "bg-green-50 dark:bg-green-900/20 border border-green-100/50 dark:border-green-800/50"
                    : "bg-gray-50 dark:bg-gray-800/50 border border-gray-200/50 dark:border-gray-700/50",
                )}
                onClick={() =>
                  handleInputChange("isPublic", !formData.isPublic)
                }
              >
                <Motion.div
                  className={cn(
                    "absolute h-7 w-[48%] rounded-full shadow-lg z-10",
                    formData.isPublic ? "bg-green-500" : "bg-gray-400",
                  )}
                  animate={{ x: formData.isPublic ? "100%" : "0%" }}
                  transition={{ type: "spring", stiffness: 300, damping: 30 }}
                />
                <span
                  className={cn(
                    "relative z-20 w-1/2 text-[10px] font-bold text-center uppercase tracking-wider flex items-center justify-center gap-1",
                    !formData.isPublic ? "text-white" : "text-gray-400",
                  )}
                >
                  <Lock className="h-2.5 w-2.5" /> Off
                </span>
                <span
                  className={cn(
                    "relative z-20 w-1/2 text-[10px] font-bold text-center uppercase tracking-wider flex items-center justify-center gap-1",
                    formData.isPublic ? "text-white" : "text-gray-400",
                  )}
                >
                  <Unlock className="h-2.5 w-2.5" /> Pub
                </span>
              </div>
            </div>
            <div className="space-y-6 relative z-10">
              <div className="flex flex-col items-center mb-8">
                <div className="relative group/avatar w-40 h-40">
                  <ImageUpload
                    value={formData.avatar_url}
                    fallbackUrl={formData.main_avatar_url}
                    onChange={(file) => {
                      if (file) {
                        setPublicAvatarFile(file);
                        // No need to manually update avatar_url here as ImageUpload 
                        // handles the preview and we set it on save.
                      } else {
                        setPublicAvatarFile(null);
                        setFormData((prev) => ({
                          ...prev,
                          avatar_url: null, // Clear the override
                        }));
                      }
                    }}
                    className="mx-auto"
                  />
                  {/* Overlay for indication if it's the main avatar or custom? 
                      Maybe not needed as the ImageUpload itself shows what's there. 
                  */}
                </div>
                {!formData.avatar_url && formData.main_avatar_url && (
                  <p className="text-xs text-text-tertiary mt-2 text-center">
                    Using main profile photo.
                    <br />
                    Upload to override.
                  </p>
                )}
                {formData.avatar_url && (
                  <p className="text-xs text-primary mt-2 text-center font-bold">
                    Custom public photo active.
                    <br />
                    <span className="font-normal text-text-tertiary">Visible only on your public profile.</span>
                  </p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold uppercase tracking-wider text-text-tertiary px-1">
                    First Name
                  </label>
                  <Input
                    value={formData.firstName}
                    className="bg-gray-50/50 dark:bg-gray-900/30 border-gray-100/50 dark:border-gray-800/50 rounded-xl"
                    onChange={(e) =>
                      handleInputChange("firstName", e.target.value)
                    }
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold uppercase tracking-wider text-text-tertiary px-1">
                    Last Name
                  </label>
                  <Input
                    value={formData.lastName}
                    className="bg-gray-50/50 dark:bg-gray-900/30 border-gray-100/50 dark:border-gray-800/50 rounded-xl"
                    onChange={(e) =>
                      handleInputChange("lastName", e.target.value)
                    }
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] font-bold uppercase tracking-wider text-text-tertiary px-1">
                  Professional Headline
                </label>
                <Input
                  placeholder="e.g. Chief Technology Officer"
                  value={formData.headline}
                  className="bg-gray-50/50 dark:bg-gray-900/30 border-gray-100/50 dark:border-gray-800/50 rounded-xl"
                  onChange={(e) =>
                    handleInputChange("headline", e.target.value)
                  }
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] font-bold uppercase tracking-wider text-text-tertiary px-1">
                  Current Occupation
                </label>
                <Input
                  placeholder="e.g. Founder @ TechScale"
                  value={formData.occupation}
                  className="bg-gray-50/50 dark:bg-gray-900/30 border-gray-100/50 dark:border-gray-800/50 rounded-xl"
                  onChange={(e) =>
                    handleInputChange("occupation", e.target.value)
                  }
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] font-bold uppercase tracking-wider text-text-tertiary px-1">
                  Short Bio
                </label>
                <textarea
                  className="w-full rounded-2xl border border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-900/30 p-4 text-sm h-36 focus:ring-4 focus:ring-primary/5 dark:text-white resize-none transition-all outline-none"
                  placeholder="Tell your professional story..."
                  value={formData.bio}
                  onChange={(e) => handleInputChange("bio", e.target.value)}
                />
              </div>

              <div className="grid grid-cols-1 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold uppercase tracking-wider text-text-tertiary px-1">
                    Location
                  </label>
                  <div className="relative">
                    <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-text-tertiary" />
                    <input
                      className="w-full pl-10 pr-4 h-11 rounded-xl border border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-900/30 text-sm focus:ring-4 focus:ring-primary/5 outline-none transition-all"
                      placeholder="City, Country"
                      value={formData.location}
                      onChange={(e) =>
                        handleInputChange("location", e.target.value)
                      }
                    />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold uppercase tracking-wider text-text-tertiary px-1">
                    Personal Website
                  </label>
                  <div className="relative">
                    <Globe className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-text-tertiary" />
                    <input
                      className="w-full pl-10 pr-4 h-11 rounded-xl border border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-900/30 text-sm focus:ring-4 focus:ring-primary/5 outline-none transition-all"
                      placeholder="https://yourpage.com"
                      value={formData.website}
                      onChange={(e) =>
                        handleInputChange("website", e.target.value)
                      }
                    />
                  </div>
                </div>
              </div>
            </div>
          </Card>

          <Card className="p-8 border-primary/5 dark:border-border-dark shadow-2xl shadow-primary/5 rounded-4xl bg-white/80 dark:bg-surface-dark/80 backdrop-blur-xl relative overflow-hidden group">
            <h3 className="text-xl font-bold text-text-primary dark:text-white mb-6 border-b border-gray-100/50 dark:border-gray-800/50 pb-4 flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-primary/5">
                <Award className="h-5 w-5 text-primary" />
              </div>
              Skills & Expertise
            </h3>
            <div className="flex flex-wrap gap-2 mb-2 p-3 bg-gray-50 dark:bg-gray-800/50 border border-border-light dark:border-border-dark rounded-lg min-h-12">
              {formData.skills.map((skill) => (
                <Badge
                  key={skill}
                  variant="secondary"
                  className="gap-1 pr-1 bg-white dark:bg-gray-700 shadow-sm"
                >
                  {skill}
                  <button
                    onClick={() => handleSkillRemove(skill)}
                    className="hover:bg-gray-200 dark:hover:bg-gray-600 rounded-full p-0.5 transition-colors"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              ))}
              <input
                type="text"
                className="bg-transparent border-none focus:ring-0 text-sm min-w-[120px] flex-1"
                placeholder="Type & press Enter..."
                onKeyDown={handleSkillAdd}
              />
            </div>
          </Card>

          <Card className="p-8 border-primary/5 dark:border-border-dark shadow-2xl shadow-primary/5 rounded-4xl bg-white/80 dark:bg-surface-dark/80 backdrop-blur-xl group overflow-hidden relative">
            <div className="flex justify-between items-center mb-6 border-b border-gray-100/50 dark:border-gray-800/50 pb-4">
              <h3 className="text-xl font-bold text-text-primary dark:text-white flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-primary/5">
                  <Linkedin className="h-5 w-5 text-primary" />
                </div>
                Connect
              </h3>
              <Button
                size="xs"
                variant="ghost"
                onClick={() =>
                  addItem("socialLinks", { platform: "", url: "" })
                }
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            <div className="space-y-3">
              {formData.socialLinks.map((link) => (
                <div key={link.id} className="flex gap-2 items-center">
                  <div className="w-1/3">
                    <Input
                      placeholder="Platform"
                      className="h-9 text-sm"
                      value={link.platform}
                      onChange={(e) =>
                        updateItem(
                          "socialLinks",
                          link.id,
                          "platform",
                          e.target.value,
                        )
                      }
                    />
                  </div>
                  <div className="flex-1">
                    <Input
                      type="url"
                      placeholder="URL"
                      className="h-9 text-sm"
                      value={link.url}
                      onChange={(e) =>
                        updateItem(
                          "socialLinks",
                          link.id,
                          "url",
                          e.target.value,
                        )
                      }
                    />
                  </div>
                  <button
                    onClick={() => removeItem("socialLinks", link.id)}
                    className="text-gray-400 hover:text-red-500 p-1"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          </Card>
        </Motion.div>
      </div>

      {/* RIGHT COLUMN: Dynamic Sections */}
      <div className="xl:col-span-8 space-y-8">
        {/* Work Experience */}
        <Motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <Card className="p-10 border-primary/5 dark:border-border-dark shadow-2xl shadow-primary/5 rounded-4xl bg-white/80 dark:bg-surface-dark/80 backdrop-blur-xl group relative overflow-hidden">
            <div className="absolute -top-20 -right-20 w-64 h-64 bg-primary/5 rounded-full blur-3xl opacity-50 transition-all duration-700 group-hover:scale-110" />
            <div className="flex justify-between items-center mb-10 relative z-10">
              <h3 className="text-2xl font-bold text-text-primary dark:text-white tracking-tight flex items-center gap-4">
                <div className="p-3 rounded-2xl bg-primary/5 text-primary">
                  <Briefcase className="h-7 w-7" />
                </div>
                Work Experience
              </h3>
              <Button
                size="sm"
                variant="outline"
                onClick={() =>
                  addItem("experiences", {
                    role: "",
                    company: "",
                    duration: "",
                    description: "",
                  })
                }
              >
                <Plus className="h-4 w-4 mr-1" /> Add Role
              </Button>
            </div>
            <div className="space-y-6">
              {formData.experiences.map((exp) => (
                <div
                  key={exp.id}
                  className="p-5 rounded-xl bg-gray-50 dark:bg-gray-800/30 border border-gray-100 dark:border-gray-800 relative group transition-all hover:shadow-md"
                >
                  <div className="grid grid-cols-1 md:grid-cols-12 gap-4 mb-4">
                    <div className="md:col-span-5">
                      <label className="text-xs font-medium text-gray-500 mb-1 block">
                        Role
                      </label>
                      <Input
                        placeholder="e.g. Senior Product Manager"
                        value={exp.role}
                        className="bg-white dark:bg-gray-800"
                        onChange={(e) =>
                          updateItem(
                            "experiences",
                            exp.id,
                            "role",
                            e.target.value,
                          )
                        }
                      />
                    </div>
                    <div className="md:col-span-4">
                      <label className="text-xs font-medium text-gray-500 mb-1 block">
                        Company
                      </label>
                      <Input
                        placeholder="e.g. Google"
                        value={exp.company}
                        className="bg-white dark:bg-gray-800"
                        onChange={(e) =>
                          updateItem(
                            "experiences",
                            exp.id,
                            "company",
                            e.target.value,
                          )
                        }
                      />
                    </div>
                    <div className="md:col-span-3">
                      <label className="text-xs font-medium text-gray-500 mb-1 block">
                        Period
                      </label>
                      <Input
                        placeholder="e.g. 2020 - Present"
                        value={exp.duration}
                        className="bg-white dark:bg-gray-800"
                        onChange={(e) =>
                          updateItem(
                            "experiences",
                            exp.id,
                            "duration",
                            e.target.value,
                          )
                        }
                      />
                    </div>
                  </div>

                  <textarea
                    className="w-full rounded-lg border border-border-light bg-white dark:bg-gray-800 p-3 text-sm h-24 focus:ring-2 focus:ring-primary/20 dark:border-gray-700 dark:text-white resize-none"
                    placeholder="Describe your key responsibilities and achievements..."
                    value={exp.description}
                    onChange={(e) =>
                      updateItem(
                        "experiences",
                        exp.id,
                        "description",
                        e.target.value,
                      )
                    }
                  />
                  <button
                    onClick={() => removeItem("experiences", exp.id)}
                    className="absolute top-3 right-3 text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity p-1 bg-white dark:bg-gray-800 rounded-md shadow-sm border border-gray-100"
                    title="Remove"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ))}
              {formData.experiences.length === 0 && (
                <div className="text-center py-8 border-2 border-dashed border-gray-200 dark:border-gray-800 rounded-xl">
                  <Briefcase className="h-8 w-8 text-gray-300 mx-auto mb-2" />
                  <p className="text-text-tertiary text-sm">
                    Add your professional experience to showcase your career
                    path.
                  </p>
                </div>
              )}
            </div>
          </Card>
        </Motion.div>

        {/* Projects */}
        <Motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <Card className="p-10 border-primary/5 dark:border-border-dark shadow-2xl shadow-primary/5 rounded-4xl bg-white/80 dark:bg-surface-dark/80 backdrop-blur-xl group relative overflow-hidden">
            <div className="absolute -bottom-20 -left-20 w-64 h-64 bg-primary/5 rounded-full blur-3xl opacity-50 transition-all duration-700 group-hover:scale-110" />
            <div className="flex justify-between items-center mb-10 relative z-10">
              <h3 className="text-2xl font-bold text-text-primary dark:text-white tracking-tight flex items-center gap-4">
                <div className="p-3 rounded-2xl bg-primary/5 text-primary">
                  <Layers className="h-7 w-7" />
                </div>
                Featured Work
              </h3>
              <Button
                size="sm"
                variant="outline"
                onClick={() =>
                  addItem("projects", { name: "", link: "", description: "" })
                }
              >
                <Plus className="h-4 w-4 mr-1" /> Add Project
              </Button>
            </div>
            <div className="space-y-6">
              {formData.projects.map((proj) => (
                <div
                  key={proj.id}
                  className="p-5 rounded-xl bg-gray-50 dark:bg-gray-800/30 border border-gray-100 dark:border-gray-800 relative group transition-all hover:shadow-md"
                >
                  <div className="grid grid-cols-1 md:grid-cols-12 gap-4 mb-4">
                    <div className="md:col-span-6">
                      <label className="text-xs font-medium text-gray-500 mb-1 block">
                        Project Name
                      </label>
                      <Input
                        placeholder="e.g. Analytics Dashboard"
                        value={proj.name}
                        className="bg-white dark:bg-gray-800"
                        onChange={(e) =>
                          updateItem(
                            "projects",
                            proj.id,
                            "name",
                            e.target.value,
                          )
                        }
                      />
                    </div>
                    <div className="md:col-span-6">
                      <label className="text-xs font-medium text-gray-500 mb-1 block">
                        Link
                      </label>
                      <Input
                        placeholder="https://..."
                        value={proj.link}
                        className="bg-white dark:bg-gray-800"
                        onChange={(e) =>
                          updateItem(
                            "projects",
                            proj.id,
                            "link",
                            e.target.value,
                          )
                        }
                      />
                    </div>
                  </div>

                  <textarea
                    className="w-full rounded-lg border border-border-light bg-white dark:bg-gray-800 p-3 text-sm h-24 focus:ring-2 focus:ring-primary/20 dark:border-gray-700 dark:text-white resize-none"
                    placeholder="Describe the project impact and technologies used..."
                    value={proj.description}
                    onChange={(e) =>
                      updateItem(
                        "projects",
                        proj.id,
                        "description",
                        e.target.value,
                      )
                    }
                  />
                  <button
                    onClick={() => removeItem("projects", proj.id)}
                    className="absolute top-3 right-3 text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity p-1 bg-white dark:bg-gray-800 rounded-md shadow-sm border border-gray-100"
                    title="Remove"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ))}
              {formData.projects.length === 0 && (
                <div className="text-center py-8 border-2 border-dashed border-gray-200 dark:border-gray-800 rounded-xl">
                  <Layers className="h-8 w-8 text-gray-300 mx-auto mb-2" />
                  <p className="text-text-tertiary text-sm">
                    Add items to showcase your featured work and achievements.
                  </p>
                </div>
              )}
            </div>
          </Card>
        </Motion.div>

        {/* Education */}
        <Motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          <Card className="p-10 border-primary/5 dark:border-border-dark shadow-2xl shadow-primary/5 rounded-4xl bg-white/80 dark:bg-surface-dark/80 backdrop-blur-xl group relative overflow-hidden">
            <div className="absolute top-[-10%] right-[-10%] w-48 h-48 bg-blue-500/5 rounded-full blur-3xl opacity-50 transition-all duration-700 group-hover:scale-110" />
            <div className="flex justify-between items-center mb-10 relative z-10">
              <h3 className="text-2xl font-bold text-text-primary dark:text-white tracking-tight flex items-center gap-4">
                <div className="p-3 rounded-2xl bg-primary/5 text-primary">
                  <GraduationCap className="h-7 w-7" />
                </div>
                Education
              </h3>
              <Button
                size="sm"
                variant="outline"
                onClick={() =>
                  addItem("education", {
                    school: "",
                    degree: "",
                    year: "",
                    description: "",
                  })
                }
              >
                <Plus className="h-4 w-4 mr-1" /> Add Education
              </Button>
            </div>
            <div className="space-y-4">
              {formData.education.map((edu) => (
                <div
                  key={edu.id}
                  className="p-5 rounded-xl bg-gray-50 dark:bg-gray-800/30 border border-gray-100 dark:border-gray-800 relative group transition-all hover:shadow-md"
                >
                  <div className="grid grid-cols-1 md:grid-cols-12 gap-4 mb-4">
                    <div className="md:col-span-5">
                      <label className="text-xs font-medium text-gray-500 mb-1 block">
                        Institution
                      </label>
                      <Input
                        placeholder="e.g. Stanford University"
                        value={edu.school}
                        className="bg-white dark:bg-gray-800"
                        onChange={(e) =>
                          updateItem(
                            "education",
                            edu.id,
                            "school",
                            e.target.value,
                          )
                        }
                      />
                    </div>
                    <div className="md:col-span-5">
                      <label className="text-xs font-medium text-gray-500 mb-1 block">
                        Degree
                      </label>
                      <Input
                        placeholder="e.g. BS Computer Science"
                        value={edu.degree}
                        className="bg-white dark:bg-gray-800"
                        onChange={(e) =>
                          updateItem(
                            "education",
                            edu.id,
                            "degree",
                            e.target.value,
                          )
                        }
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className="text-xs font-medium text-gray-500 mb-1 block">
                        Year
                      </label>
                      <Input
                        placeholder="2020"
                        value={edu.year}
                        className="bg-white dark:bg-gray-800"
                        onChange={(e) =>
                          updateItem(
                            "education",
                            edu.id,
                            "year",
                            e.target.value,
                          )
                        }
                      />
                    </div>
                  </div>
                  <button
                    onClick={() => removeItem("education", edu.id)}
                    className="absolute top-3 right-3 text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity p-1 bg-white dark:bg-gray-800 rounded-md shadow-sm border border-gray-100"
                    title="Remove"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ))}
              {formData.education.length === 0 && (
                <div className="text-center py-8 border-2 border-dashed border-gray-200 dark:border-gray-800 rounded-xl">
                  <GraduationCap className="h-8 w-8 text-gray-300 mx-auto mb-2" />
                  <p className="text-text-tertiary text-sm">
                    Add your educational background.
                  </p>
                </div>
              )}
            </div>
          </Card>
        </Motion.div>

        {/* Achievements */}
        <Motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.5 }}
        >
          <Card className="p-10 border-primary/5 dark:border-border-dark shadow-2xl shadow-primary/5 rounded-4xl bg-white/80 dark:bg-surface-dark/80 backdrop-blur-xl group relative overflow-hidden">
            <div className="absolute bottom-[-10%] right-[-10%] w-48 h-48 bg-yellow-500/5 rounded-full blur-3xl opacity-50 transition-all duration-700 group-hover:scale-110" />
            <div className="flex justify-between items-center mb-10 relative z-10">
              <h3 className="text-2xl font-bold text-text-primary dark:text-white tracking-tight flex items-center gap-4">
                <div className="p-3 rounded-2xl bg-primary/5 text-primary">
                  <Award className="h-7 w-7" />
                </div>
                Achievements
              </h3>
              <Button
                size="sm"
                variant="outline"
                onClick={() =>
                  addItem("achievements", {
                    title: "",
                    date: "",
                    description: "",
                  })
                }
              >
                <Plus className="h-4 w-4 mr-1" /> Add
              </Button>
            </div>
            <div className="space-y-4">
              {formData.achievements.map((ach) => (
                <div
                  key={ach.id}
                  className="p-5 rounded-xl bg-gray-50 dark:bg-gray-800/30 border border-gray-100 dark:border-gray-800 relative group transition-all hover:shadow-md"
                >
                  <div className="grid grid-cols-1 md:grid-cols-12 gap-4 mb-2">
                    <div className="md:col-span-9">
                      <label className="text-xs font-medium text-gray-500 mb-1 block">
                        Achievement Title
                      </label>
                      <Input
                        placeholder="e.g. Hackathon Winner"
                        value={ach.title}
                        className="bg-white dark:bg-gray-800"
                        onChange={(e) =>
                          updateItem(
                            "achievements",
                            ach.id,
                            "title",
                            e.target.value,
                          )
                        }
                      />
                    </div>
                    <div className="md:col-span-3">
                      <label className="text-xs font-medium text-gray-500 mb-1 block">
                        Date
                      </label>
                      <Input
                        placeholder="2023"
                        value={ach.date}
                        className="bg-white dark:bg-gray-800"
                        onChange={(e) =>
                          updateItem(
                            "achievements",
                            ach.id,
                            "date",
                            e.target.value,
                          )
                        }
                      />
                    </div>
                  </div>
                  <button
                    onClick={() => removeItem("achievements", ach.id)}
                    className="absolute top-3 right-3 text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity p-1 bg-white dark:bg-gray-800 rounded-md shadow-sm border border-gray-100"
                    title="Remove"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ))}
              {formData.achievements.length === 0 && (
                <div className="text-center py-8 border-2 border-dashed border-gray-200 dark:border-gray-800 rounded-xl">
                  <Award className="h-8 w-8 text-gray-300 mx-auto mb-2" />
                  <p className="text-text-tertiary text-sm">
                    List your awards and certifications.
                  </p>
                </div>
              )}
            </div>
          </Card>
        </Motion.div>
      </div>
    </div>
  );

  const renderPreview = () => (
    <div className="w-full animate-in fade-in duration-500">
      {/* Header / Identity Section - Premium */}
      <div className="relative overflow-hidden bg-white dark:bg-surface-dark border-b border-border-light dark:border-border-dark mb-12">
        {/* Subtle background pattern/gradient */}
        <div className="absolute inset-0 bg-linear-to-br from-primary/5 via-transparent to-transparent opacity-50" />
        <div className="absolute top-0 right-0 w-96 h-96 bg-primary/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl" />

        <div className="max-w-[1920px] mx-auto px-6 lg:px-12 py-16 relative z-10">
          <div className="flex flex-col md:flex-row gap-10 items-start md:items-center justify-between">
            <div className="flex flex-col md:flex-row gap-8 items-start md:items-center">
              <Avatar
                src={formData.avatar_url || formData.main_avatar_url}
                fallback={formData.firstName?.[0]}
                size="2xl"
                className="h-32 w-32 ring-4 ring-gray-50 dark:ring-gray-800"
              />
              <div>
                <h1 className="text-4xl md:text-5xl font-bold text-text-primary dark:text-white tracking-tight leading-tight flex items-center gap-4">
                  {formData.firstName} {formData.lastName}
                  {!formData.isPublic && (
                    <Badge
                      variant="outline"
                      className="text-xs font-normal border-gray-200 text-gray-400 gap-1 px-2 py-0"
                    >
                      <Lock className="h-3 w-3" /> Private
                    </Badge>
                  )}
                </h1>
                <p className="text-xl md:text-2xl text-text-secondary mt-2 font-light">
                  {formData.headline}
                </p>
                <div className="flex items-center gap-6 mt-4 text-sm text-text-tertiary">
                  {formData.location && (
                    <div className="flex items-center gap-1.5 hover:text-primary transition-colors cursor-default">
                      <MapPin className="h-4 w-4" />
                      {formData.location}
                    </div>
                  )}
                  {formData.website && (
                    <div className="flex items-center gap-1.5">
                      <Globe className="h-4 w-4" />
                      <a
                        href={formData.website}
                        target="_blank"
                        rel="noreferrer"
                        className="hover:underline hover:text-primary"
                      >
                        Website
                      </a>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="flex gap-3">
              <Button variant="outline" className="gap-2 rounded-full px-6">
                <Share2 className="h-4 w-4" /> Share
              </Button>
              <Button className="gap-2 rounded-full px-6 bg-text-primary text-white hover:bg-black dark:bg-white dark:text-black">
                <Mail className="h-4 w-4" /> Contact
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-[1920px] mx-auto px-6 lg:px-12 pb-24">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16">
          {/* Left Sidebar: About & Skills */}
          <div className="lg:col-span-4 space-y-12">
            <section>
              <h3 className="text-sm font-bold uppercase tracking-widest text-text-tertiary mb-6">
                About
              </h3>
              <p className="text-lg leading-relaxed text-text-primary dark:text-gray-300 font-light whitespace-pre-line">
                {formData.bio || "No bio available."}
              </p>
            </section>

            {formData.skills.length > 0 && (
              <section>
                <h3 className="text-sm font-bold uppercase tracking-widest text-text-tertiary mb-6">
                  Expertise
                </h3>
                <div className="flex flex-wrap gap-2">
                  {formData.skills.map((skill) => (
                    <span
                      key={skill}
                      className="px-3 py-1.5 bg-gray-100 dark:bg-gray-800 text-text-primary dark:text-gray-200 text-sm rounded-md font-medium"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </section>
            )}

            {formData.socialLinks.length > 0 && (
              <section>
                <h3 className="text-sm font-bold uppercase tracking-widest text-text-tertiary mb-6">
                  Connect
                </h3>
                <div className="grid grid-cols-1 gap-3">
                  {formData.socialLinks.map((link) => {
                    const platform = link.platform.toLowerCase();
                    let Icon = LinkIcon;
                    if (platform.includes("github")) Icon = Github;
                    if (platform.includes("linkedin")) Icon = Linkedin;
                    if (platform.includes("twitter") || platform.includes("x"))
                      Icon = Twitter;

                    return (
                      <a
                        key={link.id}
                        href={link.url}
                        target="_blank"
                        rel="noreferrer"
                        className="flex items-center gap-3 p-3 rounded-xl border border-gray-50 dark:border-gray-800/50 hover:border-primary/20 hover:bg-primary/2 transition-all group"
                      >
                        <div className="w-10 h-10 rounded-lg bg-gray-50 dark:bg-gray-800 flex items-center justify-center group-hover:bg-primary/10 transition-colors">
                          <Icon className="h-4 w-4 text-text-secondary group-hover:text-primary transition-colors" />
                        </div>
                        <span className="font-medium text-text-secondary group-hover:text-text-primary transition-colors">
                          {link.platform}
                        </span>
                        <ExternalLink className="h-3 w-3 ml-auto opacity-0 group-hover:opacity-100 transition-opacity text-text-tertiary" />
                      </a>
                    );
                  })}
                </div>
              </section>
            )}
          </div>

          {/* Right Content: Timeline & Projects */}
          <div className="lg:col-span-8 space-y-16">
            {formData.experiences.length > 0 && (
              <section>
                <h3 className="text-2xl font-bold text-text-primary dark:text-white mb-8 flex items-center gap-3">
                  Work Experience
                </h3>
                <div className="relative border-l-2 border-gray-100 dark:border-gray-800 ml-3 space-y-10 pl-8 pb-4">
                  {formData.experiences.map((exp) => (
                    <div key={exp.id} className="relative">
                      <div className="absolute -left-[41px] top-1 h-5 w-5 rounded-full border-4 border-white dark:border-surface-dark bg-gray-300 dark:bg-gray-700" />
                      <div className="flex flex-col sm:flex-row sm:items-baseline sm:justify-between mb-2">
                        <h4 className="text-xl font-bold text-text-primary dark:text-white">
                          {exp.role}
                        </h4>
                        <span className="text-sm font-medium text-text-tertiary bg-gray-50 dark:bg-gray-800 px-3 py-1 rounded-full">
                          {exp.duration}
                        </span>
                      </div>
                      <h5 className="text-lg text-text-secondary font-medium mb-3">
                        {exp.company}
                      </h5>
                      <p className="text-text-secondary leading-relaxed">
                        {exp.description}
                      </p>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {formData.projects.length > 0 && (
              <section>
                <div className="flex items-center justify-between mb-8">
                  <h3 className="text-2xl font-bold text-text-primary dark:text-white">
                    Featured Work
                  </h3>
                  <div className="h-px flex-1 bg-gray-100 dark:bg-gray-800 mx-6 opacity-50" />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {formData.projects.map((proj) => (
                    <a
                      key={proj.id}
                      href={proj.link || "#"}
                      target="_blank"
                      rel="noreferrer"
                      className="block group p-8 rounded-3xl bg-gray-50/50 dark:bg-gray-800/30 hover:bg-white dark:hover:bg-gray-800 transition-all border border-gray-100/50 dark:border-gray-800/50 hover:border-primary/20 hover:shadow-xl hover:shadow-primary/5"
                    >
                      <div className="flex justify-between items-start mb-6">
                        <div className="p-4 bg-white dark:bg-surface-dark rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 group-hover:border-primary/20 group-hover:text-primary transition-all">
                          <Layers className="h-6 w-6" />
                        </div>
                        {proj.link && (
                          <ArrowUpRight className="h-5 w-5 text-gray-400 group-hover:text-primary transition-colors" />
                        )}
                      </div>
                      <h4 className="text-lg font-bold text-text-primary dark:text-white mb-2">
                        {proj.name}
                      </h4>
                      <p className="text-text-secondary line-clamp-3 text-sm">
                        {proj.description}
                      </p>
                    </a>
                  ))}
                </div>
              </section>
            )}

            {formData.education.length > 0 && (
              <section>
                <h3 className="text-2xl font-bold text-text-primary dark:text-white mb-8">
                  Education
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {formData.education.map((edu) => (
                    <div
                      key={edu.id}
                      className="flex gap-4 p-4 rounded-xl border border-gray-100 dark:border-gray-800"
                    >
                      <div className="mt-1">
                        <div className="h-10 w-10 bg-gray-100 dark:bg-gray-800 rounded-lg flex items-center justify-center text-gray-500">
                          <GraduationCap className="h-5 w-5" />
                        </div>
                      </div>
                      <div>
                        <h4 className="font-bold text-text-primary dark:text-white">
                          {edu.school}
                        </h4>
                        <p className="text-text-secondary text-sm">
                          {edu.degree}
                        </p>
                        <span className="text-xs text-text-tertiary mt-1 block">
                          {edu.year}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}
          </div>
        </div>
      </div>
    </div>
  );

  // Lucide icon helper
  const ArrowUpRight = ({ className }) => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M7 7h10v10" />
      <path d="M7 17 17 7" />
    </svg>
  );

  return (
    <div className="min-h-screen bg-gray-50/30 dark:bg-surface-dark transition-colors duration-700 relative overflow-x-hidden">
      {/* Dynamic Background Elements */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/5 rounded-full blur-[120px] animate-pulse" />
        <div className="absolute bottom-[10%] right-[-5%] w-[30%] h-[30%] bg-blue-500/5 rounded-full blur-[100px]" />
      </div>

      {/* Optimized Header & Controls */}
      <div className="flex flex-col md:flex-row justify-between items-end gap-6 border-b border-border-light dark:border-border-dark pb-8 mb-10 pt-6">
        <div>
          <h1 className="text-3xl font-bold text-text-primary dark:text-white tracking-tight">
            Public Profile
          </h1>
          <p className="text-text-secondary dark:text-gray-400 mt-1 text-lg">
            Manage how the world sees you on the platform.
          </p>
        </div>

        <div className="flex items-center gap-4 h-10">
          <div className="flex bg-gray-100 dark:bg-gray-800/50 rounded-full p-1 border border-border-light dark:border-border-dark h-full">
            <button
              onClick={() => setMode("edit")}
              className={cn(
                "px-5 rounded-full text-xs font-bold transition-all duration-300 h-full",
                mode === "edit"
                  ? "bg-white dark:bg-gray-700 shadow-sm text-primary"
                  : "text-text-tertiary hover:text-text-primary"
              )}
            >
              Editor
            </button>
            <button
              onClick={() => setMode("preview")}
              className={cn(
                "px-5 rounded-full text-xs font-bold transition-all duration-300 h-full",
                mode === "preview"
                  ? "bg-white dark:bg-gray-700 shadow-sm text-primary"
                  : "text-text-tertiary hover:text-text-primary"
              )}
            >
              Preview
            </button>
          </div>

          {mode === "edit" && (
            <Button 
              onClick={handleSave} 
              disabled={saving} 
              size="md"
              className="px-6 rounded-full gap-2 shadow-lg shadow-primary/20 hover:scale-105 transition-all text-xs font-bold h-full"
            >
              {saving ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <Save className="h-3.5 w-3.5" />
              )}
              Save Changes
            </Button>
          )}
        </div>
      </div>

      <div
        className={cn(
          "mx-auto transition-all duration-300",
          mode === "edit" ? "max-w-[1920px] px-6 pb-20" : "w-full p-0",
        )}
      >
        {mode === "edit" ? renderEditForm() : renderPreview()}
      </div>
    </div>
  );
}
