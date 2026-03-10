import React from "react";
import {
  Archive,
  Trash2,
  Calendar,
  MapPin,
  Building2,
  UserCircle,
} from "lucide-react";
import { Card } from "../../components/ui/Card";
import { Badge } from "../../components/ui/Badge";
import { Button } from "../../components/ui/Button";
import { useArchives, useDeleteArchive } from "../../hooks/useTalent";

export function TalentArchivePage() {
  const { data, isLoading, isError } = useArchives();
  const deleteMutation = useDeleteArchive();

  const archives = data?.archives || [];

  const handleDelete = (id) => {
    if (
      window.confirm(
        "Are you sure you want to permanently remove this from your archive?",
      )
    ) {
      deleteMutation.mutate(id);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-20">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-end gap-4 border-b border-border-light dark:border-border-dark pb-6">
        <div>
          <h1 className="text-3xl font-bold text-text-primary dark:text-white flex items-center gap-3">
            <Archive className="h-8 w-8 text-primary" /> My Archives
          </h1>
          <p className="text-text-secondary dark:text-gray-400 mt-1">
            History of your past opportunities, applications, and completed
            gigs.
          </p>
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary"></div>
        </div>
      ) : isError ? (
        <div className="text-center text-red-500 py-12">
          Failed to load archives.
        </div>
      ) : archives.length === 0 ? (
        <div className="text-center py-20 bg-white dark:bg-surface-dark border border-border-light dark:border-border-dark rounded-xl">
          <Archive className="h-12 w-12 text-border-dark mx-auto mb-4" />
          <h3 className="text-xl font-bold text-text-primary dark:text-white mb-2">
            Archive is empty
          </h3>
          <p className="text-text-secondary dark:text-gray-400">
            You don't have any archived items yet. Closed gigs and accepted
            applications will appear here.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {archives.map((arc) => {
            // We can infer context based on whether org_name exists and aligns with user but simplified here

            return (
              <Card
                key={arc.archive_id}
                className="p-6 bg-white dark:bg-surface-dark border-border-light dark:border-border-dark flex flex-col h-full bg-opacity-70 dark:bg-opacity-50"
              >
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="font-bold text-text-primary dark:text-white line-clamp-1">
                      {arc.title}
                    </h3>
                    <p className="text-sm text-text-secondary mt-1 flex items-center gap-1">
                      <Building2 className="h-3 w-3" />{" "}
                      {arc.org_name || arc.founder_name}
                    </p>
                  </div>
                  <Badge
                    variant="neutral"
                    className="bg-gray-100 dark:bg-gray-800 shrink-0"
                  >
                    Archived
                  </Badge>
                </div>

                <div className="space-y-3 mb-6 text-sm text-text-secondary dark:text-gray-400 grow">
                  <div className="flex justify-between items-center bg-gray-50 dark:bg-gray-800/50 p-2 rounded-md">
                    <span className="flex items-center gap-1">
                      <UserCircle className="h-3 w-3" /> Talent
                    </span>
                    <span className="font-medium text-text-primary dark:text-white">
                      {arc.freelancer_name}
                    </span>
                  </div>
                  <div className="flex justify-between border-b border-border-light dark:border-border-dark pb-2">
                    <span>Final Status</span>
                    <Badge
                      variant={
                        arc.application_status === "Accepted"
                          ? "success"
                          : "neutral"
                      }
                    >
                      {arc.application_status}
                    </Badge>
                  </div>
                  <div className="flex justify-between">
                    <span>Archived On</span>
                    <span>
                      {new Date(arc.archived_at).toLocaleDateString()}
                    </span>
                  </div>
                </div>

                <div className="mt-auto pt-4 flex gap-3">
                  <Button
                    variant="outline"
                    className="w-full gap-2 text-error hover:bg-error/10 hover:border-error border-border-light dark:border-border-dark"
                    onClick={() => handleDelete(arc.archive_id)}
                    disabled={deleteMutation.isPending}
                  >
                    <Trash2 className="h-4 w-4" /> Remove
                  </Button>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
