import {
    Box,
    Drawer,
    useMediaQuery,
    useTheme,
} from "@mui/material";

import { Outlet } from "react-router-dom";

import { useEffect, useState } from "react";

import Sidebar from "../components/Sidebar";
import TopBar from "../components/TopBar";

const drawerWidthExpanded = 260;
const drawerWidthCollapsed = 72;

const SIDEBAR_COLLAPSED_KEY =
    "passkey-lab-sidebar-collapsed";

export default function AdminLayout() {
    const theme = useTheme();

    const isMobile = useMediaQuery(
        theme.breakpoints.down("md")
    );

    const [mobileOpen, setMobileOpen] =
        useState(false);

    const [collapsed, setCollapsed] =
        useState(() =>
            localStorage.getItem(
                SIDEBAR_COLLAPSED_KEY
            ) === "true"
        );

    useEffect(() => {
        localStorage.setItem(
            SIDEBAR_COLLAPSED_KEY,
            String(collapsed)
        );
    }, [collapsed]);

    function toggleSidebar() {
        if (isMobile) {
            setMobileOpen((open) => !open);
        } else {
            setCollapsed((value) => !value);
        }
    }

    const drawerWidth =
        !isMobile && collapsed
            ? drawerWidthCollapsed
            : drawerWidthExpanded;

    const sidebar = (
        <Sidebar
            collapsed={!isMobile && collapsed}
            onNavigate={() =>
                isMobile && setMobileOpen(false)
            }
            onExpandSidebar={() =>
                setCollapsed(false)
            }
            onToggleCollapsed={toggleSidebar}
        />
    );

    return (

        <Box
            sx={{
                display: "flex",
                height: "100vh",
            }}
        >

            <Drawer
                variant={
                    isMobile
                        ? "temporary"
                        : "permanent"
                }
                open={
                    isMobile
                        ? mobileOpen
                        : true
                }
                onClose={() =>
                    setMobileOpen(false)
                }
                ModalProps={{
                    keepMounted: true,
                }}
                sx={{
                    width: drawerWidth,
                    flexShrink: 0,

                    "& .MuiDrawer-paper": {
                        width: drawerWidth,
                        boxSizing:
                            "border-box",
                        transition:
                            theme.transitions.create(
                                "width"
                            ),
                        overflowX: "hidden",
                    },
                }}
            >

                {sidebar}

            </Drawer>

            <Box
                sx={{
                    flexGrow: 1,
                    minWidth: 0,
                    height: "100vh",
                    overflowY: "auto",
                }}
            >

                <TopBar
                    onMenuClick={toggleSidebar}
                    showMenuButton={isMobile}
                />

                <Box
                    sx={{
                        p: { xs: 2, sm: 3 },
                    }}
                >

                    <Outlet />

                </Box>

            </Box>

        </Box>

    );
}
