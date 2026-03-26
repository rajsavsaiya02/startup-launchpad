import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  Search,
  MapPin,
  Star,
  ChevronDown,
  Filter,
  Loader2,
  AlertCircle,
  Users,
  Bookmark,
  IndianRupee,
  MessageSquare,
} from "lucide-react";
import { motion as Motion, AnimatePresence } from "framer-motion";
import { Button } from "../../../../components/ui/Button";
import { Badge } from "../../../../components/ui/Badge";
import { Avatar } from "../../../../components/ui/Avatar";
import { Card } from "../../../../components/ui/Card";
import { Link, useNavigate } from "react-router-dom";
import talentApi from "../../../../services/talentApi";
import { toast } from "react-toastify";
import { useQueryClient } from "@tanstack/react-query";

// ── Role helpers ────────────────────────────────────────────────
const ROLE_OPTIONS = [
  { value: "", label: "All Roles" },
  { value: "freelancer", label: "Freelancer" },
  { value: "student", label: "Student" },
  { value: "normal_user", label: "Normal User" },
];

const ROLE_BADGE = {
  freelancer: "bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300",
  student:
    "bg-purple-50 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300",
  normal_user: "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-300",
};

const ROLE_LABEL = {
  freelancer: "Freelancer",
  student: "Student",
  normal_user: "Member",
};

// ── Skeleton card ───────────────────────────────────────────────
function SkeletonCard() {
  return (
    <div className="bg-white dark:bg-surface-dark border border-border-light dark:border-border-dark rounded-xl p-6 flex flex-col items-center animate-pulse">
      <div className="h-20 w-20 rounded-full bg-gray-200 dark:bg-gray-700 mb-4" />
      <div className="h-4 w-32 rounded bg-gray-200 dark:bg-gray-700 mb-2" />
      <div className="h-3 w-24 rounded bg-gray-100 dark:bg-gray-800 mb-5" />
      <div className="flex gap-1.5 mb-5">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="h-5 w-14 rounded bg-gray-100 dark:bg-gray-800"
          />
        ))}
      </div>
      <div className="w-full h-16 rounded-lg bg-gray-100 dark:bg-gray-800 mb-6" />
      <div className="grid grid-cols-2 gap-2 w-full">
        <div className="h-10 rounded-lg bg-gray-100 dark:bg-gray-800" />
        <div className="h-10 rounded-lg bg-gray-200 dark:bg-gray-700" />
      </div>
    </div>
  );
}

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" } },
};

