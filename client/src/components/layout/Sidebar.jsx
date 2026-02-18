import React from "react";
import { Link, NavLink } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import {
  LayoutDashboard,
  FolderOpen,
  CheckSquare,
  Users,
  Wallet,
  Briefcase,
  Settings,
  HelpCircle,
  LogOut,
} from "lucide-react";
import { cn } from "../../utils/cn";
import { Avatar } from "../ui/Avatar";

const NAV_ITEMS = [
  {
    label: "MENU",
    items: [
      { name: "Dashboard", icon: LayoutDashboard, path: "/dashboard" },
      { name: "Projects", icon: FolderOpen, path: "/projects" },
      { name: "Tasks", icon: CheckSquare, path: "/tasks" },
      { name: "Team", icon: Users, path: "/team" },
    ],
  },
  {
    label: "GROWTH",
    items: [
      { name: "Financial Hub", icon: Wallet, path: "/financials" },
      { name: "Find Talent", icon: Users, path: "/talent" }, // Freelancers
      { name: "Find Gigs", icon: Briefcase, path: "/gigs" }, // Jobs
    ],
  },
];

export function Sidebar({ className }) {
  const { user, logout } = useAuth();

  const isFounderOrAdmin =
    user?.role === "founder" ||
    user?.role === "admin" ||
    user?.role === "super_admin";
  const isFreelancer = user?.role === "freelancer";
  const isStudent = user?.role === "student";

  // Filter NAV_ITEMS based on role
  const filteredNavItems = NAV_ITEMS.map((section) => {
    // If founder/admin, return everything
    if (isFounderOrAdmin) return section;

    // Filter items based on specific roles
    const filteredItems = section.items.filter((item) => {
      // Common restrictions for all non-founder/admins
      const alwaysRestricted = ["/financials", "/settings"];
      if (alwaysRestricted.includes(item.path)) return false;

      // Logic per role
      if (isFreelancer) {
        // Freelancers need Gigs, maybe Projects/Tasks if assigned.
        // Hide "Find Talent" (they ARE the talent)
        if (item.path === "/talent") return false;
        if (item.path === "/team") return false; // Likely don't need team view
        return true;
      }

      if (isStudent) {
        // Students might only need specific learning views (future)
        // For now, let's give them basic access but hide Talent/Gigs creation?
        // Actually, students might want to Find Gigs (internships).
        if (item.path === "/financials") return false;
        if (item.path === "/talent") return false;
        return true;
      }

      // Normal User (Employee)
      // Hide Financials & Talent
      const normalRestricted = ["/financials", "/talent"];
      if (normalRestricted.includes(item.path)) return false;

      return true;
    });

    // Only return section if it has items
    return filteredItems.length > 0
      ? { ...section, items: filteredItems }
      : null;
  }).filter(Boolean); // Remove null sections

  const handleLogout = async () => {
    await logout();
  };

  return (
    <aside
      className={cn(
        "flex h-screen w-[260px] flex-col border-r border-border-light bg-surface-light transition-all duration-300",
        "fixed left-0 top-0 z-40 hidden lg:flex", // Desktop behavior
        className,
      )}
    >
      {/* Logo Section */}
      <div className="flex items-center gap-3 px-6 py-6">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary text-white">
          <span className="material-symbols-outlined text-2xl">
            rocket_launch
          </span>
        </div>
        <div className="flex flex-col">
          <h1 className="text-base font-bold text-text-primary">LaunchPad</h1>
          <span className="text-xs text-text-tertiary">Growth Plan</span>
        </div>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 overflow-y-auto px-4 py-4 space-y-6">
        {filteredNavItems.map((section) => (
          <div key={section.label}>
            <h3 className="mb-2 px-4 text-xs font-bold uppercase tracking-wider text-text-tertiary">
              {section.label}
            </h3>
            <ul className="space-y-1">
              {section.items.map((item) => (
                <li key={item.name}>
                  <NavLink
                    to={item.path}
                    className={({ isActive }) =>
                      cn(
                        "flex items-center gap-3 rounded-lg px-4 py-2.5 text-sm font-medium transition-colors",
                        isActive
                          ? "bg-primary/10 text-primary"
                          : "text-text-secondary hover:bg-background-light hover:text-text-primary",
                      )
                    }
                  >
                    <item.icon className="h-5 w-5" />
                    {item.name}
                  </NavLink>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </nav>

      {/* Bottom Actions */}
      <div className="border-t border-border-light p-4">
        <div className="flex flex-col gap-1 mb-4">
          <NavLink
            to="/settings"
            className="flex items-center gap-3 rounded-lg px-4 py-2 text-sm font-medium text-text-secondary hover:bg-background-light"
          >
            <Settings className="h-5 w-5" /> Settings
          </NavLink>
          <NavLink
            to="/help-center"
            className="flex items-center gap-3 rounded-lg px-4 py-2 text-sm font-medium text-text-secondary hover:bg-background-light"
          >
            <HelpCircle className="h-5 w-5" /> Help
          </NavLink>
        </div>

        {/* User Profile Link Block */}
        <div className="flex items-center justify-between gap-2 rounded-xl border border-border-light p-3 bg-white dark:bg-background-dark hover:border-primary/30 transition-colors group">
          <Link
            to="/profile"
            className="flex items-center gap-3 flex-1 overflow-hidden cursor-pointer"
          >
            <Avatar
              src="https://i.pravatar.cc/150?u=a042581f4e29026704d"
              fallback="JD"
            />
            <div className="flex flex-col overflow-hidden">
              <p className="truncate text-sm font-medium text-text-primary group-hover:text-primary transition-colors">
                John Doe
              </p>
              <p className="truncate text-xs text-text-tertiary">
                john@acme.com
              </p>
            </div>
          </Link>
          <button
            onClick={handleLogout}
            className="text-text-tertiary hover:text-error hover:bg-error/10 p-1.5 rounded-md transition-colors"
            title="Sign Out"
          >
            <LogOut className="h-5 w-5" />
          </button>
        </div>
      </div>
    </aside>
  );
}
