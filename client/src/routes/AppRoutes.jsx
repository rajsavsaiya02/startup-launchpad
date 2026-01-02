import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';

// Layouts
import { PublicLayout } from '../components/layout/PublicLayout';
import { AuthLayout } from '../components/layout/AuthLayout';
import { DashboardLayout } from '../components/layout/DashboardLayout';

// Pages
import { LoginPage } from '../features/auth/LoginPage';
import { SignupPage } from '../features/auth/SignupPage';
import { AuthSuccessPage } from '../features/auth/AuthSuccessPage';
import { ForgotPasswordPage } from '../features/auth/ForgotPasswordPage';
import { CreateWorkspacePage } from '../features/auth/CreateWorkspacePage';
import { ProjectsDashboard } from '../features/operations/ProjectsDashboard';
import { FinancialOverview } from '../features/finance/FinancialOverview';
import { TalentMarketplace } from '../features/talent/TalentMarketplace';
import { LandingPage } from '../pages/LandingPage';
import { PricingPage } from '../pages/PricingPage';
import { ContactPage } from '../pages/ContactPage';
import { AboutPage } from '../pages/AboutPage';
import { BlogListingPage } from '../pages/BlogListingPage';
import { BlogArticlePage } from '../pages/BlogArticlePage';
import { FeaturesPage } from '../pages/FeaturesPage';
import { LegalHubPage } from '../pages/LegalHubPage';
import { PolicyViewerPage } from '../pages/PolicyViewerPage';
import { HelpCenterPage } from '../pages/HelpCenterPage';
import { CaseStudiesPage } from '../pages/CaseStudiesPage';
import { CaseStudyDetailPage } from '../pages/CaseStudyDetailPage';
import { GigDetailsPage } from '../features/talent/GigDetailsPage';
import { DesignSystemIntroPage } from '../features/admin/design-system/pages/DesignSystemIntroPage';
import { AuditLogsPage } from '../features/admin/audit/AuditLogsPage';
import { DesignSystemLayout } from '../features/admin/design-system/DesignSystemLayout';
import { FoundationsPage } from '../features/admin/design-system/pages/FoundationsPage';
import { ComponentsPage } from '../features/admin/design-system/pages/ComponentsPage';
import { LayoutPage } from '../features/admin/design-system/pages/LayoutPage';
import { InteractionsPage } from '../features/admin/design-system/pages/InteractionsPage';
import { AccessibilityPage } from '../features/admin/design-system/pages/AccessibilityPage';
import { AdminLayout } from '../features/admin/layout/AdminLayout';
import { AdminDashboardPage } from '../features/admin/dashboard/AdminDashboardPage';
import { UsersManagementPage } from '../features/admin/users/UsersManagementPage';
import { AdminOrganizationsPage } from '../features/admin/organizations/AdminOrganizationsPage';
import { PlansSubscriptionsPage } from '../features/admin/plans/PlansSubscriptionsPage';
import { MarketplaceModerationPage } from '../features/admin/marketplace/MarketplaceModerationPage';
import { ContentManagementPage } from '../features/admin/content/ContentManagementPage';
import { AdminSettingsPage } from '../features/admin/settings/AdminSettingsPage';
import { FreelancerProfilePage } from '../features/talent/FreelancerProfilePage';
import { GigApplicationsPage } from '../features/talent/GigApplicationsPage';
import { GigListPage } from '../features/talent/GigListPage';
import { ProjectDetailsPage } from '../features/operations/ProjectDetailsPage';
import { ProjectTasksPage } from '../features/operations/ProjectTasksPage';
import { ExpenseListPage } from '../features/finance/ExpenseListPage';
import { AnalyticsPage } from '../features/finance/AnalyticsPage';
import { DashboardOverview } from '../features/dashboard/DashboardOverview';
import { TeamPage } from '../features/team/TeamPage';
import { UserSettingsPage } from '../features/settings/UserSettingsPage';
import { UserProfilePage } from '../features/users/UserProfilePage';

import { ProtectedRoute } from '../components/layout/ProtectedRoute';

