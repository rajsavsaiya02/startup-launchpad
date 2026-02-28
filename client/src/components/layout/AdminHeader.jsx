import React, { useState, useRef, useEffect } from "react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import { Menu, Settings, LogOut, User, Shield, CreditCard } from "lucide-react";
import { cn } from "../../utils/cn";
import { Avatar } from "../ui/Avatar";
import { Dropdown, DropdownItem, DropdownDivider } from "../ui/Dropdown";
import { useAuth } from "../../context/AuthContext";

export function AdminHeader({ onMobileMenuClick }) {
  const { logout } = useAuth();
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
    // Wait for DOM to settle and fonts to load
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
    // Add event listener for resize to handle responsiveness
    window.addEventListener("resize", updateIndicator);
    return () => window.removeEventListener("resize", updateIndicator);
  }, [location.pathname]);

  return (
    <header className="sticky top-0 z-40 w-full h-[64px] bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border-b border-border-light dark:border-border-dark flex items-center justify-between px-6 transition-all duration-300 shadow-sm">
      {/* Left: Mobile Toggle & Important Nav */}
      <div className="flex items-center gap-6 h-full">
        {/* Mobile Toggle */}
        <button
          onClick={onMobileMenuClick}
          className="lg:hidden p-2 -ml-2 text-text-tertiary hover:text-primary transition-colors"
        >
          <Menu className="h-6 w-6" />
        </button>

        {/* Top-Level Module Tabs (Custom Sliding Animation) */}
        <nav
          className="hidden md:flex items-center h-full gap-8 ml-8 relative"
          ref={navRef}
        >
          {/* Sliding Indicator */}
          <div
            className="absolute bottom-0 h-[2px] bg-primary rounded-t-full transition-all duration-300 ease-out z-10 will-change-transform"
            style={{
              left: indicatorStyle.left,
              width: indicatorStyle.width,
              opacity: indicatorStyle.opacity,
            }}
          />

          <div className="flex items-center gap-8">
            <NavTab name="Dashboard" path="/admin/dashboard" />
            <NavTab name="Management" path="/admin/management" />
            <NavTab name="Communication" path="/admin/communication" />
            <NavTab name="Settings" path="/admin/settings" />
          </div>
        </nav>
      </div>

      {/* Center: Spacer */}
      <div className="flex-1" />

      {/* Right: Actions & Profile */}
      <div className="flex items-center gap-3">
        {/* Profile Dropdown */}
        <div className="border-l border-border-light dark:border-border-dark h-8 mx-1" />

        <Dropdown
          trigger={
            <div className="flex items-center gap-3 cursor-pointer group">
              <div className="text-right hidden md:block">
                <p className="text-sm font-bold text-text-primary dark:text-white leading-none group-hover:text-primary transition-colors">
                  Admin User
                </p>
                <p className="text-[10px] text-text-tertiary mt-1 uppercase tracking-wider font-semibold">
                  Super Admin
                </p>
              </div>
              <Avatar
                size="md"
                fallback="AD"
                className="ring-2 ring-white dark:ring-border-dark group-hover:ring-primary/20 transition-all"
              />
            </div>
          }
          align="right"
          width="w-48"
        >
          <div className="p-1">
            <DropdownItem
              icon={User}
              onClick={() => navigate("/admin/profile")}
            >
              Admin Profile
            </DropdownItem>
            <DropdownItem
              icon={Shield}
              onClick={() => navigate("/admin/security")}
            >
              Login & Security
            </DropdownItem>
            {/* <DropdownItem icon={Settings} onClick={() => navigate('/admin/preferences')}>Preferences</DropdownItem> */}
          </div>
          <DropdownDivider />
          <div className="p-1">
            <DropdownItem variant="danger" icon={LogOut} onClick={logout}>
              Sign Out
            </DropdownItem>
          </div>
        </Dropdown>
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
            ? "text-primary font-bold active" // 'active' class used for ref query
            : "text-text-secondary hover:text-text-primary",
        )
      }
    >
      <span className="relative z-10">{name}</span>
    </NavLink>
  );
}
