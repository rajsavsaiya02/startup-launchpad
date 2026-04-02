import React, { useState, useEffect } from "react";
import {
  Users,
  Briefcase,
  Layers,
  Award,
  Search,
  Clock,
  ShieldCheck,
  UserCheck,
  UserPlus,
  Ghost,
  FileText,
  ExternalLink,
  Lock,
  Image as ImageIcon,
  FileCode,
  FileArchive,
  FileVideo,
  FileAudio,
  FileMinus,
} from "lucide-react";
import { Avatar } from "../../../components/ui/Avatar";
import { apiClient } from "../../../lib/axios";
import { StatusBadge } from "../team/StatusBadge";
import { getStatusInfo } from "../team/statusConstants";
import fileAssetService from "../../../services/fileAssetService";
import { FileDetailModal } from "../../../components/files/FileDetailModal";
import { toast } from "react-toastify";
import { useAuth } from "../../../context/AuthContext";

const getFileIcon = (fileName) => {
  const ext = fileName?.split(".").pop()?.toLowerCase();
  switch (ext) {
    case "pdf":
      return <FileText className="w-4 h-4 text-red-500" />;
    case "jpg":
    case "jpeg":
    case "png":
    case "webp":
    case "svg":
      return <ImageIcon className="w-4 h-4 text-blue-500" />;
    case "mp4":
    case "mov":
    case "avi":
      return <FileVideo className="w-4 h-4 text-purple-500" />;
    case "zip":
    case "rar":
    case "7z":
      return <FileArchive className="w-4 h-4 text-amber-600" />;
    case "js":
    case "jsx":
    case "ts":
    case "tsx":
    case "html":
    case "css":
    case "json":
      return <FileCode className="w-4 h-4 text-emerald-600" />;
    default:
      return <FileText className="w-4 h-4 text-gray-500" />;
  }
};

