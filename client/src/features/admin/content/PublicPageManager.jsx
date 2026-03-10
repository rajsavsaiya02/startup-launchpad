import React, { useEffect, useState, useCallback } from "react";
import {
  Layout,
  FileText,
  Phone,
  Info,
  Plus,
  Search,
  Filter,
  MoreVertical,
  Edit,
  Globe,
  Trash2,
  Eye,
  ArrowRight,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Card } from "../../../components/ui/Card";
import { Button } from "../../../components/ui/Button";
import { Input } from "../../../components/ui/Input";
import { cmsService } from "../../../services/cmsService";
import { useToast } from "../../../components/ui/Toast";
import { CreatePageModal } from "./CreatePageModal";
import { format } from "date-fns";

export function PublicPageManager() {
  const navigate = useNavigate();
  const { addToast } = useToast();
  const [pages, setPages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const SYSTEM_PAGES_META = {
    home: {
      title: "Home Page",
      description: "Manage hero section, features, and call-to-action blocks.",
      icon: Layout,
      color: "bg-blue-500",
    },
    about: {
      title: "About Us",
      description: "Update company history, mission, and team sections.",
      icon: Info,
      color: "bg-purple-500",
    },
    contact: {
      title: "Contact Us",
      description: "Edit contact details, form settings, and office locations.",
      icon: Phone,
      color: "bg-green-500",
    },
    "not-found": {
      title: "Page Not Found",
      description: "Custom 404 error page design and navigation options.",
      icon: Filter,
      color: "bg-amber-500",
    },
    upcoming: {
      title: "Upcoming",
      description: "Coming soon / maintenance mode page configuration.",
      icon: Layout,
      color: "bg-indigo-500",
    },
    // "navigation" removed from here as it's handled separately
  };

  const loadPages = useCallback(async () => {
    try {
      setLoading(true);
      const data = await cmsService.getPages();
      setPages(data);
    } catch (err) {
      console.error(err);
      addToast("Failed to load pages", "error");
    } finally {
      setLoading(false);
    }
  }, [addToast]);

  useEffect(() => {
    loadPages();
  }, [loadPages]);

  const handleCreate = async (values) => {
    try {
      await cmsService.createPage(values);
      addToast("Page created!", "success");
      loadPages();
    } catch (err) {
      console.error(err);
      addToast(err.response?.data?.message || "Failed to create page", "error");
    }
  };

  const handleDelete = async (id, title) => {
    if (
      !confirm(
        `Are you sure you want to delete "${title}"? This cannot be undone.`,
      )
    )
      return;
    try {
      await cmsService.deletePage(id);
      addToast("Page deleted", "success");
      loadPages();
    } catch (err) {
      console.error(err);
      addToast("Failed to delete page", "error");
    }
  };

  const handleCreateSystemPage = async (slug, title) => {
    if (confirm(`Create ${title}?`)) {
      try {
        await cmsService.createPage({ title, slug });
        addToast(`${title} created!`, "success");
        await loadPages();
      } catch (err) {
        console.error(err);
        addToast("Failed to create page", "error");
      }
    }
  };

  const handlePreview = (page) => {
    if (page.status === "published") {
      window.open(`/${page.slug}`, "_blank");
    } else {
      window.open(`/${page.slug}?preview=true&id=${page.id}`, "_blank");
    }
  };

  // Merge DB pages with System Metadata
  // 1. Get all system slugs
  const systemSlugs = Object.keys(SYSTEM_PAGES_META);

  // 2. Identify which pages are present in DB
  const mergedPages = [];
  const dbPageSlugs = new Set();

  // Add DB pages (both system and custom)
  pages.forEach((page) => {
    dbPageSlugs.add(page.slug);
    const meta = SYSTEM_PAGES_META[page.slug];
    mergedPages.push({
      ...page,
      // Use meta basics if available, otherwise fallback/keep DB values
      icon: meta?.icon || FileText,
      color: meta?.color || "bg-gray-500",
      description: meta?.description || "Custom content page.",
      isSystem: !!meta,
      exists: true,
    });
  });

  // 3. Add missing system pages
  systemSlugs.forEach((slug) => {
    if (!dbPageSlugs.has(slug)) {
      const meta = SYSTEM_PAGES_META[slug];
      mergedPages.push({
        slug,
        title: meta.title,
        description: meta.description,
        icon: meta.icon,
        color: meta.color,
        isSystem: true,
        exists: false,
        status: "Not Created",
        updated_at: null,
      });
    }
  });

  // Filter
  const finalDisplayPages = mergedPages
    .filter(
      (p) =>
        p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.slug.toLowerCase().includes(searchQuery.toLowerCase()),
    )
    .sort((a, b) => {
      // System pages first
      if (a.isSystem && !b.isSystem) return -1;
      if (!a.isSystem && b.isSystem) return 1;
      return 0;
    });

  return (
    <div className="space-y-8 animate-in fade-in duration-500 p-6 max-w-7xl mx-auto">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 border-b border-border-light dark:border-border-dark pb-6">
        <div>
          <h1 className="text-3xl font-bold text-text-primary dark:text-white tracking-tight">
            Public Page Manager
          </h1>
          <p className="text-text-secondary dark:text-gray-400 mt-2 text-lg">
            Manage all your public-facing content and navigation.
          </p>
        </div>
        <div className="flex gap-3">
          <Button
            variant="outline"
            onClick={() => navigate("/admin/communication/cms/navigation")}
          >
            <Filter className="h-4 w-4 mr-2" />
            Manage Navigation
          </Button>
          <Button
            size="lg"
            variant="primary"
            onClick={() => setIsCreateOpen(true)}
            className="shadow-lg shadow-primary/20"
          >
            <Plus className="h-5 w-5 mr-2" /> Create New Page
          </Button>
        </div>
      </div>

      {/* Search Bar */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-tertiary" />
        <Input
          placeholder="Search pages..."
          className="pl-10"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      {/* Grid of Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-6">
        {loading ? (
          [1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-64 rounded-2xl bg-gray-100 dark:bg-gray-800 animate-pulse"
            />
          ))
        ) : finalDisplayPages.length === 0 ? (
          <div className="col-span-full py-12 text-center text-text-tertiary">
            No pages found matching your search.
          </div>
        ) : (
          finalDisplayPages.map((page) => {
            const Icon = page.icon;
            return (
              <Card
                key={page.slug}
                className="group relative overflow-hidden flex flex-col h-full hover:shadow-xl hover:-translate-y-1 transition-all duration-300 border-border-light dark:border-border-dark"
              >
                {/* Preview / Top Area */}
                <div
                  className={`h-48 w-full ${page.color} bg-opacity-10 dark:bg-opacity-20 flex items-center justify-center relative overflow-hidden group-hover:bg-opacity-15 transition-all duration-300`}
                >
                  {page.exists ? (
                    <div className="w-[200%] h-[200%] transform scale-50 origin-top-left absolute top-0 left-0 pointer-events-none select-none p-4">
                      <iframe
                        src={`/${page.slug}?preview=true`}
                        className="w-full h-full border-none rounded-lg shadow-sm bg-white"
                        title={`${page.title} Preview`}
                        tabIndex="-1"
                        sandbox="allow-scripts allow-same-origin"
                        loading="lazy"
                      />
                      {/* Overlay to catch clicks */}
                      <div className="absolute inset-0 z-10" />
                    </div>
                  ) : (
                    <>
                      <div
                        className={`absolute -right-6 -top-6 w-24 h-24 rounded-full ${page.color} opacity-20 group-hover:scale-150 transition-transform duration-500`}
                      />
                      <div
                        className={`p-4 rounded-xl ${page.color} bg-opacity-20 text-${page.color.replace("bg-", "")}-600 dark:text-white mb-2 z-10`}
                      >
                        <Icon className="h-8 w-8" />
                      </div>
                    </>
                  )}

                  {/* Status Badge */}
                  <div className="absolute top-3 right-3 z-20">
                    <span
                      className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide border shadow-sm ${
                        page.status === "published"
                          ? "bg-white text-green-700 border-green-200 dark:bg-gray-900 dark:text-green-400 dark:border-green-800"
                          : page.status === "draft"
                            ? "bg-white text-amber-700 border-amber-200 dark:bg-gray-900 dark:text-amber-400 dark:border-amber-800"
                            : "bg-white text-gray-600 border-gray-200 dark:bg-gray-900 dark:text-gray-400 dark:border-gray-700"
                      }`}
                    >
                      {page.status}
                    </span>
                  </div>
                </div>

                {/* Content */}
                <div className="p-5 flex-1 flex flex-col">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="text-lg font-bold text-text-primary dark:text-white group-hover:text-primary transition-colors">
                      {page.title}
                    </h3>
                  </div>

                  <p className="text-sm text-text-secondary dark:text-gray-400 line-clamp-2 mb-4 flex-1">
                    {page.description}
                  </p>

                  <div className="flex items-center text-xs text-text-tertiary mb-4 space-x-2">
                    <span className="font-mono bg-gray-100 dark:bg-gray-800 px-1.5 py-0.5 rounded">
                      /{page.slug}
                    </span>
                    {page.updated_at && (
                      <span>
                        • {format(new Date(page.updated_at), "MMM d, yyyy")}
                      </span>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 pt-4 border-t border-border-light dark:border-border-dark mt-auto">
                    {page.exists ? (
                      <>
                        <Button
                          variant="outline"
                          size="sm"
                          className="flex-1 text-xs"
                          onClick={() =>
                            navigate(
                              `/admin/communication/cms/pages/${page.slug}`,
                            )
                          }
                        >
                          <Edit className="h-3 w-3 mr-1.5" /> Edit
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="px-2"
                          onClick={() => handlePreview(page)}
                          title="Preview"
                        >
                          <Eye className="h-4 w-4 text-text-secondary hover:text-primary" />
                        </Button>
                        {!page.isSystem && !page.is_system_page && (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="px-2 hover:bg-red-50 hover:text-red-500 dark:hover:bg-red-900/20"
                            onClick={() => handleDelete(page.id, page.title)}
                            title="Delete"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
                      </>
                    ) : (
                      <Button
                        variant="primary"
                        size="sm"
                        className="w-full"
                        onClick={() =>
                          handleCreateSystemPage(page.slug, page.title)
                        }
                      >
                        <Plus className="h-3 w-3 mr-1.5" /> Create Page
                      </Button>
                    )}
                  </div>
                </div>
              </Card>
            );
          })
        )}
      </div>

      <CreatePageModal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        onSubmit={handleCreate}
      />
    </div>
  );
}
