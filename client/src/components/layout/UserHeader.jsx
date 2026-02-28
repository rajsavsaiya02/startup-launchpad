import { NavLink, useLocation, useNavigate } from "react-router-dom";
import {
  Menu,
  LogOut,
  User,
  Settings,
  HelpCircle,
  Building,
} from "lucide-react";
import { cn } from "../../utils/cn";
import { Avatar } from "../ui/Avatar";
import { Dropdown } from "../ui/Dropdown";
import { useAuth } from "../../context/AuthContext";

export function UserHeader({ onMobileMenuClick }) {
  const { logout, user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  // Determine active context for toggle
  const isOrg = location.pathname.startsWith("/org");

  return (
    <header className="sticky top-0 z-40 w-full h-[64px] bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border-b border-border-light dark:border-border-dark flex items-center justify-between px-6 transition-all duration-300 shadow-sm">
      {/* Left: Mobile Toggle & Important Nav */}
      <div className="flex items-center gap-6 h-full">
        <button
          onClick={onMobileMenuClick}
          className="lg:hidden p-2 -ml-2 text-text-tertiary hover:text-primary transition-colors"
        >
          <Menu className="h-6 w-6" />
        </button>

        {/* Modern Context Toggle Switch (Compact Icons + Text) */}
        <div className="hidden md:flex items-center bg-gray-100/80 dark:bg-gray-800/80 p-1 rounded-full relative shadow-inner border border-border-light dark:border-border-dark w-[130px]">
          {/* Animated Background Pill */}
          <div
            className={cn(
              "absolute top-1 bottom-1 left-1 w-[61px] rounded-full transition-all duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)] shadow-sm",
              isOrg
                ? "bg-emerald-500 translate-x-[61px]"
                : "bg-primary translate-x-0",
            )}
          />

          <NavLink
            to="/dashboard"
            className={cn(
              "relative z-10 flex items-center justify-center gap-1.5 w-[61px] h-7 transition-all duration-300 rounded-full",
              !isOrg
                ? "text-white"
                : "text-text-secondary hover:text-text-primary",
            )}
            title="Individual Workspace"
          >
            <User className="h-3.5 w-3.5" />
            <span className="text-xs font-bold leading-none mt-0.5">Self</span>
          </NavLink>

          <NavLink
            to="/org/dashboard"
            className={cn(
              "relative z-10 flex items-center justify-center gap-1.5 w-[61px] h-7 transition-all duration-300 rounded-full",
              isOrg
                ? "text-white"
                : "text-text-secondary hover:text-text-primary",
            )}
            title="Organization Workspace"
          >
            <Building className="h-3 w-3" />
            <span className="text-xs font-bold leading-none mt-0.5">Org</span>
          </NavLink>
        </div>
      </div>

      {/* Right: Actions & Profile */}
      <div className="flex items-center gap-3">
        {/* Help Icon */}
        <button
          onClick={() => navigate("/help-center")}
          className="h-10 w-10 flex items-center justify-center rounded-full text-text-tertiary hover:bg-white dark:hover:bg-surface-dark hover:shadow-sm transition-all"
          title="Help Center"
        >
          <HelpCircle className="h-5 w-5" />
        </button>

        <div className="border-l border-border-light dark:border-border-dark h-8 mx-1" />

        {/* Profile Display / Button */}
        <button
          onClick={() => navigate("/settings/profile")}
          className="flex items-center gap-4 group px-2 py-1.5 -mr-1 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors text-left min-w-0"
        >
          <div className="text-right hidden md:flex min-w-0 max-w-[180px] flex-col justify-center">
            <p
              className="text-sm font-bold text-text-primary dark:text-white leading-tight group-hover:text-primary transition-colors truncate"
              title={`${user?.firstName || user?.first_name || "User"} ${user?.lastName || user?.last_name || ""}`}
            >
              {user?.firstName || user?.first_name || "User"}{" "}
              {user?.lastName || user?.last_name || ""}
            </p>
            <p className="text-[10px] text-text-tertiary mt-0.5 uppercase tracking-widest font-bold truncate opacity-80">
              {user?.department || user?.role?.replace("_", " ") || "Member"}
            </p>
          </div>
          <Avatar
            src={user?.avatar || user?.avatar_url}
            fallback={user?.firstName?.[0] || user?.first_name?.[0] || "U"}
            size="md"
            className="ring-2 ring-white dark:ring-border-dark transition-all group-hover:ring-primary/30"
          />
        </button>

        {/* Logout Button */}
        <button
          onClick={logout}
          className="h-9 w-9 flex items-center justify-center rounded-lg text-text-tertiary hover:text-error hover:bg-error/10 transition-colors ml-1"
          title="Sign Out"
        >
          <LogOut className="h-5 w-5" />
        </button>
      </div>
    </header>
  );
}
