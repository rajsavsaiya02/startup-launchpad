import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion as Motion, AnimatePresence } from "framer-motion";
import {
  Search,
  Users,
  Building2,
  MapPin,
  ChevronLeft,
  ChevronRight,
  Loader2,
  Sparkles,
  ArrowRight,
  Filter,
} from "lucide-react";
import { apiClient, SERVER_URL } from "../../lib/axios";
import { Button } from "../../components/ui/Button";
import { cn } from "../../utils/cn";

// ─── Animation Config ───
const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.05 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 30, scale: 0.95 },
  show: { 
    opacity: 1, 
    y: 0, 
    scale: 1,
    transition: { 
      type: "spring",
      stiffness: 100,
      damping: 15
    } 
  },
};

export function CommunityDirectoryPage() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [type, setType] = useState("all"); // 'all', 'user', 'organization'
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ totalPages: 1, total: 0 });

  useEffect(() => {
    setPage(1);
  }, [search, type]);

  useEffect(() => {
    const fetchDirectory = async () => {
      setLoading(true);
      try {
        const typeParam = type === "all" ? "" : type;
        const res = await apiClient.get("/community/directory", {
          params: { search, type: typeParam, page, limit: 12 },
        });
        setData(res.data.data);
        setPagination(res.data.pagination);
      } catch (err) {
        console.error("Error fetching community directory:", err);
      } finally {
        setLoading(false);
      }
    };

    const debounceTimer = setTimeout(fetchDirectory, 300);
    return () => clearTimeout(debounceTimer);
  }, [search, type, page]);

  return (
    <div className="min-h-screen bg-[#f8fafc] dark:bg-[#0a0f1c] pb-24 font-sans selection:bg-primary/20">
      {/* ── Bright Hero Section ── */}
      <div className="relative pt-20 pb-24 lg:pt-28 lg:pb-36 overflow-hidden">
        {/* Animated Background Elements */}
        <div className="absolute inset-0 bg-white dark:bg-transparent -z-10" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full -z-10 opacity-30 dark:opacity-20 pointer-events-none">
          <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[60%] bg-blue-400 rounded-full blur-[120px] animate-pulse" />
          <div className="absolute top-[10%] right-[-10%] w-[35%] h-[50%] bg-purple-400 rounded-full blur-[120px] animate-pulse [animation-delay:1s]" />
          <div className="absolute bottom-[-10%] left-[20%] w-[30%] h-[40%] bg-pink-300 rounded-full blur-[100px] animate-pulse [animation-delay:2s]" />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <Motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-bold uppercase tracking-wider mb-6 border border-primary/20">
              <Sparkles className="h-3 w-3" />
              <span>Connect & Collaborate</span>
            </div>
            
            <h1 className="text-4xl md:text-5xl lg:text-7xl font-black text-slate-900 dark:text-white tracking-tight mb-6">
              Our <span className="text-transparent bg-clip-text bg-linear-to-r from-primary to-indigo-600">Community</span> Directory
            </h1>
            
            <p className="text-lg md:text-xl text-slate-600 dark:text-slate-400 max-w-2xl mx-auto mb-12 font-medium leading-relaxed">
              Meet the founders, creators, and visionaries building the next generation 
              <br className="hidden md:block" /> of breakthrough startups.
            </p>

            {/* Premium Search & Filter Bar */}
            <div className="max-w-4xl mx-auto">
              <div className="bg-white/80 dark:bg-surface-dark/80 backdrop-blur-xl p-2 rounded-2xl shadow-2xl shadow-primary/5 border border-white dark:border-white/5 flex flex-col md:flex-row gap-2">
                <div className="relative flex-1">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-primary" />
                  <input
                    type="text"
                    placeholder="Search by name, role, or location..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-full h-14 pl-12 pr-4 bg-transparent border-none focus:ring-0 text-slate-900 dark:text-white placeholder:text-slate-400 text-base"
                  />
                </div>
                
                <div className="flex gap-1 p-1 bg-slate-100/50 dark:bg-slate-800/50 rounded-xl">
                  {["all", "user", "organization"].map((t) => (
                    <button
                      key={t}
                      onClick={() => setType(t)}
                      className={cn(
                        "px-6 py-3 text-sm font-bold rounded-lg transition-all flex items-center gap-2 whitespace-nowrap",
                        type === t
                          ? "bg-white dark:bg-slate-700 text-primary shadow-sm"
                          : "text-slate-500 dark:text-slate-400 hover:text-primary"
                      )}
                    >
                      {t === "user" && <Users className="h-4 w-4" />}
                      {t === "organization" && <Building2 className="h-4 w-4" />}
                      {t === "all" ? "All" : t === "user" ? "People" : "Startups"}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </Motion.div>
        </div>
      </div>

      {/* ── Main Content ── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-20">
        <div className="flex justify-between items-center mb-10 px-2">
          <div className="flex items-center gap-3">
             <div className="bg-primary/10 p-2 rounded-lg">
                <Filter className="h-4 w-4 text-primary" />
             </div>
             <span className="text-sm font-bold text-slate-900 dark:text-slate-300">
               {pagination.total} <span className="text-slate-400 font-medium">Found in Network</span>
             </span>
          </div>
          
          <div className="hidden sm:flex items-center gap-2 text-xs font-semibold text-slate-400 uppercase tracking-widest">
             Sorted By <span className="text-primary italic">Recently Joined</span>
          </div>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {[...Array(8)].map((_, i) => (
               <div key={i} className="h-80 bg-white dark:bg-surface-dark rounded-2xl animate-pulse border border-slate-100 dark:border-white/5" />
            ))}
          </div>
        ) : data.length === 0 ? (
          <Motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center py-24 bg-white dark:bg-surface-dark rounded-3xl shadow-xl shadow-slate-200/50 dark:shadow-none border border-slate-100 dark:border-white/5"
          >
            <div className="w-24 h-24 bg-primary/5 rounded-full flex items-center justify-center mx-auto mb-8 border border-primary/10">
              <Search className="h-10 w-10 text-primary/40" />
            </div>
            <h3 className="text-3xl font-black text-slate-900 dark:text-white mb-3 tracking-tight">
              No results found
            </h3>
            <p className="text-slate-500 dark:text-slate-400 max-w-md mx-auto mb-10 leading-relaxed font-medium">
              We couldn't find any profiles matching your search. 
              Try expanding your criteria or clear the filters.
            </p>
            <Button
              onClick={() => {
                setSearch("");
                setType("all");
              }}
              className="px-8 h-12 rounded-full font-bold shadow-lg shadow-primary/25"
            >
              Clear All Filters
            </Button>
          </Motion.div>
        ) : (
          <>
            <Motion.div
              variants={containerVariants}
              initial="hidden"
              animate="show"
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8"
            >
              <AnimatePresence mode="popLayout">
                {data.map((profile) => (
                  <ProfileCard
                    key={`${profile.type}-${profile.id}`}
                    profile={profile}
                  />
                ))}
              </AnimatePresence>
            </Motion.div>

            {/* Professional Pagination */}
            {pagination.totalPages > 1 && (
              <div className="mt-20 flex justify-center items-center gap-4">
                <Button
                  variant="outline"
                  disabled={page === 1}
                  onClick={() => setPage(page - 1)}
                  className="rounded-xl border-slate-200 dark:border-slate-800 dark:hover:bg-slate-800"
                >
                  <ChevronLeft className="h-4 w-4 mr-2" /> Prev
                </Button>
                
                <div className="flex items-center gap-2">
                  {Array.from({ length: Math.min(5, pagination.totalPages) }).map((_, i) => {
                    let pageNum = page > 3 ? (page - 2 + i) : (i + 1);
                    if (pageNum > pagination.totalPages) return null;

                    return (
                      <button
                        key={pageNum}
                        onClick={() => setPage(pageNum)}
                        className={cn(
                          "w-10 h-10 rounded-xl text-sm font-bold transition-all flex items-center justify-center",
                          page === pageNum
                            ? "bg-primary text-white shadow-lg shadow-primary/25 scale-110"
                            : "text-slate-500 dark:text-slate-400 hover:bg-white dark:hover:bg-slate-800 border border-transparent hover:border-slate-200 dark:hover:border-slate-700"
                        )}
                      >
                        {pageNum}
                      </button>
                    );
                  })}
                </div>

                <Button
                  variant="outline"
                  disabled={page === pagination.totalPages}
                  onClick={() => setPage(page + 1)}
                  className="rounded-xl border-slate-200 dark:border-slate-800 dark:hover:bg-slate-800"
                >
                  Next <ChevronRight className="h-4 w-4 ml-2" />
                </Button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

// ─── Child Components ───

function ProfileCard({ profile }) {
  const isOrg = profile.type === "organization";
  const linkTo = `/community/${profile.slug}`;

  const avatarUrl = profile.avatar_url
    ? profile.avatar_url.startsWith("http") ||
      profile.avatar_url.startsWith("/public")
      ? profile.avatar_url
      : `${SERVER_URL}${profile.avatar_url}`
    : `https://ui-avatars.com/api/?name=${encodeURIComponent(profile.name)}&background=random&size=200&bold=true&color=fff`;

  const getRoleDisplay = () => {
    if (isOrg) return { label: "Startup", color: "text-blue-600", bg: "bg-linear-to-br from-blue-500/20 to-indigo-500/10 dark:from-blue-600/30 dark:to-indigo-600/10", icon: <Building2 className="h-3 w-3" /> };
    
    switch (profile.role) {
      case "founder":
        return { label: "Founder", color: "text-amber-600", bg: "bg-linear-to-br from-amber-400/20 to-orange-400/10 dark:from-amber-500/30 dark:to-orange-500/10", icon: <Sparkles className="h-3 w-3" /> };
      case "freelancer":
        return { label: "Freelancer", color: "text-emerald-600", bg: "bg-linear-to-br from-emerald-400/20 to-teal-400/10 dark:from-emerald-500/30 dark:to-teal-500/10", icon: <Users className="h-3 w-3" /> };
      case "student":
        return { label: "Student", color: "text-cyan-600", bg: "bg-linear-to-br from-cyan-400/20 to-blue-400/10 dark:from-cyan-500/30 dark:to-blue-500/10", icon: <Users className="h-3 w-3" /> };
      case "normal_user":
      default:
        return { label: "Talent", color: "text-rose-600", bg: "bg-linear-to-br from-rose-400/20 to-orange-400/10 dark:from-rose-500/30 dark:to-orange-500/10", icon: <Users className="h-3 w-3" /> };
    }
  };

  const roleInfo = getRoleDisplay();

  return (
    <Motion.div 
      variants={itemVariants} 
      layout
      exit={{ opacity: 0, scale: 0.9 }}
      className="h-full group"
    >
      <Link to={linkTo} className="block h-full outline-none">
        <div className="relative h-full bg-white dark:bg-surface-dark border border-slate-100 dark:border-white/5 rounded-[2rem] overflow-hidden hover:shadow-2xl hover:shadow-primary/10 transition-all duration-500 flex flex-col group-hover:-translate-y-2 group-hover:border-primary/20">
          
          {/* Card Top / Avatar Container */}
          <div className="relative h-44 overflow-hidden">
             {/* Dynamic Gradient Background */}
             <div className={cn(
               "absolute inset-0 transition-opacity duration-500",
               roleInfo.bg
             )} />
             
             {/* Badge */}
             <div className="absolute top-6 left-6 z-20">
                <span className={cn(
                  "px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest shadow-sm bg-white/90 dark:bg-slate-900/90 backdrop-blur-md flex items-center gap-1.5",
                  roleInfo.color
                )}>
                  {roleInfo.icon}
                  {roleInfo.label}
                </span>
             </div>

             {/* Main Avatar */}
             <div className="absolute inset-0 flex items-center justify-center pt-8">
                <div className="relative group-hover:scale-105 transition-transform duration-500">
                  <div className="absolute inset-0 bg-primary/20 rounded-3xl blur-[20px] opacity-0 group-hover:opacity-100 transition-opacity" />
                  <div className="h-28 w-28 rounded-3xl overflow-hidden border-4 border-white dark:border-slate-800 shadow-xl relative z-10 bg-slate-50 dark:bg-slate-900">
                    <img
                      src={avatarUrl}
                      alt={profile.name}
                      className="h-full w-full object-cover"
                    />
                  </div>
                </div>
             </div>
          </div>

          {/* Content */}
          <div className="px-8 pb-10 flex-1 flex flex-col text-center">
            <h3 className="font-black text-xl text-slate-900 dark:text-white mb-2 leading-tight group-hover:text-primary transition-colors line-clamp-1">
              {profile.name}
            </h3>
            
            <p className="text-sm font-semibold text-slate-500 dark:text-slate-400 mb-6 line-clamp-2 min-h-[40px]">
              {profile.headline || profile.department || (isOrg ? "Emerging Startup" : "Network Member")}
            </p>

            <div className="mt-auto space-y-4">
              <div className="flex items-center justify-center gap-2 py-2 px-4 rounded-xl bg-slate-50 dark:bg-slate-800/40 text-[11px] font-bold text-slate-400 dark:text-slate-500 border border-slate-100/50 dark:border-slate-700/50 group-hover:bg-primary/5 group-hover:text-primary group-hover:border-primary/10 transition-all">
                <MapPin className="h-3.5 w-3.5" />
                <span className="truncate">{profile.location || "Remote Worldwide"}</span>
              </div>

              <div className="flex items-center justify-center gap-2 pt-2 text-xs font-bold text-primary opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-2 group-hover:translate-y-0">
                <span>View Full Profile</span>
                <ArrowRight className="h-3 w-3" />
              </div>
            </div>
          </div>

          {/* Bottom Progress Bar Decoration */}
          <div className="absolute bottom-0 left-0 h-1.5 bg-linear-to-r from-primary to-indigo-600 w-0 group-hover:w-full transition-all duration-500 ease-out" />
        </div>
      </Link>
    </Motion.div>
  );
}
