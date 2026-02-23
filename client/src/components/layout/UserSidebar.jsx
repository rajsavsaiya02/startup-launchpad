import React from "react";
import { useSettings } from "../../context/SettingsContext.jsx";
import { useAuth } from "../../context/AuthContext";
import { useLocation, NavLink } from "react-router-dom";
import { cn } from "../../utils/cn";
import {
  ChevronRight,
  PanelLeftClose,
  LayoutDashboard,
  FolderOpen,
  CheckSquare,
  Users,
  Briefcase,
  Settings,
  User,
  Rocket,
  X,
  Shield,
  Bell,
  CreditCard,
  Palette,
  Globe,
} from "lucide-react";

// --- Configuration: User Dual Navigation ---
const USER_MODULE_NAV_CONFIG = {
  dashboard: [
    { name: "Overview", path: "/dashboard", icon: LayoutDashboard },
    { name: "Find Gigs", path: "/dashboard/gigs", icon: Briefcase },
  ],
  productivity: [
    { name: "Projects", path: "/productivity/projects", icon: FolderOpen },
    { name: "Tasks", path: "/productivity/tasks", icon: CheckSquare },
  ],
  organization: [
    { name: "Projects", path: "/organization/projects", icon: FolderOpen },
    { name: "Tasks", path: "/organization/tasks", icon: CheckSquare },
    { name: "Gigs", path: "/organization/gigs", icon: Briefcase },
    { name: "Team", path: "/organization/team", icon: Users },
  ],
  settings: [
    { name: "My Profile", path: "/settings/profile", icon: User },
    { name: "Public Profile", path: "/settings/general", icon: Globe },
    { name: "Account Security", path: "/settings/security", icon: Shield },
    { name: "Notifications", path: "/settings/notifications", icon: Bell },
    // { name: "Billing & Plans", path: "/settings/billing", icon: CreditCard }, // TODO: We will develop this later
    {
      name: "Workspace Customization",
      path: "/settings/workspace",
      icon: Palette,
    },
  ],
};

// Helper: Determine Active Module from Path
const getActiveModule = (pathname) => {
  if (pathname.includes("/settings")) return "settings"; // Check settings first to catch /settings/workspace
  if (pathname.includes("/productivity")) return "productivity";
  if (pathname.includes("/organization")) return "organization";
  return "dashboard"; // Default
};

