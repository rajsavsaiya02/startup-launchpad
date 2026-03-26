import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";

// Layouts
import { PublicLayout } from "../components/layout/PublicLayout";
import { AuthLayout } from "../components/layout/AuthLayout";
import { DashboardLayout } from "../components/layout/DashboardLayout";
import { UserLayout } from "../components/layout/UserLayout";

// Pages
import { LoginPage } from "../features/auth/LoginPage";
import { SignupPage } from "../features/auth/SignupPage";
import { AuthSuccessPage } from "../features/auth/AuthSuccessPage";
import { ForgotPasswordPage } from "../features/auth/ForgotPasswordPage";
import { CreateWorkspacePage } from "../features/auth/CreateWorkspacePage";
import { ProjectsDashboard } from "../features/operations/ProjectsDashboard";
import { OrgDashboardOverview } from "../features/organization/dashboard/OrgDashboardOverview";
import { OrgProjectsDashboard } from "../features/organization/projects/OrgProjectsDashboard";
import { OrgProjectDetailsPage } from "../features/organization/projects/OrgProjectDetailsPage";
import { OrgProjectTasksPage } from "../features/organization/tasks/OrgProjectTasksPage";
import { OrgManagementPage } from "../features/organization/management/OrgManagementPage";
import { OrgWorkspaceSettings } from "../features/organization/settings/OrgWorkspaceSettings";
import { OrgPublicProfileSettings } from "../features/organization/settings/OrgPublicProfileSettings";
import { OrgPublicProfilePage } from "../features/organization/public/OrgPublicProfilePage";
import { OrgFinanceDashboard } from "../features/organization/finance/OrgFinanceDashboard";
import { FinancialOverview } from "../features/finance/FinancialOverview";
import { TalentMarketplace } from "../features/talent/TalentMarketplace";
import { CommunityDirectoryPage } from "../features/community/CommunityDirectoryPage";
import { LandingPage } from "../pages/LandingPage";
import { PricingPage } from "../pages/PricingPage";
import { ContactPage } from "../pages/ContactPage";
import { AboutPage } from "../pages/AboutPage";
import BlogListingPage from "../pages/BlogListingPage";
import BlogArticlePage from "../pages/BlogArticlePage";
import { FeaturesPage } from "../pages/FeaturesPage";
import { LegalHubPage } from "../pages/LegalHubPage";
import { PolicyViewerPage } from "../pages/PolicyViewerPage";
import { HelpCenterPage } from "../pages/HelpCenterPage";
import { CaseStudiesPage } from "../pages/CaseStudiesPage";
import { CaseStudyDetailPage } from "../pages/CaseStudyDetailPage";
import { CommunityProfilePage } from "../features/community/CommunityProfilePage";
import { DesignSystemIntroPage } from "../features/admin/design-system/pages/DesignSystemIntroPage";
import { AuditLogsPage } from "../features/admin/audit/AuditLogsPage";
import { DesignSystemLayout } from "../features/admin/design-system/DesignSystemLayout";
import { FoundationsPage } from "../features/admin/design-system/pages/FoundationsPage";
import { ComponentsPage } from "../features/admin/design-system/pages/ComponentsPage";
import { LayoutPage } from "../features/admin/design-system/pages/LayoutPage";
import { InteractionsPage } from "../features/admin/design-system/pages/InteractionsPage";
import { AccessibilityPage } from "../features/admin/design-system/pages/AccessibilityPage";
import { AdminLayout } from "../features/admin/layout/AdminLayout";
import { AdminDashboardPage } from "../features/admin/dashboard/AdminDashboardPage";
import { UsersManagementPage } from "../features/admin/users/UsersManagementPage";
import { AdminOrganizationsPage } from "../features/admin/organizations/AdminOrganizationsPage";
import { PlansSubscriptionsPage } from "../features/admin/plans/PlansSubscriptionsPage";
import { MarketplaceModerationPage } from "../features/admin/marketplace/MarketplaceModerationPage";
import { ContentManagementPage } from "../features/admin/content/ContentManagementPage";
import { PublicPageManager } from "../features/admin/content/PublicPageManager";
import { AdminAnalyticsPage } from "../features/admin/dashboard/AdminAnalyticsPage";
import { SystemHealthPage } from "../features/admin/dashboard/SystemHealthPage";
import { AdminSettingsPage } from "../features/admin/settings/AdminSettingsPage";
import { EmailSettingsPage } from "../features/admin/settings/EmailSettingsPage";
import { AccessControlPage } from "../features/admin/settings/AccessControlPage";
import { AdminProfilePage } from "../features/admin/users/AdminProfilePage";
import { AdminSecurityPage } from "../features/admin/users/AdminSecurityPage";
import BrandingSettings from "../features/admin/settings/BrandingSettings";
import { AdminPreferencesPage } from "../features/admin/users/AdminPreferencesPage";
import { FreelancerProfilePage } from "../features/talent/FreelancerProfilePage";
import { GigApplicationsPage } from "../features/talent/GigApplicationsPage";
import { OpportunitiesBoardPage } from "../features/talent/OpportunitiesBoardPage";
import { OpportunityDetailsPage } from "../features/talent/OpportunityDetailsPage";
import { MyApplicationsPage } from "../features/talent/MyApplicationsPage";
import { ApplicationReviewPage } from "../features/talent/ApplicationReviewPage";
import { ApplicationChat } from "../features/talent/ApplicationChat";
import { TalentArchivePage } from "../features/talent/TalentArchivePage";
import { PublicProfilePage } from "../features/talent/PublicProfilePage";
import { ProjectDetailsPage } from "../features/operations/ProjectDetailsPage";
import { ProjectTasksPage } from "../features/operations/ProjectTasksPage";
import { ExpenseListPage } from "../features/finance/ExpenseListPage";
import { AnalyticsPage } from "../features/finance/AnalyticsPage";
import { DashboardOverview } from "../features/dashboard/DashboardOverview";
import { TeamPage } from "../features/team/TeamPage";
import { UserSettingsPage } from "../features/settings/UserSettingsPage";
import { UserProfilePage } from "../features/users/UserProfilePage";
import { CMSEditorPage } from "../features/admin/content/CMSEditorPage";
import { NavigationManager } from "../features/admin/content/NavigationManager";
import { DynamicPage } from "../pages/DynamicPage";
import { MaintenancePage } from "../pages/MaintenancePage";
import { NotFoundPage } from "../pages/NotFoundPage";
import { SitemapPage } from "../pages/SitemapPage";
import AdminLogin from "../pages/admin/AdminLogin";
import { ProtectedRoute } from "../components/layout/ProtectedRoute";
import { AdminGuard } from "../components/layout/AdminGuard";
import { PublicAuthGuard } from "../components/layout/PublicAuthGuard";
import { AdminPlaceholderPage } from "../components/common/AdminPlaceholderPage";
import { OrgGuard } from "../components/layout/OrgGuard";
import { TalentGuard } from "../components/layout/TalentGuard";
import { OrgTalentDashboard } from "../features/organization/talent/OrgTalentDashboard";
import { OrganizationOpportunityDetailsPage } from "../features/organization/talent/OrganizationOpportunityDetailsPage";


