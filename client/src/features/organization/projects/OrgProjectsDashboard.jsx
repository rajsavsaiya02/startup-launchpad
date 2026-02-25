import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Plus,
  Search,
  LayoutGrid,
  List as ListIcon,
  ExternalLink,
  Calendar,
  Pencil,
  Clock,
  Target,
  Filter,
} from "lucide-react";
import { Button } from "../../../components/ui/Button";
import { Badge } from "../../../components/ui/Badge";
import { Card } from "../../../components/ui/Card";
import { OrgCreateProjectModal as CreateProjectModal } from "./components/OrgCreateProjectModal";
import orgProjectService from "../../../services/organization/orgProjectService";
import userService from "../../../services/userService";
import { toast } from "react-toastify";

const DEFAULT_CATEGORIES = [
  "General",
  "Development",
  "Marketing",
  "Design",
  "Research",
  "Sales",
];

const DEFAULT_STATUSES = ["Active", "Planning", "Completed", "On Hold"];

export function OrgProjectsDashboard() {
  const navigate = useNavigate();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [projectToEdit, setProjectToEdit] = useState(null);
  const [viewMode, setViewMode] = useState("grid"); // 'grid' or 'list'
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState("");
  const [activeStatus, setActiveStatus] = useState("All");
  const [activeCategory, setActiveCategory] = useState("All");

  // Dynamic Options State
  const [categories, setCategories] = useState(DEFAULT_CATEGORIES);
  const [statuses, setStatuses] = useState(DEFAULT_STATUSES);

  const fetchProjects = async () => {
    try {
      setLoading(true);
      const data = await orgProjectService.getProjects();
      setProjects(data);
    } catch (error) {
      console.error("Failed to fetch organization projects:", error);
      toast.error("Failed to load organization projects");
    } finally {
      setLoading(false);
    }
  };

  // Fetch User Preferences (Categories & Statuses)
  useEffect(() => {
    const fetchPreferences = async () => {
      try {
        const prefs = await userService.getPreferences();
        if (prefs.project_categories && prefs.project_categories.length > 0) {
          setCategories(prefs.project_categories);
        }
        if (prefs.project_statuses && prefs.project_statuses.length > 0) {
          setStatuses(prefs.project_statuses);
        }
      } catch (err) {
        console.error("Failed to fetch user preferences:", err);
      }
    };
    fetchPreferences();
  }, []);

  useEffect(() => {
    fetchProjects();
  }, []);

  // Filter Logic
  const filteredProjects = Array.isArray(projects)
    ? projects.filter((project) => {
        const matchesSearch =
          (project.title?.toLowerCase() || "").includes(
            searchQuery.toLowerCase(),
          ) ||
          (project.description?.toLowerCase() || "").includes(
            searchQuery.toLowerCase(),
          );

        const matchesStatus =
          activeStatus === "All" ||
          (project.status || "Active") === activeStatus;

        const matchesCategory =
          activeCategory === "All" ||
          (project.category || "General") === activeCategory;

        return matchesSearch && matchesStatus && matchesCategory;
      })
    : [];

  const handleEditClick = (e, project) => {
    e.stopPropagation();
    setProjectToEdit(project);
    setIsCreateModalOpen(true);
  };

  const handleCreateClick = () => {
    setProjectToEdit(null);
    setIsCreateModalOpen(true);
  };

  const handleModalClose = () => {
    setIsCreateModalOpen(false);
    setProjectToEdit(null);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-20">
      {/* Header & Controls */}
      <div className="flex flex-col gap-6">
        <div className="flex flex-col md:flex-row justify-between items-end gap-4 border-b border-border-light dark:border-border-dark pb-6">
          <div>
            <h1 className="text-3xl font-bold text-text-primary dark:text-white">
              Organization Projects
            </h1>
            <p className="text-text-secondary dark:text-gray-400 mt-1">
              Manage team initiatives, track organization progress, and
              collaborate.
            </p>
          </div>
          <Button
            className="gap-2 shadow-lg shadow-primary/20"
            onClick={handleCreateClick}
          >
            <Plus className="h-5 w-5" /> New Project
          </Button>
        </div>

        {/* Modern Filter Bar */}
        <div className="flex flex-col lg:flex-row gap-4 items-center bg-white dark:bg-[#1E293B] p-2 rounded-xl border border-border-light dark:border-gray-800 shadow-sm">
          {/* Search */}
          <div className="relative flex-1 w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-tertiary" />
            <input
              type="text"
              placeholder="Search..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-10 pl-9 pr-4 rounded-lg bg-gray-50 dark:bg-gray-800/50 border-none focus:ring-2 focus:ring-primary/20 text-sm"
            />
          </div>

          <div className="h-6 w-px bg-gray-200 dark:bg-gray-700 hidden lg:block" />

          {/* Filters Group */}
          <div className="flex w-full lg:w-auto gap-2 overflow-x-auto pb-1 lg:pb-0">
            {/* Status Filter */}
            <div className="relative min-w-[140px]">
              <select
                value={activeStatus}
                onChange={(e) => setActiveStatus(e.target.value)}
                className="w-full h-10 pl-3 pr-8 rounded-lg bg-gray-50 dark:bg-gray-800/50 border-none text-sm text-text-primary dark:text-gray-200 appearance-none cursor-pointer focus:ring-2 focus:ring-primary/20"
              >
                <option value="All">All Statuses</option>
                {statuses.map((status) => (
                  <option key={status} value={status}>
                    {status}
                  </option>
                ))}
              </select>
              <Filter className="absolute right-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-text-tertiary pointer-events-none" />
            </div>

            {/* Category Filter */}
            <div className="relative min-w-[140px]">
              <select
                value={activeCategory}
                onChange={(e) => setActiveCategory(e.target.value)}
                className="w-full h-10 pl-3 pr-8 rounded-lg bg-gray-50 dark:bg-gray-800/50 border-none text-sm text-text-primary dark:text-gray-200 appearance-none cursor-pointer focus:ring-2 focus:ring-primary/20"
              >
                <option value="All">All Categories</option>
                {categories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
              <LayoutGrid className="absolute right-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-text-tertiary pointer-events-none" />
            </div>

            {/* View Toggle */}
            <div className="flex items-center bg-gray-50 dark:bg-gray-800/50 rounded-lg p-1 ml-auto lg:ml-2">
              <button
                onClick={() => setViewMode("grid")}
                className={`p-1.5 rounded-md transition-all ${viewMode === "grid" ? "bg-white dark:bg-gray-700 text-primary shadow-sm" : "text-text-tertiary hover:text-text-primary"}`}
                title="Grid View"
              >
                <LayoutGrid className="h-4 w-4" />
              </button>
              <button
                onClick={() => setViewMode("list")}
                className={`p-1.5 rounded-md transition-all ${viewMode === "list" ? "bg-white dark:bg-gray-700 text-primary shadow-sm" : "text-text-tertiary hover:text-text-primary"}`}
                title="List View"
              >
                <ListIcon className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Projects Grid */}
      {loading ? (
        <div className="text-center py-20 text-text-secondary">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          Loading projects...
        </div>
      ) : (
        <div
          className={`grid gap-6 ${viewMode === "grid" ? "grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4" : "grid-cols-1"}`}
        >
          {filteredProjects.map((project) => (
            <div
              key={project.id}
              onDoubleClick={() => navigate(`/org/projects/${project.id}`)}
              className="group cursor-pointer"
            >
              <Card
                className={`h-full group-hover:border-primary/30 transition-all duration-300 border-border-light dark:border-gray-800 bg-white dark:bg-[#1E293B] relative overflow-hidden ${
                  viewMode === "list"
                    ? "p-4"
                    : "flex flex-col p-5 hover:shadow-xl"
                }`}
              >
                {/* LIST VIEW LAYOUT */}
                {viewMode === "list" ? (
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-center">
                    {/* 1. Project Identity (Col 4) */}
                    <div className="lg:col-span-4 flex flex-col gap-1">
                      <div className="flex items-center gap-2 mb-1">
                        <Badge
                          variant="secondary"
                          className="bg-gray-100 dark:bg-gray-800/80 text-text-secondary text-[10px] uppercase px-1.5 py-0 rounded"
                        >
                          {project.category || "General"}
                        </Badge>
                        {(project.priority === "High" ||
                          project.priority === "Critical") && (
                          <Badge
                            variant="error"
                            size="sm"
                            className="bg-red-50 text-red-600 border-red-100 px-1.5 py-0 text-[10px]"
                          >
                            {project.priority}
                          </Badge>
                        )}
                      </div>
                      <h3 className="font-bold text-text-primary dark:text-white text-base truncate pr-4 group-hover:text-primary transition-colors">
                        {project.title}
                      </h3>
                      <p className="text-xs text-text-secondary dark:text-gray-400 truncate w-full">
                        {project.description || "No description provided."}
                      </p>
                    </div>

                    {/* 2. Status (Col 2) */}
                    <div className="lg:col-span-2 flex items-center">
                      <Badge
                        variant={
                          project.status === "Active"
                            ? "success"
                            : project.status === "Planning"
                              ? "warning"
                              : "default"
                        }
                        size="sm"
                        className="capitalize px-2.5 py-1"
                      >
                        {project.status || "Active"}
                      </Badge>
                    </div>

                    {/* 3. Timeline (Col 3) */}
                    <div className="lg:col-span-3 flex flex-col gap-1.5 text-xs text-text-secondary">
                      <div className="flex items-center gap-2">
                        <Clock className="h-3.5 w-3.5 text-text-tertiary" />
                        <span className="truncate">
                          Start:{" "}
                          {project.start_date
                            ? new Date(project.start_date).toLocaleDateString()
                            : "--"}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Target className="h-3.5 w-3.5 text-text-tertiary" />
                        <span className="truncate">
                          Due:{" "}
                          {project.due_date
                            ? new Date(project.due_date).toLocaleDateString()
                            : "--"}
                        </span>
                      </div>
                    </div>

                    {/* 4. Progress (Col 2) */}
                    <div className="lg:col-span-2 w-full">
                      <div className="flex justify-between text-[10px] mb-1.5">
                        <span className="text-text-secondary">Progress</span>
                        <span className="font-medium">
                          {project.progress || 0}%
                        </span>
                      </div>
                      <div className="h-2 w-full bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full ${(project.progress || 0) >= 100 ? "bg-success" : "bg-primary"}`}
                          style={{
                            width: `${project.progress || 0}%`,
                            backgroundColor:
                              (project.progress || 0) >= 100
                                ? "var(--color-success)"
                                : "var(--color-primary)",
                          }}
                        />
                      </div>
                    </div>

                    {/* 5. Actions (Col 1) */}
                    <div className="lg:col-span-1 flex justify-end gap-2">
                      <button
                        onClick={(e) => handleEditClick(e, project)}
                        className="p-2 text-text-tertiary hover:text-primary hover:bg-gray-100 dark:hover:bg-gray-700/50 rounded-lg transition-colors"
                        title="Edit"
                      >
                        <Pencil className="h-4 w-4" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/org/projects/${project.id}`);
                        }}
                        className="p-2 text-text-tertiary hover:text-primary hover:bg-gray-100 dark:hover:bg-gray-700/50 rounded-lg transition-colors"
                        title="Open"
                      >
                        <ExternalLink className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                ) : (
                  /* GRID VIEW LAYOUT (Original Polished) */
                  <>
                    {/* Card Header: Category & Actions */}
                    <div className="flex justify-between items-start mb-4 mt-1">
                      <Badge
                        variant="secondary"
                        className="bg-gray-100 dark:bg-gray-800/80 text-text-secondary font-medium text-[11px] tracking-wide uppercase px-2 py-0.5 rounded-md"
                      >
                        {project.category || "General"}
                      </Badge>
                      <div className="flex gap-1 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={(e) => handleEditClick(e, project)}
                          className="text-text-tertiary hover:text-primary transition-colors p-1.5 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700/50"
                          title="Edit Project"
                        >
                          <Pencil className="h-3.5 w-3.5" />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/org/projects/${project.id}`);
                          }}
                          className="text-text-tertiary hover:text-primary transition-colors p-1.5 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700/50"
                          title="Open Project"
                        >
                          <ExternalLink className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>

                    {/* Title & Description */}
                    <div className="mb-5">
                      <h3 className="text-lg font-bold text-text-primary dark:text-white mb-2 leading-tight group-hover:text-primary transition-colors">
                        {project.title}
                      </h3>
                      <p className="text-sm text-text-secondary dark:text-gray-400 line-clamp-2 min-h-[40px] leading-relaxed">
                        {project.description || "No description provided."}
                      </p>
                    </div>

                    {/* Status & Priority */}
                    <div className="flex items-center gap-2 mb-6">
                      <Badge
                        variant={
                          project.status === "Active"
                            ? "success"
                            : project.status === "Planning"
                              ? "warning"
                              : "default"
                        }
                        size="sm"
                        className="capitalize font-medium px-2 py-0.5"
                      >
                        {project.status || "Active"}
                      </Badge>
                      {(project.priority === "High" ||
                        project.priority === "Critical") && (
                        <Badge
                          variant="error"
                          className="bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-300 border-red-100 dark:border-red-900/30 px-2 py-0.5"
                          size="sm"
                        >
                          {project.priority}
                        </Badge>
                      )}
                    </div>

                    {/* Progress */}
                    <div className="mb-auto">
                      <div className="flex justify-between items-center text-xs mb-2">
                        <span className="text-text-secondary font-medium">
                          Progress
                        </span>
                        <span className="text-text-primary dark:text-white font-bold bg-gray-100 dark:bg-gray-800 px-2 py-0.5 rounded-full text-[10px]">
                          {project.progress || 0}%
                        </span>
                      </div>
                      <div className="h-1.5 w-full bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-700 ease-out ${
                            (project.progress || 0) >= 100
                              ? "bg-success"
                              : "bg-primary"
                          }`}
                          style={{ width: `${project.progress || 0}%` }}
                        />
                      </div>
                    </div>

                    {/* Footer: Dates */}
                    <div className="grid grid-cols-2 gap-2 pt-4 mt-5 border-t border-border-light dark:border-gray-800/50 text-xs text-text-secondary">
                      <div
                        className="flex items-center gap-2"
                        title="Start Date"
                      >
                        <div className="p-1.5 rounded-full bg-gray-50 dark:bg-gray-800 text-text-tertiary">
                          <Clock className="h-3.5 w-3.5" />
                        </div>
                        <div className="flex flex-col">
                          <span className="text-[10px] text-text-tertiary font-medium uppercase tracking-wider">
                            Start
                          </span>
                          <span className="font-medium text-text-primary dark:text-gray-300">
                            {project.start_date
                              ? new Date(project.start_date).toLocaleDateString(
                                  undefined,
                                  {
                                    month: "short",
                                    day: "numeric",
                                    year: "numeric",
                                  },
                                )
                              : "--"}
                          </span>
                        </div>
                      </div>
                      <div
                        className="flex items-center gap-2 justify-end text-right"
                        title="Due Date"
                      >
                        <div className="flex flex-col">
                          <span className="text-[10px] text-text-tertiary font-medium uppercase tracking-wider">
                            Due
                          </span>
                          <span className="font-medium text-text-primary dark:text-gray-300">
                            {project.due_date
                              ? new Date(project.due_date).toLocaleDateString(
                                  undefined,
                                  {
                                    month: "short",
                                    day: "numeric",
                                    year: "numeric",
                                  },
                                )
                              : "--"}
                          </span>
                        </div>
                        <div className="p-1.5 rounded-full bg-gray-50 dark:bg-gray-800 text-text-tertiary">
                          <Target className="h-3.5 w-3.5" />
                        </div>
                      </div>
                    </div>
                  </>
                )}
              </Card>
            </div>
          ))}

          {/* Add New Project Card (Grid Only) */}
          {viewMode === "grid" && (
            <button
              onClick={handleCreateClick}
              className="h-full min-h-[300px] rounded-xl border border-dashed border-gray-300 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-900/20 flex flex-col items-center justify-center text-text-tertiary hover:text-primary hover:border-primary/50 hover:bg-primary/5 transition-all group duration-300 p-6"
            >
              <div className="h-16 w-16 rounded-2xl bg-white dark:bg-gray-800 flex items-center justify-center mb-4 shadow-sm group-hover:shadow-md group-hover:scale-105 transition-all ring-1 ring-gray-200 dark:ring-gray-700">
                <Plus className="h-7 w-7 text-primary" />
              </div>
              <p className="font-bold text-lg text-text-secondary dark:text-gray-300 group-hover:text-primary transition-colors">
                Create Project
              </p>
              <p className="text-sm text-text-tertiary mt-2 text-center max-w-[200px]">
                Start a new initiative and track its success.
              </p>
            </button>
          )}
        </div>
      )}

      {/* Create/Edit Modal Integration */}
      <CreateProjectModal
        isOpen={isCreateModalOpen}
        onClose={handleModalClose}
        onProjectCreated={fetchProjects}
        projectToEdit={projectToEdit}
      />
    </div>
  );
}
