import {
  useMemo,
  useState,
} from "react";

import {
  Box,
  Collapse,
  Divider,
  IconButton,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Tooltip,
} from "@mui/material";

import {
  HelpCenter,
  People,
  PersonAdd,
  Key,
  Lock,
  Analytics,
  Science, 
  Fingerprint,
  AutoAwesome,
  Badge,
  Devices,
  VerifiedUser,
  ChevronLeft,
  ChevronRight,
  ExpandLess,
  ExpandMore,
} from "@mui/icons-material";

import { NavLink, useLocation } from "react-router-dom";

interface NavLeaf {
  type: "link";
  text: string;
  icon: React.ReactNode;
  path: string;
}

interface NavGroup {
  type: "group";
  key: string;
  text: string;
  icon: React.ReactNode;
  children: NavLeaf[];
  defaultOpen: boolean;
}

type NavItem = NavLeaf | NavGroup;

const navItems: NavItem[] = [
  {
    type: "group",
    key: "analytics",
    text: "Executive Analytics",
    icon: <Analytics />,
    defaultOpen: true,
    children: [
      {
        type: "link",
        text: "Overview",
        icon: <Analytics />,
        path: "/analytics/overview",
      },
      {
        type: "link",
        text: "Recent Registrations",
        icon: <PersonAdd />,
        path: "/analytics/recent-registrations",
      },
      {
        type: "link",
        text: "Authenticators",
        icon: <Badge />,
        path: "/analytics/authenticators",
      },
      {
        type: "link",
        text: "Security",
        icon: <VerifiedUser />,
        path: "/analytics/security",
      },
      {
        type: "link",
        text: "Registration Trends",
        icon: <Key />,
        path: "/analytics/registration-trends",
      },
      {
        type: "link",
        text: "Authentication Trends",
        icon: <Fingerprint />,
        path: "/analytics/authentication-trends",
      },
    ],
  },
  {
    type: "group",
    key: "users",
    text: "Identity Directory",
    icon: <People />,
    defaultOpen: true,
    children: [
      {
        type: "link",
        text: "Users",
        icon: <People />,
        path: "/users",
      },
      {
        type: "link",
        text: "Create User",
        icon: <PersonAdd />,
        path: "/users/register",
      },
    ],
  },
  {
    type: "group",
    key: "passkeys",
    text: "Passkey Lifecycle",
    icon: <Key />,
    defaultOpen: true,
    children: [
      {
        type: "link",
        text: "Register Passkey",
        icon: <Key />,
        path: "/register-passkey",
      },
      {
        type: "link",
        text: "Manage Passkeys",
        icon: <Badge />,
        path: "/manage-passkeys",
      },
    ],
  },
  {
    type: "group",
    key: "authentication",
    text: "Sign-in Journeys",
    icon: <VerifiedUser />,
    defaultOpen: true,
    children: [
      {
        type: "link",
        text: "Username-first",
        icon: <Lock />,
        path: "/authentication",
      },
      {
        type: "link",
        text: "Username-less",
        icon: <Fingerprint />,
        path: "/authentication/username-less",
      },
      {
        type: "link",
        text: "Conditional UI",
        icon: <AutoAwesome />,
        path: "/authentication/conditional",
      },
    ],
  },
  {
    type: "group",
    key: "playground",
    text: "WebAuthn Lab",
    icon: <Science />,
    defaultOpen: false,
    children: [
      {
        type: "link",
        text: "Overview",
        icon: <Science />,
        path: "/playground",
      },
      {
        type: "link",
        text: "Registration",
        icon: <Key />,
        path: "/playground/registration",
      },
      {
        type: "link",
        text: "Authentication",
        icon: <Fingerprint />,
        path: "/playground/authentication",
      },
      {
        type: "link",
        text: "Inspector",
        icon: <Badge />,
        path: "/playground/credentials",
      },
      {
        type: "link",
        text: "Capabilities",
        icon: <Devices />,
        path: "/playground/capabilities",
      },
    ],
  },
  {
    type: "link",
    text: "How Passkeys Work",
    icon: <HelpCenter />,
    path: "/about",
  },
//   {
//     type: "link",
//     text: "Settings",
//     icon: <Settings />,
//     path: "/settings",
//   },
];

