export interface AppRoute {
  path: string;

  label: string;

  keywords?: string;
}

// Static routes, ordered as they appear in the app.
// Dynamic segments (":id") are matched via matchStaticRoute below.
export const appRoutes: AppRoute[] = [
  { path: "/about", label: "How It Works" },
  { path: "/users", label: "Users" },
  {
    path: "/users/register",
    label: "Register User",
  },
  {
    path: "/register-passkey",
    label: "Register Passkey",
  },
  {
    path: "/manage-passkeys",
    label: "Manage Passkeys",
  },
  {
    path: "/authentication",
    label: "Username-first Login",
  },
  {
    path: "/authentication/username-less",
    label: "Username-less Login",
  },
  {
    path: "/authentication/conditional",
    label: "Conditional UI",
  },
  { path: "/analytics", label: "Analytics" },
  { path: "/analytics/overview", label: "Analytics Overview" },
  {
    path: "/analytics/recent-registrations",
    label: "Recent Registrations",
  },
  { path: "/analytics/authenticators", label: "Authenticators" },
  { path: "/analytics/security", label: "Security" },
  {
    path: "/analytics/registration-trends",
    label: "Registration Trends",
  },
  {
    path: "/analytics/authentication-trends",
    label: "Authentication Trends",
  },
  { path: "/analytics/device-types", label: "Device Types" },
  { path: "/analytics/attachments", label: "Attachments" },
  { path: "/analytics/transports", label: "Transports" },
  { path: "/analytics/policies", label: "Security Policies" },
  { path: "/analytics/backup", label: "Backup Readiness" },
  { path: "/analytics/credential-age", label: "Credential Age" },
  { path: "/analytics/registrations", label: "Registration Trends" },
  { path: "/analytics/registrations/daily", label: "Daily Registrations" },
  {
    path: "/analytics/registrations/success-rate",
    label: "Registration Success Rate",
  },
  { path: "/analytics/authentications", label: "Authentication Trends" },
  {
    path: "/analytics/authentications/daily",
    label: "Daily Authentications",
  },
  {
    path: "/analytics/authentications/success-rate",
    label: "Authentication Success Rate",
  },
  {
    path: "/analytics/authentications/authenticators",
    label: "Authentication Authenticators",
  },
  {
    path: "/analytics/authentications/device-types",
    label: "Authentication Device Types",
  },
  {
    path: "/analytics/authentications/users",
    label: "Authentication Users",
  },
  {
    path: "/analytics/authentications/transports",
    label: "Authentication Transports",
  },
  { path: "/playground", label: "Playground" },
  {
    path: "/playground/registration",
    label: "Playground Registration",
  },
  {
    path: "/playground/authentication",
    label: "Playground Authentication",
  },
  {
    path: "/playground/credentials",
    label: "Credential Inspector",
  },
  {
    path: "/playground/capabilities",
    label: "Browser Capabilities",
  },
  { path: "/settings", label: "Settings" },
];

// Dynamic route labels, keyed by the static prefix before the id segment.
const dynamicRouteLabels: {
  prefix: string;
  label: string;
}[] = [
  { prefix: "/users/", label: "User Details" },
  {
    prefix: "/playground/credentials/",
    label: "Credential Details",
  },
];

export function getRouteLabel(
  pathname: string
): string {
  const exactMatch = appRoutes.find(
    (route) => route.path === pathname
  );

  if (exactMatch) {
    return exactMatch.label;
  }

  const dynamicMatch = dynamicRouteLabels.find(
    (route) => pathname.startsWith(route.prefix)
  );

  return dynamicMatch?.label ?? pathname;
}

export interface Breadcrumb {
  label: string;

  path: string;
}

export function buildBreadcrumbs(
  pathname: string
): Breadcrumb[] {
  if (pathname === "/") {
    return [
      {
        label: "Analytics Overview",
        path: "/analytics/overview",
      },
    ];
  }

  const segments = pathname
    .split("/")
    .filter(Boolean);

  const crumbs: Breadcrumb[] = [
    {
      label: "Analytics Overview",
      path: "/analytics/overview",
    },
  ];

  let currentPath = "";

  segments.forEach((segment) => {
    currentPath += `/${segment}`;

    crumbs.push({
      label: getRouteLabel(currentPath),
      path: currentPath,
    });
  });

  return crumbs;
}
