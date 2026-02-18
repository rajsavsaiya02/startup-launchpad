import React, { useState } from "react";

import {
  Share2,
  Plus,
  MoreHorizontal,
  Search,
  Calendar,
  Clock,
  Paperclip,
  MessageSquare,
  CheckSquare,
  Filter,
  ArrowRight,
  ChevronDown,
  Users,
  X,
  DollarSign,
  PieChart,
  TrendingUp,
  FileText,
  Download,
  Briefcase,
  CreditCard,
  Layers,
} from "lucide-react";
import { Button } from "../../components/ui/Button";
import { Avatar } from "../../components/ui/Avatar";
import { Badge } from "../../components/ui/Badge";
import { Card } from "../../components/ui/Card";
import { cn } from "../../utils/cn";
import { TaskDrawer } from "./components/TaskDrawer";

// --- Mock Data for Board ---
const BOARD_DATA = {
  todo: [
    {
      id: 1,
      title: "Design Landing Page Mockups",
      desc: "Create high-fidelity mockups for the new homepage.",
      priority: "High",
      assignees: [1, 2],
      comments: 3,
      files: 2,
    },
    {
      id: 2,
      title: "Develop User Authentication Flow",
      desc: "Implement sign-up, login, and password reset.",
      priority: "Medium",
      assignees: [3],
      comments: 1,
      files: 0,
    },
    {
      id: 3,
      title: "Setup Staging Environment",
      desc: "Configure the server and deployment pipeline.",
      priority: "High",
      assignees: [1],
      comments: 5,
      files: 1,
    },
  ],
  progress: [
    {
      id: 4,
      title: "Write Homepage Copy",
      desc: "Draft compelling copy for the main sections of the new landing page.",
      priority: "Low",
      assignees: [2],
      active: true,
      comments: 0,
      files: 0,
    },
  ],
  done: [
    {
      id: 5,
      title: "Finalize Brand Style Guide",
      desc: "Complete the documentation for colors and typography.",
      priority: "Medium",
      assignees: [],
      comments: 12,
      files: 4,
    },
    {
      id: 6,
      title: "Project Kick-off Meeting",
      desc: "Initial meeting with all stakeholders.",
      priority: "Low",
      assignees: [],
      comments: 2,
      files: 1,
    },
  ],
};

// --- Mock Data for Financials ---
const PROJECT_EXPENSES = [
  {
    id: 1,
    operation: "Design Phase 1",
    type: "Labor (Freelance)",
    vendor: "Elena Rodriguez",
    date: "Oct 15, 2023",
    amount: "$2,400.00",
    status: "Paid",
  },
  {
    id: 2,
    operation: "Server Infrastructure",
    type: "Software",
    vendor: "AWS",
    date: "Oct 20, 2023",
    amount: "$450.00",
    status: "Recurring",
  },
  {
    id: 3,
    operation: "User Testing",
    type: "Marketing",
    vendor: "UserTesting.com",
    date: "Nov 02, 2023",
    amount: "$800.00",
    status: "Pending",
  },
  {
    id: 4,
    operation: "Frontend Dev Sprint 1",
    type: "Labor",
    vendor: "Internal Alloc.",
    date: "Nov 10, 2023",
    amount: "$4,500.00",
    status: "Allocated",
  },
];

