import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  Search,
  Filter,
  Briefcase,
  DollarSign,
  Clock,
  MapPin,
  ChevronDown,
} from "lucide-react";
import { Button } from "../../components/ui/Button";
import { Badge } from "../../components/ui/Badge";
import { Card } from "../../components/ui/Card";
import { Avatar } from "../../components/ui/Avatar";
import opportunityService from "../../services/opportunityService";
import { formatDistanceToNow } from "date-fns";
import { useAuth } from "../../context/AuthContext";

export function GigListPage() {
  const { user } = useAuth();
  const [gigs, setGigs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    type: "",
    status: "Open", // Default to open
    search: "",
  });

  const fetchGigs = async () => {
    try {
      setLoading(true);
      const res = await opportunityService.getAllOpportunities(filters);
      if (res.success) {
        setGigs(res.opportunities);
      }
    } catch (error) {
      console.error("Failed to fetch opportunities", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGigs();
  }, [filters]);

  const handleSearchChange = (e) => {
    setFilters((prev) => ({ ...prev, search: e.target.value }));
  };

  const handleTypeChange = (e) => {
    const value = e.target.value;
    setFilters((prev) => ({ ...prev, type: value === "Category" ? "" : value }));
  };

  // Determine if the user is an org owner who should manage, or a freelancer tracking
  const isOrgMember = ["founder", "admin"].includes(user?.role);

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-20">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-end gap-4 border-b border-border-light dark:border-border-dark pb-6">
        <div>
          <h1 className="text-3xl font-bold text-text-primary dark:text-white">
            Find Gigs & Opportunities
          </h1>
          <p className="text-text-secondary dark:text-gray-400 mt-1">
            Browse and apply for short-term contracts, internships, and full-time jobs.
          </p>
        </div>
        <div className="flex gap-3">
          {isOrgMember && (
            <>
              <Link to="/talent">
                <Button variant="secondary">Find Talent</Button>
              </Link>
              <Link to="/dashboard/opportunities/manage">
                <Button>Manage Opportunities</Button>
              </Link>
            </>
          )}
          {!isOrgMember && (
            <Link to="/dashboard/applications/me">
              <Button variant="secondary">My Applications</Button>
            </Link>
          )}
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col lg:flex-row gap-4 relative z-20">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-text-tertiary" />
          <input
            type="text"
            placeholder="Search gigs by title or description..."
            value={filters.search}
            onChange={handleSearchChange}
            className="w-full h-11 pl-10 pr-4 rounded-xl border border-border-light bg-white dark:bg-surface-dark dark:border-border-dark focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
          />
        </div>
        
        <div className="relative min-w-40">
          <select 
            onChange={handleTypeChange}
            className="w-full h-11 pl-4 pr-10 rounded-xl border border-border-light bg-white dark:bg-surface-dark dark:border-border-dark text-sm appearance-none cursor-pointer focus:ring-2 focus:ring-primary/20 transition-all font-medium text-text-primary dark:text-gray-200"
          >
            <option value="Category">All Types</option>
            <option value="gig">Gig / Contract</option>
            <option value="internship">Internship</option>
            <option value="job">Full-time Job</option>
          </select>
          <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-tertiary pointer-events-none" />
        </div>
      </div>

      {/* Loading State */}
      {loading ? (
        <div className="flex justify-center items-center py-20">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : gigs.length === 0 ? (
        <div className="text-center py-20 bg-white/50 dark:bg-surface-dark/50 rounded-2xl border border-border-light dark:border-border-dark border-dashed">
          <Briefcase className="w-12 h-12 text-text-tertiary mx-auto mb-4 opacity-50" />
          <h3 className="text-lg font-bold text-text-primary dark:text-white mb-1">No opportunities found</h3>
          <p className="text-text-secondary dark:text-gray-400">Try adjusting your search criteria or removing filters.</p>
        </div>
      ) : (
        /* Gig Grid */
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {gigs.map((gig) => {
            const timeAgo = gig.created_at ? formatDistanceToNow(new Date(gig.created_at), { addSuffix: true }) : 'Just now';
            const priceText = gig.compensation_type === 'Hourly' ? `${gig.budget_min}-${gig.budget_max}/hr` 
                            : gig.compensation_type === 'Fixed' ? `${gig.budget_min} (Fixed)`
                            : gig.compensation_type === 'Unpaid' ? 'Unpaid'
                            : gig.compensation_type;

            return (
              <Card
                key={gig.id}
                className="group relative p-6 hover:shadow-xl hover:shadow-primary/5 transition-all duration-300 flex flex-col h-full bg-white dark:bg-surface-dark/80 border-border-light dark:border-border-dark rounded-2xl overflow-hidden backdrop-blur-sm"
              >
                {/* Decorative Top Accent */}
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary/50 to-indigo-500/50 opacity-0 group-hover:opacity-100 transition-opacity" />

                <div className="flex justify-between items-start mb-5">
                  <div className="flex gap-4 items-center">
                    <Avatar 
                      src={gig.organization_logo || "https://i.pravatar.cc/150?u=company"} 
                      size="lg" 
                      className="border-2 border-white dark:border-surface-dark shadow-sm bg-gray-50"
                    />
                    <div>
                      <h3 className="font-black text-[15px] text-text-primary dark:text-white line-clamp-1 group-hover:text-primary transition-colors leading-tight">
                        {gig.title}
                      </h3>
                      <p className="text-[13px] text-text-secondary dark:text-gray-400 font-medium mt-0.5">
                        {gig.organization_name || "Confidential Org"}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Sub Metadata Row */}
                <div className="flex items-center gap-3 mb-5 text-xs font-semibold text-text-secondary dark:text-gray-400">
                  <span className="flex items-center gap-1.5 bg-gray-100 dark:bg-gray-800/50 px-2 py-1 rounded-md">
                    <Briefcase className="h-3.5 w-3.5 text-primary" /> 
                    <span className="capitalize">{gig.type}</span>
                  </span>
                  <span className="flex items-center gap-1.5 bg-gray-100 dark:bg-gray-800/50 px-2 py-1 rounded-md">
                    <Clock className="h-3.5 w-3.5 text-indigo-500" /> {timeAgo}
                  </span>
                </div>

                {/* Skills Container */}
                <div className="flex flex-wrap gap-2 mb-6">
                  {(gig.skills || []).slice(0, 4).map((s) => (
                    <Badge
                      key={s}
                      variant="neutral"
                      className="bg-gray-50 dark:bg-gray-800/80 border-border-light/50 dark:border-border-dark/50 text-[10px] font-bold tracking-wider uppercase text-text-secondary dark:text-gray-300 px-2.5 py-1"
                    >
                      {s}
                    </Badge>
                  ))}
                  {gig.skills?.length > 4 && (
                    <Badge variant="neutral" className="bg-transparent border-none text-xs text-text-tertiary">
                      +{gig.skills.length - 4} more
                    </Badge>
                  )}
                </div>

                <div className="mt-auto space-y-5 pt-4 border-t border-border-light/50 dark:border-border-dark/50">
                  <div className="flex justify-between items-center text-sm">
                    <div className="flexflex-col">
                      <span className="text-[10px] uppercase font-black tracking-widest text-text-tertiary block mb-0.5">Budget</span>
                      <span className="flex items-center gap-1 font-bold text-text-primary dark:text-gray-200">
                        <DollarSign className="h-4 w-4 text-emerald-500" /> 
                        {priceText || "Negotiable"}
                      </span>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <Link to={`/dashboard/gigs/${gig.id}`} className="w-full">
                      <Button variant="secondary" className="w-full font-bold group-hover:bg-primary/5 group-hover:text-primary transition-colors">
                        View Details
                      </Button>
                    </Link>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}

