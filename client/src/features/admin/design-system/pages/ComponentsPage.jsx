import React from "react";
import { Card } from "../../../../components/ui/Card";
import { Button } from "../../../../components/ui/Button";
import { Input } from "../../../../components/ui/Input";
import { Badge } from "../../../../components/ui/Badge";
import { Avatar } from "../../../../components/ui/Avatar";
import {
  Search,
  MoreHorizontal,
  Settings,
  Folder,
  LayoutDashboard,
  TrendingUp,
  TrendingDown,
  Info,
  CheckCircle,
  AlertTriangle,
  X,
} from "lucide-react";

export function ComponentsPage() {
  return (
    <div className="space-y-16 animate-in fade-in duration-500 pb-20">
      {/* 1. BUTTONS */}
      <section>
        <h2 className="text-xl font-bold text-text-primary dark:text-white mb-6">
          Buttons
        </h2>

        <Card className="p-8 bg-white dark:bg-gray-900/50">
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-8">
            {["Primary", "Secondary", "Ghost", "Destructive"].map((variant) => {
              const lower = variant.toLowerCase();
              const destructiveClasses =
                variant === "Destructive"
                  ? "bg-error/10 text-error hover:bg-error/20"
                  : "";

              return (
                <div key={variant} className="space-y-4">
                  <p className="text-sm font-semibold text-text-secondary">
                    {variant}
                  </p>

                  <div className="flex flex-col items-start gap-4">
                    <Button
                      size="sm"
                      variant={lower}
                      className={destructiveClasses}
                    >
                      Small
                    </Button>

                    <Button variant={lower} className={destructiveClasses}>
                      Default
                    </Button>

                    <Button
                      size="lg"
                      variant={lower}
                      className={destructiveClasses}
                    >
                      Large
                    </Button>

                    {/* Render icon buttons ONLY for Primary */}
                    {variant === "Primary" && (
                      <div className="flex flex-col gap-4 items-start">
                        <button className="bg-[#2F6CE5] text-white font-semibold text-sm rounded-md px-5 h-11 inline-flex items-center gap-2 hover:bg-primary-hover active:bg-[#1D4EB3] focus:outline-none focus:ring-2 focus:ring-[#2F6CE5] ring-glow transition-colors">
                          <span className="material-symbols-outlined text-xl!">
                            add_circle
                          </span>
                          <span>Icon Left</span>
                        </button>

                        <button className="bg-[#2F6CE5] text-white font-semibold text-sm rounded-md px-5 h-11 inline-flex items-center gap-2 hover:bg-primary-hover active:bg-[#1D4EB3] focus:outline-none focus:ring-2 focus:ring-[#2F6CE5] ring-glow transition-colors">
                          <span>Icon Right</span>
                          <span className="material-symbols-outlined text-xl!">
                            arrow_forward
                          </span>
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </Card>
      </section>

      <section>
        <h2 className="text-2xl font-bold leading-tight tracking-[-0.015em] text-slate-900 dark:text-white pb-6">
          Interaction States (Buttons)
        </h2>
        <div className="p-8 bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-6 text-center">
          <div className="space-y-3">
            <p className="font-semibold">Default</p>
            <button className="h-12 w-40 rounded-lg bg-primary text-white font-semibold">
              Button
            </button>
          </div>
          <div className="space-y-3">
            <p className="font-semibold">Hover</p>
            <button
              className="h-12 w-40 rounded-lg text-white font-semibold"
              style={{ backgroundColor: "#2457C9" }}
            >
              Button
            </button>
          </div>
          <div className="space-y-3">
            <p className="font-semibold">Pressed</p>
            <button className="h-12 w-40 rounded-lg bg-primary text-white font-semibold scale-95">
              Button
            </button>
          </div>
          <div className="space-y-3">
            <p className="font-semibold">Focus</p>
            <button className="h-12 w-40 rounded-lg bg-primary text-white font-semibold ring-2 ring-offset-2 ring-primary ring-offset-white dark:ring-offset-slate-900">
              Button
            </button>
          </div>
          <div className="space-y-3">
            <p className="font-semibold">Disabled</p>
            <button
              className="h-12 w-40 rounded-lg bg-primary/50 text-white/70 font-semibold cursor-not-allowed"
              disabled
            >
              Button
            </button>
          </div>
        </div>
      </section>

      {/* 2. INPUTS & DROPDOWNS */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-16">
        <div>
          <h2 className="text-xl font-bold mb-6">Input Fields</h2>
          <Card className="p-8 space-y-6 bg-white dark:bg-gray-900/50">
            <Input
              label="Default Input"
              placeholder="Placeholder text"
              helperText="This is a helper text."
            />
            <Input label="With Icon" icon={Search} placeholder="Search..." />
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-text-secondary">
                Textarea
              </label>
              <textarea
                className="w-full rounded-md border border-gray-300 p-3 text-sm h-[120px] focus:ring-2 focus:ring-primary/20 focus:border-primary dark:bg-surface-dark dark:border-border-dark"
                placeholder="Enter description..."
              />
            </div>
          </Card>
        </div>

        <div>
          <h2 className="text-xl font-bold mb-6">Select Dropdowns</h2>
          <Card className="p-8 space-y-6 bg-white dark:bg-gray-900/50">
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-text-secondary">
                Project Type
              </label>
              <select className="w-full h-11 rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:ring-2 focus:ring-primary/20 dark:bg-surface-dark dark:border-border-dark">
                <option>Select a project...</option>
                <option>SaaS App</option>
              </select>
            </div>

            {/* Open State Simulation */}
            <div className="space-y-32 relative">
              <label className="text-sm font-medium text-text-secondary">
                Open State
              </label>
              <div className="w-full h-11 rounded-md border border-primary ring-2 ring-primary/20 bg-white px-3 py-2 text-sm flex items-center justify-between dark:bg-surface-dark">
                <span>Mobile App</span>
                <span className="material-symbols-outlined text-sm">
                  expand_less
                </span>
              </div>
              <div className="absolute top-full left-0 w-full mt-1 mb-5 bg-white dark:bg-surface-dark rounded-lg shadow-lg border border-border-light dark:border-border-dark py-1 z-10">
                <div className="px-3 py-2 hover:bg-gray-50 dark:hover:bg-gray-800 text-sm">
                  SaaS Application
                </div>
                <div className="px-3 py-2 bg-gray-50 dark:bg-gray-800 text-sm border-l-4 border-primary">
                  Mobile App
                </div>
              </div>
            </div>
          </Card>
        </div>
      </section>

      {/* 3. TABS */}
      <section>
        <div>
          <h2 className="text-lg font-semibold text-text-primary dark:text-white mb-5">
            Tabs
          </h2>

          <div className="p-8 bg-white dark:bg-gray-900/50 rounded-lg space-y-8">
            {/* Tab groups */}
            {[
              {
                title: "Underline Style",
                spacing: "space-x-6",
                items: [
                  { label: "Dashboard", active: true },
                  { label: "Projects" },
                  { label: "Settings" },
                ],
              },
              {
                title: "With Icons",
                spacing: "space-x-6",
                items: [
                  { label: "Dashboard", icon: "dashboard", active: true },
                  { label: "Projects", icon: "folder" },
                  { label: "Settings", icon: "settings" },
                ],
              },
              {
                title: "Compact",
                spacing: "space-x-4",
                items: [
                  { label: "All", active: true },
                  { label: "Active" },
                  { label: "Completed" },
                ],
              },
            ].map((group) => (
              <div key={group.title}>
                <p className="text-sm font-semibold mb-3 text-gray-700 dark:text-gray-300">
                  {group.title}
                </p>

                <div className="border-b border-gray-200 dark:border-gray-700">
                  <nav
                    aria-label="Tabs"
                    className={`-mb-px flex ${group.spacing}`}
                  >
                    {group.items.map((tab) => (
                      <a
                        key={tab.label}
                        href="#"
                        aria-current={tab.active ? "page" : undefined}
                        className={`whitespace-nowrap pb-3.5 px-1 border-b-2 font-medium text-sm flex items-center gap-2
                    ${
                      tab.active
                        ? "text-text-primary border-[#2F6CE5]"
                        : "text-text-tertiary border-transparent hover:text-gray-700 hover:border-gray-300"
                    }`}
                      >
                        {tab.icon && (
                          <span className="material-symbols-outlined text-xl!">
                            {tab.icon}
                          </span>
                        )}
                        {tab.label}
                      </a>
                    ))}
                  </nav>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 4. CARDS (Base & Metric) */}
      <section>
        <h2 className="text-xl font-bold mb-6">Card Components</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="p-5">
            <h3 className="font-semibold mb-2">Base Card</h3>
            <p className="text-sm text-text-secondary">
              Basic container for general content.
            </p>
          </Card>
          <div className="rounded-lg border border-border-light dark:border-border-dark bg-surface-light dark:bg-surface-dark overflow-hidden">
            <div className="p-5 border-b border-border-light dark:border-border-dark font-semibold">
              Card with Header
            </div>
            <div className="p-5 text-sm text-text-secondary">
              Header provides title separation.
            </div>
          </div>
          <Card className="p-5 space-y-4">
            <div>
              <p className="text-sm text-text-tertiary mb-1">
                Monthly Recurring Revenue
              </p>
              <div className="flex items-center gap-3">
                <span className="text-3xl font-semibold">$12,450</span>
                <Badge
                  variant="success"
                  className="rounded-full px-2 py-0.5 text-xs flex items-center gap-1"
                >
                  <TrendingUp className="h-3 w-3" /> 12%
                </Badge>
              </div>
            </div>
            <div>
              <p className="text-sm text-text-tertiary mb-1">Churn Rate</p>
              <div className="flex items-center gap-3">
                <span className="text-3xl font-semibold">2.1%</span>
                <Badge
                  variant="error"
                  className="rounded-full px-2 py-0.5 text-xs flex items-center gap-1"
                >
                  <TrendingDown className="h-3 w-3" /> 0.2%
                </Badge>
              </div>
            </div>
          </Card>
        </div>
      </section>

      {/* 5. COMPLEX COMPONENTS (Kanban & Notifications) */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-16">
        {/* Kanban Task Card */}
        <div>
          <h2 className="text-xl font-bold mb-6">Kanban Task Card</h2>
          <Card className="p-8 bg-gray-50 dark:bg-gray-900/50 space-y-6">
            {/* Standard Card */}
            <div className="w-[280px] bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm">
              <h4 className="font-medium text-sm text-text-primary dark:text-white">
                Design new dashboard
              </h4>
              <p className="text-xs text-text-tertiary mt-1 line-clamp-2">
                Complete redesign for better UX.
              </p>
              <div className="flex items-center justify-between mt-4">
                <div className="flex -space-x-2">
                  <Avatar size="sm" src="https://i.pravatar.cc/150?u=1" />
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs bg-gray-100 dark:bg-gray-700 px-2 py-0.5 rounded text-text-secondary">
                    Oct 25
                  </span>
                  <span
                    className="w-2.5 h-2.5 rounded-full bg-red-500"
                    title="High Priority"
                  ></span>
                </div>
              </div>
            </div>

            {/* Active Card */}
            <div className="w-[280px] bg-white dark:bg-gray-800 p-4 rounded-lg border-2 border-primary shadow-md scale-[1.02]">
              <h4 className="font-medium text-sm text-text-primary dark:text-white">
                Implement API endpoints
              </h4>
              <p className="text-xs text-text-tertiary mt-1 line-clamp-2">
                Develop backend routes.
              </p>
              <div className="flex items-center justify-between mt-4">
                <div className="flex -space-x-2">
                  <Avatar size="sm" src="https://i.pravatar.cc/150?u=2" />
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs bg-gray-100 dark:bg-gray-700 px-2 py-0.5 rounded text-text-secondary">
                    Oct 28
                  </span>
                  <span
                    className="w-2.5 h-2.5 rounded-full bg-yellow-500"
                    title="Medium Priority"
                  ></span>
                </div>
              </div>
            </div>
          </Card>
        </div>

        {/* Notifications */}
        <div>
          <h2 className="text-xl font-bold mb-6">Notifications</h2>
          <Card className="p-8 bg-gray-50 dark:bg-gray-900/50 space-y-4">
            {[
              {
                type: "info",
                icon: Info,
                title: "Info Update",
                desc: "New version available.",
                color: "text-primary",
                border: "border-primary",
              },
              {
                type: "success",
                icon: CheckCircle,
                title: "Success!",
                desc: "Project created.",
                color: "text-success",
                border: "border-success",
              },
              {
                type: "warning",
                icon: AlertTriangle,
                title: "Warning",
                desc: "Trial expiring.",
                color: "text-warning",
                border: "border-warning",
              },
              {
                type: "error",
                icon: X,
                title: "Error",
                desc: "Upload failed.",
                color: "text-error",
                border: "border-error",
              },
            ].map((n) => (
              <div
                key={n.type}
                className={`flex items-start gap-3 p-4 rounded-lg bg-white dark:bg-gray-800 shadow-sm border-l-4 ${n.border}`}
              >
                <n.icon className={`${n.color} h-5 w-5 mt-0.5`} />
                <div className="flex-1">
                  <p className="text-sm font-bold text-text-primary dark:text-white">
                    {n.title}
                  </p>
                  <p className="text-xs text-text-secondary">{n.desc}</p>
                </div>
                <button className="text-text-tertiary hover:text-text-primary">
                  <X className="h-4 w-4" />
                </button>
              </div>
            ))}
          </Card>
        </div>
      </section>

      {/* 6. AVATARS & BADGES */}
      <section>
        <h2 className="text-xl font-bold mb-6">Avatars & Tags</h2>
        <Card className="p-8 space-y-6 bg-white dark:bg-gray-900/50">
          <div className="flex items-center gap-4">
            <Avatar size="sm" src="https://i.pravatar.cc/150?u=3" />
            <Avatar size="md" src="https://i.pravatar.cc/150?u=4" />
            <div className="relative">
              <Avatar size="lg" src="https://i.pravatar.cc/150?u=5" />
              <span className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-success border-2 border-white rounded-full"></span>
            </div>
            <Avatar size="xl" fallback="JD" />
          </div>

          <div className="flex flex-wrap gap-3">
            {["Success", "Warning", "Error", "Info"].map((s) => (
              <Badge key={s} variant={s.toLowerCase()}>
                {s}
              </Badge>
            ))}
          </div>

          <div className="flex flex-wrap gap-3">
            <span className="inline-flex items-center rounded-full bg-gray-100 px-2.5 py-1 text-xs font-medium text-gray-700">
              Design
            </span>
            <span className="inline-flex items-center rounded-full bg-gray-100 pl-2.5 pr-1 py-1 text-xs font-medium text-gray-700">
              Engineering{" "}
              <button className="ml-1 text-gray-500 hover:text-gray-700">
                <X className="h-3 w-3" />
              </button>
            </span>
          </div>
        </Card>
      </section>
    </div>
  );
}
