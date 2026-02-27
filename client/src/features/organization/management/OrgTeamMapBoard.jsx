import React, { useState, useEffect, useMemo, useRef } from "react";
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  DragOverlay,
} from "@dnd-kit/core";
import { useDroppable } from "@dnd-kit/core";
import {
  Loader2,
  Users,
  Crown,
  Award,
  Coffee,
  User,
  Search,
  ChevronDown,
  Check,
  Copy,
} from "lucide-react";
import { apiClient } from "../../../lib/axios";
import { StatusBadge } from "../team/StatusBadge";
import { toast } from "react-toastify";
import { OrgTeamMapCard } from "./OrgTeamMapCard";
import { useAuth } from "../../../context/AuthContext";
import { cn } from "../../../utils/cn";
import { Plus, Edit2, Trash2, ExternalLink } from "lucide-react";
import { Drawer } from "../../../components/ui/Drawer";
import { ConfirmationModal } from "../../../components/ui/ConfirmationModal";

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

// --------- Searchable Select Component for Members ---------
function MemberSearchSelect({
  options,
  value,
  onChange,
  placeholder = "Select Member",
  label,
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeIndex, setActiveIndex] = useState(-1);
  const containerRef = useRef(null);
  const listRef = useRef(null);

  const filteredOptions = options.filter(
    (m) =>
      `${m.first_name} ${m.last_name}`
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      (m.designation_title || "")
        .toLowerCase()
        .includes(searchTerm.toLowerCase()),
  );

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target)
      ) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Handle keyboard navigation
  const handleKeyDown = (e) => {
    if (!isOpen) {
      if (e.key === "Enter" || e.key === "ArrowDown") {
        setIsOpen(true);
      }
      return;
    }

    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        setActiveIndex((prev) =>
          prev < filteredOptions.length - 1 ? prev + 1 : prev,
        );
        break;
      case "ArrowUp":
        e.preventDefault();
        setActiveIndex((prev) => (prev > -1 ? prev - 1 : prev));
        break;
      case "Enter":
        e.preventDefault();
        if (activeIndex === -1) {
          onChange(null);
        } else if (filteredOptions[activeIndex]) {
          onChange(filteredOptions[activeIndex].organization_member_id);
        }
        setIsOpen(false);
        break;
      case "Escape":
        setIsOpen(false);
        break;
      case "Tab":
        setIsOpen(false);
        break;
    }
  };

  const toggleDropdown = () => {
    if (!isOpen) {
      setActiveIndex(-1);
      setSearchTerm("");
    }
    setIsOpen(!isOpen);
  };

  // Scroll active item into view
  useEffect(() => {
    if (activeIndex >= 0 && listRef.current) {
      const activeItem = listRef.current.children[activeIndex + 1]; // +1 for "No Team Lead"
      if (activeItem) {
        activeItem.scrollIntoView({ block: "nearest" });
      }
    }
  }, [activeIndex]);

  const selectedMember = options.find(
    (m) => m.organization_member_id === value,
  );

  return (
    <div
      className="relative"
      ref={containerRef}
      onKeyDown={handleKeyDown}
      tabIndex={0}
    >
      {label && (
        <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">
          {label}
        </label>
      )}
      <div
        onClick={toggleDropdown}
        className={cn(
          "w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-surface-dark cursor-pointer flex items-center justify-between hover:border-primary/60 hover:shadow-md transition-all duration-200",
          isOpen
            ? "ring-2 ring-primary/20 border-primary shadow-lg"
            : "shadow-sm",
        )}
      >
        <div className="flex items-center gap-2 overflow-hidden">
          {selectedMember ? (
            <>
              <img
                src={
                  selectedMember.avatar ||
                  `https://ui-avatars.com/api/?name=${selectedMember.first_name}+${selectedMember.last_name}&background=random`
                }
                className="w-6 h-6 rounded-lg object-cover"
                alt=""
              />
              <span className="text-sm font-bold truncate">
                {selectedMember.first_name} {selectedMember.last_name}
              </span>
            </>
          ) : (
            <span className="text-sm text-gray-400 font-medium">
              {placeholder}
            </span>
          )}
        </div>
        <ChevronDown
          className={cn(
            "w-4 h-4 text-gray-400 transition-transform",
            isOpen && "rotate-180 text-primary",
          )}
        />
      </div>

      {isOpen && (
        <div className="absolute z-110 left-0 right-0 mt-2 bg-white dark:bg-surface-dark border border-gray-100 dark:border-gray-800 rounded-2xl shadow-[0_10px_40px_-10px_rgba(0,0,0,0.2)] dark:shadow-[0_20px_50px_-12px_rgba(0,0,0,0.5)] animate-in fade-in slide-in-from-top-2 duration-300 ring-1 ring-black/5 origin-top backdrop-blur-xl">
          <div className="p-3 bg-gray-50/80 dark:bg-gray-800/80 border-b border-gray-100 dark:border-gray-800 sticky top-0 z-20">
            <div className="relative group">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-primary transition-colors" />
              <input
                autoFocus
                type="text"
                placeholder="Search team members..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl text-sm outline-hidden focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all"
                onClick={(e) => e.stopPropagation()}
              />
            </div>
          </div>
          <div
            className="max-h-72 overflow-y-auto overscroll-contain custom-scrollbar"
            ref={listRef}
          >
            <div
              onClick={() => {
                onChange(null);
                setIsOpen(false);
              }}
              className={cn(
                "px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-800/80 cursor-pointer text-xs font-black uppercase tracking-widest text-text-tertiary border-b border-gray-50 dark:border-gray-800 transition-colors flex items-center gap-2",
                activeIndex === -1 &&
                  "bg-primary/5 text-primary border-l-2 border-primary",
              )}
            >
              <div className="w-8 h-8 rounded-xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                <Users className="w-4 h-4" />
              </div>
              No Team Lead (Unassigned)
            </div>
            {filteredOptions.length > 0 ? (
              filteredOptions.map((m, idx) => (
                <div
                  key={m.organization_member_id}
                  onMouseEnter={() => setActiveIndex(idx)}
                  onClick={() => {
                    onChange(m.organization_member_id);
                    setIsOpen(false);
                  }}
                  className={cn(
                    "px-4 py-3 flex items-center gap-3 cursor-pointer transition-colors",
                    value === m.organization_member_id || activeIndex === idx
                      ? "bg-primary/5 border-l-2 border-primary"
                      : "hover:bg-gray-50 dark:hover:bg-gray-800/50",
                  )}
                >
                  <img
                    src={
                      m.avatar ||
                      `https://ui-avatars.com/api/?name=${m.first_name}+${m.last_name}&background=random`
                    }
                    className="w-8 h-8 rounded-xl object-cover shadow-sm"
                    alt=""
                  />
                  <div className="min-w-0">
                    <p className="text-sm font-bold truncate leading-tight">
                      {m.first_name} {m.last_name}
                    </p>
                    <p className="text-[10px] text-gray-500 font-bold uppercase tracking-tight truncate">
                      {m.designation_title || "Member"}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <div className="px-4 py-8 text-center text-xs text-gray-400 font-medium">
                No matching members found
              </div>
            )}
          </div>
        </div>
      )}
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
  const [copiedEmail, setCopiedEmail] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState({
    isOpen: false,
    team: null,
  });

  const handleCopyEmail = (email) => {
    navigator.clipboard.writeText(email);
    setCopiedEmail(true);
    toast.success("Email copied to clipboard!");
    setTimeout(() => setCopiedEmail(false), 2000);
  };

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
      if (teamModal.data?.team_id) {
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

  const handleDeleteTeam = (team) => {
    setDeleteConfirm({ isOpen: true, team });
  };

  const confirmDeleteTeam = async () => {
    const team = deleteConfirm.team;
    if (!team) return;

    setIsSubmittingTeam(true);
    try {
      await apiClient.delete(`/org/teams/${team.team_id}`);
      toast.success("Team deleted successfully");
      setDeleteConfirm({ isOpen: false, team: null });
      fetchMembers(); // Refresh to move members to unassigned visually
    } catch (error) {
      toast.error(error.response?.data?.error || "Failed to delete team.");
    } finally {
      setIsSubmittingTeam(false);
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
    const allFounders = [
      ...members.filter(
        (m) => m.org_role === "FOUNDER" || m.org_role === "CO-FOUNDER",
      ),
    ].sort((a, b) => new Date(a.joined_at) - new Date(b.joined_at));

    // The True Founder is always the first one who joined the org
    const trueFounderId =
      allFounders.length > 0 ? allFounders[0].organization_member_id : null;

    const authority = allFounders; // Both Founder and Co-Founders go here

    const administrative = members.filter((m) => m.org_role === "ADMIN");

    const guest = members
      .filter((m) => m.org_role === "GUEST")
      .map((m) => ({ ...m, displayRole: "GUEST / EXTERNAL" }));

    const employees = members.filter(
      (m) =>
        m.org_role !== "FOUNDER" &&
        m.org_role !== "CO-FOUNDER" &&
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
      trueFounderId,
    };
  }, [members]);

  const handleDragStart = (event) => {
    const { active } = event;
    const member = members.find(
      (m) => m.organization_member_id.toString() === active.id,
    );

    if (!member || member.organization_member_id === structure.trueFounderId) {
      return; // Prevent dragging True Founder
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

    // Fallback block if true founder somehow got dragged
    if (member && member.organization_member_id === structure.trueFounderId) {
      return;
    }

    const draggedMemberId = parseInt(active.id, 10);
    const dropZoneId = over.id.toString();

    let newRole = null;
    let newTeamId = null;
    let newManagerId = null;

    // Determine the action based on the drop zone
    if (dropZoneId === "layer_authority") {
      newRole = "CO-FOUNDER"; // Moving to Executive Board always makes them Co-Founder (except True Founder who isn't draggable)
      newTeamId = null;
      newManagerId = null;
    } else if (dropZoneId === "layer_administrative") {
      newRole = "ADMIN";
      newTeamId = null;
      newManagerId = null;
    } else if (dropZoneId === "layer_guest") {
      newRole = "GUEST";
      newTeamId = null;
      newManagerId = null;
    } else if (dropZoneId === "layer_employee_unassigned") {
      newRole = "MEMBER";
      newTeamId = null;
      newManagerId = null;
    } else if (dropZoneId.startsWith("team_")) {
      newRole = "MEMBER";
      newTeamId = parseInt(dropZoneId.split("team_")[1], 10);
      newManagerId = null;
    } else {
      return; // Unknown drop zone
    }

    // Permission Check
    const myMemberData = members.find((m) => m.user_id === user?.id);
    const myOrgRole = myMemberData?.org_role || user?.role?.toUpperCase();

    const isFounder = myOrgRole === "FOUNDER";
    const isCoFounder = myOrgRole === "CO-FOUNDER";
    const isAdmin = myOrgRole === "ADMIN";

    if (!isFounder && !isCoFounder && !isAdmin) {
      toast.error("You don't have permission to move members.");
      return;
    }

    // Admins cannot touch Executive Board
    if (
      isAdmin &&
      (dropZoneId === "layer_authority" ||
        member.org_role === "FOUNDER" ||
        member.org_role === "CO-FOUNDER")
    ) {
      toast.error("Admins cannot modify the Executive Board.");
      return;
    }

    // Admins can only move MEMBERS or GUESTS
    if (
      isAdmin &&
      member.org_role !== "MEMBER" &&
      member.org_role !== "GUEST"
    ) {
      toast.error("Admins can only move Employees and Guest members.");
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
                    (r) =>
                      r.team_id === team.team_id &&
                      r.organization_member_id !== team.team_lead_member_id,
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
          className="fixed inset-0 z-100 flex items-center justify-center p-4 bg-gray-950/40 backdrop-blur-md animate-in fade-in duration-300"
          onClick={() => setQuickViewMember(null)}
        >
          <div
            className="bg-white dark:bg-surface-dark rounded-4xl shadow-[0_20px_50px_rgba(0,0,0,0.3)] w-full max-w-sm overflow-hidden relative border border-white/20 dark:border-white/5 animate-in zoom-in-95 duration-300"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Background Header with Premium Gradient */}
            <div className="h-32 bg-linear-to-br from-primary via-indigo-600 to-purple-600 relative overflow-hidden">
              <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_50%_120%,rgba(255,255,255,0.8),transparent)]"></div>
              <div className="absolute top-4 right-4">
                <button
                  onClick={() => setQuickViewMember(null)}
                  className="p-2 rounded-full bg-black/20 hover:bg-black/40 text-white/80 hover:text-white transition-all backdrop-blur-md border border-white/10"
                >
                  <Plus className="w-5 h-5 rotate-45" />
                </button>
              </div>
            </div>

            {/* Avatar Container with Glassmorphism Effect */}
            <div className="relative px-8 pt-0 -mt-12 mb-6">
              <div className="inline-block relative">
                <img
                  src={
                    quickViewMember.avatar ||
                    `https://ui-avatars.com/api/?name=${quickViewMember.first_name}+${quickViewMember.last_name}&background=random`
                  }
                  alt={quickViewMember.first_name}
                  className="w-24 h-24 rounded-3xl object-cover border-4 border-white dark:border-surface-dark shadow-xl bg-white dark:bg-gray-800 ring-8 ring-primary/5"
                />
                <div className="absolute -bottom-1 -right-1">
                  <div className="bg-white dark:bg-surface-dark p-1 rounded-xl shadow-lg border border-gray-100 dark:border-gray-800">
                    <StatusBadge
                      statusLabel={quickViewMember.status}
                      showLabel={false}
                      className="p-0.5! bg-transparent!"
                    />
                  </div>
                </div>
              </div>

              {/* Identity Section */}
              <div className="mt-4">
                <h3 className="text-2xl font-black text-text-primary dark:text-white leading-tight">
                  {quickViewMember.first_name} {quickViewMember.last_name}
                </h3>
                <div className="flex flex-wrap items-center gap-2 mt-1.5">
                  <p className="text-sm font-bold text-primary dark:text-primary-light">
                    {quickViewMember.designation_title || "No Designation"}
                  </p>
                  <span className="w-1 h-1 rounded-full bg-gray-300 dark:bg-gray-700"></span>
                  <p className="text-[10px] font-black uppercase tracking-widest text-text-tertiary">
                    {quickViewMember.displayRole || quickViewMember.org_role}
                  </p>
                </div>
              </div>
            </div>

            {/* Information Grid */}
            <div className="px-8 pb-8 space-y-4">
              {/* Contact Card */}
              <div className="group bg-gray-50 dark:bg-gray-800/40 rounded-2xl p-4 border border-gray-100 dark:border-gray-800 hover:border-primary/20 transition-all duration-300">
                <div className="flex justify-between items-start">
                  <div className="min-w-0">
                    <p className="text-[10px] font-black uppercase tracking-widest text-text-tertiary mb-1">
                      Direct Email
                    </p>
                    <p className="text-sm font-bold text-text-primary dark:text-white truncate">
                      {quickViewMember.email}
                    </p>
                  </div>
                  <button
                    onClick={() => handleCopyEmail(quickViewMember.email)}
                    className={cn(
                      "p-2 rounded-xl transition-all duration-200 shadow-sm",
                      copiedEmail
                        ? "bg-green-500 text-white"
                        : "bg-white dark:bg-gray-800 text-text-tertiary hover:text-primary hover:bg-primary/5 dark:hover:bg-primary/5 hover:border-primary/20 border border-gray-200 dark:border-gray-700",
                    )}
                  >
                    {copiedEmail ? (
                      <Check className="w-4 h-4" />
                    ) : (
                      <Copy className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>

              {/* Status Section */}
              <div className="bg-gray-50 dark:bg-gray-800/40 rounded-2xl p-4 border border-gray-100 dark:border-gray-800">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-text-tertiary mb-1">
                      Current Availability
                    </p>
                    <p className="text-sm font-bold text-text-primary dark:text-white">
                      {quickViewMember.status || "On Work"}
                    </p>
                  </div>
                  <StatusBadge
                    statusLabel={quickViewMember.status}
                    showLabel={false}
                    className="scale-125"
                  />
                </div>
              </div>

              {/* Action area */}
              <button
                className="w-full h-12 rounded-2xl bg-gray-950 dark:bg-white text-white dark:text-gray-950 font-black text-sm flex items-center justify-center gap-2 hover:opacity-90 active:scale-95 transition-all shadow-lg"
                onClick={() => setQuickViewMember(null)}
              >
                Close Profile
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Create / Edit Team Drawer */}
      <Drawer
        isOpen={teamModal.isOpen}
        onClose={() => setTeamModal({ isOpen: false, data: null })}
        title={teamModal.data ? "Edit Team Detail" : "Create New Team"}
        description={
          teamModal.data
            ? "Update team information and lead assignments."
            : "Specify team details to create a new group."
        }
        className="max-w-md"
      >
        <form onSubmit={handleTeamSubmit} className="space-y-6">
          <div className="space-y-4">
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
                className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-surface-dark focus:ring-2 focus:ring-primary/20 focus:border-primary outline-hidden transition-all text-sm shadow-sm"
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
                className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-surface-dark focus:ring-2 focus:ring-primary/20 focus:border-primary outline-hidden transition-all text-sm uppercase tracking-wider font-semibold shadow-sm"
              />
            </div>

            <div className="relative">
              <MemberSearchSelect
                label="Team Lead"
                placeholder="Choose Team Lead"
                value={teamModal.data?.team_lead_member_id}
                onChange={(val) => {
                  setTeamModal((prev) => ({
                    ...prev,
                    data: { ...prev.data, team_lead_member_id: val },
                  }));
                }}
                options={structure.employees.filter((emp) => {
                  // 1. One lead rule - exclude if already lead of ANOTHER team
                  const isLeadOfOtherTeam = teams.some(
                    (t) =>
                      t.team_lead_member_id === emp.organization_member_id &&
                      t.team_id !== teamModal.data?.team_id,
                  );
                  if (isLeadOfOtherTeam) return false;

                  // 2. Filter rule:
                  // If creating a NEW team (no team_id), only show unassigned members.
                  if (!teamModal.data?.team_id) {
                    return !emp.team_id;
                  }

                  // If editing an EXISTING team, show members who are already in this team
                  // OR members who are currently unassigned (if we want to allow recruiting).
                  // User requested "perfect and accurate", usually meaning current team members.
                  return emp.team_id === teamModal.data.team_id;
                })}
              />
              <input
                type="hidden"
                name="team_lead_member_id"
                value={teamModal.data?.team_lead_member_id || ""}
              />
              <p className="text-[10px] text-gray-400 mt-1.5 leading-relaxed">
                The team lead explicitly guides this team but may also belong to
                the broader organizational structure.
              </p>
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">
                Description
              </label>
              <textarea
                name="description"
                defaultValue={teamModal.data?.description}
                rows={4}
                placeholder="Briefly describe the team's mission and scope..."
                className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-surface-dark focus:ring-2 focus:ring-primary/20 focus:border-primary outline-hidden transition-all text-sm resize-none shadow-sm"
              />
            </div>
          </div>

          <div className="pt-6 border-t border-gray-100 dark:border-gray-800 flex items-center gap-3">
            <button
              type="submit"
              disabled={isSubmittingTeam}
              className="flex-1 inline-flex items-center justify-center h-12 text-sm font-black text-white bg-primary hover:bg-primary-dark transition-all rounded-xl disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-primary/20 active:scale-95 cursor-pointer"
            >
              {isSubmittingTeam ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : teamModal.data ? (
                "Save Team Changes"
              ) : (
                "Create Team Group"
              )}
            </button>
            <button
              type="button"
              onClick={() => setTeamModal({ isOpen: false, data: null })}
              className="px-6 h-12 text-sm font-bold text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors rounded-xl cursor-pointer border border-transparent hover:border-gray-200 dark:hover:border-gray-700"
            >
              Cancel
            </button>
          </div>
        </form>
      </Drawer>

      {/* Team Deletion Confirmation */}
      <ConfirmationModal
        isOpen={deleteConfirm.isOpen}
        onClose={() => setDeleteConfirm({ isOpen: false, team: null })}
        onConfirm={confirmDeleteTeam}
        title="Delete Team?"
        message={`Are you sure you want to delete "${deleteConfirm.team?.name}"? All members will be moved back to Unassigned Employees.`}
        confirmText="Confirm Delete"
        cancelText="Keep Team"
        isLoading={isSubmittingTeam}
      />
    </div>
  );
}
