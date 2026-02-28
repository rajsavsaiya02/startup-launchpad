import React, { useState, useEffect } from "react";
import { X, Search, Check, Mail, KeyRound, Loader2, Users } from "lucide-react";
import { Button } from "../../../../components/ui/Button";
import { Avatar } from "../../../../components/ui/Avatar";
import { Badge } from "../../../../components/ui/Badge";
import { apiClient } from "../../../../lib/axios";
import orgProjectService from "../../../../services/organization/orgProjectService";
import { toast } from "react-toastify";
import { cn } from "../../../../utils/cn";

export function OrgAssignMembersModal({
  isOpen,
  onClose,
  projectId,
  currentMembers,
  onAssignSuccess,
}) {
  const [availableMembers, setAvailableMembers] = useState([]);
  const [teams, setTeams] = useState([]);
  const [selectedTeamId, setSelectedTeamId] = useState("all");
  const [selectedIds, setSelectedIds] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchAvailableMembers = React.useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await apiClient.get("/org/members");
      const allOrgMembers = res.data.members || [];
      const allTeams = res.data.teams || [];

      setTeams(allTeams);

      // Filter out members who are already in the project
      const currentMemberIds = new Set(
        currentMembers.map((m) => String(m.user_id)),
      );
      const assignable = allOrgMembers.filter(
        (m) => !currentMemberIds.has(String(m.user_id)),
      );

      setAvailableMembers(assignable);
    } catch {
      toast.error("Failed to fetch available members");
    } finally {
      setIsLoading(false);
    }
  }, [currentMembers]);

  useEffect(() => {
    if (isOpen) {
      fetchAvailableMembers();
      setSelectedIds([]);
      setSearchQuery("");
      setSelectedTeamId("all");
    }
  }, [isOpen, projectId, fetchAvailableMembers]);

  const handleAssign = async () => {
    if (selectedIds.length === 0) return;
    setIsSubmitting(true);
    try {
      await orgProjectService.addProjectMembers(projectId, selectedIds);
      toast.success("Members assigned successfully.");
      onAssignSuccess();
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to assign members.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const toggleSelection = (userId) => {
    setSelectedIds((prev) =>
      prev.includes(userId)
        ? prev.filter((id) => id !== userId)
        : [...prev, userId],
    );
  };

  const selectAllFiltered = () => {
    const filteredIds = filteredMembers.map((m) => m.user_id);
    setSelectedIds((prev) => {
      // Add all filtered IDs that aren't already selected
      const newSelection = new Set([...prev, ...filteredIds]);
      return Array.from(newSelection);
    });
  };

  const deselectAllFiltered = () => {
    const filteredIds = new Set(filteredMembers.map((m) => m.user_id));
    setSelectedIds((prev) => prev.filter((id) => !filteredIds.has(id)));
  };

  const filteredMembers = availableMembers.filter((m) => {
    const matchesSearch = `${m.first_name} ${m.last_name} ${m.email}`
      .toLowerCase()
      .includes(searchQuery.toLowerCase());

    const matchesTeam =
      selectedTeamId === "all" || String(m.team_id) === String(selectedTeamId);

    return matchesSearch && matchesTeam;
  });

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white dark:bg-surface-dark rounded-3xl shadow-2xl w-full max-w-xl overflow-hidden animate-in zoom-in-95 duration-300 flex flex-col max-h-[85vh]">
        <div className="p-6 border-b border-border-light dark:border-border-dark flex justify-between items-start shrink-0">
          <div>
            <h2 className="text-xl font-black text-text-primary dark:text-white">
              Assign to Project
            </h2>
            <p className="text-sm text-text-tertiary mt-1 font-medium">
              Select members from your organization to grant them access to this
              project.
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-text-tertiary hover:bg-gray-100 dark:hover:bg-gray-800 p-2 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-4 border-b border-border-light dark:border-border-dark shrink-0 space-y-3">
          <div className="flex gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-tertiary" />
              <input
                autoFocus
                type="text"
                placeholder="Search members..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="h-10 w-full pl-9 pr-4 rounded-xl border border-border-light bg-gray-50 dark:bg-gray-900 dark:border-border-dark text-sm focus:ring-2 focus:ring-primary/20 transition-all outline-none font-medium"
              />
            </div>
            <select
              value={selectedTeamId}
              onChange={(e) => setSelectedTeamId(e.target.value)}
              className="h-10 px-4 rounded-xl border border-border-light bg-gray-50 dark:bg-gray-900 dark:border-border-dark text-sm focus:ring-2 focus:ring-primary/20 transition-all outline-none font-bold min-w-[140px]"
            >
              <option value="all">All Teams</option>
              {teams.map((team) => (
                <option key={team.team_id} value={team.team_id}>
                  {team.name}
                </option>
              ))}
            </select>
          </div>

          {filteredMembers.length > 0 && (
            <div className="flex items-center justify-between px-1">
              <span className="text-[10px] font-black uppercase tracking-wider text-text-tertiary">
                Showing {filteredMembers.length} available members
              </span>
              <div className="flex gap-4">
                <button
                  onClick={selectAllFiltered}
                  className="text-[10px] font-black uppercase tracking-wider text-primary hover:underline"
                >
                  Select All
                </button>
                <button
                  onClick={deselectAllFiltered}
                  className="text-[10px] font-black uppercase tracking-wider text-text-tertiary hover:text-error"
                >
                  Deselect
                </button>
              </div>
            </div>
          )}
        </div>

        <div className="flex-1 overflow-y-auto p-2 min-h-[350px]">
          {isLoading ? (
            <div className="h-full flex flex-col items-center justify-center space-y-3">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
              <p className="text-sm text-text-tertiary font-bold">
                Loading organization members...
              </p>
            </div>
          ) : filteredMembers.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-8 space-y-3">
              <Users className="w-12 h-12 text-gray-300 dark:text-gray-700" />
              <p className="text-sm text-text-secondary font-bold">
                No available members found.
              </p>
              <p className="text-xs text-text-tertiary">
                {searchQuery || selectedTeamId !== "all"
                  ? "Try adjusting your filters or search query."
                  : "All organization members are already assigned to this project."}
              </p>
            </div>
          ) : (
            <div className="space-y-1 p-2">
              {filteredMembers.map((member) => {
                const isSelected = selectedIds.includes(member.user_id);
                return (
                  <div
                    key={member.user_id}
                    onClick={() => toggleSelection(member.user_id)}
                    className={cn(
                      "flex items-center justify-between p-3 rounded-xl cursor-pointer transition-all border",
                      isSelected
                        ? "bg-primary/5 border-primary shadow-sm"
                        : "bg-transparent border-transparent hover:bg-gray-50 dark:hover:bg-gray-800 hover:border-border-light dark:hover:border-border-dark",
                    )}
                  >
                    <div className="flex items-center gap-3">
                      <Avatar
                        src={member.avatar || null}
                        fallback={member.first_name?.[0]}
                        size="sm"
                      />
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-bold text-text-primary dark:text-white leading-tight">
                            {member.first_name} {member.last_name}
                          </p>
                          {isSelected && (
                            <Badge
                              variant="primary"
                              className="text-[8px] py-0 px-1 border-0"
                            >
                              Selected
                            </Badge>
                          )}
                        </div>
                        <p className="text-xs text-text-tertiary mt-0.5">
                          {member.designation_title || member.org_role} •{" "}
                          {member.department || "No Department"}
                        </p>
                      </div>
                    </div>
                    <div
                      className={cn(
                        "w-5 h-5 rounded-md border flex items-center justify-center transition-colors",
                        isSelected
                          ? "bg-primary border-primary text-white"
                          : "border-gray-300 dark:border-gray-600",
                      )}
                    >
                      {isSelected && <Check className="w-3.5 h-3.5" />}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div className="p-4 border-t border-border-light dark:border-border-dark flex items-center justify-between bg-gray-50 dark:bg-gray-900 shrink-0">
          <div className="flex flex-col">
            <p className="text-sm font-black text-text-primary">
              {selectedIds.length} member{selectedIds.length !== 1 && "s"}{" "}
              selected
            </p>
            <p className="text-[10px] font-medium text-text-tertiary">
              Ready to grant access to the project
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={onClose}
              disabled={isSubmitting}
              className="rounded-xl border-border-light font-bold"
            >
              Cancel
            </Button>
            <Button
              disabled={selectedIds.length === 0 || isSubmitting}
              onClick={handleAssign}
              className="gap-2 font-black rounded-xl px-8 shadow-lg shadow-primary/20"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" /> Assigning
                </>
              ) : (
                "Grant Access"
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
