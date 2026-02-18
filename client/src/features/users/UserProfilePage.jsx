import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import {
  User,
  Mail,
  Building,
  Save,
  X,
  Lock,
  Phone,
  MapPin,
  Briefcase,
  Hash,
  Linkedin,
  Github,
  Globe,
  Calendar,
  Activity,
} from "lucide-react";
import { Card } from "../../components/ui/Card";
import { Badge } from "../../components/ui/Badge";
import { Button } from "../../components/ui/Button";
import { useToast } from "../../components/ui/Toast";
import { ImageUpload } from "../../components/ui/ImageUpload";
import { apiClient } from "../../lib/axios";
import { useAuth } from "../../context/AuthContext";
import { Avatar } from "../../components/ui/Avatar";
import { cn } from "../../utils/cn";
import PhoneInput from "react-phone-input-2";
import "react-phone-input-2/lib/style.css";

// Helper for Profile Fields - Reused from AdminProfilePage for consistency
const ProfileField = ({
  label,
  icon: Icon,
  name,
  value,
  onChange,
  disabled,
  placeholder,
  type = "text",
  isEditing,
  options = [],
  error,
}) => {
  return (
    <div className="space-y-2">
      <label className="text-xs font-bold text-text-tertiary uppercase tracking-wide flex items-center gap-2">
        {label}
        {!isEditing && !value && (
          <span className="text-primary/60 text-[10px] lowercase font-normal italic">
            (empty)
          </span>
        )}
        {isEditing && (name === "full_name" || name === "email") && (
          <span className="text-primary">*</span>
        )}
      </label>
      <div className="relative group">
        {/* Standard Icon for non-phone inputs - ONLY in Edit Mode to avoid double icons in View Mode */}
        {isEditing && type !== "phone" && Icon && (
          <Icon className="absolute left-3.5 top-3.5 h-4 w-4 text-text-tertiary group-focus-within:text-primary transition-colors z-10" />
        )}

        {isEditing ? (
          options.length > 0 ? (
            <div className="relative">
              <select
                name={name}
                value={value || ""}
                onChange={onChange}
                disabled={disabled}
                className={cn(
                  "w-full pl-10 pr-10 py-3 border rounded-lg text-sm transition-all focus:ring-2 focus:ring-primary/20 outline-none appearance-none bg-white dark:bg-surface-dark border-border-light dark:border-border-dark cursor-pointer shadow-sm",
                )}
              >
                <option value="">Select {label}</option>
                {options.map((opt) => (
                  <option key={opt} value={opt}>
                    {opt}
                  </option>
                ))}
              </select>
              <div className="absolute inset-y-0 right-0 flex items-center px-4 pointer-events-none text-text-tertiary">
                <svg
                  className="h-4 w-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M19 9l-7 7-7-7"
                  ></path>
                </svg>
              </div>
            </div>
          ) : type === "phone" ? (
            <div
              className={cn(
                "phone-input-container relative",
                disabled && "opacity-60",
              )}
            >
              <PhoneInput
                country={"in"}
                value={value}
                onChange={(phone) =>
                  onChange({ target: { name, value: phone } })
                }
                disabled={disabled}
                enableSearch={true}
                disableSearchIcon={true}
                inputClass={cn(
                  "!w-full !py-3 !pl-[48px] !pr-4 !h-[46px] !text-sm !font-sans !bg-white dark:!bg-surface-dark !border-border-light dark:!border-border-dark !rounded-lg !transition-all focus:!ring-2 focus:!ring-primary/20 !shadow-sm",
                  "!text-text-primary dark:!text-white",
                )}
                buttonClass="!bg-gray-50 dark:!bg-gray-800 !border-border-light dark:!border-border-dark !rounded-l-lg hover:!bg-gray-100 dark:hover:!bg-gray-700 !pl-1"
                dropdownClass="!bg-white dark:!bg-surface-dark !text-text-primary dark:!text-white !shadow-xl !border-border-light dark:!border-border-dark !z-50"
                searchClass="!bg-gray-50 dark:!bg-gray-800 !text-text-primary dark:!text-white !p-2"
              />
            </div>
          ) : (
            <input
              name={name}
              type={type}
              value={value || ""}
              onChange={onChange}
              disabled={disabled}
              placeholder={placeholder}
              className={cn(
                "w-full pl-10 pr-4 py-3 border rounded-lg text-sm transition-all focus:ring-2 focus:ring-primary/20 outline-none shadow-sm",
                "bg-white dark:bg-surface-dark border-border-light dark:border-border-dark",
                disabled &&
                  "opacity-60 cursor-not-allowed bg-gray-50 dark:bg-gray-800",
              )}
            />
          )
        ) : (
          /* View Mode */
          <div className="w-full flex items-center px-4 py-3 border rounded-lg text-sm font-medium text-text-primary bg-gray-50/50 dark:bg-gray-800/20 shadow-sm border-border-light/50">
            {type === "phone" && value ? (
              <div className="flex items-center gap-3 w-full">
                <Phone className="h-4 w-4 text-text-tertiary" />
                <span className="font-mono tracking-wide">+{value}</span>
              </div>
            ) : (
              <div className="flex items-center gap-3 w-full">
                {Icon && <Icon className="h-4 w-4 text-text-tertiary" />}
                <span className="truncate">
                  {value || (
                    <span className="text-text-tertiary italic">Not set</span>
                  )}
                </span>
              </div>
            )}
          </div>
        )}
      </div>
      {error && (
        <p className="text-xs text-error mt-1 animate-in fade-in slide-in-from-top-1">
          {error}
        </p>
      )}
    </div>
  );
};

