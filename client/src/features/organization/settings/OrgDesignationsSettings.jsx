import React, { useState, useEffect, useCallback } from "react";
import { Card } from "../../../components/ui/Card";
import { Button } from "../../../components/ui/Button";
import { Input } from "../../../components/ui/Input";
import { apiClient } from "../../../lib/axios";
import { toast } from "react-toastify";
import {
  Briefcase,
  Building,
  Plus,
  Edit2,
  Trash2,
  X,
  AlertTriangle,
  Loader2,
} from "lucide-react";

export function OrgDesignationsSettings({ isFounder, isAdmin }) {
  const [departments, setDepartments] = useState([]);
  const [designations, setDesignations] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Generic state
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Department Modal States
  const [showDeptModal, setShowDeptModal] = useState(false);
  const [editingDept, setEditingDept] = useState(null);
  const [deptName, setDeptName] = useState("");

  const [showDeptDeleteModal, setShowDeptDeleteModal] = useState(false);
  const [deptToDelete, setDeptToDelete] = useState(null);

  // Role Modal States
  const [showRoleModal, setShowRoleModal] = useState(false);
  const [editingRole, setEditingRole] = useState(null);
  const [roleTitle, setRoleTitle] = useState("");
  const [roleDeptId, setRoleDeptId] = useState("");

  const [showRoleDeleteModal, setShowRoleDeleteModal] = useState(false);
  const [roleToDelete, setRoleToDelete] = useState(null);

  // Search states
  const [deptSearch, setDeptSearch] = useState("");
  const [roleSearch, setRoleSearch] = useState("");

  const fetchData = useCallback(async () => {
    try {
      setIsLoading(true);
      const [deptRes, desigRes] = await Promise.all([
        apiClient.get("/org/departments"),
        apiClient.get("/org/designations"),
      ]);
      setDepartments(deptRes.data.departments || []);
      setDesignations(desigRes.data.designations || []);
    } catch {
      toast.error("Failed to load departments and roles");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // --- Department Handlers ---
  const openCreateDept = () => {
    setEditingDept(null);
    setDeptName("");
    setShowDeptModal(true);
  };

  const openEditDept = (dept) => {
    setEditingDept(dept);
    setDeptName(dept.name);
    setShowDeptModal(true);
  };

  const saveDepartment = async (e) => {
    e.preventDefault();
    if (!deptName.trim()) return toast.error("Department name is required");

    try {
      setIsSaving(true);
      if (editingDept) {
        await apiClient.put(`/org/departments/${editingDept.department_id}`, {
          name: deptName,
        });
        toast.success("Department updated successfully");
      } else {
        await apiClient.post("/org/departments", { name: deptName });
        toast.success("Department created successfully");
      }
      setShowDeptModal(false);
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.error || "Failed to save department");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteDept = async () => {
    if (!deptToDelete) return;
    try {
      setIsDeleting(true);
      await apiClient.delete(`/org/departments/${deptToDelete.department_id}`);
      toast.success("Department deleted successfully");
      setShowDeptDeleteModal(false);
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.error || "Failed to delete department");
    } finally {
      setIsDeleting(false);
    }
  };

  // --- Role Handlers ---
  const openCreateRole = () => {
    setEditingRole(null);
    setRoleTitle("");
    setRoleDeptId("");
    setShowRoleModal(true);
  };

  const openEditRole = (role) => {
    setEditingRole(role);
    setRoleTitle(role.title);
    setRoleDeptId(role.department_id || "");
    setShowRoleModal(true);
  };

  const saveRole = async (e) => {
    e.preventDefault();
    if (!roleTitle.trim()) return toast.error("Role/Title is required");

    try {
      setIsSaving(true);
      const payload = {
        title: roleTitle,
        department_id: roleDeptId ? parseInt(roleDeptId, 10) : null,
      };

      if (editingRole) {
        await apiClient.put(
          `/org/designations/${editingRole.designation_id}`,
          payload,
        );
        toast.success("Role updated successfully");
      } else {
        await apiClient.post("/org/designations", payload);
        toast.success("Role created successfully");
      }
      setShowRoleModal(false);
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.error || "Failed to save role");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteRole = async () => {
    if (!roleToDelete) return;
    try {
      setIsDeleting(true);
      await apiClient.delete(
        `/org/designations/${roleToDelete.designation_id}`,
      );
      toast.success("Role deleted successfully");
      setShowRoleDeleteModal(false);
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.error || "Failed to delete role");
    } finally {
      setIsDeleting(false);
    }
  };

  const canManage = isFounder || isAdmin;

  if (isLoading) {
    return (
      <Card className="bg-white dark:bg-surface-dark border border-border-light dark:border-border-dark shadow-sm rounded-xl p-12 flex justify-center items-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
        {/* DEPARTMENTS CARD */}
        <Card className="bg-white dark:bg-surface-dark border border-border-light dark:border-border-dark shadow-sm rounded-xl overflow-hidden flex flex-col min-h-[400px]">
          <div className="flex flex-col gap-4">
            <div className="flex justify-between items-center bg-gray-50/50 dark:bg-white/5 p-6 border-b border-border-light dark:border-border-dark shrink-0">
              <div>
                <h2 className="text-lg font-bold text-text-primary dark:text-white flex items-center gap-2">
                  <Building className="w-5 h-5 text-primary" /> Departments
                </h2>
                <p className="text-sm text-text-secondary dark:text-gray-400 mt-1">
                  Logical groups for your workspace.
                </p>
              </div>
              {canManage && (
                <Button
                  onClick={openCreateDept}
                  size="sm"
                  className="flex items-center gap-1.5 h-9 rounded-full"
                >
                  <Plus className="w-4 h-4" /> Add
                </Button>
              )}
            </div>
            <div className="px-6 pb-2">
              <Input
                placeholder="Search departments..."
                value={deptSearch}
                onChange={(e) => setDeptSearch(e.target.value)}
                className="h-9 text-xs"
              />
            </div>
          </div>

          <div className="p-0 overflow-y-auto flex-1 custom-scrollbar max-h-[400px]">
            {departments.length === 0 ? (
              <div className="p-8 text-center text-text-secondary dark:text-gray-400">
                No departments created yet.
              </div>
            ) : (
              <table className="w-full text-left text-sm whitespace-nowrap">
                <thead className="bg-gray-50/80 dark:bg-gray-800/80 text-text-secondary dark:text-gray-400 sticky top-0 z-10 backdrop-blur-sm">
                  <tr>
                    <th className="px-5 py-3 font-medium">Department Name</th>
                    {canManage && (
                      <th className="px-5 py-3 font-medium text-right w-24">
                        Actions
                      </th>
                    )}
                  </tr>
                </thead>
                <tbody className="divide-y divide-border-light dark:divide-border-dark">
                  {departments
                    .filter((dept) =>
                      dept.name
                        .toLowerCase()
                        .includes(deptSearch.toLowerCase()),
                    )
                    .map((dept) => (
                      <tr
                        key={dept.department_id}
                        className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
                      >
                        <td className="px-5 py-3 font-medium text-text-primary dark:text-white">
                          {dept.name}
                        </td>
                        {canManage && (
                          <td className="px-5 py-3 text-right">
                            <button
                              onClick={() => openEditDept(dept)}
                              className="p-1.5 text-text-tertiary hover:text-primary hover:bg-primary/10 rounded-md transition-colors mr-1"
                              title="Edit"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => {
                                setDeptToDelete(dept);
                                setShowDeptDeleteModal(true);
                              }}
                              className="p-1.5 text-text-tertiary hover:text-error hover:bg-error/10 rounded-md transition-colors"
                              title="Delete"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </td>
                        )}
                      </tr>
                    ))}
                </tbody>
              </table>
            )}
          </div>
        </Card>

        {/* ROLES CARD */}
        <Card className="bg-white dark:bg-surface-dark border border-border-light dark:border-border-dark shadow-sm rounded-xl overflow-hidden flex flex-col min-h-[400px]">
          <div className="flex flex-col gap-4">
            <div className="flex justify-between items-center bg-gray-50/50 dark:bg-white/5 p-6 border-b border-border-light dark:border-border-dark shrink-0">
              <div>
                <h2 className="text-lg font-bold text-text-primary dark:text-white flex items-center gap-2">
                  <Briefcase className="w-5 h-5 text-primary" /> Roles & Titles
                </h2>
                <p className="text-sm text-text-secondary dark:text-gray-400 mt-1">
                  Specific designations within a department.
                </p>
              </div>
              {canManage && (
                <Button
                  onClick={openCreateRole}
                  size="sm"
                  className="flex items-center gap-1.5 h-9 rounded-full"
                >
                  <Plus className="w-4 h-4" /> Add
                </Button>
              )}
            </div>
            <div className="px-6 pb-2">
              <Input
                placeholder="Search roles or departments..."
                value={roleSearch}
                onChange={(e) => setRoleSearch(e.target.value)}
                className="h-9 text-xs"
              />
            </div>
          </div>

          <div className="p-0 overflow-y-auto flex-1 custom-scrollbar max-h-[400px]">
            {designations.length === 0 ? (
              <div className="p-8 text-center text-text-secondary dark:text-gray-400">
                No roles defined yet.
              </div>
            ) : (
              <table className="w-full text-left text-sm whitespace-nowrap">
                <thead className="bg-gray-50/80 dark:bg-gray-800/80 text-text-secondary dark:text-gray-400 sticky top-0 z-10 backdrop-blur-sm">
                  <tr>
                    <th className="px-5 py-3 font-medium">Role / Title</th>
                    <th className="px-5 py-3 font-medium">Department</th>
                    {canManage && (
                      <th className="px-5 py-3 font-medium text-right w-24">
                        Actions
                      </th>
                    )}
                  </tr>
                </thead>
                <tbody className="divide-y divide-border-light dark:divide-border-dark">
                  {designations
                    .filter(
                      (role) =>
                        role.title
                          .toLowerCase()
                          .includes(roleSearch.toLowerCase()) ||
                        (role.department &&
                          role.department
                            .toLowerCase()
                            .includes(roleSearch.toLowerCase())),
                    )
                    .map((role) => (
                      <tr
                        key={role.designation_id}
                        className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
                      >
                        <td className="px-5 py-3 font-medium text-text-primary dark:text-white">
                          {role.title}
                        </td>
                        <td className="px-5 py-3 text-text-secondary dark:text-gray-400">
                          {role.department ? (
                            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-300">
                              {role.department}
                            </span>
                          ) : (
                            <span className="text-gray-400 italic text-xs">
                              Unassigned
                            </span>
                          )}
                        </td>
                        {canManage && (
                          <td className="px-5 py-3 text-right">
                            <button
                              onClick={() => openEditRole(role)}
                              className="p-1.5 text-text-tertiary hover:text-primary hover:bg-primary/10 rounded-md transition-colors mr-1"
                              title="Edit"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => {
                                setRoleToDelete(role);
                                setShowRoleDeleteModal(true);
                              }}
                              className="p-1.5 text-text-tertiary hover:text-error hover:bg-error/10 rounded-md transition-colors"
                              title="Delete"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </td>
                        )}
                      </tr>
                    ))}
                </tbody>
              </table>
            )}
          </div>
        </Card>
      </div>

      {/* --- MODALS --- */}

      {/* Department Manage Modal */}
      {showDeptModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-950/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white dark:bg-surface-dark rounded-xl shadow-xl w-full max-w-md overflow-hidden border border-border-light dark:border-border-dark">
            <div className="px-5 py-4 border-b border-border-light dark:border-border-dark flex items-center justify-between bg-gray-50/50 dark:bg-white/5">
              <h3 className="text-base font-bold text-text-primary dark:text-white flex items-center gap-2">
                <Building className="w-4 h-4 text-primary" />
                {editingDept ? "Edit Department" : "Create Department"}
              </h3>
              <button
                type="button"
                onClick={() => setShowDeptModal(false)}
                className="p-1.5 rounded-lg text-text-tertiary hover:bg-gray-100 dark:hover:bg-white/10 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <form onSubmit={saveDepartment} className="p-5 space-y-4">
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-text-secondary">
                  Department Name <span className="text-error">*</span>
                </label>
                <Input
                  value={deptName}
                  onChange={(e) => setDeptName(e.target.value)}
                  placeholder="e.g. Engineering, Sales, Marketing"
                  disabled={isSaving}
                  autoFocus
                  required
                />
              </div>
              <div className="flex gap-3 pt-3">
                <Button
                  type="button"
                  variant="outline"
                  className="flex-1"
                  onClick={() => setShowDeptModal(false)}
                  disabled={isSaving}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="flex-1"
                  disabled={isSaving || !deptName.trim()}
                >
                  {isSaving ? "Saving..." : "Save"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Role Manage Modal */}
      {showRoleModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-950/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white dark:bg-surface-dark rounded-xl shadow-xl w-full max-w-md overflow-hidden border border-border-light dark:border-border-dark">
            <div className="px-5 py-4 border-b border-border-light dark:border-border-dark flex items-center justify-between bg-gray-50/50 dark:bg-white/5">
              <h3 className="text-base font-bold text-text-primary dark:text-white flex items-center gap-2">
                <Briefcase className="w-4 h-4 text-primary" />
                {editingRole ? "Edit Role" : "Create Role"}
              </h3>
              <button
                type="button"
                onClick={() => setShowRoleModal(false)}
                className="p-1.5 rounded-lg text-text-tertiary hover:bg-gray-100 dark:hover:bg-white/10 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <form onSubmit={saveRole} className="p-5 space-y-4">
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-text-secondary">
                  Role / Title <span className="text-error">*</span>
                </label>
                <Input
                  value={roleTitle}
                  onChange={(e) => setRoleTitle(e.target.value)}
                  placeholder="e.g. Lead Developer, Marketing Executive"
                  disabled={isSaving}
                  autoFocus
                  required
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-text-secondary">
                  Select Department
                </label>
                <select
                  value={roleDeptId}
                  onChange={(e) => setRoleDeptId(e.target.value)}
                  className="w-full h-10 px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary text-sm transition-colors"
                  disabled={isSaving}
                >
                  <option value="">-- No Department --</option>
                  {departments.map((d) => (
                    <option key={d.department_id} value={d.department_id}>
                      {d.name}
                    </option>
                  ))}
                </select>
                {departments.length === 0 && (
                  <p className="text-xs text-text-tertiary mt-1">
                    Tip: Create departments first to assign them.
                  </p>
                )}
              </div>
              <div className="flex gap-3 pt-3">
                <Button
                  type="button"
                  variant="outline"
                  className="flex-1"
                  onClick={() => setShowRoleModal(false)}
                  disabled={isSaving}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="flex-[1.5]"
                  disabled={isSaving || !roleTitle.trim()}
                >
                  {isSaving ? "Saving..." : "Save Role"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Department Delete Confirmation */}
      {showDeptDeleteModal && deptToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-950/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white dark:bg-surface-dark rounded-xl shadow-xl w-full max-w-[400px] overflow-hidden border border-border-light dark:border-border-dark text-center pb-6">
            <div className="flex justify-end p-2">
              <button
                onClick={() => setShowDeptDeleteModal(false)}
                className="p-1.5 rounded-lg text-text-tertiary hover:bg-gray-100 dark:hover:bg-white/10"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="w-12 h-12 rounded-full bg-error/10 flex items-center justify-center mx-auto mb-4 border border-error/20">
              <AlertTriangle className="w-6 h-6 text-error" />
            </div>
            <h4 className="text-lg font-bold text-text-primary dark:text-white px-6">
              Delete Department
            </h4>
            <p className="text-sm text-text-secondary dark:text-gray-400 mt-2 px-6">
              Delete <strong>{deptToDelete.name}</strong>? Roles assigned to
              this department will become unassigned.
            </p>
            <div className="flex justify-center gap-3 mt-6 px-6">
              <Button
                variant="outline"
                onClick={() => setShowDeptDeleteModal(false)}
                disabled={isDeleting}
                className="w-full"
              >
                Cancel
              </Button>
              <Button
                variant="danger"
                onClick={handleDeleteDept}
                disabled={isDeleting}
                className="w-full bg-error hover:bg-error/90 text-white border-0"
              >
                {isDeleting ? "Deleting..." : "Delete Department"}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Role Delete Confirmation */}
      {showRoleDeleteModal && roleToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-950/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white dark:bg-surface-dark rounded-xl shadow-xl w-full max-w-[400px] overflow-hidden border border-border-light dark:border-border-dark text-center pb-6">
            <div className="flex justify-end p-2">
              <button
                onClick={() => setShowRoleDeleteModal(false)}
                className="p-1.5 rounded-lg text-text-tertiary hover:bg-gray-100 dark:hover:bg-white/10"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="w-12 h-12 rounded-full bg-error/10 flex items-center justify-center mx-auto mb-4 border border-error/20">
              <AlertTriangle className="w-6 h-6 text-error" />
            </div>
            <h4 className="text-lg font-bold text-text-primary dark:text-white px-6">
              Delete Role
            </h4>
            <p className="text-sm text-text-secondary dark:text-gray-400 mt-2 px-6">
              Delete role <strong>{roleToDelete.title}</strong>? Any team
              members holding this role will be affected.
            </p>
            <div className="flex justify-center gap-3 mt-6 px-6">
              <Button
                variant="outline"
                onClick={() => setShowRoleDeleteModal(false)}
                disabled={isDeleting}
                className="w-full"
              >
                Cancel
              </Button>
              <Button
                variant="danger"
                onClick={handleDeleteRole}
                disabled={isDeleting}
                className="w-full bg-error hover:bg-error/90 text-white border-0"
              >
                {isDeleting ? "Deleting..." : "Delete Role"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
