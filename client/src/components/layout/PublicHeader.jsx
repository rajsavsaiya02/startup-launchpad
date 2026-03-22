import React, { useState, useEffect } from "react";
import { NavLink, Link, useLocation } from "react-router-dom";
import {
  Menu,
  X,
  Rocket,
  ChevronDown,
  LayoutDashboard,
  Wallet,
  Users,
  BrainCircuit,
  BookOpen,
  HelpCircle,
  FileText,
  Info,
  Mail,
  Shield,
} from "lucide-react";
import { Button } from "../ui/Button";
import { cn } from "../../utils/cn";
import { useAuth } from "../../context/AuthContext";
import { useSettings } from "../../context/SettingsContext.jsx";

// Mega Menu Configuration
const MENU_STRUCTURE = [
  {
    label: "Home",
    type: "link",
    path: "/",
  },
  {
    label: "Product",
    type: "mega",
    items: [
      {
        name: "Operations Hub",
        description: "Agile project management & task tracking",
        icon: LayoutDashboard,
        path: "/features",
        hash: "#operations",
        color: "text-blue-500 bg-blue-50 dark:bg-blue-900/20",
      },
      {
        name: "Financial Hub",
        description: "Burn rate, runway & expense tracking",
        icon: Wallet,
        path: "/features",
        hash: "#financials",
        color: "text-green-500 bg-green-50 dark:bg-green-900/20",
      },
      {
        name: "Talent Marketplace",
        description: "Find & hire vetted freelancers instantly",
        icon: Users,
        path: "/features",
        hash: "#talent",
        color: "text-purple-500 bg-purple-50 dark:bg-purple-900/20",
      },
      {
        name: "AI Co-Pilot",
        description: "Smart insights & anomaly detection",
        icon: BrainCircuit,
        path: "/features",
        hash: "#ai",
        color: "text-orange-500 bg-orange-50 dark:bg-orange-900/20",
      },
    ],
  },
  {
    label: "Resources",
    type: "dropdown",
    items: [
      { name: "Blog", icon: BookOpen, path: "/blog" },
      { name: "Help Center", icon: HelpCircle, path: "/help-center" },
      { name: "Case Studies", icon: FileText, path: "/case-studies" },
    ],
  },
  {
    label: "Community",
    type: "link",
    path: "/community",
  },
  /* 
  {
    label: 'Pricing',
    type: 'link',
    path: '/pricing'
  },
  */ // TODO: We will develop this later
  {
    label: "Company",
    type: "dropdown",
    items: [
      { name: "About Us", icon: Info, path: "/about" },
      { name: "Contact", icon: Mail, path: "/contact" },
      { name: "Legal", icon: Shield, path: "/legal" },
    ],
  },
];

// Helper to safely render icons from string names or direct components
const IconRenderer = ({ icon, className }) => {
  if (!icon) return null;
  // If it's already a component (from static config)
  if (typeof icon !== "string") {
    const Icon = icon;
    return <Icon className={className} />;
  }

  // Dynamic lookup (from DB string)
  // We need to map strings to Lucide icons. For safety, we import the specific ones we support or use a vibrant set.
  // Since we can't import * dynamically easily in Vite without bulk import, we'll implement a safe lookup.
  const IconMap = {
    LayoutDashboard,
    Wallet,
    Users,
    BrainCircuit,
    BookOpen,
    HelpCircle,
    FileText,
    Info,
    Mail,
    Shield,
    // Add variations for common names
    Layout: LayoutDashboard,
    Home: Rocket, // Fallback for Home
  };

  const ResolvedIcon = IconMap[icon] || Info; // Default to Info if not found
  return <ResolvedIcon className={className} />;
};

