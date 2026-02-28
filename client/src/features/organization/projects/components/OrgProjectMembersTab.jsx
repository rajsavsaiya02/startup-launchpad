import React, { useState, useEffect, useMemo } from "react";
import { Card } from "../../../../components/ui/Card";
import { Avatar } from "../../../../components/ui/Avatar";
import { Badge } from "../../../../components/ui/Badge";
import { Button } from "../../../../components/ui/Button";
import {
  Users,
  UserPlus,
  LogOut,
  Loader2,
  Search,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { toast } from "react-toastify";
import { useAuth } from "../../../../context/AuthContext";
import orgProjectService from "../../../../services/organization/orgProjectService";
import { OrgAssignMembersModal } from "./OrgAssignMembersModal";
import { StatusBadge } from "../../team/StatusBadge";
import { cn } from "../../../../utils/cn";

export function OrgProjectMembersTab({ projectId }) {
  const { user } = useAuth();
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [memberToRem, setMemberToRem] = useState(null);
  const [myOrgRole, setMyOrgRole] = useState("GUEST");
  const [myProjectRole, setMyProjectRole] = useState(null);

  // Search & Pagination State
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const fetchMembers = React.useCallback(async () => {
    try {
      setLoading(true);
      const data = await orgProjectService.getProjectMembers(projectId);
      setMembers(data);

      const me = data.find((m) => m.user_id === user?.id);
      if (me) {
        setMyOrgRole(me.org_role || "GUEST");
        setMyProjectRole(me.project_role);
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to load project members.");
    } finally {
      setLoading(false);
    }
  }, [projectId, user?.id]);

  useEffect(() => {
    if (projectId) {
      fetchMembers();
    }
  }, [projectId, fetchMembers]);

  // Current user's metadata from the members list
  const currentUserMember = members.find((m) => m.user_id === user?.id);
  const isTeamLead = currentUserMember?.is_team_lead;

  const canManageAccess =
    myOrgRole === "FOUNDER" ||
    myOrgRole === "CO-FOUNDER" ||
    myOrgRole === "ADMIN" ||
    myProjectRole === "owner" ||
    isTeamLead;

  const handleRemoveMemberAction = async (memberToCheck) => {
    const isMe = memberToCheck.user_id === user?.id;
    try {
      await orgProjectService.removeProjectMember(
        projectId,
        memberToCheck.user_id,
      );
      toast.success(
        isMe ? "You have left the project." : "Member removed successfully.",
      );
      if (isMe) {
        window.location.href = "/org/projects"; // Redirect if leaving
      } else {
        fetchMembers();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Action failed");
    } finally {
      setMemberToRem(null);
    }
  };

  // Memoized Search Filtering
  const filteredMembers = useMemo(() => {
    if (!searchTerm.trim()) return members;
    const lowSearch = searchTerm.toLowerCase();
    return members.filter(
      (m) =>
        `${m.first_name} ${m.last_name}`.toLowerCase().includes(lowSearch) ||
        m.email.toLowerCase().includes(lowSearch) ||
        (m.designation_title || "").toLowerCase().includes(lowSearch) ||
        (m.org_role || "").toLowerCase().includes(lowSearch),
    );
  }, [members, searchTerm]);

  // Pagination Logic
  const totalItems = filteredMembers.length;
  const totalPages = Math.ceil(totalItems / rowsPerPage);
  const startIndex = (currentPage - 1) * rowsPerPage;
  const endIndex = Math.min(startIndex + rowsPerPage, totalItems);
  const currentMembersPaginated = filteredMembers.slice(startIndex, endIndex);

  // Reset page when search changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, rowsPerPage]);

  if (loading) {
    return (
      <div className="w-full flex flex-col items-center justify-center py-24 gap-4">
        <Loader2 className="animate-spin h-10 w-10 text-primary" />
        <p className="text-sm font-bold text-text-tertiary animate-pulse">
          Loading project team...
        </p>
      </div>
    );
  }

  return (
    <div className="w-full animate-in fade-in slide-in-from-bottom-4 duration-500 pb-16">
      <Card className="overflow-visible bg-white dark:bg-surface-dark shadow-sm border border-border-light dark:border-border-dark">
        <div className="p-6 border-b border-border-light dark:border-border-dark flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-gray-50/50 dark:bg-gray-800/20">
          <div>
            <h3 className="text-lg font-bold text-text-primary dark:text-white">
              Project Access & Team
            </h3>
            <p className="text-sm text-text-secondary">
              Members and teams assigned to this project.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
            {/* Search Bar */}
            <div className="relative group flex-1 md:flex-none md:min-w-[240px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-tertiary group-focus-within:text-primary transition-colors" />
              <input
                type="text"
                placeholder="Search member..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-white dark:bg-gray-900 border border-border-light dark:border-border-dark rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all shadow-sm"
              />
            </div>

            {canManageAccess && (
              <Button
                onClick={() => setIsAssignModalOpen(true)}
                className="gap-2 shadow-sm font-bold tracking-wider uppercase text-xs h-10"
              >
                <UserPlus className="h-4 w-4" /> Manage Access
              </Button>
            )}
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm min-w-[800px]">
            <thead className="bg-gray-50 dark:bg-gray-800/50 border-b border-border-light dark:border-border-dark">
              <tr>
                <th className="px-6 py-3 font-semibold text-text-tertiary">
                  Member
                </th>
                <th className="px-6 py-3 font-semibold text-text-tertiary">
                  Org Role
                </th>
                <th className="px-6 py-3 font-semibold text-text-tertiary">
                  Status
                </th>
                <th className="px-6 py-3 font-semibold text-text-tertiary">
                  Department / Title
                </th>
                <th className="px-6 py-3 font-semibold text-text-tertiary">
                  Added
                </th>
                <th className="px-6 py-3 font-semibold text-text-tertiary text-right">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-light dark:divide-border-dark">
              {currentMembersPaginated.length === 0 ? (
                <tr>
                  <td
                    colSpan="6"
                    className="p-12 text-center text-text-tertiary"
                  >
                    <Users className="h-10 w-10 mx-auto mb-3 opacity-20" />
                    <p className="text-sm font-bold">
                      {searchTerm
                        ? "No members match your search."
                        : "No team members assigned."}
                    </p>
                  </td>
                </tr>
              ) : (
                currentMembersPaginated.map((member) => {
                  const isHighAuth =
                    ["FOUNDER", "CO-FOUNDER", "ADMIN"].includes(
                      member.org_role,
                    ) || member.is_team_lead;

                  const highAuthMembers = members.filter(
                    (m) =>
                      ["FOUNDER", "CO-FOUNDER", "ADMIN"].includes(m.org_role) ||
                      m.is_team_lead,
                  );

                  const isLastHighAuth =
                    isHighAuth && highAuthMembers.length === 1;

                  return (
                    <tr
                      key={member.user_id}
                      className="group hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <Avatar
                            src={member.avatar || null}
                            fallback={member.first_name?.[0] || "U"}
                            size="sm"
                          />
                          <div>
                            <div className="text-sm font-bold text-text-primary dark:text-white group-hover:text-primary transition-colors flex items-center gap-2">
                              {member.first_name} {member.last_name}
                              {member.user_id === user?.id && (
                                <span className="text-[10px] bg-primary/10 text-primary px-2 py-0.5 rounded-full">
                                  You
                                </span>
                              )}
                              {member.project_role === "owner" && (
                                <span className="text-[10px] bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 px-2 py-0.5 rounded-full border border-amber-200 dark:border-amber-800">
                                  Owner
                                </span>
                              )}
                              {member.is_team_lead && (
                                <span className="text-[10px] bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400 px-2 py-0.5 rounded-full border border-indigo-200 dark:border-indigo-800">
                                  Team Lead
                                </span>
                              )}
                            </div>
                            <div className="text-xs text-text-tertiary">
                              {member.email}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <Badge
                          variant={
                            member.org_role === "FOUNDER" ||
                            member.org_role === "CO-FOUNDER"
                              ? "primary"
                              : member.org_role === "ADMIN"
                                ? "success"
                                : "neutral"
                          }
                        >
                          {member.org_role || "MEMBER"}
                        </Badge>
                      </td>
                      <td className="px-6 py-4">
                        <StatusBadge statusLabel={member.status} />
                      </td>
                      <td className="px-6 py-4 text-text-secondary dark:text-gray-400">
                        <div className="font-bold text-sm text-text-primary dark:text-gray-200">
                          {member.designation_title || "No Title"}
                        </div>
                        {member.department && (
                          <span className="text-xs opacity-75 block">
                            {member.department}
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-text-secondary dark:text-gray-400">
                        {new Date(member.joined_at).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right flex items-center justify-end gap-2">
                        {(member.user_id === user?.id ||
                          (canManageAccess &&
                            member.project_role !== "owner")) && (
                          <button
                            disabled={isLastHighAuth}
                            onClick={() => setMemberToRem(member)}
                            title={
                              isLastHighAuth
                                ? "At least one High-Authority member (Founder/Admin/TL) must remain."
                                : member.user_id === user?.id
                                  ? "Leave Project"
                                  : "Remove from Project"
                            }
                            className={cn(
                              "p-2 rounded-lg transition-colors border",
                              isLastHighAuth
                                ? "opacity-30 cursor-not-allowed text-text-tertiary border-transparent"
                                : "text-text-tertiary hover:text-error hover:bg-error/10 hover:border-error/20 border-transparent",
                            )}
                          >
                            <LogOut className="w-4 h-4" />
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Section */}
        {totalItems > 0 && (
          <div className="p-4 border-t border-border-light dark:border-border-dark flex flex-col md:flex-row items-center justify-between gap-4 bg-gray-50/10 dark:bg-gray-800/5">
            <div className="flex items-center gap-4 text-[10px] sm:text-xs text-text-tertiary font-black tracking-widest uppercase">
              <div className="flex items-center gap-1.5">
                SHOWING{" "}
                <span className="text-text-primary dark:text-white">
                  {startIndex + 1}
                </span>{" "}
                TO{" "}
                <span className="text-text-primary dark:text-white">
                  {endIndex}
                </span>{" "}
                OF{" "}
                <span className="text-text-primary dark:text-white">
                  {totalItems}
                </span>{" "}
                MEMBERS
              </div>

              <div className="w-px h-4 bg-border-light dark:bg-border-dark hidden sm:block" />

              <div className="flex items-center gap-2">
                <span>SHOW</span>
                <select
                  value={rowsPerPage}
                  onChange={(e) => setRowsPerPage(Number(e.target.value))}
                  className="bg-white dark:bg-gray-900 border border-border-light dark:border-border-dark rounded-lg text-[10px] font-black py-1 px-1.5 focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all cursor-pointer"
                >
                  {[10, 20, 50, 100].map((val) => (
                    <option key={val} value={val}>
                      {val}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="p-2 rounded-full border border-border-light dark:border-border-dark disabled:opacity-20 disabled:cursor-not-allowed hover:bg-gray-100 dark:hover:bg-gray-800 transition-all text-text-tertiary"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>

              <div className="flex items-center gap-1">
                {Array.from({ length: totalPages }, (_, i) => i + 1)
                  .filter((page) => {
                    // Simple logic to show a few pages if too many
                    if (totalPages <= 7) return true;
                    if (page === 1 || page === totalPages) return true;
                    return Math.abs(page - currentPage) <= 1;
                  })
                  .map((page, index, array) => (
                    <React.Fragment key={page}>
                      {index > 0 && array[index - 1] !== page - 1 && (
                        <span className="px-1 text-text-tertiary">...</span>
                      )}
                      <button
                        onClick={() => setCurrentPage(page)}
                        className={cn(
                          "min-w-[32px] h-8 flex items-center justify-center rounded-full text-xs font-black transition-all",
                          currentPage === page
                            ? "bg-primary text-white shadow-lg shadow-primary/20"
                            : "text-text-tertiary hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-text-primary dark:hover:text-white",
                        )}
                      >
                        {page}
                      </button>
                    </React.Fragment>
                  ))}
              </div>

              <button
                onClick={() =>
                  setCurrentPage((p) => Math.min(totalPages, p + 1))
                }
                disabled={currentPage === totalPages || totalPages === 0}
                className="p-2 rounded-full border border-border-light dark:border-border-dark disabled:opacity-20 disabled:cursor-not-allowed hover:bg-gray-100 dark:hover:bg-gray-800 transition-all text-text-tertiary"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </Card>

      <OrgAssignMembersModal
        isOpen={isAssignModalOpen}
        onClose={() => setIsAssignModalOpen(false)}
        projectId={projectId}
        currentMembers={members}
        onAssignSuccess={fetchMembers}
      />

      {memberToRem && (
        <RemoveMemberConfirmModal
          member={memberToRem}
          isMe={memberToRem.user_id === user?.id}
          onClose={() => setMemberToRem(null)}
          onConfirm={() => handleRemoveMemberAction(memberToRem)}
        />
      )}
    </div>
  );
}

function RemoveMemberConfirmModal({ member, isMe, onClose, onConfirm }) {
  const [isDeleting, setIsDeleting] = useState(false);

  const handleConfirm = async () => {
    setIsDeleting(true);
    await onConfirm();
    setIsDeleting(false);
  };

  return (
    <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-in fade-in duration-300">
      <div className="bg-white dark:bg-surface-dark rounded-[2.5rem] shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-400 border border-white/20">
        <div className="p-8 text-center space-y-6">
          <div className="mx-auto w-20 h-20 bg-error/10 rounded-3xl flex items-center justify-center animate-bounce-subtle">
            <LogOut className="w-10 h-10 text-error" />
          </div>

          <div className="space-y-2">
            <h3 className="text-2xl font-black text-text-primary dark:text-white leading-tight">
              {isMe ? "Leave Project?" : "Remove Member?"}
            </h3>
            <p className="text-sm text-text-tertiary font-medium px-4">
              {isMe
                ? "Are you sure you want to leave this project? You will lose access to all project resources."
                : `Are you sure you want to remove ${member.first_name} from the project? They will no longer have access.`}
            </p>
          </div>

          <div className="flex items-center gap-4 bg-gray-50 dark:bg-gray-800/50 p-4 rounded-2xl border border-border-light dark:border-border-dark">
            <Avatar
              src={member.avatar}
              fallback={member.first_name?.[0]}
              size="md"
            />
            <div className="text-left">
              <p className="text-base font-black text-text-primary dark:text-white">
                {member.first_name} {member.last_name}
              </p>
              <p className="text-xs text-text-tertiary font-bold">
                {member.designation_title || member.org_role}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 pt-2">
            <Button
              variant="outline"
              onClick={onClose}
              disabled={isDeleting}
              className="rounded-2xl border-border-light font-black hover:bg-gray-100 transition-all h-12"
            >
              Cancel
            </Button>
            <Button
              onClick={handleConfirm}
              disabled={isDeleting}
              className="bg-error hover:bg-error-dark text-white rounded-2xl font-black shadow-lg shadow-error/20 transition-all h-12"
            >
              {isDeleting ? (
                <div className="flex items-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin" /> Processing
                </div>
              ) : isMe ? (
                "Leave"
              ) : (
                "Remove"
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
