import React from "react";
import { Card } from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";
import { BookOpen, GraduationCap, Trophy, Users } from "lucide-react";

export function StudentDashboard() {
  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-20">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-end gap-4 border-b border-border-light dark:border-border-dark pb-6">
        <div>
          <h1 className="text-3xl font-bold text-text-primary dark:text-white">
            Student Dashboard
          </h1>
          <p className="text-text-secondary dark:text-gray-400 mt-1">
            Keep learning and growing!
          </p>
        </div>
        <div className="flex gap-3">
          <Button variant="secondary" className="gap-2">
            <BookOpen className="h-4 w-4" /> Browse Courses
          </Button>
        </div>
      </div>

      {/* Top Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: "Courses in Progress", value: "3", icon: BookOpen },
          { label: "Completed", value: "5", icon: GraduationCap },
          { label: "Certificates", value: "2", icon: Trophy },
          { label: "Mentorship Sessions", value: "1", icon: Users },
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
            <p className="text-text-tertiary">My Learning Path (Coming Soon)</p>
          </Card>
        </div>
        <div className="space-y-8">
          <Card className="p-6 bg-white dark:bg-surface-dark h-64 flex items-center justify-center border-dashed border-2 border-border-light dark:border-border-dark">
            <p className="text-text-tertiary">Upcoming Events & Webinars</p>
          </Card>
        </div>
      </div>
    </div>
  );
}
