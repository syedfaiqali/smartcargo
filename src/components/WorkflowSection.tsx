import { ReactNode } from "react";
import Box from "@mui/material/Box";
import Collapse from "@mui/material/Collapse";
import IconButton from "@mui/material/IconButton";
import Typography from "@mui/material/Typography";
import AddIcon from "@mui/icons-material/Add";
import RemoveIcon from "@mui/icons-material/Remove";
import { themeColors } from "../theme/themeColors";

export function WorkflowSection({
  title,
  subtitle,
  open,
  onToggle,
  children,
}: {
  title: string;
  subtitle: string;
  open: boolean;
  onToggle: () => void;
  children: ReactNode;
}) {
  return (
    <Box sx={{ bgcolor: themeColors.surface, mb: 2 }}>
      <Box
        role="button"
        tabIndex={0}
        aria-expanded={open}
        onClick={onToggle}
        onKeyDown={(event) => {
          if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            onToggle();
          }
        }}
        sx={{
          display: "flex",
          alignItems: "center",
          gap: 1.25,
          px: 1.25,
          py: 1.5,
          cursor: "pointer",
          borderBottom: open
            ? `1px solid ${themeColors.border}`
            : "1px solid transparent",
          "&:hover": { bgcolor: `${themeColors.secondary}08` },
        }}
      >
        <Box
          sx={{
            width: 4,
            alignSelf: "stretch",
            minHeight: 23,
            borderRadius: 2,
            bgcolor: themeColors.sidebarSelectedBg,
          }}
        />
        <Box sx={{ flexGrow: 1 }}>
          <Typography sx={{ fontWeight: 750, color: themeColors.textPrimary }}>
            {title}
          </Typography>
          {subtitle && (
            <Typography
              variant="caption"
              sx={{ color: themeColors.textSecondary }}
            >
              {subtitle}
            </Typography>
          )}
        </Box>
        <IconButton
          size="small"
          tabIndex={-1}
          aria-hidden="true"
          sx={{
            width: 22,
            height: 22,
            border: `1px solid ${themeColors.border}`,
            borderRadius: "5px",
            color: open ? "#fff" : themeColors.sidebarAvatarBg,
            bgcolor: open ? themeColors.sidebarSelectedBg : "transparent",
            "&:hover": {
              bgcolor: open
                ? themeColors.secondaryDark
                : `${themeColors.secondary}12`,
            },
          }}
        >
          {open ? (
            <RemoveIcon sx={{ fontSize: 16 }} />
          ) : (
            <AddIcon sx={{ fontSize: 16 }} />
          )}
        </IconButton>
      </Box>
      <Collapse in={open} timeout="auto">
        <Box sx={{ px: { xs: 1.5, md: 2.5 }, pt: 2, pb: 1 }}>{children}</Box>
      </Collapse>
    </Box>
  );
}