export function AppRoutes() {
  return (
    <Routes>
      {/* Public Routes (Landing, Pricing, etc.) */}
      <Route element={<PublicLayout />}>
        <Route path="/" element={<LandingPage />} />
        <Route path="/pricing" element={<PricingPage />} />
        <Route path="/contact" element={<ContactPage />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/blog" element={<BlogListingPage />} />
        <Route path="/blog/:id" element={<BlogArticlePage />} />
        <Route path="/features" element={<FeaturesPage />} />
        <Route path="/product" element={<FeaturesPage />} />
        <Route path="/solutions" element={<FeaturesPage />} />
        <Route path="/legal" element={<LegalHubPage />} /> {/* Legal Routes */}
        <Route path="/legal/:docId" element={<PolicyViewerPage />} />
        <Route path="/help-center" element={<HelpCenterPage />} /> {/* Maps to Help Center */}
        <Route path="/resources" element={<HelpCenterPage />} /> {/* Map Resources to Help for now */}
        <Route path="/case-studies" element={<CaseStudiesPage />} />
        <Route path="/case-studies/:id" element={<CaseStudyDetailPage />} />
      </Route>

      {/* Authentication Routes */}
      <Route path="/auth" element={<AuthLayout />}>
        <Route path="login" element={<LoginPage />} />
        <Route path="success" element={<AuthSuccessPage />} />
        <Route path="signup" element={<SignupPage />} />
        <Route path="forgot-password" element={<ForgotPasswordPage />} />
        <Route index element={<Navigate to="login" replace />} />
      </Route>

      {/* Protected Application Routes */}
      <Route element={<ProtectedRoute />}>
        {/* Admin Design System Routes (In real app, wrap with AdminGuard) */}
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard" element={<AdminDashboardPage />} />
          <Route path="users" element={<UsersManagementPage />} />
          <Route path="organizations" element={<AdminOrganizationsPage />} />
          <Route path="plans" element={<PlansSubscriptionsPage />} />
          <Route path="marketplace" element={<MarketplaceModerationPage />} />
          <Route path="audit" element={<AuditLogsPage />} />
          <Route path="content" element={<ContentManagementPage />} />
          <Route path="settings" element={<AdminSettingsPage />} />
          <Route path="design" element={<DesignSystemLayout />}>
            <Route index element={<DesignSystemIntroPage />} />
            <Route index element={<Navigate to="foundations" replace />} />
            <Route path="foundations" element={<FoundationsPage />} />
            <Route path="components" element={<ComponentsPage />} />
            <Route path="layout" element={<LayoutPage />} />
            <Route path="interactions" element={<InteractionsPage />} />
            <Route path="accessibility" element={<AccessibilityPage />} />
          </Route>
        </Route>

        {/* Onboarding Route (Standalone Layout) */}
        <Route path="/onboarding/create-workspace" element={<CreateWorkspacePage />} />

        {/* Protected Application Routes */}
        <Route element={<DashboardLayout />}>
          <Route path="/dashboard" element={<DashboardOverview />} />
          <Route path="/settings" element={<UserSettingsPage />} />
          <Route path="/profile" element={<UserProfilePage />} />
          <Route path="/users/:id" element={<UserProfilePage />} />
          {/* Operations Module */}
          <Route path="/projects" element={<ProjectsDashboard />} />
          <Route path="/projects/:id" element={<ProjectDetailsPage />} />
          <Route path="/tasks" element={<ProjectTasksPage />} />

          {/* Financial Module */}
          <Route path="/financials" element={<FinancialOverview />} />
          <Route path="/financials/expenses" element={<ExpenseListPage />} />
          <Route path="/financials/analytics" element={<AnalyticsPage />} />
          {/* Talent Module */}
          <Route path="/talent" element={<TalentMarketplace />} />
          \        <Route path="/talent/profile/:id" element={<FreelancerProfilePage />} />
          <Route path="/gigs" element={<GigListPage />} />
          <Route path="/gigs/:id" element={<GigDetailsPage />} />
          <Route path="/gigs/:id/applications" element={<GigApplicationsPage />} />
          {/* Fallback for app routes */}
          <Route path="/team" element={<TeamPage />} />
        </Route>

      </Route>

      {/* 404 Catch-all */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}