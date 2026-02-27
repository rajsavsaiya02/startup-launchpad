import React, { useState, useEffect } from "react";
import { motion as Motion } from "framer-motion";
import {
  Globe,
  Plus,
  Trash2,
  Save,
  Award,
  Layers,
  Briefcase,
  Loader2,
  Lock,
  Unlock,
} from "lucide-react";
import { Button } from "../../../components/ui/Button";
import { Input } from "../../../components/ui/Input";
import { ImageUpload } from "../../../components/ui/ImageUpload";
import { Card } from "../../../components/ui/Card";
import { cn } from "../../../utils/cn";
import { apiClient } from "../../../lib/axios";
import { toast } from "react-toastify";

export function OrgPublicProfileSettings() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Basic Org Identity (Name, Logo) - Read Only here mostly, EXCEPT brief description
  const [orgData, setOrgData] = useState({
    name: "",
    logo_url: "",
    workspace_url: "",
  });

  // Dynamic Profile Data
  const [formData, setFormData] = useState({
    brief_description: "",
    isPublic: true,
    socialLinks: [],
    milestones: [],
    projects: [],
    achievements: [],
  });

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const response = await apiClient.get("/org");
      const org = response.data.organization;

      setOrgData({
        name: org.name || "",
        logo_url: org.logo_url || "",
        workspace_url: org.workspace_url || "",
      });

      const publicProfile = org.public_profile || {};

      setFormData({
        brief_description: org.brief_description || "",
        isPublic:
          publicProfile.isPublic !== undefined ? publicProfile.isPublic : true,
        socialLinks: publicProfile.socialLinks || [],
        milestones: publicProfile.milestones || [],
        projects: publicProfile.projects || [],
        achievements: publicProfile.achievements || [],
      });
    } catch (error) {
      console.error("Error fetching org profile:", error);
      toast.error("Failed to load public profile data.");
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field, value) => {
    setFormData({ ...formData, [field]: value });
  };

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

  const handleSave = async () => {
    setSaving(true);
    try {
      const payload = {
        brief_description: formData.brief_description,
        public_profile: {
          isPublic: formData.isPublic,
          socialLinks: formData.socialLinks,
          milestones: formData.milestones,
          projects: formData.projects,
          achievements: formData.achievements,
        },
      };

      await apiClient.put("/org/profile", payload);
      toast.success("Public profile updated successfully!");
    } catch (error) {
      console.error("Error saving org profile:", error);
      toast.error(error.response?.data?.error || "Failed to save profile.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="max-w-screen-2xl mx-auto space-y-8 animate-in fade-in duration-500 pb-20 p-8 pt-10">
      <div className="border-b border-border-light dark:border-border-dark pb-6">
        <h1 className="text-3xl font-bold text-text-primary dark:text-white">
          Public Profile
        </h1>
        <p className="text-text-secondary dark:text-gray-400 mt-1">
          Manage how your organization appears to the outside world.
        </p>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 animate-in fade-in duration-500 w-full relative z-10">
        {/* LEFT COLUMN: Basic Info & Socials */}
        <div className="xl:col-span-4 space-y-6">
          <Motion.div
            className="sticky top-24 space-y-6"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
          >
            <Card className="p-8 border-primary/5 dark:border-border-dark shadow-xl rounded-2xl bg-white/80 dark:bg-surface-dark/80 backdrop-blur-xl relative">
              <div className="flex justify-between items-center mb-6 border-b border-gray-100/50 dark:border-gray-800/50 pb-4">
                <h3 className="text-lg font-bold text-text-primary dark:text-white flex items-center gap-2">
                  <Globe className="h-5 w-5 text-primary" /> Identity
                </h3>

                <div
                  className={cn(
                    "relative flex items-center justify-between p-1 rounded-full cursor-pointer transition-all duration-500 w-28",
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
                      "absolute h-6 w-[48%] rounded-full shadow-md z-10",
                      formData.isPublic ? "bg-green-500" : "bg-gray-400",
                    )}
                    animate={{ x: formData.isPublic ? "100%" : "0%" }}
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                  />
                  <span
                    className={cn(
                      "relative z-20 w-1/2 text-[9px] font-bold text-center uppercase flex justify-center gap-1",
                      !formData.isPublic ? "text-white" : "text-gray-400",
                    )}
                  >
                    <Lock className="h-3 w-3" /> Off
                  </span>
                  <span
                    className={cn(
                      "relative z-20 w-1/2 text-[9px] font-bold text-center uppercase flex justify-center gap-1",
                      formData.isPublic ? "text-white" : "text-gray-400",
                    )}
                  >
                    <Unlock className="h-3 w-3" /> Pub
                  </span>
                </div>
              </div>

              <div className="space-y-6 relative z-10">
                <div className="flex flex-col items-center mb-6">
                  <div className="h-24 w-24 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center overflow-hidden border-2 border-primary/20">
                    {orgData.logo_url ? (
                      <img
                        src={orgData.logo_url}
                        alt="Logo"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <span className="text-3xl font-bold text-gray-400">
                        {orgData.name?.charAt(0)}
                      </span>
                    )}
                  </div>
                  <p className="font-bold text-lg mt-3 text-text-primary dark:text-white">
                    {orgData.name}
                  </p>
                  <p className="text-xs text-text-tertiary">
                    /o/{orgData.workspace_url}
                  </p>
                  <p className="text-[10px] text-text-tertiary text-center mt-2 italic">
                    Name and Logo are managed in Workspace Settings.
                  </p>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold uppercase tracking-wider text-text-tertiary px-1">
                    Brief Tagline / Description
                  </label>
                  <textarea
                    className="w-full rounded-xl border border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-900/30 p-3 text-sm h-28 focus:ring-2 focus:ring-primary/20 dark:text-white resize-none transition-all outline-none"
                    placeholder="What does your startup do in 1-2 sentences?"
                    value={formData.brief_description}
                    onChange={(e) =>
                      handleInputChange("brief_description", e.target.value)
                    }
                    maxLength={150}
                  />
                  <div className="text-right text-[10px] text-gray-400">
                    {formData.brief_description.length}/150
                  </div>
                </div>
              </div>
            </Card>

            <Card className="p-8 border-primary/5 dark:border-border-dark shadow-xl rounded-2xl bg-white/80 dark:bg-surface-dark/80 backdrop-blur-xl group">
              <div className="flex justify-between items-center mb-4 border-b border-gray-100/50 dark:border-gray-800/50 pb-4">
                <h3 className="text-lg font-bold text-text-primary dark:text-white flex items-center gap-2">
                  Social Links
                </h3>
                <Button
                  size="xs"
                  variant="ghost"
                  className="rounded-full"
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
                        placeholder="Twitter, Web..."
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
                {formData.socialLinks.length === 0 && (
                  <p className="text-xs text-center text-gray-400 py-2">
                    No social links added.
                  </p>
                )}
              </div>
            </Card>
          </Motion.div>
        </div>

        {/* RIGHT COLUMN: Dynamic Sections */}
        <div className="xl:col-span-8 space-y-6">
          {/* Featured Work / Projects */}
          <Card className="p-8 border-primary/5 dark:border-border-dark shadow-xl rounded-2xl bg-white/80 dark:bg-surface-dark/80 backdrop-blur-xl">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-text-primary dark:text-white flex items-center gap-3">
                <Layers className="h-6 w-6 text-primary" /> Key Projects /
                Products
              </h3>
              <Button
                size="sm"
                variant="outline"
                className="rounded-full"
                onClick={() =>
                  addItem("projects", { name: "", link: "", description: "" })
                }
              >
                <Plus className="h-4 w-4 mr-1" /> Add Project
              </Button>
            </div>
            <div className="space-y-4">
              {formData.projects.map((proj) => (
                <div
                  key={proj.id}
                  className="p-4 rounded-xl bg-gray-50/50 dark:bg-gray-800/30 border border-gray-100 dark:border-gray-800 relative group"
                >
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
                    <div>
                      <label className="text-xs font-medium text-gray-500 mb-1 block">
                        Product Name
                      </label>
                      <Input
                        placeholder="e.g. LaunchPad App"
                        value={proj.name}
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
                    <div>
                      <label className="text-xs font-medium text-gray-500 mb-1 block">
                        Website / Link
                      </label>
                      <Input
                        placeholder="https://..."
                        value={proj.link}
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
                    className="w-full rounded-lg border border-border-light bg-white dark:bg-gray-900/50 p-3 text-sm h-20 focus:ring-2 focus:ring-primary/20 dark:border-gray-700 dark:text-white resize-none outline-none"
                    placeholder="Describe this product/project..."
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
                    className="absolute top-2 right-2 text-gray-400 hover:text-red-500 p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ))}
              {formData.projects.length === 0 && (
                <p className="text-sm text-center text-gray-400 py-6 border border-dashed rounded-xl">
                  Add key products or projects to showcase.
                </p>
              )}
            </div>
          </Card>

          {/* Milestones / History */}
          <Card className="p-8 border-primary/5 dark:border-border-dark shadow-xl rounded-2xl bg-white/80 dark:bg-surface-dark/80 backdrop-blur-xl">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-text-primary dark:text-white flex items-center gap-3">
                <Briefcase className="h-6 w-6 text-primary" /> Milestones &
                History
              </h3>
              <Button
                size="sm"
                variant="outline"
                className="rounded-full"
                onClick={() =>
                  addItem("milestones", {
                    year: "",
                    title: "",
                    description: "",
                  })
                }
              >
                <Plus className="h-4 w-4 mr-1" /> Add Milestone
              </Button>
            </div>
            <div className="space-y-4">
              {formData.milestones.map((m) => (
                <div
                  key={m.id}
                  className="p-4 rounded-xl bg-gray-50/50 dark:bg-gray-800/30 border border-gray-100 dark:border-gray-800 relative group"
                >
                  <div className="grid grid-cols-1 md:grid-cols-12 gap-4 mb-3">
                    <div className="md:col-span-3">
                      <label className="text-xs font-medium text-gray-500 mb-1 block">
                        Year/Date
                      </label>
                      <Input
                        placeholder="e.g. 2024"
                        value={m.year}
                        onChange={(e) =>
                          updateItem("milestones", m.id, "year", e.target.value)
                        }
                      />
                    </div>
                    <div className="md:col-span-9">
                      <label className="text-xs font-medium text-gray-500 mb-1 block">
                        Milestone Title
                      </label>
                      <Input
                        placeholder="e.g. Seed Funding Raised"
                        value={m.title}
                        onChange={(e) =>
                          updateItem(
                            "milestones",
                            m.id,
                            "title",
                            e.target.value,
                          )
                        }
                      />
                    </div>
                  </div>
                  <textarea
                    className="w-full rounded-lg border border-border-light bg-white dark:bg-gray-900/50 p-3 text-sm h-16 focus:ring-2 focus:ring-primary/20 dark:border-gray-700 dark:text-white resize-none outline-none"
                    placeholder="Brief description of the milestone..."
                    value={m.description}
                    onChange={(e) =>
                      updateItem(
                        "milestones",
                        m.id,
                        "description",
                        e.target.value,
                      )
                    }
                  />
                  <button
                    onClick={() => removeItem("milestones", m.id)}
                    className="absolute top-2 right-2 text-gray-400 hover:text-red-500 p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ))}
              {formData.milestones.length === 0 && (
                <p className="text-sm text-center text-gray-400 py-6 border border-dashed rounded-xl">
                  Log important company history.
                </p>
              )}
            </div>
          </Card>
        </div>

        {/* Floating Save Button */}
        <div className="fixed bottom-8 right-8 z-50">
          <Button
            size="lg"
            onClick={handleSave}
            disabled={saving}
            className="shadow-2xl shadow-primary/30 rounded-full px-8"
          >
            {saving ? (
              <Loader2 className="h-5 w-5 animate-spin mr-2" />
            ) : (
              <Save className="h-5 w-5 mr-2" />
            )}
            {saving ? "Saving..." : "Save Public Profile"}
          </Button>
        </div>
      </div>
    </div>
  );
}
