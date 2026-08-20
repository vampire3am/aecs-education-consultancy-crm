import { lazy, Suspense } from "react";
import { Navigate, Route, Routes } from "react-router-dom";

const AppShell = lazy(() => import("../components/layout/AppShell").then(m => ({ default: m.AppShell })));
const LoginArea = lazy(() => import("../features/auth/AuthRoutes").then(m => ({ default: m.LoginArea })));
const ProtectedArea = lazy(() => import("../features/auth/AuthRoutes").then(m => ({ default: m.ProtectedArea })));
const PublicIntake = lazy(() => import("../pages/PublicIntake").then(m => ({ default: m.PublicIntake })));

// Core Bespoke Workspaces
const ManagementDashboard = lazy(() =>
  import("../features/dashboard/ManagementDashboard").then(m => ({ default: m.ManagementDashboard }))
);
const RegistrationForm = lazy(() =>
  import("../features/students/registration/RegistrationForm").then(m => ({ default: m.RegistrationForm }))
);
const StudentDirectory = lazy(() =>
  import("../features/students/directory/StudentDirectory").then(m => ({ default: m.StudentDirectory }))
);
const CounsellingDashboard = lazy(() =>
  import("../features/counselling/CounsellingDashboard").then(m => ({ default: m.CounsellingDashboard }))
);
const ApplicationWorkspace = lazy(() =>
  import("../features/applications/ApplicationWorkspace").then(m => ({ default: m.ApplicationWorkspace }))
);
const DocumentDashboard = lazy(() =>
  import("../features/documents/DocumentDashboard").then(m => ({ default: m.DocumentDashboard }))
);
const ClassesWorkspace = lazy(() =>
  import("../features/classes/ClassesWorkspace").then(m => ({ default: m.ClassesWorkspace }))
);
const MockTestsWorkspace = lazy(() =>
  import("../features/mocks/MockTestsWorkspace").then(m => ({ default: m.MockTestsWorkspace }))
);
const FinanceWorkspace = lazy(() =>
  import("../features/finance/FinanceWorkspace").then(m => ({ default: m.FinanceWorkspace }))
);
const AnalyticsDashboard = lazy(() =>
  import("../features/analytics/AnalyticsDashboard").then(m => ({ default: m.AnalyticsDashboard }))
);
const AdminDashboard = lazy(() =>
  import("../features/admin/AdminDashboard").then(m => ({ default: m.AdminDashboard }))
);
const HrmsWorkspace = lazy(() =>
  import("../features/hrms/HrmsWorkspace").then(m => ({ default: m.HrmsWorkspace }))
);
const LeadsWorkspace = lazy(() =>
  import("../features/leads/LeadsWorkspace").then(m => ({ default: m.LeadsWorkspace }))
);
const B2BWorkspace = lazy(() =>
  import("../features/b2b/B2BWorkspace").then(m => ({ default: m.B2BWorkspace }))
);
const MessagesWorkspace = lazy(() =>
  import("../features/messages/MessagesWorkspace").then(m => ({ default: m.MessagesWorkspace }))
);
const EmailAutomationWorkspace = lazy(() =>
  import("../features/email/EmailAutomationWorkspace").then(m => ({ default: m.EmailAutomationWorkspace }))
);

const Loading = () => (
  <div style={{ minHeight: "100vh", display: "grid", placeItems: "center", background: "var(--bg-app)", color: "var(--text-muted)" }}>
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "10px" }}>
      <div style={{ width: "28px", height: "28px", border: "3px solid var(--border-subtle)", borderTopColor: "var(--accent-blue)", borderRadius: "50%", animation: "spin 0.7s linear infinite" }} />
      <span style={{ fontSize: "12px", fontWeight: 600 }}>Loading AECS Workspace…</span>
    </div>
  </div>
);

import { RoleRouteGuard } from "../features/auth/RoleRouteGuard";