interface SidebarProps {
  collapsed?: boolean;
  onNavigate?: () => void;
  onExpandSidebar?: () => void;
  onToggleCollapsed?: () => void;
}

export default function Sidebar({
  collapsed = false,
  onNavigate,
  onExpandSidebar,
  onToggleCollapsed,
}: SidebarProps) {
  const location = useLocation();

  const initialOpenGroups = useMemo(() => {
    const state: Record<string, boolean> = {};

    navItems.forEach((item) => {
      if (item.type !== "group") {
        return;
      }

      const matchesCurrentPath =
        item.children.some((child) =>
          location.pathname === child.path
        );

      state[item.key] =
        item.defaultOpen || matchesCurrentPath;
    });

    return state;
    // Only computed once on mount; the user's
    // manual toggles take over after that.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const [openGroups, setOpenGroups] =
    useState(initialOpenGroups);

  function toggleGroup(key: string) {
    if (collapsed) {
      onExpandSidebar?.();

      setOpenGroups((current) => ({
        ...current,
        [key]: true,
      }));

      return;
    }

    setOpenGroups((current) => ({
      ...current,
      [key]: !current[key],
    }));
  }

  return (
    <Box>
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: collapsed
            ? "center"
            : "flex-end",
          minHeight: 56,
          px: collapsed ? 0 : 1,
        }}
      >
        <Tooltip
          title={
            collapsed
              ? "Expand navigation"
              : "Collapse navigation"
          }
          placement="right"
        >
          <IconButton
            onClick={onToggleCollapsed}
            aria-label={
              collapsed
                ? "Expand navigation"
                : "Collapse navigation"
            }
            size="small"
          >
            {collapsed ? (
              <ChevronRight />
            ) : (
              <ChevronLeft />
            )}
          </IconButton>
        </Tooltip>
      </Box>

      <Divider />

      <List>
      {navItems.map((item) => {
        if (item.type === "link") {
          const button = (
            <ListItemButton
              key={item.path}
              component={NavLink}
              to={item.path}
              onClick={onNavigate}
              sx={{
                justifyContent: collapsed
                  ? "center"
                  : "flex-start",
              }}
            >
              <ListItemIcon
                sx={{
                  minWidth: collapsed
                    ? 0
                    : undefined,
                  justifyContent: "center",
                }}
              >
                {item.icon}
              </ListItemIcon>

              {!collapsed && (
                <ListItemText
                  primary={item.text}
                />
              )}
            </ListItemButton>
          );

          return collapsed ? (
            <Tooltip
              key={item.path}
              title={item.text}
              placement="right"
            >
              {button}
            </Tooltip>
          ) : (
            button
          );
        }

        const isOpen =
          !collapsed && openGroups[item.key];

        const groupButton = (
          <ListItemButton
            key={item.key}
            onClick={() =>
              toggleGroup(item.key)
            }
            sx={{
              justifyContent: collapsed
                ? "center"
                : "flex-start",
            }}
          >
            <ListItemIcon
              sx={{
                minWidth: collapsed
                  ? 0
                  : undefined,
                justifyContent: "center",
              }}
            >
              {item.icon}
            </ListItemIcon>

            {!collapsed && (
              <>
                <ListItemText
                  primary={item.text}
                />

                {isOpen ? (
                  <ExpandLess />
                ) : (
                  <ExpandMore />
                )}
              </>
            )}
          </ListItemButton>
        );

        return (
          <div key={item.key}>
            {collapsed ? (
              <Tooltip
                title={item.text}
                placement="right"
              >
                {groupButton}
              </Tooltip>
            ) : (
              groupButton
            )}

            {!collapsed && (
              <Collapse
                in={isOpen}
                timeout="auto"
                unmountOnExit
              >
                <List
                  component="div"
                  disablePadding
                >
                  {item.children.map(
                    (child) => (
                      <ListItemButton
                        key={child.path}
                        component={NavLink}
                        to={child.path}
                        onClick={onNavigate}
                        sx={{ pl: 4 }}
                      >
                        <ListItemIcon>
                          {child.icon}
                        </ListItemIcon>

                        <ListItemText
                          primary={
                            child.text
                          }
                        />
                      </ListItemButton>
                    )
                  )}
                </List>
              </Collapse>
            )}
          </div>
        );
      })}
      </List>
    </Box>
  );
}
