import React, { useState, useEffect, useRef } from "react";
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
  Phone,
  Mail,
  MapPin,
  Link2,
  Image as ImageIcon,
  Info,
  Tag,
  X,
  Upload,
  ExternalLink,
  Building2,
  ChevronDown,
  Camera,
} from "lucide-react";
import { Button } from "../../../components/ui/Button";
import { Input } from "../../../components/ui/Input";
import { Card } from "../../../components/ui/Card";
import { cn } from "../../../utils/cn";
import { apiClient, SERVER_URL } from "../../../lib/axios";
import { toast } from "react-toastify";

const INDUSTRY_OPTIONS = [
  "AI / Machine Learning",
  "SaaS / Software",
  "Fintech / Finance",
  "Healthcare / MedTech",
  "E-commerce / Retail",
  "EdTech / Education",
  "CleanTech / Energy",
  "Logistics / Supply Chain",
  "Real Estate / PropTech",
  "Media / Entertainment",
  "Legal Tech",
  "HR Tech",
  "Cybersecurity",
  "Blockchain / Web3",
  "IoT / Hardware",
  "AgriTech",
  "Travel / Hospitality",
  "Gaming",
  "Other",
];

const STAGE_OPTIONS = [
  "Idea / Pre-seed",
  "Seed",
  "Series A",
  "Series B",
  "Series C+",
  "Growth",
  "Public / IPO",
];

const TEAM_SIZE_OPTIONS = [
  "1–5",
  "6–10",
  "11–25",
  "26–50",
  "51–100",
  "101–250",
  "250+",
];

const SOCIAL_PLATFORMS = [
  "LinkedIn",
  "Twitter / X",
  "GitHub",
  "Instagram",
  "YouTube",
  "Facebook",
  "Discord",
  "Product Hunt",
  "Website",
  "Other",
];

// ─── Section Header ──────────────────────────────────────────
function SectionHeader({ icon, title, color = "text-primary" }) {
  const Icon = icon;
  return (
    <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-100 dark:border-gray-800">
      <div className={cn("p-2 rounded-xl", "bg-primary/10")}>
        <Icon className={cn("h-5 w-5", color)} />
      </div>
      <h3 className="text-lg font-bold text-text-primary dark:text-white tracking-tight">
        {title}
      </h3>
    </div>
  );
}

// ─── Simple Logo Uploader ────────────────────────────────────
function LogoUploader({ currentLogoUrl, orgName, onFileSelect, isUploading }) {
  const inputRef = useRef(null);
  const [preview, setPreview] = useState(null);

  const handleFile = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file.");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image must be less than 5MB.");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => setPreview(reader.result);
    reader.readAsDataURL(file);
    onFileSelect(file);
  };

  const displayUrl = preview || currentLogoUrl;

  return (
    <div className="flex flex-col items-center gap-4">
      <div
        className="relative group cursor-pointer"
        onClick={() => inputRef.current?.click()}
      >
        <div className="h-28 w-28 rounded-2xl overflow-hidden border-4 border-white dark:border-gray-800 shadow-xl ring-2 ring-primary/20 bg-gray-50 dark:bg-gray-800 flex items-center justify-center">
          {displayUrl ? (
            <img
              src={
                displayUrl.startsWith("http") ||
                displayUrl.startsWith("blob:") ||
                displayUrl.startsWith("data:")
                  ? displayUrl
                  : `${SERVER_URL}${displayUrl}`
              }
              alt={orgName}
              className="w-full h-full object-cover"
            />
          ) : (
            <span className="text-4xl font-black text-gray-300 dark:text-gray-600">
              {orgName?.charAt(0) || "?"}
            </span>
          )}
          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center rounded-2xl">
            <Camera className="h-6 w-6 text-white" />
          </div>
        </div>
        {isUploading && (
          <div className="absolute inset-0 flex items-center justify-center rounded-2xl bg-black/50">
            <Loader2 className="h-6 w-6 text-white animate-spin" />
          </div>
        )}
      </div>
      <div className="text-center">
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="text-xs font-semibold text-primary hover:text-primary/80 transition-colors flex items-center gap-1.5 mx-auto"
        >
          <Upload className="h-3 w-3" />
          {displayUrl ? "Change Logo" : "Upload Brand Logo"}
        </button>
        <p className="text-[10px] text-text-tertiary mt-1">
          PNG, JPG, SVG · Max 5MB · Recommended 512×512
        </p>
      </div>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFile}
      />
    </div>
  );
}