export function PublicHeader() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [hoveredMenu, setHoveredMenu] = useState(null);
  const [mobileExpanded, setMobileExpanded] = useState({});
  const { user } = useAuth();
  const { settings } = useSettings();
  const location = useLocation();

  // Determine which menu to use: Dynamic from DB or Static Default
  const activeMenu = (
    settings?.navigation_menu &&
    Array.isArray(settings.navigation_menu) &&
    settings.navigation_menu.length > 0
      ? settings.navigation_menu
      : MENU_STRUCTURE
  ).filter((item) => item.label !== "Pricing");

  // Scroll to hash if present (for Features page deep linking)
  useEffect(() => {
    if (location.hash) {
      const element = document.getElementById(location.hash.substring(1));
      if (element) {
        setTimeout(() => element.scrollIntoView({ behavior: "smooth" }), 100);
      }
    }
  }, [location]);

  const toggleMobileExpand = (label) => {
    setMobileExpanded((prev) => ({ ...prev, [label]: !prev[label] }));
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border-light bg-surface-light/90 backdrop-blur-md dark:border-border-dark dark:bg-background-dark/90 transition-all duration-300">
      <div className="mx-auto flex h-18 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Brand Logo */}
        <Link to="/" className="flex items-center gap-3 group relative z-50">
          <div className="text-primary transition-transform group-hover:scale-105">
            <Rocket className="h-7 w-7" />
          </div>
          <span className="text-xl font-bold tracking-tight leading-tight text-text-primary dark:text-white">
            {settings?.platform_name || "Startup LaunchPad"}
          </span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-1">
          {activeMenu.map((menuItem) => (
            <div
              key={menuItem.label}
              className="relative group px-3 py-4"
              onMouseEnter={() => setHoveredMenu(menuItem.label)}
              onMouseLeave={() => setHoveredMenu(null)}
            >
              {menuItem.type === "link" ? (
                <NavLink
                  to={menuItem.path || menuItem.url}
                  className={({ isActive }) =>
                    cn(
                      "text-sm font-medium transition-colors duration-200",
                      isActive
                        ? "text-primary font-semibold"
                        : "text-text-secondary dark:text-gray-300 hover:text-text-primary dark:hover:text-white",
                    )
                  }
                >
                  {menuItem.label}
                </NavLink>
              ) : (
                <button
                  className={cn(
                    "flex items-center gap-1 text-sm font-medium transition-colors duration-200 outline-none",
                    hoveredMenu === menuItem.label
                      ? "text-primary"
                      : "text-text-secondary dark:text-gray-300 hover:text-text-primary dark:hover:text-white",
                  )}
                >
                  {menuItem.label}
                  <ChevronDown
                    className={cn(
                      "h-4 w-4 transition-transform duration-200",
                      hoveredMenu === menuItem.label ? "rotate-180" : "",
                    )}
                  />
                </button>
              )}

              {/* Dropdown / Mega Menu Panel */}
              {menuItem.items && (
                <div
                  className={cn(
                    "absolute top-full left-1/2 -translate-x-1/2 pt-2 transition-all duration-200 ease-in-out opacity-0 translate-y-2 pointer-events-none z-40",
                    // Hover Logic
                    hoveredMenu === menuItem.label &&
                      "opacity-100 translate-y-0 pointer-events-auto",
                  )}
                >
                  {menuItem.type === "mega" ? (
                    <div className="w-[600px] p-6 bg-white dark:bg-[#1e1a29] rounded-xl shadow-2xl border border-border-light dark:border-border-dark grid grid-cols-2 gap-4">
                      {menuItem.items.map((subItem) => (
                        <Link
                          key={subItem.name}
                          to={`${subItem.path || subItem.url}${subItem.hash || ""}`}
                          className="group/item flex items-start gap-4 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
                        >
                          <div
                            className={cn(
                              "h-10 w-10 rounded-lg flex items-center justify-center shrink-0 transition-colors",
                              subItem.color,
                            )}
                          >
                            <IconRenderer
                              icon={subItem.icon}
                              className="h-5 w-5"
                            />
                          </div>
                          <div>
                            <h4 className="text-sm font-bold text-text-primary dark:text-white group-hover/item:text-primary transition-colors">
                              {subItem.name}
                            </h4>
                            <p className="text-xs text-text-secondary dark:text-gray-400 mt-1 line-clamp-2">
                              {subItem.description}
                            </p>
                          </div>
                        </Link>
                      ))}
                    </div>
                  ) : (
                    <div className="w-56 p-2 bg-white dark:bg-[#1e1a29] rounded-xl shadow-xl border border-border-light dark:border-border-dark flex flex-col gap-1">
                      {menuItem.items.map((subItem) => (
                        <Link
                          key={subItem.name}
                          to={subItem.path || subItem.url}
                          className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-text-secondary dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-primary dark:hover:text-white transition-colors"
                        >
                          <IconRenderer
                            icon={subItem.icon}
                            className="h-4 w-4"
                          />
                          {subItem.name}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </nav>

        {/* Desktop Actions */}
        <div className="hidden md:flex items-center gap-3">
          {user ? (
            <Link
              to={
                user.role === "admin" || user.role === "super_admin"
                  ? "/admin/dashboard"
                  : "/dashboard"
              }
            >
              <Button>
                {user.role === "admin" || user.role === "super_admin"
                  ? "Admin Dashboard"
                  : "Dashboard"}
              </Button>
            </Link>
          ) : (
            <>
              <Link to="/auth/login">
                <Button
                  variant="ghost"
                  className="font-semibold text-text-secondary dark:text-gray-300 hover:text-text-primary"
                >
                  Log In
                </Button>
              </Link>
              <Link to="/auth/signup">
                <Button>Sign Up</Button>
              </Link>
            </>
          )}
        </div>

        {/* Mobile Menu Toggle */}
        <button
          className="md:hidden text-text-secondary dark:text-gray-300 relative z-50 p-2"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        >
          {isMobileMenuOpen ? (
            <X className="h-6 w-6" />
          ) : (
            <Menu className="h-6 w-6" />
          )}
        </button>
      </div>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-40 bg-surface-light dark:bg-background-dark pt-20 px-4 pb-8 overflow-y-auto animate-in slide-in-from-right-10 duration-200 md:hidden">
          <nav className="flex flex-col gap-1">
            {activeMenu.map((menuItem) => (
              <div
                key={menuItem.label}
                className="border-b border-border-light dark:border-border-dark/50 last:border-0"
              >
                {menuItem.type === "link" ? (
                  <NavLink
                    to={menuItem.path || menuItem.url}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={({ isActive }) =>
                      cn(
                        "block w-full py-4 text-lg font-medium transition-colors",
                        isActive
                          ? "text-primary"
                          : "text-text-primary dark:text-white",
                      )
                    }
                  >
                    {menuItem.label}
                  </NavLink>
                ) : (
                  <div>
                    <button
                      onClick={() => toggleMobileExpand(menuItem.label)}
                      className="flex w-full items-center justify-between py-4 text-lg font-medium text-text-primary dark:text-white"
                    >
                      {menuItem.label}
                      <ChevronDown
                        className={cn(
                          "h-5 w-5 transition-transform",
                          mobileExpanded[menuItem.label] ? "rotate-180" : "",
                        )}
                      />
                    </button>

                    {mobileExpanded[menuItem.label] && (
                      <div className="pb-4 pl-2 space-y-2">
                        {menuItem.items.map((subItem) => (
                          <Link
                            key={subItem.name}
                            to={`${subItem.path || subItem.url}${subItem.hash || ""}`}
                            onClick={() => setIsMobileMenuOpen(false)}
                            className="flex items-center gap-3 p-2 rounded-lg text-text-secondary dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
                          >
                            {menuItem.type === "mega" && (
                              <div
                                className={cn(
                                  "h-8 w-8 rounded-md flex items-center justify-center shrink-0",
                                  subItem.color?.split(" ")[1] || "bg-gray-100",
                                )}
                              >
                                <IconRenderer
                                  icon={subItem.icon}
                                  className="h-4 w-4"
                                />
                              </div>
                            )}
                            <span className="font-medium">{subItem.name}</span>
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </nav>

          <div className="mt-8 space-y-3">
            {user ? (
              <Link
                to={
                  user.role === "admin" || user.role === "super_admin"
                    ? "/admin/dashboard"
                    : "/dashboard"
                }
              >
                <Button size="lg" className="w-full">
                  Dashboard
                </Button>
              </Link>
            ) : (
              <>
                <Link to="/auth/login">
                  <Button size="lg" variant="outline" className="w-full">
                    Log In
                  </Button>
                </Link>
                <Link to="/auth/signup">
                  <Button size="lg" className="w-full">
                    Get Started
                  </Button>
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
