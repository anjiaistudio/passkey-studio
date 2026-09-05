import {
  AppBar,
  Box,
  Breadcrumbs,
  IconButton,
  Toolbar,
  Tooltip,
  Typography,
} from "@mui/material";

import MenuIcon from "@mui/icons-material/Menu";
import DarkModeIcon from "@mui/icons-material/DarkMode";
import LightModeIcon from "@mui/icons-material/LightMode";

import { Link as RouterLink, useLocation } from "react-router-dom";

import {
  buildBreadcrumbs,
} from "../navigation/routes";

import { useThemeMode } from "../theme/ThemeModeProvider";

interface TopBarProps {
  onMenuClick: () => void;
  showMenuButton: boolean;
}

export default function TopBar({
  onMenuClick,
  showMenuButton,
}: TopBarProps) {
  const location = useLocation();
  const { mode, toggleMode } = useThemeMode();

  const breadcrumbs = buildBreadcrumbs(
    location.pathname
  );

  return (
    <AppBar
      position="sticky"
      elevation={0}
    >

      <Toolbar
        sx={{
          gap: 2,
          flexWrap: "wrap",
          py: 1,
        }}
      >

        {showMenuButton && (
          <IconButton
            color="inherit"
            edge="start"
            onClick={onMenuClick}
            aria-label="Open navigation"
          >
            <MenuIcon />
          </IconButton>
        )}

        <Typography
          variant="h6"
          sx={{ whiteSpace: "nowrap" }}
        >
          Passkey Studio
        </Typography>

        <Box sx={{ flexGrow: 1 }} />

        <Tooltip
          title={
            mode === "dark"
              ? "Switch to light mode"
              : "Switch to dark mode"
          }
        >
          <IconButton
            color="inherit"
            onClick={toggleMode}
          >
            {mode === "dark" ? (
              <LightModeIcon />
            ) : (
              <DarkModeIcon />
            )}
          </IconButton>
        </Tooltip>
      </Toolbar>

      <Toolbar
        variant="dense"
        sx={{
          minHeight: 40,
          borderTop: 1,
          borderColor: "rgba(255,255,255,0.12)",
        }}
      >
        <Breadcrumbs
          sx={{
            color: "inherit",
            "& .MuiBreadcrumbs-separator": {
              color: "inherit",
            },
          }}
        >
          {breadcrumbs.map((crumb, index) => {
            const isLast =
              index === breadcrumbs.length - 1;

            return isLast ? (
              <Typography
                key={crumb.path}
                color="inherit"
                variant="body2"
              >
                {crumb.label}
              </Typography>
            ) : (
              <Typography
                key={crumb.path}
                component={RouterLink}
                to={crumb.path}
                variant="body2"
                sx={{
                  color: "inherit",
                  textDecoration: "none",
                  opacity: 0.8,
                  "&:hover": {
                    textDecoration: "underline",
                  },
                }}
              >
                {crumb.label}
              </Typography>
            );
          })}
        </Breadcrumbs>
      </Toolbar>
    </AppBar>
  );
}

