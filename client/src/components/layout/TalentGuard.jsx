import React from "react";
import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

/**
 * TalentGuard prevents founders and admins from accessing the "Self-Side" talent features
 * like finding gigs or managing their own applications (since they act as organizations).
 */
export function TalentGuard() {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin text-primary h-8 w-8 border-2 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  // If user is a founder or an admin, they should not be on the "self-side" talent pages.
  const isOrganizationRole =
    user?.role === "founder" ||
    user?.role === "admin" ||
    user?.role === "super_admin";

  if (isOrganizationRole) {
    // Redirect to the organization management side
    return <Navigate to="/org/gigs" replace />;
  }

  return <Outlet />;
}
