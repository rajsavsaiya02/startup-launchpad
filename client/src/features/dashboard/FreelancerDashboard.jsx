import React from "react";
import { Card } from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";
import { Filter, Search, Briefcase, CheckCircle, Clock } from "lucide-react";
import { Link } from "react-router-dom";

export function FreelancerDashboard() {
  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-20">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-end gap-4 border-b border-border-light dark:border-border-dark pb-6">
        <div>
          <h1 className="text-3xl font-bold text-text-primary dark:text-white">
            Freelancer Dashboard
          </h1>
          <p className="text-text-secondary dark:text-gray-400 mt-1">
            Ready to find your next gig?
          </p>
        </div>
        <div className="flex gap-3">
          <Button variant="secondary" size="icon">
            <Filter className="h-5 w-5" />
          </Button>
          <Link to="/gigs">
            <Button className="gap-2">
              <Search className="h-4 w-4" /> Find Work
            </Button>
          </Link>
        </div>
      </div>

      {/* Top Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: "Active Gigs", value: "2", icon: Briefcase },
          { label: "Applications Sent", value: "8", icon: CheckCircle },
          { label: "Pending Reviews", value: "1", icon: Clock },
          { label: "Total Earnings", value: "$1,200", icon: Briefcase },
        ].map((metric, i) => (
          <Card
            key={i}
            className="p-5 bg-white dark:bg-surface-dark hover:shadow-md transition-shadow"
          >
            <p className="text-sm text-text-secondary dark:text-gray-400 mb-2">
              {metric.label}
            </p>
            <div className="flex items-end justify-between">
              <p className="text-3xl font-bold text-text-primary dark:text-white">
                {metric.value}
              </p>
            </div>
          </Card>
        ))}
      </div>

      {/* Main Content Area - Placeholder */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <Card className="p-6 bg-white dark:bg-surface-dark h-64 flex items-center justify-center border-dashed border-2 border-border-light dark:border-border-dark">
            <p className="text-text-tertiary">
              My Active Gigs List (Coming Soon)
            </p>
          </Card>
        </div>
        <div className="space-y-8">
          <Card className="p-6 bg-white dark:bg-surface-dark h-64 flex items-center justify-center border-dashed border-2 border-border-light dark:border-border-dark">
            <p className="text-text-tertiary">Recommended Gigs (AI)</p>
          </Card>
        </div>
      </div>
    </div>
  );
}
