import React from "react";
import { Link } from "react-router-dom";
import {
  Filter,
  Download,
  Plus,
  TrendingUp,
  TrendingDown,
  Folder,
  CheckSquare,
  Users,
  DollarSign,
  Sparkles,
  Bell,
  AlertTriangle,
  CheckCircle,
} from "lucide-react";
import { Button } from "../../components/ui/Button";
import { Card } from "../../components/ui/Card";
import { Avatar } from "../../components/ui/Avatar";

export function FounderDashboard() {
  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-20">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-end gap-4 border-b border-border-light dark:border-border-dark pb-6">
        <div>
          <h1 className="text-3xl font-bold text-text-primary dark:text-white">
            Founder Dashboard
          </h1>
          <p className="text-text-secondary dark:text-gray-400 mt-1">
            Welcome back! Here's a quick overview of your startup's progress.
          </p>
        </div>
        <div className="flex gap-3">
          <Button variant="secondary" size="icon">
            <Filter className="h-5 w-5" />
          </Button>
          <Button variant="secondary" className="gap-2">
            <Download className="h-4 w-4" /> Export
          </Button>
          <Button className="gap-2">
            <Plus className="h-4 w-4" /> Create
          </Button>
        </div>
      </div>

      {/* Top Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: "Active Projects", value: "12", icon: Folder },
          { label: "Tasks Due Today", value: "5", icon: CheckSquare },
          { label: "Team Members", value: "8", icon: Users },
          {
            label: "Burn Rate",
            value: "$2,450",
            icon: DollarSign,
            trend: "+2.1%",
            trendColor: "text-error",
            trendIcon: TrendingUp,
          },
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
              {metric.trend && (
                <span
                  className={`flex items-center text-xs font-bold ${metric.trendColor}`}
                >
                  <metric.trendIcon className="h-3 w-3 mr-1" /> {metric.trend}
                </span>
              )}
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
              Project Progress
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
                {
                  name: "Marketplace Redesign",
                  progress: 90,
                  color: "bg-success",
                },
                { name: "Mobile App V2", progress: 25, color: "bg-warning" },
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

          {/* Recent Activity */}
          <Card className="p-6 bg-white dark:bg-surface-dark">
            <h2 className="text-lg font-bold text-text-primary dark:text-white mb-6">
              Recent Activity
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

        {/* Right Column (AI, Quick Actions, Notifications) */}
        <div className="space-y-8">
          {/* AI Insights */}
          <Card className="p-6 bg-white dark:bg-surface-dark border-primary/20 shadow-sm">
            <div className="flex items-center gap-2 mb-4 text-primary">
              <Sparkles className="h-5 w-5" />
              <h2 className="text-lg font-bold">AI Insights</h2>
            </div>
            <div className="space-y-4">
              <div className="p-3 bg-primary/5 rounded-lg text-sm">
                <p className="text-text-secondary mb-2">
                  Your burn rate is trending up. Consider reviewing recent
                  expenses.
                </p>
                <div className="flex gap-3">
                  <span className="text-primary font-medium cursor-pointer hover:underline">
                    Review
                  </span>
                  <span className="text-text-tertiary cursor-pointer hover:text-text-secondary">
                    Dismiss
                  </span>
                </div>
              </div>
              <div className="p-3 bg-primary/5 rounded-lg text-sm">
                <p className="text-text-secondary mb-2">
                  Project 'Mobile App V2' is falling behind schedule.
                </p>
                <div className="flex gap-3">
                  <span className="text-primary font-medium cursor-pointer hover:underline">
                    View
                  </span>
                  <span className="text-text-tertiary cursor-pointer hover:text-text-secondary">
                    Dismiss
                  </span>
                </div>
              </div>
            </div>
          </Card>

          {/* Quick Create */}
          <Card className="p-6 bg-white dark:bg-surface-dark">
            <h2 className="text-lg font-bold text-text-primary dark:text-white mb-4">
              Quick Create
            </h2>
            <div className="space-y-3">
              <Link
                to="/projects/new"
                className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors border border-transparent hover:border-border-light dark:hover:border-border-dark"
              >
                <Folder className="h-5 w-5 text-text-tertiary" />
                <span className="font-medium text-sm text-text-primary dark:text-white">
                  New Project
                </span>
              </Link>
              <button className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors border border-transparent hover:border-border-light dark:hover:border-border-dark">
                <CheckSquare className="h-5 w-5 text-text-tertiary" />
                <span className="font-medium text-sm text-text-primary dark:text-white">
                  New Task
                </span>
              </button>
              <Link
                to="/financials/expenses"
                className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors border border-transparent hover:border-border-light dark:hover:border-border-dark"
              >
                <DollarSign className="h-5 w-5 text-text-tertiary" />
                <span className="font-medium text-sm text-text-primary dark:text-white">
                  Log Expense
                </span>
              </Link>
            </div>
          </Card>

          {/* Notifications */}
          <Card className="p-6 bg-white dark:bg-surface-dark">
            <h2 className="text-lg font-bold text-text-primary dark:text-white mb-4">
              Notifications
            </h2>
            <ul className="space-y-4">
              <li className="flex gap-3 text-sm">
                <AlertTriangle className="h-5 w-5 text-warning shrink-0" />
                <p className="text-text-secondary dark:text-gray-300">
                  Your subscription renews in 3 days.
                </p>
              </li>
              <li className="flex gap-3 text-sm">
                <CheckCircle className="h-5 w-5 text-success shrink-0" />
                <p className="text-text-secondary dark:text-gray-300">
                  New feature 'AI Insights' is now live.
                </p>
              </li>
            </ul>
          </Card>
        </div>
      </div>
    </div>
  );
}
