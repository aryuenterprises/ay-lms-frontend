import { useLayoutEffect, useState } from "react";

// material-ui
import { useTheme } from "@mui/material/styles";
import { Box, Typography, useMediaQuery } from "@mui/material";

// project-imports
import NavGroup from "./NavGroup";
import menuItem from "menu-items";
// import { Menu } from 'menu-items/home';

import { useSelector } from "store";
import useConfig from "hooks/useConfig";
import { HORIZONTAL_MAX_ITEM } from "config";
import { MenuOrientation } from "config";

// ==============================|| DRAWER CONTENT - NAVIGATION ||============================== //

const Navigation = () => {
  const theme = useTheme();

  const downLG = useMediaQuery(theme.breakpoints.down("lg"));

  const { menuOrientation } = useConfig();
  const { drawerOpen } = useSelector((state) => state.menu);

  const [selectedItems, setSelectedItems] = useState("");
  const [selectedLevel, setSelectedLevel] = useState(0);
  const [menuItems, setMenuItems] = useState({ items: [] });

  useLayoutEffect(() => {
    const filteredItems = {
      items: (menuItem.items || []).filter((item) => item != null),
    };
    setMenuItems(filteredItems);
    // eslint-disable-next-line
  }, [menuItem]);

  const isHorizontal =
    menuOrientation === MenuOrientation.HORIZONTAL && !downLG;

  const lastItem = isHorizontal ? HORIZONTAL_MAX_ITEM : null;
  let lastItemIndex = menuItems.items.length - 1;
  let remItems = [];
  let lastItemId;

  if (lastItem && lastItem < menuItems.items.length) {
    lastItemId = menuItems.items[lastItem - 1].id;
    lastItemIndex = lastItem - 1;
    remItems = menuItems.items
      .slice(lastItem - 1, menuItems.items.length)
      .map((item) => ({
        title: item.title,
        elements: item.children,
        icon: item.icon,
      }));
  }

  const navGroups = menuItems.items.slice(0, lastItemIndex + 1).map((item) => {
    switch (item.type) {
      case "group":
        return (
          <NavGroup
            key={item.id}
            setSelectedItems={setSelectedItems}
            setSelectedLevel={setSelectedLevel}
            selectedLevel={selectedLevel}
            selectedItems={selectedItems}
            lastItem={lastItem}
            remItems={remItems}
            lastItemId={lastItemId}
            item={item}
          />
        );
      default:
        return (
          <Typography key={item.id} variant="h6" color="error" align="center">
            Fix - Navigation Group
          </Typography>
        );
    }
  });
  return (
    <Box
      sx={{
        position: "relative",
        overflow: "hidden",
        pt: drawerOpen ? (isHorizontal ? 1.5 : 2) : 0,
        px: isHorizontal ? 3 : 2,
        py: isHorizontal ? 2 : 1.5,
        borderRadius: isHorizontal ? 4 : 0,
        display: isHorizontal ? { xs: "block", lg: "flex" } : "block",
        alignItems: "center",
        gap: 2,

        // === Premium layered background ===
        background: isHorizontal
          ? `
        linear-gradient(135deg, #ffffff 0%, #fff5f5 40%, #ffffff 100%),
        radial-gradient(circle at 20% 30%, rgba(193,18,31,0.08), transparent 40%),
        radial-gradient(circle at 80% 70%, rgba(122,22,40,0.06), transparent 50%)
      `
          : "transparent",

        border: isHorizontal ? "1px solid rgba(193,18,31,0.18)" : "none",

        boxShadow: isHorizontal
          ? `
        0 20px 50px rgba(15,23,42,0.08),
        inset 0 1px 0 rgba(255,255,255,0.6)
      `
          : "none",

        backdropFilter: isHorizontal ? "blur(14px)" : "none",

        transition: "all 0.4s ease",

        "& > ul:first-of-type": { mt: 0 },

        // === TOP ACCENT STRIP ===
        "&::before": isHorizontal
          ? {
              content: '""',
              position: "absolute",
              top: 0,
              left: 0,
              width: "100%",
              height: 5,
              background:
                "linear-gradient(90deg, #7a1628, #c1121f, #fb7185, #7a1628)",
              backgroundSize: "200% 100%",
              animation: "gradientMove 6s linear infinite",
            }
          : {},

        // === Soft glow overlay ===
        "&::after": isHorizontal
          ? {
              content: '""',
              position: "absolute",
              top: -40,
              right: -40,
              width: 180,
              height: 180,
              background: "rgba(193,18,31,0.08)",
              borderRadius: "50%",
              filter: "blur(50px)",
            }
          : {},
      }}>
      {navGroups}

      {/* Animation Keyframes */}
      <style>
        {`
      @keyframes gradientMove {
        0% { background-position: 0% 50%; }
        100% { background-position: 200% 50%; }
      }
    `}
      </style>
    </Box>
  );
};

export default Navigation;