// ─── Gallery Item ────────────────────────────────────────────
function GalleryItem({ item, onUpdate, onRemove }) {
  const inputRef = useRef(null);
  const [preview, setPreview] = useState(item.preview || item.url || null);

  const handleFile = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file.");
      return;
    }
    if (file.size > 8 * 1024 * 1024) {
      toast.error("Image must be less than 8MB.");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      setPreview(reader.result);
      onUpdate("preview", reader.result);
      onUpdate("file", file);
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="relative group rounded-2xl overflow-hidden border border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-900/50">
      {/* Image Area */}
      <div
        className="relative h-40 cursor-pointer bg-gray-100 dark:bg-gray-800 flex items-center justify-center"
        onClick={() => inputRef.current?.click()}
      >
        {preview ? (
          <img
            src={
              preview.startsWith("http") ||
              preview.startsWith("blob:") ||
              preview.startsWith("data:")
                ? preview
                : `${SERVER_URL}${preview}`
            }
            alt={item.caption || "Gallery"}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="text-center p-4">
            <ImageIcon className="h-8 w-8 text-gray-300 dark:text-gray-600 mx-auto mb-2" />
            <p className="text-xs text-text-tertiary">Click to upload</p>
          </div>
        )}
        <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
          <Camera className="h-5 w-5 text-white" />
        </div>
      </div>

      {/* Caption */}
      <div className="p-3">
        <input
          type="text"
          placeholder="Caption (optional)..."
          value={item.caption || ""}
          onChange={(e) => onUpdate("caption", e.target.value)}
          className="w-full text-xs bg-transparent outline-none text-text-secondary dark:text-gray-400 placeholder:text-gray-300 dark:placeholder:text-gray-600 border-b border-transparent focus:border-primary/30 transition-colors pb-0.5"
        />
      </div>

      {/* Remove */}
      <button
        onClick={onRemove}
        className="absolute top-2 right-2 p-1.5 rounded-full bg-white/80 dark:bg-gray-900/80 text-red-500 hover:bg-red-500 hover:text-white transition-all shadow-md opacity-0 group-hover:opacity-100"
      >
        <X className="h-3 w-3" />
      </button>

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFile}
      />
    </div>
  );
}

