import React from "react";
import { Link } from "react-router-dom";
import {
  Filter,
  Download,
  Plus,
  CheckSquare,
  Folder,
  Sparkles,
  CheckCircle,
} from "lucide-react";
import { Button } from "../../components/ui/Button";
import { Card } from "../../components/ui/Card";
import { Avatar } from "../../components/ui/Avatar";

export function MemberDashboard() {
  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-20">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-end gap-4 border-b border-border-light dark:border-border-dark pb-6">
        <div>
          <h1 className="text-3xl font-bold text-text-primary dark:text-white">
            Dashboard
          </h1>
          <p className="text-text-secondary dark:text-gray-400 mt-1">
            Good morning! Here's what's on your plate today.
          </p>
        </div>
        <div className="flex gap-3">
          <Button variant="secondary" size="icon">
            <Filter className="h-5 w-5" />
          </Button>
          <Button className="gap-2">
            <Plus className="h-4 w-4" /> New Task
          </Button>
        </div>
      </div>

      {/* Top Metrics - Simplified for Members */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: "Active Projects", value: "3", icon: Folder },
          { label: "My Tasks Due", value: "5", icon: CheckSquare },
          { label: "Completed This Week", value: "12", icon: CheckCircle },
          { label: "Upcoming Deadlines", value: "2", icon: CheckSquare },
        ].map((metric, i) => (
          <Card
            key={i}
            className="p-5 bg-white dark:bg-surface-dark hover:shadow-md transition-shadow"
          >
            <p className="text-sm text-text-secondary dark:text-gray-400 mb-2">
              {metric.label}
            </p>
            <div className="flex items-end justify-between">
              <p className="text-3xl font-bold text-text-primary dark:text-white">
                {metric.value}
              </p>
            </div>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column (Progress & Activity) */}
        <div className="lg:col-span-2 space-y-8">
          {/* Project Progress */}
          <Card className="p-6 bg-white dark:bg-surface-dark">
            <h2 className="text-lg font-bold text-text-primary dark:text-white mb-6">
              My Projects
            </h2>
            <div className="space-y-6">
              {[
                {
                  name: "Phoenix Initiative",
                  progress: 75,
                  color: "bg-primary",
                },
                {
                  name: "Quantum Leap AI",
                  progress: 40,
                  color: "bg-purple-500",
                },
              ].map((proj, i) => (
                <div key={i}>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="font-medium text-text-primary dark:text-white">
                      {proj.name}
                    </span>
                    <span className="text-text-tertiary">{proj.progress}%</span>
                  </div>
                  <div className="h-2 w-full bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                    <div
                      className={`h-full ${proj.color}`}
                      style={{ width: `${proj.progress}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* Recent Team Activity */}
          <Card className="p-6 bg-white dark:bg-surface-dark">
            <h2 className="text-lg font-bold text-text-primary dark:text-white mb-6">
              Team Activity
            </h2>
            <ul className="space-y-6">
              {[
                {
                  user: "Alex Johnson",
                  action: "completed the task 'Finalize Q3 Budget'",
                  time: "2m ago",
                  img: "https://i.pravatar.cc/150?u=alex",
                },
                {
                  user: "Maria Garcia",
                  action: "added a new project 'Q4 Marketing Campaign'",
                  time: "15m ago",
                  img: "https://i.pravatar.cc/150?u=maria",
                },
                {
                  user: "James Smith",
                  action: "commented on 'Mobile App V2'",
                  time: "45m ago",
                  img: "https://i.pravatar.cc/150?u=james",
                },
              ].map((act, i) => (
                <li key={i} className="flex gap-3 items-start">
                  <Avatar src={act.img} size="sm" />
                  <div>
                    <p className="text-sm text-text-secondary dark:text-gray-300">
                      <span className="font-semibold text-text-primary dark:text-white">
                        {act.user}
                      </span>{" "}
                      {act.action}.
                    </p>
                    <span className="text-xs text-text-tertiary">
                      {act.time}
                    </span>
                  </div>
                </li>
              ))}
            </ul>
            <Button variant="outline" className="w-full mt-6">
              Load More
            </Button>
          </Card>
        </div>

        {/* Right Column (Quick Actions) */}
        <div className="space-y-8">
          {/* AI Insights - Filtered */}
          <Card className="p-6 bg-white dark:bg-surface-dark border-primary/20 shadow-sm">
            <div className="flex items-center gap-2 mb-4 text-primary">
              <Sparkles className="h-5 w-5" />
              <h2 className="text-lg font-bold">AI Suggestions</h2>
            </div>
            <div className="space-y-4">
              <div className="p-3 bg-primary/5 rounded-lg text-sm">
                <p className="text-text-secondary mb-2">
                  Project 'Mobile App V2' is falling behind schedule. Check your
                  pending tasks.
                </p>
                <div className="flex gap-3">
                  <span className="text-primary font-medium cursor-pointer hover:underline">
                    View Tasks
                  </span>
                  <span className="text-text-tertiary cursor-pointer hover:text-text-secondary">
                    Dismiss
                  </span>
                </div>
              </div>
            </div>
          </Card>

          {/* Quick Actions - Simplified */}
          <Card className="p-6 bg-white dark:bg-surface-dark">
            <h2 className="text-lg font-bold text-text-primary dark:text-white mb-4">
              Quick Actions
            </h2>
            <div className="space-y-3">
              <button className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors border border-transparent hover:border-border-light dark:hover:border-border-dark">
                <CheckSquare className="h-5 w-5 text-text-tertiary" />
                <span className="font-medium text-sm text-text-primary dark:text-white">
                  New Task
                </span>
              </button>
              <Link
                to="/projects"
                className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors border border-transparent hover:border-border-light dark:hover:border-border-dark"
              >
                <Folder className="h-5 w-5 text-text-tertiary" />
                <span className="font-medium text-sm text-text-primary dark:text-white">
                  View Projects
                </span>
              </Link>
            </div>
          </Card>

          {/* Notifications - Simplified */}
          <Card className="p-6 bg-white dark:bg-surface-dark">
            <h2 className="text-lg font-bold text-text-primary dark:text-white mb-4">
              Notifications
            </h2>
            <ul className="space-y-4">
              <li className="flex gap-3 text-sm">
                <CheckCircle className="h-5 w-5 text-success shrink-0" />
                <p className="text-text-secondary dark:text-gray-300">
                  You were assigned 2 new tasks today.
                </p>
              </li>
            </ul>
          </Card>
        </div>
      </div>
    </div>
  );
}
