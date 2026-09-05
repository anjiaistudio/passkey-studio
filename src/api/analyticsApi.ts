import { api }
from "./axios";

export async function getDashboardSummary() {

  const response =
    await api.get(
      "/analytics/dashboard"
    );

  return response.data;
}

export async function getRecentRegistrations() {

  const response =
    await api.get(
      "/analytics/recent-registrations"
    );

  return response.data;
}

export async function getPasskeyDistribution() {

  const response =
    await api.get(
      "/analytics/distribution"
    );

  return response.data;
}

export const AnalyticsApi = {

  getOverview: () =>
    api.get("/analytics/overview"),

  getAuthenticators: () =>
    api.get("/analytics/authenticators"),

  getBackup: () =>
    api.get("/analytics/backup"),

  getDeviceTypes: () =>
    api.get("/analytics/device-types"),

  getAttachments: () =>
    api.get("/analytics/attachments"),

  getPolicies: () =>
    api.get("/analytics/policies"),

  getTransports: () =>
    api.get("/analytics/transports"),

  getCredentialAge: () =>
    api.get("/analytics/credential-age"),

  getRegistrationDaily: () =>
    api.get(
      "/analytics/registrations/daily"
    ),

  getRegistrationSuccessRate: () =>
    api.get(
      "/analytics/registrations/success-rate"
    ),

  getAuthenticationDaily: () =>
    api.get(
      "/analytics/authentications/daily"
    ),

  getAuthenticationSuccessRate: () =>
    api.get(
      "/analytics/authentications/success-rate"
    ),

  getAuthenticationAuthenticators:
    () =>
      api.get(
        "/analytics/authentications/authenticators"
      ),

  getAuthenticationDeviceTypes:
    () =>
      api.get(
        "/analytics/authentications/device-types"
      ),

  getAuthenticationTransports:
    () =>
      api.get(
        "/analytics/authentications/transports"
      ),

  getAuthenticationUsers:
    () =>
      api.get(
        "/analytics/authentications/users"
      ),
};