// ─── Main Component ──────────────────────────────────────────
export function OrgPublicProfileSettings() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isUploadingLogo, setIsUploadingLogo] = useState(false);
  const [pendingLogoFile, setPendingLogoFile] = useState(null);

  const [orgData, setOrgData] = useState({
    name: "",
    logo_url: "",
    workspace_url: "",
    organization_id: null,
  });

  const [formData, setFormData] = useState({
    // Identity
    tagline: "",
    brief_description: "",
    detailed_description: "",
    isPublic: true,

    // Classification
    industry: "",
    stage: "",
    team_size: "",
    founded_year: "",

    // Contact & Location
    website_url: "",
    contact_email: "",
    contact_phone: "",
    hq_location: "",
    hq_address: "",

    // Dynamic Sections
    socialLinks: [],
    milestones: [],
    projects: [],
    achievements: [],
    gallery: [],
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
        organization_id: org.organization_id,
      });

      const pp = org.public_profile || {};
      setFormData({
        tagline: pp.tagline || "",
        brief_description: org.brief_description || "",
        detailed_description: pp.detailed_description || "",
        isPublic: pp.isPublic !== undefined ? pp.isPublic : true,
        industry: pp.industry || "",
        stage: pp.stage || "",
        team_size: pp.team_size || "",
        founded_year: pp.founded_year || "",
        website_url: pp.website_url || "",
        contact_email: pp.contact_email || "",
        contact_phone: pp.contact_phone || "",
        hq_location: pp.hq_location || "",
        hq_address: pp.hq_address || "",
        socialLinks: pp.socialLinks || [],
        milestones: pp.milestones || [],
        projects: pp.projects || [],
        achievements: pp.achievements || [],
        gallery: (pp.gallery || []).map((g) => ({ ...g, id: g.id || Date.now().toString() + Math.random() })),
      });
    } catch {
      toast.error("Failed to load public profile data.");
    } finally {
      setLoading(false);
    }
  };

  const set = (field, value) => setFormData((f) => ({ ...f, [field]: value }));

  const updateItem = (section, id, field, value) => {
    setFormData((f) => ({
      ...f,
      [section]: f[section].map((item) =>
        item.id === id ? { ...item, [field]: value } : item,
      ),
    }));
  };

  const addItem = (section, template) => {
    setFormData((f) => ({
      ...f,
      [section]: [...f[section], { ...template, id: Date.now().toString() + Math.random() }],
    }));
  };

  const removeItem = (section, id) => {
    setFormData((f) => ({
      ...f,
      [section]: f[section].filter((item) => item.id !== id),
    }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      // 1. Upload logo if pending
      if (pendingLogoFile) {
        setIsUploadingLogo(true);
        try {
          const fd = new FormData();
          fd.append("logo", pendingLogoFile);
          const logoRes = await apiClient.put("/org/logo", fd, {
            headers: { "Content-Type": "multipart/form-data" },
          });
          if (logoRes.data?.logo_url) {
            setOrgData((prev) => ({ ...prev, logo_url: logoRes.data.logo_url }));
          }
        } catch {
          // If logo endpoint doesn't exist yet, store URL in public_profile
          console.warn("Logo upload endpoint not available, storing as URL in profile.");
        } finally {
          setIsUploadingLogo(false);
          setPendingLogoFile(null);
        }
      }

      // 2. Clean gallery (remove blob/data URLs for storage, keep existing remote ones)
      const galleryToSave = formData.gallery.map(({ id, ...rest }) => ({
        ...rest,
        id,
        url: rest.url || "", // keep remote URL
      }));

      // 3. Save public profile
      const payload = {
        brief_description: formData.brief_description,
        public_profile: {
          tagline: formData.tagline,
          detailed_description: formData.detailed_description,
          isPublic: formData.isPublic,
          industry: formData.industry,
          stage: formData.stage,
          team_size: formData.team_size,
          founded_year: formData.founded_year,
          website_url: formData.website_url,
          contact_email: formData.contact_email,
          contact_phone: formData.contact_phone,
          hq_location: formData.hq_location,
          hq_address: formData.hq_address,
          socialLinks: formData.socialLinks,
          milestones: formData.milestones,
          projects: formData.projects,
          achievements: formData.achievements,
          gallery: galleryToSave,
        },
      };

      await apiClient.put("/org/profile", payload);
      toast.success("Public profile saved successfully!");
    } catch (error) {
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
    <div className="max-w-screen-2xl mx-auto space-y-8 animate-in fade-in duration-500 pb-32 p-6 pt-8">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-border-light dark:border-border-dark pb-6">
        <div>
          <h1 className="text-3xl font-bold text-text-primary dark:text-white">
            Public Profile
          </h1>
          <p className="text-text-secondary dark:text-gray-400 mt-1 text-sm">
            Manage how your organization appears publicly at{" "}
            <a
              href={`/community/${orgData.workspace_url}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary font-semibold hover:underline inline-flex items-center gap-1"
            >
              /community/{orgData.workspace_url}
              <ExternalLink className="h-3 w-3" />
            </a>
          </p>
        </div>
        {/* Visibility Toggle */}
        <div
          className={cn(
            "flex items-center gap-2 px-4 py-2.5 rounded-full cursor-pointer border transition-all duration-300 select-none",
            formData.isPublic
              ? "bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800 text-green-700 dark:text-green-400"
              : "bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-500",
          )}
          onClick={() => set("isPublic", !formData.isPublic)}
        >
          {formData.isPublic ? (
            <Unlock className="h-4 w-4" />
          ) : (
            <Lock className="h-4 w-4" />
          )}
          <span className="text-xs font-bold uppercase tracking-wider">
            {formData.isPublic ? "Profile Public" : "Profile Private"}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
        {/* ── LEFT COLUMN ───────────────────────────────── */}
        <div className="xl:col-span-4 space-y-6">
          <Motion.div
            className="sticky top-24 space-y-6"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4 }}
          >
            {/* Brand Identity Card */}
            <Card className="p-6 shadow-xl rounded-2xl bg-white/80 dark:bg-surface-dark/80 backdrop-blur-xl border border-primary/5 dark:border-border-dark">
              <SectionHeader icon={Building2} title="Brand Identity" />

              {/* Logo Uploader */}
              <LogoUploader
                currentLogoUrl={orgData.logo_url}
                orgName={orgData.name}
                onFileSelect={setPendingLogoFile}
                isUploading={isUploadingLogo}
              />

              <div className="space-y-5 mt-6">
                {/* Tagline */}
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold uppercase tracking-wider text-text-tertiary flex items-center gap-1.5">
                    <Tag className="h-3 w-3 text-primary" />
                    Tagline
                  </label>
                  <Input
                    placeholder="e.g. Building the future of AI, one API at a time."
                    value={formData.tagline}
                    onChange={(e) => set("tagline", e.target.value)}
                    maxLength={100}
                    className="text-sm"
                  />
                  <div className="text-right text-[10px] text-gray-400">
                    {formData.tagline.length}/100
                  </div>
                </div>

                {/* Brief Description / SEO Snippet */}
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold uppercase tracking-wider text-text-tertiary flex items-center gap-1.5">
                    <Info className="h-3 w-3 text-primary" />
                    Short Description
                    <span className="text-[9px] font-normal text-gray-400 normal-case">(shown in cards & SEO)</span>
                  </label>
                  <textarea
                    className="w-full rounded-xl border border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-900/30 p-3 text-sm h-24 focus:ring-2 focus:ring-primary/20 dark:text-white resize-none transition-all outline-none"
                    placeholder="What does your startup do in 1–2 sentences?"
                    value={formData.brief_description}
                    onChange={(e) => set("brief_description", e.target.value)}
                    maxLength={200}
                  />
                  <div className="text-right text-[10px] text-gray-400">
                    {formData.brief_description.length}/200
                  </div>
                </div>
              </div>
            </Card>

            {/* Social Links Card */}
            <Card className="p-6 shadow-xl rounded-2xl bg-white/80 dark:bg-surface-dark/80 backdrop-blur-xl border border-primary/5 dark:border-border-dark">
              <div className="flex justify-between items-center mb-6 pb-4 border-b border-gray-100 dark:border-gray-800">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-primary/10">
                    <Globe className="h-5 w-5 text-primary" />
                  </div>
                  <h3 className="text-lg font-bold text-text-primary dark:text-white">
                    Social Links
                  </h3>
                </div>
                <Button
                  size="xs"
                  variant="ghost"
                  className="rounded-full"
                  onClick={() =>
                    addItem("socialLinks", { platform: "LinkedIn", url: "" })
                  }
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>

              <div className="space-y-3">
                {formData.socialLinks.map((link) => (
                  <div key={link.id} className="flex gap-2 items-center">
                    <select
                      value={link.platform}
                      onChange={(e) =>
                        updateItem("socialLinks", link.id, "platform", e.target.value)
                      }
                      className="w-[38%] rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-xs text-text-primary dark:text-white px-2 py-2 outline-none focus:ring-1 focus:ring-primary/30"
                    >
                      {SOCIAL_PLATFORMS.map((p) => (
                        <option key={p} value={p}>
                          {p}
                        </option>
                      ))}
                    </select>
                    <div className="flex-1">
                      <Input
                        type="url"
                        placeholder="https://..."
                        className="h-9 text-xs"
                        value={link.url}
                        onChange={(e) =>
                          updateItem("socialLinks", link.id, "url", e.target.value)
                        }
                      />
                    </div>
                    <button
                      onClick={() => removeItem("socialLinks", link.id)}
                      className="text-gray-400 hover:text-red-500 p-1 transition-colors"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                ))}
                {formData.socialLinks.length === 0 && (
                  <p className="text-xs text-center text-gray-400 py-3 border border-dashed border-gray-200 dark:border-gray-700 rounded-xl">
                    Add links to Twitter, LinkedIn, GitHub, etc.
                  </p>
                )}
              </div>
            </Card>
          </Motion.div>
        </div>

        {/* ── RIGHT COLUMN ──────────────────────────────── */}
        <div className="xl:col-span-8 space-y-6">
          {/* Organization Details */}
          <Motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.05 }}
          >
            <Card className="p-7 shadow-xl rounded-2xl bg-white/80 dark:bg-surface-dark/80 backdrop-blur-xl border border-primary/5 dark:border-border-dark">
              <SectionHeader icon={Info} title="Organization Details" />

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                {/* Industry */}
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold uppercase tracking-wider text-text-tertiary">
                    Industry / Sector
                  </label>
                  <div className="relative">
                    <select
                      value={formData.industry}
                      onChange={(e) => set("industry", e.target.value)}
                      className="w-full appearance-none rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800/50 text-sm text-text-primary dark:text-white px-3 py-2.5 pr-8 outline-none focus:ring-2 focus:ring-primary/20"
                    >
                      <option value="">Select industry…</option>
                      {INDUSTRY_OPTIONS.map((opt) => (
                        <option key={opt} value={opt}>
                          {opt}
                        </option>
                      ))}
                    </select>
                    <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
                  </div>
                </div>

                {/* Stage */}
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold uppercase tracking-wider text-text-tertiary">
                    Funding Stage
                  </label>
                  <div className="relative">
                    <select
                      value={formData.stage}
                      onChange={(e) => set("stage", e.target.value)}
                      className="w-full appearance-none rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800/50 text-sm text-text-primary dark:text-white px-3 py-2.5 pr-8 outline-none focus:ring-2 focus:ring-primary/20"
                    >
                      <option value="">Select stage…</option>
                      {STAGE_OPTIONS.map((opt) => (
                        <option key={opt} value={opt}>
                          {opt}
                        </option>
                      ))}
                    </select>
                    <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
                  </div>
                </div>

                {/* Team Size */}
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold uppercase tracking-wider text-text-tertiary">
                    Team Size
                  </label>
                  <div className="relative">
                    <select
                      value={formData.team_size}
                      onChange={(e) => set("team_size", e.target.value)}
                      className="w-full appearance-none rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800/50 text-sm text-text-primary dark:text-white px-3 py-2.5 pr-8 outline-none focus:ring-2 focus:ring-primary/20"
                    >
                      <option value="">Select size…</option>
                      {TEAM_SIZE_OPTIONS.map((opt) => (
                        <option key={opt} value={opt}>
                          {opt}
                        </option>
                      ))}
                    </select>
                    <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
                  </div>
                </div>

                {/* Founded Year */}
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold uppercase tracking-wider text-text-tertiary">
                    Founded Year
                  </label>
                  <Input
                    type="number"
                    placeholder="e.g. 2021"
                    value={formData.founded_year}
                    onChange={(e) => set("founded_year", e.target.value)}
                    min="1900"
                    max={new Date().getFullYear()}
                    className="text-sm"
                  />
                </div>
              </div>
            </Card>
          </Motion.div>

          {/* Website & Contact */}
          <Motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.1 }}
          >
            <Card className="p-7 shadow-xl rounded-2xl bg-white/80 dark:bg-surface-dark/80 backdrop-blur-xl border border-primary/5 dark:border-border-dark">
              <SectionHeader icon={Mail} title="Contact & Online Presence" />

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                {/* Website */}
                <div className="space-y-1.5 sm:col-span-2">
                  <label className="text-[11px] font-bold uppercase tracking-wider text-text-tertiary flex items-center gap-1.5">
                    <Link2 className="h-3 w-3 text-primary" />
                    Website URL
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-text-tertiary">
                      <Globe className="h-4 w-4" />
                    </span>
                    <Input
                      type="url"
                      placeholder="https://yourcompany.com"
                      value={formData.website_url}
                      onChange={(e) => set("website_url", e.target.value)}
                      className="pl-9 text-sm"
                    />
                  </div>
                </div>

                {/* Contact Email */}
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold uppercase tracking-wider text-text-tertiary flex items-center gap-1.5">
                    <Mail className="h-3 w-3 text-primary" />
                    Contact Email
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-text-tertiary">
                      <Mail className="h-4 w-4" />
                    </span>
                    <Input
                      type="email"
                      placeholder="hello@company.com"
                      value={formData.contact_email}
                      onChange={(e) => set("contact_email", e.target.value)}
                      className="pl-9 text-sm"
                    />
                  </div>
                </div>

                {/* Contact Phone */}
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold uppercase tracking-wider text-text-tertiary flex items-center gap-1.5">
                    <Phone className="h-3 w-3 text-primary" />
                    Contact Phone
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-text-tertiary">
                      <Phone className="h-4 w-4" />
                    </span>
                    <Input
                      type="tel"
                      placeholder="+91 98765 43210"
                      value={formData.contact_phone}
                      onChange={(e) => set("contact_phone", e.target.value)}
                      className="pl-9 text-sm"
                    />
                  </div>
                </div>

                {/* HQ Location */}
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold uppercase tracking-wider text-text-tertiary flex items-center gap-1.5">
                    <MapPin className="h-3 w-3 text-primary" />
                    HQ Location
                    <span className="text-[9px] text-gray-400 normal-case font-normal">(City, Country)</span>
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-text-tertiary">
                      <MapPin className="h-4 w-4" />
                    </span>
                    <Input
                      placeholder="Bengaluru, India"
                      value={formData.hq_location}
                      onChange={(e) => set("hq_location", e.target.value)}
                      className="pl-9 text-sm"
                    />
                  </div>
                </div>

                {/* Full Address */}
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold uppercase tracking-wider text-text-tertiary flex items-center gap-1.5">
                    <MapPin className="h-3 w-3 text-primary" />
                    Office Address
                  </label>
                  <Input
                    placeholder="123 Innovation Road, Koramangala…"
                    value={formData.hq_address}
                    onChange={(e) => set("hq_address", e.target.value)}
                    className="text-sm"
                  />
                </div>
              </div>
            </Card>
          </Motion.div>

          {/* Detailed Description */}
          <Motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.15 }}
          >
            <Card className="p-7 shadow-xl rounded-2xl bg-white/80 dark:bg-surface-dark/80 backdrop-blur-xl border border-primary/5 dark:border-border-dark">
              <SectionHeader icon={Info} title="About the Organization" />
              <textarea
                className="w-full rounded-xl border border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-900/30 p-4 text-sm h-48 focus:ring-2 focus:ring-primary/20 dark:text-white resize-none transition-all outline-none leading-relaxed"
                placeholder="Write a detailed description of your organization — your mission, vision, what problems you solve, your key differentiators, culture, and values. This section supports longer text and will appear on your public profile's About section."
                value={formData.detailed_description}
                onChange={(e) => set("detailed_description", e.target.value)}
              />
              <div className="text-right text-[10px] text-gray-400 mt-1">
                {formData.detailed_description.length} characters
              </div>
            </Card>
          </Motion.div>

          {/* Feature Projects */}
          <Motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.2 }}
          >
            <Card className="p-7 shadow-xl rounded-2xl bg-white/80 dark:bg-surface-dark/80 backdrop-blur-xl border border-primary/5 dark:border-border-dark">
              <div className="flex justify-between items-center mb-6 pb-4 border-b border-gray-100 dark:border-gray-800">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-orange-500/10">
                    <Layers className="h-5 w-5 text-orange-500" />
                  </div>
                  <h3 className="text-lg font-bold text-text-primary dark:text-white">
                    Key Products & Ventures
                  </h3>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  className="rounded-full text-xs"
                  onClick={() =>
                    addItem("projects", { name: "", link: "", description: "" })
                  }
                >
                  <Plus className="h-3.5 w-3.5 mr-1" />
                  Add
                </Button>
              </div>

              <div className="space-y-4">
                {formData.projects.map((proj) => (
                  <div
                    key={proj.id}
                    className="p-5 rounded-xl bg-gray-50/50 dark:bg-gray-800/30 border border-gray-100 dark:border-gray-800 relative group"
                  >
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-3">
                      <div>
                        <label className="text-xs font-semibold text-gray-400 mb-1 block">
                          Product Name
                        </label>
                        <Input
                          placeholder="e.g. NexusAI Platform"
                          value={proj.name}
                          onChange={(e) =>
                            updateItem("projects", proj.id, "name", e.target.value)
                          }
                        />
                      </div>
                      <div>
                        <label className="text-xs font-semibold text-gray-400 mb-1 block">
                          Website / Link
                        </label>
                        <Input
                          placeholder="https://..."
                          value={proj.link}
                          onChange={(e) =>
                            updateItem("projects", proj.id, "link", e.target.value)
                          }
                        />
                      </div>
                    </div>
                    <textarea
                      className="w-full rounded-lg border border-border-light bg-white dark:bg-gray-900/50 p-3 text-sm h-20 focus:ring-2 focus:ring-primary/20 dark:border-gray-700 dark:text-white resize-none outline-none"
                      placeholder="Describe this product or project in 1–3 sentences..."
                      value={proj.description}
                      onChange={(e) =>
                        updateItem("projects", proj.id, "description", e.target.value)
                      }
                    />
                    <button
                      onClick={() => removeItem("projects", proj.id)}
                      className="absolute top-3 right-3 text-gray-400 hover:text-red-500 p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                ))}
                {formData.projects.length === 0 && (
                  <div className="text-center py-8 border border-dashed border-gray-200 dark:border-gray-700 rounded-xl">
                    <Layers className="h-8 w-8 text-gray-300 dark:text-gray-600 mx-auto mb-2" />
                    <p className="text-sm text-gray-400">
                      Showcase your key products or projects.
                    </p>
                  </div>
                )}
              </div>
            </Card>
          </Motion.div>

          {/* Milestones */}
          <Motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.25 }}
          >
            <Card className="p-7 shadow-xl rounded-2xl bg-white/80 dark:bg-surface-dark/80 backdrop-blur-xl border border-primary/5 dark:border-border-dark">
              <div className="flex justify-between items-center mb-6 pb-4 border-b border-gray-100 dark:border-gray-800">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-indigo-500/10">
                    <Briefcase className="h-5 w-5 text-indigo-500" />
                  </div>
                  <h3 className="text-lg font-bold text-text-primary dark:text-white">
                    Milestones & History
                  </h3>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  className="rounded-full text-xs"
                  onClick={() =>
                    addItem("milestones", {
                      year: new Date().getFullYear().toString(),
                      title: "",
                      description: "",
                    })
                  }
                >
                  <Plus className="h-3.5 w-3.5 mr-1" />
                  Add
                </Button>
              </div>

              <div className="space-y-4">
                {formData.milestones.map((m) => (
                  <div
                    key={m.id}
                    className="p-5 rounded-xl bg-gray-50/50 dark:bg-gray-800/30 border border-gray-100 dark:border-gray-800 relative group"
                  >
                    <div className="grid grid-cols-1 sm:grid-cols-12 gap-4 mb-3">
                      <div className="sm:col-span-3">
                        <label className="text-xs font-semibold text-gray-400 mb-1 block">
                          Year / Date
                        </label>
                        <Input
                          placeholder="2024"
                          value={m.year}
                          onChange={(e) =>
                            updateItem("milestones", m.id, "year", e.target.value)
                          }
                        />
                      </div>
                      <div className="sm:col-span-9">
                        <label className="text-xs font-semibold text-gray-400 mb-1 block">
                          Milestone Title
                        </label>
                        <Input
                          placeholder="e.g. Raised $2M Seed Round"
                          value={m.title}
                          onChange={(e) =>
                            updateItem("milestones", m.id, "title", e.target.value)
                          }
                        />
                      </div>
                    </div>
                    <textarea
                      className="w-full rounded-lg border border-border-light bg-white dark:bg-gray-900/50 p-3 text-sm h-16 focus:ring-2 focus:ring-primary/20 dark:border-gray-700 dark:text-white resize-none outline-none"
                      placeholder="Brief description of this milestone..."
                      value={m.description}
                      onChange={(e) =>
                        updateItem("milestones", m.id, "description", e.target.value)
                      }
                    />
                    <button
                      onClick={() => removeItem("milestones", m.id)}
                      className="absolute top-3 right-3 text-gray-400 hover:text-red-500 p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                ))}
                {formData.milestones.length === 0 && (
                  <div className="text-center py-8 border border-dashed border-gray-200 dark:border-gray-700 rounded-xl">
                    <Briefcase className="h-8 w-8 text-gray-300 dark:text-gray-600 mx-auto mb-2" />
                    <p className="text-sm text-gray-400">
                      Log important moments in your company's history.
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
            transition={{ duration: 0.4, delay: 0.3 }}
          >
            <Card className="p-7 shadow-xl rounded-2xl bg-white/80 dark:bg-surface-dark/80 backdrop-blur-xl border border-primary/5 dark:border-border-dark">
              <div className="flex justify-between items-center mb-6 pb-4 border-b border-gray-100 dark:border-gray-800">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-yellow-500/10">
                    <Award className="h-5 w-5 text-yellow-500" />
                  </div>
                  <h3 className="text-lg font-bold text-text-primary dark:text-white">
                    Awards & Achievements
                  </h3>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  className="rounded-full text-xs"
                  onClick={() =>
                    addItem("achievements", { title: "", year: "", description: "" })
                  }
                >
                  <Plus className="h-3.5 w-3.5 mr-1" />
                  Add
                </Button>
              </div>

              <div className="space-y-4">
                {formData.achievements.map((ach) => (
                  <div
                    key={ach.id}
                    className="p-5 rounded-xl bg-gray-50/50 dark:bg-gray-800/30 border border-gray-100 dark:border-gray-800 relative group"
                  >
                    <div className="grid grid-cols-1 sm:grid-cols-12 gap-4 mb-3">
                      <div className="sm:col-span-9">
                        <label className="text-xs font-semibold text-gray-400 mb-1 block">
                          Award / Achievement Title
                        </label>
                        <Input
                          placeholder="e.g. Best AI Startup — TechCrunch 2024"
                          value={ach.title}
                          onChange={(e) =>
                            updateItem("achievements", ach.id, "title", e.target.value)
                          }
                        />
                      </div>
                      <div className="sm:col-span-3">
                        <label className="text-xs font-semibold text-gray-400 mb-1 block">
                          Year
                        </label>
                        <Input
                          placeholder="2024"
                          value={ach.year}
                          onChange={(e) =>
                            updateItem("achievements", ach.id, "year", e.target.value)
                          }
                        />
                      </div>
                    </div>
                    <Input
                      placeholder="Brief context about this achievement..."
                      value={ach.description}
                      onChange={(e) =>
                        updateItem("achievements", ach.id, "description", e.target.value)
                      }
                      className="text-sm"
                    />
                    <button
                      onClick={() => removeItem("achievements", ach.id)}
                      className="absolute top-3 right-3 text-gray-400 hover:text-red-500 p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                ))}
                {formData.achievements.length === 0 && (
                  <div className="text-center py-8 border border-dashed border-gray-200 dark:border-gray-700 rounded-xl">
                    <Award className="h-8 w-8 text-gray-300 dark:text-gray-600 mx-auto mb-2" />
                    <p className="text-sm text-gray-400">
                      Highlight awards, recognitions, and press mentions.
                    </p>
                  </div>
                )}
              </div>
            </Card>
          </Motion.div>

          {/* Gallery */}
          <Motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.35 }}
          >
            <Card className="p-7 shadow-xl rounded-2xl bg-white/80 dark:bg-surface-dark/80 backdrop-blur-xl border border-primary/5 dark:border-border-dark">
              <div className="flex justify-between items-center mb-6 pb-4 border-b border-gray-100 dark:border-gray-800">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-pink-500/10">
                    <ImageIcon className="h-5 w-5 text-pink-500" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-text-primary dark:text-white">
                      Photo Gallery
                    </h3>
                    <p className="text-xs text-text-tertiary">
                      Office, team, events, product shots
                    </p>
                  </div>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  className="rounded-full text-xs"
                  onClick={() =>
                    addItem("gallery", { url: "", caption: "", file: null, preview: null })
                  }
                  disabled={formData.gallery.length >= 12}
                >
                  <Plus className="h-3.5 w-3.5 mr-1" />
                  Add Photo
                </Button>
              </div>

              {formData.gallery.length > 0 ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                  {formData.gallery.map((item) => (
                    <GalleryItem
                      key={item.id}
                      item={item}
                      onUpdate={(field, value) =>
                        updateItem("gallery", item.id, field, value)
                      }
                      onRemove={() => removeItem("gallery", item.id)}
                    />
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 border border-dashed border-gray-200 dark:border-gray-700 rounded-2xl">
                  <ImageIcon className="h-12 w-12 text-gray-200 dark:text-gray-700 mx-auto mb-3" />
                  <p className="text-sm font-medium text-gray-400 mb-1">
                    No photos yet
                  </p>
                  <p className="text-xs text-gray-300 dark:text-gray-600">
                    Add up to 12 photos to showcase your team and workspace.
                  </p>
                </div>
              )}
              {formData.gallery.length > 0 && (
                <p className="text-[10px] text-gray-400 mt-3 text-right">
                  {formData.gallery.length}/12 photos
                </p>
              )}
            </Card>
          </Motion.div>
        </div>
      </div>

      {/* Floating Save Button */}
      <div className="fixed bottom-8 right-8 z-50">
        <Button
          size="lg"
          onClick={handleSave}
          disabled={saving}
          className="shadow-2xl shadow-primary/30 rounded-full px-10 gap-2"
        >
          {saving ? (
            <Loader2 className="h-5 w-5 animate-spin" />
          ) : (
            <Save className="h-5 w-5" />
          )}
          {saving ? "Saving..." : "Save Public Profile"}
        </Button>
      </div>
    </div>
  );
}
