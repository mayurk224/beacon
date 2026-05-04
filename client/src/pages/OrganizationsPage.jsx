import React, { useState } from "react";
import { useOrganization } from "../organization/useOrganization";
import { createOrganization } from "../organization/organizationApi";
import { Link } from "react-router-dom";
import { Building2, Plus, Users, Settings } from "lucide-react";
import { toast } from "sonner";

export default function OrganizationsPage() {
  const { organizations, loading, refetch } = useOrganization();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newOrgName, setNewOrgName] = useState("");
  const [creating, setCreating] = useState(false);

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!newOrgName.trim()) return;
    setCreating(true);
    try {
      await createOrganization({ name: newOrgName });
      toast.success("Organization created successfully");
      setIsDialogOpen(false);
      setNewOrgName("");
      refetch();
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to create organization");
    } finally {
      setCreating(false);
    }
  };

  if (loading) {
    return <div className="p-6 text-primary animate-pulse">Loading organizations...</div>;
  }

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-primary">Organizations</h1>
          <p className="text-sm text-subtle mt-1">Manage the organizations you belong to.</p>
        </div>
        <button
          onClick={() => setIsDialogOpen(true)}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
        >
          <Plus size={16} />
          Create Organization
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {organizations.map((org) => {
          return (
            <div key={org._id} className="border border-border-primary bg-surface rounded-xl p-5 hover:border-border-muted transition-colors flex flex-col h-full shadow-sm">
              <div className="flex items-start gap-3 mb-4">
                <div className="w-10 h-10 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-400 shrink-0">
                  <Building2 size={20} />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-base font-semibold text-primary truncate">{org.name}</h3>
                  <p className="text-xs text-subtle mt-1 truncate">ID: {org._id}</p>
                </div>
              </div>
              <div className="mt-auto flex items-center justify-between pt-4 border-t border-border-primary">
                <div className="flex items-center gap-1.5 text-sm text-muted">
                  <Users size={16} />
                  <span>{org.members?.length || 0} Members</span>
                </div>
                <Link
                  to={`/home/organizations/${org._id}`}
                  className="text-sm font-medium text-blue-500 hover:text-blue-600 transition-colors flex items-center gap-1"
                >
                  <Settings size={16} />
                  Manage
                </Link>
              </div>
            </div>
          );
        })}
        {organizations.length === 0 && (
          <div className="col-span-full py-12 text-center text-muted border border-dashed border-border-primary rounded-xl">
            No organizations found. Create one to get started.
          </div>
        )}
      </div>

      {isDialogOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-surface border border-border-primary rounded-xl shadow-xl w-full max-w-md overflow-hidden">
            <div className="p-5 border-b border-border-primary flex items-center justify-between">
              <h2 className="text-lg font-bold text-primary">Create Organization</h2>
            </div>
            <form onSubmit={handleCreate} className="p-5 space-y-4">
              <div>
                <label className="block text-sm font-medium text-primary mb-1">Organization Name</label>
                <input
                  type="text"
                  value={newOrgName}
                  onChange={(e) => setNewOrgName(e.target.value)}
                  className="w-full h-10 px-3 bg-surface border border-border-primary rounded-lg text-primary text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                  placeholder="e.g., Acme Corp"
                  required
                />
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsDialogOpen(false)}
                  className="px-4 py-2 text-sm font-medium text-primary bg-surface-interactive hover:bg-border-primary rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={creating || !newOrgName.trim()}
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg transition-colors"
                >
                  {creating ? "Creating..." : "Create"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
