import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Modal, Select } from "@mantine/core"; // Added Modal import
import {
  Save,
  Plus,
  Trash2,
  ChevronRight,
  ChevronDown,
  Layout,
  Type,
  MousePointer2,
  Briefcase,
  ChevronUp,
  GripVertical,
  MoreHorizontal,
  ArrowLeft,
  AlertTriangle,
} from "lucide-react";
import { Button } from "../../../components/ui/Button";
import { Input } from "../../../components/ui/Input";
import { Card } from "../../../components/ui/Card";
import { useToast } from "../../../components/ui/Toast";
import { apiClient } from "../../../lib/axios";
import { cmsService } from "../../../services/cmsService";
import { cn } from "../../../utils/cn";

// Presets Configuration (Unchanged structure)
const PRESETS = {
  saas: {
    label: "SaaS / Tech",
    description: "Feature-rich structure with Mega Menu.",
    icon: Layout,
    structure: [
      { label: "Home", type: "link", path: "/" },
      {
        label: "Product",
        type: "mega",
        items: [
          {
            name: "Operations Hub",
            description: "Agile project management",
            icon: "LayoutDashboard",
            path: "/features",
            hash: "#operations",
            color: "text-blue-500 bg-blue-50",
          },
          {
            name: "Financial Hub",
            description: "Burn rate & expenses",
            icon: "Wallet",
            path: "/features",
            hash: "#financials",
            color: "text-green-500 bg-green-50",
          },
          {
            name: "Talent Marketplace",
            description: "Hire freelancers",
            icon: "Users",
            path: "/features",
            hash: "#talent",
            color: "text-purple-500 bg-purple-50",
          },
          {
            name: "AI Co-Pilot",
            description: "Smart insights",
            icon: "BrainCircuit",
            path: "/features",
            hash: "#ai",
            color: "text-orange-500 bg-orange-50",
          },
        ],
      },
      {
        label: "Resources",
        type: "dropdown",
        items: [
          { name: "Blog", icon: "BookOpen", path: "/blog" },
          { name: "Help Center", icon: "HelpCircle", path: "/help-center" },
          { name: "Case Studies", icon: "FileText", path: "/case-studies" },
        ],
      },

      {
        label: "Company",
        type: "dropdown",
        items: [
          { name: "About Us", icon: "Info", path: "/about" },
          { name: "Contact", icon: "Mail", path: "/contact" },
          { name: "Legal", icon: "Shield", path: "/legal" },
        ],
      },
    ],
  },
  agency: {
    label: "Agency / Creative",
    description: "Service-focused simple hierarchy.",
    icon: Briefcase,
    structure: [
      { label: "Home", type: "link", path: "/" },
      {
        label: "Services",
        type: "dropdown",
        items: [
          { name: "Design", icon: "PenTool", path: "/services/design" },
          { name: "Development", icon: "Code", path: "/services/dev" },
          { name: "Marketing", icon: "Megaphone", path: "/services/marketing" },
        ],
      },
      { label: "Our Work", type: "link", path: "/work" },
      { label: "About", type: "link", path: "/about" },
      { label: "Contact", type: "link", path: "/contact" },
    ],
  },
  minimal: {
    label: "Minimal / Personal",
    description: "Clean, flat list of links.",
    icon: MousePointer2,
    structure: [
      { label: "Home", type: "link", path: "/" },
      { label: "Blog", type: "link", path: "/blog" },
      { label: "Projects", type: "link", path: "/projects" },
      { label: "Contact", type: "link", path: "/contact" },
    ],
  },
};

