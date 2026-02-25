import React, { useState, useEffect, useMemo } from "react";
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  DragOverlay,
} from "@dnd-kit/core";
import { useDroppable } from "@dnd-kit/core";
import { Loader2, Users, Crown, Award, Coffee, User } from "lucide-react";
import { apiClient } from "../../../lib/axios";
import { toast } from "react-toastify";
import { OrgTeamMapCard } from "./OrgTeamMapCard";
import { useAuth } from "../../../context/AuthContext";
import { cn } from "../../../utils/cn";
import { Plus, Edit2, Trash2 } from "lucide-react";

// --------- Helper Component for standard Droppable zones (Layers) ---------
function DroppableLayer({ id, title, icon: IconProp, colorClass, children }) {
  const { setNodeRef, isOver } = useDroppable({
    id,
    data: { type: "LAYER" },
  });

  return (
    <div
      ref={setNodeRef}
      className={cn(
        "p-6 rounded-2xl border transition-all duration-300 min-h-[160px] flex flex-col relative overflow-hidden",
        isOver
          ? "bg-primary/5 border-primary/40 ring-4 ring-primary/10"
          : "bg-white/60 dark:bg-surface-dark/60 border-border-light dark:border-border-dark shadow-sm hover:shadow-md",
      )}
    >
      <div className="flex items-center gap-3 mb-6 shrink-0 relative z-10">
        <div className={cn("p-2 rounded-xl border", colorClass)}>
          {IconProp && <IconProp className="w-5 h-5" />}
        </div>
        <h3 className="text-lg font-black tracking-tight text-text-primary dark:text-white">
          {title}
        </h3>
      </div>
      <div className="flex-1 flex flex-wrap gap-4 items-start content-start relative z-10">
        {children}
      </div>
      {/* Empty State Overlay */}
      {React.Children.count(children) === 0 && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-0">
          <div className="px-4 py-2 rounded-full border border-dashed border-gray-300 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/50 text-sm font-medium text-gray-400">
            Drop team members here
          </div>
        </div>
      )}
    </div>
  );
}

