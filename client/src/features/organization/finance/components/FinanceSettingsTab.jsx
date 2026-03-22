import React, { useState, useEffect } from "react";
import { Card } from "../../../../components/ui/Card";
import { Button } from "../../../../components/ui/Button";
import { Input } from "../../../../components/ui/Input";
import { apiClient } from "../../../../lib/axios";
import { toast } from "react-toastify";
import { Save, Plus, WalletCards, Building2, Trash2, Tag, Layers } from "lucide-react";

export function FinanceSettingsTab() {
  const [profile, setProfile] = useState(null);
  const [categories, setCategories] = useState([]);
  const [classifications, setClassifications] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // Compliance Fields
  const [complianceFields, setComplianceFields] = useState([]);
  const [newFieldName, setNewFieldName] = useState("");
  const [newFieldValue, setNewFieldValue] = useState("");

  // New Classification State
  const [newClassName, setNewClassName] = useState("");
  const [newClassRootType, setNewClassRootType] = useState("EXPENSE");
  const [isAddingClass, setIsAddingClass] = useState(false);

  // New Category State
  const [newCatName, setNewCatName] = useState("");
  const [newCatClassId, setNewCatClassId] = useState("");
  const [isAddingCat, setIsAddingCat] = useState(false);

  useEffect(() => {
    fetchConfig();
  }, []);

  const fetchConfig = async () => {
    try {
      setIsLoading(true);
      const res = await apiClient.get("/org/finances/config");
      if (res.data && res.data.profile) {
        setProfile(res.data.profile);
        setCategories(res.data.categories || []);
        setClassifications(res.data.classifications || []);
        setComplianceFields(res.data.profile.compliance_fields || []);
        
        if (res.data.classifications && res.data.classifications.length > 0) {
          setNewCatClassId(res.data.classifications[0].id.toString());
        }
      } else {
        console.error("Config data missing in response:", res.data);
      }
    } catch (error) {
      console.error("Failed to fetch financial config:", error);
      toast.error("Failed to load financial settings");
    } finally {
      setIsLoading(false);
    }
  };

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    try {
      setIsSaving(true);
      const updatedProfile = { ...profile, compliance_fields: complianceFields };
      const res = await apiClient.put("/org/finances/config", updatedProfile);
      setProfile(res.data.profile);
      setComplianceFields(res.data.profile.compliance_fields || []);
      toast.success("Settings updated successfully");
    } catch (error) {
      console.error("Config update failed:", error);
      toast.error("Failed to update settings");
    } finally {
      setIsSaving(false);
    }
  };

  const handleAddComplianceField = () => {
    if (!newFieldName.trim()) return;
    setComplianceFields([
      ...complianceFields,
      { id: Date.now().toString(), title: newFieldName.trim(), value: newFieldValue.trim() },
    ]);
    setNewFieldName("");
    setNewFieldValue("");
  };

  const handleRemoveComplianceField = (id) => {
    setComplianceFields(complianceFields.filter((f) => f.id !== id));
  };

  const handleUpdateComplianceFieldValue = (id, val) => {
    setComplianceFields(complianceFields.map((f) => (f.id === id ? { ...f, value: val } : f)));
  };

  const handleAddClassification = async (e) => {
    e.preventDefault();
    if (!newClassName) return;

    try {
      setIsAddingClass(true);
      const res = await apiClient.post("/org/finances/classifications", {
        name: newClassName,
        root_type: newClassRootType,
      });
      const newClass = res.data.classification;
      setClassifications([...classifications, newClass].sort((a, b) => a.name.localeCompare(b.name)));
      setNewClassName("");
      if (!newCatClassId) setNewCatClassId(newClass.id.toString());
      toast.success("Classification added");
    } catch (error) {
      console.error("Add classification failed:", error);
      toast.error("Failed to add classification");
    } finally {
      setIsAddingClass(false);
    }
  };

  const handleDeleteClassification = async (id) => {
    if (!window.confirm("Are you sure? This will delete the classification, its categories, and reassign their transactions to 'General'.")) return;
    try {
      await apiClient.delete(`/org/finances/classifications/${id}`);
      setClassifications(classifications.filter((c) => c.id !== id));
      setCategories(categories.filter((c) => c.classification_id !== id));
      toast.success("Classification deleted");
    } catch (error) {
      console.error(error);
      toast.error("Failed to delete classification");
    }
  };

  const handleAddCategory = async (e) => {
    e.preventDefault();
    if (!newCatName || !newCatClassId) return;

    try {
      setIsAddingCat(true);
      const res = await apiClient.post("/org/finances/categories", {
        name: newCatName,
        classification_id: parseInt(newCatClassId),
        description: "",
      });
      // the new category from backend might not have root_type joined, so let's find it locally
      const parentClass = classifications.find(c => c.id === parseInt(newCatClassId));
      
      const newCat = { ...res.data.category, root_type: parentClass?.root_type };
      setCategories([...categories, newCat].sort((a, b) => a.name.localeCompare(b.name)));
      setNewCatName("");
      toast.success("Category added");
    } catch (error) {
      console.error("Add category failed:", error);
      toast.error("Failed to add category");
    } finally {
      setIsAddingCat(false);
    }
  };

  const handleDeleteCategory = async (id) => {
    if (!window.confirm("Are you sure? Transactions using this category will be reassigned to 'General'.")) return;
    try {
      await apiClient.delete(`/org/finances/categories/${id}`);
      setCategories(categories.filter((c) => c.id !== id));
      toast.success("Category deleted");
    } catch (error) {
      console.error(error);
      toast.error("Failed to delete category");
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-12">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  // Group classes by root type
  const groupedClasses = {
    ASSET: classifications.filter((c) => c.root_type === "ASSET"),
    LIABILITY: classifications.filter((c) => c.root_type === "LIABILITY"),
    EQUITY: classifications.filter((c) => c.root_type === "EQUITY"),
    REVENUE: classifications.filter((c) => c.root_type === "REVENUE" || c.root_type === "INCOME"),
    EXPENSE: classifications.filter((c) => c.root_type === "EXPENSE"),
  };

  return (
    <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
      {/* Left Column: Organization Configuration */}
      <div className="xl:col-span-1 space-y-6">
        <Card className="p-6">
          <div className="flex items-center gap-3 mb-4 text-text-primary dark:text-white">
            <Building2 className="w-5 h-5 text-primary" />
            <h3 className="text-lg font-semibold">Compliance & Config</h3>
          </div>
          <p className="text-sm text-text-secondary mb-6">
            Configure compliance fields (like GST mapping, License Number) for accurate financial reporting.
          </p>

          <form onSubmit={handleProfileUpdate} className="space-y-6">
            <div className="space-y-4">
              <label className="flex items-center gap-2 cursor-pointer mb-2">
                <input
                  type="checkbox"
                  className="rounded text-primary focus:ring-primary border-gray-300 dark:border-gray-600 dark:bg-gray-700"
                  checked={profile?.gst_registered || false}
                  onChange={(e) =>
                    setProfile({ ...profile, gst_registered: e.target.checked })
                  }
                />
                <span className="text-sm font-medium text-text-primary dark:text-white">
                  GST / VAT Registered
                </span>
              </label>

              {profile?.gst_registered && (
                <div className="animate-in fade-in slide-in-from-top-2">
                  <Input
                    label="GSTIN / VAT Number"
                    placeholder="e.g. 29ABCDE1234F1Z5"
                    value={profile?.gstin || ""}
                    onChange={(e) =>
                      setProfile({ ...profile, gstin: e.target.value })
                    }
                  />
                </div>
              )}
            </div>

            <hr className="border-border-light dark:border-border-dark" />

            {/* Dynamic Compliance Fields */}
            <div>
              <h4 className="text-sm font-semibold text-text-primary dark:text-white mb-3">Custom Compliance Fields</h4>
              
              <div className="space-y-3 mb-4">
                {complianceFields.map((field) => (
                  <div key={field.id} className="flex gap-2 items-center">
                    <div className="flex-1">
                      <Input
                        value={field.value}
                        onChange={(e) => handleUpdateComplianceFieldValue(field.id, e.target.value)}
                        placeholder={`Value for ${field.title}`}
                        label={field.title}
                      />
                    </div>
                    <Button
                      variant="ghost"
                      type="button"
                      size="sm"
                      onClick={() => handleRemoveComplianceField(field.id)}
                      className="mt-6 text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-500/10"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
                {complianceFields.length === 0 && (
                  <p className="text-xs text-text-tertiary">No custom compliance fields added.</p>
                )}
              </div>

              {/* Add new field form */}
              <div className="flex gap-2 items-end pt-2 bg-gray-50 dark:bg-gray-800/50 p-3 rounded-lg border border-border-light dark:border-border-dark">
                <div className="flex-1">
                  <Input
                    label="Field Title"
                    placeholder="e.g. Legal Entity Name"
                    value={newFieldName}
                    onChange={(e) => setNewFieldName(e.target.value)}
                  />
                </div>
                <div className="flex-1">
                  <Input
                    label="Default Value"
                    placeholder="Optional"
                    value={newFieldValue}
                    onChange={(e) => setNewFieldValue(e.target.value)}
                  />
                </div>
                <Button
                  type="button"
                  variant="secondary"
                  onClick={handleAddComplianceField}
                  disabled={!newFieldName.trim()}
                >
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
            </div>

            <Button
              type="submit"
              disabled={isSaving}
              className="w-full flex justify-center gap-2 mt-4"
            >
              <Save className="w-4 h-4" />
              {isSaving ? "Saving..." : "Save Configuration"}
            </Button>
          </form>
        </Card>
      </div>

      {/* Right Column: Chart of Accounts */}
      <div className="xl:col-span-2 space-y-6">
        <Card className="p-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <div className="flex items-center gap-3 text-text-primary dark:text-white">
              <WalletCards className="w-5 h-5 text-primary" />
              <h3 className="text-lg font-semibold">Chart of Accounts</h3>
            </div>
          </div>

          <p className="text-sm text-text-secondary mb-6">
            Organize transactions into a two-level hierarchy based on the 5 core Accounting Principles.
            <strong>Account Types</strong> (e.g., Asset) group <strong>Classifications</strong> (e.g., Current Assets), which in turn hold your specific <strong>Categories</strong> (e.g., Cash in Bank).
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            {/* Add New Classification */}
            <form
              onSubmit={handleAddClassification}
              className="flex flex-col gap-3 p-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl border border-border-light dark:border-border-dark"
            >
              <h4 className="text-sm font-semibold flex items-center gap-2"><Layers className="w-4 h-4 text-primary"/> Add Classification</h4>
              <Input
                label="Classification Name"
                placeholder="e.g. Current Assets or Cost of Goods Sold"
                value={newClassName}
                onChange={(e) => setNewClassName(e.target.value)}
                required
              />
              <div>
                <label className="block text-sm font-medium text-text-secondary mb-1">
                  Account Type
                </label>
                <select
                  className="w-full h-10 px-3 py-2 bg-white dark:bg-gray-900 text-sm border outline-none rounded-lg border-border-light dark:border-border-dark text-text-primary dark:text-white focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors"
                  value={newClassRootType}
                  onChange={(e) => setNewClassRootType(e.target.value)}
                >
                  <option value="ASSET">Asset</option>
                  <option value="LIABILITY">Liability</option>
                  <option value="EQUITY">Equity</option>
                  <option value="REVENUE">Income / Revenue</option>
                  <option value="EXPENSE">Expense</option>
                </select>
              </div>
              <Button type="submit" disabled={isAddingClass || !newClassName} className="w-full flex items-center justify-center gap-2 mt-1">
                <Plus className="w-4 h-4" /> Create Classification
              </Button>
            </form>

            {/* Add New Category */}
            <form
              onSubmit={handleAddCategory}
              className="flex flex-col gap-3 p-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl border border-border-light dark:border-border-dark"
            >
              <h4 className="text-sm font-semibold flex items-center gap-2"><Tag className="w-4 h-4 text-primary"/> Add Category</h4>
              <Input
                label="Category Name"
                placeholder="e.g. Stripe Account or Hosting Fees"
                value={newCatName}
                onChange={(e) => setNewCatName(e.target.value)}
                required
              />
              <div>
                <label className="block text-sm font-medium text-text-secondary mb-1">
                  Parent Classification
                </label>
                <select
                  className="w-full h-10 px-3 py-2 bg-white dark:bg-gray-900 text-sm border outline-none rounded-lg border-border-light dark:border-border-dark text-text-primary dark:text-white focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors"
                  value={newCatClassId}
                  onChange={(e) => setNewCatClassId(e.target.value)}
                  required
                >
                  {classifications.length === 0 && <option value="" disabled>No classifications exist</option>}
                  {classifications.map(c => (
                    <option key={c.id} value={c.id}>{c.name} ({c.root_type})</option>
                  ))}
                </select>
              </div>
              <Button type="submit" disabled={isAddingCat || !newCatName || !newCatClassId} className="w-full flex items-center justify-center gap-2 mt-1">
                <Plus className="w-4 h-4" /> Add Category
              </Button>
            </form>
          </div>

          <hr className="border-border-light dark:border-border-dark mb-6" />

          {/* Render grouped by Account Types */}
          <div className="space-y-8">
            <ClassificationGroup title="Assets" classes={groupedClasses.ASSET} allCategories={categories} onDeleteCls={handleDeleteClassification} onDeleteCat={handleDeleteCategory} />
            <ClassificationGroup title="Liabilities" classes={groupedClasses.LIABILITY} allCategories={categories} onDeleteCls={handleDeleteClassification} onDeleteCat={handleDeleteCategory} />
            <ClassificationGroup title="Equity" classes={groupedClasses.EQUITY} allCategories={categories} onDeleteCls={handleDeleteClassification} onDeleteCat={handleDeleteCategory} />
            <ClassificationGroup title="Income / Revenue" classes={groupedClasses.REVENUE} allCategories={categories} onDeleteCls={handleDeleteClassification} onDeleteCat={handleDeleteCategory} />
            <ClassificationGroup title="Expenses" classes={groupedClasses.EXPENSE} allCategories={categories} onDeleteCls={handleDeleteClassification} onDeleteCat={handleDeleteCategory} />
          </div>
        </Card>
      </div>
    </div>
  );
}

function ClassificationGroup({ title, classes, allCategories, onDeleteCls, onDeleteCat }) {
  if (classes.length === 0) return null;

  return (
    <div>
      <h4 className="text-sm font-bold text-text-tertiary uppercase tracking-wider mb-4 border-b border-border-light dark:border-border-dark pb-2">
        {title} 
      </h4>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {classes.map(cls => {
          const classCats = allCategories.filter(c => c.classification_id === cls.id);
          return (
            <div key={cls.id} className="bg-white dark:bg-gray-800 rounded-xl border border-border-light dark:border-border-dark p-4 shadow-sm">
              <div className="flex items-center justify-between mb-3 border-b border-gray-100 dark:border-gray-700 pb-2">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-text-primary dark:text-white">{cls.name}</span>
                  {cls.is_system && (
                    <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-primary/10 text-primary font-bold uppercase tracking-wider">System</span>
                  )}
                </div>
                {!cls.is_system && (
                  <button onClick={() => onDeleteCls(cls.id)} className="text-red-400 hover:text-red-600 transition-colors p-1" title="Delete Classification">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
              
              <ul className="space-y-1.5">
                {classCats.map(cat => (
                  <li key={cat.id} className="flex justify-between items-center py-1.5 px-2 hover:bg-gray-50 dark:hover:bg-gray-800/80 rounded group transition-colors">
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-text-secondary group-hover:text-text-primary dark:text-gray-300 dark:group-hover:text-white transition-colors">{cat.name}</span>
                      {cat.is_system && (
                        <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-primary/10 text-primary font-bold uppercase tracking-wider">System</span>
                      )}
                    </div>
                    {!cat.is_system && (
                      <button onClick={() => onDeleteCat(cat.id)} className="opacity-0 group-hover:opacity-100 text-red-400 hover:text-red-600 transition-all p-1" title="Delete Category">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </li>
                ))}
                {classCats.length === 0 && (
                  <li className="text-xs text-text-tertiary px-2 py-1">No categories assigned.</li>
                )}
              </ul>
            </div>
          );
        })}
      </div>
    </div>
  );
}
