import React, { useState, useEffect } from "react";
import {
  Users,
  Briefcase,
  Layers,
  Award,
  Search,
  Filter,
  MoreHorizontal,
  Clock,
} from "lucide-react";
import { Avatar } from "../../../components/ui/Avatar";
import { apiClient } from "../../../lib/axios";

export function OrgOverviewTab() {
  const [members, setMembers] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [teams, setTeams] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [membersRes, deptsRes, teamsRes] = await Promise.all([
          apiClient.get("/org/members"),
          apiClient.get("/org/departments").catch(() => null),
          apiClient.get("/org/teams").catch(() => null), // Optional fallback
        ]);

        const membersList = membersRes.data?.members || [];
        // Extract safely
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
      } catch (error) {
        console.error("Failed to fetch overview data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

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
    .slice(0, 2);

  // Filter roster by search
  const rosterMembers = members
    .filter((m) =>
      `${m.first_name} ${m.last_name} ${m.designation_title || m.org_role}`
        .toLowerCase()
        .includes(searchQuery.toLowerCase()),
    )
    .slice(0, 5); // Limit to 5 for the overview

  // Map real Structure logic
  let displayStructure = [];

  if (departments.length > 0) {
    displayStructure = departments.slice(0, 4).map((dept, index) => {
      // Find all members accurately linked to this department
      const deptMembers = members.filter((m) => m.department === dept.name);

      // Look for a leader
      const leadMember = deptMembers.find(
        (m) =>
          m.org_role === "ADMIN" ||
          m.designation_title?.toLowerCase().includes("lead") ||
          m.designation_title?.toLowerCase().includes("head"),
      );
      const leadName = leadMember
        ? `${leadMember.first_name} ${leadMember.last_name}`
        : "Unassigned";

      // Calculate the number of distinct roles in this department genuinely represented
      const distinctRoles = new Set(
        deptMembers.map((m) => m.designation_title || m.org_role),
      ).size;

      // Calculate genuine percentage out of total members (max 100%)
      const percent =
        totalMembers > 0
          ? Math.round((deptMembers.length / totalMembers) * 100)
          : 0;

      const colors = [
        "bg-emerald-500",
        "bg-blue-500",
        "bg-indigo-500",
        "bg-green-500",
      ];

      return {
        id: dept.department_id || index,
        name: dept.name,
        lead: leadName,
        rolesCount: distinctRoles,
        staffCount: deptMembers.length,
        percent: Math.max(10, percent),
        color: colors[index % colors.length],
      };
    });
  } else {
    // If no real departments, derive them organically from titles
    const derivedGroups = {};
    members.forEach((m) => {
      let groupName = "General";
      if (m.designation_title) {
        if (m.designation_title.toLowerCase().includes("design"))
          groupName = "Design";
        else if (
          m.designation_title.toLowerCase().includes("engineer") ||
          m.designation_title.toLowerCase().includes("dev")
        )
          groupName = "Engineering";
        else if (m.designation_title.toLowerCase().includes("market"))
          groupName = "Marketing";
        else if (m.designation_title.toLowerCase().includes("sale"))
          groupName = "Sales";
      }
      if (!derivedGroups[groupName]) derivedGroups[groupName] = [];
      derivedGroups[groupName].push(m);
    });

    const colors = [
      "bg-emerald-500",
      "bg-blue-500",
      "bg-indigo-500",
      "bg-green-500",
    ];
    displayStructure = Object.keys(derivedGroups)
      .slice(0, 4)
      .map((groupName, index) => {
        const staff = derivedGroups[groupName];
        const distinctRoles = new Set(
          staff.map((m) => m.designation_title || m.org_role),
        ).size;
        const percent =
          totalMembers > 0
            ? Math.round((staff.length / totalMembers) * 100)
            : 0;
        return {
          id: groupName,
          name: groupName,
          lead: "Unassigned",
          rolesCount: distinctRoles,
          staffCount: staff.length,
          percent: Math.max(10, percent),
          color: colors[index % colors.length],
        };
      });
  }

  // Derive Recent Members organically
  const recentMembers = [...members]
    .sort((a, b) => new Date(b.joined_at) - new Date(a.joined_at))
    .slice(0, 3);
  const getDaysAgo = (dateStr) => {
    if (!dateStr) return "Recently";
    const diff = Math.floor(
      (new Date() - new Date(dateStr)) / (1000 * 60 * 60 * 24),
    );
    return diff === 0 ? "Today" : diff === 1 ? "1d ago" : `${diff}d ago`;
  };

  // Helper formatting routines
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

  const isOnline = (status) => {
    const lower = (status || "").toLowerCase();
    return lower === "active" || lower === "on work" || lower === "online";
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500 -mt-2">
      {/* --- Top Stats Row --- */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Members */}
        <div className="bg-white dark:bg-surface-dark border border-border-light dark:border-border-dark rounded-2xl p-5 shadow-sm flex items-center justify-between transition-all hover:shadow-md">
          <div className="space-y-1">
            <p className="text-[10px] font-black text-text-tertiary uppercase tracking-widest">
              Total Members
            </p>
            <h3 className="text-3xl font-black text-text-primary dark:text-white">
              {totalMembers}
            </h3>
          </div>
          <div className="w-12 h-12 rounded-full bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800/50 flex items-center justify-center text-blue-500">
            <Users className="w-5 h-5" />
          </div>
        </div>

        {/* Dynamic: Active Teams instead of Projects */}
        <div className="bg-white dark:bg-surface-dark border border-border-light dark:border-border-dark rounded-2xl p-5 shadow-sm flex items-center justify-between transition-all hover:shadow-md">
          <div className="space-y-1">
            <p className="text-[10px] font-black text-text-tertiary uppercase tracking-widest">
              Active Teams
            </p>
            <h3 className="text-3xl font-black text-text-primary dark:text-white">
              {activeTeamsCount}
            </h3>
          </div>
          <div className="w-12 h-12 rounded-full bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-100 dark:border-indigo-800/50 flex items-center justify-center text-indigo-500">
            <Briefcase className="w-5 h-5" />
          </div>
        </div>

        {/* Dynamic: Total Departments instead of Org Velocity */}
        <div className="bg-white dark:bg-surface-dark border border-border-light dark:border-border-dark rounded-2xl p-5 shadow-sm flex items-center justify-between transition-all hover:shadow-md">
          <div className="space-y-1">
            <p className="text-[10px] font-black text-text-tertiary uppercase tracking-widest">
              Departments
            </p>
            <h3 className="text-3xl font-black text-text-primary dark:text-white">
              {departmentsCount}
            </h3>
          </div>
          <div className="w-12 h-12 rounded-full bg-amber-50 dark:bg-amber-900/20 border border-amber-100 dark:border-amber-800/50 flex items-center justify-center text-amber-500">
            <Layers className="w-5 h-5" />
          </div>
        </div>

        {/* Dynamic: Distinct Roles instead of Org Health */}
        <div className="bg-white dark:bg-surface-dark border border-border-light dark:border-border-dark rounded-2xl p-5 shadow-sm flex items-center justify-between transition-all hover:shadow-md">
          <div className="space-y-1">
            <p className="text-[10px] font-black text-text-tertiary uppercase tracking-widest">
              Roles Defined
            </p>
            <h3 className="text-3xl font-black text-text-primary dark:text-white">
              {uniqueRolesCount}
            </h3>
          </div>
          <div className="w-12 h-12 rounded-full bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-100 dark:border-emerald-800/50 flex items-center justify-center text-emerald-500">
            <Award className="w-5 h-5" />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* --- Left Column (Leadership & Roster) --- */}
        <div className="lg:col-span-2 space-y-6">
          {/* Leadership Section */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-text-primary dark:text-white font-bold px-1">
              <div className="w-5 h-5 rounded border-2 border-primary/20 flex items-center justify-center bg-primary/5 text-primary">
                <svg
                  width="12"
                  height="12"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z" />
                </svg>
              </div>
              Leadership
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {leadership.map((leader, i) => (
                <div
                  key={leader.user_id || i}
                  className="bg-white dark:bg-surface-dark border border-border-light dark:border-border-dark rounded-2xl p-4 flex items-center gap-4 transition-all hover:border-primary/30 hover:shadow-md group"
                >
                  <Avatar
                    src={leader.avatar}
                    fallback={leader.first_name?.[0]}
                    size="lg"
                    className="border-2 border-gray-100 dark:border-gray-800 shrink-0 shadow-sm"
                  />
                  <div className="min-w-0 flex-1">
                    <h4 className="font-bold text-[15px] text-text-primary dark:text-white truncate group-hover:text-primary transition-colors">
                      {leader.first_name} {leader.last_name}
                    </h4>
                    <p className="text-xs font-semibold text-primary truncate mt-0.5">
                      {getMemberRole(leader)}
                    </p>
                    <div className="flex items-center gap-3 mt-2 text-[10px] uppercase font-bold tracking-wider text-text-tertiary">
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-gray-400" />{" "}
                        {leader.location || "Remote"}
                      </span>
                      {isOnline(leader.status) ? (
                        <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400">
                          <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_4px_rgba(16,185,129,0.5)]"></div>{" "}
                          Online
                        </span>
                      ) : (
                        <span className="flex items-center gap-1 text-text-tertiary">
                          <div className="w-1.5 h-1.5 rounded-full bg-amber-500"></div>{" "}
                          {leader.status?.toLowerCase() || "Working"}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
              {leadership.length === 0 && (
                <div className="bg-white dark:bg-surface-dark border border-border-light dark:border-border-dark rounded-2xl p-4 flex items-center justify-center transition-all hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer border-dashed col-span-2">
                  <p className="text-sm font-bold text-text-tertiary flex items-center gap-2">
                    <Users className="w-4 h-4" /> No Leadership assigned
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Team Roster Section */}
          <div className="bg-white dark:bg-surface-dark border border-border-light dark:border-border-dark rounded-2xl shadow-sm overflow-hidden flex flex-col">
            <div className="p-5 border-b border-border-light dark:border-border-dark flex items-center justify-between">
              <h3 className="font-bold text-text-primary dark:text-white">
                Team Roster
              </h3>
              <div className="flex items-center gap-2">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-text-tertiary" />
                  <input
                    type="text"
                    placeholder="Search team..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9 pr-3 py-1.5 rounded-xl border border-border-light dark:border-border-dark text-xs font-semibold text-text-primary bg-gray-50 focus:bg-white dark:bg-gray-800/50 outline-none w-48 focus:ring-2 focus:ring-primary/20 transition-all"
                  />
                </div>
                <button className="p-1.5 rounded-xl border border-border-light dark:border-border-dark text-text-tertiary hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors shadow-sm">
                  <Filter className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="overflow-x-auto flex-1">
              <table className="w-full text-left text-sm">
                <thead className="text-[10px] font-black text-text-tertiary uppercase tracking-wider bg-gray-50/50 dark:bg-gray-900/20">
                  <tr>
                    <th className="px-5 py-4">Name</th>
                    <th className="px-5 py-4">Role</th>
                    <th className="px-5 py-4 pl-0">Current Team</th>
                    <th className="px-5 py-4">Status</th>
                    <th className="px-5 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border-light dark:divide-border-dark">
                  {rosterMembers.map((member) => (
                    <tr
                      key={member.organization_member_id}
                      className="hover:bg-gray-50/50 dark:hover:bg-gray-800/30 transition-colors group"
                    >
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-3">
                          <Avatar
                            src={member.avatar}
                            fallback={member.first_name?.[0]}
                            size="sm"
                          />
                          <span className="font-bold text-text-primary dark:text-gray-200">
                            {member.first_name} {member.last_name}
                          </span>
                        </div>
                      </td>
                      <td className="px-5 py-3.5 text-text-secondary dark:text-gray-400 text-xs font-medium">
                        {getMemberRole(member)}
                      </td>
                      <td className="px-5 py-3.5 pl-0">
                        <span className="text-xs font-bold text-text-secondary dark:text-gray-400 max-w-[120px] truncate block">
                          {getMemberProject(member)}
                        </span>
                      </td>
                      <td className="px-5 py-3.5">
                        {isOnline(member.status) ? (
                          <div className="flex items-center gap-1.5 px-2 py-0.5 w-fit rounded bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 text-[10px] font-bold uppercase tracking-wider">
                            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_4px_rgba(16,185,129,0.5)]"></div>
                            {member.status || "ACTIVE"}
                          </div>
                        ) : (
                          <div className="flex items-center gap-1.5 px-2 py-0.5 w-fit rounded bg-gray-100 dark:bg-gray-800 text-text-secondary dark:text-gray-400 text-[10px] font-bold uppercase tracking-wider">
                            <div className="w-1.5 h-1.5 rounded-full bg-gray-400"></div>
                            {member.status || "IDLE"}
                          </div>
                        )}
                      </td>
                      <td className="px-5 py-3.5 text-right">
                        <button className="p-1.5 rounded-lg text-text-tertiary hover:text-text-primary hover:bg-gray-100 dark:hover:bg-gray-800 opacity-0 group-hover:opacity-100 transition-all">
                          <MoreHorizontal className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                  {rosterMembers.length === 0 && (
                    <tr>
                      <td
                        colSpan="5"
                        className="px-5 py-12 text-center text-text-tertiary text-sm"
                      >
                        No team members found matching your search.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* --- Right Column (Structure & Processes) --- */}
        <div className="space-y-6">
          {/* Organizational Structure */}
          <div className="bg-white dark:bg-surface-dark border border-border-light dark:border-border-dark rounded-2xl p-6 shadow-sm">
            <h3 className="font-bold text-text-primary dark:text-white mb-6">
              Organizational Structure
            </h3>

            <div className="space-y-6">
              {displayStructure.length > 0 ? (
                displayStructure.map((dept) => (
                  <div key={dept.id} className="space-y-2.5">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="text-sm font-bold text-text-primary dark:text-gray-200">
                          {dept.name}
                        </h4>
                        <p className="text-[10px] uppercase font-bold tracking-widest text-text-tertiary mt-1">
                          Lead: {dept.lead} &bull; {dept.rolesCount} Roles
                        </p>
                      </div>
                      <span className="text-[10px] font-black uppercase tracking-wider text-text-primary dark:text-white group flex items-center gap-1.5">
                        {dept.staffCount} Staff
                      </span>
                    </div>
                    {/* Progress bar visual */}
                    <div className="w-full h-1.5 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                      <div
                        className={`h-full ${dept.color} rounded-full transition-all duration-1000`}
                        style={{ width: `${dept.percent}%` }}
                      ></div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-6 text-sm text-text-tertiary">
                  No organizational structure data found.
                </div>
              )}
            </div>
          </div>

          {/* Newest Additions */}
          <div className="bg-white dark:bg-surface-dark border border-border-light dark:border-border-dark rounded-2xl p-6 shadow-sm flex flex-col pt-5">
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-bold text-text-primary dark:text-white">
                Recent Additions
              </h3>
              <button className="text-text-tertiary hover:text-text-primary transition-colors p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-md">
                <Clock className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-4 mb-6">
              {recentMembers.map((member) => (
                <div
                  key={member.organization_member_id}
                  className="flex justify-between items-center group"
                >
                  <div className="flex items-center gap-3">
                    <Avatar
                      src={member.avatar}
                      fallback={member.first_name?.[0]}
                      size="sm"
                      className="w-8 h-8"
                    />
                    <div>
                      <h4 className="text-[13px] font-bold text-text-primary dark:text-gray-200 group-hover:text-primary transition-colors cursor-pointer">
                        {member.first_name} {member.last_name}
                      </h4>
                      <p className="text-[10px] font-bold text-text-tertiary mt-0.5 max-w-[130px] truncate">
                        {getMemberRole(member)}
                      </p>
                    </div>
                  </div>
                  <div className="text-[10px] font-black uppercase tracking-wider text-text-tertiary">
                    {getDaysAgo(member.joined_at)}
                  </div>
                </div>
              ))}
              {recentMembers.length === 0 && (
                <div className="text-xs text-text-tertiary text-center py-2">
                  No active members found.
                </div>
              )}
            </div>

            <button className="w-full py-2.5 mt-auto bg-gray-50 hover:bg-gray-100 dark:bg-gray-800/50 dark:hover:bg-gray-800 rounded-xl text-xs font-bold text-text-secondary dark:text-gray-300 hover:text-text-primary dark:hover:text-white transition-colors border border-border-light dark:border-border-dark shadow-sm">
              View All Activity
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// Simple MapPin SVG component
function MapPin(props) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
      <circle cx="12" cy="10" r="3" />
    </svg>
  );
}
