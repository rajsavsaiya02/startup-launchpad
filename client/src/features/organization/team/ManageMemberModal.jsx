import React, { useState, useEffect } from "react";
import {
  X,
  Shield,
  Users,
  Building,
  AlertCircle,
  Save,
  Trash2,
  Crown,
  Loader2,
} from "lucide-react";
import { Button } from "../../../components/ui/Button";
import { Drawer } from "../../../components/ui/Drawer";
import { CreatableSelect } from "../../../components/ui/CreatableSelect";
import { apiClient } from "../../../lib/axios";
import { toast } from "react-toastify";

const ALLOWED_ROLE_GRANTS = {
  FOUNDER: ["CO-FOUNDER", "ADMIN", "MEMBER", "GUEST"],
  "CO-FOUNDER": ["CO-FOUNDER", "ADMIN", "MEMBER", "GUEST"],
  ADMIN: ["ADMIN", "MEMBER", "GUEST"],
  MEMBER: [],
  GUEST: [],
};

export function ManageMemberModal({
  isOpen,
  onClose,
  targetMember,
  myRole,
  onUpdateSuccess,
}) {
  const [loading, setLoading] = useState(false);
  const [designations, setDesignations] = useState([]);

  // Form State
  const [selectedRole, setSelectedRole] = useState("MEMBER");
  const [departments, setDepartments] = useState([]);
  const [selectedDepartment, setSelectedDepartment] = useState("");
  const [selectedDesignation, setSelectedDesignation] = useState("");

  useEffect(() => {
    if (isOpen && targetMember) {
      setSelectedRole(targetMember.org_role || "MEMBER");

      const fetchData = async () => {
        try {
          const [deptsRes, desigsRes] = await Promise.all([
            apiClient.get("/org/departments"),
            apiClient.get("/org/designations"),
          ]);

          const depts = deptsRes.data.departments || [];
          const desigs = desigsRes.data.designations || [];

          setDepartments(depts);
          setDesignations(desigs);

          if (targetMember.designation_id) {
            const currentDesignation = desigs.find(
              (d) => d.designation_id === targetMember.designation_id,
            );
            if (currentDesignation) {
              setSelectedDesignation(currentDesignation.title);
              const dept = depts.find(
                (d) => d.department_id === currentDesignation.department_id,
              );
              if (dept) {
                setSelectedDepartment(dept.name);
              }
            }
          }
        } catch {
          toast.error("Failed to load organization roles.");
        }
      };

      fetchData();
    } else {
      setSelectedRole("MEMBER");
      setSelectedDepartment("");
      setSelectedDesignation("");
      setDesignations([]);
      setDepartments([]);
    }
  }, [isOpen, targetMember]);

  if (!isOpen || !targetMember) return null;

  const canEditTarget =
    myRole === "FOUNDER" ||
    myRole === "CO-FOUNDER" ||
    (myRole === "ADMIN" &&
      targetMember.org_role !== "FOUNDER" &&
      targetMember.org_role !== "CO-FOUNDER");

  if (!canEditTarget) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
        <div className="bg-white dark:bg-surface-dark rounded-xl shadow-2xl w-full max-w-sm p-6 text-center">
          <AlertCircle className="mx-auto h-10 w-10 text-error mb-3" />
          <h2 className="text-lg font-bold dark:text-white mb-2">
            Access Denied
          </h2>
          <p className="text-sm text-text-secondary mb-4">
            You do not have permission to modify this member.
          </p>
          <Button onClick={onClose} className="w-full">
            Close
          </Button>
        </div>
      </div>
    );
  }

  const allowableRoles = ALLOWED_ROLE_GRANTS[myRole] || [];

  const departmentOptions = departments.map((d) => d.name);
  const designationOptions = designations
    .filter((d) => {
      if (!selectedDepartment) return true;
      const dept = departments.find((dept) => dept.name === selectedDepartment);
      return d.department_id === dept?.department_id;
    })
    .map((d) => d.title);

  const handleSubmit = async () => {
    try {
      setLoading(true);
      let finalDesignationId = null;

      if (selectedDesignation) {
        const exactMatch = designations.find((d) => {
          const deptMatch = selectedDepartment
            ? departments.find((dept) => dept.name === selectedDepartment)
                ?.department_id === d.department_id
            : true;
          return (
            d.title.toLowerCase() === selectedDesignation.toLowerCase() &&
            deptMatch
          );
        });

        if (exactMatch) {
          finalDesignationId = exactMatch.designation_id;
        } else {
          toast.error(
            "Invalid role designated. Please select from the dropdown.",
          );
          setLoading(false);
          return;
        }
      }

      await apiClient.put("/org/members/role", {
        target_member_id: targetMember.organization_member_id,
        new_role: selectedRole,
        designation_id: finalDesignationId,
      });

      toast.success("Member position updated");
      onUpdateSuccess();
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.error || "Failed to update member");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Drawer
      isOpen={isOpen}
      onClose={onClose}
      title="Update Position"
      description={`Manage role and designation for ${targetMember.first_name} ${targetMember.last_name}`}
      className="w-full sm:max-w-md md:max-w-lg lg:max-w-[500px]"
    >
      <div className="flex flex-col h-full">
        {/* Header Profile Section */}
        <div className="flex items-center gap-4 mb-8 p-4 bg-primary/5 dark:bg-primary/10 rounded-2xl border border-primary/10">
          <div className="w-12 h-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-bold text-xl border border-primary/20 shrink-0 shadow-sm">
            {targetMember.first_name?.[0] ||
              targetMember.email?.[0]?.toUpperCase()}
          </div>
          <div className="overflow-hidden">
            <h3 className="text-lg font-bold text-text-primary dark:text-white truncate">
              {targetMember.first_name} {targetMember.last_name}
            </h3>
            <p className="text-sm text-text-tertiary truncate">
              {targetMember.email}
            </p>
          </div>
        </div>

        {/* Content area */}
        <div className="flex-1 space-y-8">
          {/* Access Level */}
          <div className="space-y-3">
            <label className="flex items-center gap-1.5 text-xs font-bold text-text-secondary uppercase tracking-wider">
              <Shield className="w-3.5 h-3.5" /> System Access
            </label>
            <div className="grid grid-cols-2 gap-3">
              {allowableRoles.includes("CO-FOUNDER") && (
                <button
                  onClick={() => setSelectedRole("CO-FOUNDER")}
                  className={`p-3 rounded-xl border text-left transition-all duration-200 flex flex-col gap-1.5 group ${
                    selectedRole === "CO-FOUNDER"
                      ? "border-primary bg-primary/5 shadow-sm ring-1 ring-primary/20"
                      : "border-border-light dark:border-border-dark hover:border-primary/40 dark:hover:border-primary/40 hover:bg-gray-50 dark:hover:bg-gray-800/50"
                  }`}
                >
                  <div
                    className={`flex items-center gap-2 font-semibold ${selectedRole === "CO-FOUNDER" ? "text-primary" : "text-text-primary dark:text-gray-300 group-hover:text-primary transition-colors"}`}
                  >
                    <Crown className="w-4 h-4" /> Co-Founder
                  </div>
                  <span className="text-[10px] text-text-tertiary leading-tight">
                    Full control & ownership.
                  </span>
                </button>
              )}
              {allowableRoles.includes("ADMIN") && (
                <button
                  onClick={() => setSelectedRole("ADMIN")}
                  className={`p-3 rounded-xl border text-left transition-all duration-200 flex flex-col gap-1.5 group ${
                    selectedRole === "ADMIN"
                      ? "border-blue-500 bg-blue-500/5 shadow-sm ring-1 ring-blue-500/20"
                      : "border-border-light dark:border-border-dark hover:border-blue-500/40 dark:hover:border-blue-500/40 hover:bg-gray-50 dark:hover:bg-gray-800/50"
                  }`}
                >
                  <div
                    className={`flex items-center gap-2 font-semibold ${selectedRole === "ADMIN" ? "text-blue-600 dark:text-blue-400" : "text-text-primary dark:text-gray-300 group-hover:text-blue-500 transition-colors"}`}
                  >
                    <Shield className="w-4 h-4" /> Admin
                  </div>
                  <span className="text-[10px] text-text-tertiary leading-tight">
                    Manage members & settings.
                  </span>
                </button>
              )}
              {allowableRoles.includes("MEMBER") && (
                <button
                  onClick={() => setSelectedRole("MEMBER")}
                  className={`p-3 rounded-xl border text-left transition-all duration-200 flex flex-col gap-1.5 group ${
                    selectedRole === "MEMBER"
                      ? "border-green-500 bg-green-500/5 shadow-sm ring-1 ring-green-500/20"
                      : "border-border-light dark:border-border-dark hover:border-green-500/40 dark:hover:border-green-500/40 hover:bg-gray-50 dark:hover:bg-gray-800/50"
                  }`}
                >
                  <div
                    className={`flex items-center gap-2 font-semibold ${selectedRole === "MEMBER" ? "text-green-600 dark:text-green-400" : "text-text-primary dark:text-gray-300 group-hover:text-green-500 transition-colors"}`}
                  >
                    <Users className="w-4 h-4" /> Employee
                  </div>
                  <span className="text-[10px] text-text-tertiary leading-tight">
                    Standard collaborative access.
                  </span>
                </button>
              )}
              {allowableRoles.includes("GUEST") && (
                <button
                  onClick={() => setSelectedRole("GUEST")}
                  className={`p-3 rounded-xl border text-left transition-all duration-200 flex flex-col gap-1.5 group ${
                    selectedRole === "GUEST"
                      ? "border-gray-500 bg-gray-500/5 shadow-sm ring-1 ring-gray-500/20"
                      : "border-border-light dark:border-border-dark hover:border-gray-500/40 dark:hover:border-gray-500/40 hover:bg-gray-50 dark:hover:bg-gray-800/50"
                  }`}
                >
                  <div
                    className={`flex items-center gap-2 font-semibold ${selectedRole === "GUEST" ? "text-gray-700 dark:text-gray-300" : "text-text-primary dark:text-gray-300 group-hover:text-gray-600 dark:group-hover:text-gray-400 transition-colors"}`}
                  >
                    <Building className="w-4 h-4" /> Guest
                  </div>
                  <span className="text-[10px] text-text-tertiary leading-tight">
                    External or limited view.
                  </span>
                </button>
              )}
            </div>
          </div>

          {/* Role & Department */}
          <div className="space-y-4 pt-6 border-t border-border-light/50 dark:border-border-dark/50">
            <label className="flex items-center gap-1.5 text-xs font-bold text-text-secondary uppercase tracking-wider mb-2">
              Designation
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <CreatableSelect
                name="department"
                label="Department"
                placeholder="Select department..."
                options={departmentOptions}
                value={selectedDepartment}
                onChange={(e) => {
                  setSelectedDepartment(e.target.value);
                  setSelectedDesignation(""); // Reset designation when department changes
                }}
                allowCreate={false}
                allowDelete={false}
              />
              <CreatableSelect
                name="designation"
                label="Role / Title"
                placeholder="Select title..."
                options={designationOptions}
                value={selectedDesignation}
                onChange={(e) => setSelectedDesignation(e.target.value)}
                allowCreate={false}
                allowDelete={false}
              />
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="pt-8 mt-auto flex gap-3">
          <Button
            variant="ghost"
            onClick={onClose}
            disabled={loading}
            className="flex-1"
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={loading}
            className="flex-2 shadow-sm"
          >
            {loading ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <Save className="w-4 h-4 mr-2" />
            )}
            {loading ? "Saving..." : "Save Changes"}
          </Button>
        </div>
      </div>
    </Drawer>
  );
}
