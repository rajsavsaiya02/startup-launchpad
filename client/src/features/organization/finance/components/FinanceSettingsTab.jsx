import React, { useState, useEffect } from "react";
import { Card } from "../../../../components/ui/Card";
import { Button } from "../../../../components/ui/Button";
import { Input } from "../../../../components/ui/Input";
import { apiClient } from "../../../../lib/axios";
import { toast } from "react-toastify";
import { Save, Plus, WalletCards, Building2, Briefcase } from "lucide-react";

export function FinanceSettingsTab() {
  const [profile, setProfile] = useState(null);
  const [categories, setCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // New Category Form State
  const [newCatName, setNewCatName] = useState("");
  const [newCatType, setNewCatType] = useState("EXPENSE");
  const [isAddingCat, setIsAddingCat] = useState(false);

  useEffect(() => {
    fetchConfig();
  }, []);

  const fetchConfig = async () => {
    try {
      setIsLoading(true);
      const res = await apiClient.get("/org/finances/config");
      if (res.data && res.data.profile && res.data.categories) {
        setProfile(res.data.profile);
        setCategories(res.data.categories);
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
      const res = await apiClient.put("/org/finances/config", profile);
      setProfile(res.data.profile);
      toast.success("Settings updated successfully");
    } catch (error) {
      console.error("Config update failed:", error);
      toast.error("Failed to update settings");
    } finally {
      setIsSaving(false);
    }
  };

  const handleAddCategory = async (e) => {
    e.preventDefault();
    if (!newCatName) return;

    try {
      setIsAddingCat(true);
      const res = await apiClient.post("/org/finances/categories", {
        name: newCatName,
        type: newCatType,
        description: "",
      });
      setCategories(
        [...categories, res.data.category].sort((a, b) =>
          a.name.localeCompare(b.name),
        ),
      );
      setNewCatName("");
      toast.success("Category added");
    } catch (error) {
      console.error("Add category failed:", error);
      toast.error("Failed to add category");
    } finally {
      setIsAddingCat(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-12">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  const expensesCats = categories.filter((c) => c.type === "EXPENSE");
  const incomeCats = categories.filter(
    (c) => c.type === "INCOME" || c.type === "REVENUE",
  );
  const assetCats = categories.filter(
    (c) => c.type === "ASSET" || c.type === "LIABILITY" || c.type === "EQUITY",
  );

  return (
    <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
      {/* Left Column: Organization Configuration */}
      <div className="xl:col-span-1 space-y-6">
        <Card className="p-6">
          <div className="flex items-center gap-3 mb-4 text-text-primary dark:text-white">
            <Building2 className="w-5 h-5 text-primary" />
            <h3 className="text-lg font-semibold">Compliance</h3>
          </div>
          <p className="text-sm text-text-secondary mb-6">
            Configure compliance settings (like GST mapping) for accurate
            financial reporting.
          </p>

          <form onSubmit={handleProfileUpdate} className="space-y-4">
            <div>
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
            </div>

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

            <Button
              type="submit"
              disabled={isSaving}
              className="w-full mt-4 flex justify-center gap-2"
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
            Organize and track where capital is being deployed. Custom
            categories enhance your financial visibility.
          </p>

          {/* Add New Category */}
          <form
            onSubmit={handleAddCategory}
            className="flex flex-col sm:flex-row items-end gap-3 p-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl border border-border-light dark:border-border-dark mb-8"
          >
            <div className="w-full sm:flex-1">
              <Input
                label="Category Name"
                placeholder="e.g. Server Infrastructure"
                value={newCatName}
                onChange={(e) => setNewCatName(e.target.value)}
                required
              />
            </div>
            <div className="w-full sm:w-48">
              <label className="block text-sm font-medium text-text-secondary mb-1">
                Type
              </label>
              <select
                className="w-full h-10 px-3 py-2 bg-white dark:bg-gray-900 text-sm border outline-none rounded-lg border-border-light dark:border-border-dark text-text-primary dark:text-white focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors hover:border-text-tertiary"
                value={newCatType}
                onChange={(e) => setNewCatType(e.target.value)}
              >
                <option value="EXPENSE">Expense</option>
                <option value="INCOME">Income / Revenue</option>
                <option value="ASSET">Asset / Liability</option>
              </select>
            </div>
            <Button
              type="submit"
              disabled={isAddingCat || !newCatName}
              className="w-full sm:w-auto h-10 flex items-center justify-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Add
            </Button>
          </form>

          {/* Category Lists */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Expenses */}
            <div>
              <h4 className="flex items-center gap-2 text-sm font-bold text-text-tertiary uppercase tracking-wider mb-3 pb-2 border-b border-border-light dark:border-border-dark">
                <Briefcase className="w-4 h-4" /> Expenses (
                {expensesCats.length})
              </h4>
              <ul className="space-y-2">
                {expensesCats.map((c) => (
                  <li
                    key={c.id}
                    className="flex justify-between items-center py-2 px-3 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg group transition-colors"
                  >
                    <span className="text-sm font-medium text-text-primary dark:text-white flex items-center gap-2">
                      {c.name}
                      {c.is_system && (
                        <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-primary/10 text-primary font-bold uppercase tracking-wider">
                          System
                        </span>
                      )}
                    </span>
                  </li>
                ))}
                {expensesCats.length === 0 && (
                  <li className="text-sm text-text-tertiary py-2">
                    No categories defined.
                  </li>
                )}
              </ul>
            </div>

            {/* Income & Assets */}
            <div className="space-y-6">
              <div>
                <h4 className="flex items-center gap-2 text-sm font-bold text-text-tertiary uppercase tracking-wider mb-3 pb-2 border-b border-border-light dark:border-border-dark">
                  <WalletCards className="w-4 h-4" /> Income & Capital (
                  {incomeCats.length + assetCats.length})
                </h4>
                <ul className="space-y-2">
                  {[...incomeCats, ...assetCats].map((c) => (
                    <li
                      key={c.id}
                      className="flex justify-between items-center py-2 px-3 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg group transition-colors"
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-text-primary dark:text-white">
                          {c.name}
                        </span>
                        <span
                          className={`text-[9px] px-1.5 py-0.5 rounded-full font-bold uppercase tracking-wider ${c.type === "INCOME" ? "bg-emerald-100 text-emerald-600" : "bg-blue-100 text-blue-600"}`}
                        >
                          {c.type}
                        </span>
                        {c.is_system && (
                          <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-primary/10 text-primary font-bold uppercase tracking-wider">
                            System
                          </span>
                        )}
                      </div>
                    </li>
                  ))}
                  {incomeCats.length + assetCats.length === 0 && (
                    <li className="text-sm text-text-tertiary py-2">
                      No categories defined.
                    </li>
                  )}
                </ul>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