// --------- Helper Component for Explicit Teams ---------
function OrgTeamContainer({
  team,
  teamLeadElement,
  children,
  onEdit,
  onDelete,
}) {
  const { setNodeRef, isOver } = useDroppable({
    id: `team_${team.team_id}`,
    data: { type: "TEAM", teamId: team.team_id },
  });

  return (
    <div className="flex flex-col gap-3 w-full sm:w-[340px] bg-white dark:bg-surface-dark rounded-2xl border border-border-light dark:border-border-dark p-4 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
      {/* Decorative gradient line */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-linear-to-r from-green-400 to-emerald-500 opacity-50 group-hover:opacity-100 transition-opacity" />

      {/* Team Header */}
      <div className="flex items-start justify-between px-1 mb-1 mt-1">
        <div>
          <h4 className="text-sm font-bold text-text-primary dark:text-white flex items-center gap-2">
            {team.name}
            <span className="text-[9px] font-bold text-text-tertiary bg-gray-100 dark:bg-gray-800 px-2 py-0.5 rounded-full uppercase tracking-wider">
              {team.category}
            </span>
          </h4>
          <p className="text-[10px] text-gray-500 dark:text-gray-400 mt-0.5">
            {React.Children.count(children)} Reports
            {teamLeadElement ? " + 1 Lead" : ""}
          </p>
        </div>
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={() => onEdit(team)}
            className="p-1.5 text-gray-400 hover:text-primary bg-gray-50 hover:bg-primary/10 dark:bg-gray-800 rounded-md transition-colors"
          >
            <Edit2 className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => onDelete(team)}
            className="p-1.5 text-gray-400 hover:text-red-500 bg-gray-50 hover:bg-red-500/10 dark:bg-gray-800 rounded-md transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* The Team Lead */}
      {teamLeadElement && <div className="z-10">{teamLeadElement}</div>}

      {/* Divider */}
      <div className="flex items-center gap-2 mt-1">
        <div className="h-px bg-gray-100 dark:bg-gray-800 flex-1" />
        <span className="text-[9px] text-gray-400 font-bold tracking-widest uppercase">
          Team Members
        </span>
        <div className="h-px bg-gray-100 dark:bg-gray-800 flex-1" />
      </div>

      {/* The Direct Reports Drop Zone */}
      <div
        ref={setNodeRef}
        className={cn(
          "w-full rounded-xl p-3 flex flex-col gap-3 transition-colors min-h-[90px]",
          isOver
            ? "bg-primary/5 border border-primary/30 ring-2 ring-primary/20"
            : "bg-gray-50/50 dark:bg-gray-800/30 border border-transparent hover:border-gray-200 dark:hover:border-gray-700",
        )}
      >
        {children}
        {React.Children.count(children) === 0 && (
          <div className="h-full flex items-center justify-center">
            <span className="text-xs text-gray-400 font-medium text-center">
              Drag members here
              <br />
              to add to {team.name}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}

export function OrgTeamMapBoard() {
  const { user } = useAuth();
  const [members, setMembers] = useState([]);
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [activeDragItem, setActiveDragItem] = useState(null);

  // Modals
  const [quickViewMember, setQuickViewMember] = useState(null);
  const [teamModal, setTeamModal] = useState({ isOpen: false, data: null });
  const [isSubmittingTeam, setIsSubmittingTeam] = useState(false);

  useEffect(() => {
    fetchMembers();
  }, []);

  const fetchMembers = async () => {
    try {
      const res = await apiClient.get("/org/members");
      setMembers(res.data.members || []);
      setTeams(res.data.teams || []);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load team map.");
    } finally {
      setLoading(false);
    }
  };

  const handleTeamSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const data = {
      name: formData.get("name"),
      category: formData.get("category"),
      team_lead_member_id: formData.get("team_lead_member_id") || null,
      description: formData.get("description"),
    };

    setIsSubmittingTeam(true);
    try {
      if (teamModal.data) {
        // Edit Team
        await apiClient.put(`/org/teams/${teamModal.data.team_id}`, data);
        toast.success("Team updated successfully");
      } else {
        // Create Team
        await apiClient.post("/org/teams", data);
        toast.success("Team created successfully");
      }
      setTeamModal({ isOpen: false, data: null });
      fetchMembers(); // Refresh data
    } catch (error) {
      toast.error(error.response?.data?.error || "Failed to save team.");
    } finally {
      setIsSubmittingTeam(false);
    }
  };

  const handleDeleteTeam = async (team) => {
    if (
      !window.confirm(
        `Are you sure you want to delete the team "${team.name}"? This will move all its members to "Unassigned".`,
      )
    ) {
      return;
    }

    try {
      await apiClient.delete(`/org/teams/${team.team_id}`);
      toast.success("Team deleted successfully");
      fetchMembers(); // Refresh to move members to unassigned visually
    } catch (error) {
      toast.error(error.response?.data?.error || "Failed to delete team.");
    }
  };

  // Setup sensors for DND
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8, // Require dragging a bit before capturing (helps click events pass through to Quick View)
      },
    }),
  );

  // Process members into the 4 layers
  // Layer 1: FOUNDER
  // Layer 2: ADMIN
  // Layer 3: MEMBER (Employees) - Split into TLs (manager_member_id is null) and Reports
  // Layer 4: GUEST

  const structure = useMemo(() => {
    const authority = members.filter((m) => m.org_role === "FOUNDER");
    const administrative = members.filter((m) => m.org_role === "ADMIN");
    const guest = members.filter((m) => m.org_role === "GUEST");

    const employees = members.filter(
      (m) =>
        m.org_role !== "FOUNDER" &&
        m.org_role !== "ADMIN" &&
        m.org_role !== "GUEST",
    );

    // Unassigned employees logic
    const employeesOrphaned = employees.filter((m) => !m.team_id);
    const employeesInTeams = employees.filter((m) => m.team_id);

    return {
      authority,
      administrative,
      guest,
      employees,
      unassigned: employeesOrphaned,
      assigned: employeesInTeams,
    };
  }, [members]);

  const handleDragStart = (event) => {
    const { active } = event;
    const member = members.find(
      (m) => m.organization_member_id.toString() === active.id,
    );
    if (!member || member.org_role === "FOUNDER") {
      return; // Prevent dragging Foundation/Founder
    }
    setActiveDragItem(member);
  };

  const handleDragEnd = async (event) => {
    const { active, over } = event;
    setActiveDragItem(null);

    // If dropped outside any droppable, do nothing
    if (!over) return;

    const member = members.find(
      (m) => m.organization_member_id.toString() === active.id,
    );

    // Fallback block if founder somehow got dragged
    if (member && member.org_role === "FOUNDER") {
      return;
    }

    const draggedMemberId = parseInt(active.id, 10);
    const dropZoneId = over.id.toString();

    let newRole = null;
    let newTeamId = null;
    let newManagerId = null;

    // Determine the action based on the drop zone
    if (dropZoneId === "layer_authority") {
      newRole = "FOUNDER";
      newTeamId = null;
    } else if (dropZoneId === "layer_administrative") {
      newRole = "ADMIN";
      newTeamId = null;
    } else if (dropZoneId === "layer_guest") {
      newRole = "GUEST";
      newTeamId = null;
    } else if (dropZoneId === "layer_employee_unassigned") {
      newRole = "MEMBER";
      newTeamId = null;
      newManagerId = null;
    } else if (dropZoneId.startsWith("team_")) {
      newRole = "MEMBER";
      newTeamId = parseInt(dropZoneId.split("team_")[1], 10);
      newManagerId = null; // We are no longer using implicit managers in the UI
    } else {
      return; // Unknown drop zone
    }

    // Check permissions before attempting update locally
    const canEdit =
      user?.role?.toLowerCase() === "founder" ||
      user?.role?.toLowerCase() === "admin" ||
      members.find((m) => m.user_id === user?.id)?.org_role === "FOUNDER" ||
      members.find((m) => m.user_id === user?.id)?.org_role === "ADMIN";

    if (!canEdit) {
      toast.error("Only Founders and Admins can move members.");
      return;
    }

    // Find current member
    const currentMember = members.find(
      (m) => m.organization_member_id === draggedMemberId,
    );

    // If nothing changed, return
    if (
      currentMember.org_role === newRole &&
      currentMember.team_id === newTeamId
    ) {
      return;
    }

    // Optimistically update UI
    setMembers((prev) =>
      prev.map((m) =>
        m.organization_member_id === draggedMemberId
          ? {
              ...m,
              org_role: newRole,
              team_id: newTeamId,
              manager_member_id: newManagerId,
            }
          : m,
      ),
    );

    // Call API
    setIsSaving(true);
    try {
      await apiClient.put("/org/members/hierarchy", {
        updates: [
          {
            member_id: draggedMemberId,
            org_role: newRole,
            team_id: newTeamId,
            manager_member_id: newManagerId,
          },
        ],
      });
      toast.success("Team map updated");
    } catch (error) {
      toast.error(error.response?.data?.error || "Failed to save hierarchy.");
      // Revert on failure (fetch fresh data)
      fetchMembers();
    } finally {
      setIsSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  // Check if current user has edit rights (UI toggle)
  const isEditable =
    user?.role?.toLowerCase() === "founder" ||
    user?.role?.toLowerCase() === "admin" ||
    members.find((m) => m.user_id === user?.id)?.org_role === "FOUNDER" ||
    members.find((m) => m.user_id === user?.id)?.org_role === "ADMIN";

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-12">
      {/* Header / Legend */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-surface-dark p-6 rounded-2xl border border-border-light dark:border-border-dark shadow-sm">
        <div>
          <h2 className="text-xl font-bold text-text-primary dark:text-white flex items-center gap-2">
            Organizational Structure
            {isSaving && (
              <Loader2 className="w-4 h-4 animate-spin text-primary" />
            )}
          </h2>
          <p className="text-sm text-text-secondary dark:text-gray-400 mt-1">
            {isEditable
              ? "Drag and drop cards to reassign roles or reporting lines."
              : "Read-only view of the organization's structure."}
          </p>
        </div>
        <div className="flex items-center gap-4 text-xs font-bold uppercase tracking-wider text-text-tertiary">
          <span className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full bg-purple-500"></div> Authority
          </span>
          <span className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full bg-blue-500"></div> Admin
          </span>
          <span className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full bg-green-500"></div> Employee
          </span>
          <span className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full bg-gray-500"></div> Guest
          </span>
        </div>
      </div>

      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <div className="space-y-6">
          {/* Layer 1: Authority */}
          <DroppableLayer
            id="layer_authority"
            title="Executive Board"
            icon={Crown}
            colorClass="bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400"
          >
            {structure.authority.map((m) => (
              <OrgTeamMapCard
                key={m.organization_member_id}
                member={m}
                onQuickView={setQuickViewMember}
              />
            ))}
          </DroppableLayer>

          {/* Layer 2: Administrative */}
          <DroppableLayer
            id="layer_administrative"
            title="Management & Leadership"
            icon={Award}
            colorClass="bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400"
          >
            {structure.administrative.map((m) => (
              <OrgTeamMapCard
                key={m.organization_member_id}
                member={m}
                onQuickView={setQuickViewMember}
              />
            ))}
          </DroppableLayer>

          {/* Layer 3: Employee (Nested) */}
          <div className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white/30 dark:bg-surface-dark/30 overflow-hidden">
            <div className="flex items-center justify-between p-6 pb-2 shrink-0">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400">
                  <Users className="w-5 h-5" />
                </div>
                <h3 className="text-lg font-bold text-text-primary dark:text-white">
                  Departments & Teams
                </h3>
              </div>
              {isEditable && (
                <button
                  onClick={() => setTeamModal({ isOpen: true, data: null })}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-bold bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors shadow-sm cursor-pointer"
                >
                  <Plus className="w-4 h-4" /> Add Team
                </button>
              )}
            </div>

            <div className="p-6 pt-4">
              <div className="flex flex-wrap items-start justify-center gap-x-8 gap-y-12">
                {/* Explicit Teams */}
                {teams.map((team) => {
                  const teamMembers = structure.assigned.filter(
                    (r) => r.team_id === team.team_id,
                  );
                  // Find the designated Team Lead object, if any
                  const teamLead = members.find(
                    (m) =>
                      m.organization_member_id === team.team_lead_member_id,
                  );

                  return (
                    <OrgTeamContainer
                      key={team.team_id}
                      team={team}
                      teamLeadElement={
                        teamLead ? (
                          <OrgTeamMapCard
                            member={teamLead}
                            onQuickView={setQuickViewMember}
                          />
                        ) : null
                      }
                      onEdit={() => setTeamModal({ isOpen: true, data: team })}
                      onDelete={() => handleDeleteTeam(team)}
                    >
                      {teamMembers.map((m) => (
                        <OrgTeamMapCard
                          key={m.organization_member_id}
                          member={m}
                          onQuickView={setQuickViewMember}
                        />
                      ))}
                    </OrgTeamContainer>
                  );
                })}
              </div>

              {/* Unassigned Employees Drop Zone */}
              <div className="mt-12 w-full flex flex-wrap justify-center text-center relative border-t border-gray-200 dark:border-gray-800 pt-8">
                <div className="w-full">
                  <DroppableLayer
                    id="layer_employee_unassigned"
                    title="Unassigned Employees"
                    icon={User}
                    colorClass="bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400"
                  >
                    {structure.unassigned.map((m) => (
                      <OrgTeamMapCard
                        key={m.organization_member_id}
                        member={m}
                        onQuickView={setQuickViewMember}
                      />
                    ))}
                  </DroppableLayer>
                </div>
              </div>
            </div>
          </div>

          {/* Layer 4: Guest */}
          <DroppableLayer
            id="layer_guest"
            title="External Collaborators"
            icon={Coffee}
            colorClass="bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400"
          >
            {structure.guest.map((m) => (
              <OrgTeamMapCard
                key={m.organization_member_id}
                member={m}
                onQuickView={setQuickViewMember}
              />
            ))}
          </DroppableLayer>
        </div>

        {/* Drag Overlay for smooth visual dragging */}
        <DragOverlay>
          {activeDragItem ? (
            <OrgTeamMapCard member={activeDragItem} onQuickView={() => {}} />
          ) : null}
        </DragOverlay>
      </DndContext>

      {/* Quick View Modal */}
      {quickViewMember && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-950/60 backdrop-blur-sm animate-in fade-in duration-300"
          onClick={() => setQuickViewMember(null)}
        >
          <div
            className="bg-white dark:bg-surface-dark rounded-2xl shadow-2xl w-full max-w-md overflow-hidden relative border border-border-light dark:border-border-dark"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="h-24 bg-linear-to-br from-primary/80 to-indigo-600 relative">
              <div className="absolute -bottom-10 left-6">
                <img
                  src={
                    quickViewMember.avatar ||
                    `https://ui-avatars.com/api/?name=${quickViewMember.first_name}+${quickViewMember.last_name}&background=random`
                  }
                  alt={quickViewMember.first_name}
                  className="w-20 h-20 rounded-2xl object-cover border-4 border-white dark:border-surface-dark shadow-lg bg-white"
                />
              </div>
            </div>
            <div className="pt-12 p-6 space-y-4">
              <div>
                <h3 className="text-xl font-bold text-text-primary dark:text-white">
                  {quickViewMember.first_name} {quickViewMember.last_name}
                </h3>
                <p className="font-medium text-primary mt-0.5">
                  {quickViewMember.designation_title || "No Designation"}
                </p>
                <span className="inline-block mt-2 text-[10px] font-bold px-2 py-0.5 rounded-md bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 uppercase tracking-wider border border-gray-200 dark:border-gray-700">
                  Role: {quickViewMember.org_role}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-4 mt-6">
                <div className="p-3 bg-gray-50 dark:bg-gray-800/50 rounded-xl border border-gray-100 dark:border-gray-800">
                  <p className="text-[10px] uppercase text-gray-500 font-bold tracking-wider mb-1">
                    Email
                  </p>
                  <p className="text-sm text-text-primary dark:text-white truncate font-medium">
                    {quickViewMember.email}
                  </p>
                </div>
                <div className="p-3 bg-gray-50 dark:bg-gray-800/50 rounded-xl border border-gray-100 dark:border-gray-800">
                  <p className="text-[10px] uppercase text-gray-500 font-bold tracking-wider mb-1">
                    Status
                  </p>
                  <p className="text-sm font-medium flex items-center gap-1.5">
                    <span
                      className={cn(
                        "w-2 h-2 rounded-full",
                        quickViewMember.is_active
                          ? "bg-green-500"
                          : "bg-gray-400",
                      )}
                    ></span>
                    <span
                      className={
                        quickViewMember.is_active
                          ? "text-green-600 dark:text-green-400"
                          : "text-gray-500"
                      }
                    >
                      {quickViewMember.is_active ? "Active" : "Inactive"}
                    </span>
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Create / Edit Team Modal */}
      {teamModal.isOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-950/60 backdrop-blur-sm animate-in fade-in duration-300"
          onClick={() => setTeamModal({ isOpen: false, data: null })}
        >
          <div
            className="bg-white dark:bg-surface-dark rounded-2xl shadow-2xl w-full max-w-md overflow-hidden relative border border-border-light dark:border-border-dark"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6 border-b border-gray-100 dark:border-gray-800">
              <h3 className="text-xl font-bold text-text-primary dark:text-white flex items-center gap-2">
                {teamModal.data ? "Edit Team" : "Create New Team"}
              </h3>
            </div>
            <form onSubmit={handleTeamSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">
                  Team Title*
                </label>
                <input
                  type="text"
                  name="name"
                  defaultValue={teamModal.data?.name}
                  required
                  placeholder="e.g. Frontend Core"
                  className="w-full px-4 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-surface-dark focus:ring-2 focus:ring-primary/20 focus:border-primary outline-hidden transition-all text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">
                  Category Department*
                </label>
                <input
                  type="text"
                  name="category"
                  defaultValue={teamModal.data?.category}
                  required
                  placeholder="e.g. Engineering"
                  className="w-full px-4 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-surface-dark focus:ring-2 focus:ring-primary/20 focus:border-primary outline-hidden transition-all text-sm uppercase tracking-wider font-medium"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">
                  Team Lead
                </label>
                <select
                  name="team_lead_member_id"
                  defaultValue={teamModal.data?.team_lead_member_id || ""}
                  className="w-full px-4 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-surface-dark focus:ring-2 focus:ring-primary/20 focus:border-primary outline-hidden transition-all text-sm"
                >
                  <option value="">No Team Lead (Unassigned)</option>
                  {structure.employees.map((emp) => (
                    <option
                      key={emp.organization_member_id}
                      value={emp.organization_member_id}
                    >
                      {emp.first_name} {emp.last_name} (
                      {emp.designation_title || "Member"})
                    </option>
                  ))}
                </select>
                <p className="text-[10px] text-gray-400 mt-1">
                  The team lead explicitly guides this team but may also belong
                  to the broader organizational structure.
                </p>
              </div>

              <div className="pt-4 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setTeamModal({ isOpen: false, data: null })}
                  className="px-4 py-2 text-sm font-bold text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors rounded-xl cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingTeam}
                  className="inline-flex items-center justify-center min-w-[100px] px-4 py-2 text-sm font-bold text-white bg-primary hover:bg-primary-dark transition-colors rounded-xl disabled:opacity-50 disabled:cursor-not-allowed shadow-sm cursor-pointer"
                >
                  {isSubmittingTeam ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : teamModal.data ? (
                    "Save Changes"
                  ) : (
                    "Create Team"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