export function ProjectDetailsPage() {
  const [activeTab, setActiveTab] = useState("Board");
  const [selectedTask, setSelectedTask] = useState(null);

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)] bg-white dark:bg-background-dark overflow-hidden">
      {/* 1. Project Header */}
      <div className="shrink-0 px-8 pt-8 pb-0">
        <div className="flex items-center justify-between border-b border-border-light dark:border-border-dark pb-6">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <h1 className="text-[28px] font-semibold text-text-primary dark:text-white">
                Website Redesign
              </h1>
              <Badge variant="success" className="text-xs px-2 py-0.5">
                Active
              </Badge>
            </div>
            <p className="text-sm text-text-secondary dark:text-gray-400">
              Track progress for the new marketing website launch.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="secondary" className="gap-2">
              <Share2 className="h-4 w-4" /> Share
            </Button>
            <Button className="gap-2">
              <Plus className="h-4 w-4" /> New Task
            </Button>
          </div>
        </div>

        {/* Tabs */}
        <div className="mt-6 border-b border-border-light dark:border-border-dark">
          <nav className="-mb-px flex space-x-8">
            {[
              "Overview",
              "Board",
              "Financials",
              "Activity",
              "Files",
              "Members",
            ].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={cn(
                  "whitespace-nowrap border-b-2 py-4 text-sm font-medium transition-colors",
                  activeTab === tab
                    ? "border-primary text-primary"
                    : "border-transparent text-text-secondary hover:text-text-primary hover:border-gray-300",
                )}
              >
                {tab}
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* 2. Tab Content Area */}
      <div className="flex-1 overflow-y-auto bg-gray-50 dark:bg-[#161b22] p-8">
        {/* --- BOARD VIEW --- */}
        {activeTab === "Board" && (
          <div className="flex h-full gap-6 min-w-max">
            <BoardColumn title="To Do" count={3} color="border-yellow-400">
              {BOARD_DATA.todo.map((task) => (
                <TaskCard
                  key={task.id}
                  task={task}
                  onClick={() => setSelectedTask(task)}
                />
              ))}
            </BoardColumn>
            <BoardColumn title="In Progress" count={1} color="border-primary">
              {BOARD_DATA.progress.map((task) => (
                <TaskCard
                  key={task.id}
                  task={task}
                  onClick={() => setSelectedTask(task)}
                />
              ))}
            </BoardColumn>
            <BoardColumn title="Done" count={2} color="border-success">
              {BOARD_DATA.done.map((task) => (
                <TaskCard
                  key={task.id}
                  task={task}
                  onClick={() => setSelectedTask(task)}
                />
              ))}
            </BoardColumn>
          </div>
        )}

        {/* --- FINANCIALS VIEW --- */}
        {activeTab === "Financials" && (
          <div className="space-y-8 max-w-6xl mx-auto">
            {/* Budget Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card className="p-6 border-l-4 border-primary">
                <p className="text-sm text-text-secondary font-medium">
                  Total Project Budget
                </p>
                <div className="flex items-baseline gap-2 mt-2">
                  <h3 className="text-3xl font-bold text-text-primary dark:text-white">
                    $50,000
                  </h3>
                  <span className="text-xs text-text-tertiary">USD</span>
                </div>
              </Card>
              <Card className="p-6 border-l-4 border-warning">
                <p className="text-sm text-text-secondary font-medium">
                  Actual Spent
                </p>
                <div className="flex items-baseline gap-2 mt-2">
                  <h3 className="text-3xl font-bold text-text-primary dark:text-white">
                    $8,150
                  </h3>
                  <span className="text-xs text-text-tertiary">16.3%</span>
                </div>
              </Card>
              <Card className="p-6 border-l-4 border-success">
                <p className="text-sm text-text-secondary font-medium">
                  Remaining
                </p>
                <div className="flex items-baseline gap-2 mt-2">
                  <h3 className="text-3xl font-bold text-text-primary dark:text-white">
                    $41,850
                  </h3>
                  <span className="text-xs text-success flex items-center gap-1">
                    <TrendingUp className="h-3 w-3" /> On Track
                  </span>
                </div>
              </Card>
            </div>

            {/* Cost Table */}
            <Card className="overflow-hidden bg-white dark:bg-surface-dark">
              <div className="p-6 border-b border-border-light dark:border-border-dark flex justify-between items-center">
                <div>
                  <h3 className="text-lg font-bold text-text-primary dark:text-white">
                    Operational Expenses
                  </h3>
                  <p className="text-sm text-text-secondary">
                    Costs linked directly to project tasks and milestones.
                  </p>
                </div>
                <Button variant="outline" size="sm" className="gap-2">
                  <Download className="h-4 w-4" /> Export Report
                </Button>
              </div>
              <table className="w-full text-sm text-left">
                <thead className="bg-gray-50 dark:bg-gray-800/50 text-text-secondary border-b border-border-light dark:border-border-dark">
                  <tr>
                    <th className="px-6 py-4 font-medium">Operation / Task</th>
                    <th className="px-6 py-4 font-medium">Type</th>
                    <th className="px-6 py-4 font-medium">Vendor/Member</th>
                    <th className="px-6 py-4 font-medium">Date</th>
                    <th className="px-6 py-4 font-medium text-right">Amount</th>
                    <th className="px-6 py-4 font-medium text-center">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border-light dark:divide-border-dark">
                  {PROJECT_EXPENSES.map((ex, i) => (
                    <tr
                      key={i}
                      className="hover:bg-gray-50 dark:hover:bg-gray-800/30 transition-colors"
                    >
                      <td className="px-6 py-4 font-medium text-text-primary dark:text-white flex items-center gap-2">
                        <Layers className="h-4 w-4 text-text-tertiary" />{" "}
                        {ex.operation}
                      </td>
                      <td className="px-6 py-4 text-text-secondary">
                        <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded-md bg-gray-100 dark:bg-gray-800 text-xs">
                          {ex.type === "Software" ? (
                            <CreditCard className="h-3 w-3" />
                          ) : (
                            <Users className="h-3 w-3" />
                          )}
                          {ex.type}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-text-secondary">
                        {ex.vendor}
                      </td>
                      <td className="px-6 py-4 text-text-tertiary">
                        {ex.date}
                      </td>
                      <td className="px-6 py-4 text-right font-mono font-medium text-text-primary dark:text-white">
                        {ex.amount}
                      </td>
                      <td className="px-6 py-4 text-center">
                        <Badge
                          variant={
                            ex.status === "Paid"
                              ? "success"
                              : ex.status === "Pending"
                                ? "warning"
                                : "neutral"
                          }
                        >
                          {ex.status}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </Card>
          </div>
        )}

        {/* --- ACTIVITY VIEW --- */}
        {activeTab === "Activity" && (
          <div className="max-w-3xl mx-auto">
            <Card className="p-8 bg-white dark:bg-surface-dark">
              <h3 className="text-lg font-bold mb-6 text-text-primary dark:text-white">
                Project Audit Log
              </h3>
              <div className="space-y-8 relative pl-4 border-l border-border-light dark:border-border-dark ml-2">
                {[
                  {
                    user: "Alex Johnson",
                    action: "moved",
                    target: "Homepage Copy",
                    from: "To Do",
                    to: "In Progress",
                    time: "2 hours ago",
                  },
                  {
                    user: "Sarah Lee",
                    action: "added a comment to",
                    target: "Design System Audit",
                    time: "5 hours ago",
                  },
                  {
                    user: "Daniel Kim",
                    action: "attached file",
                    target: "specs_v2.pdf",
                    time: "Yesterday",
                  },
                  {
                    user: "System",
                    action: "updated budget",
                    target: "+$5,000 allocation",
                    time: "2 days ago",
                  },
                ].map((log, i) => (
                  <div key={i} className="relative pl-6">
                    <div className="absolute -left-[21px] top-1 h-4 w-4 rounded-full border-2 border-white dark:border-surface-dark bg-primary"></div>
                    <p className="text-sm text-text-primary dark:text-white">
                      <span className="font-semibold">{log.user}</span>{" "}
                      {log.action}{" "}
                      <span className="font-semibold text-primary">
                        {log.target}
                      </span>{" "}
                      {log.from && (
                        <span className="text-text-tertiary">
                          from {log.from} to {log.to}
                        </span>
                      )}
                    </p>
                    <p className="text-xs text-text-tertiary mt-1">
                      {log.time}
                    </p>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        )}

        {/* --- FILES VIEW --- */}
        {activeTab === "Files" && (
          <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {[
              "Project_Brief.pdf",
              "UI_Kit_v2.fig",
              "Q4_Budget.xlsx",
              "Assets.zip",
              "Meeting_Notes.docx",
            ].map((file, i) => (
              <Card
                key={i}
                className="p-4 flex flex-col items-center text-center gap-3 hover:shadow-md transition-shadow cursor-pointer group"
              >
                <div className="h-16 w-16 rounded-xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-text-tertiary group-hover:bg-primary/10 group-hover:text-primary transition-colors">
                  <FileText className="h-8 w-8" />
                </div>
                <div>
                  <p className="text-sm font-medium text-text-primary dark:text-white truncate w-32">
                    {file}
                  </p>
                  <p className="text-xs text-text-tertiary">
                    2.4 MB • Uploaded by Alex
                  </p>
                </div>
                <Button variant="ghost" size="sm" className="w-full mt-2">
                  Download
                </Button>
              </Card>
            ))}

            <button className="border-2 border-dashed border-border-light dark:border-border-dark rounded-xl flex flex-col items-center justify-center text-text-tertiary hover:border-primary hover:text-primary hover:bg-primary/5 transition-all h-48">
              <Plus className="h-8 w-8 mb-2" />
              <span className="text-sm font-medium">Upload File</span>
            </button>
          </div>
        )}

        {/* --- MEMBERS VIEW --- */}
        {activeTab === "Members" && (
          <div className="max-w-4xl mx-auto">
            <Card className="overflow-hidden bg-white dark:bg-surface-dark">
              <div className="p-6 border-b border-border-light dark:border-border-dark flex justify-between items-center">
                <h3 className="text-lg font-bold text-text-primary dark:text-white">
                  Project Team
                </h3>
                <Button variant="outline" className="gap-2">
                  <Users className="h-4 w-4" /> Manage Access
                </Button>
              </div>
              <div className="divide-y divide-border-light dark:divide-border-dark">
                {[
                  {
                    name: "Alex Johnson",
                    role: "Product Owner",
                    tasks: 12,
                    status: "Online",
                  },
                  {
                    name: "Sarah Lee",
                    role: "Lead Developer",
                    tasks: 8,
                    status: "In Meeting",
                  },
                  {
                    name: "Elena Rodriguez",
                    role: "Product Designer",
                    tasks: 5,
                    status: "Offline",
                  },
                ].map((member, i) => (
                  <div
                    key={i}
                    className="p-4 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <Avatar
                        src={`https://i.pravatar.cc/150?u=${member.name}`}
                        size="md"
                      />
                      <div>
                        <p className="font-bold text-text-primary dark:text-white">
                          {member.name}
                        </p>
                        <p className="text-xs text-text-secondary">
                          {member.role}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-8">
                      <div className="text-right">
                        <p className="text-sm font-bold text-text-primary dark:text-white">
                          {member.tasks}
                        </p>
                        <p className="text-xs text-text-tertiary">
                          Active Tasks
                        </p>
                      </div>
                      <Badge
                        variant={
                          member.status === "Online" ? "success" : "neutral"
                        }
                      >
                        {member.status}
                      </Badge>
                      <button className="text-text-tertiary hover:text-text-primary">
                        <MoreHorizontal className="h-5 w-5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        )}

        {/* --- OVERVIEW TAB --- */}
        {activeTab === "Overview" && (
          <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column (Main Info) */}
            <div className="lg:col-span-2 flex flex-col gap-6">
              {/* Project Summary Card (New Design) */}
              <Card className="p-5 bg-white dark:bg-surface-dark border-border-light dark:border-border-dark">
                <div className="flex items-center gap-2 mb-3">
                  <Badge
                    variant="success"
                    className="px-2.5 py-0.5 text-xs rounded-full"
                  >
                    Active
                  </Badge>
                </div>
                <p className="text-sm text-text-secondary dark:text-gray-300 leading-relaxed">
                  This project focuses on developing a new mobile application
                  for our fintech division, aimed at simplifying personal
                  finance management for millennials. The initial phase involves
                  market research, UI/UX design, and backend architecture
                  planning.
                </p>
                <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-y-4 gap-x-6 text-sm">
                  <div>
                    <p className="text-text-tertiary">Start Date</p>
                    <p className="font-medium text-text-primary dark:text-white">
                      Jan 15, 2024
                    </p>
                  </div>
                  <div>
                    <p className="text-text-tertiary">Due Date</p>
                    <p className="font-medium text-text-primary dark:text-white">
                      Dec 31, 2024
                    </p>
                  </div>
                  <div>
                    <p className="text-text-tertiary">Priority</p>
                    <p className="font-medium text-text-primary dark:text-white">
                      High
                    </p>
                  </div>
                  <div className="col-span-2 sm:col-span-1">
                    <p className="text-text-tertiary">Progress</p>
                    <div className="flex items-center gap-2 mt-1">
                      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5">
                        <div
                          className="bg-primary h-1.5 rounded-full"
                          style={{ width: "45%" }}
                        ></div>
                      </div>
                      <p className="font-medium text-text-primary dark:text-white">
                        45%
                      </p>
                    </div>
                  </div>
                </div>
              </Card>

              {/* Tasks Breakdown */}
              <Card className="p-5 bg-white dark:bg-surface-dark border-border-light dark:border-border-dark">
                <h3 className="text-lg font-semibold text-text-primary dark:text-white mb-4">
                  Task Breakdown
                </h3>
                <div className="flex w-full h-3 rounded-full overflow-hidden mb-4">
                  <div className="bg-success" style={{ width: "50%" }}></div>
                  <div className="bg-warning" style={{ width: "30%" }}></div>
                  <div className="bg-error" style={{ width: "20%" }}></div>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
                  <div>
                    <p className="text-text-tertiary">Total Tasks</p>
                    <p className="text-lg font-bold text-text-primary dark:text-white">
                      86
                    </p>
                  </div>
                  <div>
                    <p className="flex items-center gap-1.5 text-text-tertiary">
                      <span className="size-2 rounded-full bg-success"></span>
                      Completed
                    </p>
                    <p className="text-lg font-bold text-text-primary dark:text-white">
                      43
                    </p>
                  </div>
                  <div>
                    <p className="flex items-center gap-1.5 text-text-tertiary">
                      <span className="size-2 rounded-full bg-warning"></span>In
                      Progress
                    </p>
                    <p className="text-lg font-bold text-text-primary dark:text-white">
                      26
                    </p>
                  </div>
                  <div>
                    <p className="flex items-center gap-1.5 text-text-tertiary">
                      <span className="size-2 rounded-full bg-error"></span>
                      Blocked
                    </p>
                    <p className="text-lg font-bold text-text-primary dark:text-white">
                      17
                    </p>
                  </div>
                </div>
              </Card>

              {/* Timeline */}
              <Card className="p-5 bg-white dark:bg-surface-dark border-border-light dark:border-border-dark">
                <h3 className="text-lg font-semibold text-text-primary dark:text-white mb-4">
                  Timeline
                </h3>
                <div className="mt-4 bg-gray-100 dark:bg-gray-800/50 rounded-lg h-36 flex items-center justify-center border border-dashed border-border-light dark:border-border-dark">
                  <span className="text-text-tertiary text-sm flex items-center gap-2">
                    <Calendar className="h-5 w-5" /> Gantt Chart Visualization
                  </span>
                </div>
                <button className="mt-4 flex items-center text-primary text-sm font-bold hover:underline gap-1">
                  Open full Gantt <ArrowRight className="h-4 w-4" />
                </button>
              </Card>
            </div>

            {/* Right Column (Sidebar) */}
            <div className="lg:col-span-1 flex flex-col gap-6">
              {/* Team Members */}
              <Card className="p-5 bg-white dark:bg-surface-dark border-border-light dark:border-border-dark">
                <h3 className="text-lg font-semibold text-text-primary dark:text-white mb-4">
                  Team Members
                </h3>
                <div className="space-y-3">
                  {[
                    {
                      name: "Emily Carter",
                      role: "Project Manager",
                      img: "https://i.pravatar.cc/50?u=emily",
                    },
                    {
                      name: "Ben Adams",
                      role: "Lead Developer",
                      img: "https://i.pravatar.cc/50?u=ben",
                    },
                    {
                      name: "Chloe Davis",
                      role: "UX/UI Designer",
                      img: "https://i.pravatar.cc/50?u=chloe",
                    },
                  ].map((m, i) => (
                    <div key={i} className="flex items-center gap-3">
                      <Avatar src={m.img} size="sm" />
                      <div>
                        <p className="text-sm font-medium text-text-primary dark:text-white">
                          {m.name}
                        </p>
                        <p className="text-xs text-text-tertiary">{m.role}</p>
                      </div>
                    </div>
                  ))}
                </div>
                <button className="mt-4 flex w-full items-center justify-center gap-2 rounded-lg bg-gray-100 dark:bg-gray-800 h-10 text-sm font-bold text-text-primary dark:text-white hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors">
                  <Plus className="h-4 w-4" /> Add Member
                </button>
              </Card>

              {/* Quick Actions */}
              <Card className="p-5 bg-white dark:bg-surface-dark border-border-light dark:border-border-dark">
                <h3 className="text-lg font-semibold text-text-primary dark:text-white mb-4">
                  Quick Actions
                </h3>
                <div className="flex flex-col gap-3">
                  {["New Task", "Invite Collaborator", "Upload File"].map(
                    (action) => (
                      <button
                        key={action}
                        className="w-full text-left flex items-center h-10 px-3 rounded-lg bg-gray-100 dark:bg-gray-800 text-sm font-bold text-text-primary dark:text-white hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                      >
                        {action}
                      </button>
                    ),
                  )}
                </div>
              </Card>

              {/* Recent Activity */}
              <Card className="p-5 bg-white dark:bg-surface-dark border-border-light dark:border-border-dark">
                <h3 className="text-lg font-semibold text-text-primary dark:text-white mb-4">
                  Recent Activity
                </h3>
                <ul className="space-y-4">
                  {[
                    {
                      user: "Ben Adams",
                      action: "completed task",
                      target: "Setup Database",
                      time: "2h ago",
                      img: "https://i.pravatar.cc/30?u=ben",
                    },
                    {
                      user: "Chloe Davis",
                      action: "uploaded file",
                      target: "Userflow_v3.fig",
                      time: "5h ago",
                      img: "https://i.pravatar.cc/30?u=chloe",
                    },
                  ].map((act, i) => (
                    <li key={i} className="flex items-start gap-3">
                      <Avatar src={act.img} size="xs" className="mt-0.5" />
                      <div className="text-sm">
                        <p className="text-text-primary dark:text-white leading-snug">
                          <span className="font-semibold">{act.user}</span>{" "}
                          {act.action}{" "}
                          <span className="font-semibold text-primary">
                            {act.target}
                          </span>
                          .
                        </p>
                        <p className="text-xs text-text-tertiary mt-0.5">
                          {act.time}
                        </p>
                      </div>
                    </li>
                  ))}
                </ul>
              </Card>
            </div>
          </div>
        )}
      </div>

      {/* Task Drawer Integration */}
      <TaskDrawer
        task={selectedTask}
        isOpen={!!selectedTask}
        onClose={() => setSelectedTask(null)}
      />
    </div>
  );
}

// --- Sub Components for Board ---

function BoardColumn({ title, count, color, children }) {
  return (
    <div className="flex w-[320px] shrink-0 flex-col h-full">
      <div
        className={`relative border-b-2 ${color} pb-3 mb-4 flex justify-between items-center`}
      >
        <h2 className="text-lg font-semibold text-text-primary dark:text-white">
          {title}
        </h2>
        <span className="text-sm font-medium text-text-tertiary bg-gray-100 dark:bg-gray-800 px-2 py-0.5 rounded-full tabular-nums">
          {count}
        </span>
      </div>
      <div className="flex flex-col gap-4 overflow-y-auto pr-2 pb-4 custom-scrollbar h-full">
        {children}
      </div>
    </div>
  );
}

function TaskCard({ task, onClick }) {
  const priorityColors = {
    High: "text-error bg-error/10 border-error/20",
    Medium: "text-warning bg-warning/10 border-warning/20",
    Low: "text-success bg-success/10 border-success/20",
  };

  return (
    <div
      onClick={onClick}
      className="bg-white dark:bg-surface-dark p-4 rounded-xl border border-border-light dark:border-border-dark shadow-sm hover:shadow-md transition-all cursor-pointer group hover:border-primary/50"
    >
      <div className="flex justify-between items-start mb-3">
        <span
          className={`text-[10px] font-bold px-2 py-0.5 rounded border ${priorityColors[task.priority]}`}
        >
          {task.priority}
        </span>
        <button className="opacity-0 group-hover:opacity-100 text-text-tertiary hover:text-primary transition-opacity">
          <MoreHorizontal className="h-4 w-4" />
        </button>
      </div>

      <h4 className="text-sm font-semibold text-text-primary dark:text-white mb-2 leading-snug">
        {task.title}
      </h4>

      <div className="flex justify-between items-center pt-3 border-t border-border-light dark:border-border-dark border-dashed mt-3">
        <div className="flex items-center gap-3">
          {task.comments > 0 && (
            <div className="flex items-center gap-1 text-xs text-text-tertiary">
              <MessageSquare className="h-3 w-3" /> {task.comments}
            </div>
          )}
          {task.files > 0 && (
            <div className="flex items-center gap-1 text-xs text-text-tertiary">
              <Paperclip className="h-3 w-3" /> {task.files}
            </div>
          )}
        </div>
        <div className="flex -space-x-2">
          {task.assignees.map((id, i) => (
            <Avatar
              key={i}
              src={`https://i.pravatar.cc/30?u=${id}`}
              size="xs"
              className="border-2 border-white dark:border-surface-dark ring-0"
            />
          ))}
        </div>
      </div>
    </div>
  );
}
