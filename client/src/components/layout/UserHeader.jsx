import React, { useState, useRef, useEffect } from "react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import { Bell, Menu, LogOut, User, Settings, HelpCircle } from "lucide-react";
import { cn } from "../../utils/cn";
import { Avatar } from "../ui/Avatar";
import { Dropdown } from "../ui/Dropdown";
import { useAuth } from "../../context/AuthContext";

export function UserHeader({ onMobileMenuClick }) {
  const { logout, user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  // Sliding Tabs Logic
  const navRef = useRef(null);
  const [indicatorStyle, setIndicatorStyle] = useState({
    left: 0,
    width: 0,
    opacity: 0,
  });

  useEffect(() => {
    const updateIndicator = () => {
      if (!navRef.current) return;

      const activeLink = navRef.current.querySelector("a.active");
      if (activeLink) {
        const { offsetLeft, offsetWidth } = activeLink;
        setIndicatorStyle({
          left: offsetLeft,
          width: offsetWidth,
          opacity: 1,
        });
      } else {
        setIndicatorStyle((prev) => ({ ...prev, opacity: 0 }));
      }
    };

    updateIndicator();
    window.addEventListener("resize", updateIndicator);
    return () => window.removeEventListener("resize", updateIndicator);
  }, [location.pathname]);

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

        {/* Top-Level Module Tabs */}
        <nav
          className="hidden md:flex items-center h-full gap-8 ml-8 relative"
          ref={navRef}
        >
          <div
            className="absolute bottom-0 h-[2px] bg-primary rounded-t-full transition-all duration-300 ease-out z-10 will-change-transform"
            style={{
              left: indicatorStyle.left,
              width: indicatorStyle.width,
              opacity: indicatorStyle.opacity,
            }}
          />

          <div className="flex items-center gap-8">
            <NavTab name="Dashboard" path="/dashboard" />
            <NavTab name="Productivity" path="/productivity" />
            <NavTab name="Organization" path="/organization" />
            <NavTab name="Settings" path="/settings" />
          </div>
        </nav>
      </div>

      {/* Right: Actions & Profile */}
      <div className="flex items-center gap-3">
        <Dropdown
          trigger={
            <button className="h-10 w-10 flex items-center justify-center rounded-full text-text-tertiary hover:bg-white dark:hover:bg-surface-dark hover:shadow-sm transition-all relative group">
              <Bell className="h-5 w-5 group-hover:text-primary transition-colors" />
            </button>
          }
          align="right"
          width="w-80"
        >
          <div className="px-4 py-3 border-b border-border-light dark:border-border-dark bg-gray-50/50">
            <h4 className="font-semibold text-sm">Notifications</h4>
          </div>
          <div className="p-4 text-center text-text-tertiary text-sm">
            No new notifications
          </div>
        </Dropdown>

        {/* Help Icon */}
        <button
          onClick={() => navigate("/help-center")}
          className="h-10 w-10 flex items-center justify-center rounded-full text-text-tertiary hover:bg-white dark:hover:bg-surface-dark hover:shadow-sm transition-all"
          title="Help Center"
        >
          <HelpCircle className="h-5 w-5" />
        </button>

        <div className="border-l border-border-light dark:border-border-dark h-8 mx-1" />

        {/* Static Profile Display */}
        <div className="flex items-center gap-3 group">
          <div className="text-right hidden md:block">
            <p className="text-sm font-bold text-text-primary dark:text-white leading-none">
              {user?.firstName || user?.first_name || "User"}{" "}
              {user?.lastName || user?.last_name || ""}
            </p>
            <p className="text-[10px] text-text-tertiary mt-1 uppercase tracking-wider font-semibold">
              {user?.department || user?.role?.replace("_", " ") || "Member"}
            </p>
          </div>
          <Avatar
            src={user?.avatar || user?.avatar_url}
            fallback={user?.firstName?.[0] || user?.first_name?.[0] || "U"}
            size="md"
            className="ring-2 ring-white dark:ring-border-dark transition-all"
          />
        </div>

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

function NavTab({ name, path }) {
  return (
    <NavLink
      to={path}
      className={({ isActive }) =>
        cn(
          "relative h-full flex items-center text-sm font-medium transition-colors duration-200 cursor-pointer px-1",
          isActive
            ? "text-primary font-bold active"
            : "text-text-secondary hover:text-text-primary",
        )
      }
    >
      <span className="relative z-10">{name}</span>
    </NavLink>
  );
}
