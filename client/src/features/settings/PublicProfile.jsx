import React, { useState, useEffect } from "react";
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
} from "lucide-react";
import { Button } from "../../components/ui/Button";
import { Input } from "../../components/ui/Input";
import { Avatar } from "../../components/ui/Avatar";
import { Card } from "../../components/ui/Card";
import { Badge } from "../../components/ui/Badge";
import { cn } from "../../utils/cn";
import { apiClient } from "../../lib/axios";
import { useAuth } from "../../context/AuthContext";
import toast from "../react-toastify";

export function PublicProfile() {
  const { updateUser } = useAuth();
  const [mode, setMode] = useState("edit"); // 'edit' | 'preview'

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Initial Form State
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    headline: "",
    occupation: "",
    bio: "",
    location: "",
    website: "",
    avatar_url: "",
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

        // Parse public_profile JSON if it exists
        const publicProfile = userData.public_profile || {};

        setFormData({
          firstName: userData.first_name || "",
          lastName: userData.last_name || "",
          headline: userData.job_title || "", // Mapping job_title to headline for now if needed
          occupation:
            userData.role === "founder"
              ? "Founder"
              : publicProfile.occupation || userData.job_title || "",
          bio: userData.bio || "",
          location: userData.location || "",
          website: userData.social_website || "",
          avatar_url: userData.avatar_url || "",

          // Load dynamic sections from public_profile or default to empty arrays
          experiences: publicProfile.experiences || [],
          education: publicProfile.education || [],
          projects: publicProfile.projects || [],
          achievements: publicProfile.achievements || [],
          socialLinks: publicProfile.socialLinks || [],
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

        // This object goes into the JSONB column
        public_profile: {
          occupation: formData.occupation,
          experiences: formData.experiences,
          education: formData.education,
          projects: formData.projects,
          achievements: formData.achievements,
          socialLinks: formData.socialLinks,
        },
      };

      const response = await apiClient.put("/users/profile", payload);

      // Update local user context if needed
      if (updateUser) {
        updateUser(response.data.user);
      }

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
    <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 animate-in fade-in duration-300 w-full">
      {/* LEFT COLUMN: Basic Info (Sticky on Large Screens) */}
      <div className="xl:col-span-4 space-y-6">
        <div className="sticky top-6 space-y-6">
          <Card className="p-6 border-border-light dark:border-border-dark shadow-sm">
            <h3 className="text-lg font-semibold text-text-primary dark:text-white mb-4 border-b border-gray-100 dark:border-gray-800 pb-2">
              Identity
            </h3>
            <div className="space-y-4">
              <div className="flex flex-col items-center mb-4">
                <Avatar
                  src={formData.avatar_url}
                  fallback={formData.firstName?.[0]}
                  size="xl"
                  className="h-24 w-24 mb-2"
                />
                <Button variant="ghost" size="sm" className="text-xs">
                  Change Photo
                </Button>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <Input
                  label="First Name"
                  value={formData.firstName}
                  onChange={(e) =>
                    handleInputChange("firstName", e.target.value)
                  }
                />
                <Input
                  label="Last Name"
                  value={formData.lastName}
                  onChange={(e) =>
                    handleInputChange("lastName", e.target.value)
                  }
                />
              </div>
              <Input
                label="Headline"
                placeholder="e.g. Product Designer"
                value={formData.headline}
                onChange={(e) => handleInputChange("headline", e.target.value)}
              />
              <Input
                label="Current Role / Occupation"
                placeholder="e.g. Senior Frontend Developer"
                value={formData.occupation}
                onChange={(e) =>
                  handleInputChange("occupation", e.target.value)
                }
              />
              <div>
                <label className="text-sm font-medium text-text-secondary mb-1.5 block">
                  Bio
                </label>
                <textarea
                  className="w-full rounded-lg border border-border-light bg-background-light p-3 text-sm h-32 focus:ring-2 focus:ring-primary/20 dark:bg-background-dark dark:border-border-dark dark:text-white resize-none transition-all"
                  placeholder="Briefly describe your journey..."
                  value={formData.bio}
                  onChange={(e) => handleInputChange("bio", e.target.value)}
                />
              </div>
              <Input
                label="Location"
                icon={MapPin}
                placeholder="City, Country"
                value={formData.location}
                onChange={(e) => handleInputChange("location", e.target.value)}
              />
              <Input
                label="Website"
                icon={Globe}
                type="url"
                placeholder="https://"
                value={formData.website}
                onChange={(e) => handleInputChange("website", e.target.value)}
              />
            </div>
          </Card>

          <Card className="p-6 border-border-light dark:border-border-dark shadow-sm">
            <h3 className="text-lg font-semibold text-text-primary dark:text-white mb-4 border-b border-gray-100 dark:border-gray-800 pb-2">
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

          <Card className="p-6 border-border-light dark:border-border-dark shadow-sm">
            <div className="flex justify-between items-center mb-4 border-b border-gray-100 dark:border-gray-800 pb-2">
              <h3 className="text-lg font-semibold text-text-primary dark:text-white">
                Social Links
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
        </div>
      </div>

      {/* RIGHT COLUMN: Dynamic Sections */}
      <div className="xl:col-span-8 space-y-6">
        {/* Work Experience */}
        <Card className="p-6 border-border-light dark:border-border-dark shadow-sm">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-bold text-text-primary dark:text-white flex items-center gap-2">
              <Briefcase className="h-5 w-5 text-primary" /> Work Experience
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
                  Add your professional experience to showcase your career path.
                </p>
              </div>
            )}
          </div>
        </Card>

        {/* Projects */}
        <Card className="p-6 border-border-light dark:border-border-dark shadow-sm">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-bold text-text-primary dark:text-white flex items-center gap-2">
              <Share2 className="h-5 w-5 text-primary" /> Key Projects
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
                        updateItem("projects", proj.id, "name", e.target.value)
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
                        updateItem("projects", proj.id, "link", e.target.value)
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
                <Share2 className="h-8 w-8 text-gray-300 mx-auto mb-2" />
                <p className="text-text-tertiary text-sm">
                  Add projects to demonstrate your practical skills.
                </p>
              </div>
            )}
          </div>
        </Card>

        {/* Education */}
        <Card className="p-6 border-border-light dark:border-border-dark shadow-sm">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-bold text-text-primary dark:text-white flex items-center gap-2">
              <GraduationCap className="h-5 w-5 text-primary" /> Education
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
                        updateItem("education", edu.id, "year", e.target.value)
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

        {/* Achievements */}
        <Card className="p-6 border-border-light dark:border-border-dark shadow-sm">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-bold text-text-primary dark:text-white flex items-center gap-2">
              <Award className="h-5 w-5 text-primary" /> Achievements
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
      </div>
    </div>
  );

  const renderPreview = () => (
    <div className="w-full animate-in fade-in duration-500">
      {/* Header / Identity Section - Minimalist */}
      <div className="bg-white dark:bg-surface-dark border-b border-border-light dark:border-border-dark mb-12">
        <div className="max-w-[1920px] mx-auto px-6 lg:px-12 py-16">
          <div className="flex flex-col md:flex-row gap-10 items-start md:items-center justify-between">
            <div className="flex flex-col md:flex-row gap-8 items-start md:items-center">
              <Avatar
                src={formData.avatar_url}
                fallback={formData.firstName?.[0]}
                size="2xl"
                className="h-32 w-32 ring-4 ring-gray-50 dark:ring-gray-800"
              />
              <div>
                <h1 className="text-4xl md:text-5xl font-bold text-text-primary dark:text-white tracking-tight leading-tight">
                  {formData.firstName} {formData.lastName}
                </h1>
                <p className="text-xl md:text-2xl text-text-secondary mt-2 font-light">
                  {formData.headline}
                </p>
                <div className="flex items-center gap-4 mt-4 text-sm text-text-tertiary">
                  {formData.location && (
                    <div className="flex items-center gap-1.5">
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
                <div className="flex flex-col gap-3">
                  {formData.socialLinks.map((link) => (
                    <a
                      key={link.id}
                      href={link.url}
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center gap-3 text-text-secondary hover:text-primary transition-colors group"
                    >
                      <div className="w-8 h-8 rounded-full bg-gray-50 dark:bg-gray-800 flex items-center justify-center group-hover:bg-primary/10">
                        <LinkIcon className="h-4 w-4" />
                      </div>
                      <span className="font-medium">{link.platform}</span>
                    </a>
                  ))}
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
                <h3 className="text-2xl font-bold text-text-primary dark:text-white mb-8">
                  Selected Projects
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {formData.projects.map((proj) => (
                    <a
                      key={proj.id}
                      href={proj.link || "#"}
                      target="_blank"
                      rel="noreferrer"
                      className="block group p-6 rounded-2xl bg-gray-50 dark:bg-gray-800/50 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors border border-transparent hover:border-gray-200 dark:hover:border-gray-700"
                    >
                      <div className="flex justify-between items-start mb-4">
                        <div className="p-3 bg-white dark:bg-surface-dark rounded-xl shadow-sm">
                          <Briefcase className="h-6 w-6 text-primary" />
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
    <div className="min-h-screen bg-background dark:bg-surface-dark transition-colors duration-300">
      <div className="sticky top-0 z-20 bg-background/80 dark:bg-surface-dark/80 backdrop-blur-md border-b border-border-light dark:border-border-dark mb-8">
        <div className="max-w-[1920px] mx-auto px-6 h-16 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-text-primary dark:text-white flex items-center gap-2">
            <Globe className="h-5 w-5 text-primary" />
            Public Profile
          </h2>
          <div className="flex items-center gap-4">
            <div className="flex bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
              <button
                onClick={() => setMode("edit")}
                className={cn(
                  "px-4 py-1.5 rounded-md text-sm font-medium transition-all",
                  mode === "edit"
                    ? "bg-white dark:bg-gray-700 shadow-sm text-primary"
                    : "text-gray-500 hover:text-gray-700",
                )}
              >
                Editor
              </button>
              <button
                onClick={() => setMode("preview")}
                className={cn(
                  "px-4 py-1.5 rounded-md text-sm font-medium transition-all",
                  mode === "preview"
                    ? "bg-white dark:bg-gray-700 shadow-sm text-primary"
                    : "text-gray-500 hover:text-gray-700",
                )}
              >
                Preview
              </button>
            </div>
            {mode === "edit" && (
              <Button onClick={handleSave} disabled={saving} className="gap-2">
                {saving ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Save className="h-4 w-4" />
                )}
                Save Changes
              </Button>
            )}
          </div>
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
