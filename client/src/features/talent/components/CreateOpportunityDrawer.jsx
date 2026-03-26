import React, { useState, useEffect } from "react";
import {
  Building2,
  MapPin,
  Briefcase,
  IndianRupee,
  AlignLeft,
  ListChecks,
  Plus,
  X,
  UploadCloud,
  Link as LinkIcon,
  Image as ImageIcon,
} from "lucide-react";
import { Drawer } from "../../../components/ui/Drawer";
import { Button } from "../../../components/ui/Button";
import { useCreateOpportunity, useUpdateOpportunity } from "../../../hooks/useTalent";
import { toast } from "react-toastify";
import fileAssetService from "../../../services/fileAssetService";

export function CreateOpportunityDrawer({ isOpen, onClose, organizationId, opportunity }) {
  const isEditing = !!opportunity;

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    type: "job",
    compensation_type: "Salary",
    requirements: "",
    location: "Remote",
    budget_min: "",
    budget_max: "",
    duration: "",
    status: "Open",
  });

  const [mediaUrls, setMediaUrls] = useState([]);
  const [externalLinks, setExternalLinks] = useState([]);

  // States for link inputs
  const [showLinkInput, setShowLinkInput] = useState(false);
  const [linkUrl, setLinkUrl] = useState("");
  const [linkTitle, setLinkTitle] = useState("");

  const { mutateAsync: createOpportunity, isPending: isCreating } = useCreateOpportunity();
  const { mutateAsync: updateOpportunity, isPending: isUpdating } = useUpdateOpportunity();
  const isPending = isCreating || isUpdating;

  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    if (opportunity) {
      setFormData({
        title: opportunity.title || "",
        description: opportunity.description || "",
        type: opportunity.type || "job",
        compensation_type: opportunity.compensation_type || "Salary",
        requirements: Array.isArray(opportunity.skills) ? opportunity.skills.join(", ") : (opportunity.skills || ""),
        location: opportunity.location || "Remote",
        budget_min: opportunity.budget_min || "",
        budget_max: opportunity.budget_max || "",
        duration: opportunity.duration || "",
        status: opportunity.status || "Open",
      });
      setMediaUrls(opportunity.media_urls || []);
      setExternalLinks(opportunity.external_links || []);
    } else {
      // Reset for create mode
      setFormData({
        title: "",
        description: "",
        type: "job",
        compensation_type: "Salary",
        requirements: "",
        location: "Remote",
        budget_min: "",
        budget_max: "",
        duration: "",
        status: "Open",
      });
      setMediaUrls([]);
      setExternalLinks([]);
    }
  }, [opportunity, isOpen]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      toast.error("File exceeds the 10MB limit.");
      return;
    }

    setIsUploading(true);
    try {
      // Upload using organization context
      const uploadedFile = await fileAssetService.uploadFile(
        "organization",
        organizationId,
        file,
        file.name,
        "Attached to opportunity posting",
      );

      setMediaUrls((prev) => [...prev, uploadedFile.storageUrl]);
      toast.success("Image uploaded successfully.");
    } catch (error) {
      toast.error(error?.response?.data?.error || "Failed to upload image.");
    } finally {
      setIsUploading(false);
      event.target.value = "";
    }
  };

  const handleAddLink = async () => {
    if (!linkUrl || !linkTitle) {
      toast.error("Please provide both URL and title.");
      return;
    }

    setIsUploading(true);
    try {
      const addedLink = await fileAssetService.attachExternalLink(
        "organization",
        organizationId,
        linkTitle,
        linkUrl,
        "Opportunity external link",
      );
      setExternalLinks((prev) => [...prev, addedLink.storageUrl]);
      toast.success("Link added.");
      setLinkUrl("");
      setLinkTitle("");
      setShowLinkInput(false);
    } catch {
      toast.error("Failed to add link.");
    } finally {
      setIsUploading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (!organizationId) {
        toast.error("Organization ID is missing.");
        return;
      }

      // Prepare final payload with correct mapping
      const payload = {
        organization_id: organizationId,
        type: formData.type, // 'job', 'gig', 'internship'
        title: formData.title,
        description: formData.description,
        skills: formData.requirements
          ? (typeof formData.requirements === 'string' ? formData.requirements.split(",").map((s) => s.trim()) : formData.requirements)
          : [],
        compensation_type: formData.compensation_type,
        budget_min: formData.budget_min
          ? parseFloat(formData.budget_min)
          : null,
        budget_max: formData.budget_max
          ? parseFloat(formData.budget_max)
          : null,
        duration: formData.duration,
        media_urls: mediaUrls,
        external_links: externalLinks,
        status: formData.status,
      };

      if (isEditing) {
        await updateOpportunity({ id: opportunity.id, opportunityData: payload });
        toast.success("Opportunity updated successfully!");
      } else {
        await createOpportunity(payload);
        toast.success("Opportunity posted successfully!");
      }

      onClose();
    } catch (error) {
      toast.error(
        error?.response?.data?.message || `Failed to ${isEditing ? 'update' : 'post'} opportunity`,
      );
    }
  };

  return (
    <Drawer
      isOpen={isOpen}
      onClose={onClose}
      title={isEditing ? "Edit Opportunity" : "Post New Opportunity"}
      description={isEditing ? "Update the details of your opportunity posting." : "Create a rigorous posting to attract top talent. Connected resources will automatically sync with your organization's files."}
      className="max-w-3xl"
    >
      <form
        id="create-opportunity-form"
        onSubmit={handleSubmit}
        className="space-y-8 animate-in fade-in duration-300"
      >
        {/* Core Details section */}
        <section className="bg-white dark:bg-surface-dark border border-border-light dark:border-border-dark rounded-xl p-6 shadow-sm">
          <h3 className="text-sm font-bold text-text-primary dark:text-white uppercase tracking-wider mb-5 flex items-center gap-2">
            <Briefcase className="w-4 h-4 text-primary" /> Core Details
          </h3>
          <div className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-text-secondary dark:text-gray-300 mb-1">
                Job Title <span className="text-error">*</span>
              </label>
              <input
                required
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                placeholder="e.g. Senior React Developer"
                className="w-full h-11 px-4 rounded-lg border border-border-light dark:border-border-dark bg-gray-50 dark:bg-background-dark focus:ring-2 focus:ring-primary/20 focus:border-primary focus:bg-white transition-colors"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block text-sm font-medium text-text-secondary dark:text-gray-300 mb-1">
                  Opportunity Type <span className="text-error">*</span>
                </label>
                <select
                  name="type"
                  value={formData.type}
                  onChange={handleChange}
                  className="w-full h-11 px-4 rounded-lg border border-border-light dark:border-border-dark bg-gray-50 dark:bg-background-dark focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors cursor-pointer"
                >
                  <option value="job">Corporate Job</option>
                  <option value="internship">Internship Program</option>
                  <option value="gig">Independent Gig / Project</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-text-secondary dark:text-gray-300 mb-1">
                  Location
                </label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-tertiary" />
                  <input
                    type="text"
                    name="location"
                    value={formData.location}
                    onChange={handleChange}
                    placeholder="e.g. Remote, San Francisco"
                    className="w-full h-11 pl-9 pr-4 rounded-lg border border-border-light dark:border-border-dark bg-gray-50 dark:bg-background-dark focus:ring-2 focus:ring-primary/20 focus:border-primary focus:bg-white transition-colors"
                  />
                </div>
              </div>
            </div>

            {isEditing && (
              <div>
                <label className="block text-sm font-medium text-text-secondary dark:text-gray-300 mb-1">
                  Status
                </label>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  className="w-full h-11 px-4 rounded-lg border border-border-light dark:border-border-dark bg-gray-50 dark:bg-background-dark focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors cursor-pointer"
                >
                  <option value="Open">Open</option>
                  <option value="Closed">Closed</option>
                </select>
              </div>
            )}
          </div>
        </section>

        {/* Description & Requirements section */}
        <section className="bg-white dark:bg-surface-dark border border-border-light dark:border-border-dark rounded-xl p-6 shadow-sm">
          <h3 className="text-sm font-bold text-text-primary dark:text-white uppercase tracking-wider mb-5 flex items-center gap-2">
            <AlignLeft className="w-4 h-4 text-primary" /> The Role
          </h3>
          <div className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-text-secondary dark:text-gray-300 mb-1">
                Description <span className="text-error">*</span>
              </label>
              <textarea
                required
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows={4}
                placeholder="Describe the role, responsibilities, and team culture..."
                className="w-full p-4 rounded-lg border border-border-light dark:border-border-dark bg-gray-50 dark:bg-background-dark focus:ring-2 focus:ring-primary/20 focus:border-primary focus:bg-white transition-colors custom-scrollbar resize-none"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block text-sm font-medium text-text-secondary dark:text-gray-300 mb-1">
                  Required Skills
                </label>
                <div className="relative">
                  <ListChecks className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-tertiary" />
                  <input
                    type="text"
                    name="requirements"
                    value={formData.requirements}
                    onChange={handleChange}
                    placeholder="React, Node.js, NextJS"
                    className="w-full h-11 pl-9 pr-4 rounded-lg border border-border-light dark:border-border-dark bg-gray-50 dark:bg-background-dark focus:ring-2 focus:ring-primary/20 focus:border-primary focus:bg-white transition-colors"
                  />
                </div>
                <p className="text-[10px] text-text-tertiary mt-1">
                  Comma separated list.
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-text-secondary dark:text-gray-300 mb-1">
                  Duration
                </label>
                <input
                  type="text"
                  name="duration"
                  value={formData.duration}
                  onChange={handleChange}
                  placeholder="e.g. 3 Months, Full-time"
                  className="w-full h-11 px-4 rounded-lg border border-border-light dark:border-border-dark bg-gray-50 dark:bg-background-dark focus:ring-2 focus:ring-primary/20 focus:border-primary focus:bg-white transition-colors"
                />
              </div>
            </div>
          </div>
        </section>

        {/* Budget & Resources section */}
        <section className="bg-white dark:bg-surface-dark border border-border-light dark:border-border-dark rounded-xl p-6 shadow-sm">
          <h3 className="text-sm font-bold text-text-primary dark:text-white uppercase tracking-wider mb-5 flex items-center gap-2">
            <IndianRupee className="w-4 h-4 text-primary" /> Logistics &
            Resources
          </h3>
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              <div>
                <label className="block text-sm font-medium text-text-secondary dark:text-gray-300 mb-1">
                  Compensation <span className="text-error">*</span>
                </label>
                <select
                  name="compensation_type"
                  value={formData.compensation_type}
                  onChange={handleChange}
                  className="w-full h-11 px-4 rounded-lg border border-border-light dark:border-border-dark bg-gray-50 dark:bg-background-dark focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors cursor-pointer"
                >
                  <option value="Salary">Salary</option>
                  <option value="Fixed">Fixed Price</option>
                  <option value="Hourly">Hourly</option>
                  <option value="Stipend">Stipend</option>
                  <option value="Unpaid">Unpaid</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-text-secondary dark:text-gray-300 mb-1">
                  Min Budget/Salary
                </label>
                <input
                  type="number"
                  name="budget_min"
                  value={formData.budget_min}
                  onChange={handleChange}
                  placeholder="0"
                  className="w-full h-11 px-4 rounded-lg border border-border-light dark:border-border-dark bg-gray-50 dark:bg-background-dark focus:ring-2 focus:ring-primary/20 focus:border-primary focus:bg-white transition-colors"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-text-secondary dark:text-gray-300 mb-1">
                  Max Budget/Salary
                </label>
                <input
                  type="number"
                  name="budget_max"
                  value={formData.budget_max}
                  onChange={handleChange}
                  placeholder="0"
                  className="w-full h-11 px-4 rounded-lg border border-border-light dark:border-border-dark bg-gray-50 dark:bg-background-dark focus:ring-2 focus:ring-primary/20 focus:border-primary focus:bg-white transition-colors"
                />
              </div>
            </div>

            <div className="pt-4 border-t border-border-light dark:border-border-dark">
              <label className="block text-sm font-medium text-text-secondary dark:text-gray-300 mb-3">
                Featured Media & Links
              </label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Upload Image Button */}
                <div className="relative">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileUpload}
                    disabled={isUploading}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
                  />
                  <div
                    className={`p-4 rounded-xl border-2 border-dashed flex flex-col items-center justify-center gap-2 text-center transition-colors ${isUploading ? "bg-gray-50 border-gray-200" : "border-primary/30 bg-primary/5 hover:border-primary hover:bg-primary/10"}`}
                  >
                    <ImageIcon
                      className={`w-6 h-6 ${isUploading ? "text-gray-400" : "text-primary"}`}
                    />
                    <span
                      className={`text-sm font-medium ${isUploading ? "text-gray-400" : "text-primary"}`}
                    >
                      {isUploading ? "Uploading..." : "Upload Image"}
                    </span>
                  </div>
                </div>

                {/* Add Link Button */}
                {!showLinkInput ? (
                  <button
                    type="button"
                    onClick={() => setShowLinkInput(true)}
                    className="p-4 rounded-xl border-2 border-dashed border-blue-500/30 bg-blue-50/50 hover:border-blue-500 hover:bg-blue-50 transition-colors flex flex-col items-center justify-center gap-2 text-center"
                  >
                    <LinkIcon className="w-6 h-6 text-blue-500" />
                    <span className="text-sm font-medium text-blue-600">
                      Attach External Link
                    </span>
                  </button>
                ) : (
                  <div className="p-4 rounded-xl border border-blue-200 bg-blue-50 space-y-3">
                    <input
                      type="text"
                      placeholder="Link Title (e.g. Figma)"
                      value={linkTitle}
                      onChange={(e) => setLinkTitle(e.target.value)}
                      className="w-full h-9 px-3 text-sm rounded border border-blue-200 focus:ring-2 focus:ring-blue-500/20"
                    />
                    <input
                      type="url"
                      placeholder="https://"
                      value={linkUrl}
                      onChange={(e) => setLinkUrl(e.target.value)}
                      className="w-full h-9 px-3 text-sm rounded border border-blue-200 focus:ring-2 focus:ring-blue-500/20"
                    />
                    <div className="flex gap-2 justify-end">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setShowLinkInput(false)}
                        className="h-8"
                      >
                        Cancel
                      </Button>
                      <Button
                        size="sm"
                        onClick={handleAddLink}
                        disabled={isUploading}
                        className="h-8"
                      >
                        Add Link
                      </Button>
                    </div>
                  </div>
                )}
              </div>

              {/* Render Media */}
              {mediaUrls.length > 0 && (
                <div className="mt-4 flex flex-wrap gap-2">
                  {mediaUrls.map((url, idx) => (
                    <div
                      key={idx}
                      className="relative w-16 h-16 rounded-lg overflow-hidden border border-border-light shadow-sm group"
                    >
                      <img
                        src={url}
                        alt={`media-${idx}`}
                        className="w-full h-full object-cover"
                      />
                      <button
                        type="button"
                        onClick={() =>
                          setMediaUrls(mediaUrls.filter((_, i) => i !== idx))
                        }
                        className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white transition-opacity"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {/* Render Links */}
              {externalLinks.length > 0 && (
                <div className="mt-4 space-y-2">
                  {externalLinks.map((url, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between p-2 rounded-lg border border-border-light bg-gray-50 text-sm"
                    >
                      <span className="flex items-center gap-2 text-text-secondary truncate">
                        <LinkIcon className="w-3.5 h-3.5" /> {url}
                      </span>
                      <button
                        type="button"
                        onClick={() =>
                          setExternalLinks(
                            externalLinks.filter((_, i) => i !== idx),
                          )
                        }
                        className="text-text-tertiary hover:text-error transition-colors"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </section>

        {/* Footer Actions Spacer */}
        <div className="pb-24"></div>
      </form>

      {/* Floating Action Bar */}
      <div className="absolute bottom-0 left-0 right-0 p-5 bg-white/80 dark:bg-surface-dark/80 backdrop-blur-md border-t border-border-light dark:border-border-dark flex justify-end gap-3 z-10 shadow-[0_-10px_40px_-10px_rgba(0,0,0,0.1)]">
        <Button
          variant="outline"
          onClick={onClose}
          disabled={isPending}
          className="px-6"
        >
          Cancel
        </Button>
        <Button
          form="create-opportunity-form"
          type="submit"
          disabled={isPending || isUploading}
          className="min-w-[140px] shadow-lg shadow-primary/20"
        >
          {isPending 
            ? (isEditing ? "Updating..." : "Publishing...") 
            : (isEditing ? "Update Opportuntity" : "Publish Opportuntity")}
        </Button>
      </div>
    </Drawer>
  );
}