export function NavigationManager() {
  const navigate = useNavigate();
  const { addToast } = useToast();
  const [menuItems, setMenuItems] = useState([]);
  const [homepageSlug, setHomepageSlug] = useState("");
  const [availablePages, setAvailablePages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [expandedItems, setExpandedItems] = useState({});
  const [showPresets, setShowPresets] = useState(false);

  // Modal State
  const [confirmModal, setConfirmModal] = useState({
    isOpen: false,
    title: "",
    message: "",
    onConfirm: null,
    confirmLabel: "Confirm",
    isDanger: false,
  });

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const [settingsRes, pagesRes] = await Promise.all([
        apiClient.get("/settings"),
        cmsService.getPages(),
      ]);

      const remoteMenu = settingsRes.data.navigation_menu;
      if (Array.isArray(remoteMenu) && remoteMenu.length > 0) {
        setMenuItems(remoteMenu);
      } else {
        setMenuItems(PRESETS.saas.structure);
      }

      setHomepageSlug(settingsRes.data.homepage_slug || "");
      setAvailablePages(pagesRes);
    } catch (err) {
      console.error(err);
      addToast("Failed to load settings", "error");
    } finally {
      setLoading(false);
    }
  }, [addToast]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const urlOptions = availablePages.map((page) => {
    const isHome = ["home", "homepage", "home-page"].includes(
      page.slug.toLowerCase(),
    );
    return {
      value: isHome ? "/" : `/${page.slug}`,
      label: page.title || page.slug,
    };
  });

  const handleSave = async () => {
    try {
      setSaving(true);
      await apiClient.put("/settings/navigation", {
        navigation_menu: menuItems,
        homepage_slug: homepageSlug,
      });
      addToast("Navigation saved successfully!", "success");
    } catch (err) {
      console.error(err);
      addToast("Failed to save settings", "error");
    } finally {
      setSaving(false);
    }
  };

  // Helper to close modal
  const closeConfirm = () =>
    setConfirmModal((prev) => ({ ...prev, isOpen: false }));

  const applyPreset = (key) => {
    setConfirmModal({
      isOpen: true,
      title: `Load ${PRESETS[key].label} Preset?`,
      message:
        "This will completely replace your current navigation structure. This action cannot be undone.",
      confirmLabel: "Load Preset",
      isDanger: true,
      onConfirm: () => {
        setMenuItems(PRESETS[key].structure);
        addToast(`Applied ${PRESETS[key].label} preset`, "success");
        setShowPresets(false);
        closeConfirm();
        // Reset expanded items to avoid confusion with new structure
        setExpandedItems({});
      },
    });
  };

  const toggleExpand = (index) => {
    setExpandedItems((prev) => ({ ...prev, [index]: !prev[index] }));
  };

  const updateItem = (index, field, value) => {
    const newItems = [...menuItems];
    newItems[index] = { ...newItems[index], [field]: value };
    setMenuItems(newItems);
  };

  const updateSubItem = (parentIndex, subIndex, field, value) => {
    const newItems = [...menuItems];
    if (!newItems[parentIndex].items) newItems[parentIndex].items = [];
    newItems[parentIndex].items[subIndex] = {
      ...newItems[parentIndex].items[subIndex],
      [field]: value,
    };
    setMenuItems(newItems);
  };

  const addTopLevelItem = () => {
    const newItem = { label: "New Link", type: "link", path: "/" };
    const newItems = [...menuItems, newItem];
    setMenuItems(newItems);
    // Expand the new item
    setExpandedItems((prev) => ({ ...prev, [newItems.length - 1]: true }));
  };

  const removeTopLevelItem = (index, e) => {
    e.stopPropagation();
    setConfirmModal({
      isOpen: true,
      title: "Remove Menu Item?",
      message:
        "Are you sure you want to remove this item and all its sub-links? This cannot be undone.",
      confirmLabel: "Remove",
      isDanger: true,
      onConfirm: () => {
        const newItems = [...menuItems];
        newItems.splice(index, 1);
        setMenuItems(newItems);
        closeConfirm();
      },
    });
  };

  const addSubItem = (parentIndex) => {
    const newItems = [...menuItems];
    if (!newItems[parentIndex].items) newItems[parentIndex].items = [];

    newItems[parentIndex].items.push({
      name: "New Item",
      path: "/",
      icon: "",
      description:
        newItems[parentIndex].type === "mega" ? "Short description" : "",
    });
    setMenuItems(newItems);
  };

  const removeSubItem = (parentIndex, subIndex) => {
    // For sub-items, we can just remove them mostly without confirmation as it's a small action,
    // but to be safe and consistent with "ignore alerts", let's be instant or use modal if dangerous.
    // User asked to "ignore alter" (ignore alert), likely meaning REPLACE alert with modal.
    // For sub-items, direct removal is usually better UX than confirming every click.
    // But let's stick to the pattern for consistency if user wants "modal like thing".
    // Actually, deleting a sub-item is easily re-addable. I'll make it instant for speed, or modal?
    // Let's use modal for consistency since user complained about alerts/interaction.

    /* 
           Actually, frequent sub-item deletion with modal is annoying. 
           I'll keep it instant for sub-items as it's a minor action, 
           but strictly use modal for the big actions (Top Level Delete, Reset).
        */
    const newItems = [...menuItems];
    if (newItems[parentIndex].items) {
      newItems[parentIndex].items.splice(subIndex, 1);
      setMenuItems(newItems);
    }
  };

  const moveSubItem = (parentIndex, subIndex, direction) => {
    const newItems = [...menuItems];
    const items = newItems[parentIndex].items;
    if (!items) return;

    const newIndex = subIndex + direction;
    if (newIndex >= 0 && newIndex < items.length) {
      // Swap
      [items[subIndex], items[newIndex]] = [items[newIndex], items[subIndex]];
      setMenuItems(newItems);
    }
  };

  const moveTopLevelItem = (index, direction, e) => {
    e.stopPropagation();
    const newItems = [...menuItems];
    const newIndex = index + direction;
    if (newIndex >= 0 && newIndex < newItems.length) {
      // Swap
      [newItems[index], newItems[newIndex]] = [
        newItems[newIndex],
        newItems[index],
      ];
      setExpandedItems({});
      setMenuItems(newItems);
    }
  };

  if (loading)
    return (
      <div className="p-12 text-center text-text-tertiary">
        Loading configuration...
      </div>
    );

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-8 animate-in fade-in">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center border-b border-border-light dark:border-border-dark pb-6 gap-4">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate("/admin/communication/cms")}
            className="rounded-full h-10 w-10 hover:bg-gray-100 dark:hover:bg-gray-800"
          >
            <ArrowLeft className="h-6 w-6 text-text-secondary" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-text-primary dark:text-white">
              Public Page Navigation
            </h1>
            <p className="text-text-secondary mt-1">
              Configure your site's main navigation structure.
            </p>
          </div>
        </div>
        <div className="flex gap-3">
          <div className="relative group">
            <Button
              variant="outline"
              onClick={() => setShowPresets(!showPresets)}
              disabled={saving}
            >
              Load Preset
            </Button>
            {showPresets && (
              <div className="absolute right-0 mt-2 w-72 bg-white dark:bg-surface-dark rounded-xl shadow-xl border border-border-light dark:border-border-dark z-50 p-2">
                <div className="text-xs font-bold text-text-tertiary uppercase px-3 py-2">
                  Select Structure
                </div>
                {Object.entries(PRESETS).map(([key, preset]) => (
                  <button
                    key={key}
                    onClick={() => applyPreset(key)}
                    className="w-full text-left flex items-start gap-3 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                  >
                    <div className="p-2 rounded-md bg-primary/10 text-primary">
                      <preset.icon className="h-4 w-4" />
                    </div>
                    <div>
                      <div className="font-semibold text-sm text-text-primary dark:text-white">
                        {preset.label}
                      </div>
                      <div className="text-xs text-text-secondary">
                        {preset.description}
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
          <Button
            variant="primary"
            onClick={handleSave}
            disabled={saving}
            className="shadow-lg shadow-primary/20"
          >
            {saving ? "Saving..." : "Save Changes"}
            <Save className="h-4 w-4 ml-2" />
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Main Menu Editor - Takes up more space now */}
        <div className="lg:col-span-8 space-y-6">
          <div className="flex justify-between items-center px-1">
            <h3 className="font-bold text-lg text-text-primary dark:text-white">
              Menu Structure
            </h3>
            <Button
              size="sm"
              variant="ghost"
              onClick={addTopLevelItem}
              className="text-primary hover:bg-primary/10"
            >
              <Plus className="h-4 w-4 mr-1" /> Add Top-Level Item
            </Button>
          </div>

          <div className="space-y-4">
            {menuItems.map((item, index) => (
              <Card
                key={index}
                className={cn(
                  "overflow-hidden border transition-all duration-200",
                  expandedItems[index]
                    ? "border-primary/50 shadow-md"
                    : "border-border-light dark:border-border-dark bg-white dark:bg-surface-dark hover:shadow-sm",
                )}
              >
                <div
                  onClick={() => toggleExpand(index)}
                  className="p-3 pl-2 flex items-center gap-3 bg-gray-50/50 dark:bg-gray-800/50 border-b border-transparent cursor-pointer select-none"
                >
                  <div className="flex flex-col gap-0.5 text-text-tertiary/50 hover:text-text-primary p-1">
                    <button
                      onClick={(e) => moveTopLevelItem(index, -1, e)}
                      disabled={index === 0}
                      className="hover:text-primary disabled:opacity-0"
                    >
                      <ChevronUp className="h-3 w-3" />
                    </button>
                    <GripVertical className="h-4 w-4" />
                    <button
                      onClick={(e) => moveTopLevelItem(index, 1, e)}
                      disabled={index === menuItems.length - 1}
                      className="hover:text-primary disabled:opacity-0"
                    >
                      <ChevronDown className="h-3 w-3" />
                    </button>
                  </div>

                  <div
                    className="flex-1 grid grid-cols-12 gap-4 items-center"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <div className="col-span-7 sm:col-span-6">
                      <Input
                        value={item.label}
                        onChange={(e) =>
                          updateItem(index, "label", e.target.value)
                        }
                        placeholder="Label"
                        className="h-9 font-medium bg-white dark:bg-background-dark focus:ring-1"
                      />
                    </div>
                    <div className="col-span-5 sm:col-span-4">
                      <select
                        value={item.type}
                        onChange={(e) =>
                          updateItem(index, "type", e.target.value)
                        }
                        className="w-full h-9 rounded-md border border-border-light dark:border-border-dark bg-white dark:bg-background-dark text-sm px-2 focus:outline-none focus:ring-1 focus:ring-primary/20"
                      >
                        <option value="link">Link</option>
                        <option value="dropdown">Dropdown</option>
                        <option value="mega">Mega Menu</option>
                      </select>
                    </div>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleExpand(index);
                      }}
                      className="p-1.5 text-text-secondary hover:bg-gray-200 dark:hover:bg-gray-700 rounded-md transition-colors"
                    >
                      {expandedItems[index] ? (
                        <ChevronUp className="h-4 w-4" />
                      ) : (
                        <ChevronDown className="h-4 w-4" />
                      )}
                    </button>
                    <button
                      onClick={(e) => removeTopLevelItem(index, e)}
                      className="p-1.5 text-text-tertiary hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/10 rounded-md transition-all"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                {/* Expanded Content */}
                {expandedItems[index] && (
                  <div className="p-4 bg-white dark:bg-surface-dark animate-in slide-in-from-top-1">
                    {item.type === "link" ? (
                      <div className="flex flex-col gap-2 p-2 bg-gray-50/50 dark:bg-gray-800/20 rounded-lg">
                        <label className="text-xs font-bold uppercase tracking-wider text-text-tertiary">
                          Destination URL
                        </label>
                        <div className="flex gap-2 items-center w-full">
                          <Select
                            value={item.path}
                            onChange={(val) => updateItem(index, "path", val)}
                            data={urlOptions}
                            placeholder="/about or https://..."
                            searchable
                            creatable
                            getCreateLabel={(query) => `+ Use "${query}"`}
                            onCreate={(query) => {
                              const item = { value: query, label: query };
                              return item;
                            }}
                            className="flex-1"
                            styles={{
                              input: {
                                height: "36px",
                                fontSize: "14px",
                                fontFamily: "monospace",
                              },
                            }}
                          />
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        <div className="flex justify-between items-end border-b border-border-light dark:border-gray-800 pb-2">
                          <div>
                            <label className="text-xs font-bold uppercase tracking-wider text-text-tertiary">
                              Sub-Items
                            </label>
                            <p className="text-[10px] text-text-tertiary mt-0.5">
                              Manage the links inside this menu.
                            </p>
                          </div>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => addSubItem(index)}
                            className="h-7 text-xs"
                          >
                            <Plus className="h-3 w-3 mr-1" /> Add Sub-Item
                          </Button>
                        </div>

                        <div className="space-y-1">
                          {(!item.items || item.items.length === 0) && (
                            <div className="text-center py-6 border-2 border-dashed border-border-light dark:border-gray-800 rounded-lg bg-gray-50/30">
                              <p className="text-text-tertiary text-sm mb-2">
                                This menu is empty.
                              </p>
                              <Button
                                size="sm"
                                variant="ghost"
                                className="text-primary h-auto p-0 hover:bg-transparent hover:underline"
                                onClick={() => addSubItem(index)}
                              >
                                Add the first item
                              </Button>
                            </div>
                          )}

                          {/* Compact Sub-Item Table Header */}
                          {item.items && item.items.length > 0 && (
                            <div className="grid grid-cols-12 gap-2 text-[10px] font-bold text-text-tertiary uppercase tracking-wider px-2 pb-1">
                              <div className="col-span-1">Sort</div>
                              <div className="col-span-3">Name</div>
                              <div className="col-span-3">Path</div>
                              <div className="col-span-2">Icon</div>
                              <div className="col-span-2">
                                {item.type === "mega" ? "Desc" : ""}
                              </div>
                              <div className="col-span-1 text-right">
                                Action
                              </div>
                            </div>
                          )}

                          {item.items?.map((subItem, subIndex) => (
                            <div
                              key={subIndex}
                              className="group relative grid grid-cols-12 gap-2 items-center p-2 rounded-md hover:bg-gray-50 dark:hover:bg-gray-800 border border-transparent hover:border-gray-200 dark:hover:border-gray-700 transition-all"
                            >
                              {/* Sort Controls */}
                              <div className="col-span-1 flex flex-col justify-center gap-0.5">
                                <button
                                  onClick={() =>
                                    moveSubItem(index, subIndex, -1)
                                  }
                                  disabled={subIndex === 0}
                                  className="text-text-tertiary hover:text-primary disabled:opacity-10 h-3 w-3 flex items-center justify-center"
                                >
                                  <ChevronUp className="h-3 w-3" />
                                </button>
                                <button
                                  onClick={() =>
                                    moveSubItem(index, subIndex, 1)
                                  }
                                  disabled={subIndex === item.items.length - 1}
                                  className="text-text-tertiary hover:text-primary disabled:opacity-10 h-3 w-3 flex items-center justify-center"
                                >
                                  <ChevronDown className="h-3 w-3" />
                                </button>
                              </div>

                              <div className="col-span-3">
                                <Input
                                  value={subItem.name}
                                  onChange={(e) =>
                                    updateSubItem(
                                      index,
                                      subIndex,
                                      "name",
                                      e.target.value,
                                    )
                                  }
                                  placeholder="Name"
                                  className="h-8 text-sm px-2 bg-transparent focus:bg-white dark:focus:bg-black border-transparent focus:border-primary/30 transition-all"
                                />
                              </div>

                              <div className="col-span-3">
                                <Select
                                  value={subItem.path}
                                  onChange={(val) =>
                                    updateSubItem(index, subIndex, "path", val)
                                  }
                                  data={urlOptions}
                                  placeholder="/path"
                                  searchable
                                  creatable
                                  getCreateLabel={(query) => `+ Use "${query}"`}
                                  onCreate={(query) => {
                                    const item = { value: query, label: query };
                                    return item;
                                  }}
                                  styles={{
                                    input: {
                                      height: "32px",
                                      fontSize: "12px",
                                      fontFamily: "monospace",
                                      backgroundColor: "transparent",
                                      border: "1px solid transparent",
                                    },
                                  }}
                                />
                              </div>

                              <div className="col-span-2">
                                <Input
                                  value={subItem.icon}
                                  onChange={(e) =>
                                    updateSubItem(
                                      index,
                                      subIndex,
                                      "icon",
                                      e.target.value,
                                    )
                                  }
                                  placeholder="Icon"
                                  className="h-8 text-xs px-2 bg-transparent focus:bg-white dark:focus:bg-black border-transparent focus:border-primary/30 transition-all"
                                />
                              </div>

                              <div className="col-span-2">
                                {item.type === "mega" ? (
                                  <Input
                                    value={subItem.description}
                                    onChange={(e) =>
                                      updateSubItem(
                                        index,
                                        subIndex,
                                        "description",
                                        e.target.value,
                                      )
                                    }
                                    placeholder="Desc..."
                                    className="h-8 text-xs px-2 bg-transparent focus:bg-white dark:focus:bg-black border-transparent focus:border-primary/30 transition-all"
                                  />
                                ) : (
                                  <span className="text-xs text-text-tertiary italic pl-2 opacity-50">
                                    N/A
                                  </span>
                                )}
                              </div>

                              <div className="col-span-1 text-right">
                                <button
                                  onClick={() => removeSubItem(index, subIndex)}
                                  className="p-1.5 text-text-tertiary hover:text-red-500 hover:bg-red-50 rounded transition-colors opacity-0 group-hover:opacity-100"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </Card>
            ))}
          </div>
        </div>

        {/* Sidebar Config */}
        <div className="lg:col-span-4 space-y-6">
          <Card className="p-6 bg-white dark:bg-surface-dark border border-border-light dark:border-border-dark h-fit sticky top-6 shadow-sm">
            <h3 className="font-bold text-lg mb-6 flex items-center gap-2">
              <Layout className="h-5 w-5 text-primary" />
              Settings
            </h3>

            <div className="space-y-6">
              <div>
                <label className="block text-sm font-semibold mb-2">
                  Homepage Routing
                </label>
                <select
                  className="w-full bg-background-light dark:bg-background-dark border border-border-light dark:border-border-dark rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-primary/20 focus:outline-none transition-all"
                  value={homepageSlug}
                  onChange={(e) => setHomepageSlug(e.target.value)}
                >
                  <option value="">Default (Landing Page)</option>
                  {availablePages.map((page) => (
                    <option key={page.id} value={page.slug}>
                      {page.title}
                    </option>
                  ))}
                </select>
                <p className="text-xs text-text-secondary mt-2 leading-relaxed">
                  Select which page is served at <code>/</code>.
                </p>
              </div>

              <div className="pt-6 border-t border-border-light dark:border-border-dark">
                <label className="block text-sm font-semibold mb-2">
                  Icons
                </label>
                <div className="bg-blue-50 dark:bg-blue-900/10 rounded-lg p-3 text-xs text-text-secondary border border-blue-100 dark:border-blue-900/20">
                  <p className="mb-1 font-medium text-blue-800 dark:text-blue-300">
                    How to use icons:
                  </p>
                  <ul className="list-disc pl-4 space-y-1">
                    <li>
                      Use <strong>PascalCase</strong> names (e.g.,{" "}
                      <code>Home</code>, <code>ShoppingBag</code>).
                    </li>
                    <li>
                      Leave empty for no icon (default bullet will appear).
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>

      {/* Confirmation Modal */}
      <Modal
        opened={confirmModal.isOpen}
        onClose={closeConfirm}
        title={confirmModal.title}
        centered
        className="dark:text-white"
        styles={{
          header: { backgroundColor: "transparent" },
          body: { padding: "20px" },
          content: { backgroundColor: "var(--mantine-color-body)" },
        }}
      >
        <div className="flex flex-col gap-4">
          <div className="flex items-start gap-4">
            {confirmModal.isDanger && (
              <div className="p-3 bg-red-100 text-red-600 rounded-full">
                <AlertTriangle className="h-6 w-6" />
              </div>
            )}
            <p className="text-text-secondary pt-1">{confirmModal.message}</p>
          </div>
          <div className="flex justify-end gap-3 mt-4">
            <Button variant="ghost" onClick={closeConfirm}>
              Cancel
            </Button>
            <Button
              variant={confirmModal.isDanger ? "destructive" : "primary"}
              onClick={confirmModal.onConfirm}
            >
              {confirmModal.confirmLabel || "Confirm"}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
