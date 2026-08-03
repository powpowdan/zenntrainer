import React from "react";
import {
  Button,
  Stack,
  Typography,
  AppBar,
  Toolbar,
  SpeedDial,
  SpeedDialAction,
  SpeedDialIcon,
} from "@mui/material";
import SaveIcon from "@mui/icons-material/Save";
import FolderOpenIcon from "@mui/icons-material/FolderOpen";
import LogoutIcon from "@mui/icons-material/Logout";
import MenuIcon from "@mui/icons-material/Menu";
import CloseIcon from "@mui/icons-material/Close";

export default function Header({
  onStart,
  onPause,
  onReset,
  onSave,
  onLoad,
  onRetry,
  onClear,
  isRunning,
  taskCount,
  totalDuration,
  canStart,
  persistenceStatus,
  persistenceError,
}) {
  const [open, setOpen] = React.useState(false);

  const handleToggle = () => {
    if (isRunning) {
      onPause();
    } else {
      onStart();
    }
  };

  const actions = [
    { icon: <SaveIcon />, name: "Save plan", onClick: onSave },
    { icon: <FolderOpenIcon />, name: "Load plan", onClick: onLoad },
    { icon: <LogoutIcon />, name: "Exit session", onClick: onClear, destructive: true },
  ];

  const totalMinutes = Math.round((totalDuration || 0) / 60);
  const statusLabel = {
    saved: "Saved",
    saving: "Saving...",
    unsaved: "Unsaved changes",
    error: "Save failed",
  }[persistenceStatus] || "Saved";

  return (
    <AppBar position="static" elevation={0}>
      <Toolbar
        sx={{
          width: "100%",
          maxWidth: 960,
          mx: "auto",
          py: 1,
          display: "flex",
          flexDirection: { xs: "column", sm: "row" },
          alignItems: { xs: "flex-start", sm: "center" },
          justifyContent: "space-between",
          gap: 1,
        }}
      >
        <div>
          <Typography
            variant="h6"
            sx={{
              fontSize: 18,
              fontWeight: 600,
              letterSpacing: 0.4,
            }}
          >
            Cadence
          </Typography>
          <Typography
            variant="body2"
            sx={{ color: "var(--text-muted)", fontSize: 12 }}
          >
            Build your class
          </Typography>
          <Typography
            variant="body2"
            sx={{
              color: "var(--text-secondary)",
              fontSize: 12,
              mt: 0.5,
              fontVariantNumeric: "tabular-nums",
            }}
          >
            {taskCount} {taskCount === 1 ? "block" : "blocks"} · {totalMinutes} min planned
          </Typography>
          <Typography
            variant="body2"
            role="status"
            sx={{
              color: persistenceStatus === "error"
                ? "var(--accent)"
                : persistenceStatus === "unsaved"
                  ? "var(--text-primary)"
                  : "var(--text-muted)",
              fontSize: 12,
              mt: 0.5,
            }}
          >
            {statusLabel}
            {persistenceError ? `: ${persistenceError}` : ""}
            {persistenceStatus === "error" ? (
              <Button
                onClick={onRetry}
                size="small"
                sx={{
                  minWidth: 0,
                  ml: 1,
                  p: 0,
                  color: "var(--accent)",
                  textTransform: "none",
                  textDecoration: "underline",
                }}
              >
                Retry
              </Button>
            ) : null}
          </Typography>
        </div>

        <Stack
          direction="row"
          spacing={1}
          alignItems="center"
          flexWrap="wrap"
          width="100%"
          justifyContent={{ xs: "flex-start", sm: "flex-end" }}
        >
          <Button
            variant="contained"
            onClick={handleToggle}
            disabled={!isRunning && !canStart}
            sx={{
              borderRadius: "var(--radius-pill)",
              px: 2.5,
              py: 0.75,
              fontSize: 14,
              ...(isRunning
                ? {
                    backgroundColor: "var(--accent)",
                    color: "var(--on-accent)",
                    "&:hover": { backgroundColor: "var(--accent-hover)" },
                  }
                : {
                    backgroundColor: "var(--text-primary)",
                    color: "var(--app)",
                    "&:hover": {
                      backgroundColor: "var(--text-primary)",
                      opacity: 0.88,
                    },
                  }),
            }}
          >
            {isRunning ? "Pause" : "Start"}
          </Button>

          <Button
            variant="outlined"
            onClick={onReset}
            sx={{
              borderRadius: "var(--radius-pill)",
              fontSize: 13,
              borderColor: "var(--border-subtle)",
              color: "var(--text-secondary)",
              "&:hover": {
                borderColor: "var(--accent)",
                backgroundColor: "var(--surface)",
              },
            }}
          >
            Reset
          </Button>

          <SpeedDial
            ariaLabel="Planner actions"
            icon={
              <SpeedDialIcon
                icon={<MenuIcon />}
                openIcon={<CloseIcon />}
              />
            }
            direction="left"
            open={open}
            onOpen={() => setOpen(true)}
            onClose={() => setOpen(false)}
            FabProps={{
              size: "small",
              sx: { ml: 0.5 },
            }}
          >
            {actions.map((action) => (
              <SpeedDialAction
                key={action.name}
                icon={action.icon}
                aria-label={action.name}
                FabProps={{
                  size: "small",
                  sx: {
                    backgroundColor: "var(--surface)",
                    color: action.destructive
                      ? "var(--accent)"
                      : "var(--text-secondary)",
                    border: "1px solid var(--border-subtle)",
                    "&:hover": {
                      backgroundColor: "var(--elevated)",
                      borderColor: action.destructive
                        ? "var(--accent)"
                        : "var(--border-subtle)",
                    },
                  },
                }}
                onClick={() => {
                  if (
                    action.destructive &&
                    !window.confirm("Exit the current planner session?")
                  ) {
                    return;
                  }
                  action.onClick();
                  setOpen(false);
                }}
              />
            ))}
          </SpeedDial>
        </Stack>
      </Toolbar>
    </AppBar>
  );
}
