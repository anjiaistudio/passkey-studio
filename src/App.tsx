import {
  HashRouter,
  Navigate,
  Routes,
  Route,
} from "react-router-dom";

import AdminLayout from "./layouts/AdminLayout";
import AboutPage from "./pages/AboutPage";
import AnalyticsPage, {
  AnalyticsAuthenticationTrendsPage,
  AnalyticsAuthenticatorsPage,
  AnalyticsOverviewPage,
  AnalyticsRegistrationTrendsPage,
  AnalyticsSecurityPage,
} from "./pages/AnalyticsPage";
import AuthenticationPage from "./pages/AuthenticationPage";
import RecentRegistrationsPage from "./pages/analytics/RecentRegistrationsPage";
import PlaygroundPage from "./pages/PlaygroundPage";
import PlaygroundRegistrationPage from "./pages/playground/PlaygroundRegistrationPage";
import PlaygroundInspectorPage from "./pages/playground/PlaygroundInspectorPage";
import PlaygroundInspectorDetailPage from "./pages/playground/PlaygroundInspectorDetailPage";
import PlaygroundCapabilitiesPage from "./pages/playground/PlaygroundCapabilitiesPage";
import UsersPage from "./pages/UsersPage";
import RegisterUserPage from "./pages/RegisterUserPage";
import UserDetailPage from "./pages/UserDetailPage";
import RegisterPasskeyPage from "./pages/RegisterPasskeyPage";
import ManagePasskeysPage from "./pages/ManagePasskeysPage";
import SettingsPage from "./pages/SettingsPage";
import UsernameLessAuthenticationPage
  from "./pages/UsernameLessAuthenticationPage";

import ConditionalAuthenticationPage
  from "./pages/ConditionalAuthenticationPage";
import PlaygroundAuthenticationPage from
  "./pages/playground/PlaygroundAuthenticationPage";  

export default function App() {

  return (
    <HashRouter>
      <Routes>
        <Route element={<AdminLayout />}>
          <Route index element={<Navigate to="/analytics/overview" replace />} />
          <Route path="about" element={<AboutPage />} />
          <Route path="users" element={<UsersPage />} />
          <Route path="users/register" element={<RegisterUserPage />} />
          <Route path="users/:id" element={<UserDetailPage />} />
          <Route path="register-passkey" element={<RegisterPasskeyPage />} />
          <Route path="manage-passkeys" element={<ManagePasskeysPage />} />
          <Route path="authentication" element={<AuthenticationPage />} />
          <Route path="authentication/username-less" element={<UsernameLessAuthenticationPage />} />
          <Route path="authentication/conditional" element={<ConditionalAuthenticationPage />} />
          <Route path="analytics" element={<AnalyticsPage />} />
          <Route path="analytics/overview" element={<AnalyticsOverviewPage />} />
          <Route path="analytics/recent-registrations" element={<RecentRegistrationsPage />} />
          <Route path="analytics/authenticators" element={<AnalyticsAuthenticatorsPage />} />
          <Route path="analytics/security" element={<AnalyticsSecurityPage />} />
          <Route path="analytics/registration-trends" element={<AnalyticsRegistrationTrendsPage />} />
          <Route path="analytics/authentication-trends" element={<AnalyticsAuthenticationTrendsPage />} />
          <Route path="analytics/device-types" element={<AnalyticsAuthenticatorsPage />} />
          <Route path="analytics/attachments" element={<AnalyticsAuthenticatorsPage />} />
          <Route path="analytics/transports" element={<AnalyticsAuthenticatorsPage />} />
          <Route path="analytics/policies" element={<AnalyticsSecurityPage />} />
          <Route path="analytics/backup" element={<AnalyticsSecurityPage />} />
          <Route path="analytics/credential-age" element={<AnalyticsSecurityPage />} />
          <Route path="analytics/registrations" element={<AnalyticsRegistrationTrendsPage />} />
          <Route path="analytics/registrations/daily" element={<AnalyticsRegistrationTrendsPage />} />
          <Route path="analytics/registrations/success-rate" element={<AnalyticsRegistrationTrendsPage />} />
          <Route path="analytics/authentications" element={<AnalyticsAuthenticationTrendsPage />} />
          <Route path="analytics/authentications/daily" element={<AnalyticsAuthenticationTrendsPage />} />
          <Route path="analytics/authentications/success-rate" element={<AnalyticsAuthenticationTrendsPage />} />
          <Route path="analytics/authentications/authenticators" element={<AnalyticsAuthenticationTrendsPage />} />
          <Route path="analytics/authentications/device-types" element={<AnalyticsAuthenticationTrendsPage />} />
          <Route path="analytics/authentications/users" element={<AnalyticsAuthenticationTrendsPage />} />
          <Route path="analytics/authentications/transports" element={<AnalyticsAuthenticationTrendsPage />} />
          <Route path="playground" element={<PlaygroundPage />} />
          <Route path={"playground/registration"} element={<PlaygroundRegistrationPage />} />
          <Route path={"playground/authentication"} element={<PlaygroundAuthenticationPage />} />
          <Route path="playground/credentials" element={<PlaygroundInspectorPage />} />
          <Route path="playground/credentials/:id" element={<PlaygroundInspectorDetailPage />} />
          <Route path="playground/capabilities" element={<PlaygroundCapabilitiesPage />} />
          <Route path="settings" element={<SettingsPage />} />
          <Route path="*" element={<Navigate to="/analytics/overview" replace />} />
        </Route>
      </Routes>
    </HashRouter>
  );
}