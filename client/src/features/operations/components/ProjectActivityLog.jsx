import React, { useState, useEffect, useCallback } from "react";
import ReactQuill from "react-quill-new";
import "react-quill-new/dist/quill.snow.css";
import { formatDistanceToNow, format } from "date-fns";
import projectActivityService from "../../../services/projectActivityService";
import { useAuth } from "../../../context/AuthContext";
import { Drawer } from "../../../components/ui/Drawer";
import { Avatar } from "../../../components/ui/Avatar";
import { Button } from "../../../components/ui/Button";
import { Edit2, Trash2, Save, X, MessageSquareHeart, Plus } from "lucide-react";
import { toast } from "react-toastify";

// React-Quill UI Config
const modules = {
  toolbar: [
    ["bold", "italic", "underline", "strike"], // toggled buttons
    ["blockquote"],
    [{ background: [] }, { color: [] }], // highlight support
    [{ list: "ordered" }, { list: "bullet" }],
    ["link"], // link support
    ["clean"], // remove formatting button
  ],
};

const formats = [
  "bold",
  "italic",
  "underline",
  "strike",
  "blockquote",
  "background",
  "color",
  "list",
  "bullet",
  "link",
];

export function ProjectActivityLog({ projectId }) {
  const { user } = useAuth();
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);

  // New Note State
  const [newContent, setNewContent] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  // Editing State
  const [editingId, setEditingId] = useState(null);
  const [editContent, setEditContent] = useState("");

  const fetchActivities = useCallback(async () => {
    try {
      setLoading(true);
      const data = await projectActivityService.getActivities(projectId);
      setActivities(data);
    } catch (error) {
      console.error(error);
      toast.error("Failed to load project activities");
    } finally {
      setLoading(false);
    }
  }, [projectId]);

  useEffect(() => {
    if (projectId) {
      fetchActivities();
    }
  }, [projectId, fetchActivities]);

  const handlePostNote = async () => {
    if (!newContent || newContent.trim() === "<p><br></p>") {
      toast.error("Note content cannot be empty.");
      return;
    }
    try {
      setIsSubmitting(true);
      const newLog = await projectActivityService.addActivity(
        projectId,
        newContent,
      );
      setActivities([newLog, ...activities]);
      setNewContent(""); // Reset
      setIsDrawerOpen(false); // Close drawer
      toast.success("Activity logged.");
    } catch (error) {
      console.error(error);
      toast.error("Failed to post note.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSaveEdit = async (activityId) => {
    try {
      const updatedLog = await projectActivityService.updateActivity(
        projectId,
        activityId,
        editContent,
      );
      setActivities((prev) =>
        prev.map((act) => (act.id === activityId ? updatedLog : act)),
      );
      setEditingId(null);
      setEditContent("");
      toast.success("Note updated.");
    } catch (error) {
      console.error(error);
      toast.error("Failed to update note.");
    }
  };

  const handleDelete = async (activityId) => {
    if (
      !window.confirm(
        "Are you sure you want to delete this activity log permanently?",
      )
    )
      return;
    try {
      await projectActivityService.deleteActivity(projectId, activityId);
      setActivities((prev) => prev.filter((act) => act.id !== activityId));
      toast.success("Note deleted.");
    } catch (error) {
      console.error(error);
      toast.error("Failed to delete note.");
    }
  };

  return (
    <div className="w-full pt-4">
      {/* HEADER SECTION */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 gap-4 px-2">
        <h3 className="text-xl font-bold text-text-primary dark:text-white">
          Project Activity Log
        </h3>
        <Button
          onClick={() => setIsDrawerOpen(true)}
          className="bg-primary hover:bg-primary/90 text-white flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Log Milestone
        </Button>
      </div>

      <div className="flex flex-col gap-8 w-full items-start">
        {/* ACTIVITY FEED */}
        <div className="flex-1 w-full min-w-0">
          <div className="max-h-[700px] overflow-y-auto pr-4 pb-20 custom-scrollbar pl-4">
            <div className="relative pl-5 border-l-2 border-border-light dark:border-border-dark">
              {loading ? (
                <p className="text-text-tertiary">Loading activities...</p>
              ) : activities.length === 0 ? (
                <p className="text-text-tertiary">
                  No project activities recorded yet.
                </p>
              ) : (
                <div className="space-y-6 pb-10">
                  {activities.map((log) => {
                    const isOwner = user?.id === log.user_id;
                    const isEditing = editingId === log.id;

                    return (
                      <div key={log.id} className="relative group">
                        {/* TIMELINE DOT */}
                        <div className="absolute -left-[27px] top-4 h-3 w-3 rounded-full border-2 border-white dark:border-background-dark bg-primary shadow-sm z-10 transition-transform group-hover:scale-125"></div>

                        <div className="bg-white dark:bg-surface-dark p-0 rounded-lg border border-border-light dark:border-border-dark shadow-xs hover:shadow-sm transition-shadow duration-300 overflow-hidden">
                          {/* LOG HEADER */}
                          <div className="px-4 py-2 border-b border-border-light dark:border-border-dark flex justify-between items-center bg-gray-50 dark:bg-gray-800/30">
                            <div className="flex items-center gap-2.5">
                              <Avatar
                                src={log.avatar}
                                alt={log.first_name || "System"}
                                fallback={
                                  log.first_name ? log.first_name[0] : "S"
                                }
                                className="h-7 w-7"
                              />
                              <div>
                                <p className="text-[13px] font-semibold text-text-primary dark:text-white leading-tight">
                                  {log.first_name
                                    ? `${log.first_name} ${log.last_name}`
                                    : "System Orchestrator"}
                                </p>
                                <p
                                  className="text-[10px] text-text-tertiary leading-tight mt-0.5"
                                  title={format(
                                    new Date(log.created_at),
                                    "PPpp",
                                  )}
                                >
                                  {formatDistanceToNow(
                                    new Date(log.created_at),
                                    {
                                      addSuffix: true,
                                    },
                                  )}{" "}
                                  • {format(new Date(log.created_at), "h:mm a")}
                                </p>
                              </div>
                            </div>

                            {/* ACTIONS */}
                            {isOwner && (
                              <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                {isEditing ? (
                                  <>
                                    <Button
                                      size="icon"
                                      variant="ghost"
                                      onClick={() => setEditingId(null)}
                                      className="h-7 w-7 text-text-tertiary"
                                    >
                                      <X className="h-3.5 w-3.5" />
                                    </Button>
                                    <Button
                                      size="icon"
                                      variant="ghost"
                                      onClick={() => handleSaveEdit(log.id)}
                                      className="h-7 w-7 text-success"
                                    >
                                      <Save className="h-3.5 w-3.5" />
                                    </Button>
                                  </>
                                ) : (
                                  <>
                                    <Button
                                      size="icon"
                                      variant="ghost"
                                      onClick={() => {
                                        setEditingId(log.id);
                                        setEditContent(log.content);
                                      }}
                                      className="h-7 w-7 text-text-tertiary"
                                    >
                                      <Edit2 className="h-3.5 w-3.5" />
                                    </Button>
                                    <Button
                                      size="icon"
                                      variant="ghost"
                                      onClick={() => handleDelete(log.id)}
                                      className="h-7 w-7 text-text-tertiary hover:text-error"
                                    >
                                      <Trash2 className="h-3.5 w-3.5" />
                                    </Button>
                                  </>
                                )}
                              </div>
                            )}
                          </div>

                          {/* LOG CONTENT / EDITOR */}
                          <div className="px-5 py-3 text-sm text-text-secondary dark:text-gray-300">
                            {isEditing ? (
                              <div className="quill-activity-container-edit">
                                <ReactQuill
                                  theme="snow"
                                  value={editContent}
                                  onChange={setEditContent}
                                  modules={modules}
                                  formats={formats}
                                  className="bg-white text-gray-800 border-none"
                                />
                              </div>
                            ) : (
                              <div
                                className="prose prose-sm dark:prose-invert max-w-none text-text-primary dark:text-gray-200"
                                dangerouslySetInnerHTML={{
                                  __html: log.content,
                                }}
                              />
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* RIGHT DRAWER: NEW NOTE COMPOSER */}
      <Drawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        title="Log a Milestone"
        description="Record a new activity, update, or note for this project."
        className="w-full max-w-[500px]"
      >
        <div className="flex flex-col h-full">
          <div className="bg-white dark:bg-surface-dark border border-border-light dark:border-border-dark rounded-xl shadow-sm overflow-hidden flex flex-col flex-1">
            <div className="px-4 py-3 border-b border-border-light dark:border-border-dark bg-gray-50 dark:bg-gray-800/50 flex items-center gap-2">
              <MessageSquareHeart className="w-5 h-5 text-primary" />
              <h4 className="font-semibold text-sm text-text-primary dark:text-gray-200">
                Write Note
              </h4>
            </div>
            <div className="p-0 bg-white dark:bg-surface-dark flex flex-col flex-1 relative editor-drawer-container">
              <div className="quill-activity-container absolute inset-0 overflow-y-auto">
                <ReactQuill
                  theme="snow"
                  value={newContent}
                  onChange={setNewContent}
                  modules={modules}
                  formats={formats}
                  className="bg-white text-sm text-gray-800 border-none h-full"
                  placeholder="Record note..."
                />
              </div>
            </div>
            <div className="px-5 py-4 border-t border-border-light dark:border-border-dark bg-gray-50/50 flex justify-end gap-3 shrink-0">
              <Button variant="outline" onClick={() => setIsDrawerOpen(false)}>
                Cancel
              </Button>
              <Button
                onClick={handlePostNote}
                disabled={isSubmitting}
                className="bg-primary hover:bg-primary/90 text-white min-w-[100px]"
              >
                {isSubmitting ? "Posting..." : "Post Progress"}
              </Button>
            </div>
          </div>
        </div>
      </Drawer>
    </div>
  );
}