export default function App() {
  return (
    <Suspense fallback={<Loading />}>
      <Routes>
        {/* Public & Login Routes */}
        <Route path="/login" element={<LoginArea />} />
        <Route path="/register" element={<PublicIntake />} />

        {/* Protected Staff Operational Workspace */}
        <Route element={<ProtectedArea />}>
          <Route element={<AppShell />}>
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="/dashboard" element={<ManagementDashboard />} />
            
            {/* Leads Workspace */}
            <Route
              path="/leads"
              element={
                <RoleRouteGuard permission="leads" workspaceName="Leads Management">
                  <LeadsWorkspace />
                </RoleRouteGuard>
              }
            />

            {/* Students Directory */}
            <Route
              path="/students"
              element={
                <RoleRouteGuard permission="students" workspaceName="Student Directory">
                  <StudentDirectory />
                </RoleRouteGuard>
              }
            />
            <Route
              path="/students/register"
              element={
                <RoleRouteGuard permission="students" workspaceName="Student Registration">
                  <RegistrationForm />
                </RoleRouteGuard>
              }
            />

            {/* Abroad Counselling */}
            <Route
              path="/counselling"
              element={
                <RoleRouteGuard permission="counselling" workspaceName="Abroad Counselling Hub">
                  <CounsellingDashboard />
                </RoleRouteGuard>
              }
            />

            {/* Applications & Visa */}
            <Route
              path="/applications"
              element={
                <RoleRouteGuard permission="applications" workspaceName="Visa Applications Workspace">
                  <ApplicationWorkspace />
                </RoleRouteGuard>
              }
            />

            {/* B2B Partners */}
            <Route
              path="/b2b"
              element={
                <RoleRouteGuard permission="b2b" workspaceName="B2B Partners Desk">
                  <B2BWorkspace />
                </RoleRouteGuard>
              }
            />
            <Route
              path="/b2b-partners"
              element={
                <RoleRouteGuard permission="b2b" workspaceName="B2B Partners Desk">
                  <B2BWorkspace />
                </RoleRouteGuard>
              }
            />

            {/* Documents Vault */}
            <Route
              path="/documents"
              element={
                <RoleRouteGuard permission="documents" workspaceName="Document Vault & Verification">
                  <DocumentDashboard />
                </RoleRouteGuard>
              }
            />

            {/* Classes & Batches */}
            <Route
              path="/classes"
              element={
                <RoleRouteGuard permission="classes" workspaceName="Classes & Test Preparation">
                  <ClassesWorkspace />
                </RoleRouteGuard>
              }
            />

            {/* Mock Tests */}
            <Route
              path="/mocks"
              element={
                <RoleRouteGuard permission="mocks" workspaceName="Mock Tests & Diagnostics">
                  <MockTestsWorkspace />
                </RoleRouteGuard>
              }
            />
            <Route
              path="/mock-tests"
              element={
                <RoleRouteGuard permission="mocks" workspaceName="Mock Tests & Diagnostics">
                  <MockTestsWorkspace />
                </RoleRouteGuard>
              }
            />

            {/* HRMS & Payroll */}
            <Route
              path="/hrms"
              element={
                <RoleRouteGuard permission="hrms" workspaceName="HRMS & Staff Management">
                  <HrmsWorkspace />
                </RoleRouteGuard>
              }
            />

            {/* Finance & Accounts */}
            <Route
              path="/finance"
              element={
                <RoleRouteGuard permission="finance" workspaceName="Finance & Accounting">
                  <FinanceWorkspace />
                </RoleRouteGuard>
              }
            />

            {/* Team Messages (All 18 Staff Can Chat Privately) */}
            <Route path="/messages" element={<MessagesWorkspace />} />

            {/* Email Automation & Drip Campaigns */}
            <Route path="/email-automation" element={<EmailAutomationWorkspace />} />

            {/* Reports & Analytics */}
            <Route
              path="/analytics"
              element={
                <RoleRouteGuard permission="reports" workspaceName="Analytics & Reports">
                  <AnalyticsDashboard />
                </RoleRouteGuard>
              }
            />

            {/* Administration Settings & RBAC */}
            <Route
              path="/settings"
              element={
                <RoleRouteGuard permission="settings" workspaceName="System Settings & Security">
                  <AdminDashboard />
                </RoleRouteGuard>
              }
            />

            {/* Catch-all fallback */}
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Route>
        </Route>
      </Routes>
    </Suspense>
  );
}
