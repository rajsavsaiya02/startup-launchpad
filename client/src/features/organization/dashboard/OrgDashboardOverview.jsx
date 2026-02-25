import React from "react";

export function OrgDashboardOverview() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start gap-4">
        <div>
          <h1 className="text-2xl font-bold text-text-primary dark:text-white">
            Organization Dashboard
          </h1>
          <p className="text-text-secondary dark:text-gray-400 mt-1">
            Overview of your organization's projects, tasks, and team.
          </p>
        </div>
      </div>

      <div className="p-8 bg-surface-light dark:bg-surface-dark border border-border-light dark:border-border-dark rounded-xl text-center">
        <h2 className="text-xl font-semibold mb-2 text-text-primary dark:text-white">
          Welcome to your Organization
        </h2>
        <p className="text-text-secondary">
          Dashboard widgets and overview metrics will be implemented here.
        </p>
      </div>
    </div>
  );
}
