import React from "react";
import {
  Users,
  Briefcase,
  Zap,
  Heart,
  Plus,
  Search,
  Filter,
  MoreHorizontal,
  ChevronDown,
  MapPin,
  Mail,
  Shield,
} from "lucide-react";
import { Button } from "../../components/ui/Button";
import { Card } from "../../components/ui/Card";
import { Avatar } from "../../components/ui/Avatar";
import { Badge } from "../../components/ui/Badge";
import { Input } from "../../components/ui/Input";

// --- Mock Data ---
const FOUNDERS = [
  {
    name: "Olivia Hart",
    role: "CEO & Co-Founder",
    location: "San Francisco",
    status: "Online",
    img: "https://i.pravatar.cc/150?u=olivia",
  },
  {
    name: "Daniel Kim",
    role: "CTO & Co-Founder",
    location: "New York",
    status: "In Meeting",
    img: "https://i.pravatar.cc/150?u=daniel",
  },
];

const TEAMS = [
  {
    name: "Engineering",
    lead: "Ben Adams",
    members: 12,
    projects: 4,
    health: 92,
  },
  {
    name: "Product Design",
    lead: "Chloe Davis",
    members: 6,
    projects: 2,
    health: 88,
  },
  {
    name: "Growth Marketing",
    lead: "Sarah Lee",
    members: 5,
    projects: 3,
    health: 95,
  },
  {
    name: "Operations",
    lead: "Marcus Allen",
    members: 4,
    projects: 1,
    health: 100,
  },
];

const MEMBERS = [
  {
    id: 1,
    name: "Elena Rodriguez",
    role: "Senior Product Designer",
    team: "Design",
    project: "Mobile App Revamp",
    status: "Active",
    img: "https://i.pravatar.cc/150?u=elena",
  },
  {
    id: 2,
    name: "Kenji Tanaka",
    role: "Backend Engineer",
    team: "Engineering",
    project: "API Migration",
    status: "On Leave",
    img: "https://i.pravatar.cc/150?u=kenji",
  },
  {
    id: 3,
    name: "Aisha Khan",
    role: "Growth Strategist",
    team: "Marketing",
    project: "Q4 Campaign",
    status: "Active",
    img: "https://i.pravatar.cc/150?u=aisha",
  },
  {
    id: 4,
    name: "David Chen",
    role: "DevOps Engineer",
    team: "Engineering",
    project: "Infrastructure",
    status: "Active",
    img: "https://i.pravatar.cc/150?u=david",
  },
  {
    id: 5,
    name: "Maria Garcia",
    role: "Data Scientist",
    team: "Engineering",
    project: "AI Model",
    status: "Active",
    img: "https://i.pravatar.cc/150?u=maria",
  },
];

const PROCESSES = [
  {
    name: "Sprint Cycle",
    status: "Active",
    progress: 65,
    owner: "Engineering",
  },
  { name: "Design Review", status: "Pending", progress: 0, owner: "Design" },
  {
    name: "Quarterly Planning",
    status: "Completed",
    progress: 100,
    owner: "Leadership",
  },
];

