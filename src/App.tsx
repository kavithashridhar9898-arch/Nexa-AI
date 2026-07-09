import React from 'react';
import { Routes, Route, Outlet } from 'react-router-dom';

// Layouts
import { RootLayout } from './layouts/RootLayout';
import { DashboardLayout } from './layouts/DashboardLayout';

// Public Pages
import { LandingPage } from './pages/LandingPage';
import { AboutPage } from './pages/AboutPage';
import { FeaturesPage } from './pages/FeaturesPage';
import { PricingPage } from './pages/PricingPage';
import { IntegrationsPage } from './pages/IntegrationsPage';
import { BlogPage } from './pages/BlogPage';
import { CareersPage } from './pages/CareersPage';
import { DocsPage } from './pages/DocsPage';
import { ContactPage } from './pages/ContactPage';
import { PrivacyPage } from './pages/PrivacyPage';
import { TermsPage } from './pages/TermsPage';
import { NotFoundPage } from './pages/NotFoundPage';

// Auth Pages
import { LoginPage } from './pages/auth/LoginPage';
import { RegisterPage } from './pages/auth/RegisterPage';
import { VerifyOtpPage } from './pages/auth/VerifyOtpPage';
import { ForgotPasswordPage } from './pages/auth/ForgotPasswordPage';
import { ResetPasswordPage } from './pages/auth/ResetPasswordPage';

// Dashboard Pages
import { OverviewPage } from './pages/dashboard/OverviewPage';
import { WorkflowsPage } from './pages/dashboard/WorkflowsPage';
import { ApiKeysPage } from './pages/dashboard/ApiKeysPage';
import { AnalyticsPage } from './pages/dashboard/AnalyticsPage';
import { NotificationsPage } from './pages/dashboard/NotificationsPage';
import { SettingsPage } from './pages/dashboard/SettingsPage';

export const App: React.FC = () => {
  return (
    <Routes>
      
      {/* 1. PUBLIC LAYOUT ROUTES */}
      <Route 
        element={
          <RootLayout>
            <Outlet />
          </RootLayout>
        }
      >
        <Route path="/" element={<LandingPage />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/features" element={<FeaturesPage />} />
        <Route path="/pricing" element={<PricingPage />} />
        <Route path="/integrations" element={<IntegrationsPage />} />
        <Route path="/blog" element={<BlogPage />} />
        <Route path="/careers" element={<CareersPage />} />
        <Route path="/docs" element={<DocsPage />} />
        <Route path="/contact" element={<ContactPage />} />
        <Route path="/privacy" element={<PrivacyPage />} />
        <Route path="/terms" element={<TermsPage />} />
        
        {/* Auth routes under public layouts */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/verify-otp" element={<VerifyOtpPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/reset-password" element={<ResetPasswordPage />} />
        
        {/* Fallback 404 under public layout */}
        <Route path="*" element={<NotFoundPage />} />
      </Route>

      {/* 2. AUTHENTICATED PANEL ROUTES */}
      <Route 
        path="/dashboard" 
        element={
          <DashboardLayout>
            <Outlet />
          </DashboardLayout>
        }
      >
        <Route index element={<OverviewPage />} />
        <Route path="workflows" element={<WorkflowsPage />} />
        <Route path="api-keys" element={<ApiKeysPage />} />
        <Route path="analytics" element={<AnalyticsPage />} />
        <Route path="notifications" element={<NotificationsPage />} />
        <Route path="settings" element={<SettingsPage />} />
      </Route>

    </Routes>
  );
};
