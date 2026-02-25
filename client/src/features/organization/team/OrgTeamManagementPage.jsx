import React, { useState, useEffect } from "react";
import {
  Users,
  Search,
  MoreHorizontal,
  Shield,
  MapPin,
  Mail,
  Trash2,
  Edit2,
  KeyRound,
} from "lucide-react";
import { Button } from "../../../components/ui/Button";
import { Card } from "../../../components/ui/Card";
import { Avatar } from "../../../components/ui/Avatar";
import { Badge } from "../../../components/ui/Badge";
import { apiClient } from "../../../lib/axios";
import { useAuth } from "../../../context/AuthContext";
import { toast } from "react-toastify";
import { Dropdown } from "../../../components/ui/Dropdown";

export function OrgTeamManagementPage({ hideHeader = false }) {
  const { user } = useAuth();
  const [members, setMembers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [myRole, setMyRole] = useState("MEMBER");
  const [orgId, setOrgId] = useState("");

  const fetchMembers = React.useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await apiClient.get("/org/members");
      setMembers(res.data.members || []);

      // Attempt to get org info to show the Join ID
      const orgRes = await apiClient.get("/org");
      if (orgRes.data.organization) {
        setOrgId(orgRes.data.organization.join_code);
      }

      // Find my own role
      const me = res.data.members?.find((m) => m.user_id === user?.id);
      if (me) setMyRole(me.org_role);
    } catch {
      toast.error("Failed to load team members");
    } finally {
      setIsLoading(false);
    }
  }, [user?.id]);

  useEffect(() => {
    fetchMembers();
  }, [fetchMembers]);

  const handleKickMember = async (memberId) => {
    if (!window.confirm("Are you sure you want to remove this member?")) return;
    try {
      await apiClient.delete("/org/kick", {
        data: { target_member_id: memberId },
      });
      toast.success("Member removed from organization.");
      fetchMembers();
    } catch (err) {
      toast.error(err.response?.data?.error || "Failed to remove member");
    }
  };

  const handleChangeRole = async (memberId, newRole) => {
    try {
      await apiClient.put("/org/members/role", {
        target_member_id: memberId,
        new_role: newRole,
      });
      toast.success("Member role updated.");
      fetchMembers();
    } catch (err) {
      toast.error(err.response?.data?.error || "Failed to update role");
    }
  };

  const handleCopyInvite = () => {
    navigator.clipboard.writeText(orgId);
    toast.success(
      "Organization ID copied to clipboard. Share this with new members so they can join.",
    );
  };

  const filteredMembers = members.filter((m) =>
    `${m.first_name} ${m.last_name} ${m.email}`
      .toLowerCase()
      .includes(searchQuery.toLowerCase()),
  );

  const canManageRoles = myRole === "FOUNDER" || myRole === "ADMIN";

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-20">
      {!hideHeader && (
        <div className="flex flex-col md:flex-row justify-between items-start gap-6 border-b border-border-light dark:border-border-dark pb-6">
          <div>
            <h1 className="text-3xl font-bold text-text-primary dark:text-white">
              Active Member Management
            </h1>
            <p className="text-text-secondary dark:text-gray-400 mt-1">
              Manage your organization's members, invite new users, and
              configure roles.
            </p>
          </div>
          <div className="flex gap-3">
            <Button onClick={handleCopyInvite} className="gap-2">
              <KeyRound className="h-4 w-4" /> Copy Join ID
            </Button>
          </div>
        </div>
      )}

      <Card className="bg-white dark:bg-surface-dark overflow-hidden">
        <div className="p-5 border-b border-border-light dark:border-border-dark flex flex-col sm:flex-row justify-between items-center gap-4">
          <h2 className="text-lg font-bold text-text-primary dark:text-white">
            Organization Roster
          </h2>
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-tertiary" />
            <input
              type="text"
              placeholder="Search by name or email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="h-9 w-full pl-9 pr-4 rounded-lg border border-border-light bg-background-light dark:bg-background-dark dark:border-border-dark text-sm focus:ring-2 focus:ring-primary/20"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50 dark:bg-gray-800/50 border-b border-border-light dark:border-border-dark">
              <tr>
                <th className="px-6 py-3 font-semibold text-text-tertiary">
                  Member
                </th>
                <th className="px-6 py-3 font-semibold text-text-tertiary">
                  Role
                </th>
                <th className="px-6 py-3 font-semibold text-text-tertiary">
                  Department / Title
                </th>
                <th className="px-6 py-3 font-semibold text-text-tertiary">
                  Joined
                </th>
                <th className="px-6 py-3 font-semibold text-text-tertiary text-right">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-light dark:divide-border-dark">
              {isLoading ? (
                <tr>
                  <td
                    colSpan="5"
                    className="px-6 py-8 text-center text-text-tertiary"
                  >
                    Loading members...
                  </td>
                </tr>
              ) : filteredMembers.length === 0 ? (
                <tr>
                  <td
                    colSpan="5"
                    className="px-6 py-8 text-center text-text-tertiary"
                  >
                    No members found.
                  </td>
                </tr>
              ) : (
                filteredMembers.map((member) => (
                  <tr
                    key={member.organization_member_id}
                    className="group hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <Avatar
                          src={member.avatar}
                          fallback={member.first_name?.[0] || "U"}
                          size="sm"
                        />
                        <div>
                          <p className="font-medium text-text-primary dark:text-white">
                            {member.first_name} {member.last_name}
                          </p>
                          <p className="text-xs text-text-tertiary">
                            {member.email}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <Badge
                        variant={
                          member.org_role === "FOUNDER"
                            ? "primary"
                            : member.org_role === "ADMIN"
                              ? "success"
                              : "neutral"
                        }
                      >
                        {member.org_role}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 text-text-secondary dark:text-gray-400">
                      {member.designation_title || "No Designation"}
                      {member.department && (
                        <span className="text-xs opacity-75 block">
                          {member.department}
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-text-secondary dark:text-gray-400">
                      {new Date(member.joined_at).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-right">
                      {canManageRoles &&
                      member.org_role !== "FOUNDER" &&
                      member.user_id !== user?.id ? (
                        <Dropdown
                          trigger={
                            <button className="text-text-tertiary hover:text-primary p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700">
                              <MoreHorizontal className="h-4 w-4" />
                            </button>
                          }
                          align="right"
                          width="w-48"
                        >
                          <div className="p-1">
                            <button
                              onClick={() =>
                                handleChangeRole(
                                  member.organization_member_id,
                                  "ADMIN",
                                )
                              }
                              className="w-full text-left px-3 py-2 text-sm text-text-secondary hover:bg-gray-100 dark:hover:bg-gray-800 rounded-md flex items-center gap-2"
                            >
                              <Shield className="h-4 w-4" /> Make Admin
                            </button>
                            <button
                              onClick={() =>
                                handleChangeRole(
                                  member.organization_member_id,
                                  "MEMBER",
                                )
                              }
                              className="w-full text-left px-3 py-2 text-sm text-text-secondary hover:bg-gray-100 dark:hover:bg-gray-800 rounded-md flex items-center gap-2"
                            >
                              <Users className="h-4 w-4" /> Make Member
                            </button>
                            <div className="h-px bg-border-light dark:bg-border-dark my-1" />
                            <button
                              onClick={() =>
                                handleKickMember(member.organization_member_id)
                              }
                              className="w-full text-left px-3 py-2 text-sm text-error hover:bg-error/10 rounded-md flex items-center gap-2"
                            >
                              <Trash2 className="h-4 w-4" /> Remove User
                            </button>
                          </div>
                        </Dropdown>
                      ) : (
                        <span className="text-xs text-text-tertiary">
                          No actions
                        </span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