export function TeamPage({ hideHeader = false }) {
  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-20">
      {/* Header */}
      {!hideHeader && (
        <div className="flex flex-col md:flex-row justify-between items-start gap-6 border-b border-border-light dark:border-border-dark pb-6">
          <div>
            <h1 className="text-3xl font-bold text-text-primary dark:text-white">
              Organization Overview
            </h1>
            <p className="text-text-secondary dark:text-gray-400 mt-1">
              Manage your organization structure, members, and operational
              health.
            </p>
          </div>
          <div className="flex gap-3">
            <Button variant="secondary" className="gap-2">
              <Mail className="h-4 w-4" /> Invite
            </Button>
            <Button className="gap-2">
              <Plus className="h-4 w-4" /> Add Member
            </Button>
          </div>
        </div>
      )}

      {/* Pulse Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          {
            label: "Total Members",
            value: "29",
            icon: Users,
            color: "text-primary",
            bg: "bg-primary/10",
          },
          {
            label: "Active Projects",
            value: "12",
            icon: Briefcase,
            color: "text-blue-600",
            bg: "bg-blue-100 dark:bg-blue-900/30",
          },
          {
            label: "Org Velocity",
            value: "+14%",
            icon: Zap,
            color: "text-warning",
            bg: "bg-warning/10",
          },
          {
            label: "Org Health",
            value: "94/100",
            icon: Heart,
            color: "text-success",
            bg: "bg-success/10",
          },
        ].map((stat, i) => (
          <Card
            key={i}
            className="p-4 flex items-center gap-4 bg-white dark:bg-surface-dark hover:shadow-md transition-shadow border-border-light dark:border-border-dark"
          >
            <div
              className={`h-12 w-12 rounded-xl flex items-center justify-center ${stat.bg} ${stat.color}`}
            >
              <stat.icon className="h-6 w-6" />
            </div>
            <div>
              <p className="text-xs text-text-tertiary font-medium uppercase tracking-wide">
                {stat.label}
              </p>
              <p className="text-2xl font-bold text-text-primary dark:text-white">
                {stat.value}
              </p>
            </div>
          </Card>
        ))}
      </div>

      {/* Layout Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Roster & Groups (2/3 width) */}
        <div className="lg:col-span-2 space-y-8">
          {/* Founders Section */}
          <section>
            <h2 className="text-lg font-bold text-text-primary dark:text-white mb-4 flex items-center gap-2">
              <Shield className="h-5 w-5 text-primary" /> Leadership
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {FOUNDERS.map((founder, i) => (
                <Card
                  key={i}
                  className="p-5 flex items-center gap-4 bg-linear-to-br from-white to-gray-50 dark:from-surface-dark dark:to-[#1a202c] border-primary/20"
                >
                  <Avatar
                    src={founder.img}
                    size="lg"
                    className="ring-2 ring-white dark:ring-surface-dark"
                  />
                  <div>
                    <h3 className="font-bold text-text-primary dark:text-white">
                      {founder.name}
                    </h3>
                    <p className="text-sm text-primary font-medium">
                      {founder.role}
                    </p>
                    <div className="flex items-center gap-3 mt-2 text-xs text-text-tertiary">
                      <span className="flex items-center gap-1">
                        <MapPin className="h-3 w-3" /> {founder.location}
                      </span>
                      <span className="flex items-center gap-1">
                        <div className="h-2 w-2 rounded-full bg-success"></div>{" "}
                        {founder.status}
                      </span>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </section>

          {/* All Members Table */}
          <Card className="bg-white dark:bg-surface-dark overflow-hidden">
            <div className="p-5 border-b border-border-light dark:border-border-dark flex flex-col sm:flex-row justify-between items-center gap-4">
              <h2 className="text-lg font-bold text-text-primary dark:text-white">
                Team Roster
              </h2>
              <div className="flex gap-3 w-full sm:w-auto">
                <div className="relative flex-1 sm:flex-none">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-tertiary" />
                  <input
                    type="text"
                    placeholder="Search team..."
                    className="h-9 w-full sm:w-48 pl-9 pr-4 rounded-lg border border-border-light bg-background-light dark:bg-background-dark dark:border-border-dark text-sm focus:ring-2 focus:ring-primary/20"
                  />
                </div>
                <Button variant="secondary" size="icon" className="shrink-0">
                  <Filter className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-gray-50 dark:bg-gray-800/50 border-b border-border-light dark:border-border-dark">
                  <tr>
                    <th className="px-6 py-3 font-semibold text-text-tertiary">
                      Name
                    </th>
                    <th className="px-6 py-3 font-semibold text-text-tertiary">
                      Role
                    </th>
                    <th className="px-6 py-3 font-semibold text-text-tertiary">
                      Current Project
                    </th>
                    <th className="px-6 py-3 font-semibold text-text-tertiary">
                      Status
                    </th>
                    <th className="px-6 py-3 font-semibold text-text-tertiary text-right">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border-light dark:divide-border-dark">
                  {MEMBERS.map((member) => (
                    <tr
                      key={member.id}
                      className="group hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <Avatar src={member.img} size="sm" />
                          <span className="font-medium text-text-primary dark:text-white">
                            {member.name}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-text-secondary dark:text-gray-400">
                        {member.role}
                      </td>
                      <td className="px-6 py-4">
                        <Badge
                          variant="neutral"
                          className="bg-gray-100 dark:bg-gray-800"
                        >
                          {member.project}
                        </Badge>
                      </td>
                      <td className="px-6 py-4">
                        <Badge
                          variant={
                            member.status === "Active" ? "success" : "warning"
                          }
                        >
                          {member.status}
                        </Badge>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button className="text-text-tertiary hover:text-primary p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700">
                          <MoreHorizontal className="h-4 w-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </div>

        {/* Right Column: Structure & Processes (1/3 width) */}
        <div className="space-y-8">
          {/* Groups / Departments */}
          <Card className="bg-white dark:bg-surface-dark">
            <div className="p-5 border-b border-border-light dark:border-border-dark">
              <h2 className="text-lg font-bold text-text-primary dark:text-white">
                Organizational Structure
              </h2>
            </div>
            <div className="p-5 space-y-6">
              {TEAMS.map((team, i) => (
                <div key={i} className="space-y-2">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="font-semibold text-text-primary dark:text-white">
                        {team.name}
                      </p>
                      <p className="text-xs text-text-tertiary">
                        Lead: {team.lead} • {team.projects} Projects
                      </p>
                    </div>
                    <Badge
                      variant="neutral"
                      className="bg-gray-100 dark:bg-gray-800"
                    >
                      {team.members} Staff
                    </Badge>
                  </div>
                  <div className="w-full bg-gray-100 dark:bg-gray-800 h-1.5 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full ${team.health > 90 ? "bg-success" : "bg-primary"}`}
                      style={{ width: `${team.health}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* Processes Module */}
          <Card className="bg-white dark:bg-surface-dark">
            <div className="p-5 border-b border-border-light dark:border-border-dark flex justify-between items-center">
              <h2 className="text-lg font-bold text-text-primary dark:text-white">
                Active Processes
              </h2>
              <ChevronDown className="h-5 w-5 text-text-tertiary" />
            </div>
            <div className="p-2">
              {PROCESSES.map((proc, i) => (
                <div
                  key={i}
                  className="flex items-center gap-4 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors cursor-pointer"
                >
                  <div
                    className={`h-2 w-2 rounded-full shrink-0 ${
                      proc.status === "Active"
                        ? "bg-primary animate-pulse"
                        : proc.status === "Completed"
                          ? "bg-success"
                          : "bg-warning"
                    }`}
                  ></div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-text-primary dark:text-white">
                      {proc.name}
                    </p>
                    <p className="text-xs text-text-tertiary">{proc.owner}</p>
                  </div>
                  {proc.status === "Active" ? (
                    <div className="text-xs font-bold text-primary">
                      {proc.progress}%
                    </div>
                  ) : (
                    <CheckCircleIcon status={proc.status} />
                  )}
                </div>
              ))}
            </div>
            <div className="p-4 border-t border-border-light dark:border-border-dark">
              <Button variant="outline" className="w-full text-xs h-8">
                View Process Library
              </Button>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}

function CheckCircleIcon({ status }) {
  if (status === "Completed") return <div className="text-success">✔</div>;
  return <div className="text-text-tertiary text-xs">Wait</div>;
}