export function OrgOverviewTab({ onViewMembers, onViewResources }) {
  const { user } = useAuth();
  const [members, setMembers] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [teams, setTeams] = useState([]);
  const [resources, setResources] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [visibleCount, setVisibleCount] = useState(10);
  const [selectedResource, setSelectedResource] = useState(null);
  const [myRole, setMyRole] = useState("MEMBER");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [membersRes, deptsRes, teamsRes, orgRes] = await Promise.all([
          apiClient.get("/org/members"),
          apiClient.get("/org/departments").catch(() => null),
          apiClient.get("/org/teams").catch(() => null),
          apiClient.get("/org").catch(() => null),
        ]);

        const membersList = membersRes.data?.members || [];
        const deptsList =
          deptsRes?.data?.departments ||
          (Array.isArray(deptsRes?.data) ? deptsRes.data : []);
        const teamsList =
          teamsRes?.data?.teams ||
          (Array.isArray(teamsRes?.data)
            ? teamsRes.data
            : membersRes.data?.teams) ||
          [];

        setMembers(membersList);
        setDepartments(deptsList);
        setTeams(teamsList);

        // Fetch Resources
        const orgId = orgRes?.data?.organization?.organization_id;
        if (orgId) {
          const filesData = await fileAssetService.getFileAssets("organization", orgId);
          setResources(filesData.slice(0, 5));
          
          const me = membersRes.data.members?.find((m) => m.user_id === user?.id);
          if (me) setMyRole(me.org_role);
        }
      } catch (error) {
        console.error("Failed to fetch overview data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [user?.id]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 rounded-full border-2 border-primary border-t-transparent animate-spin" />
      </div>
    );
  }

  // --- Derived Real Data Calculations ---
  const totalMembers = members.length;
  const activeTeamsCount = teams.length;
  const departmentsCount = departments.length;
  const uniqueRolesCount = new Set(
    members.map((m) => m.designation_title || m.org_role),
  ).size;

  // Determine Leadership dynamically
  const leadership = members
    .filter((m) => {
      const role = m.org_role?.toUpperCase();
      const title = m.designation_title?.toUpperCase() || "";
      return (
        role === "FOUNDER" ||
        role === "CO-FOUNDER" ||
        role === "ADMIN" ||
        title.includes("LEAD") ||
        title.includes("HEAD") ||
        title.includes("CHIEF") ||
        title.includes("DIRECTOR")
      );
    })
    .sort((a, b) => {
      const roleA = a.org_role?.toUpperCase();
      const roleB = b.org_role?.toUpperCase();
      
      const priority = { "FOUNDER": 1, "CO-FOUNDER": 2, "ADMIN": 3 };
      const weightA = priority[roleA] || 10;
      const weightB = priority[roleB] || 10;
      
      return weightA - weightB;
    })
    .slice(0, 3);

  // Filter roster by search
  const filteredMembers = members.filter((m) =>
    `${m.first_name} ${m.last_name} ${m.designation_title || m.org_role}`
      .toLowerCase()
      .includes(searchQuery.toLowerCase()),
  );

  const displayedMembers = filteredMembers.slice(0, visibleCount);

  // Map real Structure logic
  // --- Role Distribution Logic ---
  const distributions = [
    {
      label: "Authority",
      icon: ShieldCheck,
      color: "text-amber-500",
      bg: "bg-amber-50 dark:bg-amber-900/20",
      count: members.filter(m => 
        ["FOUNDER", "CO-FOUNDER", "CEO", "CTO", "CHIEF", "DIRECTOR"].includes(m.org_role?.toUpperCase()) ||
        m.designation_title?.toUpperCase().includes("HEAD") ||
        m.designation_title?.toUpperCase().includes("LEAD")
      ).length
    },
    {
      label: "Admin",
      icon: Lock,
      color: "text-blue-500",
      bg: "bg-blue-50 dark:bg-blue-900/20",
      count: members.filter(m => m.org_role?.toUpperCase() === "ADMIN").length
    },
    {
      label: "Employee",
      icon: UserCheck,
      color: "text-emerald-500",
      bg: "bg-emerald-50 dark:bg-emerald-900/20",
      count: members.filter(m => m.org_role?.toUpperCase() === "MEMBER" && m.designation_title).length
    },
    {
      label: "Unassigned",
      icon: UserPlus,
      color: "text-gray-500",
      bg: "bg-gray-50 dark:bg-gray-900/20",
      count: members.filter(m => m.org_role?.toUpperCase() === "MEMBER" && !m.designation_title).length
    },
    {
      label: "Guest",
      icon: Ghost,
      color: "text-purple-500",
      bg: "bg-purple-50 dark:bg-purple-900/20",
      count: members.filter(m => m.org_role?.toUpperCase() === "GUEST").length
    }
  ];

  const handleDownloadFile = async (e, asset) => {
    if (e) e.stopPropagation();
    if (asset.isExternal) {
      window.open(asset.storageUrl, "_blank");
      return;
    }
    try {
      const response = await apiClient.get(
        `/file-assets/${asset.id}/download`,
        {
          responseType: "blob",
        },
      );
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", asset.fileName);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Download failed:", error);
      toast.error("Failed to download file");
    }
  };

    
  const getDaysAgo = (dateStr) => {
    if (!dateStr) return "Recently";
    const diff = Math.floor(
      (new Date() - new Date(dateStr)) / (1000 * 60 * 60 * 24),
    );
    return diff === 0 ? "Today" : diff === 1 ? "1d ago" : `${diff}d ago`;
  };

  const getMemberRole = (m) => {
    if (m.designation_title) return m.designation_title;
    return (
      m.org_role?.charAt(0) +
        m.org_role?.slice(1).toLowerCase().replace("_", " ") || "Member"
    );
  };

  const getMemberProject = (m) => {
    if (m.team_id) {
      const team = teams.find((t) => t.team_id === m.team_id);
      if (team) return team.name;
    }
    return m.department ? m.department.split(" ")[0] : "General";
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-700 -mt-2">
      {/* ─── Top Performance Cards ─── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          {
            label: "Total Members",
            value: totalMembers,
            icon: Users,
            color: "text-blue-600 dark:text-blue-400",
            bg: "bg-blue-50 dark:bg-blue-900/30",
            border: "border-blue-100/50 dark:border-blue-500/20",
            glow: "from-blue-500/10 to-transparent",
          },
          {
            label: "Active Teams",
            value: activeTeamsCount,
            icon: Briefcase,
            color: "text-indigo-600 dark:text-indigo-400",
            bg: "bg-indigo-50 dark:bg-indigo-900/30",
            border: "border-indigo-100/50 dark:border-indigo-500/20",
            glow: "from-indigo-500/10 to-transparent",
          },
          {
            label: "Departments",
            value: departmentsCount,
            icon: Layers,
            color: "text-amber-600 dark:text-amber-400",
            bg: "bg-amber-50 dark:bg-amber-900/30",
            border: "border-amber-100/50 dark:border-amber-500/20",
            glow: "from-amber-500/10 to-transparent",
          },
          {
            label: "Roles Defined",
            value: uniqueRolesCount,
            icon: Award,
            color: "text-emerald-600 dark:text-emerald-400",
            bg: "bg-emerald-50 dark:bg-emerald-900/30",
            border: "border-emerald-100/50 dark:border-emerald-500/20",
            glow: "from-emerald-500/10 to-transparent",
          },
        ].map((stat, i) => (
          <div
            key={i}
            className="relative bg-white dark:bg-surface-dark border border-border-light dark:border-border-dark rounded-[20px] p-5 shadow-sm overflow-hidden transition-all hover:-translate-y-1 hover:shadow-xl group"
          >
            {/* Premium Background Glow */}
            <div className={`absolute top-0 right-0 w-28 h-28 bg-radial-gradient ${stat.glow} opacity-30 group-hover:opacity-60 transition-opacity duration-700 blur-3xl -mr-8 -mt-8 pointer-events-none`} />

            <div className="relative z-10">
              <div
                className={`w-10 h-10 rounded-xl ${stat.bg} ${stat.color} border ${stat.border} flex items-center justify-center transition-all duration-500 group-hover:scale-110 group-hover:rotate-3 mb-3 shadow-sm`}
              >
                <stat.icon className="w-4.5 h-4.5" strokeWidth={2.5} />
              </div>
              
              <div className="space-y-0.5">
                <h3 className="text-3xl font-black text-text-primary dark:text-white leading-none tabular-nums tracking-tighter mb-1 group-hover:translate-x-1 transition-transform duration-500">
                  {stat.value}
                </h3>
                <p className="text-[10px] font-black text-text-tertiary uppercase tracking-widest opacity-70">
                  {stat.label}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="flex flex-col lg:flex-row gap-6 items-stretch">
        {/* ─── Left Side: Team Directory (Col span 8 equivalent) ─── */}
        <div className="lg:w-2/3 flex flex-col">
          <div className="bg-white dark:bg-surface-dark border border-border-light dark:border-border-dark rounded-3xl shadow-sm overflow-hidden flex flex-col flex-1">
            {/* Header with Search */}
            <div className="p-6 border-b border-border-light/60 dark:border-border-dark/60">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h3 className="text-lg font-black text-text-primary dark:text-white flex items-center gap-2">
                    Team Directory
                    <span className="bg-primary/10 text-primary text-[10px] px-2 py-0.5 rounded-full font-bold">
                      {totalMembers} Total
                    </span>
                  </h3>
                  <p className="text-xs text-text-tertiary font-medium mt-0.5">
                    Manage and view all members in your organization.
                  </p>
                </div>
                <div className="relative group overflow-hidden">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-tertiary group-focus-within:text-primary transition-colors" />
                  <input
                    type="text"
                    placeholder="Find a member..."
                    value={searchQuery}
                    onChange={(e) => {
                      setSearchQuery(e.target.value);
                      setVisibleCount(10); // Reset pagination on search
                    }}
                    className="pl-10 pr-4 py-2 rounded-xl border border-border-light dark:border-border-dark text-sm font-semibold text-text-primary bg-gray-50/50 focus:bg-white dark:bg-gray-800/50 outline-none w-full sm:w-64 focus:ring-2 focus:ring-primary/10 focus:border-primary/30 transition-all shadow-inner"
                  />
                </div>
              </div>

              {/* Leadership Highlights Row */}
              {leadership.length > 0 && (
                <div className="mt-6">
                  <p className="text-[10px] font-bold text-text-tertiary uppercase tracking-widest mb-3 flex items-center gap-2">
                    <div className="h-px bg-border-light dark:bg-border-dark flex-1"></div>
                    Executive Leadership
                    <div className="h-px bg-border-light dark:bg-border-dark flex-1"></div>
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {leadership.map((leader, i) => {
                      const statusInfo = getStatusInfo(leader.status);
                      return (
                        <div
                          key={leader.user_id || i}
                          className="relative group flex items-start gap-3 bg-white dark:bg-gray-800/40 border border-border-light dark:border-border-dark rounded-2xl p-3 transition-all hover:shadow-md hover:-translate-y-0.5"
                        >
                          {/* Avatar & Pulse */}
                          <div className="relative shrink-0 mt-0.5">
                            <Avatar
                              src={leader.avatar}
                              fallback={leader.first_name?.[0]}
                              size="lg"
                              className="w-11 h-11 rounded-xl border-2 border-white dark:border-gray-800 shadow-sm"
                            />
                            <div className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-white dark:bg-gray-800 flex items-center justify-center shadow-sm">
                              <div className={`w-2.5 h-2.5 rounded-full ${statusInfo.color} animate-pulse-subtle`}></div>
                            </div>
                          </div>

                          {/* Info Grid */}
                          <div className="flex-1 min-w-0 grid grid-cols-2 gap-x-3 gap-y-1.5">
                            {/* Identity */}
                            <div className="col-span-1 min-w-0">
                              <h4 className="text-[13px] font-black text-text-primary dark:text-white truncate leading-tight">
                                {leader.first_name} {leader.last_name}
                              </h4>
                              <p className="text-[10px] font-bold text-primary truncate uppercase tracking-wider mt-0.5 opacity-90">
                                {getMemberRole(leader)}
                              </p>
                            </div>

                            {/* Placement */}
                            <div className="col-span-1 text-right min-w-0 pl-2 border-l border-border-light/40 dark:border-border-dark/40">
                              <p className="text-[10px] font-bold text-text-primary dark:text-gray-300 truncate leading-none">
                                {getMemberProject(leader)}
                              </p>
                              <p className="text-[9px] font-bold text-text-tertiary uppercase truncate tracking-tight mt-1">
                                {leader.department || "General"}
                              </p>
                            </div>

                            {/* Status Overlay/Label */}
                            <div className="col-span-2 flex items-center justify-between mt-1 pt-1.5 border-t border-border-light/30 dark:border-border-dark/30">
                              <div className="flex items-center gap-1.5">
                                <statusInfo.icon className={`w-3 h-3 ${statusInfo.textColor}`} />
                                <span className={`text-[9px] font-black uppercase tracking-widest ${statusInfo.textColor}`}>
                                  {leader.status || "On Work"}
                                </span>
                              </div>
                              <div className="text-[8px] font-black uppercase text-text-tertiary tracking-tighter bg-gray-50 dark:bg-gray-700/50 px-1.5 py-0.5 rounded-md">
                                Priority Lead
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* Roster Table */}
            <div className="overflow-x-auto flex-1">
              <table className="w-full text-left">
                <thead className="bg-gray-50/50 dark:bg-gray-900/40">
                  <tr>
                    <th className="px-6 py-4 text-[10px] font-black text-text-tertiary uppercase tracking-widest">
                      Member Name & Role
                    </th>
                    <th className="px-6 py-4 text-[10px] font-black text-text-tertiary uppercase tracking-widest hidden md:table-cell">
                      Placement
                    </th>
                    <th className="px-6 py-4 text-[10px] font-black text-text-tertiary uppercase tracking-widest text-center">
                      Status
                    </th>
                    <th className="px-6 py-4 text-[10px] font-black text-text-tertiary uppercase tracking-widest text-right">
                      Activity
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border-light/50 dark:divide-border-dark/50">
                  {displayedMembers.map((member) => (
                    <tr
                      key={member.organization_member_id}
                      className="group hover:bg-primary/2 dark:hover:bg-primary/5 transition-all cursor-pointer"
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <Avatar
                            src={member.avatar}
                            fallback={member.first_name?.[0]}
                            size="md"
                            className="bg-gray-100 dark:bg-gray-800"
                          />
                          <div className="space-y-0.5">
                            <p className="font-bold text-sm text-text-primary dark:text-gray-200">
                              {member.first_name} {member.last_name}
                            </p>
                            <p className="text-[11px] font-medium text-text-tertiary">
                              {getMemberRole(member)}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 hidden md:table-cell">
                        <div className="flex flex-col">
                          <span className="text-xs font-bold text-text-secondary dark:text-gray-400">
                            {getMemberProject(member)}
                          </span>
                          <span className="text-[10px] font-bold text-text-tertiary uppercase">
                            {member.department || "Organization"}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex justify-start">
                          <StatusBadge statusLabel={member.status} />
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex flex-col items-end">
                          <span className="text-xs font-bold text-text-secondary dark:text-gray-400">
                            {getDaysAgo(member.joined_at)}
                          </span>
                          <span className="text-[9px] font-black uppercase tracking-wider text-text-tertiary">
                            Joined
                          </span>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {displayedMembers.length === 0 && (
                <div className="py-20 flex flex-col items-center justify-center text-center">
                  <div className="w-16 h-16 bg-gray-50 dark:bg-gray-900 rounded-2xl flex items-center justify-center mb-4 border border-border-light dark:border-border-dark">
                    <Search className="w-8 h-8 text-text-tertiary animate-pulse" />
                  </div>
                  <h4 className="font-bold text-text-primary dark:text-white">
                    No results found
                  </h4>
                  <p className="text-sm text-text-tertiary max-w-[200px] mt-1">
                    Try adjusting your filters or search keywords.
                  </p>
                </div>
              )}
            </div>
            
            {/* Pagination / Load More */}
            {visibleCount < filteredMembers.length && (
              <div className="p-4 border-t border-border-light dark:border-border-dark flex justify-center bg-gray-50/30 dark:bg-gray-900/10">
                <button 
                  onClick={() => setVisibleCount(prev => prev + 10)}
                  className="px-6 py-2 rounded-xl border border-border-light dark:border-border-dark text-xs font-black uppercase tracking-widest text-text-secondary hover:text-primary hover:bg-white dark:hover:bg-gray-800 transition-all flex items-center gap-2 shadow-sm"
                >
                  Load More Members
                  <span className="text-[9px] opacity-60">({filteredMembers.length - visibleCount} remaining)</span>
                </button>
              </div>
            )}

            {/* Footer Action */}
            <div className="p-4 bg-gray-50/50 dark:bg-gray-900/20 border-t border-border-light dark:border-border-dark flex justify-center mt-auto">
              <button 
                onClick={onViewMembers}
                className="text-[10px] font-black uppercase tracking-widest text-text-tertiary hover:text-primary transition-all hover:scale-105"
              >
                View Full Directory &rarr;
              </button>
            </div>
          </div>
        </div>

        {/* ─── Right Side: Department Distribution & Activity ─── */}
        <div className="lg:w-1/3 flex flex-col gap-6">
          {/* Distributions breakdown card */}
          <div className="bg-white dark:bg-surface-dark border border-border-light dark:border-border-dark rounded-3xl p-6 shadow-sm relative overflow-hidden group flex flex-col">
            <div className="absolute top-0 right-0 p-6 opacity-[0.03] group-hover:opacity-10 dark:text-white transition-opacity duration-700 pointer-events-none">
              <ShieldCheck size={120} />
            </div>
            
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-[11px] font-black text-text-tertiary dark:text-gray-400 uppercase tracking-[0.2em]">
                Distributions
              </h3>
              <div className="w-8 h-8 rounded-xl bg-gray-50 dark:bg-gray-800 flex items-center justify-center border border-border-light dark:border-border-dark">
                <Users className="w-4 h-4 text-text-tertiary" />
              </div>
            </div>

            <div className="grid grid-cols-1 gap-2.5">
              {distributions.map((item, idx) => (
                <div 
                  key={idx} 
                  className="flex items-center justify-between p-2.5 rounded-2xl bg-gray-50/50 dark:bg-gray-900/10 border border-border-light/40 dark:border-border-dark/40 hover:border-primary/30 hover:bg-white dark:hover:bg-gray-800/50 transition-all group/item shadow-sm hover:shadow-md"
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-xl ${item.bg} ${item.color} flex items-center justify-center transition-transform group-hover/item:scale-110 shadow-sm border border-current/10`}>
                      <item.icon className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-[13px] font-black text-text-primary dark:text-gray-200 leading-none">
                        {item.label}
                      </h4>
                      <p className="text-[9px] font-bold text-text-tertiary uppercase tracking-wider mt-1 opacity-70">
                        Organization Role
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="h-1.5 w-1.5 rounded-full bg-border-light dark:bg-border-dark"></span>
                    <div className="text-xl font-black text-text-primary dark:text-white tabular-nums">
                      {item.count}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Resource Activity Wall */}
          <div className="bg-white dark:bg-surface-dark border border-border-light dark:border-border-dark rounded-3xl p-6 shadow-sm flex flex-col flex-1 overflow-hidden relative group">
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-2">
                <FileText className="w-3.5 h-3.5 text-text-tertiary" />
                <h3 className="text-[11px] font-black text-text-tertiary dark:text-gray-400 uppercase tracking-[0.2em] leading-none mt-0.5">
                  Recent Resources
                </h3>
              </div>
              <button 
                onClick={onViewResources}
                className="text-[10px] font-bold text-primary hover:text-primary-dark transition-colors bg-primary/5 hover:bg-primary/10 px-3 py-1.5 rounded-lg border border-primary/10"
              >
                View All &rarr;
              </button>
            </div>

            <div className="space-y-3 relative ml-0 flex-1">
              {resources.map((file, i) => (
                <div 
                  key={file.id || i} 
                  className="group/file flex items-center gap-4 p-3 rounded-2xl bg-gray-50/30 dark:bg-gray-900/20 border border-transparent hover:border-primary/10 hover:bg-white dark:hover:bg-gray-800 transition-all cursor-pointer hover:shadow-sm"
                  onClick={() => setSelectedResource(file)}
                >
                  <div className="w-10 h-10 shrink-0 rounded-xl bg-white dark:bg-surface-dark border border-border-light dark:border-border-dark flex items-center justify-center text-text-tertiary group-hover/file:text-primary transition-all shadow-sm group-hover/file:scale-110">
                    {file.isExternal ? <ExternalLink className="w-5 h-5 text-blue-400" /> : getFileIcon(file.fileName)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-black text-text-primary dark:text-white truncate group-hover/file:text-primary transition-colors">
                      {file.fileName}
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-[10px] font-bold text-text-tertiary uppercase tracking-tighter bg-gray-100 dark:bg-gray-800 px-1.5 py-0.5 rounded">
                        {new Date(file.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                      </span>
                      <span className="text-[10px] text-text-tertiary opacity-40">•</span>
                      <div className="flex items-center gap-1 min-w-0">
                        <Users className="w-2.5 h-2.5 text-text-tertiary" />
                        <span className="text-[10px] font-black uppercase text-text-tertiary truncate max-w-[120px]">
                          {file.uploaderName}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
              
              {resources.length === 0 && (
                <div className="flex-1 flex flex-col items-center justify-center py-10 bg-gray-50/50 dark:bg-gray-900/20 rounded-2xl border border-dashed border-border-light dark:border-border-dark mb-4">
                  <div className="w-12 h-12 rounded-2xl bg-white dark:bg-gray-800 flex items-center justify-center mb-3 shadow-sm border border-border-light dark:border-border-dark">
                    <FileMinus className="w-6 h-6 text-text-tertiary opacity-40" />
                  </div>
                  <p className="text-[11px] font-black text-text-tertiary uppercase tracking-widest">No recent records</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <FileDetailModal
        isOpen={!!selectedResource}
        onClose={() => setSelectedResource(null)}
        asset={selectedResource}
        canManageFiles={myRole === "FOUNDER" || myRole === "ADMIN"}
        onDownload={handleDownloadFile}
      />
    </div>
  );
}

