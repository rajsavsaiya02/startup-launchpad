import React from "react";
import { useAuth } from "../../context/AuthContext";
import { FounderDashboard } from "./FounderDashboard";
import { MemberDashboard } from "./MemberDashboard";
import { FreelancerDashboard } from "./FreelancerDashboard";
import { StudentDashboard } from "./StudentDashboard";

export function DashboardOverview() {
  const { user, isAdmin } = useAuth();

  // Role checks
  const isFounder = user?.role === "founder" || isAdmin;
  const isFreelancer = user?.role === "freelancer";
  const isStudent = user?.role === "student";

  // Render based on role
  if (isFounder) return <FounderDashboard />;
  if (isFreelancer) return <FreelancerDashboard />;
  if (isStudent) return <StudentDashboard />;

  // Default to Member Dashboard for normal_user
  return <MemberDashboard />;
}