export function UserProfilePage() {
  const { id } = useParams();
  const { user: currentUser, login: updateAuthUser } = useAuth();
  const { addToast } = useToast();

  // Logic to determine if we are viewing own profile
  const isOwnProfile =
    !id ||
    (currentUser && currentUser._id === id) ||
    (currentUser && currentUser.id === id);

  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [avatarFile, setAvatarFile] = useState(null);
  const [initialData, setInitialData] = useState(null);
  const [errors, setErrors] = useState({});
  const [isDirty, setIsDirty] = useState(false);

  // Standard User Schema Fields
  const [data, setData] = useState({
    username: "",
    firstName: "",
    lastName: "",
    email: "",
    bio: "",
    role: "",
    avatar_url: "",
    phone_number: "",
    job_title: "",
    department: "",
    employee_id: "",
    office_location: "",
    social_linkedin: "",
    social_github: "",
    social_website: "",
    created_at: "",
    last_login: "",
  });

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true);

        let profileData;

        if (isOwnProfile) {
          // Fetch own profile
          const res = await apiClient.get("/users/me");
          profileData = res.data;
        } else {
          // Fallback or fetch specific user
          // For now using currentUser as fallback logic matches original intent
          profileData = { ...currentUser };
        }

        // Map API response (snake_case) to state (camelCase) where needed
        const mappedData = {
          ...profileData,
          firstName: profileData.first_name || profileData.firstName || "",
          lastName: profileData.last_name || profileData.lastName || "",
        };

        setData(mappedData);
        setInitialData(mappedData);
      } catch (error) {
        console.error("Failed to fetch profile", error);
        addToast("Failed to load profile data", "error");
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [id, isOwnProfile, currentUser, addToast]);

  // Check dirty state
  useEffect(() => {
    if (initialData) {
      const isChanged = JSON.stringify(data) !== JSON.stringify(initialData);
      const isAvatarChanged = avatarFile !== null;
      setIsDirty(isChanged || isAvatarChanged);
    }
  }, [data, avatarFile, initialData]);

  /* Smart Input Handling */
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setData((prev) => ({ ...prev, [name]: value }));
    validateField(name, value);
  };

  const validateField = (name, value) => {
    let error = null;
    if (name === "firstName" && !value.trim()) error = "First Name is required";
    if (name === "lastName" && !value.trim()) error = "Last Name is required";
    if (name === "email" && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value))
      error = "Invalid email address";
    if (name === "phone_number" && value && !/^[\d\s+-]{10,20}$/.test(value))
      error = "Invalid phone number";
    if (name === "social_website" && value && !/^https?:\/\//.test(value))
      error = "URL must start with http:// or https://";

    setErrors((prev) => ({ ...prev, [name]: error }));
    return error === null;
  };

  const handleSave = async () => {
    // Validation
    const validationRules = {
      firstName: (val) => (!val?.trim() ? "First Name is required" : null),
      lastName: (val) => (!val?.trim() ? "Last Name is required" : null),
      email: (val) =>
        !val?.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val)
          ? "Valid Email is required"
          : null,
      role: (val) => (!val ? "Account Type is required" : null),
      phone_number: (val) =>
        val && !/^[\d\s+-]{10,20}$/.test(val) ? "Invalid phone number" : null,
    };

    const newErrors = {};
    Object.keys(validationRules).forEach((field) => {
      const error = validationRules[field](data[field]);
      if (error) newErrors[field] = error;
    });

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      addToast("Please fix validation errors", "error");
      return;
    }

    if (!isDirty && !avatarFile) {
      addToast("No changes detected", "info");
      return;
    }

    try {
      let finalAvatarUrl = data.avatar_url;

      if (avatarFile) {
        const formData = new FormData();
        formData.append("file", avatarFile);
        formData.append("visibility", "public");

        const uploadRes = await apiClient.post("/files/upload", formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        finalAvatarUrl = uploadRes.data.file.url;
      }

      // Update User Profile
      // NOTE: Using /users/profile as per userRoutes.js: router.put("/profile", userController.updateProfile);
      const res = await apiClient.put("/users/profile", {
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        bio: data.bio,
        avatar_url: finalAvatarUrl,
        phone_number: data.phone_number,
        job_title: data.job_title,
        department: data.department,
        office_location: data.office_location,
        social_linkedin: data.social_linkedin,
        social_github: data.social_github,
        social_website: data.social_website,
        role: data.role,
      });

      const updatedUser = res.data.user;
      setData((prev) => ({ ...prev, ...updatedUser }));

      // Update global context
      updateAuthUser(updatedUser);
      setInitialData(updatedUser);
      setIsEditing(false);
      setAvatarFile(null);
      addToast("Profile updated successfully", "success");
    } catch (error) {
      console.error("Failed to update profile", error);
      addToast("Failed to update profile", "error");
    }
  };

  if (loading)
    return (
      <div className="p-10 flex justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );

  return (
    <div className="w-full max-w-[1920px] mx-auto space-y-8 animate-in fade-in duration-500 pb-20 px-6 pt-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border-light dark:border-border-dark pb-6">
        <div>
          <h1 className="text-3xl font-bold text-text-primary dark:text-white">
            My Profile
          </h1>
          <p className="text-text-secondary dark:text-gray-400 mt-1">
            Manage your personal information and account details.
          </p>
        </div>
        <div className="flex gap-3">
          {isOwnProfile &&
            (isEditing ? (
              <>
                <Button
                  variant="ghost"
                  onClick={() => {
                    setIsEditing(false);
                    setData(initialData);
                    setAvatarFile(null);
                  }}
                >
                  <X className="h-4 w-4 mr-2" /> Cancel
                </Button>
                <Button
                  variant="primary"
                  onClick={handleSave}
                  disabled={!isDirty}
                >
                  <Save className="h-4 w-4 mr-2" /> Save Changes
                </Button>
              </>
            ) : (
              <Button variant="outline" onClick={() => setIsEditing(true)}>
                Edit Profile
              </Button>
            ))}
        </div>
      </div>

      <div className="grid grid-cols-12 gap-8">
        {/* Left Sidebar: Identity Card */}
        <div className="col-span-12 lg:col-span-4 xl:col-span-3 space-y-6">
          <Card className="p-0 bg-white dark:bg-surface-dark overflow-hidden sticky top-24 shadow-lg border-border-light dark:border-border-dark ring-1 ring-black/5">
            {/* Styling - reusing admin gradient but maybe different hue for user? Keeping consistent for now as requested. */}
            <div className="h-32 relative overflow-hidden">
              <div className="absolute inset-0 bg-linear-to-r from-blue-600 via-indigo-600 to-violet-600 opacity-90"></div>
              <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20"></div>
              <div className="absolute inset-0 bg-linear-to-b from-transparent to-black/20"></div>
            </div>

            <div className="px-6 pb-6 text-center relative">
              <div className="relative inline-block -mt-16 mb-4 group">
                {isEditing ? (
                  <div className="bg-white dark:bg-surface-dark rounded-full p-1.5 shadow-2xl ring-4 ring-white/50 dark:ring-surface-dark/50">
                    <ImageUpload
                      value={data.avatar_url}
                      onChange={setAvatarFile}
                      className="mx-auto"
                    />
                  </div>
                ) : (
                  <div className="relative">
                    <Avatar
                      size="xl"
                      src={data.avatar_url}
                      fallback={
                        data.username?.substring(0, 2).toUpperCase() || "US"
                      }
                      className="h-32 w-32 ring-4 ring-white dark:ring-surface-dark shadow-2xl bg-white text-2xl font-bold"
                    />
                    <div
                      className="absolute bottom-2 right-2 h-5 w-5 bg-success rounded-full border-4 border-white dark:border-surface-dark shadow-xs"
                      title="Online"
                    ></div>
                  </div>
                )}
              </div>

              <div className="space-y-1 mb-4">
                <h2 className="text-2xl font-bold text-text-primary dark:text-white tracking-tight">
                  {data.firstName} {data.lastName}
                </h2>
                <p
                  className="text-sm font-medium text-primary line-clamp-1 px-4"
                  title={data.job_title || data.department}
                >
                  {data.job_title || data.department || "Team Member"}
                </p>
              </div>

              <div className="flex gap-2 justify-center mb-8">
                <Badge
                  variant="neutral"
                  className="px-3 py-1 uppercase tracking-widest text-[10px] font-bold shadow-xs bg-gray-100 text-text-secondary border border-gray-200"
                >
                  {data.department || data.role || "User"}
                </Badge>
              </div>

              <div className="space-y-4 mb-8 text-left">
                {data.office_location && (
                  <div className="flex items-center gap-3 p-3 rounded-lg bg-gray-50 dark:bg-gray-800/50 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors group">
                    <div className="h-8 w-8 rounded-full bg-white dark:bg-surface-dark flex items-center justify-center shadow-xs text-text-tertiary group-hover:text-primary transition-colors">
                      <MapPin className="h-4 w-4" />
                    </div>
                    <div className="overflow-hidden">
                      <p className="text-[10px] uppercase font-bold text-text-tertiary tracking-wide">
                        Location
                      </p>
                      <p className="text-sm text-text-secondary truncate font-medium">
                        {data.office_location}
                      </p>
                    </div>
                  </div>
                )}

                {data.email && (
                  <div className="flex items-center gap-3 p-3 rounded-lg bg-gray-50 dark:bg-gray-800/50 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors group">
                    <div className="h-8 w-8 rounded-full bg-white dark:bg-surface-dark flex items-center justify-center shadow-xs text-text-tertiary group-hover:text-primary transition-colors">
                      <Mail className="h-4 w-4" />
                    </div>
                    <div className="overflow-hidden">
                      <p className="text-[10px] uppercase font-bold text-text-tertiary tracking-wide">
                        Email
                      </p>
                      <p
                        className="text-sm text-text-secondary truncate font-medium"
                        title={data.email}
                      >
                        {data.email}
                      </p>
                    </div>
                  </div>
                )}

                {data.phone_number && (
                  <div className="flex items-center gap-3 p-3 rounded-lg bg-gray-50 dark:bg-gray-800/50 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors group">
                    <div className="h-8 w-8 rounded-full bg-white dark:bg-surface-dark flex items-center justify-center shadow-xs text-text-tertiary group-hover:text-primary transition-colors shrink-0">
                      <Phone className="h-4 w-4" />
                    </div>
                    <div className="overflow-hidden w-full">
                      <p className="text-[10px] uppercase font-bold text-text-tertiary tracking-wide mb-0.5">
                        Contact
                      </p>
                      <div className="pointer-events-none mt-0.5">
                        <PhoneInput
                          value={data.phone_number}
                          displayInitialValueAsLocalNumber
                          disabled={true}
                          disableDropdown={true}
                          inputClass="!bg-transparent !border-none !text-sm !font-medium !text-text-secondary !h-auto !w-full !cursor-text !pl-9 !m-0 !py-0"
                          buttonClass="!bg-transparent !border-none !absolute !top-0 !left-0 !bottom-0"
                          dropdownClass="hidden"
                          containerClass="!w-full !relative !h-5"
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 gap-0 border-t border-border-light dark:border-border-dark pt-0 -mx-6 bg-gray-50/30 dark:bg-gray-800/20 divide-x divide-border-light dark:divide-border-dark">
                <div className="text-center p-4 hover:bg-gray-50 dark:hover:bg-gray-800/40 transition-colors">
                  <p className="text-xs text-text-tertiary uppercase font-bold flex items-center justify-center gap-1.5 mb-1">
                    <Calendar className="h-3.5 w-3.5" /> Joined
                  </p>
                  <p className="text-base font-bold text-text-primary dark:text-white tabular-nums">
                    {data.created_at
                      ? new Date(data.created_at).getFullYear()
                      : "N/A"}
                  </p>
                </div>
                <div className="text-center p-4 border-l border-border-light dark:border-border-dark hover:bg-gray-50 dark:hover:bg-gray-800/40 transition-colors">
                  <p className="text-xs text-text-tertiary uppercase font-bold flex items-center justify-center gap-1.5 mb-1">
                    <Activity className="h-3.5 w-3.5" /> Status
                  </p>
                  <div className="flex items-center justify-center gap-1.5">
                    <span className="relative flex h-2.5 w-2.5">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-success opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-success"></span>
                    </span>
                    <span className="text-base font-bold text-text-primary dark:text-white">
                      Active
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </div>

        {/* Right Content: Identity Form */}
        <div className="col-span-12 lg:col-span-8 xl:col-span-9 space-y-8">
          <Card className="p-8 bg-white dark:bg-surface-dark shadow-sm space-y-8">
            {/* 1. Identity Section */}
            <div>
              <h3 className="text-lg font-bold text-text-primary dark:text-white mb-6 flex items-center gap-2 pb-4 border-b border-border-light dark:border-border-dark">
                <User className="h-5 w-5 text-primary" /> General Identity
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Row 1: Username and Account Type */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-text-tertiary uppercase tracking-wide flex items-center gap-2">
                    Username
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-3.5 h-4 w-4 text-text-tertiary" />
                    <div className="w-full pl-10 pr-4 py-3 bg-gray-100 dark:bg-gray-800 border border-border-light dark:border-border-dark rounded-lg text-sm font-mono text-text-secondary select-all">
                      {data.username}
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-text-tertiary uppercase tracking-wide flex items-center gap-2">
                    Account Type
                  </label>
                  {isEditing ? (
                    <div className="w-full">
                      <select
                        name="role"
                        value={data.role || "normal_user"}
                        onChange={handleInputChange}
                        className="w-full h-full px-3 py-3 bg-white dark:bg-surface-dark border border-border-light dark:border-border-dark rounded-lg text-sm font-medium focus:ring-2 focus:ring-primary/20 outline-none transition-all cursor-pointer"
                      >
                        <option value="normal_user">Normal User</option>
                        <option value="founder">Founder</option>
                        <option value="freelancer">Freelancer</option>
                        <option value="student">Student</option>
                      </select>
                    </div>
                  ) : (
                    <div className="w-full px-4 py-3 bg-gray-100 dark:bg-gray-800 border border-border-light dark:border-border-dark rounded-lg text-sm font-bold uppercase text-text-secondary whitespace-nowrap">
                      {data.role?.replace("_", " ") || "USER"}
                    </div>
                  )}
                </div>

                {/* Row 2: First Name and Last Name */}
                <ProfileField
                  label="First Name"
                  icon={User}
                  name="firstName"
                  value={data.firstName}
                  onChange={handleInputChange}
                  isEditing={isEditing}
                  placeholder="First Name"
                  error={errors.firstName}
                />

                <ProfileField
                  label="Last Name"
                  icon={User}
                  name="lastName"
                  value={data.lastName}
                  onChange={handleInputChange}
                  isEditing={isEditing}
                  placeholder="Last Name"
                  error={errors.lastName}
                />

                <div className="col-span-1 md:col-span-2 space-y-2">
                  <label className="text-xs font-bold text-text-tertiary uppercase tracking-wide">
                    Bio / Notes
                  </label>
                  {isEditing ? (
                    <textarea
                      name="bio"
                      rows={3}
                      value={data.bio || ""}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border rounded-lg text-sm transition-all focus:ring-2 focus:ring-primary/20 outline-none resize-none bg-white dark:bg-surface-dark border-border-light dark:border-border-dark"
                      placeholder="Tell us a little about yourself..."
                    />
                  ) : (
                    <div className="w-full px-4 py-3 border border-transparent rounded-lg text-sm text-text-primary bg-gray-50/50 dark:bg-gray-800/20 italic min-h-[50px]">
                      {data.bio || (
                        <span className="text-text-tertiary">
                          No bio provided.
                        </span>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* 2. Professional Section */}
            <div>
              <h3 className="text-lg font-bold text-text-primary dark:text-white mb-6 flex items-center gap-2 pb-4 border-b border-border-light dark:border-border-dark">
                <Briefcase className="h-5 w-5 text-primary" /> Professional
                Details
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* For general users, department might just be text or we can provide common options */}
                <ProfileField
                  label="Department"
                  icon={Building}
                  name="department"
                  value={data.department}
                  onChange={handleInputChange}
                  isEditing={isEditing}
                  placeholder="e.g. Engineering, Marketing"
                  error={errors.department}
                />

                <ProfileField
                  label="Job Title"
                  icon={Briefcase}
                  name="job_title"
                  value={data.job_title}
                  onChange={handleInputChange}
                  isEditing={isEditing}
                  placeholder="What is your official designation?"
                  error={errors.job_title}
                />

                <ProfileField
                  label="Employee ID (Optional)"
                  icon={Hash}
                  name="employee_id"
                  value={data.employee_id}
                  onChange={handleInputChange}
                  isEditing={isEditing}
                  placeholder="Your unique ID"
                  error={errors.employee_id}
                />

                <ProfileField
                  label="Office Location"
                  icon={MapPin}
                  name="office_location"
                  value={data.office_location}
                  onChange={handleInputChange}
                  isEditing={isEditing}
                  placeholder="Where are you stationed?"
                  error={errors.office_location}
                />
              </div>
            </div>

            {/* 3. Contact & Social Section */}
            <div>
              <h3 className="text-lg font-bold text-text-primary dark:text-white mb-6 flex items-center gap-2 pb-4 border-b border-border-light dark:border-border-dark">
                <Phone className="h-5 w-5 text-primary" /> Contact & Social
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <ProfileField
                  label="Email Address"
                  icon={Mail}
                  name="email"
                  value={data.email}
                  onChange={handleInputChange}
                  isEditing={isEditing}
                  type="email"
                  placeholder="name@company.com"
                  error={errors.email}
                />

                <ProfileField
                  label="Phone Number"
                  icon={Phone}
                  name="phone_number"
                  value={data.phone_number}
                  onChange={handleInputChange}
                  isEditing={isEditing}
                  type="phone"
                  placeholder="+1 (555) 000-0000"
                  error={errors.phone_number}
                />

                <ProfileField
                  label="LinkedIn Username / URL"
                  icon={Linkedin}
                  name="social_linkedin"
                  value={data.social_linkedin}
                  onChange={handleInputChange}
                  isEditing={isEditing}
                  type="text"
                  placeholder="username or full profile url"
                  error={errors.social_linkedin}
                />

                <ProfileField
                  label="GitHub Username / URL"
                  icon={Github}
                  name="social_github"
                  value={data.social_github}
                  onChange={handleInputChange}
                  isEditing={isEditing}
                  type="text"
                  placeholder="username or full profile url"
                  error={errors.social_github}
                />

                <div className="col-span-1 md:col-span-2">
                  <ProfileField
                    label="Personal Website"
                    icon={Globe}
                    name="social_website"
                    value={data.social_website}
                    onChange={handleInputChange}
                    isEditing={isEditing}
                    type="url"
                    placeholder="https://your-portfolio.com"
                    error={errors.social_website}
                  />
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