export function AppRoutes() {
  return (
    <Routes>
      {/* Public Routes (Landing, Pricing, etc.) */}
      <Route element={<PublicLayout />}>
        <Route path="/" element={<LandingPage />} />
        <Route path="/community" element={<CommunityDirectoryPage />} />
        <Route path="/community/:slug" element={<CommunityProfilePage />} />
        <Route path="/home" element={<Navigate to="/" replace />} />
        <Route path="/homepage" element={<Navigate to="/" replace />} />
        <Route path="/home-page" element={<Navigate to="/" replace />} />
        {/* <Route path="/pricing" element={<PricingPage />} /> */}
        <Route path="/contact" element={<ContactPage />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/blog" element={<BlogListingPage />} />
        <Route path="/blog/:slug" element={<BlogArticlePage />} />
        <Route path="/features" element={<FeaturesPage />} />
        <Route path="/product" element={<FeaturesPage />} />
        <Route path="/solutions" element={<FeaturesPage />} />
        <Route path="/legal" element={<LegalHubPage />} /> {/* Legal Routes */}
        <Route path="/legal/:docId" element={<PolicyViewerPage />} />
        <Route path="/help-center" element={<HelpCenterPage />} />{" "}
        {/* Maps to Help Center */}
        <Route path="/resources" element={<HelpCenterPage />} />{" "}
        {/* Map Resources to Help for now */}
        <Route path="/case-studies" element={<CaseStudiesPage />} />
        <Route path="/case-studies/:id" element={<CaseStudyDetailPage />} />
      </Route>

      {/* Admin Authentication */}
      {/* Public Auth Routes (Redirects if logged in) */}
      <Route element={<PublicAuthGuard />}>
        <Route path="/admin/login" element={<AdminLogin />} />

        <Route path="/auth" element={<AuthLayout />}>
          <Route path="login" element={<LoginPage />} />
          <Route path="success" element={<AuthSuccessPage />} />
          <Route path="signup" element={<SignupPage />} />
          <Route path="forgot-password" element={<ForgotPasswordPage />} />
          <Route index element={<Navigate to="login" replace />} />
        </Route>
      </Route>

      {/* Admin Protected Routes */}
      <Route element={<AdminGuard />}>
        <Route path="/admin" element={<AdminLayout />}>
          {/* Default Redirect */}
          <Route index element={<Navigate to="dashboard/overview" replace />} />
          <Route
            path="dashboard"
            element={<Navigate to="overview" replace />}
          />
          {/* 1. Dashboard Module */}
          <Route path="dashboard/overview" element={<AdminDashboardPage />} />
          <Route
            path="dashboard/analytics"
            element={<AdminAnalyticsPage />}
          />


          <Route
            path="dashboard/financials"
            element={
              <AdminPlaceholderPage
                title="Financial Reports"
                module="Dashboard"
              />
            }
          />
          <Route
            path="dashboard/live"
            element={
              <AdminPlaceholderPage title="Live Feed" module="Dashboard" />
            }
          />
          <Route path="dashboard/health" element={<SystemHealthPage />} />
          {/* 2. Management Module */}
          <Route
            path="management"
            element={<Navigate to="organizations" replace />}
          />
          <Route
            path="management/organizations"
            element={<AdminOrganizationsPage />}
          />
          <Route path="management/users" element={<UsersManagementPage />} />
          <Route
            path="management/verification"
            element={
              <AdminPlaceholderPage
                title="Verification Queue"
                module="Management"
              />
            }
          />
{/* <Route
            path="management/fiscal"
            element={<PlansSubscriptionsPage />}
          /> */}
{/* <Route
            path="management/marketplace"
            element={<MarketplaceModerationPage />}
          /> */}
          {/* 3. Communication Module */}
          <Route
            path="communication"
            element={<Navigate to="cms/blogs" replace />}
          />
{/* <Route
            path="communication/broadcasts"
            element={
              <AdminPlaceholderPage title="Broadcasts" module="Communication" />
            }
          /> */}
          <Route
            path="communication/cms"
            element={<Navigate to="homepage" replace />}
          />
          {/* Dashboard is the new Home */}
          <Route
            path="communication/cms/homepage"
            element={<PublicPageManager />}
          />
          <Route
            path="communication/cms/pages"
            element={<PublicPageManager />}
          />{" "}
          {/* Alias for dashboard */}
          <Route
            path="communication/cms/pages/:slug"
            element={<CMSEditorPage />}
          />
          <Route
            path="communication/cms/navigation"
            element={<NavigationManager />}
          />
          <Route
            path="communication/cms/blogs"
            element={<ContentManagementPage />}
          />
{/* <Route
            path="communication/cms/testimonials"
            element={
              <AdminPlaceholderPage
                title="Testimonials Manager"
                module="Content CMS"
              />
            }
          /> */}
{/* <Route
            path="communication/cms/resources"
            element={
              <AdminPlaceholderPage
                title="Resource Library"
                module="Content CMS"
              />
            }
          /> */}
{/* <Route
            path="communication/cms/banners"
            element={
              <AdminPlaceholderPage
                title="Banners & Highlights"
                module="Content CMS"
              />
            }
          /> */}
{/* <Route
            path="communication/promos"
            element={
              <AdminPlaceholderPage title="Promotions" module="Communication" />
            }
          /> */}
{/* <Route
            path="communication/support"
            element={
              <AdminPlaceholderPage
                title="Support Helpdesk"
                module="Communication"
              />
            }
          /> */}
          {/* 4. Settings Module */}
          <Route path="settings" element={<Navigate to="general" replace />} />
          <Route path="settings/general" element={<AdminSettingsPage />} />
          <Route path="settings/branding" element={<BrandingSettings />} />
          <Route path="settings/email" element={<EmailSettingsPage />} />
          <Route
            path="settings/notifications"
            element={
              <AdminPlaceholderPage
                title="Notification Settings"
                module="Settings"
              />
            }
          />
          {/* <Route path="settings/features" element={<AdminPlaceholderPage title="Feature Toggles" module="Settings" />} /> */}
          {/* <Route path="settings/integrations" element={<AdminPlaceholderPage title="Integrations" module="Settings" />} /> */}
          <Route path="settings/access" element={<AccessControlPage />} />
          <Route path="settings/security" element={<AuditLogsPage />} />
          {/* <Route path="settings/developers" element={<AdminPlaceholderPage title="Developer Tools" module="Settings" />} /> */}
          {/* <Route path="settings/maintenance" element={<AdminPlaceholderPage title="System Maintenance" module="Settings" />} /> */}
          {/* Admin Profile & Preferences */}
          <Route path="profile" element={<AdminProfilePage />} />
          <Route path="security" element={<AdminSecurityPage />} />
          {/* <Route path="preferences" element={<AdminPreferencesPage />} /> */}
          {/* Design System (Keep accessible for dev) */}
          <Route path="design" element={<DesignSystemLayout />}>
            <Route index element={<DesignSystemIntroPage />} />
            <Route path="foundations" element={<FoundationsPage />} />
            <Route path="components" element={<ComponentsPage />} />
            <Route path="layout" element={<LayoutPage />} />
            <Route path="interactions" element={<InteractionsPage />} />
            <Route path="accessibility" element={<AccessibilityPage />} />
          </Route>
        </Route>
      </Route>

      {/* User Protected Routes - Dual Navigation */}
      <Route element={<ProtectedRoute />}>
        {/* Use the new UserLayout instead of DashboardLayout */}
        <Route element={<UserLayout />}>
          {/* Dashboard Module */}
          <Route path="/dashboard" element={<DashboardOverview />} />
          <Route path="/dashboard/gigs" element={<OpportunitiesBoardPage />} />
          <Route path="/dashboard/gigs/:id" element={<OpportunityDetailsPage />} />
          <Route
            path="/dashboard/gigs/:id/applications"
            element={<Navigate to="/org/talent/applications" replace />}
          />
          {/* New Talent & Opportunity Routes */}
          <Route element={<TalentGuard />}>
            <Route
              path="/dashboard/opportunities"
              element={<OpportunitiesBoardPage />}
            />
            <Route
              path="/dashboard/opportunities/:id"
              element={<OpportunityDetailsPage />}
            />
            <Route
              path="/dashboard/applications"
              element={<MyApplicationsPage />}
            />
            <Route
              path="/dashboard/applications/:id/messages"
              element={<ApplicationChat />}
            />
            <Route path="/dashboard/archives" element={<TalentArchivePage />} />
          </Route>

          {/* Org Side mapped from Dashboard */}
          <Route
            path="/dashboard/opportunities/manage"
            element={<Navigate to="/org/talent/postings" replace />}
          />
          <Route
            path="/dashboard/opportunities/:id/applications"
            element={<Navigate to="/org/talent/applications" replace />}
          />

          {/* <Route
            path="/talent/profile/:username"
            element={<PublicProfilePage />}
          /> */}
          <Route
            path="/talent/profile/:slug"
            element={<Navigate to={(params) => `/community/${params.slug}`} replace />}
          />
          {/* Productivity Module (Renamed from Work) */}
          <Route
            path="/productivity"
            element={<Navigate to="projects" replace />}
          />
          <Route
            path="/productivity/projects"
            element={<ProjectsDashboard />}
          />
          <Route
            path="/productivity/projects/:id"
            element={<ProjectDetailsPage />}
          />
          <Route path="/productivity/tasks" element={<ProjectTasksPage />} />
          <Route
            path="/org"
            element={<Navigate to="/org/dashboard" replace />}
          />
          {/* Organization Protected Routes */}
          <Route element={<OrgGuard />}>
            <Route path="/org/dashboard" element={<OrgDashboardOverview />} />
            <Route path="/org/projects" element={<OrgProjectsDashboard />} />
            <Route
              path="/org/projects/:id"
              element={<OrgProjectDetailsPage />}
            />
            <Route path="/org/tasks" element={<OrgProjectTasksPage />} />
            <Route
              path="/org/gigs"
              element={<Navigate to="/org/talent/postings" replace />}
            />
            <Route path="/org/talent/*" element={<OrgTalentDashboard />} />
            <Route path="/org/gigs/:id" element={<OrganizationOpportunityDetailsPage />} />
            <Route
              path="/org/gigs/:id/applications"
              element={<ApplicationReviewPage />}
            />
            <Route path="/org/management" element={<OrgManagementPage />} />
            <Route
              path="/org/public-profile"
              element={<OrgPublicProfileSettings />}
            />
            <Route path="/org/settings" element={<OrgWorkspaceSettings />} />
            <Route path="/org/finances/*" element={<OrgFinanceDashboard />} />
          </Route>
          {/* Close OrgGuard */}
          <Route path="/talent" element={<TalentMarketplace />} />
          <Route path="/community" element={<CommunityDirectoryPage />} />
          {/* <Route
            path="/talent/profile/:id"
            element={<FreelancerProfilePage />}
          /> */}
          {/* Financial Module (Legacy/Founder Only) - Keep at root or move to new module? 
              For now keeping at root /financials but it might not show in sidebar unless configured.
              Let's keep it accessible.
          */}
          <Route path="/financials" element={<FinancialOverview />} />
          <Route path="/financials/expenses" element={<ExpenseListPage />} />
          <Route path="/financials/analytics" element={<AnalyticsPage />} />
          {/* Settings Module */}
          <Route path="/settings" element={<Navigate to="profile" replace />} />
          {/* View Profile (Public/Read-only view) */}
          <Route path="/settings/profile" element={<UserProfilePage />} />
          {/* Edit Profile / General Settings */}
          <Route
            path="/settings/general"
            element={<UserSettingsPage section="profile" />}
          />
          {/* Other Settings Sections */}
          <Route
            path="/settings/security"
            element={<UserSettingsPage section="security" />}
          />
          <Route
            path="/settings/notifications"
            element={<UserSettingsPage section="notifications" />}
          />
          <Route
            path="/settings/billing"
            element={<UserSettingsPage section="billing" />}
          />
          <Route path="/settings/user/:id" element={<UserProfilePage />} />
          {/* Legacy Redirects (for backward compatibility if needed) */}
          <Route
            path="/projects"
            element={<Navigate to="/productivity/projects" replace />}
          />
          <Route
            path="/tasks"
            element={<Navigate to="/productivity/tasks" replace />}
          />
          <Route
            path="/team"
            element={<Navigate to="/org/management" replace />}
          />
          <Route
            path="/gigs"
            element={<Navigate to="/dashboard/gigs" replace />}
          />
        </Route>
      </Route>

      {/* 404 Catch-all - MOVED to handle dynamic root routes */}
      {/* Dynamic CMS Route (Catch-all for pages like /terms, /privacy, etc.) */}
      {/* This MUST be the last route before 404 to avoid conflicts with specific routes */}
      <Route element={<PublicLayout />}>
        <Route path="/upcoming" element={<MaintenancePage />} />
        <Route path="/upcoming" element={<MaintenancePage />} />
        <Route path="/not-found" element={<NotFoundPage />} />
        <Route path="/404" element={<NotFoundPage />} />
        <Route path="/sitemap" element={<SitemapPage />} />
        <Route path="/o/:slug" element={<Navigate to={(params) => `/community/${params.slug}`} replace />} />
        <Route path="/:slug" element={<DynamicPage />} />
      </Route>

      <Route path="*" element={<Navigate to="/not-found" replace />} />
    </Routes>
  );
}