export function UserSidebar({
  isCollapsed,
  onToggleCollapse,
  isMobileOpen,
  onMobileClose,
}) {
  const location = useLocation();
  const { settings } = useSettings();
  const { user } = useAuth();
  const activeModule = getActiveModule(location.pathname);

  const navItems =
    USER_MODULE_NAV_CONFIG[activeModule]?.filter((item) => {
      // Role-based filtering for sidebar items
      if (item.name === "Find Gigs" && user?.role === "founder") return false; // Founders might not need this here
      if (item.name === "Workspace Customization" && user?.role !== "founder")
        return false;
      // If we want to hide "Tasks" for someone, we do it here
      return true;
    }) || [];

  return (
    <>
      {/* Mobile Backdrop */}
      <div
        className={cn(
          "fixed inset-0 z-40 bg-gray-900/50 backdrop-blur-sm transition-opacity duration-300 lg:hidden",
          isMobileOpen ? "opacity-100" : "opacity-0 pointer-events-none",
        )}
        onClick={onMobileClose}
      />

      {/* Sidebar Content */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex flex-col bg-surface-light dark:bg-surface-dark border-r border-border-light dark:border-border-dark transition-all duration-300 ease-[cubic-bezier(0.2,0,0,1)] will-change-[width,transform] shadow-xl lg:shadow-none overflow-hidden",
          isMobileOpen
            ? "translate-x-0 w-[280px]"
            : "-translate-x-full lg:translate-x-0",
          !isMobileOpen && (isCollapsed ? "lg:w-[80px]" : "lg:w-[280px]"),
        )}
      >
        {/* Header / Logo */}
        <div
          className={cn(
            "h-[64px] flex items-center border-b border-border-light dark:border-border-dark shrink-0 transition-[padding] duration-300",
            isCollapsed ? "justify-center px-0" : "px-6 justify-between",
          )}
        >
          <div
            className={cn(
              "flex items-center min-w-0 overflow-hidden transition-all duration-300",
              isCollapsed ? "gap-0" : "gap-3",
            )}
          >
            <div className="text-primary shrink-0 flex items-center justify-center transition-transform duration-300">
              <Rocket className="h-8 w-8" />
            </div>
            <div
              className={cn(
                "flex flex-col transition-all duration-300 origin-left whitespace-nowrap",
                isCollapsed
                  ? "w-0 opacity-0 scale-90 translate-x-[-10px]"
                  : "w-auto opacity-100 scale-100 translate-x-0",
              )}
            >
              <span className="font-bold text-xl text-text-primary dark:text-white leading-tight tracking-tight">
                {settings?.platform_name || "LaunchPad"}
              </span>
              <span className="text-[10px] uppercase font-semibold text-primary tracking-[0.15em] mt-0.5">
                {activeModule}
              </span>
            </div>
          </div>
          <button
            onClick={onMobileClose}
            className="lg:hidden text-text-tertiary hover:text-text-primary p-1"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Scrollable Navigation Area */}
        <div className="flex-1 overflow-y-auto overflow-x-hidden py-4 flex flex-col gap-4 custom-scrollbar">
          <NavSection title={null} items={navItems} isCollapsed={isCollapsed} />
        </div>

        {/* Footer / Toggle Area */}
        <div className="p-3 border-t border-border-light dark:border-border-dark shrink-0">
          <button
            onClick={onToggleCollapse}
            className={cn(
              "hidden lg:flex items-center justify-center h-9 rounded-md text-xs font-medium transition-colors duration-200 border border-transparent whitespace-nowrap overflow-hidden",
              isCollapsed
                ? "w-full hover:bg-gray-100 dark:hover:bg-gray-800 text-text-tertiary hover:text-text-primary"
                : "w-full text-text-tertiary hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-text-primary",
            )}
          >
            {isCollapsed ? (
              <ChevronRight className="h-4 w-4" />
            ) : (
              <span className="flex items-center gap-2 animate-in fade-in slide-in-from-right-2 duration-300">
                <PanelLeftClose className="h-4 w-4" />
                <span>Collapse Sidebar</span>
              </span>
            )}
          </button>
        </div>
      </aside>
    </>
  );
}

function NavSection({ title, items, isCollapsed }) {
  return (
    <div className="px-3">
      <div
        className={cn(
          "mb-2 text-xs font-bold text-text-tertiary uppercase tracking-wider transition-all duration-300 overflow-hidden whitespace-nowrap",
          isCollapsed ? "h-0 opacity-0 px-0" : "h-auto opacity-100 px-3",
        )}
      >
        {title}
      </div>

      <nav className="space-y-1.5">
        {items.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            end
            className={({ isActive }) =>
              cn(
                "flex items-center rounded-lg text-sm transition-all duration-200 group relative overflow-hidden whitespace-nowrap",
                isCollapsed
                  ? "justify-center px-2 py-2 gap-0"
                  : "px-3 py-2.5 gap-3",
                isActive
                  ? "bg-primary text-white font-semibold"
                  : "font-medium text-text-secondary hover:bg-gray-100 dark:hover:bg-gray-800 dark:text-gray-400 hover:text-text-primary",
              )
            }
          >
            <item.icon
              className={cn(
                "shrink-0 transition-all duration-300",
                "h-5 w-5",
                !isCollapsed && "mr-0",
              )}
            />

            <span
              className={cn(
                "transition-all duration-300 origin-left bg-transparent",
                isCollapsed
                  ? "w-0 opacity-0 translate-x-4"
                  : "w-auto opacity-100 translate-x-0",
              )}
            >
              {item.name}
            </span>

            {isCollapsed && (
              <div className="absolute left-[calc(100%+10px)] top-1/2 -translate-y-1/2 hidden group-hover:block z-50">
                <div className="bg-gray-900 text-white text-xs font-medium px-2 py-1.5 rounded-md shadow-lg whitespace-nowrap relative animate-in fade-in zoom-in-95 duration-200">
                  {item.name}
                  <div className="absolute top-1/2 -left-1 -translate-y-1/2 w-0 h-0 border-y-4px border-y-transparent border-r-4px border-r-gray-900"></div>
                </div>
              </div>
            )}
          </NavLink>
        ))}
      </nav>
    </div>
  );
}