// ── Main component ──────────────────────────────────────────────
export function FindTalentTab() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const [viewMode, setViewMode] = useState("discover"); // "discover" | "shortlisted"
  const [users, setUsers] = useState([]);
  const [shortlistedUsers, setShortlistedUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState(null);

  // Discover mode states
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [total, setTotal] = useState(0);

  const debounceRef = useRef(null);

  // ── API Fetchers ──────────────────────────────────────────────
  const fetchDiscoverUsers = useCallback(
    async ({ search, role, currentPage, append }) => {
      try {
        if (!append) setLoading(true);
        else setLoadingMore(true);

        const data = await talentApi.getTalentUsers({
          search: search || undefined,
          role: role || undefined,
          page: currentPage,
          limit: 12,
        });

        // Artificial intentional delay for a real-time/premium feel
        await new Promise((resolve) => setTimeout(resolve, 400));

        if (data.success) {
          setUsers((prev) => (append ? [...prev, ...data.users] : data.users));
          setHasMore(data.pagination.hasMore);
          setTotal(data.pagination.total);
        } else {
          setError("Failed to load talent profiles.");
        }
      } catch (_err) {
        console.error("FindTalentTab error:", _err);
        setError("Could not connect to the server.");
      } finally {
        setLoading(false);
        setLoadingMore(false);
      }
    },
    [],
  );

  const fetchShortlistedUsers = useCallback(async () => {
    try {
      setLoading(true);
      const data = await talentApi.getOrgShortlistedTalent();

      await new Promise((resolve) => setTimeout(resolve, 300));

      if (data.success) {
        setShortlistedUsers(data.users);
      } else {
        setError("Failed to load shortlisted talent.");
      }
    } catch (_err) {
      console.error("FindTalentTab shortlist error:", _err);
      setError("Could not fetch shortlisted list.");
    } finally {
      setLoading(false);
    }
  }, []);

  // ── Effect hooks ──────────────────────────────────────────────
  useEffect(() => {
    setError(null);
    if (viewMode === "discover") {
      setPage(1);
      fetchDiscoverUsers({
        search: searchQuery,
        role: roleFilter,
        currentPage: 1,
        append: false,
      });
    } else {
      fetchShortlistedUsers();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [viewMode, roleFilter]);

  // Debounced search (Discover only)
  useEffect(() => {
    if (viewMode !== "discover") return;
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      setPage(1);
      setError(null);
      fetchDiscoverUsers({
        search: searchQuery,
        role: roleFilter,
        currentPage: 1,
        append: false,
      });
    }, 300);
    return () => clearTimeout(debounceRef.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchQuery]);

  // ── Actions ───────────────────────────────────────────────────
  const handleLoadMore = () => {
    const nextPage = page + 1;
    setPage(nextPage);
    fetchDiscoverUsers({
      search: searchQuery,
      role: roleFilter,
      currentPage: nextPage,
      append: true,
    });
  };

  const handleToggleShortlist = async (userId, e) => {
    e.preventDefault();
    try {
      const resp = await talentApi.toggleShortlist(userId);
      if (resp.success) {
        toast.success(
          resp.isShortlisted
            ? "Added to shortlist!"
            : "Removed from shortlist.",
        );

        // Immediate reactive UI update for real-time smoothness
        if (viewMode === "discover" && resp.isShortlisted) {
          // Hide from Discover since it's now bookmarked
          setUsers((prev) => prev.filter((u) => u.id !== userId));
          setTotal((prev) => Math.max(0, prev - 1));
        } else if (viewMode === "shortlisted" && !resp.isShortlisted) {
          // Hide from Shortlisted since it's now un-bookmarked
          setShortlistedUsers((prev) => prev.filter((u) => u.id !== userId));
        }

        // Invalidate orgConversations so that the TalentMessagesTab gets the fresh direct message conv
        queryClient.invalidateQueries({ queryKey: ["orgConversations"] });
      }
    } catch {
      toast.error("Failed to update shortlist.");
    }
  };

  const handleChatClick = async (person, e) => {
    e.preventDefault();
    if (viewMode === "discover") {
      try {
        // Auto-shortlist them before chatting
        const resp = await talentApi.toggleShortlist(person.id);
        if (resp.success && resp.isShortlisted) {
          setUsers((prev) => prev.filter((u) => u.id !== person.id));
          setTotal((prev) => Math.max(0, prev - 1));
          queryClient.invalidateQueries({ queryKey: ["orgConversations"] });
        }
      } catch {
        toast.error("Failed to prepare chat context.");
        return;
      }
    }
    if (person.application_id) {
      navigate(`/org/talent/messages/${person.id}?appId=${person.application_id}`);
    } else {
      navigate(`/org/talent/messages/${person.id}`);
    }
  };

  // Prepare active list
  const activeList = viewMode === "discover" ? users : shortlistedUsers;

  // ── Render ─────────────────────────────────────────────────────
  return (
    <div className="space-y-6">
      {/* Top Toggle & Filter Bar */}
      <div className="flex flex-col lg:flex-row gap-4 justify-between items-center bg-white dark:bg-surface-dark p-4 rounded-xl border border-border-light dark:border-border-dark shadow-sm">
        {/* Toggle Switch */}
        <div className="flex bg-gray-100 dark:bg-gray-800 p-1 rounded-lg w-full lg:w-auto shrink-0">
          <button
            onClick={() => setViewMode("discover")}
            className={`flex-1 lg:flex-none px-6 py-2 rounded-md text-sm font-bold transition-all ${
              viewMode === "discover"
                ? "bg-white dark:bg-gray-700 text-primary shadow-sm"
                : "text-text-secondary hover:text-text-primary"
            }`}
          >
            Discover
          </button>
          <button
            onClick={() => setViewMode("shortlisted")}
            className={`flex-1 lg:flex-none px-6 py-2 rounded-md text-sm font-bold transition-all ${
              viewMode === "shortlisted"
                ? "bg-white dark:bg-gray-700 text-primary shadow-sm"
                : "text-text-secondary hover:text-text-primary"
            }`}
          >
            Short-list
          </button>
        </div>

        {/* Search Input (Discover only) */}
        {viewMode === "discover" && (
          <div className="flex-1 w-full relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-text-tertiary" />
            <Motion.input
              initial={{ opacity: 0, width: "90%" }}
              animate={{ opacity: 1, width: "100%" }}
              type="text"
              placeholder="Search talent by name, role, or skill…"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-11 pl-10 pr-4 rounded-lg border border-border-light bg-gray-50 dark:bg-gray-800 dark:border-border-dark focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm"
            />
          </div>
        )}

        {/* Role filter (Discover only) */}
        {viewMode === "discover" && (
          <div className="flex gap-2 w-full lg:w-auto">
            <div className="relative flex-1 lg:min-w-44">
              <select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
                className="w-full h-11 pl-4 pr-10 rounded-lg border border-border-light bg-gray-50 dark:bg-gray-800 dark:border-border-dark text-xs font-bold text-text-primary dark:text-white appearance-none cursor-pointer focus:ring-2 focus:ring-primary/20 focus:border-primary"
              >
                {ROLE_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-tertiary pointer-events-none" />
            </div>
            <Button
              variant="secondary"
              className="h-11 px-5 font-bold flex gap-2"
            >
              <Filter className="h-4 w-4" /> Filters
            </Button>
          </div>
        )}
      </div>

      {/* Result count */}
      {!loading && !error && viewMode === "discover" && (
        <p className="text-xs text-text-tertiary font-medium px-1">
          {total === 0
            ? "No profiles found"
            : `Showing ${users.length} of ${total} profile${total === 1 ? "" : "s"}`}
        </p>
      )}

      {/* Error state */}
      <AnimatePresence>
        {error && (
          <Motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="flex items-center gap-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-4 text-sm text-red-700 dark:text-red-300"
          >
            <AlertCircle className="h-5 w-5 shrink-0" />
            {error}
          </Motion.div>
        )}
      </AnimatePresence>

      {/* Talent Grid (4 columns on xl screens) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {/* Initial massive load skeletons */}
        {loading &&
          activeList.length === 0 &&
          Array.from({ length: 8 }).map((_, i) => (
            <SkeletonCard key={`skel-init-${i}`} />
          ))}

        {/* User cards */}
        <AnimatePresence mode="popLayout">
          {activeList.map((person) => (
            <Motion.div
              key={person.id}
              variants={cardVariants}
              initial="hidden"
              animate="visible"
              layout
              exit={{ opacity: 0, scale: 0.95 }}
            >
              <Card className="h-full p-6 flex flex-col items-center text-center hover:shadow-lg transition-all border-border-light dark:border-border-dark bg-white dark:bg-surface-dark group relative">
                {/* Shortlist Icon (Absolute top-right) */}
                <button
                  onClick={(e) => handleToggleShortlist(person.id, e)}
                  className={`absolute top-4 right-4 p-2 rounded-full transition-colors ${
                    viewMode === "shortlisted"
                      ? "text-primary bg-primary/10 hover:bg-error hover:text-white"
                      : "text-text-tertiary hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-primary"
                  }`}
                  title={
                    viewMode === "shortlisted"
                      ? "Remove from shortlist"
                      : "Shortlist candidate"
                  }
                >
                  <Bookmark
                    className={`h-5 w-5 ${viewMode === "shortlisted" ? "fill-current" : ""}`}
                  />
                </button>

                {/* Avatar */}
                <div className="relative mb-4 mt-2">
                  <Avatar
                    src={person.avatar_url}
                    name={person.name}
                    size="xl"
                    className="h-20 w-20 ring-4 ring-primary/5 group-hover:ring-primary/20 transition-all"
                  />
                  <div className="absolute bottom-0 right-0 bg-success h-4 w-4 rounded-full border-2 border-white dark:border-surface-dark shadow-sm" />
                </div>

                {/* Name & role/title */}
                <h3 className="font-black text-lg text-text-primary dark:text-white uppercase tracking-tight">
                  {person.name}
                </h3>
                <p className="text-xs font-bold text-primary mb-2 opacity-80 uppercase tracking-wider line-clamp-1">
                  {person.job_title || person.headline || "—"}
                </p>

                {/* Role badge */}
                <span
                  className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full mb-4 ${
                    ROLE_BADGE[person.role] || ROLE_BADGE.normal_user
                  }`}
                >
                  {ROLE_LABEL[person.role] || person.role}
                </span>

                {/* Skills */}
                <div className="flex flex-wrap justify-center gap-1.5 mb-5 min-h-[50px] content-start">
                  {(person.skills || []).slice(0, 5).map((skill) => (
                    <Badge
                      key={skill}
                      variant="neutral"
                      className="bg-gray-50 dark:bg-gray-800/50 border-transparent text-[10px] font-bold uppercase tracking-tighter"
                    >
                      {skill}
                    </Badge>
                  ))}
                  {(person.skills || []).length > 5 && (
                    <Badge
                      variant="neutral"
                      className="bg-gray-50 dark:bg-gray-800/50 border-transparent text-[10px] font-bold uppercase tracking-tighter"
                    >
                      +{person.skills.length - 5}
                    </Badge>
                  )}
                </div>

                {/* Location & rate */}
                <div className="flex flex-col gap-2 w-full text-xs text-text-secondary dark:text-gray-400 mb-6 bg-gray-50/50 dark:bg-gray-900/10 p-3 rounded-lg border border-border-light/40 dark:border-border-dark/40">
                  <div className="flex justify-between items-center">
                    <span className="flex items-center gap-1.5">
                      <MapPin className="h-3.5 w-3.5 text-text-tertiary" />
                      <span className="truncate max-w-[100px]">
                        {person.location || "Remote"}
                      </span>
                    </span>
                    <span className="font-black text-primary bg-primary/5 px-2 py-0.5 rounded leading-none shrink-0">
                      {person.rate && !isNaN(person.rate) ? `₹${person.rate}` : (person.rate || "Open")}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="flex items-center gap-1 truncate max-w-[60%] text-left">
                      {person.availability || "Available"}
                    </span>
                    {viewMode === "shortlisted" && person.shortlisted_at ? (
                      <span className="text-[10px] text-text-tertiary">
                        Shortlisted
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 font-black text-warning">
                        <Star className="h-3.5 w-3.5 fill-current" /> New
                      </span>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="grid grid-cols-2 gap-2 w-full mt-auto">
                  {/* Both views now show "Chat" as the primary action for communication */}
                  <Motion.button
                    onClick={(e) => handleChatClick(person, e)}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="w-full h-11 text-[10px] font-bold uppercase rounded-lg shadow-sm border border-transparent flex gap-1.5 items-center justify-center bg-gray-100 hover:bg-gray-200 text-text-primary dark:bg-gray-800 dark:hover:bg-gray-700 dark:text-white transition-all overflow-hidden relative"
                  >
                    <MessageSquare className="h-3.5 w-3.5" /> Chat
                  </Motion.button>

                  <Link
                    to={`/community/${person.username}`}
                    className="w-full"
                  >
                    <Motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="w-full h-11 text-[10px] font-bold uppercase rounded-lg shadow-sm bg-primary hover:bg-primary-hover text-white transition-all"
                    >
                      View Profile
                    </Motion.button>
                  </Link>
                </div>
              </Card>
            </Motion.div>
          ))}
        </AnimatePresence>

        {/* Load More Skeletons (Appended at the end of the grid) */}
        {loadingMore &&
          Array.from({ length: 4 }).map((_, i) => (
            <SkeletonCard key={`skel-more-${i}`} />
          ))}
      </div>

      {/* Empty states */}
      {!loading && !error && activeList.length === 0 && (
        <Motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col items-center justify-center py-20 bg-white dark:bg-surface-dark border border-border-light border-dashed dark:border-border-dark rounded-xl gap-3"
        >
          {viewMode === "discover" ? (
            <>
              <Users className="h-10 w-10 text-text-tertiary opacity-50" />
              <h4 className="text-text-secondary font-bold">
                No talent matches your search criteria.
              </h4>
              <p className="text-xs text-text-tertiary">
                Try a different skill, name, or role filter.
              </p>
            </>
          ) : (
            <>
              <Bookmark className="h-10 w-10 text-text-tertiary opacity-50" />
              <h4 className="text-text-secondary font-bold">
                You haven't shortlisted any candidates yet.
              </h4>
              <p className="text-xs text-text-tertiary">
                Switch to Discover Talent to find and bookmark promising talent.
              </p>
              <Button
                onClick={() => setViewMode("discover")}
                variant="secondary"
                className="mt-2 text-xs"
              >
                Browse Talent
              </Button>
            </>
          )}
        </Motion.div>
      )}

      {/* Load More (Discover only) */}
      {viewMode === "discover" && hasMore && !loading && (
        <div className="flex justify-center pt-2">
          <Button
            variant="secondary"
            onClick={handleLoadMore}
            disabled={loadingMore}
            className="px-8 py-2.5 font-bold flex items-center gap-2"
          >
            {loadingMore ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" /> Loading…
              </>
            ) : (
              "Load More"
            )}
          </Button>
        </div>
      )}
    </div>
  );
}
